# 엔진 3판 도식 부품(k_*.js) 시험 덱 — 숫자는 모두 data/snap/*.json 에서 계산(정책금리 미국 상단 · 회의 날짜는 tools/make_demo3.py 와 같음)
# 실행: python -X utf8 tools/make_demo3_diagrams.py  →  style/demo3_diagrams.json
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SNAP = ROOT / "data" / "snap"


def S(name):
    return dict((k, v) for k, v in json.loads((SNAP / f"{name}.json").read_text(encoding="utf-8"))["data"])


CA, GO, SV, PI, SI = S("ecos_ca"), S("ecos_goods"), S("ecos_serv"), S("ecos_pinc"), S("ecos_sinc")
KR, KC, FX, UC, U10, UN, PAY, GDP = S("ecos_rate"), S("ecos_cpi_yoy"), S("fred_dexkous"), S("fred_cpi_yoy"), S("fred_dgs10"), S("fred_unrate"), S("fred_payems_chg"), S("ecos_gdp_qoq")


def rle(a):
    o = []
    for v, n in a:
        o += [v] * n
    return o


# 미국 연방기금금리 목표 상단(FOMC 결정문, make_demo3.py 와 같음) 2021.01~2026.10
US = dict(zip([f"{2021 + i // 12}.{i % 12 + 1:02d}" for i in range(70)],
              rle([[0.25, 14], [0.5, 2], [1.0, 1], [1.75, 1], [2.5, 2], [3.25, 2], [4.0, 1], [4.5, 2], [4.75, 1], [5.0, 2], [5.25, 2], [5.5, 14], [5.0, 2], [4.75, 1], [4.5, 9], [4.25, 1], [4.0, 2], [3.75, 9], [4.0, 2]])))


def months(a, b):
    y, m = map(int, a.split(".")); out = []
    while f"{y}.{m:02d}" <= b:
        out.append(f"{y}.{m:02d}"); m += 1
        if m > 12:
            y, m = y + 1, 1
    return out


def f1(v, d=1):
    s = f"{abs(v):,.{d}f}"
    return ("−" if v < 0 and float(s.replace(",", "")) != 0 else "") + s


eok = lambda v: round(v / 100, 1)  # 백만 달러 → 억 달러
fx = lambda k: round(FX[k], 1)
real = lambda k: round(KR[k] - KC[k], 2)
M12a, M12b = months("2025.10", "2026.09"), months("2025.11", "2026.10")
fx_hi, fx_lo0, fx_now = fx("2026.06"), fx("2025.09"), fx("2026.10")
fx_chg = (FX["2026.10"] / FX["2026.06"] - 1) * 100
ca9, go9, sv9, pi9, si9 = eok(CA["2026.09"]), eok(GO["2026.09"]), eok(SV["2026.09"]), eok(PI["2026.09"]), eok(SI["2026.09"])
plus9, minus9 = round((GO["2026.09"] + PI["2026.09"]) / 100, 1), round(abs(SV["2026.09"] + SI["2026.09"]) / 100, 1)
plus8 = round((GO["2025.09"] + PI["2025.09"]) / 100, 1)
minus8 = round(abs(SV["2025.09"] + SI["2025.09"]) / 100, 1)
ratio9 = (GO["2026.09"] + PI["2026.09"]) / abs(SV["2026.09"] + SI["2026.09"])
ratio8 = (GO["2025.09"] + PI["2025.09"]) / abs(SV["2025.09"] + SI["2025.09"])
gap_now = US["2026.10"] - KR["2026.10"]
us_real = round(US["2026.09"] - UC["2026.09"], 2)
us_real5 = round(US["2026.05"] - UC["2026.05"], 2)
cpi_rng = [KC[k] for k in months("2026.05", "2026.09")]
neg_run = [k for k in months("2025.11", "2026.10") if real(k) < 0]
sv_neg = sum(1 for k in M12a if SV[k] < 0)
si_neg = sum(1 for k in M12a if SI[k] < 0)
assert sv_neg == 12 and si_neg == 12 and neg_run == months("2026.04", "2026.08"), (sv_neg, si_neg, neg_run)
FOOT = "2026.11.10"


def foot(notes, src):
    return {"notes": notes, "source": src, "asof": FOOT}


slides = []
add = slides.append

# ─── axis ───
add({"kind": "axis", "eyebrow": {"group": "환율", "topic": "원화 가치 변동의 두 방향", "basis": "원/달러 월평균, 단위: 원"},
     "head": f"원/달러 환율은 2025.09 **{f1(fx_lo0)}원**에서 2026.06 {f1(fx_hi)}원으로 올랐다가 10월 **{f1(fx_now)}원**으로 내려, 1년 사이 원화 절하와 절상이 모두 나타남",
     "center": {"title": "원화 가치 변동"},
     "left": {"title": "원화 절상", "def": "원화 가치가 달러 대비 오르는 현상", "sub": "같은 원화로 더 많은 달러 · 수입품을 살 수 있음", "badge": "up"},
     "right": {"title": "원화 절하", "def": "원화 가치가 달러 대비 내리는 현상", "sub": "같은 원화로 살 수 있는 달러 · 수입품이 줄어듦", "badge": "down"},
     "rows": [{"label": "환율 변화", "left": f"1달러 = {f1(fx_hi)}원 → {f1(fx_now)}원", "right": f"1달러 = {f1(fx_lo0)}원 → {f1(fx_hi)}원"},
              {"label": "주요 원인", "left": "경상수지 흑자 확대, 국내 금리 인상", "right": "달러 강세, 외국인 증권 자금 유출"},
              {"label": "수출 기업", "left": "원화 환산 수입 감소, 가격 경쟁력 약화", "right": "원화 환산 수입 증가, 가격 경쟁력 개선"},
              {"label": "수입 물가", "left": "수입품의 원화 가격 하락", "right": "수입품의 원화 가격 상승"}],
     "examples": {"label": "예시",
                  "left": {"lead": "수출 대금 **1만 달러**를 원화로 바꾸면", "items": [{"k": f"2026.06 · 환율 {f1(fx_hi)}원", "v": f"{f1(fx_hi)}만 원"}, {"k": f"2026.10 · 환율 {f1(fx_now)}원", "v": f"{f1(fx_now)}만 원"}],
                           "concl": f"같은 1만 달러의 원화 환산액이 {f1(fx_hi - fx_now)}만 원 줄어듦"},
                  "right": {"lead": "수입 원자재 **1만 달러**어치를 사면", "items": [{"k": f"2025.09 · 환율 {f1(fx_lo0)}원", "v": f"{f1(fx_lo0)}만 원"}, {"k": f"2026.06 · 환율 {f1(fx_hi)}원", "v": f"{f1(fx_hi)}만 원"}],
                            "concl": f"같은 원자재 값이 원화로 {f1(fx_hi - fx_lo0)}만 원 늘어남"}},
     "beats": [{"spot": "left"}],
     "foot": foot(["원화 환산액 = 1만 달러 × 월평균 환율(ECOM 계산)"], "연준 세인트루이스 FRED DEXKOUS(원/달러 월평균)")})
