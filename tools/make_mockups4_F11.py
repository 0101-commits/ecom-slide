# F11 기업 · 산업 비교 목업 12종(N119~N130, 2차) — 기업 숫자는 공개 자료가 없어 예시 값 + 익명(A사 · B사), 시장 지수(나스닥)만 실제 값(FRED)
# 실행: python -X utf8 tools/make_mockups4_F11.py
#   → library/mockups/v4/F11.json · style/demo4_r2_F11.json
import json
import random
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
S4 = ROOT / "data" / "snap4"
TODAY = "2026.11.13"
EX_NOTE = "숫자는 모양을 보이기 위한 예시 값"
EX_SRC = "예시 값 (공개 통계 아님)"
out = []


def foot(notes, source, asof):
    return {"notes": notes, "source": source, "asof": asof}


def eb(topic, basis, example=True):
    return {"group": "기업 비교", "topic": topic, "basis": basis + (" · 예시 값" if example else "")}


def add(id_, kind, variant, title, facts, slide, example=True):
    slide["kind"] = kind
    out.append({"id": id_, "kind": kind, "family": "F11", "variant": variant, "title": title, "tags": ["4판"] + (["예시값"] if example else []), "facts": facts, "slide": slide})


def f1(v):
    return f"{v:.1f}"


# ───────── 공통 가상 기업(익명) : 매출 · 영업이익 · 시가총액 (조원)
CO = {"A사": (48.2, 9.6, 310, 12.4), "B사": (39.6, 5.1, 205, 6.1), "C사": (27.4, 4.4, 120, 9.8), "D사": (18.9, 0.9, 52, -3.2)}
mg = {k: 100 * v[1] / v[0] for k, v in CO.items()}

# ───────── N119 기업 카드 나란히
cards = []
for k, v in CO.items():
    cards.append({"name": k, "tag": "3개 항목 모두 1위" if k == "A사" else None,
                  "rows": [{"label": "매출", "value": v[0], "unit": "조원", "dec": 1}, {"label": "영업이익", "value": v[1], "unit": "조원", "dec": 1}, {"label": "시가총액", "value": v[2], "unit": "조원", "dec": 0}],
                  "chips": [{"label": "영업이익률", "value": round(mg[k], 1), "unit": "%", "dec": 1}, {"label": "매출 전년 대비", "value": v[3], "unit": "%", "dec": 1, "sign": True, "tone": "warn" if v[3] < 0 else None}]})
add("N119", "cocards", "기업 카드 나란히(스펙 시트)", "기업 4곳 매출 · 이익 · 시가총액 맞대기",
    {"cards": [{"name": c["name"], "rows": c["rows"]} for c in cards]},
    {"eyebrow": eb("업종 대표 4개사 규모 비교", "최근 사업연도, 단위: 조원 · %"),
     "head": f"A사는 매출 {CO['A사'][0]}조원 · 영업이익 {CO['A사'][1]}조원 · 시가총액 {CO['A사'][2]}조원으로 **세 항목 모두 1위**이고 D사는 **매출이 {abs(CO['D사'][3])}% 줄어** 격차가 벌어짐",
     "cards": cards, "hero": 0,
     "foot": foot([EX_NOTE, "영업이익률 = 영업이익 ÷ 매출", "막대는 항목별로 네 곳끼리 같은 눈금"], EX_SRC, TODAY)})

# ───────── N120 점유율 도넛 여럿
MK = [("가 시장", "120조원", {"A사": 34, "B사": 27, "C사": 18, "D사": 9, "그 밖": 12}),
      ("나 시장", "75조원", {"A사": 21, "B사": 33, "C사": 22, "D사": 14, "그 밖": 10}),
      ("다 시장", "46조원", {"A사": 41, "B사": 15, "C사": 12, "D사": 20, "그 밖": 12}),
      ("라 시장", "32조원", {"A사": 12, "B사": 18, "C사": 31, "D사": 25, "그 밖": 14})]


def rank(parts, who):
    cos = sorted([(k, v) for k, v in parts.items() if k != "그 밖"], key=lambda x: -x[1])
    return [k for k, _ in cos].index(who) + 1


markets = []
for nm, sz, pt in MK:
    r = rank(pt, "A사")
    markets.append({"name": nm, "size": sz, "parts": [{"label": k, "value": v} for k, v in pt.items()], "note": f"A사 {r}위" + (" · 선두" if r == 1 else "")})
