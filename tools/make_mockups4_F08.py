# F08 타임라인 · 일정 목업 12종(N087~N098) — 자료는 data/snap4(FRED) · data/snap(ECOS · FRED 월별)에서 읽어 계산
# 실행: python -X utf8 tools/make_mockups4_F08.py → library/mockups/v4/F08.json · style/demo4_r1_F08.json
import json, datetime as dt, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
S4 = ROOT / "data" / "snap4"
S1 = ROOT / "data" / "snap"
D = dt.date
TODAY = D(2026, 11, 13)
ASOF = TODAY.strftime("%Y.%m.%d")


def L4(n):
    return [(D.fromisoformat(a), b) for a, b in json.loads((S4 / f"{n}.json").read_text(encoding="utf-8"))["data"] if b is not None]


def L1(n):
    return [(a, b) for a, b in json.loads((S1 / f"{n}.json").read_text(encoding="utf-8"))["data"]]


def at(ser, d):
    """d 이전(같은 날 포함) 마지막 값"""
    v = None
    for a, b in ser:
        if a <= d:
            v = b
        else:
            break
    return v


def yf(d):
    return d.year + (d.timetuple().tm_yday - 1) / (366 if d.year % 4 == 0 else 365)


def months(a, b):
    return round((b - a).days / 30.44)


def ym(d):
    return d.strftime("%Y.%m")


def chars(s):
    return len(re.sub(r"[\s*]", "", s))


def foot(notes, src, asof):
    return {"notes": notes, "source": src, "asof": asof}


def sgn(v, d=2):
    return ("+" if v > 0 else "−" if v < 0 else "") + f"{abs(v):.{d}f}"


OUT = []


def add(id_, kind, variant, title, slide, facts, real=True):
    slide["kind"] = kind
    slide["transition"] = "push" if False else slide.get("transition")
    if slide["transition"] is None:
        del slide["transition"]
    n = chars(slide["head"])
    if not 50 <= n <= 90:
        print("HEAD길이", id_, n)
    OUT.append({"id": id_, "kind": kind, "family": "F08", "variant": variant, "title": title, "tags": ["4판"] + ([] if real else ["예시 값"]), "facts": facts, "slide": slide})


FED = L4("DFEDTARU")
LAST_FED = FED[-1][0]

# ───────── N087 사건 + 가격 선 (events · 아래 사건 띠) ─────────
wti = L4("DCOILWTICO")
mm = {}
for d, v in wti:
    if d >= D(2020, 1, 1) and d <= D(2026, 10, 31):
        mm.setdefault((d.year, d.month), []).append(v)
keys = sorted(mm)
labels = [f"{y}.{m:02d}" for y, m in keys]
data = [round(sum(mm[k]) / len(mm[k]), 1) for k in keys]
idx = {k: i for i, k in enumerate(keys)}
lo_i = data.index(min(data)); hi_i = data.index(max(data))
ev = [((2020, 3), "사우디 · 러시아 증산 경쟁"), ((2020, 4), "WTI 선물 마이너스 가격"), ((2022, 2), "러시아 우크라이나 침공"), ((2022, 3), "연준 금리 인상 시작"),
      ((2023, 10), "하마스 이스라엘 공격"), ((2025, 4), "미국 상호관세 발표"), ((2025, 6), "이스라엘 · 이란 무력 충돌")]
head = f"WTI 월평균은 {labels[lo_i][:4]}년 {int(labels[lo_i][5:])}월 **{data[lo_i]:.1f}달러**까지 내린 뒤 {labels[hi_i][:4]}년 {int(labels[hi_i][5:])}월 **{data[hi_i]:.1f}달러**까지 올라 사건마다 크게 움직였음"
add("N087", "events", "사건 + 가격 선", "WTI 원유와 사건 일곱", {
    "eyebrow": {"group": "원유", "topic": "WTI 월평균과 주요 사건 일곱", "basis": "월평균, 단위: 달러/배럴"}, "head": head,
    "labels": labels, "series": [{"name": "WTI", "data": data}], "unit": "달러", "y": {"min": 0, "max": 130, "step": 20},
    "events": [{"at": idx[k], "text": t} for k, t in ev], "evPos": "bottom", "callout": {"text": f"{data[-1]:.1f}달러"},
    "foot": foot(["일별 값을 달마다 평균, 사건 날짜는 공개된 발표 · 개시일 기준"], "FRED(DCOILWTICO)", wti[-1][0].strftime("%Y.%m.%d"))},
    {"low": [labels[lo_i], data[lo_i]], "high": [labels[hi_i], data[hi_i]], "last": [labels[-1], data[-1]]})

# ───────── N088 세로 연표 ─────────
def row(date, title, sub, now=False, v=None):
    return {"year": ym(date), "title": title, "sub": sub, "value": v if v is not None else at(FED, date + dt.timedelta(days=3)), "now": now}