add({"kind": "axis", "eyebrow": {"group": "기준금리", "topic": "한국은행과 연준의 금리 결정 비교", "basis": "2026.10 말 기준, 단위: %, %p"},
     "head": f"한국은행은 **기준금리 {KR['2026.10']:.2f}%**, 연준은 **목표 상단 {US['2026.10']:.2f}%**로 금리차는 {gap_now:.2f}%p이며, 물가를 뺀 실질금리는 각각 {real('2026.10'):.2f}%p · {us_real:.2f}%p로 모두 플러스임",
     "center": {"title": "중앙은행 비교"},
     "left": {"title": "한국은행", "def": "금융통화위원회가 기준금리를 정함", "sub": "목표 : 물가 안정 · 금융 안정", "badge": "BOK"},
     "right": {"title": "미국 연준", "def": "연방공개시장위원회(FOMC)가 정책금리를 정함", "sub": "목표 : 물가 안정 · 최대 고용", "badge": "Fed"},
     "rows": [{"label": "정책금리", "left": f"**{KR['2026.10']:.2f}%** (2026.10 말)", "right": f"**{US['2026.10']:.2f}%** (목표 범위 상단)"},
              {"label": "최근 결정", "left": "2026.07 · 08 각 0.25%p 인상", "right": "2026.09 0.25%p 인상"},
              {"label": "소비자물가", "left": f"{KC['2026.10']:.2f}% (2026.10, 전년동월비)", "right": f"{UC['2026.09']:.2f}% (2026.09, 전년동월비)"},
              {"label": "실질금리", "left": f"+{real('2026.10'):.2f}%p (2026.05 {f1(real('2026.05'), 2)}%p)", "right": f"+{us_real:.2f}%p (2026.05 {f1(us_real5, 2)}%p)"},
              {"label": "다음 회의", "left": "11.26 금융통화위원회", "right": "12.9 FOMC"}],
     "result": {"left": f"실질금리가 2026.05 이후 **{real('2026.10') - real('2026.05'):.2f}%p** 오름", "right": f"실질금리가 2026.05 이후 **{us_real - us_real5:.2f}%p** 오름"},
     "beats": [{"spot": "left"}, {"spot": "right"}],
     "foot": foot(["실질금리 = 정책금리 − 소비자물가 상승률(전년동월비, ECOM 계산)", "미국은 연방기금금리 목표 범위 상단, 물가는 2026.09가 최신"], "한국은행 ECOS(722Y001 · 901Y009), FRED CPIAUCSL, 연준 FOMC 결정문")})

# ─── stairs ───
add({"kind": "stairs", "eyebrow": {"group": "환율", "topic": "원/달러 환율 하락 경로", "basis": "2026.06~10, 월평균 · 월말"},
     "head": f"원/달러 환율은 경상수지 흑자 확대와 한국 기준금리 인상이 겹치며 2026.06 {f1(fx_hi)}원에서 10월 **{f1(fx_now)}원으로 {abs(fx_chg):.1f}% 하락**함",
     "intro": {"title": "환율은 왜 내렸나", "text": "6월 고점 이후 4개월 연속 하락한 원/달러 환율의 배경"},
     "steps": [{"tag": "WHY", "title": "경상수지 흑자 확대", "lines": [f"2026.06 {f1(eok(CA['2026.06']))}억 달러 → 9월 {f1(ca9)}억 달러", "상품수지 흑자가 대부분 차지"]},
               {"tag": "THEN", "title": "외환시장 달러 공급 증가", "lines": ["수출 기업이 받은 달러를 원화로 바꿈"]},
               {"tag": "AND", "title": "한국 기준금리 인상", "lines": ["2026.07 · 08 각 0.25%p, 2.50% → 3.00%", "원화 자산의 금리 매력 상승"]},
               {"tag": "SO", "title": "원/달러 환율 하락(원화 절상)", "lines": [f"{f1(fx_hi)}원(6월) → {f1(fx_now)}원(10월)"]}],
     "stamp": {"label": "2026.10 원/달러", "value": f"{f1(fx_now)}원"},
     "side": {"title": "남은 변수", "text": "미국 금리 인상(2026.09)과 국채 금리 상승은 **달러 강세 요인**임", "sub": f"미국 국채 10년 {U10['2026.10']:.2f}%(2026.10 평균)"},
     "foot": foot(["경상수지는 2026.09가 최신, 환율 · 미국 국채 금리는 월평균"], "한국은행 ECOS(301Y013 · 722Y001), FRED DEXKOUS · DGS10")})
add({"kind": "stairs", "eyebrow": {"group": "물가", "topic": "물가 상승에서 실질금리 회복까지", "basis": "2026.05~10, 단위: %, %p"},
     "head": f"소비자물가 상승률이 2026.05 **{KC['2026.05']:.2f}%**로 기준금리를 넘자 실질금리가 {f1(real('2026.05'), 2)}%p로 내려갔고, 두 차례 인상 뒤 10월 **+{real('2026.10'):.2f}%p로 회복**됨",
     "steps": [{"tag": "물가", "title": "물가 상승률 3%대 진입", "lines": [f"2026.05 {KC['2026.05']:.2f}% · 6월 {KC['2026.06']:.2f}%(전년동월비)"]},
               {"tag": "실질금리", "title": "실질금리 마이너스", "lines": [f"기준금리 2.50% − 물가 {KC['2026.05']:.2f}% = {f1(real('2026.05'), 2)}%p(5월)"]},
               {"tag": "대응", "title": "한국은행 기준금리 인상", "lines": ["2026.07 · 08 각 0.25%p, 2.50% → 3.00%"]},
               {"tag": "결과", "title": "실질금리 플러스 회복", "lines": [f"기준금리 3.00% − 물가 {KC['2026.10']:.2f}% = +{real('2026.10'):.2f}%p(10월)"]}],
     "stamp": {"label": "2026.10 실질금리", "value": f"+{real('2026.10'):.2f}%p"},
     "foot": foot(["실질금리 = 기준금리 − 소비자물가 상승률(전년동월비, ECOM 계산)"], "한국은행 ECOS(722Y001 · 901Y009)")})

# ─── pyramid ───
add({"kind": "pyramid", "eyebrow": {"group": "기준금리", "topic": "금리 체계와 전달 단계", "basis": "2026.10 기준"},
     "head": "한국은행이 정하는 **기준금리(3.00%)**는 단기 시장금리, 장기 시장금리, 대출 · 예금 금리 순서로 전달되며 아래층일수록 영향을 받는 경제 주체가 넓어짐",
     "layers": [{"label": "기준금리", "sub": "3.00%", "desc": "한국은행이 정하는 정책금리", "note": {"title": "2026.07 · 08 인상", "items": ["각 0.25%p, 2.50% → 3.00%"]}},
                {"label": "단기 시장금리", "sub": "콜 · CD · 기업어음", "desc": "기준금리를 바로 따라 움직이는 금리", "note": {"title": "전달이 빠름", "items": ["금융기관 사이 단기 자금 거래"]}},
                {"label": "장기 시장금리", "sub": "국고채 3년 · 10년", "desc": "경기 · 물가 기대와 해외 금리를 함께 반영", "note": {"title": "해외 금리 영향", "items": [f"미국 국채 10년 {U10['2026.10']:.2f}%(2026.10)"]}},
                {"label": "대출 · 예금 금리", "sub": "가계 · 기업", "desc": "가계와 기업이 실제로 부담하거나 받는 금리", "note": {"title": "실물 경제로 전달", "items": ["소비 · 투자 · 저축 결정에 영향"]}}],
     "cycle": {"label": "시장\n기대", "from": 1, "to": 2}, "beats": [{"spot": 2}],
     "foot": foot(["기준금리는 2026.10 말, 미국 국채 금리는 월평균"], "한국은행 ECOS(722Y001), FRED DGS10")})