firsts = [m for m, (nm, sz, pt) in zip(markets, MK) if rank(pt, "A사") == 1]
bad = [nm for nm, sz, pt in MK if rank(pt, "A사") == 4]
size_w = sum(float(sz[:-2]) * pt["A사"] for nm, sz, pt in MK) / sum(float(sz[:-2]) for nm, sz, pt in MK)
add("N120", "codonuts", "점유율 도넛 여럿", "시장 4곳의 업체별 점유율",
    {"markets": [{"name": m["name"], "parts": m["parts"]} for m in markets]},
    {"eyebrow": eb("시장별 업체 점유율 비교", "매출 기준 점유율, 단위: %"),
     "head": f"A사는 4개 시장 중 **{len(firsts)}곳에서 1위**(가 시장 34% · 다 시장 41%)이나 **{bad[0][0]} 시장은 12%로 4위**에 그쳐 시장 규모로 가중한 점유율은 {size_w:.0f}%임",
     "markets": markets, "companies": ["A사", "B사", "C사", "D사"], "hero": "A사", "unit": "%",
     "foot": foot([EX_NOTE, "시장 규모는 시장 전체 매출", "점유율 합계는 100%"], EX_SRC, TODAY)})

# ───────── N121 포지셔닝 4분면
PO = [("A사", 18, 24, 310, True), ("B사", 9, 20, 205, False), ("C사", 22, 9, 120, False), ("D사", 4, 6, 52, False), ("E사", 13, 12, 90, False), ("F사", -1, 16, 160, False), ("G사", 27, 12, 40, False), ("H사", 12, 27, 70, False)]
lead_names = [p[0] for p in PO if p[1] >= 10 and p[2] >= 15]
add("N121", "copos", "포지셔닝 시장 지도(원 크기 = 시가총액)", "성장률 × 이익률 위 8개사 위치",
    {"items": [{"name": p[0], "growth": p[1], "margin": p[2], "cap": p[3]} for p in PO]},
    {"eyebrow": eb("성장률 · 이익률로 본 업계 포지셔닝", "최근 사업연도 매출 성장률 · 영업이익률, 원 넓이 = 시가총액"),
     "head": f"8개사 중 성장률 10% · 이익률 15% 기준선을 모두 넘은 **선도 구역은 {' · '.join(lead_names)} 둘뿐**이고 **A사는 성장률 18% · 이익률 24%**에 시가총액도 최대임",
     "items": [{"name": p[0], "x": p[1], "y": p[2], "size": p[3], "hero": p[4]} for p in PO],
     "x": {"min": -5, "max": 30, "step": 5, "unit": "%", "title": "매출 성장률(전년 대비, %)"}, "y": {"min": 0, "max": 30, "step": 5, "unit": "%", "title": "영업이익률(%)"},
     "pivot": {"x": 10, "y": 15},
     "quads": [{"t": "수익형", "s": "성장은 느리나 이익률 높음"}, {"t": "선도형", "s": "성장 · 이익률 모두 높음"}, {"t": "정체형", "s": "성장 · 이익률 모두 낮음"}, {"t": "투자형", "s": "이익을 줄여 성장에 투입"}],
     "foot": foot([EX_NOTE, "기준선은 성장률 10% · 이익률 15%", "원 넓이는 시가총액에 비례"], EX_SRC, TODAY)})

# ───────── N122 실적 표 + 작은 선 열
RT = {"A사": (48.2, 9.6, 12.4, [16.8, 17.5, 18.2, 17.9, 18.8, 19.1, 19.6, 19.9]),
      "B사": (39.6, 5.1, 6.1, [13.9, 13.4, 13.6, 13.1, 13.3, 12.9, 13.0, 12.9]),
      "C사": (27.4, 4.4, 9.8, [10.2, 11.0, 12.1, 13.0, 14.2, 15.1, 15.8, 16.1]),
      "D사": (18.9, 0.9, -3.2, [8.5, 7.6, 7.1, 6.2, 6.6, 5.5, 5.0, 4.8]),
      "E사": (12.1, 2.1, 8.0, [15.0, 16.2, 16.6, 17.5, 16.9, 17.8, 17.1, 17.4])}
rows = []
for k, (rev, op, yoy, tr) in RT.items():
    rows.append({"name": k, "hero": k == "A사", "v": [rev, op, round(100 * op / rev, 1), yoy], "trend": tr})
