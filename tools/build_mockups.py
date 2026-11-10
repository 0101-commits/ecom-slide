# 목업 갤러리 만들기 — library/mockups/mockups.json + style/deck.css · deck.js → gallery/mockups.html (자기 완결 한 파일)
# 실행: python -X utf8 tools/build_mockups.py [--test]   (--test: 오류 모으는 조각을 넣은 gallery/_mockups_test.html 도 만듦)
import base64, html, io, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB = ROOT / "library" / "mockups"
M = json.loads((LIB / "mockups.json").read_text(encoding="utf-8"))
mock = M["mockups"]


def font_face(text):
    src = ROOT / "style" / "fonts" / "PretendardVariable.woff2"
    if not src.exists():
        return ""
    try:
        from fontTools import subset
        from fontTools.ttLib import TTFont
    except ImportError:
        return ""
    chars = set(text) | set("0123456789.,%+-=→←↑↓·:;!?()[]「」『』'\"/ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz 억조원달러배월년분기−×")
    opt = subset.Options()
    opt.flavor = "woff2"
    opt.layout_features = ["*"]
    f = TTFont(str(src))
    s = subset.Subsetter(opt)
    s.populate(unicodes=[ord(c) for c in chars])
    s.subset(f)
    b = io.BytesIO()
    f.flavor = "woff2"
    f.save(b)
    return ("@font-face{font-family:'Pretendard';font-weight:100 900;font-display:block;"
            f"src:url(data:font/woff2;base64,{base64.b64encode(b.getvalue()).decode()}) format('woff2')}}\n")


facts, slides = {}, []
for m in mock:
    facts.update(m["facts"])
    slides.append(m["slide"])
fam_part = M["family_part"]
parts = [{"no": no, "name": M["family_names"][fam], "desc": f"{sum(1 for m in mock if m['family'] == fam)}장"} for fam, no in fam_part.items() if fam != "frame"]
gl = json.loads((ROOT / "terms" / "glossary.json").read_text(encoding="utf-8")).get("words", {})
deck = {"meta": {"session": "MOCK", "title": f"ECOM 목업 {len(mock)}", "series": "목업", "date": M["got"][:10], "asof": "2026.10", "parts": parts},
        "glossary": gl, "facts": facts, "slides": slides}

css = (ROOT / "style" / "deck.css").read_text(encoding="utf-8")
js = (ROOT / "style" / "deck.js").read_text(encoding="utf-8")
payload = json.dumps(deck, ensure_ascii=False).replace("</", "<\/")
face = font_face(payload)
title = html.escape(f"ECOM 목업 {len(mock)}")


def page(extra_head=""):
    return (f'<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>{title}</title>\n'
            f"{extra_head}<style>\n{face}{css}\n</style>\n</head>\n<body>\n"
            f'<script type="application/json" id="deck-data">{payload}</script>\n<script>\n{js}\n</script>\n</body>\n</html>\n')


out = ROOT / "gallery" / "mockups.html"
out.write_text(page(), encoding="utf-8")
print(f"wrote {out} ({out.stat().st_size:,} bytes, {len(slides)}장)")
(ROOT / "library" / "mockups" / "deck.json").write_text(json.dumps(deck, ensure_ascii=False), encoding="utf-8")

if "--test" in sys.argv:
    collector = ('<script>window.__errs=[];window.addEventListener("error",function(e){window.__errs.push(String(e.message)+" @"+(e.lineno||""))});'
                 'window.addEventListener("unhandledrejection",function(e){window.__errs.push("rej "+String(e.reason))});'
                 'window.addEventListener("load",function(){setTimeout(function(){var p=document.createElement("pre");p.id="__errs";'
                 'p.textContent="ERRS="+JSON.stringify(window.__errs)+" SECTIONS="+document.querySelectorAll("section,.slide").length;document.body.appendChild(p)},800)});</script>\n')
    t = ROOT / "gallery" / "_mockups_test.html"
    t.write_text(page(collector), encoding="utf-8")
    print("wrote", t)

# 색인 표
rows = ["# 목업 색인", "", f"총 {len(mock)}장 · 데이터 받은 시각 {M['got']} · 만든 도구 `tools/make_mockups.py`", "", "| id | 묶음 | 변형 | 제목 |", "|---|---|---|---|"]
for m in mock:
    rows.append(f"| {m['id']} | {m['pattern']} | {m['variant'].replace('|', '/')} | {m['title'].replace('|', '/')} |")
(LIB / "index.md").write_text("\n".join(rows) + "\n", encoding="utf-8")
print("wrote", LIB / "index.md")