add({"kind": "pyramid", "eyebrow": {"group": "환율", "topic": "환율을 움직이는 요인의 층", "basis": "2026.10 기준"},
     "head": "원/달러 환율은 **경상수지 · 성장 같은 기초 여건** 위에 금리차와 자본 이동, 시장 심리가 겹쳐 결정되며 위층일수록 변동이 빠르고 짧음",
     "layers": [{"label": "시장 심리", "sub": "수급 · 기대", "desc": "뉴스 · 위험 선호에 따라 매일 바뀌는 단기 요인", "note": {"title": f"원/달러 {f1(fx_now)}원", "items": [f"2026.10 평균, 6월 대비 {abs(fx_chg):.1f}% 하락"]}},
                {"label": "금리차 · 자본 이동", "sub": f"한·미 금리차 {gap_now:.2f}%p", "desc": "금리차와 외국인 증권 투자가 움직이는 중기 요인", "note": {"title": "금리차 축소", "items": ["한국 2026.07 · 08 0.50%p 인상", "미국 2026.09 0.25%p 인상"]}},
                {"label": "기초 여건", "sub": "경상수지 · 성장 · 물가", "desc": "국가 경제의 성장 여력을 나타내는 장기 요인", "note": {"title": f"경상수지 {f1(ca9)}억 달러", "items": [f"2026.09, 2025.09의 {CA['2026.09'] / CA['2025.09']:.1f}배"]}}],
     "foot": foot(["금리차 = 미국 연방기금금리 목표 상단 − 한국 기준금리"], "한국은행 ECOS(301Y013 · 722Y001), FRED DEXKOUS, 연준 FOMC 결정문")})

# ─── balance ───
add({"kind": "balance", "eyebrow": {"group": "물가", "topic": "기준금리와 물가 상승률 비교", "basis": "월말 · 전년동월비, 단위: %"},
     "head": f"2026.05에는 소비자물가({KC['2026.05']:.2f}%)가 기준금리(2.50%)보다 무거웠으나, 두 차례 인상 뒤 10월에는 **기준금리 3.00%가 물가 {KC['2026.10']:.2f}%를 앞섬**",
     "left": {"label": "기준금리", "value": KR["2026.10"], "dec": 2, "unit": "%", "title": "금리 인상 요인", "items": ["물가 상승률이 목표를 웃돌 때 인상", "2026.07 · 08 각 0.25%p 인상", "대출 금리 · 저축 유인에 영향"]},
     "right": {"label": "소비자물가", "value": round(KC["2026.10"], 2), "dec": 2, "unit": "%", "title": "물가 상승 요인", "items": ["환율 상승에 따른 수입 물가", "에너지 · 농산물 가격", "임금 · 서비스 가격"]},
     "from": {"left": {"value": KR["2026.05"]}, "right": {"value": round(KC["2026.05"], 2)}, "period": "2026.05"}, "period": "2026.10",
     "diff": {"label": "실질금리", "dec": 2, "unit": "%p", "sign": True},
     "summary": f"기준금리 − 물가 상승률 = 실질금리 : 2026.05 {f1(real('2026.05'), 2)}%p에서 10월 **+{real('2026.10'):.2f}%p**로 플러스 전환",
     "foot": foot(["실질금리 = 기준금리 − 소비자물가 상승률(전년동월비, ECOM 계산)"], "한국은행 ECOS(722Y001 · 901Y009)")})
add({"kind": "balance", "eyebrow": {"group": "국제수지", "topic": "경상수지 흑자 요인과 적자 요인", "basis": "월간, 단위: 억 달러"},
     "head": f"2026.09 경상수지는 상품 · 본원소득 흑자 **{f1(plus9)}억 달러**가 서비스 · 이전소득 적자 {f1(minus9)}억 달러를 크게 웃돌아 **{f1(ca9)}억 달러 흑자**를 기록함",
     "left": {"label": "흑자 요인", "sub": "상품 + 본원소득", "value": plus9, "dec": 1, "unit": "억 달러", "title": "흑자를 만드는 항목", "items": [{"t": "상품수지", "v": f"{f1(go9)}억 달러", "d": "수출이 수입보다 많음"}, {"t": "본원소득수지", "v": f"{f1(pi9)}억 달러", "d": "해외 투자 배당 · 이자"}]},
     "right": {"label": "적자 요인", "sub": "서비스 + 이전소득", "value": minus9, "dec": 1, "unit": "억 달러", "title": "적자를 만드는 항목", "items": [{"t": "서비스수지", "v": f"{f1(sv9)}억 달러", "d": "여행 · 운송 · 지식재산"}, {"t": "이전소득수지", "v": f"{f1(si9)}억 달러", "d": "대가 없는 해외 송금"}]},
     "period": "2026.09", "diff": {"label": "경상수지", "dec": 1, "unit": "억 달러"},
     "summary": f"흑자 요인이 적자 요인의 **{ratio9:.1f}배** — 1년 전(2025.09)은 {ratio8:.1f}배",
     "beats": [{"left": {"value": plus8}, "right": {"value": minus8}, "period": "2025.09", "note": f"1년 전에는 흑자 요인 {f1(plus8)}억 달러 · 적자 요인 {f1(minus8)}억 달러로 차이가 작았음"}],
     "foot": foot(["흑자 요인 = 상품수지 + 본원소득수지, 적자 요인 = 서비스수지 + 이전소득수지(ECOM 계산)"], "한국은행 ECOS(301Y013)")})