up22 = [d for d, v in FED if D(2022, 3, 1) <= d <= D(2023, 7, 31) and v > at(FED, d - dt.timedelta(days=1))]
chg = [(d, at(FED, d - dt.timedelta(days=1)), v) for d, v in FED if d > D(2008, 12, 17) and at(FED, d - dt.timedelta(days=1)) != v]
cuts2425 = [c for c in chg if D(2024, 9, 1) <= c[0] <= D(2025, 12, 31)]
rows = [
    row(D(2008, 12, 16), "제로금리 도입", "목표 0~0.25% 구간으로 내린 뒤 7년간 유지", v=0.25),
    row(D(2015, 12, 16), "7년 만의 첫 인상", "제로금리를 끝내고 한 번에 0.25%p 올림"),
    row(D(2019, 7, 31), "첫 인하(예방적 조정)", "2008년 이후 처음 내림 · 세 차례 인하"),
    row(D(2020, 3, 16), "코로나 긴급 인하", "3월 두 차례 긴급 인하로 다시 제로금리"),
    row(D(2022, 3, 17), "인상 시작", f"물가 급등에 맞서 올리기 시작 · 이후 {len(up22)}차례 인상"),
    row(D(2023, 7, 27), "인상 마무리(고점)", "마지막 인상으로 5.25~5.50% 도달"),
    row(D(2024, 9, 19), "4년 반 만의 첫 인하", f"한 번에 0.50%p 내림 · 2025년 말까지 {len(cuts2425)}차례"),
    row(D(2026, 9, 17), "인상 재개", "3.75%에서 4.00%로 올림 · 인하 사이클 이후 첫 인상", now=True),
]
top = max(r["value"] for r in rows)
head = f"연준 정책금리 상단은 2008년 12월 **{rows[0]['value']:.2f}%**에서 2023년 7월 **{top:.2f}%**까지 올랐고 2026년 9월 **{rows[-1]['value']:.2f}%**로 다시 올림"
add("N088", "tlvert", "세로 연표", "연준 정책금리 연표", {
    "eyebrow": {"group": "연준 금리", "topic": "정책금리 상단을 바꾼 여덟 시점", "basis": "결정 시점 직후 상단, 단위: %"}, "head": head,
    "rows": rows, "unit": "%", "dec": 2, "vmax": 6, "barTitle": "결정 직후 정책금리 상단(%)",
    "foot": foot(["연표의 년월은 연준 결정 월 기준, 값은 결정 직후 연방기금금리 목표 상단"], "FRED(DFEDTARU)", LAST_FED.strftime("%Y.%m.%d"))},
    {"rows": [[r["year"], r["value"]] for r in rows]})

# ───────── N089 평행 타임라인 (미국 vs 한국) ─────────
us = L1("fred_fedfunds"); kr = L1("ecos_rate")
assert [a for a, _ in us] == [a for a, _ in kr]
mlabels = [a for a, _ in us]
usd = [b for _, b in us]; krd = [b for _, b in kr]


def first_up(dd, thr):
    for i in range(1, len(dd)):
        if dd[i] - dd[i - 1] > thr:
            return i


def peak(dd):
    return dd.index(max(dd))


def first_cut(dd, pk, thr):
    for i in range(pk + 1, len(dd)):
        if dd[i] < max(dd) - thr:
            return i


