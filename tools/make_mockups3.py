# 목업 3판 315종 — 새 부품 30종(시험 덱에서) + 판 2 목업 285종(한 문장 · 옛 표지 묶음 빼고)을 3판 형식으로
# 실행: python -X utf8 tools/make_mockups3.py   → library/mockups/mockups.json(3판) · index.md
# 판 2 원본은 library/mockups/v2/mockups.json 로 옮겨 둠(처음 한 번). 숫자는 판 2 목업에 든 공개 통계 값 그대로.
import json, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "library" / "mockups"
sys.path.insert(0, str(ROOT / "tools"))

V2 = LIB / "v2" / "mockups.json"
if not V2.exists():
    V2.parent.mkdir(exist_ok=True)
    shutil.copy(LIB / "mockups.json", V2)
M2 = json.loads(V2.read_text(encoding="utf-8"))
GOT = M2["got"]


from mock3_core import CONV  # noqa: E402
CONV = dict(CONV)

try:
    import mock3_charts  # 차트 부품 담당이 만든 변환(있으면)
    CONV.update(mock3_charts.CONV)
except ImportError:
    pass

out = []
skip = {"headline", "frame"}
miss = {}
for m in M2["mockups"]:
    f = m["family"]
    if f in skip:
        continue
    fn = CONV.get(f)
    if not fn:
        miss[f] = miss.get(f, 0) + 1
        continue
    sl = fn(m)
    sl["note"] = f"{m['id']} · {m['pattern']} · {m['variant']}"
    out.append({"id": m["id"], "kind": sl["kind"], "family": f, "variant": m["variant"], "title": sl["eyebrow"]["topic"] if isinstance(sl.get("eyebrow"), dict) else m.get("title"),
                "tags": m.get("tags", []), "slide": sl, "facts": m.get("facts", {})})

# 텍스트 묶음(도식 · 비교 · 용어 · 질문) — 도식 담당이 쓴 3판 글(있으면)
TXT = LIB / "text3.json"
if TXT.exists():
    for t in json.loads(TXT.read_text(encoding="utf-8")):
        out.append(t)
        miss.pop(t.get("family"), None)

# 새 부품 30종 — 시험 덱에서 고른 장
CORE = LIB / "core30.json"
core = json.loads(CORE.read_text(encoding="utf-8")) if CORE.exists() else []
lib = {"version": 3, "got": GOT, "count": len(core) + len(out), "core": len(core), "converted": len(out), "missing": miss, "mockups": core + out}
(LIB / "mockups.json").write_text(json.dumps(lib, ensure_ascii=False), encoding="utf-8")
rows = ["# 목업 색인(3판)", "", f"총 {lib['count']}장 = 새 부품 {len(core)} + 판 2 목업 3판 변환 {len(out)} · 숫자 받은 시각 {GOT} · 만든 도구 `tools/make_mockups3.py`", "",
        "| id | 종류 | 묶음 | 변형 | 주제 |", "|---|---|---|---|---|"]
for x in core + out:
    rows.append(f"| {x['id']} | {x['kind']} | {x['family']} | {str(x.get('variant', '')).replace('|', '/')} | {str(x.get('title', '')).replace('|', '/')} |")
(LIB / "index.md").write_text("\n".join(rows) + "\n", encoding="utf-8")
print(json.dumps({"count": lib["count"], "core": len(core), "converted": len(out), "missing": miss}, ensure_ascii=False))