# ─── flow ───
add({"kind": "flow", "eyebrow": {"group": "환율", "topic": "외환스와프 거래 구조", "basis": "개념도"},
     "head": "외환스와프는 거래일에 원화와 달러를 맞바꾸고 만기일에 되돌려 받는 거래로, **현물 시장의 달러 수요를 줄여 환율 변동을 완화**하는 수단으로 쓰임",
     "side": {"title": "외환스와프란?", "rows": [{"k": "정의", "v": "두 통화를 **지금 맞바꾸고 만기에 되돌려** 받기로 하는 계약"}, {"k": "쓰임", "v": "기관 투자자의 달러 조달, 환위험 관리"},
                                               {"k": "효과", "v": "해외 투자에 쓸 달러를 현물 시장에서 사지 않아 **환율 상승 압력이 줄어듦**"}],
              "concl": "외환 당국은 스와프로 달러를 빌려주고\n만기에 돌려받음"},
     "tab": "구조", "time": {"from": "거래일", "to": "만기일"},
     "nodes": [{"id": "a", "label": "기관 투자자", "sub": "연기금 · 보험사", "col": 0, "row": 0}, {"id": "b", "label": "외환 당국", "sub": "스와프 상대방", "col": 0, "row": 1, "tone": "dark"},
               {"id": "c", "label": "해외 자산 매수", "col": 1, "row": 0, "tone": "gray"}, {"id": "d", "label": "해외 자산 매각", "col": 2, "row": 0, "tone": "gray"},
               {"id": "e", "label": "기관 투자자", "sub": "연기금 · 보험사", "col": 3, "row": 0}, {"id": "f", "label": "외환 당국", "sub": "스와프 상대방", "col": 3, "row": 1, "tone": "dark"}],
     "edges": [{"from": "a", "to": "b", "token": "원화", "tone": "cmp"}, {"from": "b", "to": "a", "token": "달러"}, {"from": "a", "to": "c", "token": "달러", "curve": "up"},
               {"from": "d", "to": "e", "token": "달러", "curve": "up"}, {"from": "e", "to": "f", "token": "달러"}, {"from": "f", "to": "e", "token": "원화", "tone": "cmp"}],
     "types": {"title": "종류", "items": [{"name": "외환스와프", "text": "원금만 맞바꾸고 만기에 되돌림 — **단기 달러 조달**"}, {"name": "통화스와프", "text": "원금과 함께 **이자도 주고받음** — 장기 자금 조달 · 중앙은행 간 협정"}]},
     "foot": foot(["개념도, 거래 주체와 통화 방향만 나타냄"], "ECOM 정리")})
add({"kind": "flow", "eyebrow": {"group": "국제수지", "topic": "외국인 증권 투자 자금의 흐름", "basis": "개념도"},
     "head": "외국인 증권 투자 자금은 들어올 때 달러를 원화로, 나갈 때 원화를 달러로 바꾸므로 **유입은 환율 하락 요인, 유출은 환율 상승 요인**으로 작용함",
     "tab": "구조", "time": {"from": "투자 시점", "to": "회수 시점"},
     "nodes": [{"id": "a", "label": "외국인 투자자", "col": 0, "row": 0}, {"id": "b", "label": "외환시장", "sub": "은행", "col": 0, "row": 1, "tone": "dark"},
               {"id": "c", "label": "국내 주식 · 국고채", "sub": "매수", "col": 1, "row": 0, "tone": "gray"}, {"id": "d", "label": "국내 주식 · 국고채", "sub": "매도", "col": 2, "row": 0, "tone": "gray"},
               {"id": "e", "label": "외국인 투자자", "col": 3, "row": 0}, {"id": "f", "label": "외환시장", "sub": "은행", "col": 3, "row": 1, "tone": "dark"}],
     "edges": [{"from": "a", "to": "b", "token": "달러"}, {"from": "b", "to": "a", "token": "원화", "tone": "cmp"}, {"from": "a", "to": "c", "token": "원화", "tone": "cmp", "curve": "up"},
               {"from": "d", "to": "e", "token": "원화", "tone": "cmp", "curve": "up"}, {"from": "e", "to": "f", "token": "원화", "tone": "cmp"}, {"from": "f", "to": "e", "token": "달러"}],
     "types": {"title": "환율 영향", "items": [{"name": "투자 시점", "text": "달러를 팔고 원화를 삼 → **원화 수요 증가, 환율 하락 요인**"}, {"name": "회수 시점", "text": "원화를 팔고 달러를 삼 → **달러 수요 증가, 환율 상승 요인**"}]},
     "foot": foot(["개념도, 거래 주체와 통화 방향만 나타냄"], "ECOM 정리")})

# ─── ladder ───
add({"kind": "ladder", "eyebrow": {"group": "기준금리", "topic": "2026년 하반기 기준금리 인상 조건 점검", "basis": "2026.05~10 지표"},
     "head": "물가 상승률 3%대 진입, 성장 흐름 유지, 원화 약세 부담이라는 세 조건이 모두 충족되며 한국은행은 2026.07 · 08 **기준금리를 3.00%로 인상**함",
     "goal": {"title": "기준금리 인상", "sub": "2026.07 · 08, 2.50% → 3.00%"},
     "steps": [{"title": "물가 상승률 목표 상회", "sub": f"2026.05 {KC['2026.05']:.2f}% · 6월 {KC['2026.06']:.2f}%", "met": True},
               {"title": "성장 흐름 유지", "sub": f"GDP 2026.Q1 {GDP['2026.Q1']:.1f}% · Q2 {GDP['2026.Q2']:.1f}%(전기비)", "met": True},
               {"title": "원화 약세 부담", "sub": f"원/달러 2026.06 {f1(fx_hi)}원(12개월 최고)", "met": True}],
     "factors": {"title": "통화정책 판단 요소", "lead": "세 조건 충족 → 두 차례 연속 인상",
                 "center": {"title": "금리 결정", "text": "금융통화위원회가 물가 · 성장 · 금융 안정을 함께 판단"},
                 "groups": [{"title": "정량 요소", "sub": "지표로 확인", "items": [{"t": "소비자물가", "d": f"2026.10 {KC['2026.10']:.2f}%(5~9월 {min(cpi_rng):.2f}~{max(cpi_rng):.2f}%)"},
                                                                      {"t": "실질 GDP", "d": f"2026.Q3 {GDP['2026.Q3']:.1f}% 성장(전기비)"}, {"t": "원/달러 환율", "d": f"2026.10 {f1(fx_now)}원, 6월 대비 {abs(fx_chg):.1f}% 하락"}]},
                            {"title": "정성 요소", "sub": "판단이 필요한 부분", "tone": "cmp", "items": [{"t": "미국 통화정책", "d": "2026.09 연준 0.25%p 인상"}, {"t": "금융 안정", "d": "가계부채 · 부동산 시장 흐름"}]}]},
     "foot": foot(["물가는 전년동월비, GDP는 전기비"], "한국은행 ECOS(722Y001 · 901Y009 · 200Y102), FRED DEXKOUS")})
add({"kind": "ladder", "eyebrow": {"group": "기준금리", "topic": "연준 금리 인하 조건 점검", "basis": "2026.09~10 지표"},
     "head": "연준의 금리 인하 조건인 고용 둔화 · 물가 안정 · 생산 둔화가 모두 충족되지 않아, 연준은 2026.09 오히려 **0.25%p 인상**을 택함",
     "goal": {"title": "연준 금리 인하", "sub": f"현재 목표 상단 {US['2026.10']:.2f}%"},
     "steps": [{"title": "고용 둔화", "sub": f"실업률 {UN['2026.10']:.1f}% · 고용 +{PAY['2026.10'] / 10:.1f}만 명(2026.10)", "met": False},
               {"title": "물가 안정", "sub": f"소비자물가 {UC['2026.09']:.2f}%(2026.09)", "met": False},
               {"title": "생산 둔화", "sub": "산업생산 12개월 최고(2026.09)", "met": False}],
     "factors": {"title": "연준 판단 요소", "lead": "세 조건 미충족 → 2026.09 인상, 10월 동결",
                 "center": {"title": "FOMC 결정", "text": "물가 안정과 최대 고용, 두 목표를 함께 판단"},
                 "groups": [{"title": "물가 지표", "items": [{"t": f"소비자물가 {UC['2026.09']:.2f}%", "d": f"2026.09, 2026.05 {UC['2026.05']:.2f}%에서 둔화"}]},
                            {"title": "고용 · 생산 지표", "tone": "cmp", "items": [{"t": f"실업률 {UN['2026.10']:.1f}%", "d": "2026.10, 4%대 초반 유지"},
                                                                                {"t": f"비농업 고용 +{PAY['2026.10'] / 10:.1f}만 명", "d": f"2026.10, 7월 {f1(PAY['2026.07'] / 10)}만 명 뒤 회복"}]}]},
     "foot": foot(["물가는 전년동월비, 고용은 전월 대비 증감"], "FRED CPIAUCSL · UNRATE · PAYEMS · INDPRO, 연준 FOMC 결정문")})

