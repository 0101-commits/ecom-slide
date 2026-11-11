# 엔진 3판 차트 부품(j_*.js) 시험 덱 — data/snap/*.json 숫자만 써서 style/demo3_charts.json 을 만든다(지어낸 숫자 없음, 합 · 평균 · 증감은 ECOM 계산)
# 실행: python -X utf8 tools/make_demo3_charts.py
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SNAP = ROOT / "data" / "snap"
ASOF = "2026.11.10"


def ser(name):
    return dict(json.loads((SNAP / f"{name}.json").read_text(encoding="utf-8"))["data"])


def months(a, b):
    y, m = map(int, a.split(".")); y2, m2 = map(int, b.split(".")); out = []
    while (y, m) <= (y2, m2):
        out.append(f"{y}.{m:02d}"); m += 1
        if m > 12:
            y, m = y + 1, 1
    return out


def r(v, d=1):
    return None if v is None else round(v + 0.0, d)


def f(v, d=1, sign=False):
    s = f"{abs(v):,.{d}f}"
    if v < 0 and float(s.replace(",", "")) != 0:
        return "−" + s
    return ("+" + s) if sign and v > 0 else s


def cum(a):
    o, t = [], 0.0
    for v in a:
        t = round(t + v, 6); o.append(t)
    return o


# 자료 — 국제수지는 백만 달러 → 억 달러(÷100), 고용은 천 명 → 만 명(÷10)
CA, GD, SV, PI, SI = [{k: v / 100 for k, v in ser(n).items()} for n in ["ecos_ca", "ecos_goods", "ecos_serv", "ecos_pinc", "ecos_sinc"]]
PAY = {k: v / 10 for k, v in ser("fred_payems_chg").items()}
UN, KCPI, UCPI, RATE, FF, D2, D10, FX, IP = [ser(n) for n in ["fred_unrate", "ecos_cpi_yoy", "fred_cpi_yoy", "ecos_rate", "fred_fedfunds", "fred_dgs2", "fred_dgs10", "fred_dexkous", "fred_indpro"]]
S_BOP = "한국은행 ECOS(301Y013 국제수지)"
S_KCPI = "통계청 · 한국은행 ECOS(901Y009)"
S_PAY = "미 노동통계국 · FRED(PAYEMS)"
M = lambda y, a, b: [f"{y}.{m:02d}" for m in range(a, b + 1)]
slides = []

# ───── race ─────
m25 = [r(CA[k], 3) for k in M(2025, 1, 12)]; m26 = [r(CA[k], 3) for k in M(2026, 1, 9)]
c25, c26 = cum(m25), cum(m26); t25 = c25[-1]; cross = next(i for i, v in enumerate(c26) if v >= t25) + 1; rat = c26[8] / c25[8]
slides.append({"kind": "race", "eyebrow": {"group": "경상수지", "topic": "2025년 · 2026년 월별 누적 경상수지", "basis": "1월부터 누적, 단위: 억 달러"},
               "head": f"2026년 경상수지 누적은 **{cross}월에 2025년 연간 흑자({f(t25)}억 달러)를 넘었으며**, 1~9월 합계 **{f(c26[8])}억 달러**로 전년 같은 기간의 {rat:.1f}배임",
               "series": [{"name": "2025년", "data": m25}, {"name": "2026년", "data": m26}], "unit": "억 달러", "dec": 1,
               "ref": {"value": "auto", "name": "2025년 연간"}, "gap": {"sub": f"같은 기간 {rat:.1f}배"},
               "foot": {"notes": ["월별 경상수지(백만 달러)를 억 달러로 바꿔 1월부터 더한 값(ECOM 계산)"], "source": S_BOP, "asof": ASOF}})
p25 = [r(PAY[k]) for k in M(2025, 1, 12)]; p26 = [r(PAY[k]) for k in M(2026, 1, 10)]
q25, q26 = cum(p25), cum(p26); pr = q26[9] / q25[9]
slides.append({"kind": "race", "eyebrow": {"group": "미국 고용", "topic": "2025년 · 2026년 비농업 고용 누적 증감", "basis": "1월부터 누적, 단위: 만 명"},
               "head": f"미국 비농업 고용은 2026년 1월 한 달 증가({f(p26[0])}만 명)가 2025년 연간({f(q25[11])}만 명)을 넘었으며, 1~10월 누적은 **{f(q26[9])}만 명**으로 전년 같은 기간의 {pr:.1f}배임",
               "series": [{"name": "2025년", "data": p25}, {"name": "2026년", "data": p26}], "unit": "만 명", "dec": 1,
               "ref": {"value": "auto", "name": "2025년 연간"}, "gap": {"sub": f"같은 기간 {pr:.1f}배"},
               "foot": {"notes": ["전월 대비 비농업 취업자 증감(천 명)을 만 명으로 바꿔 1월부터 더한 값(ECOM 계산)"], "source": S_PAY, "asof": ASOF}})