u_up, k_up = first_up(usd, .1), first_up(krd, .0)
u_pk, k_pk = peak(usd), krd.index(max(krd))
u_dn, k_dn = first_cut(usd, u_pk, .15), first_cut(krd, k_pk, .1)
print("N089 idx", mlabels[u_up], mlabels[k_up], mlabels[u_pk], mlabels[k_pk], mlabels[u_dn], mlabels[k_dn])
gapm = u_up - k_up
head = f"한국은행은 {mlabels[k_up].replace('.', '년 ')}월 먼저 올리기 시작해 연준보다 **{gapm}개월** 앞섰고 두 나라 모두 지금은 **{usd[-1]:.2f}% · {krd[-1]:.2f}%**임"
head = head.replace("년 08월", "년 8월")
add("N089", "tlpar", "평행 타임라인", "연준 · 한국은행 금리 나란히", {
    "eyebrow": {"group": "한 · 미 금리", "topic": "연준과 한국은행의 금리 흐름을 나란히", "basis": "월평균, 단위: %"}, "head": head,
    "from": 2021.0, "to": 2026.84, "ticks": [2021, 2022, 2023, 2024, 2025, 2026], "y": {"max": 6, "ticks": [0, 2, 4, 6]}, "unit": "%",
    "lanes": [
        {"name": "미국 연준", "sub": "연방기금금리(실효)", "color": "main", "data": usd, "marks": [
            {"i": u_up, "v": usd[u_up], "text": f"{mlabels[u_up]} 인상 시작", "pos": "above", "dx": -30},
            {"i": u_pk, "v": usd[u_pk], "text": f"{mlabels[u_pk]} 고점 {usd[u_pk]:.2f}%", "pos": "below", "dx": -40},
            {"i": u_dn, "v": usd[u_dn], "text": f"{mlabels[u_dn]} 인하 시작", "pos": "above", "dx": 20},
            {"i": len(usd) - 1, "v": usd[-1], "text": f"{mlabels[-1]} {usd[-1]:.2f}%", "pos": "below", "dx": -20}]},
        {"name": "한국은행", "sub": "기준금리", "color": "cmp", "data": krd, "marks": [
            {"i": k_up, "v": krd[k_up], "text": f"{mlabels[k_up]} 인상 시작", "pos": "above", "dx": 80},
            {"i": k_pk, "v": krd[k_pk], "text": f"{mlabels[k_pk]} 고점 {krd[k_pk]:.2f}%", "pos": "above", "dx": 0},
            {"i": k_dn, "v": krd[k_dn], "text": f"{mlabels[k_dn]} 인하 시작", "pos": "above", "dx": 30},
            {"i": len(krd) - 1, "v": krd[-1], "text": f"{mlabels[-1]} {krd[-1]:.2f}%", "pos": "above", "dx": -20}]}],
    "gap": {"a": [0, 0], "b": [1, 0], "text": f"한국은행이 {gapm}개월 먼저"},
    "foot": foot(["연준은 월평균 실효 연방기금금리, 한국은행은 월 기준 기준금리(월말 기준)"], "FRED(FEDFUNDS) · 한국은행 ECOS(722Y001)", mlabels[-1])},
    {"fed": {"up": mlabels[u_up], "peak": [mlabels[u_pk], usd[u_pk]], "cut": mlabels[u_dn], "last": usd[-1]}, "bok": {"up": mlabels[k_up], "peak": [mlabels[k_pk], krd[k_pk]], "cut": mlabels[k_dn], "last": krd[-1]}, "gap_months": gapm})
# 순서: 위 레인 i=0 은 fed 의 첫 마크(인상 시작) · 아래 레인 i=0 은 한은 첫 마크(인상 시작)

# ───────── N090 간트 (연준 정책금리 국면 기간) ─────────
ph = [("제로금리 유지", D(2008, 12, 16), D(2015, 12, 16), "gray"), ("1차 인상", D(2015, 12, 16), D(2018, 12, 20), "main"), ("예방적 인하", D(2019, 8, 1), D(2019, 10, 31), "cmp"),
      ("코로나 인하 · 제로금리", D(2020, 3, 4), D(2022, 3, 17), "cmp"), ("2차 인상", D(2022, 3, 17), D(2023, 7, 27), "main"), ("고금리 동결", D(2023, 7, 27), D(2024, 9, 19), "gray"),
      ("인하", D(2024, 9, 19), D(2025, 12, 11), "cmp"), ("저점 유지", D(2025, 12, 11), D(2026, 9, 17), "gray"), ("인상 재개", D(2026, 9, 17), LAST_FED, "main")]
grows = []
for nm, a, b, t in ph:
    va, vb = at(FED, a + dt.timedelta(days=1)), at(FED, b - dt.timedelta(days=1)) if b != LAST_FED else FED[-1][1]
    m = months(a, b)
    lab = f"{m}개월 · {va:.2f}%" if va == vb else f"{m}개월 · {va:.2f}→{vb:.2f}%"
    grows.append({"name": nm, "sub": f"{ym(a)}~{ym(b)}" if b != LAST_FED else f"{ym(a)}~", "from": yf(a), "to": yf(b), "label": lab, "tone": t, "now": b == LAST_FED})
nup = sum(1 for _, _, _, t in ph if t == "main"); ndn = sum(1 for _, _, _, t in ph if t == "cmp")
nhold = sum(1 for _, _, _, t in ph if t == "gray")
head = f"2008년 12월 이후 연준 정책금리의 아홉 국면은 인상 **{nup}번** · 인하 **{ndn}번** · 유지 **{nhold}번**으로 나뉘고 지금 상단은 **{FED[-1][1]:.2f}%**임"
add("N090", "tlgantt", "간트", "연준 정책금리 국면 기간", {
    "eyebrow": {"group": "연준 금리", "topic": "정책금리 국면별 기간", "basis": "목표 상단, 단위: 개월 · %"}, "head": head,
    "from": 2008.5, "to": 2027.0, "step": 2, "rows": grows, "nowAt": {"t": yf(LAST_FED), "label": ym(LAST_FED) + " 현재"},
    "foot": foot(["막대 색: 초록 = 인상 · 진회색 = 인하 · 연회색 = 유지", "국면 경계는 첫 결정 월과 마지막 결정 월 기준"], "FRED(DFEDTARU)", LAST_FED.strftime("%Y.%m.%d"))},
    {"phases": [[g["name"], g["sub"], g["label"]] for g in grows]})