# ─── cycle ───
add({"kind": "cycle", "eyebrow": {"group": "환율", "topic": "환율 · 물가 · 금리의 순환", "basis": "2025.09~2026.10"},
     "head": f"원/달러 환율 상승이 수입 물가를 거쳐 소비자물가를 3%대로 밀어 올렸고, 기준금리 인상 뒤 환율이 **{f1(fx_now)}원으로 내려 순환이 한 바퀴 이어짐**",
     "center": {"title": "환율 · 물가 · 금리", "sub": "2025.09~2026.10"},
     "steps": [{"title": "원/달러 환율 상승", "text": f"2025.09 {f1(fx_lo0)}원 → 2026.06 {f1(fx_hi)}원", "value": f"+{(FX['2026.06'] / FX['2025.09'] - 1) * 100:.1f}%"},
               {"title": "소비자물가 상승", "text": "수입 물가 상승이 소비자 가격으로 전가", "value": f"2026.06 {KC['2026.06']:.2f}%"},
               {"title": "기준금리 인상", "text": "2026.07 · 08 각 0.25%p, 2.50% → 3.00%", "value": "+0.50%p"},
               {"title": "원화 강세 · 환율 하락", "text": "금리 매력 상승과 경상수지 흑자", "value": f"2026.10 {f1(fx_now)}원"}],
     "foot": foot(["환율은 월평균, 물가는 전년동월비"], "한국은행 ECOS(722Y001 · 901Y009), FRED DEXKOUS")})
add({"kind": "cycle", "eyebrow": {"group": "기준금리", "topic": "경기 순환과 통화정책", "basis": "개념도"},
     "head": "통화정책은 경기 확장기에 물가가 오르면 금리를 올리고, 수요가 둔화해 물가가 안정되면 **금리를 내려 다시 경기를 받치는 순환**을 따름",
     "center": {"title": "통화정책 순환", "sub": "경기 · 물가 · 금리"},
     "steps": [{"title": "경기 확장", "text": "소비 · 투자 · 고용 증가"}, {"title": "물가 상승", "text": "수요가 공급을 앞서며 가격 상승"}, {"title": "금리 인상", "text": "중앙은행이 수요 과열을 억제"},
               {"title": "수요 둔화", "text": "대출 · 소비 · 투자 감소"}, {"title": "물가 안정", "text": "물가 상승률이 목표 수준으로 하락"}, {"title": "금리 인하", "text": "경기 하강을 막기 위한 완화"}],
     "beats": [{"spot": 2}, {"spot": 5}],
     "foot": foot(["개념도, 실제 국면 길이는 경기마다 다름"], "ECOM 정리")})

# ─── columns ───
add({"kind": "columns", "eyebrow": {"group": "국제수지", "topic": "경상수지 4개 구성 항목", "basis": "2026.09, 단위: 억 달러"},
     "head": f"2026.09 경상수지 **{f1(ca9)}억 달러** 흑자는 상품수지({f1(go9)}억 달러)가 이끌었으며, 서비스 · 이전소득수지 적자를 본원소득수지 흑자가 일부 메움",
     "cols": [{"title": "상품수지", "sub": "수출 − 수입", "value": {"v": go9, "dec": 1, "unit": "억 달러", "label": "2026.09"}, "hi": True, "chart": {"type": "bars", "data": [eok(GO[k]) for k in M12a], "first": "25.10", "last": "26.09", "dec": 1, "unit": "억 달러", "title": "최근 12개월"},
               "points": [f"경상수지 흑자의 **{GO['2026.09'] / CA['2026.09'] * 100:.1f}%**", f"2025.09 {f1(eok(GO['2025.09']))}억 달러의 {GO['2026.09'] / GO['2025.09']:.1f}배"]},
              {"title": "서비스수지", "sub": "여행 · 운송 · 지식재산", "value": {"v": sv9, "dec": 1, "unit": "억 달러", "label": "2026.09"}, "chart": {"type": "bars", "data": [eok(SV[k]) for k in M12a], "first": "25.10", "last": "26.09", "dec": 1, "unit": "억 달러", "title": "최근 12개월"},
               "points": [f"{sv_neg}개월 연속 적자", f"2025.09 {f1(eok(SV['2025.09']))}억 달러와 비슷한 수준"]},
              {"title": "본원소득수지", "sub": "배당 · 이자 · 임금", "value": {"v": pi9, "dec": 1, "unit": "억 달러", "label": "2026.09"}, "chart": {"type": "bars", "data": [eok(PI[k]) for k in M12a], "first": "25.10", "last": "26.09", "dec": 1, "unit": "억 달러", "title": "최근 12개월"},
               "points": ["해외 투자에서 받은 배당 · 이자", f"2026.04 {f1(eok(PI['2026.04']))}억 달러 뒤 흑자 회복"]},
              {"title": "이전소득수지", "sub": "대가 없는 송금", "value": {"v": si9, "dec": 1, "unit": "억 달러", "label": "2026.09"}, "chart": {"type": "bars", "data": [eok(SI[k]) for k in M12a], "first": "25.10", "last": "26.09", "dec": 1, "unit": "억 달러", "title": "최근 12개월"},
               "points": ["해외 송금 · 국제 원조", f"{si_neg}개월 연속 적자"]}],
     "summary": f"상품수지가 **경상수지 흑자보다 커서** 나머지 세 항목의 합({f1(round(sv9 + pi9 + si9, 1))}억 달러)은 영향이 작음",
     "foot": foot(["경상수지 = 상품 + 서비스 + 본원소득 + 이전소득, 비율 · 배수는 ECOM 계산"], "한국은행 ECOS(301Y013)")})
