# 열쇠 없이 받는 데이터 스냅샷 — ECOS 공개 시험 열쇠(호출당 10행) + FRED 열쇠 없는 CSV
# 실행: python -X utf8 tools/fetch_snapshot.py  → data/snap/*.json
import csv, io, json, subprocess, time, urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "snap"
OUT.mkdir(parents=True, exist_ok=True)
GOT = datetime.now().strftime("%Y.%m.%d %H:%M")
calls = 0
failed = {}


def http(url):
    for i in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "ecom-slide"}), timeout=40) as r:
                return r.read().decode("utf-8")
        except Exception as e:
            last = e
            time.sleep(2 * (i + 1))
    raise last


def ecos_windows(stat, cyc, item, start_y, start_m, last_y):
    """10기간씩 끊어 받음. 빈 창이 나오면 멈춤."""
    global calls
    rows = []
    if cyc == "M":
        y, m = start_y, start_m
        while y <= last_y:
            ey, em = y, m + 9
            if em > 12:
                ey, em = y + 1, em - 12
            url = f"https://ecos.bok.or.kr/api/StatisticSearch/sample/json/kr/1/10/{stat}/M/{y}{m:02d}/{ey}{em:02d}/{item}"
            calls += 1
            j = json.loads(http(url))
            got = (j.get("StatisticSearch") or {}).get("row") or []
            for r in got:
                t = r["TIME"]
                try:
                    rows.append([f"{t[:4]}.{t[4:6]}", float(r["DATA_VALUE"])])
                except (TypeError, ValueError):
                    pass
            if len(got) < 10:
                break
            m += 10
            if m > 12:
                y, m = y + 1, m - 12
    else:  # Q
        qi = start_y * 4
        while qi // 4 <= last_y:
            s, e = qi, qi + 9
            f = lambda k: f"{k // 4}Q{k % 4 + 1}"
            url = f"https://ecos.bok.or.kr/api/StatisticSearch/sample/json/kr/1/10/{stat}/Q/{f(s)}/{f(e)}/{item}"
            calls += 1
            j = json.loads(http(url))
            got = (j.get("StatisticSearch") or {}).get("row") or []
            for r in got:
                t = r["TIME"]
                try:
                    rows.append([f"{t[:4]}.Q{t[-1]}", float(r["DATA_VALUE"])])
                except (TypeError, ValueError):
                    pass
            if len(got) < 10:
                break
            qi += 10
    return rows


def save(fid, name, unit, source, data):
    data = [[p, round(v, 4)] for p, v in data]
    (OUT / f"{fid}.json").write_text(
        json.dumps({"id": fid, "name": name, "unit": unit, "source": source, "got": GOT, "data": data}, ensure_ascii=False, indent=0),
        encoding="utf-8")
    print(f"{fid}: {len(data)}점 {data[0][0]}~{data[-1][0]}")


def yoy(data):
    d = dict(data)
    out = []
    for p, v in data:
        y, m = p.split(".")
        q = f"{int(y) - 1}.{m}"
        if q in d and d[q]:
            out.append([p, (v / d[q] - 1) * 100])
    return out


# ---- ECOS ----
ECOS = [
    ("ecos_ca", "경상수지", "301Y013", "000000"), ("ecos_goods", "상품수지", "301Y013", "100000"),
    ("ecos_serv", "서비스수지", "301Y013", "200000"), ("ecos_pinc", "본원소득수지", "301Y013", "300000"),
    ("ecos_sinc", "이전소득수지", "301Y013", "400000"),
]
for fid, name, stat, item in ECOS:
    try:
        rows = ecos_windows(stat, "M", item, 2021, 1, 2027)
        if not rows:
            raise ValueError("빈 결과")
        save(fid, name, "백만 달러", f"한국은행 ECOS {stat}", rows)
    except Exception as e:
        failed[fid] = str(e)
try:
    rows = ecos_windows("722Y001", "M", "0101000", 2021, 1, 2027)
    save("ecos_rate", "한국 기준금리", "%", "한국은행 ECOS 722Y001", rows)
