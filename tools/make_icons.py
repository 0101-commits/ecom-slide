# 아이콘 재료 → style/parts/a_icons.js (엔진이 덱 한 파일에 함께 넣음)
#  · 라인 아이콘 : style/icons/*.svg (Lucide, ISC — style/icons/LICENSE-lucide.txt) → 안쪽 도형만 글로
#  · Tossface 는 여기 넣지 않음 — 원본 SVG(style/tossface, 라이선스 전문 LICENSE.txt)를 ecs.py 가 덱을 만들 때만 그림으로 넣음
#    (사용 조건 : 변형 금지 · 소스코드로 변환해 게재 금지 · 출처 표기)
# 실행: python -X utf8 tools/make_icons.py
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ST = ROOT / "style"
icons = {}
for f in sorted((ST / "icons").glob("*.svg")):
    src = f.read_text(encoding="utf-8")
    m = re.search(r"<svg[^>]*>(.*)</svg>", src, re.S)
    if m:
        icons[f.stem] = re.sub(r"\s+", " ", m.group(1)).strip()
js = ("/* 아이콘 재료 — tools/make_icons.py 가 만듦(손으로 고치지 말 것).\n"
      "   ICONS = 라인 아이콘(Lucide, ISC) 안쪽 도형. Tossface(ECOM.TF)는 ecs.py 가 덱을 만들 때 원본 파일로 넣음 */\n"
      "(function () { var E = window.ECOM = window.ECOM || {};\n"
      f"E.ICONS = {json.dumps(icons, ensure_ascii=False)};\n"
      "E.TF_CREDIT = '이모지: 토스팀에서 제공한 토스페이스';\n})();\n")
(ST / "parts" / "a_icons.js").write_text(js, encoding="utf-8", newline="\n")
print("라인 아이콘", len(icons), "·", round(len(js) / 1024), "KB")