add({"kind": "columns", "eyebrow": {"group": "기준금리", "topic": "기준금리가 물가에 닿는 네 경로", "basis": "개념도 · 2026.10 기준"},
     "head": "기준금리 변경은 **금리 · 환율 · 자산 가격 · 기대**의 네 경로를 거쳐 소비와 투자를 바꾸고, 시차를 두고 물가 상승률에 반영됨",
     "top": {"title": "물가 안정", "sub": f"2026.10 소비자물가 상승률 {KC['2026.10']:.2f}%"},
     "cols": [{"title": "금리 경로", "sub": "대출 · 예금 금리", "points": ["대출 이자 부담이 커져 소비 · 투자 감소", "예금 금리 상승으로 저축 유인 증가"], "note": f"기준금리 {KR['2026.10']:.2f}%(2026.10 말)"},
              {"title": "환율 경로", "sub": "원화 가치", "points": ["금리차가 줄면 원화 강세", "수입 물가 하락으로 물가 압력 완화"], "note": f"원/달러 {f1(fx_now)}원(2026.10 평균)"},
              {"title": "자산 가격 경로", "sub": "주식 · 부동산", "points": ["할인율 상승으로 자산 가격 하락", "자산 효과 축소로 소비 둔화"], "note": "주가 · 주택 가격 흐름"},
              {"title": "기대 경로", "sub": "물가 기대", "points": ["중앙은행의 물가 안정 의지 전달", "임금 · 가격 결정에 반영"], "note": "기대 인플레이션 · 임금 협상"}],
     "summary": "2026.07 · 08 인상(0.50%p) 효과는 **네 경로를 거쳐 시차를 두고** 물가에 반영됨",
     "foot": foot(["개념도, 경로별 크기와 시차는 경제 여건에 따라 다름"], "한국은행 ECOS(722Y001 · 901Y009), ECOM 정리")})

# ─── tree ───
add({"kind": "tree", "eyebrow": {"group": "환율", "topic": "원/달러 환율 결정 요인", "basis": "2026.10 기준"},
     "head": f"원/달러 환율(2026.10 **{f1(fx_now)}원**)은 달러 공급 · 달러 수요 · 가격 요인으로 나눠 볼 수 있으며, 최근에는 경상수지 흑자에 따른 **달러 공급**이 컸음",
     "root": {"title": "원/달러 환율", "value": f"{f1(fx_now)}원", "sub": "2026.10 평균"},
     "branches": [{"title": "달러 공급 요인", "sub": "원화 강세 방향", "leaves": [{"title": "경상수지 흑자", "text": "수출 기업의 달러 환전", "value": f"{f1(ca9)}억 달러"}, {"title": "외국인 증권 투자 유입", "text": "주식 · 국고채 매수 자금"}]},
                  {"title": "달러 수요 요인", "sub": "원화 약세 방향", "leaves": [{"title": "내국인 해외 투자", "text": "연기금 · 개인의 해외 주식 · 채권 매수"}, {"title": "수입 대금 결제", "text": "원자재 · 에너지 수입"}]},
                  {"title": "가격 요인", "sub": "금리 · 해외 시장", "leaves": [{"title": "한·미 금리차", "text": f"미국 {US['2026.10']:.2f}% − 한국 {KR['2026.10']:.2f}%", "value": f"{gap_now:.2f}%p"},
                                                                       {"title": "미국 국채 금리", "text": "10년물, 2026.10 평균", "value": f"{U10['2026.10']:.2f}%"}]}],
     "beats": [{"spot": 0}],
     "foot": foot(["경상수지는 2026.09, 금리차는 2026.10 말 정책금리 기준"], "한국은행 ECOS(301Y013 · 722Y001), FRED DEXKOUS · DGS10, 연준 FOMC 결정문")})
add({"kind": "tree", "eyebrow": {"group": "물가", "topic": "소비자물가 상승 요인 분해", "basis": "2026.10 기준, 전년동월비"},
     "head": f"2026.10 소비자물가 상승률 **{KC['2026.10']:.2f}%**는 수요 · 공급 · 대외 요인이 함께 작용한 결과이며, 원/달러 환율 하락은 수입 물가를 낮추는 **하락 요인**으로 작용함",
     "root": {"title": "소비자물가 상승률", "value": f"{KC['2026.10']:.2f}%", "sub": "2026.10, 전년동월비"},
     "branches": [{"title": "수요 요인", "sub": "국내 소비 · 소득", "leaves": [{"title": "소비 회복", "text": f"GDP 2026.Q3 {GDP['2026.Q3']:.1f}% 성장(전기비)"}, {"title": "임금 상승", "text": "서비스 가격으로 전가"}]},
                  {"title": "공급 요인", "sub": "원가 · 작황", "leaves": [{"title": "에너지 가격", "text": "국제 유가 · 전기 · 가스 요금"}, {"title": "농산물 가격", "text": "기상 여건에 따른 변동"}]},
                  {"title": "대외 요인", "sub": "환율 · 해외 물가", "leaves": [{"title": "원/달러 환율", "text": f"6월 대비 {abs(fx_chg):.1f}% 하락, 수입 물가 하락 요인", "value": f"{f1(fx_now)}원"},
                                                                         {"title": "미국 물가", "text": "2026.09, 전년동월비", "value": f"{UC['2026.09']:.2f}%"}]}],
     "beats": [{"spot": 2}],
     "foot": foot(["요인 구분은 개념 정리, 기여도 계산 아님"], "한국은행 ECOS(901Y009 · 200Y102), FRED DEXKOUS · CPIAUCSL")})


# ─── calendar ───
def marks(series, mm, year, nxt=None, dates=None):
    out = []
    for m in mm:
        k = f"{year}.{m + 1:02d}"
        pk = f"{year - 1}.12" if m == 0 else f"{year}.{m:02d}"
        d = round(series[k] - series[pk], 2)
        q = {"m": m, "kind": "up" if d > 0 else "down" if d < 0 else "hold", "res": "인상" if d > 0 else "인하" if d < 0 else "동결"}
        if d:
            q["size"] = f"{abs(d):.2f}%p"
        q["rate"] = f"{series[k]:.2f}%"
        if dates and m in dates:
            q["date"] = dates[m]
        out.append(q)
    if nxt:
        out.append({"m": nxt[0], "kind": "next", "res": "예정", "date": nxt[1]})
    return out


def tally(mk):
    c = {"인상": 0, "인하": 0, "동결": 0}
    for q in mk:
        if q["kind"] != "next":
            c[q["res"]] += 1
    return " · ".join(f"{k} {v}" for k, v in c.items() if v)


k26 = marks(KR, [0, 1, 3, 4, 6, 7, 9], 2026, (10, "11.26"), {9: "10.22"})
u26 = marks(US, [0, 2, 3, 5, 6, 8, 9], 2026, (11, "12.9"), {8: "9.16", 9: "10.28"})
k25 = marks(KR, [0, 1, 3, 4, 6, 7, 9, 10], 2025)
u25 = marks(US, [0, 2, 4, 5, 6, 8, 9, 11], 2025)
add({"kind": "calendar", "eyebrow": {"group": "기준금리", "topic": "2026년 한·미 금리 결정 일정", "basis": "회의 결과, 단위: %p"},
     "head": "2026년 한국은행은 7 · 8월 **두 차례 인상**, 연준은 9월 **한 차례 인상**했으며, 남은 회의는 11.26 금통위와 12.9 FOMC임",
     "year": "2026년", "rows": [{"name": "한국 금통위", "sub": "기준금리", "sum": tally(k26), "tone": "main", "marks": k26}, {"name": "미국 FOMC", "sub": "목표 범위 상단", "sum": tally(u26), "tone": "cmp", "marks": u26}],
     "now": {"m": 10, "f": 0.35, "label": "오늘 11.11"},
     "foot": foot(["결과는 월말 정책금리 변화로 확인, 날짜는 보도 기준"], "한국은행 ECOS(722Y001), 연준 FOMC 결정문")})
