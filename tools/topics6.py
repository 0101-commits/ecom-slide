# 6판 새 주제 시험 점검 — tests/topics6/T*.json 을 화면 점검(check5) + 글 점검(lint3)으로 돌려 덱마다 「새 코드 필요」 장과 「고칠 것」을 셈
# 실행: python -X utf8 tools/topics6.py [--shots]
import argparse, json, subprocess, sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "skill" / "ecom-slide" / "scripts"))
import ecs  # noqa: E402

ap = argparse.ArgumentParser()
ap.add_argument("--shots", action="store_true")
a = ap.parse_args()
out = ROOT / "style" / "_topics6"
rows = []
for f in sorted((ROOT / "tests" / "topics6").glob("T*.json")):
    d = json.loads(f.read_text(encoding="utf-8"))
    n = len(d["slides"])
    cmd = [sys.executable, "-X", "utf8", str(ROOT / "tools" / "check5.py"), str(f), "--out", str(out)]
    if a.shots:
        cmd += ["--shots", ",".join(str(i + 1) for i in range(n))]
    subprocess.run(cmd, capture_output=True)
    sc = json.loads((out / f"topics6_{f.stem}.json").read_text(encoding="utf-8"))
    scr = [x for x in sc["issues"]]
    lint = ecs.lint3(d, ROOT, 0)
    new_code = sorted({x["slide"] for x in scr if x["item"] == "새 코드 필요"})
    fix = Counter(x["item"] for x in scr + lint if x.get("sev") == "고칠 것" and x["item"] != "기준일")
    rows.append({"deck": f.stem, "title": d["meta"]["title"], "slides": n, "new_code": len(new_code), "fix": dict(fix),
                 "check": dict(Counter(x["item"] for x in scr if x.get("sev") != "고칠 것"))})
for r in rows:
    print(r["deck"], r["title"], f'{r["slides"]}장', "새 코드 필요", r["new_code"], "고칠 것", r["fix"], "확인할 것", r["check"])
(out / "summary.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
