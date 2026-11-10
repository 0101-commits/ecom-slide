# 공개 수치 파일 만들기 — data/series_ids.json 의 계열을 ECOS · FRED 에서 받아 data/series.json 으로
# 열쇠: 환경 변수 ECOS_API_KEY · FRED_API_KEY (GitHub 비밀값). 열쇠가 없는 쪽은 건너뛰고 그 계열은 failed 에 적음.
# 실행: python tools/fetch_series.py [--out data/series.json]
import argparse, json, os, sys, time, urllib.parse, urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def get(url, tries=3):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "ecom-slide"}), timeout=30) as r:
                return json.loads(r.read().decode("utf-8"))
        except Exception as e:  # 잠깐 끊김만 다시
            last = e
            time.sleep(2 * (i + 1))
    raise last


def ecos(key, sid, start):
    _, stat, item, cyc = sid.split(":")
    s = start.replace("-", "") if cyc == "M" else (start[:4] + "Q1" if cyc == "Q" else start[:4])
    e = date.today().strftime("%Y%m") if cyc == "M" else (str(date.today().year) + "Q4" if cyc == "Q" else str(date.today().year))
    items = "/".join(urllib.parse.quote(x, safe="*") for x in item.split("/"))
    url = f"https://ecos.bok.or.kr/api/StatisticSearch/{key}/json/kr/1/10000/{stat}/{cyc}/{s}/{e}/{items}"
    j = get(url)
    rows = (j.get("StatisticSearch") or {}).get("row") or []
    if not rows:
        raise ValueError((j.get("RESULT") or {}).get("MESSAGE", "빈 결과"))
    out, unit = [], rows[0].get("UNIT_NAME", "")
    for r in rows:
        t = r["TIME"]
        p = f"{t[:4]}.{t[4:6]}" if cyc == "M" else (f"{t[:4]}.Q{t[-1]}" if cyc == "Q" else t[:4])
        try:
            out.append([p, float(r["DATA_VALUE"])])
        except (TypeError, ValueError):
            continue
    return out, unit


def fred(key, sid, start, monthly):
    code = sid.split(":", 1)[1]
    q = {"series_id": code, "api_key": key, "file_type": "json", "observation_start": start + "-01"}
    if monthly:
        q.update({"frequency": "m", "aggregation_method": "avg"})
    j = get("https://api.stlouisfed.org/fred/series/observations?" + urllib.parse.urlencode(q))
    out = []
    for o in j.get("observations", []):
        if o["value"] in (".", ""):
            continue
        d = o["date"]
        m = int(d[5:7])
        p = f"{d[:4]}.{d[5:7]}"
        if code.endswith("Q225SBEA") or code in ("GDPC1",):
            p = f"{d[:4]}.Q{(m - 1) // 3 + 1}"
        out.append([p, float(o["value"])])
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(ROOT / "data" / "series.json"))
    a = ap.parse_args()
    cfg = json.load(open(ROOT / "data" / "series_ids.json", encoding="utf-8"))
    ek, fk = os.environ.get("ECOS_API_KEY", "").strip(), os.environ.get("FRED_API_KEY", "").strip()
    old = {}
    if Path(a.out).exists():
        old = json.load(open(a.out, encoding="utf-8")).get("series", {})
    res, failed = {}, {}
    for s in cfg["series"]:
        sid = s["id"]
        try:
            if sid.startswith("ecos:"):
                if not ek:
                    raise RuntimeError("ECOS_API_KEY 없음")
                data, unit = ecos(ek, sid, cfg["start"])
            else:
                if not fk:
                    raise RuntimeError("FRED_API_KEY 없음")
                data, unit = fred(fk, sid, cfg["start"], s.get("monthly", False)), s.get("unit", "")
            res[sid] = {"name": s["name"], "unit": s.get("unit") or unit, "source": "한국은행 ECOS" if sid.startswith("ecos:") else "FRED(세인트루이스 연준)", "data": data}
        except Exception as e:
            failed[sid] = str(e)[:160]
            if sid in old:  # 받기 실패면 지난 값 유지
                res[sid] = old[sid]
    json.dump({"updated": date.today().isoformat(), "series": res, "failed": failed},
              open(a.out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"계열 {len(res)} · 실패 {len(failed)}")
    for k, v in failed.items():
        print("  실패", k, v)


if __name__ == "__main__":
    main()