rose = [r["name"] for r in rows if r["trend"][-1] > r["trend"][0]]
add("N122", "cotbl", "실적 표 + 분기 추이 작은 선", "기업 5곳 실적과 영업이익률 8분기 추이",
    {"rows": [{"name": r["name"], "v": r["v"], "trend": r["trend"]} for r in rows]},
    {"eyebrow": eb("업종 5개사 실적 요약", "최근 사업연도 · 최근 8분기, 단위: 조원 · %"),
     "head": f"5개사 중 **{len(rose)}곳이 8분기 전보다 영업이익률이 올랐고** C사는 **10.2%에서 16.1%로 5.9%p** 뛴 반면 D사는 8.5%에서 4.8%로 내려 격차가 커지는 중임",
     "cols": [{"t": "매출(조원)", "dec": 1}, {"t": "영업이익(조원)", "dec": 1}, {"t": "이익률(%)", "dec": 1}, {"t": "매출 전년 대비", "dec": 1, "unit": "%", "sign": True, "chip": True}],
     "rows": rows, "trendTitle": "영업이익률 최근 8분기(%)", "trendUnit": "%", "trendDec": 1,
     "foot": foot([EX_NOTE, "분기 선은 다섯 곳 모두 같은 눈금", "이익률 = 영업이익 ÷ 매출"], EX_SRC, TODAY)})

# ───────── N123 가치사슬 위 기업 배치
ST = [("소재 · 부품", "원료 가공", [("C사", 38), ("A사", 24), ("D사", 15)]),
      ("설계", "칩 · 소프트웨어", [("A사", 46), ("B사", 21), ("E사", 12)]),
      ("제조", "위탁 생산", [("C사", 52), ("B사", 25), ("A사", 9)]),
      ("조립 · 시험", "모듈 완성", [("B사", 41), ("D사", 28), ("A사", 14)]),
      ("판매", "완제품 유통", [("A사", 35), ("E사", 27), ("B사", 18)])]
lead = [s[0] for s in ST if s[2][0][0] == "A사"]
stages = [{"name": s[0], "sub": s[1], "top": [{"name": n, "share": v} for n, v in s[2]]} for s in ST]
add("N123", "cochain", "가치사슬 위 단계별 강자", "다섯 단계 강자와 점유율",
    {"stages": stages},
    {"eyebrow": eb("가치사슬 단계별 선두 기업", "단계별 매출 점유율, 단위: %"),
     "head": f"A사는 5개 단계 중 **{' · '.join(lead)} {len(lead)}곳에서 1위**이나 제조는 점유율 9%로 3위에 머물러 **제조 단계는 C사 52%에 의존**하는 구조임",
     "stages": stages, "hero": "A사", "unit": "%", "band": f"A사 1위 단계 {len(lead)}곳({' · '.join(lead)}) · 가장 약한 단계 제조(9%)",
     "foot": foot([EX_NOTE, "점유율은 단계별 상위 3개사만 표시", "굵은 칸 = A사 1위 단계"], EX_SRC, TODAY)})

# ───────── N124 기업 점수표
FM = ["A사", "B사", "C사", "D사"]
SC = [("기술력", "특허 · 연구개발 투자", [2, 1, 1, 0]), ("원가 경쟁력", "공장 가동률 · 단가", [1, 2, 2, 0]), ("고객 기반", "상위 고객 수 · 계약 기간", [2, 2, 1, 1]),
      ("재무 안정성", "부채비율 · 현금", [2, 1, 2, 0]), ("신사업 투자", "신규 투자 · 인수", [2, 0, 1, 1]), ("주주 환원", "배당 · 자사주", [1, 2, 1, 0])]
tot = [sum(r[2][j] for r in SC) for j in range(4)]
add("N124", "coscore", "항목별 ○ ◐ ● 점수표", "기업 4곳 6개 항목 평가",
    {"firms": FM, "rows": [{"label": r[0], "lv": r[2]} for r in SC], "total": tot},
    {"eyebrow": eb("기업 4곳 항목별 평가", "● 우수 · ◐ 보통 · ○ 미흡"),
     "head": f"A사는 6개 항목 중 **{sum(1 for r in SC if r[2][0] == 2)}곳에서 ● 우수**를 받아 **종합 {tot[0]}점으로 1위**이고 D사는 ● 없이 **종합 {tot[3]}점**에 그쳐 네 곳 중 평가가 가장 낮음",
     "firms": FM, "hero": 0, "rows": [{"label": r[0], "sub": r[1], "lv": r[2]} for r in SC],
     "foot": foot([EX_NOTE, "평가는 모양을 보이기 위한 가상 평가", "종합 점수 = 항목별 점수 합(● 2점 · ◐ 1점)"], EX_SRC, TODAY)})

