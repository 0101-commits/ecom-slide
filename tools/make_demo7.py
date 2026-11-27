# 7판 새 칸 시험 덱 — 보기 단추(views), 위쪽 묶음 탭(meta.rail), 각주 번호(foot.notes {t, at}), 확대 차트 전체 보기 사건 표시(zoom full),
# 국기 아이콘(axis icon tf:), 의석 반원 두 회차(scseat rounds), 행정구역 색칠(fullmap areas), 갈래 색(tree tone), 토의 고를 답(discuss topics)
# 숫자는 공개 통계(FRED, ECOS 스냅숏)만, 의석과 시나리오는 예시(concept 칩)
# 실행: python -X utf8 tools/make_demo7.py  → style/demo7_review.json
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
d3 = json.loads((ROOT / "style" / "demo3_charts.json").read_text(encoding="utf-8"))
snap = {k: json.loads((ROOT / "data" / "snap" / f"{k}.json").read_text(encoding="utf-8")) for k in ("ecos_rate", "fred_fedfunds", "ecos_cpi_yoy", "fred_cpi_yoy")}


def last(k):
    p, v = snap[k]["data"][-1]
    return p, v


kr_r, us_r, kr_c, us_c = last("ecos_rate"), last("fred_fedfunds"), last("ecos_cpi_yoy"), last("fred_cpi_yoy")

# 1. 확대 차트 : 처음 모습 전체, 단추로 최근 12개월 확대와 오감
z = json.loads(json.dumps([s for s in d3["slides"] if s.get("kind") == "zoom"][0]))
L, V = z["labels"], z["data"]
hi = max(range(len(V)), key=lambda i: V[i] if L[i] < "2025.11" else -1)
z["eyebrow"]["group"] = "환율과 금리"
z["views"] = ["전체", "최근 12개월 확대"]
z["beats"] = [{}]
z["full"] = [{"at": L[hi], "text": f"{L[hi]} {V[hi]:,.1f}원", "pos": "above", "anchor": "end", "dx": -6},
             {"at": L[0], "text": f"{L[0]} {V[0]:,.1f}원", "pos": "below", "anchor": "start", "dx": 6}]
z["foot"]["notes"] = [{"t": "최근 12개월 평균은 ECOM 계산, 세로 눈금은 전체 기간과 같게 고정", "at": "12개월 평균"}]

# 2. 가운데 축 카드 : 국기 아이콘 + 보기 단추(둘 다, 한국, 미국)
gap_k, gap_u = kr_r[1] - kr_c[1], us_r[1] - us_c[1]
axis = {"kind": "axis", "layout": "cards",
        "eyebrow": {"group": "환율과 금리", "topic": "한국과 미국의 정책금리와 물가", "basis": "정책금리 월 값, 물가는 전년 같은 달 대비, 단위: %"},
        "head": f"한국 기준금리는 {kr_r[1]:.2f}%, 미국 정책금리는 {us_r[1]:.2f}%로 {us_r[1] - kr_r[1]:.2f}%p 차이가 나지만, 두 나라 모두 정책금리가 물가 상승률보다 0.2%p 안팎 높아 실질 정책금리는 비슷함",
        "center": {"title": "정책금리와 물가"},
        "left": {"title": "한국", "def": "한국은행 기준금리", "icon": "tf:u1F1F0_u1F1F7"},
        "right": {"title": "미국", "def": "연준 연방기금금리", "icon": "tf:u1F1FA_u1F1F8"},
        "rows": [{"label": "정책금리", "left": f"{kr_r[1]:.2f}%({kr_r[0]})", "right": f"{us_r[1]:.2f}%({us_r[0]})"},
                 {"label": "소비자물가 상승률", "left": f"{kr_c[1]:.1f}%({kr_c[0]})", "right": f"{us_c[1]:.1f}%({us_c[0]})"},
                 {"label": "정책금리 − 물가", "left": f"{gap_k:+.1f}%p", "right": f"{gap_u:+.1f}%p"}],
        "result": {"left": "물가보다 조금 높은 금리로 물가 안정과 경기 사이 균형", "right": "물가가 3%대라 금리를 더 내리기 어려운 구간"},
        "views": ["둘 다", "한국", "미국"], "beats": [{"spot": "left"}, {"spot": "right"}],
        "foot": {"notes": [{"t": "미국은 연방기금 실효금리 월평균", "at": "미국 정책금리"}, "물가 발표 달이 두 나라가 달라 각 칸에 달을 적음"],
                 "source": "한국은행 ECOS(722Y001), 통계청(901Y009), 연준 세인트루이스 FRED(FEDFUNDS, CPIAUCSL)", "asof": "2026.11.10"}}

# 3. 의석 반원 두 회차(예시 치수)
seat = {"kind": "scseat", "concept": "예시 치수",
        "eyebrow": {"group": "부품 시험", "topic": "예시 의회 두 회차 의석", "basis": "블록별 의석, 총 300석, 단위: 석"},
        "head": "예시 의회에서 가 블록은 1회차에 160석으로 과반(151석)을 넘겼으나 2회차에 140석으로 줄어 혼자서는 과반을 만들지 못함",
        "rounds": [{"label": "1회차, 가 블록 단독 과반", "parties": [{"name": "가 블록", "seats": 160, "tone": "dark"}, {"name": "나 블록", "seats": 110, "tone": "g65"}, {"name": "다 블록", "seats": 30, "tone": "cmp"}], "caption": "160석", "sub": "가 블록"},
                   {"label": "2회차, 과반 블록 없음", "parties": [{"name": "가 블록", "seats": 140, "tone": "dark"}, {"name": "나 블록", "seats": 125, "tone": "g65"}, {"name": "다 블록", "seats": 35, "tone": "cmp"}], "caption": "140석", "sub": "가 블록"}],
        "majorityText": "과반", "unit": "석",
        "foot": {"notes": [{"t": "과반은 전체 300석의 절반을 넘는 151석", "at": "과반"}], "source": "예시 값", "asof": "2026.11.27"}}

