"""style/deck.css + deck.js + demo.json(2) 를 한 파일(style/preview.html · preview2.html)로 묶는 개발용 도구. 글꼴은 넣지 않는다."""
import json
from pathlib import Path

root = Path(__file__).resolve().parent.parent / "style"
css = (root / "deck.css").read_text(encoding="utf-8")
js = (root / "deck.js").read_text(encoding="utf-8")

for src, out_name, title in (("demo.json", "preview.html", "ECOM 발표 미리보기"), ("demo2.json", "preview2.html", "ECOM 발표 미리보기 2판")):
    path = root / src
    if not path.exists():
        continue
    data = json.dumps(json.loads(path.read_text(encoding="utf-8")), ensure_ascii=False)
    data = data.replace("</", "<\\/")  # </script> 로 끊기지 않게
    html = f"""<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
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
    out = root / out_name
    out.write_text(html, encoding="utf-8")
    print(f"wrote {out} ({len(html):,} bytes)")