# ───── zoom ─────
L70 = months("2021.01", "2026.10"); fx = [r(FX[k]) for k in L70]; w = fx[-12:]; wa = sum(w) / 12; wmx = max(w); wmx_i = L70[-12:][w.index(wmx)]
slides.append({"kind": "zoom", "eyebrow": {"group": "환율", "topic": "원/달러 환율 전체 기간 → 최근 12개월", "basis": "월평균, 단위: 원"},
               "head": f"원/달러 환율은 최근 12개월 중 {wmx_i} **{f(wmx)}원**이 가장 높았고, 10월 **{f(fx[-1])}원**으로 내려와 12개월 평균({f(wa)}원)보다 {f(wa - fx[-1])}원 낮음",
               "name": "원/달러 환율", "labels": L70, "data": fx, "zoom": {"from": "2025.11", "to": "2026.10"}, "unit": "원", "dec": 1, "avg": True,
               "foot": {"notes": ["세로 눈금은 전체 기간과 같게 고정, 최근 12개월 평균은 ECOM 계산"], "source": "연준 세인트루이스 FRED(DEXKOUS)", "asof": ASOF}})
L69 = months("2021.01", "2026.09"); ca69 = [r(CA[k], 3) for k in L69]; z = ca69[-12:]; za = sum(z) / 12; top_i = ca69.index(max(ca69))
slides.append({"kind": "zoom", "type": "bar", "beats": [{"zoom": True}], "eyebrow": {"group": "경상수지", "topic": "월별 경상수지 69개월 → 최근 12개월", "basis": "단위: 억 달러"},
               "head": f"월별 경상수지는 2021년 이후 69개월 중 **{L69[top_i]} {f(ca69[top_i])}억 달러**가 가장 컸으며, 최근 12개월 평균은 {f(za)}억 달러로 그 앞 57개월 평균의 {za / (sum(ca69[:-12]) / 57):.1f}배임",
               "name": "경상수지", "labels": L69, "data": ca69, "zoom": {"from": "2025.10", "to": "2026.09"}, "unit": "억 달러", "dec": 1, "avg": True,
               "foot": {"notes": ["→ 를 누르면 최근 12개월로 확대, 세로 눈금은 고정", "평균은 월별 값의 단순 평균(ECOM 계산)"], "source": S_BOP, "asof": ASOF}})

# ───── wipe ─────
slides.append({"kind": "wipe", "eyebrow": {"group": "경상수지", "topic": "1~9월 월별 경상수지 2025년 · 2026년", "basis": "단위: 억 달러"},
               "head": f"2026년 1~9월 경상수지는 **9개월 모두 2025년 같은 달보다 컸으며**, 9월은 {f(m26[8])}억 달러로 전년 같은 달({f(m25[8])}억 달러)의 {m26[8] / m25[8]:.1f}배임",
               "labels": [f"{m}월" for m in range(1, 10)], "a": {"name": "2025년", "data": m25[:9]}, "b": {"name": "2026년", "data": m26}, "unit": "억 달러", "dec": 1,
               "diffTitle": "2026년 − 2025년, 억 달러",
               "box": {"title": "시사점", "items": ["9개월 모두 2026년이 2025년보다 큼", f"1~9월 합계 {f(c25[8])}억 → {f(c26[8])}억 달러"]},
               "foot": {"notes": ["차이 = 2026년 − 2025년 같은 달(ECOM 계산)"], "source": S_BOP, "asof": ASOF}})
k25 = [r(KCPI[k], 2) for k in M(2025, 1, 10)]; k26 = [r(KCPI[k], 2) for k in M(2026, 1, 10)]
run = 0
for a, b in zip(reversed(k25), reversed(k26)):
    if b > a:
        run += 1
    else:
        break
slides.append({"kind": "wipe", "eyebrow": {"group": "물가", "topic": "한국 소비자물가 상승률 2025년 · 2026년 월별", "basis": "전년동월비, 단위: %"},
               "head": f"한국 소비자물가 상승률은 2026년 {11 - run}월부터 **{run}개월 연속 2025년 같은 달보다 높았으며**, 10월은 **{f(k26[9], 2)}%**로 전년 같은 달보다 {f(k26[9] - k25[9], 2)}%p 높음",
               "labels": [f"{m}월" for m in range(1, 11)], "a": {"name": "2025년", "data": k25}, "b": {"name": "2026년", "data": k26}, "unit": "%", "dec": 2,
               "diffTitle": "2026년 − 2025년, %p", "y": {"min": 0, "max": 4, "step": 1, "dec": 0},
               "foot": {"notes": ["차이 = 2026년 − 2025년 같은 달(ECOM 계산)"], "source": S_KCPI, "asof": ASOF}})

# ───── slope ─────
pairs = [["한국 기준금리", RATE], ["미국 연방기금금리(실효)", FF], ["미국 국채 2년", D2], ["미국 국채 10년", D10]]
sp = [{"label": n, "a": r(d["2025.10"], 2), "b": r(d["2026.10"], 2)} for n, d in pairs]
dd = {p["label"]: p["b"] - p["a"] for p in sp}
slides.append({"kind": "slope", "eyebrow": {"group": "금리", "topic": "한·미 금리 4종 1년 전 대비", "basis": "단위: %, %p"},
               "head": f"최근 1년 미국 국채금리는 2년물 **{f(dd['미국 국채 2년'], 2, True)}%p**, 10년물 **{f(dd['미국 국채 10년'], 2, True)}%p** 올라 각각 {f(sp[2]['b'], 2)}% · {f(sp[3]['b'], 2)}%가 됐으며, 미국 정책금리(실효)는 {f(-dd['미국 연방기금금리(실효)'], 2)}%p 내림",
               "pairs": sp, "heads": ["2025.10", "2026.10"], "unit": "%", "dec": 2,
               "foot": {"notes": ["한국 기준금리는 월말, 미국 금리는 월평균", "변화 폭 = 2026.10 − 2025.10(ECOM 계산)"], "source": "한국은행 ECOS(722Y001), FRED(FEDFUNDS · DGS2 · DGS10)", "asof": ASOF}})