# ───────── N125 수주 잔고 쌓기
YR = ["2022", "2023", "2024", "2025", "2026"]
BK = [(n, [round(x * 2.2, 1) for x in v], r) for n, v, r in [("A사", [12.4, 15.1, 19.8, 26.3, 31.7], 48.2), ("B사", [8.8, 9.4, 10.1, 10.5, 11.2], 39.6), ("C사", [5.1, 6.9, 9.4, 13.2, 18.0], 27.4), ("D사", [14.0, 13.1, 12.2, 11.0, 9.6], 18.9)]]
pan = []
for nm, v, rev in BK:
    cagr = 100 * ((v[-1] / v[0]) ** (1 / 4) - 1)
    pan.append({"name": nm, "hero": nm == "A사", "vals": v, "chips": [{"label": "연평균 증가(4년)", "value": f"{cagr:+.1f}%".replace("-", "−"), "tone": "warn" if cagr < 0 else None}, {"label": "매출 대비", "value": f"{v[-1] / rev:.1f}배"}]})
bA, bD = BK[0][1], BK[3][1]
c_a = 100 * ((bA[-1] / bA[0]) ** .25 - 1)
c_d = 100 * ((bD[-1] / bD[0]) ** .25 - 1)
add("N125", "cobacklog", "기업별 해마다 수주 잔고 막대", "수주 잔고 5년 추이",
    {"years": YR, "panels": [{"name": p["name"], "vals": p["vals"]} for p in pan]},
    {"eyebrow": eb("기업별 수주 잔고 추이", "연말 수주 잔고, 단위: 조원"),
     "head": f"A사의 수주 잔고는 5년 새 {bA[0]}조원에서 **{bA[-1]}조원으로 연평균 {c_a:.1f}% 증가**해 매출의 {bA[-1] / 48.2:.1f}배에 이르렀고 D사는 **연평균 {abs(c_d):.1f}% 줄어** 일감이 마르는 중임",
     "panels": pan, "years": YR, "unit": "조원", "dec": 1,
     "foot": foot([EX_NOTE, "막대는 네 곳 모두 같은 눈금", "매출 대비 = 2026년 수주 잔고 ÷ 같은 해 매출"], EX_SRC, TODAY)})

# ───────── N126 밸류에이션 산점
VL = [("A사", 28, 22, True), ("B사", 17, 9, False), ("C사", 35, 38, False), ("D사", 12, 4, False), ("E사", 22, 25, False), ("F사", 46, 30, False), ("G사", 15, 18, False), ("H사", 30, 14, False)]
cheap = [v[0] for v in VL if v[2] > v[1]]
items = [{"name": v[0], "x": v[1], "y": v[2], "sub": f"PEG {v[1] / v[2]:.1f}", "hero": v[3], "left": v[2] > v[1]} for v in VL]
add("N126", "coval", "밸류에이션 산점(PER × 이익 성장률, PEG 1 대각선)", "8개사 주가수익비율과 이익 성장률",
    {"items": [{"name": v[0], "per": v[1], "growth": v[2]} for v in VL]},
    {"eyebrow": eb("밸류에이션 vs 이익 성장", "PER(배) · 향후 3년 이익 성장률(%)"),
     "head": f"8개사 중 **{len(cheap)}곳({' · '.join(cheap)})이 성장률이 PER보다 높아 성장 대비 싼 편**이고 A사는 PER 28배 · 성장률 22%로 **PEG 1.3**의 중간 위치임",
     "items": items, "x": {"min": 10, "max": 50, "step": 10, "unit": "배", "title": "주가수익비율(PER, 배)"}, "y": {"min": 0, "max": 40, "step": 10, "unit": "%", "title": "이익 성장률(향후 3년 연평균, %)"},
     "lineLabel": "PEG 1(PER = 성장률)", "zones": {"above": "성장 대비 싼 쪽", "below": "성장 대비 비싼 쪽"},
     "foot": foot([EX_NOTE, "PEG = PER ÷ 이익 성장률", "대각선 위쪽은 성장률이 PER보다 높은 곳"], EX_SRC, TODAY)})

