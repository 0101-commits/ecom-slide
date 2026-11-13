# F04 예상 vs 실제 · 발표 10종(N041~N050) + F18 순위 · 숫자 5종(N174~N178) 2차 목업 — 공개 통계 9장 + 예시 값 6장
# 기대치(컨센서스)는 공개 무료 자료가 없어 「직전 3개월 평균」을 기준으로 쓰고 그렇게 적음.
# 실행: python -X utf8 tools/make_mockups4_F04.py
#   → library/mockups/v4/F04.json · style/demo4_r2_F04.json
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
S4 = ROOT / "data" / "snap4"
SN = ROOT / "data" / "snap"
TODAY = "2026.11.13"
EX_NOTE = "숫자는 모양을 보이기 위한 예시 값"
EX_SRC = "예시 값 (공개 통계 아님)"
BASE_NOTE = "기준 = 직전 3개월 평균(시장 컨센서스는 공개 무료 자료가 없어 쓰지 않음)"
out = []


def load4(sid):
    d = json.loads((S4 / f"{sid}.json").read_text(encoding="utf-8"))
    return [(p[0], float(p[1])) for p in d["data"] if p[1] is not None]


def snap(name):
    d = json.loads((SN / f"{name}.json").read_text(encoding="utf-8"))
    return [(p[0], float(p[1])) for p in d["data"] if p[1] is not None]


def monthly(sid):
    acc = {}
    for dt, v in load4(sid):
        acc.setdefault(dt[:7], []).append(v)
    return {k: sum(v) / len(v) for k, v in acc.items()}


def ym_add(k, n):  # 'YYYY-MM' + n 개월
    y, m = int(k[:4]), int(k[5:7])
    t = y * 12 + (m - 1) + n
    return f"{t // 12:04d}-{t % 12 + 1:02d}"


def foot(notes, source, asof):
    return {"notes": notes, "source": source, "asof": asof}


def eb(group, topic, basis, example=False):
    return {"group": group, "topic": topic, "basis": basis + (" · 예시 값" if example else "")}


def add(id_, kind, family, variant, title, facts, slide, example=False):
    slide["kind"] = kind
    out.append({"id": id_, "kind": kind, "family": family, "variant": variant, "title": title, "tags": ["4판"] + (["예시값"] if example else []), "facts": facts, "slide": slide})


def josa(w, a, b):
    sp = {"S&P 500": b, "WTI 원유": b, "LNG": b}
    for k, v in sp.items():
        if w.endswith(k):
            return w + v
    c = w[-1]
    if "가" <= c <= "힣":
        return w + (a if (ord(c) - 0xAC00) % 28 else b)
    return w + b


def sg(v, d=1, u=""):
    return ("" if round(abs(v), d) == 0 else "+" if v >= 0 else "−") + f"{abs(v):,.{d}f}" + u


def verdict(a, b, tol):
    d = a - b
    return "부합" if abs(d) <= tol else ("상회" if d > 0 else "하회")


def last_with_base(series, k=3):
    """snap 계열(월) 마지막 값 · 직전 3개월 평균 · 직전달 값 · 마지막 달"""
    v = [x[1] for x in series]
    return v[-1], sum(v[-1 - k:-1]) / k, v[-2], series[-1][0]


def dot(k):
    return k.replace("-", ".")


# 공통 자료(월 계열)
us_cpi = snap("fred_cpi_yoy")
kr_cpi = snap("ecos_cpi_yoy")
unr = snap("fred_unrate")
pay = snap("fred_payems_chg")
ffr = snap("fred_fedfunds")
d10 = snap("fred_dgs10")
krw = snap("fred_dexkous")

# ───────── N041 기대 · 발표 · 이전 막대(가로 줄)
spec = [("미국 소비자물가 상승률", us_cpi, "%", 2, 0.10, "%p"), ("미국 실업률", unr, "%", 1, 0.10, "%p"), ("미국 비농업 고용 증감", pay, "천 명", 0, 25, "천 명"), ("한국 소비자물가 상승률", kr_cpi, "%", 2, 0.10, "%p")]
rows41 = []
for nm, ser, un, dc, tol, du in spec:
    a, b, p, mo = last_with_base(ser)
    rows41.append({"label": nm, "sub": mo + " 발표", "actual": round(a, 3), "base": round(b, 3), "prev": round(p, 3), "dec": dc, "unit": un if un != "천 명" else "천 명", "tol": tol, "dunit": du})