except Exception as e:
    failed["ecos_rate"] = str(e)
try:
    rows = ecos_windows("901Y009", "M", "0", 2020, 1, 2027)
    save("ecos_cpi_idx", "한국 소비자물가지수", "2020=100", "통계청 · ECOS 901Y009", [r for r in rows if r[0] >= "2021.01"])
    save("ecos_cpi_yoy", "한국 소비자물가 상승률", "% (전년동월비)", "통계청 · ECOS 901Y009", [r for r in yoy(rows) if r[0] >= "2021.01"])
except Exception as e:
    failed["ecos_cpi"] = str(e)
try:
    rows = ecos_windows("200Y102", "Q", "10111", 2021, 0, 2027)
    if not rows:
        raise ValueError("빈 결과")
    save("ecos_gdp_qoq", "한국 실질 GDP 성장률(전기비)", "%", "한국은행 ECOS 200Y102", rows)
except Exception as e:
    failed["ecos_gdp_qoq"] = str(e)

# ---- FRED (열쇠 없는 CSV) ----
def fred(fid):
    # urllib 은 FRED 에서 자주 멈춰 curl 로 받음
    txt = subprocess.run(["curl", "-s", "-m", "60", "--retry", "2", f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={fid}"],
                         capture_output=True, check=True).stdout.decode("utf-8")
    rows = list(csv.reader(io.StringIO(txt)))[1:]
    out = []
    for d, v in rows:
        if v in ("", "."):
            continue
        out.append((d[:7].replace("-", "."), float(v)))
    return out


def monthly_avg(rows):
    acc = {}
    for p, v in rows:
        acc.setdefault(p, []).append(v)
    cur = datetime.now().strftime("%Y.%m")  # 진행 중인 달은 일부만 있어 뺌
    return [[p, sum(v) / len(v)] for p, v in sorted(acc.items()) if p != cur]


def since(rows, p="2021.01"):
    return [r for r in rows if r[0] >= p]


FRED = {}
for fid in ["UNRATE", "CPIAUCSL", "FEDFUNDS", "DGS10", "DGS2", "PAYEMS", "INDPRO", "DEXKOUS"]:
    try:
        FRED[fid] = fred(fid)
    except Exception as e:
        failed[fid] = str(e)
S = "연준 세인트루이스 FRED "
if "UNRATE" in FRED: save("fred_unrate", "미국 실업률", "%", S + "UNRATE", since(FRED["UNRATE"]))
if "CPIAUCSL" in FRED: save("fred_cpi_yoy", "미국 소비자물가 상승률", "% (전년동월비)", S + "CPIAUCSL", since(yoy(FRED["CPIAUCSL"])))
if "FEDFUNDS" in FRED: save("fred_fedfunds", "미국 연방기금금리", "%", S + "FEDFUNDS", since(FRED["FEDFUNDS"]))
if "DGS10" in FRED: save("fred_dgs10", "미국 국채 10년물 금리", "% (월평균)", S + "DGS10", since(monthly_avg(FRED["DGS10"])))
if "DGS2" in FRED: save("fred_dgs2", "미국 국채 2년물 금리", "% (월평균)", S + "DGS2", since(monthly_avg(FRED["DGS2"])))
if "PAYEMS" in FRED:
    p = FRED["PAYEMS"]
    save("fred_payems_chg", "미국 비농업 고용 증감", "천 명", S + "PAYEMS", since([[p[i][0], p[i][1] - p[i - 1][1]] for i in range(1, len(p))]))
if "INDPRO" in FRED: save("fred_indpro", "미국 산업생산지수", "2017=100", S + "INDPRO", since(FRED["INDPRO"]))
if "DEXKOUS" in FRED: save("fred_dexkous", "원/달러 환율", "원 (월평균)", S + "DEXKOUS", since(monthly_avg(FRED["DEXKOUS"])))

(OUT / "_failed.json").write_text(json.dumps({"ecos_calls": calls, "failed": failed}, ensure_ascii=False, indent=1), encoding="utf-8")
print("ECOS 호출", calls, "실패", failed)