# ───────── N127 기업 연표 + 주가(나스닥 = 실제)
nas = json.loads((S4 / "NASDAQCOM.json").read_text(encoding="utf-8"))["data"]
acc = {}
for d, v in nas:
    if v is not None and "2016-01" <= d[:7] <= "2026-10":
        acc.setdefault(d[:7], []).append(float(v))
labels = sorted(acc)
nm_ = [sum(acc[k]) / len(acc[k]) for k in labels]
nasd = [100 * v / nm_[0] for v in nm_]
EV = [("2017-09", "해외 법인 설립", "2017.09"), ("2019-05", "C사 합병", "2019.05"), ("2021-08", "사업 분할 · 재상장", "2021.08"), ("2023-06", "자사주 소각", "2023.06"), ("2025-03", "D사 인수", "2025.03")]
rng = random.Random(11)
m = len(labels)
lp = math.log(100)
price = []
jump = {labels.index(e[0]): j for e, j in zip(EV, [.08, .10, .12, .07, .06])}
for i in range(m):
    lp += rng.gauss(0, .036) + jump.get(i, 0)
    price.append(lp)
tgt = math.log(nasd[-1] * 1.12)
price = [round(math.exp(p + (tgt - price[-1]) * i / (m - 1)), 1) for i, p in enumerate(price)]
nasd = [round(v, 1) for v in nasd]
add("N127", "cotimeline", "기업 사건 깃발 + 주가 선(비교 지수)", "A사 주요 사건과 주가",
    {"events": [{"at": e[0], "text": e[1]} for e in EV], "nasdaq_last": nasd[-1], "a_last": price[-1]},
    {"eyebrow": eb("A사 연표와 주가 흐름", "월평균, 2016.01 = 100 · A사 주가는 예시 값", True),
     "head": f"2016년 이후 나스닥 종합이 **{nasd[-1] - 100:,.0f}% 올랐고** A사 주가는 합병 · 분할 · 인수를 거치며 **{price[-1] - 100:,.0f}% 올라** 비교 지수를 웃도는 성과임",
     "labels": labels, "series": [{"name": "A사 주가(예시)", "data": price, "color": "main"}, {"name": "나스닥 종합", "data": nasd, "color": "cmp"}], "events": [{"at": e[0], "text": e[1], "sub": e[2]} for e in EV], "base": "2016.01 = 100", "unit": "",
     "foot": foot(["A사 주가는 모양을 보이기 위한 예시 값", "나스닥 종합은 월평균(일 자료를 월 평균)"], "FRED(NASDAQCOM) · A사 주가는 예시 값(공개 통계 아님)", "2026.10")})

# ───────── N128 사업부 트리맵
BU = [("제품 가", 38.0, 21.4), ("제품 나", 26.5, 12.0), ("제품 다", 17.2, 18.5), ("제품 라", 12.8, 6.1), ("제품 마", 9.4, -3.2), ("제품 바", 7.1, 9.8), ("서비스", 6.5, 31.0), ("기타", 3.5, 2.0)]
tv = sum(b[1] for b in BU)
top2 = (BU[0][1] + BU[1][1]) / tv * 100
add("N128", "cotreemap", "사업부 트리맵(이익률 색)", "A사 사업부별 매출 비중과 영업이익률",
    {"units": [{"name": b[0], "value": b[1], "margin": b[2]} for b in BU], "total": round(tv, 1)},
    {"eyebrow": eb("A사 사업부별 매출 구성", "연간 매출 합계 120.5조원, 단위: 조원", True),
     "head": f"제품 가 · 나 두 사업부가 **매출의 {top2:.0f}%**를 차지하고 서비스는 비중 {BU[6][1] / tv * 100:.0f}%에 불과하나 **영업이익률 31.0%로 가장 높으며** 제품 마는 **적자 −3.2%**임".replace("-3.2", "−3.2"),
     "items": [{"name": b[0], "value": b[1], "margin": b[2]} for b in BU], "unit": "조원", "dec": 1, "marginTitle": "영업이익률",
     "foot": foot([EX_NOTE, "칸 넓이는 매출 비중, 색은 영업이익률", "붉은 바탕은 영업적자 사업부"], EX_SRC, TODAY)})