cp = [{"label": f"{m}월", "a": m25[m - 1], "b": m26[m - 1]} for m in range(5, 10)]
rs = [p["b"] / p["a"] for p in cp]; mi = rs.index(max(rs))
slides.append({"kind": "slope", "eyebrow": {"group": "경상수지", "topic": "5~9월 경상수지 2025년 → 2026년", "basis": "단위: 억 달러, 배"},
               "head": f"2026년 5~9월 경상수지는 매달 2025년 같은 달의 {min(rs):.1f}~{max(rs):.1f}배였으며, **{cp[mi]['label']}이 {max(rs):.1f}배**로 가장 크게 늘었고 9월은 {f(m26[8])}억 달러로 가장 큼",
               "pairs": cp, "heads": ["2025년", "2026년"], "unit": "억 달러", "dec": 1, "delta": "ratio", "hi": [mi],
               "foot": {"notes": ["배수 = 2026년 ÷ 2025년 같은 달(ECOM 계산)"], "source": S_BOP, "asof": ASOF}})

# ───── rank ─────
avg26 = sum(m26) / 9; o = sorted(range(9), key=lambda i: -m26[i])
slides.append({"kind": "rank", "eyebrow": {"group": "경상수지", "topic": "2026년 1~9월 월별 경상수지 순위", "basis": "단위: 억 달러"},
               "head": f"2026년 1~9월 경상수지는 **{o[0] + 1}월 {f(m26[o[0]])}억 달러**가 가장 컸고 {o[1] + 1}월({f(m26[o[1]])}억 달러) · {o[2] + 1}월({f(m26[o[2]])}억 달러) 순이며, 월평균은 {f(avg26)}억 달러임",
               "data": [[f"{i + 1}월", m26[i]] for i in range(9)], "unit": "억 달러", "dec": 1, "top": 3, "avgText": "월평균 {v}",
               "foot": {"notes": ["월평균은 1~9월 단순 평균(ECOM 계산)"], "source": S_BOP, "asof": ASOF}})
pa = sum(p26) / 10; po = sorted(range(10), key=lambda i: -p26[i]); negm = [i for i in range(10) if p26[i] < 0]
slides.append({"kind": "rank", "beats": [{"sort": True}], "eyebrow": {"group": "미국 고용", "topic": "2026년 월별 비농업 고용 증감 순위", "basis": "전월 대비, 단위: 만 명"},
               "head": f"2026년 미국 비농업 고용은 10개월 중 **{po[0] + 1}월({f(p26[po[0]], 1, True)}만 명)** 증가가 가장 컸고, " + " · ".join(f"{i + 1}월({f(p26[i])}만 명)" for i in negm) + f" 두 달은 줄었으며 월평균은 {f(pa)}만 명임",
               "data": [[f"{i + 1}월", p26[i]] for i in range(10)], "unit": "만 명", "dec": 1, "top": 3, "avgText": "월평균 {v}",
               "foot": {"notes": ["→ 를 누르면 큰 순서로 자리를 옮김", "천 명 단위 증감을 만 명으로 바꿈, 월평균은 ECOM 계산"], "source": S_PAY, "asof": ASOF}})

# ───── morph ─────
qt = [round(sum(m26[i:i + 3]), 1) for i in (0, 3, 6)]
slides.append({"kind": "morph", "eyebrow": {"group": "경상수지", "topic": "2026년 월별 경상수지 → 분기 합계", "basis": "단위: 억 달러"},
               "head": f"2026년 경상수지를 분기로 묶으면 1분기 {f(qt[0])}억 → 2분기 {f(qt[1])}억 → 3분기 **{f(qt[2])}억 달러**로 매 분기 늘었으며, 3분기는 전분기보다 **{(qt[2] / qt[1] - 1) * 100:.1f}%** 많음",
               "labels": M(2026, 1, 9), "data": m26, "group": 3, "unit": "억 달러", "dec": 1,
               "foot": {"notes": ["분기 합계와 전분기 대비 증감률은 월별 값을 더해 계산(ECOM 계산)"], "source": S_BOP, "asof": ASOF}})
L24 = months("2024.01", "2025.12"); c24 = [r(CA[k], 3) for k in L24]; qq = [round(sum(c24[i:i + 3]), 1) for i in range(0, 24, 3)]; qmx = qq.index(max(qq))
y24, y25 = round(sum(c24[:12]), 1), round(sum(c24[12:]), 1)
slides.append({"kind": "morph", "beats": [{"group": True}], "eyebrow": {"group": "경상수지", "topic": "2024~2025년 월별 경상수지 → 분기 합계", "basis": "단위: 억 달러"},
               "head": f"2024~2025년 경상수지를 분기로 묶으면 8개 분기 중 **{2024 + qmx // 4}년 {qmx % 4 + 1}분기({f(qq[qmx])}억 달러)**가 가장 컸으며, 2025년 연간은 {f(y25)}억 달러로 2024년보다 {(y25 / y24 - 1) * 100:.1f}% 늘었음",
               "labels": L24, "data": c24, "group": 3, "unit": "억 달러", "dec": 1,
               "foot": {"notes": ["→ 를 누르면 달 막대가 분기로 모여 쌓임", "분기 합계 · 증감률은 ECOM 계산"], "source": S_BOP, "asof": ASOF}})

