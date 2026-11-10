# 갤러리를 파일 하나로(목록 · 골격을 안에 넣음) — 서버 없이 두 번 눌러 열어 보는 확인용
# 실행: python tools/gallery_offline.py <출력.html>
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
out = Path(sys.argv[1])
cat = json.load(open(ROOT / "library" / "catalog.json", encoding="utf-8"))
sk = {f.stem: json.load(open(f, encoding="utf-8")) for f in (ROOT / "library" / "skeletons").glob("*.json")}
page = (ROOT / "gallery" / "index.html").read_text(encoding="utf-8")
inject = ("<script>window.ECOM_CAT=" + json.dumps(cat, ensure_ascii=False, separators=(",", ":")) +
          ";window.ECOM_SK=" + json.dumps(sk, ensure_ascii=False, separators=(",", ":")) + ";</script>\n")
page = page.replace("<script>\n(async function(){", inject + "<script>\n(async function(){", 1)
out.write_text(page, encoding="utf-8")
print(out, round(out.stat().st_size / 1e6, 1), "MB")