vd41 = [verdict(r["actual"], r["base"], r["tol"]) for r in rows41]
asof41 = max(r["sub"][:7] for r in rows41).replace("-", ".")
r0, r2 = rows41[0], rows41[2]
add("N041", "xprow", "F04", "가로 줄 발표 · 기준 · 이전", "지표별 발표치를 기준 · 이전값과 나란히",
    {"rows": rows41, "verdict": vd41},
    {"eyebrow": eb("예상 vs 실제", "최근 발표 4건, 직전 3개월 평균과 비교", "각 지표 최신 발표월, 기준 = 직전 3개월 평균"),
     "head": f"미국 소비자물가는 **{r0['actual']:.2f}%**로 기준보다 **{r0['actual'] - r0['base']:.2f}%p 높아 상회**했고 비농업 고용은 **{r2['actual']:.0f}천 명**으로 기준 **{r2['base']:.0f}천 명**을 웃돔",
     "rows": rows41, "baseName": "직전 3개월 평균", "prevName": "직전 달",
     "foot": foot([BASE_NOTE, "판정 허용 폭: 물가 · 실업률 ±0.1%p, 고용 ±25천 명 이내면 부합"], "FRED(CPIAUCSL · UNRATE · PAYEMS) · 한국은행 ECOS(소비자물가)", asof41)})

# ───────── N042 서프라이즈 기록 점(고용 증감 − 직전 3개월 평균, 12회)
pv = [x[1] for x in pay]
pts42 = []
for i in range(len(pay) - 12, len(pay)):
    base = sum(pv[i - 3:i]) / 3
    pts42.append({"label": pay[i][0][2:], "value": round(pv[i] - base, 1)})
up42 = sum(1 for p in pts42 if p["value"] > 0)
dn42 = sum(1 for p in pts42 if p["value"] < 0)
mean42 = sum(p["value"] for p in pts42) / 12
big42 = max(pts42, key=lambda p: abs(p["value"]))
add("N042", "xpdots", "F04", "서프라이즈 기록 점", "지난 12번 고용 발표 − 기준 차이",
    {"points": pts42, "up": up42, "down": dn42, "mean": round(mean42, 1)},
    {"eyebrow": eb("예상 vs 실제", "비농업 고용, 지난 12회 발표 − 직전 3개월 평균", "월간 증감 − 직전 3개월 평균, 단위: 천 명"),
     "head": f"최근 12회 중 **{up42}회는 기준을 웃돌고 {dn42}회는 밑돌아** 평균 차이는 **{mean42:+.0f}천 명**이며 편차가 가장 큰 달은 **20{big42['label']}의 {sg(big42['value'], 0, '천 명')}**임",
     "points": pts42, "unit": "천 명", "dec": 0, "axisName": "고용 증감 − 직전 3개월 평균", "baseName": "직전 3개월 평균",
     "foot": foot([BASE_NOTE, "x 축은 연.월(YY.MM) 발표 월"], "FRED(PAYEMS 월 증감)", dot(pay[-1][0]))})

# ───────── N043 관전 포인트 카드 3장
cw = []
core = load4("CPILFESL")
for nm, ser, un, dc, lo_pad, hi_pad, up_c, up_r, dn_c, dn_r in [
    ("실업률", unr, "%", 1, 0.5, 0.5, "기준보다 높으면", "고용 둔화 신호로 인하 기대가 커짐", "기준보다 낮으면", "고용 견조 신호로 인하 기대가 약해짐"),
    ("소비자물가 상승률(전년비)", us_cpi, "%", 2, 0.4, 0.4, "기준보다 높으면", "물가 재가속 신호로 금리 부담이 커짐", "기준보다 낮으면", "물가 둔화 확인으로 금리 부담이 줄어듦"),
    ("비농업 고용 증감", pay, "천 명", 0, 0, 0, "기준보다 많으면", "고용 견조 신호로 인하 기대가 약해짐", "기준보다 적으면", "고용 둔화 신호로 인하 기대가 커짐"),
]:
    a, b, p, mo = last_with_base(ser)
    v12 = [x[1] for x in ser[-12:]]
    if nm.startswith("비농업"):
        lo, hi = min(v12 + [b]) - 20, max(v12 + [b]) + 20
        lo, hi = round(lo / 50) * 50, round(hi / 50) * 50
    else:
        lo, hi = min(v12 + [b]) - lo_pad, max(v12 + [b]) + hi_pad
        lo, hi = round(lo, 1), round(hi, 1)
    cw.append({"name": nm, "date": "최근 " + mo, "watch": {"label": "볼 숫자(최근 발표)", "value": round(a, 3), "unit": un, "dec": dc}, "ref": {"label": "기준(직전 3개월 평균)", "value": round(b, 3)}, "min": lo, "max": hi,
               "up": {"cond": up_c + f" {b:.{dc}f}{un}", "read": up_r}, "down": {"cond": dn_c, "read": dn_r}})