# ───────── N091 카운트다운 칸 ─────────
def nth_weekday(y, m, wd, n):
    d = D(y, m, 1)
    d += dt.timedelta(days=(wd - d.weekday()) % 7)
    return d + dt.timedelta(days=7 * (n - 1))


thx = nth_weekday(2026, 11, 3, 4)  # 4번째 목요일
assert thx == D(2026, 11, 26)
fomc = D(2026, 12, 9); xmas = D(2026, 12, 25); lastd = D(2026, 12, 31)
assert xmas.weekday() < 5 and lastd.weekday() < 5
cards = [
    {"label": "추수감사절 휴장", "date": thx.strftime("%m.%d") + " (목)", "d": (thx - TODAY).days, "sub": "뉴욕증시 하루 휴장, 다음 날 11.27은 오후 1시 조기 마감"},
    {"label": "다음 FOMC 결정", "date": "12.08~09 회의 · 결정 12.09 (수)", "d": (fomc - TODAY).days, "sub": "미 동부 시각 오후 2시 결정 발표, 경제전망(점도표) 함께 공개", "value": f"지금 정책금리 상단 {FED[-1][1]:.2f}%", "hero": True},
    {"label": "크리스마스 휴장", "date": xmas.strftime("%m.%d") + " (금)", "d": (xmas - TODAY).days, "sub": "뉴욕증시 하루 휴장"},
    {"label": "올해 마지막 거래일", "date": lastd.strftime("%m.%d") + " (목)", "d": (lastd - TODAY).days, "sub": "다음 날 1월 1일은 새해 휴장"},
]
ticks = [{"d": k, "label": (TODAY + dt.timedelta(days=k)).strftime("%m.%d")} for k in range(0, 50, 7)]
head = f"다음 FOMC 결정일인 12월 9일까지 **{cards[1]['d']}일** 남았고 추수감사절 휴장은 **{cards[0]['d']}일** 뒤, 올해 마지막 거래일은 **{cards[3]['d']}일** 뒤임"
add("N091", "tlcount", "카운트다운 칸", "연말까지 일정 네 칸", {
    "eyebrow": {"group": "일정", "topic": "연말까지 남은 미국 증시 · 통화정책 일정", "basis": f"{TODAY.strftime('%Y.%m.%d')} 기준, 단위: 일"}, "head": head,
    "today": {"label": f"오늘 {TODAY.strftime('%m.%d')}"}, "span": 50, "ticks": ticks, "cards": cards,
    "foot": foot(["FOMC 일정은 연준이 공표한 2026년 회의 일정, 휴장일은 뉴욕증권거래소 휴장 달력 기준", "정책금리는 마지막 확인 값"], "연준 FOMC 일정 · 뉴욕증권거래소 휴장일 · FRED(DFEDTARU)", ASOF)},
    {"days": {c["label"]: c["d"] for c in cards}, "policy_rate": FED[-1][1]})

# ───────── N092 시대 구분 띠 ─────────
cpi = L4("CPIAUCSL"); rec = L4("USREC")
cm = {(d.year, d.month): v for d, v in cpi}
yoy = []
lastk = max(cm)
t = (1970, 1)
while t <= lastk:
    p = (t[0] - 1, t[1])
    yoy.append(round((cm[t] / cm[p] - 1) * 100, 2) if t in cm and p in cm else None)
    t = (t[0], t[1] + 1) if t[1] < 12 else (t[0] + 1, 1)
