"""style/deck.css + deck.js + demo.json 을 한 파일(style/preview.html)로 묶는 개발용 도구. 글꼴은 넣지 않는다."""
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent / "style"
css = (root / "deck.css").read_text(encoding="utf-8")
js = (root / "deck.js").read_text(encoding="utf-8")
data = json.dumps(json.loads((root / "demo.json").read_text(encoding="utf-8")), ensure_ascii=False)
data = data.replace("</", "<\/")  # </script> 로 끊기지 않게

html = f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ECOM 발표 미리보기</title>
<style>
{css}
</style>
</head>
<body>
<script type="application/json" id="deck-data">{data}</script>
<script>
{js}
</script>
</body>
</html>
"""
out = root / "preview.html"
out.write_text(html, encoding="utf-8")
print(f"wrote {out} ({len(html):,} bytes)")