# ───── split ─────
k = "2026.09"; parts = [("상품수지", GD), ("서비스수지", SV), ("본원소득수지", PI), ("이전소득수지", SI)]
pv = [r(d[k]) for _, d in parts]; tv = r(CA[k])
slides.append({"kind": "split", "eyebrow": {"group": "경상수지", "topic": "2026.09 경상수지 = 4개 항목의 합", "basis": "단위: 억 달러, 비중은 경상수지 대비"},
               "head": f"2026.09 경상수지 **{f(tv)}억 달러**는 **상품수지 흑자({f(pv[0])}억 달러)만으로 경상수지보다 크며**, 서비스 · 이전소득수지는 합계 {f(-(pv[1] + pv[3]))}억 달러 적자임",
               "total": {"label": "경상수지", "value": tv, "sub": "2026.09"}, "parts": [{"label": n, "value": v} for (n, _), v in zip(parts, pv)], "unit": "억 달러", "dec": 1,
               "foot": {"notes": ["비중 = 항목 ÷ 경상수지(ECOM 계산), 음수는 적자"], "source": S_BOP, "asof": ASOF}})
pv2 = [round(sum(d[x] for x in M(2025, 1, 12)), 1) for _, d in parts]; tv2 = round(sum(CA[x] for x in M(2025, 1, 12)), 1)
slides.append({"kind": "split", "beats": [{"split": True}], "eyebrow": {"group": "경상수지", "topic": "2025년 연간 경상수지 = 4개 항목의 합", "basis": "단위: 억 달러, 비중은 경상수지 대비"},
               "head": f"2025년 경상수지 **{f(tv2)}억 달러**는 상품수지({f(pv2[0])}억 달러)와 본원소득수지({f(pv2[2])}억 달러) 흑자가 서비스수지 적자({f(pv2[1])}억 달러)를 **웃돌아 생김**",
               "total": {"label": "경상수지", "value": tv2, "sub": "2025년 연간"}, "parts": [{"label": n, "value": v} for (n, _), v in zip(parts, pv2)], "unit": "억 달러", "dec": 1,
               "foot": {"notes": ["→ 를 누르면 합계 막대가 항목으로 갈라짐", "연간 = 1~12월 합(ECOM 계산), 비중 = 항목 ÷ 경상수지"], "source": S_BOP, "asof": ASOF}})

# ───── bridge ─────
s9 = lambda d, y: round(sum(d[x] for x in M(y, 1, 9)), 1)
st = [{"label": n, "value": round(s9(d, 2026) - s9(d, 2025), 1)} for n, d in parts]
b0, b1 = s9(CA, 2025), s9(CA, 2026); dt = b1 - b0; gsh = st[0]["value"] / dt * 100
slides.append({"kind": "bridge", "eyebrow": {"group": "경상수지", "topic": "1~9월 경상수지 증감 분해", "basis": "전년 같은 기간 대비, 단위: 억 달러"},
               "head": f"경상수지는 2025년 1~9월 {f(b0)}억 달러에서 2026년 1~9월 **{f(b1)}억 달러**로 {f(dt, 1, True)}억 달러 늘었으며, 이 가운데 **상품수지 증가가 {gsh:.1f}%**를 차지함",
               "start": {"label": "2025년 1~9월", "value": b0}, "steps": st, "end": {"label": "2026년 1~9월", "value": b1}, "unit": "억 달러", "dec": 1,
               "foot": {"notes": ["항목 몫 = 2026년 1~9월 합 − 2025년 1~9월 합(ECOM 계산), 반올림으로 합이 0.1 다를 수 있음"], "source": S_BOP, "asof": ASOF}})
ye = {y: RATE[f"{y}.12"] for y in range(2021, 2026)}; ye[2020] = RATE["2021.01"]; ye[2026] = RATE["2026.10"]
rst = [{"label": f"{y}년", "value": round(ye[y] - ye[y - 1], 2), **({"sub": "1~10월"} if y == 2026 else {})} for y in range(2021, 2027)]
rmx = max(rst, key=lambda q: abs(q["value"]))
slides.append({"kind": "bridge", "eyebrow": {"group": "금리", "topic": "한국 기준금리 연도별 변화", "basis": "연말 기준, 단위: %, %p"},
               "head": f"한국 기준금리는 2021.01 {f(ye[2020], 2)}%에서 2026.10 **{f(ye[2026], 2)}%**로 {f(ye[2026] - ye[2020], 2)}%p 올랐으며, **{rmx['label']} 한 해 인상 폭({f(rmx['value'], 2, True)}%p)**이 전체 변화의 {rmx['value'] / (ye[2026] - ye[2020]) * 100:.1f}%임",
               "start": {"label": "2021.01", "value": ye[2020]}, "steps": rst, "end": {"label": "2026.10", "value": ye[2026]}, "unit": "%", "dunit": "%p", "dec": 2,
               "foot": {"notes": ["연도별 변화 = 그해 12월 말 − 앞 해 12월 말(2021년은 1월 말 대비, 2026년은 10월 말까지)"], "source": "한국은행 ECOS(722Y001)", "asof": ASOF}})