nmon = len(yoy); last_ym = lastk
print("결측 월", [i for i, v in enumerate(yoy) if v is None])
print("N092 yoy", nmon, last_ym, yoy[-1])
recm = {(d.year, d.month): v for d, v in rec}
eras_def = [("석유파동 · 고물가", 1970, 1980), ("고금리 · 물가 안정", 1980, 1990), ("장기 호황", 1990, 2000), ("버블 붕괴 · 금융위기", 2000, 2010), ("제로금리 · 저물가", 2010, 2020), ("팬데믹 · 재인플레", 2020, 2020 + nmon / 12 - 50 + 0)]
eras = []
for nm, a, b in eras_def:
    i0 = (a - 1970) * 12; i1 = min(nmon, (b - 1970) * 12) if b != eras_def[-1][2] else nmon
    seg = [v for v in yoy[i0:i1] if v is not None]
    rc = sum(1 for k in range(i0, i1) if recm.get((1970 + k // 12, k % 12 + 1), 0) == 1)
    end_y = 1970 + i1 / 12
    avg = sum(seg) / len(seg)
    eras.append({"name": nm, "from": 1970 + i0 / 12, "to": end_y, "range": f"{a}~{str(int(end_y - 1e-6))[2:]}" if nm != "팬데믹 · 재인플레" else "2020~", "nums": [{"v": f"{avg:.1f}%", "label": "월별 물가 상승률 평균"}, {"v": f"{rc}개월", "label": "경기 침체로 분류된 기간"}], "_avg": avg, "_rec": rc})
hi_era = max(eras, key=lambda e: e["_avg"])
head = f"1970년 이후 물가 상승률 평균이 가장 높았던 시대는 **{hi_era['name']}({hi_era['nums'][0]['v']})**였고 2020년대는 **{eras[-1]['nums'][0]['v']}**로 다시 높아졌음"
add("N092", "tleras", "시대 구분 띠", "1970년 이후 여섯 시대", {
    "eyebrow": {"group": "미국 물가", "topic": "시대별 물가 상승률과 침체 기간", "basis": "전년 동월 대비, 단위: %"}, "head": head,
    "from": 1970.0, "to": 1970 + nmon / 12, "data": yoy, "y": {"min": -3, "max": 15, "ticks": [0, 5, 10, 15]}, "unit": "%",
    "eras": [{k: v for k, v in e.items() if not k.startswith("_")} for e in eras],
    "foot": foot(["시대 이름은 해당 기간을 대표하는 공개 사건으로 붙인 구분, 침체 기간은 NBER 기준 월 수"], "FRED(CPIAUCSL · USREC)", ym(D(last_ym[0], last_ym[1], 1)))},
    {"eras": [[e["name"], round(e["_avg"], 2), e["_rec"]] for e in eras]})

# ───────── N093 임기 막대 (연준 의장 + 3개월 국채금리) ─────────
t3 = L4("DGS3MO")
mon = {}
for d, v in t3:
    mon.setdefault((d.year, d.month), []).append(v)
mk = sorted(mon); t3m = [round(sum(mon[k]) / len(mon[k]), 2) for k in mk]
assert mk[0] == (2000, 1)
ch_def = [("그린스펀", D(1987, 8, 11), D(2006, 1, 31), "cmp", "2001.01 첫 인하 · 닷컴 붕괴 대응", D(2000, 1, 3)),
          ("버냉키", D(2006, 2, 1), D(2014, 1, 31), "g65", "2008.12 정책금리 0~0.25% · 양적완화 시작", None),
          ("옐런", D(2014, 2, 3), D(2018, 2, 3), "cmp", "2015.12 7년 만의 첫 인상", None),
          ("파월", D(2018, 2, 5), D(2026, 5, 15), "main", "2020.03 긴급 인하 · 2022.03 인상 시작", None)]
chairs = []
for nm, a, b, tn, dec_, a2 in ch_def:
    rs = [v for d, v in t3 if (a2 or a) <= d <= b]
    chairs.append({"name": nm, "from": yf(a2 or a) if a2 else yf(a), "to": yf(b), "span": f"{ym(a)}~{ym(b)}", "range": f"{min(rs):.1f}~{max(rs):.1f}%", "decision": dec_, "tone": tn, "_lo": min(rs), "_hi": max(rs)})
chairs[0]["from"] = 2000.0
mxc = max(chairs, key=lambda c: c["_hi"])
wid = max(chairs, key=lambda c: c["_hi"] - c["_lo"])
head = f"2000년 이후 의장 임기 중 3개월 국채금리 고점은 {mxc['name']} **{mxc['_hi']:.1f}%**였고 {wid['name']} 임기는 **{wid['_lo']:.1f}~{wid['_hi']:.1f}%**로 변동 폭이 가장 컸음"
add("N093", "tlterm", "임기 막대", "연준 의장 임기와 단기 금리", {
    "eyebrow": {"group": "연준 의장", "topic": "의장 임기 네 구간과 3개월 국채금리", "basis": "월평균, 단위: %"}, "head": head,
    "from": 2000.0, "to": 2027.0, "data": t3m, "y": {"min": 0, "max": 7, "ticks": [0, 2, 4, 6]}, "unit": "%", "chartTitle": "미국 3개월 국채금리",
    "chairs": [{k: v for k, v in c.items() if not k.startswith("_")} for c in chairs],
    "foot": foot(["그린스펀 임기는 1987.08~2006.01이며 자료 시작(2000.01)부터 표시, 파월 임기 끝은 임기 만료 예정일(2026.05)", "연방기금금리 장기 자료가 없어 3개월 국채금리로 대신 봄"], "FRED(DGS3MO)", t3[-1][0].strftime("%Y.%m.%d"))},
    {"chairs": [[c["name"], c["range"]] for c in chairs]})

# ───────── N094 펼친 구간 ─────────
pts_full = [[yf(d), v] for i, (d, v) in enumerate(FED) if i == 0 or FED[i - 1][1] != v]
w_a, w_b = D(2022, 3, 1), D(2025, 12, 31)
inwin = [(d, p, v) for d, p, v in chg if w_a <= d <= w_b]
zpts = [[yf(w_a), at(FED, w_a)]] + [[yf(d), v] for d, p, v in inwin]
changes = [{"t": yf(d), "v": v, "text": sgn(v - p), "up": v > p} for d, p, v in inwin]
nup_z = sum(1 for d, p, v in inwin if v > p); ndn_z = len(inwin) - nup_z
net = at(FED, w_b) - at(FED, w_a)
zticks = [{"t": yf(D(y, m, 1)), "label": f"{y}.{m:02d}"} for y in range(2022, 2026) for m in (1, 7) if D(y, m, 1) > w_a] + [{"t": yf(D(2025, 12, 31)), "label": "2025.12"}]
head = f"2022년 3월~2025년 12월 한 구간만 펼치면 정책금리는 **{len(inwin)}번** 바뀌어 인상 **{nup_z}회** · 인하 **{ndn_z}회**였고 상단은 **{at(FED, w_b):.2f}%**로 끝남"
add("N094", "tlzoom", "펼친 구간 타임라인", "정책금리 전체 줄과 한 구간 확대", {
    "eyebrow": {"group": "연준 금리", "topic": "정책금리 전체 줄과 2022~2025 확대", "basis": "목표 상단, 단위: %"}, "head": head,
    "y": {"max": 6}, "unit": "%", "fullTitle": "전체 2008.12~2026.11",
    "full": {"from": 2008.9, "to": yf(LAST_FED) + .02, "pts": pts_full, "ticks": [2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024, 2026]},
    "win": {"from": yf(w_a), "to": yf(w_b), "title": "펼친 구간 2022.03~2025.12"},
    "zoomTitle": "펼친 구간의 결정 하나하나(변화폭, %p)", "zoomNote": f"순변화 {sgn(net)}%p",
    "zoom": {"pts": zpts, "ticks": zticks, "changes": changes},
    "foot": foot(["숫자는 결정 때마다 바뀐 목표 상단의 변화폭(%p)"], "FRED(DFEDTARU)", LAST_FED.strftime("%Y.%m.%d"))},
    {"changes": [[ym(d), p, v] for d, p, v in inwin], "net": net})

# ───────── N095 24시간 시계 (발표 시각) ─────────
items = [
    {"t": "04:00", "next": True, "name": "미국 FOMC 금리 결정", "sub": "현지 오후 2시(미 동부 표준시)", "tag": "미국", "tone": "main"},
    {"t": "08:00", "name": "한국 소비자물가", "sub": "통계청 · 현지 오전 8시", "tag": "한국", "tone": "g65"},
    {"t": "08:30", "name": "일본 소비자물가", "sub": "총무성 · 현지 오전 8시 30분", "tag": "일본", "tone": "g65"},
    {"t": "10:30", "name": "중국 소비자물가", "sub": "국가통계국 · 현지 오전 9시 30분", "tag": "중국", "tone": "g65"},
    {"t": "19:00", "name": "유로존 물가 속보", "sub": "유로스탯 · 현지 오전 11시(중부유럽 표준시)", "tag": "유로존", "tone": "cmp"},
    {"t": "22:15", "name": "ECB 금리 결정", "sub": "현지 오후 2시 15분(중부유럽 표준시)", "tag": "유로존", "tone": "cmp"},
    {"t": "22:30", "name": "미국 소비자물가 · 고용", "sub": "현지 오전 8시 30분(미 동부 표준시)", "tag": "미국", "tone": "main"},
]
head = "주요 물가 · 금리 발표 일곱 건은 한국 시각 새벽 **4시**부터 밤 **10시 30분** 사이에 흩어져 있고, 미국 발표 두 건은 밤과 새벽으로 나뉘어 시차 확인이 필요함"
add("N095", "tlclock", "24시간 시계", "나라별 발표 시각을 24시간 시계에", {
    "eyebrow": {"group": "발표 일정", "topic": "물가 · 금리 발표를 한국 시각 24시간 시계에", "basis": "한국 시각(KST), 11~3월 표준시 기준"}, "head": head,
    "center": {"label": "한국 시각", "sub": "24시간"}, "work": {"from": 9, "to": 18, "label": "한국 낮 9~18시"}, "items": items,
    "foot": foot(["미국 · 유럽이 서머타임인 기간(3월 중순~10월 말)은 해당 발표가 한 시간 앞당겨짐", "발표 시각은 각 기관이 공표하는 통상 시각, 기관 사정으로 바뀔 수 있음"], "각 기관 공표 일정(연준 · 통계청 · 총무성 · 국가통계국 · 유로스탯 · ECB · 미 노동부)", ASOF)},
    {"items": [[i["t"], i["name"]] for i in items]})

# ───────── N096 단계 이정표 (연준 자산 매입 단계 + 드는 돈) ─────────
wal = L4("WALCL")
sd = [("금융위기 대응(QE1 포함)", D(2008, 9, 10), D(2010, 3, 31), "긴급 대출 · 주택저당증권 · 국채 매입", "main"),
      ("QE2 매입 재개", D(2010, 11, 3), D(2011, 6, 29), "국채 6,000억 달러 추가 매입", "main"),
      ("QE3 매입 확대", D(2012, 9, 12), D(2014, 10, 29), "매달 850억 달러 매입으로 시작", "main"),
      ("코로나 대응 매입", D(2020, 3, 11), D(2022, 3, 16), "국채 · 주택저당증권 무제한 매입 선언", "main"),
      ("자산 축소(QT)", D(2022, 6, 1), wal[-1][0], "만기 자산을 다시 사지 않고 줄임", "cmp")]
stages = []
for k, (nm, a, b, sub, tn) in enumerate(sd):
    va, vb = at(wal, a) / 1e6, at(wal, b) / 1e6
    stages.append({"no": str(k + 1), "name": nm, "years": f"{ym(a)}~{ym(b) if b != wal[-1][0] else ''}", "sub": sub, "value": round(vb - va, 2), "label": f"총자산 {va:.1f}→{vb:.1f}조 달러", "tone": tn})
pk = max(wal, key=lambda z: z[1])
tot = sum(s_["value"] for s_ in stages[:4])
head = f"연준 총자산은 네 단계 매입으로 **{tot:.1f}조 달러** 늘어 {pk[0].year}년 {pk[0].month}월 **{pk[1] / 1e6:.1f}조 달러**에 이르렀고 축소 단계에서 **{abs(stages[4]['value']):.1f}조 달러** 줄었음"
add("N096", "tlmile", "단계 이정표", "연준 자산 매입 · 축소 다섯 단계", {
    "eyebrow": {"group": "연준 자산", "topic": "자산 매입 네 단계와 축소 한 단계", "basis": "총자산 증감, 단위: 조 달러"}, "head": head,
    "stages": stages, "valueTitle": "단계 동안 연준 총자산 증감(조 달러)", "dec": 1, "unit": "",
    "foot": foot(["시작은 위기 직전(1단계) 또는 발표 직전 주, 끝은 매입 종료 주 기준(축소 단계는 최근 주까지)", "총자산은 연준 대차대조표 총자산(주간)"], "FRED(WALCL)", wal[-1][0].strftime("%Y.%m.%d"))},
    {"stages": [[s_["name"], s_["value"], s_["label"]] for s_ in stages], "peak": [str(pk[0]), pk[1]]})

# ───────── N097 법안 진행 단계 (2025 OBBBA) ─────────
debt = L4("GFDEGDQ188S")
d_sign = at(debt, D(2025, 7, 1)); d_last = debt[-1][1]
bst = [{"name": "하원 위원회 심의", "date": "2025.05", "vote": "예산 · 세입위원회 통과"}, {"name": "하원 본회의 통과", "date": "05.22", "vote": "215 대 214"},
       {"name": "상원 본회의 통과", "date": "07.01", "vote": "51 대 50 · 부통령 결정표"}, {"name": "하원 재표결", "date": "07.03", "vote": "218 대 214"},
       {"name": "대통령 서명", "date": "07.04", "vote": "법률로 확정"}, {"name": "시행", "date": "07.04~", "vote": "지금 이 단계", "now": True}]
head = f"2025년 7월 4일 서명된 감세 · 지출법은 하원 두 번과 상원 한 번의 표결을 거쳤고 서명 분기 연방부채는 GDP의 **{d_sign:.1f}%**였고 부채 한도는 **5조 달러** 올라갔음"
pts = [[debt_d.year + (debt_d.month - 1) / 12, v] for debt_d, v in debt if debt_d.year >= 2015]
add("N097", "tlbill", "법안 진행 단계", "2025년 감세 · 지출법 진행 단계", {
    "eyebrow": {"group": "재정", "topic": "2025년 감세 · 지출법(H.R.1)이 법이 되기까지", "basis": "표결 결과와 연방부채 비율"}, "head": head,
    "stages": bst, "pin": "지금 위치", "note": "One Big Beautiful Bill Act",
    "stats": [{"v": f"{d_sign:.1f}%", "label": "서명 분기(2025년 3분기) 연방부채 / GDP"}, {"v": f"{d_last:.1f}%", "label": "가장 최근(2026년 2분기) 연방부채 / GDP"}, {"v": "+5조 달러", "label": "법안이 올린 연방 부채 한도"}],
    "chart": {"from": 2015, "to": 2026.4, "pts": pts, "y": {"min": 90, "max": 130, "ticks": [100, 110, 120]}, "title": "연방부채 / GDP(분기, %)", "mark": {"t": 2025.5, "label": "서명 2025.07"}},
    "foot": foot(["하원 · 상원 표결 수는 본회의 최종 표결 기준, 연방부채는 공공 보유 아닌 총부채 기준 비율"], "미 의회 표결 기록 · FRED(GFDEGDQ188S)", debt[-1][0].strftime("%Y.%m.%d"))},
    {"sign_quarter_debt": d_sign, "latest_debt": d_last})

# ───────── N098 사건 카드 연속 (2023 은행 불안) ─────────
vix = L4("VIXCLS")
st0 = D(2023, 3, 1); en0 = D(2023, 5, 5)


def nxt(d):
    while at(vix, d) is None or not any(a == d for a, _ in vix):
        d += dt.timedelta(days=1)
    return d


ev5 = [("03.08", D(2023, 3, 8), "실버게이트 은행 청산 계획", "암호화폐 업체 예금이 빠지자 자발적 청산 계획을 밝힘"),
       ("03.10", D(2023, 3, 10), "SVB 폐쇄", "캘리포니아 금융당국이 폐쇄하고 예금보험공사가 관리를 맡음"),
       ("03.12", D(2023, 3, 12), "시그니처은행 폐쇄 · 연준 대출 창구", "연준이 은행 기간대출 프로그램(BTFP)을 만들어 예금 이탈에 대비"),
       ("03.19", D(2023, 3, 19), "UBS, 크레디트스위스 인수", "스위스 당국 주도로 UBS가 크레디트스위스를 인수하기로 합의"),
       ("05.01", D(2023, 5, 1), "퍼스트리퍼블릭 매각", "예금보험공사가 은행을 접수하고 JP모건체이스가 인수")]
vp = [(a, v) for a, v in vix if st0 <= a <= en0]
cards5, marks5 = [], []
for lab, d, ti, te in ev5:
    d2 = nxt(d); v = dict(vix)[d2]
    cards5.append({"date": lab, "title": ti, "text": te, "stat": {"label": f"VIX 종가({d2.strftime('%m.%d')})", "value": f"{v:.1f}"}})
    marks5.append({"d": (d2 - st0).days, "v": v})
vmax = max(vp, key=lambda z: z[1]); v_may = dict(vix)[nxt(D(2023, 5, 1))]
head = f"2023년 3월 은행 불안이 이어지며 VIX는 {vmax[0].month}월 {vmax[0].day}일 **{vmax[1]:.1f}**까지 올랐고 5월 1일 퍼스트리퍼블릭 매각 때는 **{v_may:.1f}**로 내려와 충격이 빠르게 가라앉았음"
ticks = [{"d": (D(2023, m, 1) - st0).days, "label": f"{m}월 1일"} for m in (3, 4, 5)]
add("N098", "tlcards", "사건 카드 연속", "2023년 은행 불안 다섯 사건", {
    "eyebrow": {"group": "금융 안정", "topic": "2023년 은행 불안 다섯 사건과 VIX", "basis": "일별 종가, 단위: 지수"}, "head": head,
    "cards": cards5, "chart": {"from": 0, "to": (en0 - st0).days, "pts": [[(a - st0).days, v] for a, v in vp], "y": {"min": 10, "max": 30, "ticks": [10, 20, 30]}, "title": "VIX 변동성 지수(일별)", "ticks": ticks, "marks": marks5},
    "foot": foot(["주말에 일어난 사건(03.12 · 03.19)은 다음 거래일 종가를 표시"], "FRED(VIXCLS), 사건 날짜는 공개 보도 · 당국 발표", vp[-1][0].strftime("%Y.%m.%d"))},
    {"vix": {c["date"]: c["stat"]["value"] for c in cards5}, "max": [str(vmax[0]), vmax[1]]})

# ───────── 쓰기 ─────────
(ROOT / "library" / "mockups" / "v4").mkdir(parents=True, exist_ok=True)
(ROOT / "library" / "mockups" / "v4" / "F08.json").write_text(json.dumps(OUT, ensure_ascii=False, indent=1), encoding="utf-8")
deck = {"schema": 3, "meta": {"session": "R1", "title": "F08 1차 목업"}, "slides": [o["slide"] for o in OUT]}
(ROOT / "style" / "demo4_r1_F08.json").write_text(json.dumps(deck, ensure_ascii=False, indent=1), encoding="utf-8")
print(len(OUT), "장")
for o in OUT:
    print(o["id"], o["kind"], chars(o["slide"]["head"]), o["slide"]["head"])
