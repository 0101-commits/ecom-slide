# 엔진 3판 미리 보기 — deck.json(schema 3) → 발표 파일 하나. 실행: python -X utf8 tools/preview3.py [deck.json] [out.html]
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "skill" / "ecom-slide" / "scripts"))
import ecs  # noqa: E402

src = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "style" / "demo3.json"
out = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "style" / "preview3.html"
deck = ecs.load(src)
out.write_text(ecs.page_html(deck, ROOT), encoding="utf-8")
print(out, round(out.stat().st_size / 1024), "KB")