# 4. 지도 : 나라 색칠 + 1단계 행정구역 색칠(사우디 동부주)
mp = {"kind": "fullmap", "form": "zoom", "layout": "zoom", "region": [[34.0, 14.0], [60.0, 33.0]], "concept": "개념도",
      "eyebrow": {"group": "부품 시험", "topic": "사우디 동부주의 위치", "basis": "1단계 행정구역 경계, Natural Earth 1:10m"},
      "head": "사우디의 동부주는 페르시아만을 따라 길게 뻗어 있고, 행정구역 색칠로 나라 안 한 지역만 따로 짚어 보일 수 있음",
      "paint": [{"c": "사우디", "tone": "gold", "label": "사우디 나머지 지역"}],
      "areas": [{"id": "SA-04", "tone": "main", "label": "동부주(아시 샤르키야)", "text": "동부주", "tip": "사우디 동부주|페르시아만 쪽 1단계 행정구역"}],
      "tags": [{"c": "사우디", "size": "m"}, {"c": "이란", "size": "s"}, {"c": "카타르", "size": "s", "dx": 40, "dy": 30}],
      "foot": {"notes": ["경계는 0.03도 단위로 단순화"], "source": "Natural Earth(퍼블릭 도메인)", "asof": "2026.11.27"}}

# 5. 갈래 나무 : 갈래 색 + 보기 단추(모두, 갈래마다)
tree = {"kind": "tree", "concept": "개념도",
        "eyebrow": {"group": "정리", "topic": "기준금리 경로 세 갈래", "basis": f"{kr_r[0]} 기준, 방향만 표시"},
        "head": f"한국 기준금리({kr_r[1]:.2f}%)가 내려가면 대출 부담은 줄지만 원화 약세 압력이 커지고, 동결하면 지금 균형이 이어지며, 올리면 물가는 잡히지만 경기 부담이 커짐",
        "root": {"title": f"{kr_r[0]} 현재", "value": f"{kr_r[1]:.2f}%", "sub": "한국은행 기준금리"},
        "branches": [{"title": "인하", "sub": "경기 부양 쪽", "leaves": [{"title": "대출 금리", "text": "변동 금리 대출 이자 부담 감소", "value": "하락"}, {"title": "원/달러 환율", "text": "미국과 금리 차이가 벌어져 원화 약세 압력", "value": "상승 압력"}]},
                     {"title": "동결", "sub": "지금 균형 유지", "leaves": [{"title": "대출 금리", "text": "지금 수준 유지", "value": "유지"}, {"title": "원/달러 환율", "text": "미국 금리 방향에 따라 움직임", "value": "미국 따라"}]},
                     {"title": "인상", "sub": "물가 안정 쪽", "tone": "warn", "leaves": [{"title": "대출 금리", "text": "이자 부담 증가, 소비 위축", "value": "상승"}, {"title": "물가", "text": "수요가 줄어 물가 상승률 둔화", "value": "둔화"}]}],
        "views": ["모두", "인하", "동결", "인상"], "beats": [{"spot": 0}, {"spot": 1}, {"spot": 2}],
        "foot": {"notes": ["방향은 일반적인 경로이며 실제 크기는 그때 경기와 미국 금리에 따라 다름"], "source": "한국은행 ECOS(722Y001)", "asof": "2026.11.10"}}

# 6. 토의 : 고를 답 알약
disc = {"kind": "discuss", "layout": "qcards",
        "eyebrow": {"group": "토의", "topic": "함께 정할 것"},
        "head": "다음 기준금리 결정, 원/달러 환율 방향, 다음 모임에서 볼 지표에 대해 각자 예상 답을 골라 의견을 모으고 근거를 나눔",
        "left": {"title": "정해 볼 것", "items": [{"title": "다음 금리 결정을 예상해 보자"}, {"title": "환율 방향을 정해 보자"}, {"title": "볼 지표를 정해 보자"}]},
        "right": {"title": "토의 주제", "topics": [
            {"title": "다음 기준금리 결정", "q": "한국은행은 다음 회의에서 기준금리를 어떻게 할까?", "options": ["인하", "동결", "인상"]},
            {"title": "원/달러 환율 방향", "q": "석 달 뒤 원/달러 환율은 지금보다 높을까?", "options": ["높음", "비슷함", "낮음"]},
            {"title": "볼 지표", "q": "다음 모임까지 가장 먼저 볼 지표는?", "options": ["미국 물가", "한국 수출", "고용"]}]},
        "foot": {"notes": [], "source": "ECOM 토의", "asof": "2026.11.27"}}

deck = {"schema": 3, "meta": {"session": "DEMO7", "title": "7판 새 칸 시험", "date": "2026.11.27", "series": "경제지표101", "cover": "A", "combo": "A",
                              "rail": {"정리": "정리와 토의", "토의": "정리와 토의"}},
        "slides": [z, axis, seat, mp, tree, disc, {"kind": "end"}]}
out = ROOT / "style" / "demo7_review.json"
out.write_text(json.dumps(deck, ensure_ascii=False, indent=1), encoding="utf-8")
print("ok", out, len(deck["slides"]))
