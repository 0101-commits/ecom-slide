# 새 부품 30종 목업 — 시험 덱(style/demo3*.json)에서 종류마다 대표 장 하나 → library/mockups/core30.json (C01~C30)
# 실행: python -X utf8 tools/make_core30.py
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ORDER = [  # (번호, kind, 이름, 고르는 조건)
    (1, "line", "주석 계단 차트(국면 · 평균 · 시사점)", lambda s: bool(s.get("phases")) and bool(s.get("box"))),
    (2, "bar", "차이 막대 + 재생 · 결정 줄 · 분포", lambda s: bool(s.get("playback"))),
    (3, "line", "큰 계단 차트 + 결정 일지", lambda s: bool(s.get("lanes"))),
    (4, "formula", "뺄셈 막대 + 추이", None),
    (5, "line", "두 계열 선(같은 축)", lambda s: not s.get("phases") and not s.get("lanes")),
    (6, "minis", "나란한 작은 차트", None), (7, "zoom", "확대(전체 → 최근)", None), (8, "rank", "순위 막대", None),
    (9, "split", "구성 나눔", None), (10, "bridge", "증감 분해", None), (11, "slope", "두 시점 기울기", None), (12, "waffle", "100칸 비중", None),
    (13, "hub", "경로 방사도", None), (14, "timeline", "국면 타임라인", None), (15, "quadrant", "4분면 시나리오 + 말풍선", None),
    (16, "axis", "가운데 축 비교", None), (17, "stairs", "인과 계단", None), (18, "pyramid", "계층 피라미드", None), (19, "balance", "균형 저울", None),
    (20, "flow", "거래 흐름도", None), (21, "ladder", "조건 사다리", None), (22, "cycle", "순환 고리", None),
    (23, "table", "표 + 범위 막대", lambda s: bool(s.get("range"))), (24, "heatmap", "월 × 지표 열지도 표", None), (25, "kpi", "큰 숫자 띠", None),
    (26, "calendar", "결정 일정 달력", None), (27, "cover", "표지(A~E 중 회차마다 고름)", None), (28, "part", "간지", None),
    (29, "discuss", "논의 요약 → 토의 주제 + 손들기", None), (30, "further", "추후 분석 범위", None),
]
pool = []
for f in ("demo3.json", "demo3_charts.json", "demo3_diagrams.json", "demo3_extra.json"):
    p = ROOT / "style" / f
    if p.exists():
        pool += json.loads(p.read_text(encoding="utf-8"))["slides"]
used, out, miss = set(), [], []
for no, kind, name, cond in ORDER:
    hit = None
    for i, s in enumerate(pool):
        if id(s) in used or s.get("kind") != kind:
            continue
        if cond and not cond(s):
            continue
        hit = s
        break
    if hit is None and kind == "part":
        hit = {"kind": "part", "no": "PART 02", "name": "시장금리 차", "desc": "채권시장이 매긴 앞으로의 금리와 한·미 국채 금리 차이", "parts": ["기준금리 차", "시장금리 차", "환율 · 자금 흐름", "물가 · 정책 여지"], "idx": 1}
    if hit is None:
        miss.append(f"{no} {kind}")
        continue
    used.add(id(hit))
    s = json.loads(json.dumps(hit))
    s.pop("appendix", None)
    s.pop("links", None)
    out.append({"id": f"C{no:02d}", "kind": kind, "family": "core", "variant": name, "title": (s.get("eyebrow") or {}).get("topic", name) if isinstance(s.get("eyebrow"), dict) else name,
                "tags": ["새 부품"], "slide": s, "facts": {}})
(ROOT / "library" / "mockups" / "core30.json").write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
print(json.dumps({"core": len(out), "missing": miss}, ensure_ascii=False))
