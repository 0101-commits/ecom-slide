# 목업 갤러리(3판) — library/mockups/mockups.json(315) → gallery/mockups.html (엔진 3판 발표 파일 하나, O 키로 모아 보기)
# 실행: python -X utf8 tools/build_mockups.py
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "skill" / "ecom-slide" / "scripts"))
import ecs  # noqa: E402

M = json.loads((ROOT / "library" / "mockups" / "mockups.json").read_text(encoding="utf-8"))
slides, facts = [], {}
for m in M["mockups"]:
    s = json.loads(json.dumps(m["slide"]))
    s["note"] = f"{m['id']} · {m['kind']} · {m.get('variant', '')}"
    s.pop("appendix", None)
    s.pop("links", None)
    if isinstance(s.get("eyebrow"), dict):
        s["eyebrow"]["basis"] = (s["eyebrow"].get("basis") or "") + f" · 목업 {m['id']}"
    slides.append(s)
    facts.update(m.get("facts", {}))
deck = {"schema": 3, "meta": {"session": "MOCK3", "title": f"ECOM 목업 {len(slides)}", "date": M["got"][:10], "cover": "A", "combo": "A"}, "facts": facts, "slides": slides}
out = ROOT / "gallery" / "mockups.html"
out.write_text(ecs.page_html(deck, ROOT, title=f"ECOM 목업 {len(slides)}종 (엔진 3판)"), encoding="utf-8")
(ROOT / "library" / "mockups" / "deck.json").write_text(json.dumps(deck, ensure_ascii=False), encoding="utf-8")
print(out, round(out.stat().st_size / 1024), "KB", len(slides), "장")