# ───── waffle ─────
un = [UN.get(x) for x in L70]; vals = [(v, x) for v, x in zip(un, L70) if v is not None]; umin = min(vals)
slides.append({"kind": "waffle", "eyebrow": {"group": "미국 고용", "topic": "미국 실업률 100칸 비교", "basis": "칸 1개 = 노동력의 1%, 단위: %"},
               "head": f"미국 실업률은 2021.01 {f(un[0])}%에서 2026.10 **{f(un[-1])}%**로 내려 노동력 100명 중 실업자가 {f(un[0])}명에서 {f(un[-1])}명으로 줄었으며, 최저는 {umin[1]} {f(umin[0])}%임",
               "grids": [{"label": "2021.01", "value": un[0], "color": "cmp", "sub": "노동력 100명 중 실업자"}, {"label": "2026.10", "value": un[-1], "sub": "노동력 100명 중 실업자"}],
               "legend": [{"text": "2021.01 실업자", "color": "cmp"}, {"text": "2026.10 실업자", "color": "main"}, {"text": "일하는 사람 · 노동력의 나머지", "color": "light"}],
               "side": {"type": "line", "title": "미국 실업률 추이, %", "labels": L70, "data": un, "unit": "%", "dec": 1},
               "foot": {"notes": ["마지막 칸은 소수점만큼 일부만 채움", "2025.10은 미발표로 추이에서 비움"], "source": "미 노동통계국 · FRED(UNRATE)", "asof": ASOF}})
