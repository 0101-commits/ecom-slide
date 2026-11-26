# 6판 규격 측정 모음 — check5.py 가 남긴 style/_check5/<덱>.json 의 장별 글자 크기 · 선 굵기 · 모서리 분포를 합쳐 셈
# 실행: python -X utf8 tools/spec6.py <check5 결과 json> ... [--save 요약.json]
import argparse, json
from collections import Counter
from pathlib import Path

FS6 = {13, 16, 18, 20, 26, 36, 52}
SW6 = {1.5, 3, 5, 8}
RX6 = {2, 6}


def agg(paths):
    fz, wz, rz, iss = Counter(), Counter(), Counter(), Counter()
    n, hero2, big = 0, [], 0
    for p in paths:
        d = json.loads(Path(p).read_text(encoding="utf-8"))
        for s in d["screen"].get("slides", []):
            n += 1
            f = {float(k): v for k, v in (s.get("fsz") or {}).items()}
            fz.update(f)
            wz.update({float(k): v for k, v in (s.get("swz") or {}).items()})
            rz.update({float(k): v for k, v in (s.get("rxz") or {}).items()})
            h = sum(v for k, v in f.items() if k >= 48)
            if h >= 2:
                hero2.append(f'{Path(p).stem}:{s.get("i")}')
            if any(k >= 28 for k in f):
                big += 1
        iss.update(x["item"] for x in d.get("issues", []))
    tot = sum(fz.values()) or 1
    off = sum(v for k, v in fz.items() if k not in FS6)
    return {
        "장": n,
        "글자 크기 가짓수": len(fz),
        "규격 밖 글자 비율%": round(off / tot * 100, 1),
        "글자 크기 분포": {str(k): v for k, v in sorted(fz.items())},
        "선 굵기 가짓수": len(wz),
        "선 굵기 규격 밖": sum(v for k, v in wz.items() if k not in SW6 and k <= 8.5),
        "선 굵기 분포": {str(k): v for k, v in sorted(wz.items())},
        "모서리 분포": {str(k): v for k, v in sorted(rz.items())},
        "28px 이상 글을 둔 장": big,
        "48px 이상이 2곳 이상인 장": len(hero2),
        "48px 이상 2곳 이상 장 목록": hero2[:40],
        "점검 항목별 건수": dict(iss.most_common()),
    }


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="+")
    ap.add_argument("--save", default="")
    a = ap.parse_args()
    r = agg(a.files)
    if a.save:
        Path(a.save).write_text(json.dumps(r, ensure_ascii=False, indent=1), encoding="utf-8")
    for k in ("장", "글자 크기 가짓수", "규격 밖 글자 비율%", "선 굵기 가짓수", "선 굵기 규격 밖", "28px 이상 글을 둔 장", "48px 이상이 2곳 이상인 장"):
        print(k, r[k])
    print("점검", r["점검 항목별 건수"])