add({"kind": "calendar", "eyebrow": {"group": "기준금리", "topic": "2025년 한·미 금리 결정 결과", "basis": "회의 결과, 단위: %p"},
     "head": f"2025년 한국은행은 2 · 5월 **두 차례 인하**, 연준은 9 · 10 · 12월 **세 차례 인하**해 한·미 금리차는 연초 {US['2025.01'] - KR['2025.01']:.2f}%p에서 연말 {US['2025.12'] - KR['2025.12']:.2f}%p로 축소됨",
     "year": "2025년", "rows": [{"name": "한국 금통위", "sub": "기준금리", "sum": tally(k25), "tone": "main", "marks": k25}, {"name": "미국 FOMC", "sub": "목표 범위 상단", "sum": tally(u25), "tone": "cmp", "marks": u25}],
     "legendNote": f"한·미 금리차 {US['2025.01'] - KR['2025.01']:.2f}%p(1월) → {US['2025.12'] - KR['2025.12']:.2f}%p(12월)",
     "foot": foot(["결과는 월말 정책금리 변화로 확인, 미국은 목표 범위 상단"], "한국은행 ECOS(722Y001), 연준 FOMC 결정문")})

# ─── discuss ───
add({"kind": "discuss", "eyebrow": {"group": "토의", "topic": "환율 세션 토의 주제"},
     "head": "지금까지 다룬 원화 가치 변동, 환율 하락 경로, 환율 결정 요인을 바탕으로 원/달러 환율의 다음 방향과 투자 판단을 토의함",
     "left": {"title": "주요 논의사항", "items": [{"title": "원화 가치 변동", "text": f"1년 사이 {f1(fx_lo0)}원 → {f1(fx_hi)}원 → {f1(fx_now)}원으로 절하와 절상이 모두 나타남"},
                                             {"title": "환율 하락 경로", "text": f"경상수지 흑자 확대와 기준금리 인상이 겹쳐 6월 대비 {abs(fx_chg):.1f}% 하락"},
                                             {"title": "환율 결정 요인", "text": "달러 공급 · 달러 수요 · 금리차 같은 가격 요인으로 나눠 봄"},
                                             {"title": "외환스와프", "text": "현물 시장의 달러 수요를 줄여 환율 변동을 완화하는 수단"}]},
     "right": {"title": "토의 주제", "topics": [{"title": "원/달러 환율의 다음 방향", "q": f"미국 국채 10년 금리가 {U10['2026.10']:.2f}%로 오른 가운데, 원화 강세 흐름은 이어질 것인가?"},
                                            {"title": "환율 변동과 투자 판단", "q": "해외 자산에 투자할 때 환율 변동은 어떤 방식으로 고려해야 할까?"}]},
     "foot": foot([], "FRED DEXKOUS · DGS10, ECOM 정리")})
add({"kind": "discuss", "eyebrow": {"group": "토의", "topic": "물가 · 금리 세션 토의 주제"},
     "head": "물가 상승률 3%대 진입, 실질금리 마이너스, 두 차례 금리 인상과 실질금리 회복까지의 흐름을 바탕으로 세 가지 주제를 토의함",
     "left": {"title": "주요 논의사항", "items": [{"title": "물가와 기준금리", "text": f"2026.05 물가 {KC['2026.05']:.2f}%가 기준금리 2.50%를 넘어 실질금리 {f1(real('2026.05'), 2)}%p"},
                                             {"title": "두 차례 금리 인상", "text": "2026.07 · 08 각 0.25%p 인상으로 기준금리 3.00%"},
                                             {"title": "실질금리 회복", "text": f"2026.10 물가 {KC['2026.10']:.2f}%로 실질금리 +{real('2026.10'):.2f}%p"}]},
     "right": {"title": "토의 주제", "topics": [{"title": "추가 인상 필요성", "q": "실질금리가 플러스로 돌아선 지금, 추가 인상이 필요한가?"},
                                            {"title": "물가 둔화의 지속성", "q": "환율 하락에 따른 물가 둔화는 이어질 것인가?"},
                                            {"title": "연말 한·미 금리차", "q": "11.26 금통위와 12.9 FOMC 뒤 금리차는 어떻게 될까?"}]},
     "foot": foot([], "한국은행 ECOS(722Y001 · 901Y009), ECOM 정리")})

# ─── further ───
add({"kind": "further", "eyebrow": {"group": "참고", "topic": "추후 분석 · 논의 가능 범위"},
     "head": "환율 · 금리 세션의 후속으로 아시아 통화 비교, 외국인 자금 흐름, 실질금리 국제 비교, 국고채 금리 전달 등 네 가지 분석을 진행할 수 있음",
     "caption": "추가 분석 과제", "tag": "예시",
     "groups": [{"name": "환율", "items": [{"title": "원화 · 엔화 · 위안화 비교", "text": "주요 아시아 통화의 달러 대비 움직임을 비교해 원화의 특징을 분석"},
                                         {"title": "외국인 증권 자금과 환율", "text": "외국인 주식 · 채권 순매수와 원/달러 환율의 관계를 월별로 확인"}]},
                {"name": "금리", "items": [{"title": "실질금리 국제 비교", "text": "한국 · 미국 · 유럽의 실질금리 추이를 같은 기준으로 계산해 비교"},
                                         {"title": "기준금리와 국고채 금리", "text": "기준금리 변경이 국고채 3년 · 10년 금리에 닿는 시차를 분석"}]}],
     "foot": foot([], "ECOM 정리")})
add({"kind": "further", "eyebrow": {"group": "참고", "topic": "국제수지 후속 분석 범위"},
     "head": "국제수지 세션의 후속으로 상품수지 품목 분석, 서비스수지 적자 구조, 본원소득 흐름, 금융계정 연결 등 다섯 가지 과제를 정리함",
     "caption": "국제수지 추가 분석 과제", "tag": "예시",
     "groups": [{"name": "경상수지", "items": [{"title": "상품수지 품목별 분석", "text": "반도체 · 자동차 등 주력 품목의 수출 흐름과 상품수지의 관계"},
                                           {"title": "서비스수지 적자 구조", "text": "여행 · 운송 · 지식재산 항목별 적자 원인 정리"}]},
                {"name": "소득 수지", "items": [{"title": "본원소득 흐름", "text": "해외 투자 배당 · 이자 수입이 늘어나는 배경과 계절성"}]},
                {"name": "금융계정", "items": [{"title": "경상수지와 금융계정", "text": "경상수지 흑자가 해외 투자로 다시 나가는 구조"},
                                           {"title": "외환보유액 변화", "text": "경상수지 · 외환시장 개입과 외환보유액의 관계"}]}],
     "foot": foot([], "ECOM 정리")})