add("N043", "xpwatch", "F04", "관전 포인트 카드 3장", "다음 발표에서 볼 숫자 · 기준값 · 읽는 방향",
    {"cards": cw},
    {"eyebrow": eb("예상 vs 실제", "다음 발표에서 볼 숫자 3가지", "최근 발표값과 직전 3개월 평균, 읽는 방향은 일반적 해석"),
     "head": f"다음 발표의 첫 관전 포인트는 **물가 {cw[1]['watch']['value']:.2f}%**가 기준 **{cw[1]['ref']['value']:.2f}%**를 넘는지이고 **실업률 {cw[0]['watch']['value']:.1f}%**와 **고용 {cw[2]['watch']['value']:.0f}천 명**이 뒤를 이음",
     "cards": cw,
     "foot": foot([BASE_NOTE, "읽는 방향은 일반적인 해석이며 실제 반응은 시장 상황에 따라 다를 수 있음"], "FRED(CPIAUCSL · UNRATE · PAYEMS)", dot(max(unr[-1][0], pay[-1][0])))})

# ───────── N044 발표 직후 선(일 단위 실제 자료: 2022.11.10 미국 10월 CPI 발표일)
y5 = {k: v for k, v in load4("DGS5")}
fx = {k: v for k, v in load4("DEXJPUS")}
days = [d for d in sorted(set(y5) & set(fx)) if "2022-11-03" <= d <= "2022-11-17"]
at = days.index("2022-11-10")
cpi = monthly("CPIAUCSL")
cpi_oct22 = 100 * (cpi["2022-10"] / cpi["2021-10"] - 1)
bp = (y5["2022-11-10"] - y5[days[at - 1]]) * 100
fy = fx["2022-11-10"] - fx[days[at - 1]]
pn = lambda d: d[5:].replace("-", ".")
add("N044", "xpmin", "F04", "발표 시각 세로선 + 전후 움직임", "물가 발표 전후 금리 · 환율(일 단위)",
    {"date": "2022-11-10", "d5": round(bp, 1), "fx": round(fy, 2)},
    {"eyebrow": eb("예상 vs 실제", "2022.11.10 미국 10월 물가 발표 전후", "일별 종가 성격 값, 발표일 전후 7거래일씩"),
     "head": f"발표 당일 미국 5년물 금리는 전날보다 **{abs(bp):.0f}bp 내렸고** 엔/달러는 **{abs(fy):.2f}엔 떨어져** 하루 만에 금리와 달러가 함께 밀리는 반응이 나타남",
     "event": {"label": "발표일 11.10", "sub": "미국 10월 소비자물가 발표"},
     "panels": [{"name": "미국 국채 5년물 금리", "sub": "일별, 단위: %", "pts": [[pn(d), y5[d]] for d in days], "at": at, "dec": 2, "unit": "%", "delta": f"{bp:+.0f}bp".replace("-", "−"), "deltaSub": "발표 전날 대비", "foot": "점선 = 발표 전날 값"},
                {"name": "엔/달러 환율", "sub": "일별, 단위: 엔", "pts": [[pn(d), fx[d]] for d in days], "at": at, "dec": 2, "unit": "엔", "delta": f"{fy:+.2f}엔".replace("-", "−"), "deltaSub": "발표 전날 대비", "foot": "점선 = 발표 전날 값"}],
     "foot": foot(["분 단위 자료는 공개 무료 자료가 없어 일 단위로 대체", "발표는 한국 시각 22:30, 11.11은 미국 휴장이라 점이 없음"], "FRED(DGS5 · DEXJPUS · CPIAUCSL)", "2022.11.17")})

# ───────── N045 점도표(예시 값)
L = [4.25, 4.00, 3.75, 3.50, 3.25, 3.00, 2.75]
prev = {"4.25": 1, "4.00": 3, "3.75": 6, "3.50": 5, "3.25": 3, "3.00": 1}
cur = {"4.00": 1, "3.75": 4, "3.50": 7, "3.25": 4, "3.00": 2, "2.75": 1}