L72 = months("2021.01", "2026.12"); kc = [KCPI.get(x) for x in L72]; fill = [i for i, v in enumerate(kc) if v is not None and v > 2]; na = [i for i, v in enumerate(kc) if v is None]
yc = [sum(1 for i in fill if i // 12 == y) for y in range(6)]
slides.append({"kind": "waffle", "eyebrow": {"group": "물가", "topic": "한국 소비자물가 상승률 2% 초과 달", "basis": "칸 1개 = 1개월, 전년동월비 2% 초과 여부"},
               "head": f"한국 소비자물가 상승률은 2021.01~2026.10 70개월 중 **{len(fill)}개월이 물가안정목표 2%를 넘었으며**, 2022~2023년은 24개월 모두 넘고 2026년은 10개월 중 {yc[5]}개월이 넘음",
               "grids": [{"label": "2% 넘은 달", "n": 72, "cols": 12, "fill": fill, "na": na, "rowLabels": [str(y) for y in range(2021, 2027)], "colLabels": [f"{m}월" for m in range(1, 13)],
                          "rowUnit": "개월", "big": {"value": len(fill), "dec": 0, "unit": "개월"}, "sub": "70개월 중"}],
               "legend": [{"text": "2% 넘은 달", "color": "main"}, {"text": "2% 이하", "color": "light"}, {"text": "자료 없음", "type": "na"}],
               "side": {"type": "bars", "title": "연도별 2% 넘은 달 수, 개월", "labels": [str(y) for y in range(2021, 2027)], "data": yc, "unit": "개월", "dec": 0},
               "foot": {"notes": ["2% = 한국은행 물가안정목표, 2026년은 10월까지"], "source": S_KCPI, "asof": ASOF}})

# ───── donut ─────
cnt = lambda d: sum(1 for x in L69 if d[x] > 0)
rings = [("경상수지", CA), ("상품수지", GD), ("본원소득수지", PI), ("서비스수지", SV)]
rv = [(n, cnt(d)) for n, d in rings]
slides.append({"kind": "donut", "eyebrow": {"group": "경상수지", "topic": "항목별 흑자 달 비중", "basis": "2021.01~2026.09 69개월, 단위: %"},
               "head": f"2021.01~2026.09 69개월 중 흑자인 달은 경상수지 · 상품수지 **각 {rv[0][1]}개월({rv[0][1] / 69 * 100:.1f}%)**, 본원소득수지 {rv[2][1]}개월({rv[2][1] / 69 * 100:.1f}%)이며 서비스수지는 {rv[3][1]}개월({rv[3][1] / 69 * 100:.1f}%)뿐임",
               "rings": [{"label": n, "value": round(c / 69 * 100, 1), "sub": f"69개월 중 {c}개월", "strip": [1 if d[x] > 0 else 0 for x in L69], **({"color": "cmp"} if n == "서비스수지" else {})} for (n, c), (_, d) in zip(rv, rings)], "dec": 1,
               "stripLabels": ["21.01", "26.09"],
               "foot": {"notes": ["흑자 달 = 월별 값이 0보다 큰 달, 비중 = 흑자 달 ÷ 69개월(ECOM 계산)", "아래 띠는 달마다 흑자(색) · 적자(회색)"], "source": S_BOP, "asof": ASOF}})
LU = sorted(UCPI); kn = sum(1 for x in L70 if KCPI[x] > 2); un2 = sum(1 for x in LU if UCPI[x] > 2)
yk = [sum(1 for x in L70 if x.startswith(str(y)) and KCPI[x] > 2) for y in range(2021, 2027)]; yu = [sum(1 for x in LU if x.startswith(str(y)) and UCPI[x] > 2) for y in range(2021, 2027)]
slides.append({"kind": "donut", "half": True, "eyebrow": {"group": "물가", "topic": "한·미 소비자물가 상승률 2% 초과 달 비중", "basis": "전년동월비, 단위: %"},
               "head": f"물가안정목표 2%를 넘은 달의 비중은 **미국 {un2 / len(LU) * 100:.1f}%({len(LU)}개월 중 {un2}개월)**로 한국({kn / 70 * 100:.1f}%, 70개월 중 {kn}개월)보다 높았으며, 2026년은 두 나라 모두 매달 넘음" if yk[5] == 10 and yu[5] == len([x for x in LU if x.startswith('2026')]) else
               f"물가안정목표 2%를 넘은 달의 비중은 **미국 {un2 / len(LU) * 100:.1f}%({len(LU)}개월 중 {un2}개월)**로 한국({kn / 70 * 100:.1f}%, 70개월 중 {kn}개월)보다 높았음",
               "rings": [{"label": "한국", "value": round(kn / 70 * 100, 1), "sub": f"70개월 중 {kn}개월", "sub2": "2021.01~2026.10", "color": "main", "strip": [1 if KCPI[x] > 2 else 0 for x in L70]},
                         {"label": "미국", "value": round(un2 / len(LU) * 100, 1), "sub": f"{len(LU)}개월 중 {un2}개월", "sub2": f"2021.01~{LU[-1]}", "color": "cmp", "strip": [None if x not in UCPI else (1 if UCPI[x] > 2 else 0) for x in L70]}],
               "dec": 1, "hero": 1, "stripLabels": ["21.01", "26.10"],
               "side": {"type": "bars", "title": "연도별 2% 넘은 달 수, 개월", "labels": [str(y) for y in range(2021, 2027)], "series": [{"name": "한국", "data": yk, "color": "main"}, {"name": "미국", "data": yu, "color": "cmp"}], "unit": "", "dec": 0},
               "foot": {"notes": ["미국은 2025.10 미발표로 68개월, 2026년은 한국 10월 · 미국 9월까지", "고리 아래 띠는 달마다 2% 초과(색) · 이하(회색)"], "source": f"{S_KCPI}, FRED(CPIAUCSL)", "asof": ASOF}})

# ───── minis ─────
L12 = months("2025.10", "2026.09")
def mini(nm, d, kind="bar", dec=1, unit="억 달러", sub=None, lab=None):
    data = [[x, r(d.get(x), dec)] for x in (lab or L12)]; last = data[-1][1]
    prev = d.get(f"{int(data[-1][0][:4]) - 1}{data[-1][0][4:]}")
    o = {"label": nm, "value": last, "dec": dec, "unit": unit, "kind": kind, "data": data}
    if sub: o["sub"] = sub
    if prev is not None:
        dv = last - r(prev, dec); o["chip"] = {"text": f"1년 전보다 {f(dv, dec, True)}{unit}", "dir": "up" if dv > 0 else "dn" if dv < 0 else "flat"}
    return o
ms = [mini("경상수지", CA), mini("상품수지", GD), mini("서비스수지", SV), mini("본원소득수지", PI)]
svn = all(SV[x] < 0 for x in L12)
slides.append({"kind": "minis", "eyebrow": {"group": "경상수지", "topic": "경상수지와 3개 항목 최근 12개월", "basis": "2025.10~2026.09, 단위: 억 달러"},
               "head": f"2026.09 경상수지 **{f(ms[0]['value'])}억 달러**는 상품수지({f(ms[1]['value'])}억 달러)가 이끌었으며, 최근 12개월 중 경상 · 상품수지는 9월이 가장 컸고 서비스수지는 12개월 모두 적자임" if svn else "",
               "minis": ms, "foot": {"notes": ["칩 = 전년 같은 달 대비 증감(ECOM 계산)"], "source": S_BOP, "asof": ASOF}})
L12b = months("2025.11", "2026.10")
um = mini("실업률", UN, "line", 1, "%", lab=L12b); um.pop("chip", None)
pm = mini("비농업 고용 증감", PAY, "bar", 1, "만 명", "전월 대비", L12b); pm.pop("chip", None)
im = mini("산업생산지수", IP, "line", 1, "", "2017=100", months("2025.10", "2026.09"))
tm = mini("국채 10년 금리", D10, "line", 2, "%", "월평균", L12b)
im["chip"] = {"text": f"1년 전보다 {f(IP['2026.09'] - IP['2025.09'], 1, True)}", "dir": "up"}
tm["chip"]["text"] = f"1년 전보다 {f(D10['2026.10'] - D10['2025.10'], 2, True)}%p"
ip12 = [IP[x] for x in months("2025.10", "2026.09")]
slides.append({"kind": "minis", "eyebrow": {"group": "미국 경기", "topic": "미국 지표 4종 최근 12개월", "basis": "월, 단위: %, 만 명, 2017=100"},
               "head": f"미국은 2026.10 실업률 **{f(UN['2026.10'])}%**, 비농업 고용 {f(PAY['2026.10'], 1, True)}만 명이었으며, 9월 산업생산지수({f(IP['2026.09'])})는 12개월 중 가장 높고 10년 국채금리는 **{f(D10['2026.10'], 2)}%**까지 오름" if IP["2026.09"] == max(ip12) else "",
               "minis": [um, pm, im, tm], "foot": {"notes": ["산업생산지수는 2026.09까지, 국채금리는 월평균", "칩 = 전년 같은 달 대비(ECOM 계산)"], "source": "미 노동통계국 · 연준, FRED(UNRATE · PAYEMS · INDPRO · DGS10)", "asof": ASOF}})

# ───── heatmap ─────
cols = [x[2:] for x in L12b]
rows = [("한국 소비자물가", "전년동월비", KCPI, 1, "%", {"ge": 3}), ("미국 소비자물가", "전년동월비", UCPI, 1, "%", {"ge": 3}), ("한국 기준금리", "월말", RATE, 2, "%", None),
        ("미국 연방기금금리", "실효, 월평균", FF, 2, "%", None), ("미국 국채 2년", "월평균", D2, 2, "%", None), ("미국 국채 10년", "월평균", D10, 2, "%", None),
        ("미국 실업률", "월", UN, 1, "%", None), ("원/달러 환율", "월평균", FX, 0, "원", None)]
hr = []
for nm, sb, d, dc, sf, bad in rows:
    o = {"name": nm, "sub": sb, "dec": dc, "suf": sf, "data": [r(d.get(x), dc) for x in L12b]}
    if bad: o["bad"] = bad
    hr.append(o)
nk = sum(1 for v in hr[0]["data"] if v is not None and v >= 3); nu = sum(1 for v in hr[1]["data"] if v is not None and v >= 3)
slides.append({"kind": "heatmap", "eyebrow": {"group": "한눈에", "topic": "한·미 주요 지표 최근 12개월", "basis": "색은 줄마다 따로, 단위: %, 원"},
               "head": f"최근 12개월 물가 상승률이 3% 이상인 달은 한국 {nk}개월 · 미국 {nu}개월이었으며, 미국 국채금리는 2026.10 2년 {f(D2['2026.10'], 2)}% · **10년 {f(D10['2026.10'], 2)}%로 12개월 중 가장 높음**",
               "cols": cols, "rows": hr, "summary": {"title": "12개월 평균", "kind": "avg"}, "badText": "물가 상승률 3% 이상",
               "foot": {"notes": ["색은 줄마다 12개월 안 최저(옅음)~최고(짙음), 미국 소비자물가 2026.10은 미발표"], "source": "한국은행 ECOS(722Y001 · 901Y009), FRED(CPIAUCSL · FEDFUNDS · DGS2 · DGS10 · UNRATE · DEXKOUS)", "asof": ASOF}})
gridd = [[r(KCPI.get(f"{y}.{m:02d}"), 1) for m in range(1, 13)] for y in range(2021, 2027)]
kmx = max((v, x) for x, v in KCPI.items()); n5 = sum(1 for v in gridd[1] if v is not None and v >= 5)
slides.append({"kind": "heatmap", "eyebrow": {"group": "물가", "topic": "한국 소비자물가 상승률 연 × 월", "basis": "전년동월비, 단위: %"},
               "head": f"한국 소비자물가 상승률은 {kmx[1]} **{f(kmx[0])}%**로 가장 높았고 **2022년 {n5}개월이 5% 이상**이었으며, 2026년은 5월 이후 3% 안팎으로 10월 {f(KCPI['2026.10'])}%임",
               "grid": {"rows": [str(y) for y in range(2021, 2027)], "cols": [f"{m}월" for m in range(1, 13)], "data": gridd, "dec": 1, "suf": "%", "bad": {"ge": 5}},
               "summary": {"title": "연평균", "kind": "avg"}, "badText": "5% 이상", "hiCol": -1,
               "foot": {"notes": ["색은 70개월 전체 최저(옅음)~최고(짙음), 연평균은 월별 값 단순 평균(ECOM 계산)"], "source": S_KCPI, "asof": ASOF}})

# ───── drivers ─────
def drv(ka, kb, la, lb):
    it = []
    for n, d in parts:
        a, b = d[ka] if isinstance(ka, str) else sum(d[x] for x in ka), d[kb] if isinstance(kb, str) else sum(d[x] for x in kb)
        it.append({"text": n, "value": round(b - a, 1), "sub": f"{la} {f(a)} → {lb} {f(b)}억 달러"})
    it.sort(key=lambda q: -abs(q["value"]))
    for q in it:
        q["sign"] = "+" if q["value"] >= 0 else "−"
    return it
di = drv("2025.09", "2026.09", "2025.09", "2026.09"); dca = round(CA["2026.09"] - CA["2025.09"], 1); rest = round(sum(q["value"] for q in di[1:]), 1)
slides.append({"kind": "drivers", "eyebrow": {"group": "경상수지", "topic": "2026.09 경상수지 1년 전 대비 변화 요인", "basis": "단위: 억 달러"},
               "head": f"2026.09 경상수지는 1년 전보다 **{f(dca, 1, True)}억 달러** 늘었으며, **{di[0]['text']} 증가({f(di[0]['value'], 1, True)}억 달러)**가 대부분이고 나머지 3개 항목 변화는 합계 {f(rest, 1, True)}억 달러임",
               "items": di, "unit": "억 달러", "dec": 1, "total": {"label": "경상수지 변화", "value": dca, "sub": f"2025.09 {f(CA['2025.09'])} → 2026.09 {f(CA['2026.09'])}억 달러"},
               "foot": {"notes": ["변화 = 2026.09 − 2025.09(ECOM 계산), 반올림으로 합이 0.1 다를 수 있음"], "source": S_BOP, "asof": ASOF}})
d2 = drv(M(2024, 1, 12), M(2025, 1, 12), "2024년", "2025년"); dy = round(sum(CA[x] for x in M(2025, 1, 12)) - sum(CA[x] for x in M(2024, 1, 12)), 1)
svq = next(q for q in d2 if q["text"] == "서비스수지")
slides.append({"kind": "drivers", "eyebrow": {"group": "경상수지", "topic": "2025년 연간 경상수지 전년 대비 변화 요인", "basis": "단위: 억 달러"},
               "head": f"2025년 경상수지는 2024년보다 **{f(dy, 1, True)}억 달러** 늘었으며, **상품수지 증가({f(d2[0]['value'], 1, True)}억 달러)**가 서비스수지 적자 확대({f(svq['value'], 1, True)}억 달러)를 웃돌았음",
               "items": d2, "unit": "억 달러", "dec": 1, "total": {"label": "경상수지 변화", "value": dy, "sub": f"2024년 {f(sum(CA[x] for x in M(2024, 1, 12)))} → 2025년 {f(sum(CA[x] for x in M(2025, 1, 12)))}억 달러"},
               "foot": {"notes": ["연간 = 1~12월 합, 변화 = 2025년 − 2024년(ECOM 계산)"], "source": S_BOP, "asof": ASOF}})

# ───── combo ─────
cb = [r(CA[x], 3) for x in L12]; cl = [r(FX[x]) for x in L12]; fmx = max(cl); fmx_i = L12[cl.index(fmx)]
slides.append({"kind": "combo", "eyebrow": {"group": "경상수지 · 환율", "topic": "월별 경상수지와 원/달러 환율", "basis": "2025.10~2026.09, 단위: 억 달러, 원"},
               "head": f"최근 12개월 경상수지 흑자가 {f(cb[0])}억 달러에서 **{f(cb[-1])}억 달러**로 커지는 동안, 원/달러 환율은 {fmx_i} {f(fmx)}원으로 가장 높았다가 9월 **{f(cl[-1])}원**으로 내림",
               "labels": L12, "bars": {"name": "경상수지", "data": cb, "unit": "억 달러", "dec": 1}, "line": {"name": "원/달러 환율", "data": cl, "unit": "원", "dec": 1},
               "foot": {"notes": ["환율은 월평균"], "source": f"{S_BOP}, FRED(DEXKOUS)", "asof": ASOF}})
L22 = months("2025.01", "2026.10"); pb = [r(PAY[x]) for x in L22]; ul = [UN.get(x) for x in L22]
up26 = sum(1 for x in M(2026, 1, 10) if PAY[x] > 0); u26 = {x: UN[x] for x in M(2026, 1, 10) if x in UN}; umx = max(u26.items(), key=lambda q: q[1])
slides.append({"kind": "combo", "eyebrow": {"group": "미국 고용", "topic": "비농업 고용 증감과 실업률", "basis": "2025.01~2026.10, 단위: 만 명, %"},
               "head": f"미국 비농업 고용은 2026년 10개월 중 {up26}개월 늘었고 실업률은 {umx[0]} **{f(umx[1])}%**에서 10월 **{f(UN['2026.10'])}%**로 내려, 고용 증가와 실업률 하락이 함께 나타남",
               "labels": L22, "bars": {"name": "비농업 고용 증감", "data": pb, "unit": "만 명", "dec": 1}, "line": {"name": "실업률", "data": ul, "unit": "%", "dec": 1},
               "summary": [["2025년 월평균 고용 증감", f"{f(sum(p25) / 12, 1, True)}만 명"], ["2026년 1~10월 월평균", f"{f(sum(p26) / 10, 1, True)}만 명"], ["실업률 2026.10", f"{f(UN['2026.10'])}%"]],
               "foot": {"notes": ["고용 증감은 전월 대비(천 명 → 만 명), 2025.10 실업률은 미발표로 비움"], "source": "미 노동통계국 · FRED(PAYEMS · UNRATE)", "asof": ASOF}})

import re
for sl in slides:  # 숫자와 단위가 줄 끝에서 갈라지지 않게(붙임표 없는 띄어쓰기)
    sl["head"] = re.sub(r"(\d)(억|만|원|%|개월)? (달러|명)", lambda m: m.group(1) + (m.group(2) or "") + " " + m.group(3), sl["head"])
deck = {"schema": 3, "meta": {"session": "DEMO3C", "title": "차트 부품 시험", "date": "2026.11.24", "series": "경제지표101", "cover": "A", "combo": "A"}, "slides": slides}
(ROOT / "style" / "demo3_charts.json").write_text(json.dumps(deck, ensure_ascii=False, indent=1), encoding="utf-8")
for i, s in enumerate(slides, 1):
    hl = len(s["head"].replace(" ", "").replace("*", ""))
    print(i, s["kind"], hl, "!!" if hl < 50 or hl > 90 else "", s["head"][:60])
