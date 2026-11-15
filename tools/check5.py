# 화면 점검 5판 시험 — 덱 여러 개(목업 264 · 시험 덱 · 회차 덱)를 엔진으로 묶어 ?check 를 돌리고 항목별 수를 셈
# 실행: python -X utf8 tools/check5.py <deck.json 또는 별칭 mock · demo> ... [--out <폴더>] [--keep]
import argparse, json, sys, time
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "skill" / "ecom-slide" / "scripts"))
import ecs  # noqa: E402

ALIAS = {"mock": ROOT / "library" / "mockups" / "deck.json"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("decks", nargs="+")
    ap.add_argument("--out", default=str(ROOT / "style" / "_check5"))
    ap.add_argument("--nofont", action="store_true")
    ap.add_argument("--shots", default="", help="1,5,9 — 그 장 캡처(?still)")
    a = ap.parse_args()
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    br = ecs.browser()
    if not br:
        sys.exit("브라우저 없음")
    total = {}
    for d in a.decks:
        p = ALIAS.get(d, Path(d))
        deck = json.loads(p.read_text(encoding="utf-8"))
        name = d if d in ALIAS else p.parent.name + "_" + p.stem
        page = out / f"{name}.html"
        page.write_text(ecs.page_html(deck, ROOT, nofont=a.nofont), encoding="utf-8")
        t0 = time.time()
        sc = ecs.screen_check(br, page)
        if not sc:
            print(name, "점검 결과 없음")
            continue
        iss = ecs.screen_issues3(sc)
        (out / f"{name}.json").write_text(json.dumps({"screen": sc, "issues": iss}, ensure_ascii=False, indent=1), encoding="utf-8")
        c = Counter(x["item"] for x in iss)
        total[name] = dict(c)
        for n in [int(x) for x in a.shots.split(",") if x]:
            ecs.run_browser(br, page.resolve().as_uri() + f"?still#{n}", ["--window-size=1280,720", f"--screenshot={out / f'{name}_{n:02d}.png'}"], 60)
        print(f"{name}: 장 {len(sc['slides'])} · {time.time() - t0:.0f}초 · " + " · ".join(f"{k} {v}" for k, v in c.most_common()))
    (out / "_summary.json").write_text(json.dumps(total, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