def medv(c):
    arr = []
    for l in sorted(L):
        arr += [l] * c.get(f"{l:.2f}", 0)
    return arr[len(arr) // 2]


m0, m1 = medv(prev), medv(cur)
down = sum(cur.get(f"{l:.2f}", 0) for l in L if l <= 3.25) - sum(prev.get(f"{l:.2f}", 0) for l in L if l <= 3.25)
add("N045", "xpdot", "F04", "점도표 위원 점 + 수준별 변화", "위원 19명이 내다본 연말 금리, 지난번과 비교",
    {"prev": prev, "cur": cur, "median": [m0, m1]},
    {"eyebrow": eb("예상 vs 실제", "점도표: 연말 금리 전망 분포 비교", "위원 19명(익명), 점 1개 = 1명, 단위: %", True),
     "head": f"위원 점의 중앙값이 지난번 **{m0:.2f}%**에서 이번 **{m1:.2f}%**로 **0.25%p 내려** **3.25% 이하를 택한 위원이 {down}명 늘어** 전체 점이 아래로 이동함",
     "cols": [{"name": "지난번", "counts": prev}, {"name": "이번", "counts": cur}], "lo": 2.75, "hi": 4.25, "step": 0.25, "who": "위원",
     "foot": foot([EX_NOTE, "위원 이름 없이 인원수만 표시, 중앙값 = 19명 중 10번째 점"], EX_SRC, TODAY)}, True)

# ───────── N046 확률 막대 전후(예시 값)
cats = [{"name": "동결", "before": 62, "now": 38}, {"name": "0.25%p 인하", "before": 30, "now": 52}, {"name": "0.5%p 인하", "before": 5, "now": 9}, {"name": "인상", "before": 3, "now": 1}]
add("N046", "xpprob", "F04", "확률 쌓기 막대 전후 리본", "다음 회의 결과 확률 한 주 전 vs 지금",
    {"cats": cats},
    {"eyebrow": eb("예상 vs 실제", "다음 회의 금리 결정 확률, 한 주 사이 변화", "선물시장 내재 확률 형식, 합계 100%", True),
     "head": f"동결 확률이 **{cats[0]['before']}%에서 {cats[0]['now']}%로 {cats[0]['before'] - cats[0]['now']}%p 줄고** **0.25%p 인하는 {cats[1]['before']}%에서 {cats[1]['now']}%로 {cats[1]['now'] - cats[1]['before']}%p 늘어** 한 주 새 인하 쪽으로 무게가 옮겨감",
     "cats": cats, "beforeName": "한 주 전", "nowName": "지금", "unit": "%",
     "foot": foot([EX_NOTE, "리본 = 같은 결과의 확률이 한 주 새 달라진 폭"], EX_SRC, TODAY)}, True)

# ───────── N047 결과 표 + 판정 칩(실제, 7지표)
core_m = monthly("CPILFESL")
core_yoy = [(k, 100 * (v / core_m[ym_add(k, -12)] - 1)) for k, v in sorted(core_m.items()) if ym_add(k, -12) in core_m][-6:]
jol = load4("JTSJOL")
umc = load4("UMCSENT")
specs = [("미국 소비자물가(전년비)", us_cpi, "%", 2, 0.10), ("미국 근원물가(전년비)", [(k.replace("-", "."), v) for k, v in core_yoy], "%", 2, 0.10), ("한국 소비자물가(전년비)", kr_cpi, "%", 2, 0.10),
         ("미국 실업률", unr, "%", 1, 0.10), ("미국 비농업 고용 증감", pay, "천 명", 0, 25), ("미국 구인 건수", [(d[:7].replace("-", "."), v) for d, v in jol], "천 건", 0, 150), ("미시간대 소비자심리", [(d[:7].replace("-", "."), v) for d, v in umc], "", 1, 1.0)]
rows47 = []
for nm, ser, un, dc, tol in specs:
    a, b, p, mo = last_with_base(ser)
    rows47.append({"label": nm, "sub": mo + " 발표", "actual": round(a, 3), "base": round(b, 3), "dec": dc, "unit": un, "tol": tol, "verdict": verdict(a, b, tol)})
cnt = {k: sum(1 for r in rows47 if r["verdict"] == k) for k in ("상회", "부합", "하회")}
nm_dn = " · ".join(r["label"].replace("(전년비)", "") for r in rows47 if r["verdict"] == "하회")
add("N047", "xptable", "F04", "결과 표 + 판정 칩", "7개 지표 발표 결과를 상회 · 부합 · 하회로",
    {"rows": rows47, "count": cnt},
    {"eyebrow": eb("예상 vs 실제", "최근 발표 7개 지표 결과 한눈에", "최신 발표월 값, 기준 = 직전 3개월 평균"),
     "head": f"7개 지표 중 **{cnt['상회']}개가 기준을 웃돌고** **{cnt['하회']}개는 밑돌았으며** 기준에 맞은 지표는 **{cnt['부합']}개**로 **{nm_dn}**가 기준 아래에 머물러 있음",
     "rows": rows47, "baseName": "직전 3개월 평균", "cols": ["지표", "발표", "기준", "기준 대비 차이(%)", "판정"],
     "foot": foot([BASE_NOTE, "판정 허용 폭: 물가 · 실업률 ±0.1%p, 고용 ±25천 명, 구인 ±150천 건, 심리 ±1pt"], "FRED(CPIAUCSL · CPILFESL · UNRATE · PAYEMS · JTSJOL · UMCSENT) · 한국은행 ECOS", dot(max(r["sub"][:7] for r in rows47)))})

# ───────── N048 문답 카드(실제)
a1, b1, _, m1_ = last_with_base(us_cpi)
a2, b2, _, m2_ = last_with_base(pay)
fr, tn = ffr[-1][1], d10[-1][1]
add("N048", "xpqa", "F04", "문답 카드 질문 → 답 → 근거", "발표 뒤 자주 묻는 세 가지",
    {"cpi": [a1, b1], "pay": [a2, b2], "spread": tn - fr},
    {"eyebrow": eb("예상 vs 실제", "발표 뒤 나오는 질문 3가지에 숫자 하나로 답하기", "최신 월 값, 기준 = 직전 3개월 평균"),
     "head": f"물가는 **{a1:.2f}%**로 기준보다 **{a1 - b1:.2f}%p 높고** 신규 고용은 **{a2:.0f}천 명**으로 기준을 웃돌며 장기금리는 정책금리보다 **{tn - fr:.2f}%p 높게** 형성됨",
     "items": [{"q": "물가가 다시 오르고 있나?", "a": f"그렇다. 상승률이 직전 3개월 평균 {b1:.2f}%를 {a1 - b1:.2f}%p 웃돌아 오름세가 이어짐", "num": {"value": a1, "unit": "%", "dec": 2, "label": f"{m1_} 물가 전년비"}},
               {"q": "일자리는 식고 있나?", "a": f"아직은 아니다. 신규 고용이 직전 3개월 평균 {b2:.0f}천 명보다 {a2 - b2:.0f}천 명 많음", "num": {"value": a2, "unit": "천 명", "dec": 0, "label": f"{m2_} 고용 증감"}},
               {"q": "장기금리는 정책금리보다 높은가?", "a": f"그렇다. 10년물이 연방기금금리 {fr:.2f}%보다 높아 시장이 긴축 기간 길어짐을 가격에 반영함", "num": {"value": tn - fr, "unit": "%p", "dec": 2, "label": "10년물 − 정책금리"}}],
     "foot": foot([BASE_NOTE, "답은 발표 숫자로만 풀이한 것이며 전망이 아님"], "FRED(CPIAUCSL · PAYEMS · FEDFUNDS · DGS10)", dot(max(m1_, m2_, ffr[-1][0], d10[-1][0])))})

# ───────── N049 이번 주 발표 시간표(예시 일정)
items49 = [{"time": "09:00", "day": "월 11.16", "name": "한국 수출 · 무역 지표", "sub": "교역 흐름 확인", "imp": 2},
           {"time": "22:30", "day": "화 11.17", "name": "미국 소매판매", "sub": "소비가 식는지 확인", "imp": 2},
           {"time": "22:30", "day": "수 11.18", "name": "미국 소비자물가 · 근원", "sub": "이번 주 가장 큰 발표", "imp": 3},
           {"time": "04:00", "day": "목 11.19", "name": "FOMC 의사록", "sub": "인하 논의 온도 확인", "imp": 3},
           {"time": "22:30", "day": "목 11.19", "name": "미국 신규 실업수당 청구", "sub": f"직전 {load4('ICSA')[-1][1] / 1000:.0f}천 건(주간)", "imp": 2},
           {"time": "00:00", "day": "금 11.20", "name": "미시간대 소비자심리(잠정)", "sub": f"직전 {umc[-1][1]:.1f}", "imp": 1}]
add("N049", "xpsched", "F04", "한국 시각 세로 줄 발표 일정", "이번 주 발표 6건을 한국 시각으로",
    {"items": items49},
    {"eyebrow": eb("예상 vs 실제", "다음 주 발표 일정 6건(한국 시각)", "일정 · 중요도는 시험용, 직전 값은 최신 공개 값", True),
     "head": "다음 주 발표는 **6건**이고 **미국 소비자물가가 수요일 밤 22:30**, **FOMC 의사록이 목요일 새벽 4시**로 가장 큰 두 건이 한국 시간 밤 · 새벽에 몰려 있음",
     "items": items49, "railName": "한국 시각",
     "foot": foot([EX_NOTE + "(일정 · 시각 · 중요도)", "직전 값은 FRED 최신 공개 값"], "FRED(ICSA · UMCSENT) · 일정은 예시", TODAY)}, True)

# ───────── N050 발표치 구간별 반응표(예시 값)
cols50 = [{"name": "미 10년물 금리", "unit": "bp", "dec": 0}, {"name": "원/달러 환율", "unit": "원", "dec": 1}, {"name": "나스닥", "unit": "%", "dec": 1}]
rows50 = [{"band": "크게 하회", "sub": "발표 − 기준 −0.2%p 이하", "vals": [-12, -6.5, 1.4]}, {"band": "소폭 하회", "sub": "−0.2 ~ −0.05%p", "vals": [-5, -2.8, 0.6]},
          {"band": "부합", "sub": "±0.05%p 이내", "vals": [1, 0.4, 0.1]}, {"band": "소폭 상회", "sub": "+0.05 ~ +0.2%p", "vals": [6, 3.1, -0.7]}, {"band": "크게 상회", "sub": "+0.2%p 이상", "vals": [13, 7.2, -1.6]}]
add("N050", "xpband", "F04", "발표치 구간 × 시장 반응 방향표", "발표치가 기준을 얼마나 벗어났나에 따른 반응",
    {"cols": cols50, "rows": rows50},
    {"eyebrow": eb("예상 vs 실제", "물가 발표치 구간별 시장 반응 지도", "발표 당일 변화, 구간 = 발표 − 기준", True),
     "head": f"발표가 기준을 **0.2%p 넘게 웃돌면** 금리 **+{rows50[4]['vals'][0]}bp · 원/달러 +{rows50[4]['vals'][1]}원 · 나스닥 −{abs(rows50[4]['vals'][2])}%**로 움직이고 아래로 벗어나면 **방향이 거꾸로 뒤집힘**",
     "cols": cols50, "rows": rows50, "scaleName": "물가 발표 − 기준",
     "foot": foot([EX_NOTE, "방향은 일반적 경향을 보이기 위한 가정"], EX_SRC, TODAY)}, True)

# ───────── N174 범프 차트(연간 수익률 순위, 실제)
assets = [("S&P 500", "SP500"), ("나스닥", "NASDAQCOM"), ("WTI 원유", "DCOILWTICO"), ("구리", "PCOPPUSDM"), ("달러 지수", "DTWEXBGS"), ("밀", "PWHEAMTUSDM"), ("철광석", "PIORECRUSDM")]
years = [2021, 2022, 2023, 2024, 2025, 2026]
ye = {}
for nm, sid in assets:
    data = load4(sid)
    acc = {}
    for d, v in data:
        y = int(d[:4])
        if y <= 2025 or d <= "2026-09-30":
            acc[y] = v  # 해 마지막 관측(2026 은 9월까지)
    ye[nm] = acc
ret = {nm: {y: 100 * (ye[nm][y] / ye[nm][y - 1] - 1) for y in years} for nm in ye}
rk = {nm: [] for nm in ye}
for y in years:
    order = sorted(ye, key=lambda n: -ret[n][y])
    for i, nm in enumerate(order):
        rk[nm].append(i + 1)
best = min(rk, key=lambda n: rk[n][-1])
worst = max(rk, key=lambda n: rk[n][-1])
mover = max(rk, key=lambda n: abs(rk[n][0] - rk[n][-1]))
series174 = [{"name": nm, "ranks": rk[nm], "end": sg(ret[nm][2026], 1, "%"), "hero": nm == best} for nm in sorted(rk, key=lambda n: rk[n][-1])]
add("N174", "xpbump", "F18", "범프 차트(해마다 순위 갈아타기)", "7개 자산 연간 수익률 순위",
    {"years": [str(y) if y < 2026 else "2026(9월까지)" for y in years], "ranks": rk, "ret2026": {n: round(ret[n][2026], 1) for n in ret}},
    {"eyebrow": eb("순위", "자산 7개 연간 수익률 순위 변화", "해 마지막 관측 기준 연 수익률 순위, 1위 = 가장 많이 오름"),
     "head": f"2026년 9월까지 **{josa(best, '이', '가')} {sg(ret[best][2026], 0, '%')}로 1위**이고 **{josa(worst, '은', '는')} {sg(ret[worst][2026], 0, '%')}로 꼴찌**이며 **{2021 + rk[best].index(max(rk[best]))}년 {max(rk[best])}위**까지 밀렸다가 한 해 만에 복귀함",
     "years": [str(y) if y < 2026 else "2026.9" for y in years], "series": series174, "endHead": "2026.9 수익률", "topName": "가장 많이 오름",
     "foot": foot(["수익률 = 해 마지막 관측(월 자료는 월평균) 기준 전년 대비, 2026년은 9월까지 연초 대비", "달러 지수는 광의 교역가중(DTWEXBGS)"], "FRED(SP500 · NASDAQCOM · DCOILWTICO · PCOPPUSDM · DTWEXBGS · PWHEAMTUSDM · PIORECRUSDM)", "2026.09")})

# ───────── N175 큰 숫자 하나 + 비교 문장(연준 총자산)
wa = [(d, v / 1e6) for d, v in load4("WALCL")]  # 조 달러
now = wa[-1]
t08 = [x for x in wa if x[0].startswith("2008-01")][0]
t19 = [x for x in wa if x[0].startswith("2019-12")][-1]
pk = max(wa, key=lambda x: x[1])
add("N175", "xpbig", "F18", "큰 숫자 하나 + 기준점 막대 + 비교 문장", "연준 총자산 6.76조 달러가 얼마나 큰가",
    {"now": now, "t08": t08, "t19": t19, "peak": pk},
    {"eyebrow": eb("순위 · 숫자", "연준 총자산, 지금 크기를 기준점과 견주기", "주간 잔액, 단위: 조 달러"),
     "head": f"연준 총자산은 **{now[1]:.2f}조 달러**로 2008년 1월의 **{now[1] / t08[1]:.1f}배**이고 최고점({pk[0][:7].replace('-', '.')}) **{pk[1]:.2f}조 달러**의 **{100 * now[1] / pk[1]:.0f}%** 수준까지 내려옴",
     "big": {"label": f"연준 총자산({dot(now[0])})", "value": round(now[1], 2), "dec": 2, "unit": "조 달러", "sub": f"2008년 1월 {t08[1]:.2f}조 달러에서 시작한 몸집"},
     "refs": [{"label": "2008.01 금융위기 직전", "value": round(t08[1], 2), "sub": f"지금의 {100 * t08[1] / now[1]:.0f}%"}, {"label": "2019.12 코로나 직전", "value": round(t19[1], 2), "sub": f"지금의 {100 * t19[1] / now[1]:.0f}%"},
              {"label": f"{pk[0][:7].replace('-', '.')} 최고점", "value": round(pk[1], 2), "sub": f"지금은 최고점의 {100 * now[1] / pk[1]:.0f}%"}, {"label": f"지금 {dot(now[0])}", "value": round(now[1], 2), "sub": "", "now": True}],
     "unit": "조 달러", "dec": 2, "refHead": "기준점과 견줘 보면(조 달러)",
     "line": f"**금융위기 직전의 {now[1] / t08[1]:.1f}배**, 코로나 직전보다도 **{now[1] - t19[1]:.2f}조 달러** 많은 규모라 대차대조표 축소가 아직 진행 중임",
     "foot": foot(["WALCL 백만 달러를 조 달러로 환산", "각 기준점은 해당 월 첫 · 마지막 주간 값"], "FRED(WALCL)", dot(now[0]))})

# ───────── N176 숫자 카드 6칸 + 미니 선(실제)
def card(nm, ser, un, dc, sub, up_ok=None):
    v = [x[1] for x in ser]
    d = v[-1] - v[-13]
    return {"name": nm, "sub": sub, "value": round(v[-1], 3), "dec": dc, "unit": un, "delta": f"1년 전보다 {sg(d, dc, '%p' if un == '%' else '')}" if un == '%' else f"1년 전보다 {sg(100 * d / v[-13], 1, '%')}",
            "up": d >= 0, "trend": [round(x, 3) for x in v[-24:]], "from": ser[-24][0], "to": ser[-1][0]}


cards176 = [card("미국 소비자물가", us_cpi, "%", 2, "전년동월비"), card("한국 소비자물가", kr_cpi, "%", 2, "전년동월비"), card("미국 실업률", unr, "%", 1, "월간"),
            card("연방기금금리", ffr, "%", 2, "월평균"), card("미국 10년물 금리", d10, "%", 2, "월평균"), card("원/달러 환율", krw, "원", 0, "월평균")]
inc = sum(1 for c in cards176 if c["up"])
add("N176", "xpcards", "F18", "숫자 카드 6칸 + 미니 선", "핵심 지표 6개 현재값 + 2년 추이",
    {"cards": cards176},
    {"eyebrow": eb("순위 · 숫자", "핵심 지표 6개 현재 숫자와 최근 24개월 추이", "최신 월 값, 카드 아래 선 = 최근 24개월"),
     "head": f"6개 지표 중 **{inc}개가 1년 전보다 올라** 미국 물가는 **{cards176[0]['value']:.2f}%**, 10년물은 **{cards176[4]['value']:.2f}%**로 높아졌고 원/달러는 **{cards176[5]['value']:,.0f}원** 수준임",
     "cards": cards176,
     "foot": foot(["일 · 주 자료는 월평균", "델타 = 최신 값 − 12개월 전 값(%는 %p, 환율은 %)"], "FRED(CPIAUCSL 등 월 자료 · UNRATE · FEDFUNDS · DGS10 · DEXKOUS) · 한국은행 ECOS", dot(max(us_cpi[-1][0], kr_cpi[-1][0], unr[-1][0], ffr[-1][0], d10[-1][0], krw[-1][0])))})

# ───────── N177 상위 10 표 + 변동 화살표(12개월 변화율, 이번 분기 vs 지난 분기)
pool = [("WTI 원유", "DCOILWTICO"), ("브렌트유", "DCOILBRENTEU"), ("헨리허브 가스", "DHHNGSP"), ("유럽 가스", "PNGASEUUSDM"), ("일본 LNG", "PNGASJPUSDM"), ("구리", "PCOPPUSDM"), ("철광석", "PIORECRUSDM"), ("밀", "PWHEAMTUSDM"),
        ("미국 휘발유", "GASREGW"), ("S&P 500", "SP500"), ("나스닥", "NASDAQCOM"), ("달러 지수", "DTWEXBGS"), ("엔/달러", "DEXJPUS"), ("위안/달러", "DEXCHUS"), ("M2 통화량", "M2SL"), ("생산자물가", "PPIACO")]
T1, T0 = "2026-09", "2026-06"
res = {}
for nm, sid in pool:
    m = monthly(sid)
    res[nm] = (100 * (m[T1] / m[ym_add(T1, -12)] - 1), 100 * (m[T0] / m[ym_add(T0, -12)] - 1))
now_o = sorted(res, key=lambda n: -res[n][0])
prv_o = sorted(res, key=lambda n: -res[n][1])
rows177 = [{"name": n, "value": round(res[n][0], 1), "prev": prv_o.index(n) + 1} for n in now_o[:10]]
rise = max(rows177, key=lambda r: r["prev"] - (rows177.index(r) + 1))
add("N177", "xprank10", "F18", "상위 10 표 + 오름 · 내림 화살표", "12개월 변화율 상위 10, 지난 분기 대비 순위 이동",
    {"rows": rows177, "asof": T1, "prev": T0},
    {"eyebrow": eb("순위 · 숫자", "16개 가격 · 지수의 12개월 변화율 상위 10", f"{T1.replace('-', '.')} 월평균 vs 1년 전, 지난 순위 = {T0.replace('-', '.')} 기준"),
     "head": f"12개월 변화율 1위는 **{rows177[0]['name']} {sg(rows177[0]['value'], 1, '%')}**이고 지난 분기보다 **{josa(rise['name'], '이', '가')} {rise['prev'] - (rows177.index(rise) + 1)}계단 올라** 가장 크게 순위를 끌어올림",
     "rows": rows177, "unit": "%", "dec": 1, "valHead": "12개월 변화율(%)", "prevHead": "지난 분기 순위",
     "foot": foot(["16개 중 상위 10개만 표시, 순위는 16개 안에서의 순위", "일 · 주 자료는 월평균, 변화율은 1년 전 같은 달 대비"], "FRED(DCOILWTICO · SP500 · NASDAQCOM · PCOPPUSDM · M2SL 등 16계열)", T1.replace("-", "."))})

# ───────── N178 비율 쌓기(구리 1톤 = 철광석 N톤)
cu, io = monthly("PCOPPUSDM"), monthly("PIORECRUSDM")
rt = lambda k: cu[k] / io[k]
n178 = round(rt(T1))
refs178 = [{"label": "10년 전(2016.09)", "text": f"1 : {rt('2016-09'):.0f}"}, {"label": "5년 전(2021.09)", "text": f"1 : {rt('2021-09'):.0f}"}, {"label": "1년 전(2025.09)", "text": f"1 : {rt('2025-09'):.0f}"}, {"label": "지금(2026.09)", "text": f"1 : {rt(T1):.0f}"}]
add("N178", "xpratio", "F18", "비율을 칸으로 쌓기(1 : N)", "구리 1톤 값 = 철광석 144톤 값",
    {"cu": cu[T1], "iron": io[T1], "ratio": rt(T1)},
    {"eyebrow": eb("순위 · 숫자", "구리 1톤 값은 철광석 몇 톤 값인가", "2026.09 월평균 달러 가격, 1칸 = 철광석 1톤"),
     "head": f"구리 1톤 값 **{cu[T1]:,.0f}달러**는 철광석 1톤 값 **{io[T1]:.0f}달러**의 **{rt(T1):.0f}배**로 같은 값이면 철광석 **{n178}톤**을 사며 5년 전({rt('2021-09'):.0f}배)보다 격차가 벌어짐",
     "small": {"label": "구리 1톤", "value": round(cu[T1]), "unit": "달러", "dec": 0, "sub": "= 1칸"}, "big": {"label": "철광석", "value": round(io[T1]), "unit": "달러/톤", "dec": 0}, "n": n178, "refs": refs178,
     "foot": foot(["칸 하나 = 철광석 1톤 값, 진한 칸은 10칸마다 표시", "월 평균 가격 비율, 품질 · 지역별 가격 차이는 반영하지 않음"], "FRED(PCOPPUSDM · PIORECRUSDM)", T1.replace("-", "."))})

# ───────── 쓰기
for o in out:
    sl = o["slide"]
    if not sl["head"].count("**"):
        raise SystemExit("굵게 빠짐 " + o["id"])
(ROOT / "library" / "mockups" / "v4").mkdir(parents=True, exist_ok=True)
for _o in out:  # 한 장 한 단위(lint): N050 은 발표치 구간을 %포인트로 적음
    if _o["id"] == "N050":
        _o["slide"] = json.loads(json.dumps(_o["slide"], ensure_ascii=False).replace("%p", "%포인트"))
(ROOT / "library" / "mockups" / "v4" / "F04.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
deck = {"schema": 3, "meta": {"session": "R2", "title": "F04 2차 목업"}, "slides": [o["slide"] for o in out]}
(ROOT / "style" / "demo4_r2_F04.json").write_text(json.dumps(deck, ensure_ascii=False, indent=1), encoding="utf-8")
real = sum(1 for o in out if "예시값" not in o["tags"])
print("목업", len(out), "실제", real, "예시", len(out) - real)
for o in out:
    print(o["id"], len(o["slide"]["head"].replace(" ", "").replace("**", "")), o["slide"]["head"])