# ─── statement ───
add({"kind": "statement", "eyebrow": {"group": "국제수지", "topic": "경상수지 흑자의 원천", "basis": "2026.09, 단위: 억 달러"},
     "head": f"2026.09 경상수지 {f1(ca9)}억 달러 흑자 가운데 **상품수지가 {f1(go9)}억 달러**로 전체를 웃돌며, 서비스수지는 {f1(abs(sv9))}억 달러 적자를 이어감",
     "text": f"경상수지 흑자의 원천은 **상품수지**이며,\n서비스수지 적자는 {sv_neg}개월째 이어짐", "sub": f"2026.09 상품수지는 경상수지의 {GO['2026.09'] / CA['2026.09'] * 100:.1f}%",
     "evidence": [{"label": "경상수지", "note": "2026.09", "value": ca9, "dec": 1, "unit": "억 달러", "chart": {"type": "bars", "data": [eok(CA[k]) for k in M12a], "first": "25.10", "last": "26.09", "dec": 1, "unit": "억 달러"}, "source": "한국은행 ECOS 301Y013 · 월간"},
                  {"label": "상품수지", "note": "2026.09", "value": go9, "dec": 1, "unit": "억 달러", "chart": {"type": "spark", "data": [eok(GO[k]) for k in M12a], "first": "25.10", "last": "26.09", "dec": 1, "unit": "억 달러"}, "source": "한국은행 ECOS 301Y013 · 월간"},
                  {"label": "서비스수지", "note": "2026.09", "value": sv9, "dec": 1, "unit": "억 달러", "chart": {"type": "bars", "data": [eok(SV[k]) for k in M12a], "first": "25.10", "last": "26.09", "dec": 1, "unit": "억 달러"}, "source": "한국은행 ECOS 301Y013 · 월간"}],
     "foot": foot(["차트는 2025.10~2026.09 월간 값"], "한국은행 ECOS(301Y013)")})
add({"kind": "statement", "eyebrow": {"group": "물가", "topic": "실질금리 플러스 전환", "basis": "2026.10, 단위: %, %p"},
     "head": f"한국 실질금리는 2026.04~08 다섯 달 마이너스였다가 두 차례 금리 인상 뒤 9월 플러스로 돌아섰고, 10월 **+{real('2026.10'):.2f}%p**로 폭이 커짐",
     "text": "한국 실질금리는 **다섯 달 마이너스 뒤 플러스로 전환**되어\n기준금리가 물가 상승률을 다시 앞섬", "sub": "실질금리 = 기준금리 − 소비자물가 상승률(전년동월비)",
     "evidence": [{"label": "기준금리", "note": "2026.10 말", "value": KR["2026.10"], "dec": 2, "unit": "%", "chart": {"type": "step", "data": [KR[k] for k in M12b], "first": "25.11", "last": "26.10", "dec": 2, "unit": "%"}, "source": "한국은행 ECOS 722Y001 · 월말"},
                  {"label": "소비자물가 상승률", "note": "2026.10", "value": round(KC["2026.10"], 2), "dec": 2, "unit": "%", "chart": {"type": "spark", "data": [round(KC[k], 2) for k in M12b], "first": "25.11", "last": "26.10", "dec": 2, "unit": "%"}, "source": "통계청 · ECOS 901Y009 · 전년동월비"},
                  {"label": "실질금리", "note": "2026.10", "value": real("2026.10"), "dec": 2, "unit": "%p", "sign": True, "chart": {"type": "bars", "data": [real(k) for k in M12b], "first": "25.11", "last": "26.10", "dec": 2, "unit": "%p", "sign": True}, "source": "ECOM 계산"}],
     "foot": foot(["실질금리는 ECOM 계산, 차트는 2025.11~2026.10"], "한국은행 ECOS(722Y001 · 901Y009)")})

# ─── term ───
add({"kind": "term", "eyebrow": {"group": "용어", "topic": "경상수지", "basis": "국제수지 기본 용어"},
     "head": f"경상수지는 한 나라가 외국과 상품 · 서비스를 사고팔고 소득을 주고받은 결과를 모은 지표로, 2026.09 **{f1(ca9)}억 달러 흑자**를 기록함",
     "tag": "용어", "term": "경상수지", "en": "Current Account", "def": "일정 기간 한 나라가 외국과 **상품 · 서비스를 거래하고 소득을 주고받은 결과**를 합한 수지",
     "props": [{"title": "네 항목의 합", "text": "상품수지 + 서비스수지 + 본원소득수지 + 이전소득수지"}, {"title": "흑자의 뜻", "text": "외국에서 벌어들인 돈이 내보낸 돈보다 많음 — 달러 공급 증가 요인"},
               {"title": "환율과의 연결", "text": "흑자 확대 → 외환시장 달러 공급 증가 → 원화 강세 요인"}],
     "num": {"label": "경상수지", "note": "2026.09", "value": ca9, "dec": 1, "unit": "억 달러", "chart": {"type": "bars", "data": [eok(CA[k]) for k in M12a], "first": "25.10", "last": "26.09", "dec": 1, "unit": "억 달러"}, "source": "한국은행 ECOS 301Y013 · 월간"},
     "related": ["상품수지", "서비스수지", "본원소득수지", "이전소득수지", "금융계정"],
     "foot": foot(["차트는 2025.10~2026.09 월간 값"], "한국은행 ECOS(301Y013)")})
add({"kind": "term", "eyebrow": {"group": "용어", "topic": "원/달러 환율", "basis": "환율 기본 용어"},
     "head": f"원/달러 환율은 1달러를 사는 데 필요한 원화 금액으로 숫자가 오르면 원화 가치가 내린 것이며, 2026.10 평균은 **{f1(fx_now)}원**임",
     "tag": "용어", "term": "원/달러 환율", "en": "KRW/USD Exchange Rate", "def": "**1달러를 사는 데 필요한 원화 금액** — 숫자가 오르면 원화 절하, 내리면 원화 절상",
     "props": [{"title": "표시 방법", "text": "외국 통화 1단위의 값을 자국 통화로 나타내는 직접 표시 방식"}, {"title": "결정 방식", "text": "외환시장에서 달러 수요와 공급이 만나는 지점에서 결정"},
               {"title": "경제 영향", "text": "수출 가격 경쟁력 · 수입 물가 · 외국인 자금 흐름에 영향"}],
     "num": {"label": "원/달러 환율", "note": "2026.10 평균", "value": fx_now, "dec": 1, "unit": "원", "chart": {"type": "spark", "data": [fx(k) for k in M12b], "first": "25.11", "last": "26.10", "dec": 1, "unit": "원"}, "source": "FRED DEXKOUS · 월평균"},
     "related": ["원화 절상", "원화 절하", "외환스와프", "경상수지", "달러 인덱스"],
     "foot": foot(["차트는 2025.11~2026.10 월평균"], "연준 세인트루이스 FRED DEXKOUS")})

# 점검 : 헤드메시지 글자 수(띄어쓰기 · ** 뺀) 50~90
bad = []
for i, s in enumerate(slides, 1):
    n = len(re.sub(r"\s|\*\*", "", s["head"]))
    if not 50 <= n <= 90:
        bad.append((i, s["kind"], n))
deck = {"schema": 3, "meta": {"session": "DEMO3K", "title": "도식 부품 시험", "date": "2026.11.24", "series": "경제지표101", "cover": "A", "combo": "A"}, "slides": slides}
(ROOT / "style" / "demo3_diagrams.json").write_text(json.dumps(deck, ensure_ascii=False, indent=1), encoding="utf-8")
print("slides", len(slides), "head out of 50~90:", bad)