# ───────── N129 고객 의존 파이
CU = [("고객 가", 31, "5년 장기 공급 계약 · 2028년 만료"), ("고객 나", 22, "연간 단가 협상 · 물량 변동 큼"), ("고객 다", 14, "3년 계약 · 2027년 갱신"), ("고객 라", 9, "분기 단위 발주"), ("그 밖", 24, "고객 수백 곳 분산")]
top4 = sum(c[1] for c in CU[:4])
add("N129", "cocust", "고객 의존 파이(큰 조각 떨어짐)", "A사 상위 고객 네 곳의 매출 몫",
    {"customers": [{"name": c[0], "share": c[1]} for c in CU], "top4": top4},
    {"eyebrow": eb("A사 매출의 고객 의존도", "최근 사업연도 매출 기준, 단위: %", True),
     "head": f"상위 고객 4곳이 **매출의 {top4}%**를 차지하고 **고객 가 한 곳이 31%**여서 한 곳의 계약 변동만으로도 연 매출이 크게 흔들리는 구조임",
     "customers": [{"name": c[0], "share": c[1], "sub": c[2]} for c in CU], "hero": 0, "unit": "%",
     "risk": {"text": f"고객 가가 떠나면 매출의 31%가 사라짐 · 상위 4곳 합계 {top4}%", "from": 1},
     "foot": foot([EX_NOTE, "고객 이름은 익명 처리"], EX_SRC, TODAY)})

# ───────── N130 맞대결 거울 막대
MR = [("매출", "조원", 1, 48.2, 39.6, False), ("영업이익률", "%", 1, 19.9, 12.9, False), ("연구개발비 비중", "% 매출 대비", 1, 8.4, 6.1, False), ("부채비율", "% · 낮을수록 좋음", 0, 62, 94, True),
      ("매출 성장률", "% 전년 대비", 1, 12.4, 6.1, False), ("해외 매출 비중", "%", 0, 58, 71, False), ("직원 1인당 매출", "억원", 1, 9.8, 11.2, False)]
wa = sum(1 for r in MR if (r[4] > r[3] if r[5] else r[3] > r[4]) and r[3] != r[4])
add("N130", "comirror", "맞대결 거울 막대(항목별 단위 · 승패 집계)", "A사 vs B사 7개 항목",
    {"rows": [{"label": r[0], "a": r[3], "b": r[4]} for r in MR], "a_wins": wa},
    {"eyebrow": eb("A사 vs B사 항목별 맞대결", "최근 사업연도, 항목마다 단위가 다름"),
     "head": f"A사가 7개 항목 중 **{wa}개에서 우위**로 영업이익률은 19.9% 대 12.9%이고 B사는 **해외 매출 비중 71%와 1인당 매출 11.2억원**에서만 앞서는 구도임",
     "a": {"name": "A사"}, "b": {"name": "B사"}, "rows": [{"label": r[0], "unit": r[1], "dec": r[2], "a": r[3], "b": r[4], "low": r[5]} for r in MR],
     "foot": foot([EX_NOTE, "막대는 항목마다 두 곳 중 큰 값을 기준으로 그림", "부채비율은 낮은 쪽이 우위"], EX_SRC, TODAY)})

# ───────── 쓰기
for o in out:
    sl = o["slide"]
    if not sl["head"].count("**"):
        raise SystemExit("굵게 빠짐 " + o["id"])
vd = ROOT / "library" / "mockups" / "v4"
vd.mkdir(parents=True, exist_ok=True)
for _o in out:  # 결론 띠 없음(SKILL.md 5절) — 장 아래 결론 글은 헤드메시지로
    if isinstance(_o["slide"].get("band"), str):
        _o["slide"].pop("band")
(vd / "F11.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
deck = {"schema": 3, "meta": {"session": "R2", "title": "F11 기업 · 산업 2차 목업"}, "slides": [o["slide"] for o in out]}
(ROOT / "style" / "demo4_r2_F11.json").write_text(json.dumps(deck, ensure_ascii=False, indent=1), encoding="utf-8")
real = sum(1 for o in out if "예시값" not in o["tags"])
print("목업", len(out), "실제", real, "예시", len(out) - real)
for o in out:
    print(o["id"], len(o["slide"]["head"].replace(" ", "").replace("**", "")), o["slide"]["head"])
