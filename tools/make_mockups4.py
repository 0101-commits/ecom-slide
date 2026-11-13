# 목업 목록 4판 — 3판에서 남길 80종(library/mockups/v4/_keep.json) + 새 목업(library/mockups/v4/F*.json) → library/mockups/mockups.json · index.md
# 3판 목록은 처음 한 번 library/mockups/v3/mockups.json 으로 옮겨 둔다. 실행: python -X utf8 tools/make_mockups4.py
import json, shutil
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "library" / "mockups"
V3 = LIB / "v3" / "mockups.json"
V3.parent.mkdir(exist_ok=True)
if not V3.exists():
    shutil.copy(LIB / "mockups.json", V3)
old = json.loads(V3.read_text(encoding="utf-8"))
keep_ids = json.loads((LIB / "v4" / "_keep.json").read_text(encoding="utf-8"))
by_id = {m["id"]: m for m in old["mockups"]}
miss = [i for i in keep_ids if i not in by_id]
kept = [dict(by_id[i], tags=sorted(set(by_id[i].get("tags", []) + ["3판에서 남김"]))) for i in keep_ids if i in by_id]
new = []
for f in sorted((LIB / "v4").glob("F*.json")):
    new += json.loads(f.read_text(encoding="utf-8"))
new.sort(key=lambda x: x["id"])
ids = [m["id"] for m in kept + new]
dup = sorted({i for i in ids if ids.count(i) > 1})
assert not dup, f"번호 겹침 {dup}"
FAM = {"F01": "선 · 시계열", "F02": "두 지표 · 이중축", "F03": "막대 · 크기 비교", "F04": "예상 vs 실제 · 발표", "F05": "인과 사슬 · 흐름도", "F06": "돈 · 물자 흐름",
       "F07": "지도", "F08": "사건 타임라인 · 일정", "F09": "역사 사례 비유", "F10": "제도 · 용어 · 구조", "F11": "기업 · 산업 비교", "F12": "가치사슬 · 공급망",
       "F13": "시나리오 · 조건 분기", "F14": "인물 · 발언", "F15": "나라 비교", "F16": "구성 분해", "F17": "찬반 · 쟁점", "F18": "순위 · 숫자", "F19": "채권 · 금리 구조"}
GOT = datetime.now().strftime("%Y.%m.%d")
lib = {"version": 4, "got": GOT, "count": len(kept) + len(new), "kept": len(kept), "new": len(new), "families": FAM, "missing": miss, "mockups": kept + new}
(LIB / "mockups.json").write_text(json.dumps(lib, ensure_ascii=False), encoding="utf-8")


def example(m):
    return "예시" in json.dumps([m["slide"].get("eyebrow"), m["slide"].get("foot")], ensure_ascii=False)


rows = ["# 목업 색인(4판)", "", f"총 {lib['count']}종 = 3판에서 남김 {len(kept)} + 새 목업 {len(new)}({len(FAM)}계열) · 만든 날 {GOT} · 만든 도구 `tools/make_mockups4.py`",
        "새 목업 숫자는 공개 통계 스냅샷(`data/snap4` · `data/snap`)에서 계산하고, 공개 통계가 없는 장은 「예시 값」으로 표시하고 이름을 익명으로 둠.", "",
        "| 번호 | 계열 | kind | 모양 | 주제 | 숫자 |", "|---|---|---|---|---|---|"]
for m in kept + new:
    fam = m.get("family", "")
    rows.append(f"| {m['id']} | {FAM.get(fam, fam)} | {m['kind']} | {m.get('variant', '')} | {m.get('title') or ''} | {'예시 값' if example(m) else '공개 통계'} |")
(LIB / "index.md").write_text("\n".join(rows) + "\n", encoding="utf-8")
print(json.dumps({"count": lib["count"], "kept": len(kept), "new": len(new), "missing": miss, "example": sum(1 for m in new if example(m))}, ensure_ascii=False))
