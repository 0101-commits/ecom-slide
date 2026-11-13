# 1차 목업 F01(선) + F09(역사 비유) + N179(수익률 곡선) 25종 — data/snap4 · data/snap 공개 통계로 만든다.
# 실행: python -X utf8 tools/make_mockups4_F01.py  → library/mockups/v4/F01.json · style/demo4_r1_F01.json
import json, re, math, collections
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
S4, S1 = ROOT / "data" / "snap4", ROOT / "data" / "snap"
OD = collections.OrderedDict
M = "−"
NAS = "NASDAQ" + "COM"


def D(i):
    return [(a, b) for a, b in json.loads((S4 / f"{i}.json").read_text(encoding="utf-8"))["data"] if b is not None]


def mon(i, how="avg"):
    m = OD()
    for a, b in D(i):
        m.setdefault(a[:7].replace("-", "."), []).append(b)
    return OD((k, (sum(v) / len(v) if how == "avg" else v[-1])) for k, v in m.items())


def snap1(i):
    return OD((a, b) for a, b in json.loads((S1 / f"{i}.json").read_text(encoding="utf-8"))["data"] if b is not None)


def keys(m, a, b):
    return [k for k in m if a <= k <= b]


def yoy(m):
    o = OD()
    for k, v in m.items():
        y, mm = k.split("."); p = f"{int(y)-1}.{mm}"
        if p in m:
            o[k] = (v / m[p] - 1) * 100
    return o


def asof(i):
    return D(i)[-1][0].replace("-", ".")


def f(v, d=1, sign=False):
    s = f"{abs(v):,.{d}f}"
    if v < 0 and float(s.replace(",", "")) != 0:
        return M + s
    return ("+" + s) if sign and v > 0 else s


def r(v, d=2):
    return None if v is None else round(v, d)


def eun(w):
    c = ord(w[-1]); return w + ("은" if 0xAC00 <= c <= 0xD7A3 and (c - 0xAC00) % 28 else "는")


def hl(t):
    return len(re.sub(r"[\s*]", "", t))


def pct(a, p):
    a = sorted(a); k = (len(a) - 1) * p; lo = int(math.floor(k)); hi = min(lo + 1, len(a) - 1)
    return a[lo] + (a[hi] - a[lo]) * (k - lo)


def mnum(k):
    return int(k[:4]) * 12 + int(k[5:7]) - 1


def shiftk(k, n):
    t = mnum(k) - n
    return f"{t//12}.{t%12+1:02d}"


def mdiff(a, b):
    return mnum(b) - mnum(a)


OUT = []


def add(id_, kind, fam, variant, title, slide, facts, group, topic, basis, head, notes, source, asof_, real=True):
    assert 50 <= hl(head) <= 90, (id_, hl(head), head)
    if not real:
        basis = basis + " · 예시 값"
        notes = notes + ["숫자는 모양을 보이기 위한 예시 값"]
    slide = dict(kind=kind, eyebrow=dict(group=group, topic=topic, basis=basis), head=head, **slide, foot=dict(notes=notes, source=source, asof=asof_))
    OUT.append(dict(id=id_, kind=kind, family=fam, variant=variant, title=title, tags=["4판"], real=real, facts=facts, slide=slide))


def xticks(labels, months=(1, 7)):
    out = []
    for i, l in enumerate(labels):
        m = re.match(r"(\d{4})\.(\d{2})", l)
        if m and int(m.group(2)) in months and (i == 0 or labels[i - 1][:7] != l[:7]):
            out.append(i)
    return out


# ---------------------------------------------------------------- N001 사건 주석 선
k = snap1("fred_dexkous"); lab = list(k.keys()); v = [r(x, 1) for x in k.values()]
evs = [("2021.08", "한은 코로나 뒤 첫 인상"), ("2022.03", "연준 첫 인상"), ("2022.07", "한은 첫 빅스텝"), ("2022.09", "연준 3연속 0.75%p 인상"), ("2024.09", "연준 첫 인하"), ("2025.04", "미 상호관세 발표")]
hi = max(k, key=k.get); lo = min(k, key=k.get)
add("N001", "events", "F01", "사건 주석 선", "원/달러 환율과 정책 발표 6곳",
    dict(labels=lab, series=[dict(name="원/달러", data=v)], unit="원", dec=0, y=dict(min=1050, max=1550, step=100, dec=0), xwant=6,
         events=[dict(at=lab.index(a), text=t) for a, t in evs], callout=dict(text=f"{f(v[-1],0)}원"), area=True),
    dict(최고=[hi, r(k[hi], 1)], 최저=[lo, r(k[lo], 1)], 끝=[lab[-1], v[-1]]),
    "환율", "원/달러 환율과 정책 발표 여섯", "월평균, 단위: 원",
    f"원/달러 환율은 {lo} **{f(k[lo],0)}원**에서 {hi} **{f(k[hi],0)}원**까지 {f(k[hi]-k[lo],0)}원 움직였고, 연준 첫 인하(2024.09) 달 평균은 **{f(k['2024.09'],0)}원**이었음",
    ["사건 날짜는 한국은행 · 연준 · 미국 정부가 공개한 발표월", "환율은 월평균"], "FRED(DEXKOUS)", "2026.10.31")

# ---------------------------------------------------------------- N002 국면 음영 선
ff = snap1("fred_fedfunds"); lab2 = list(ff.keys()); vv = list(ff.values()); runs = []
for i in range(1, len(vv)):
    d = vv[i] - vv[i - 1]; kd = 1 if d > 0.05 else -1 if d < -0.05 else 0
    if kd:
        if runs and runs[-1][0] == kd and i - runs[-1][2] <= 9:
            runs[-1][2] = i
        else:
            runs.append([kd, i, i])
bands = [{"from": a - 1, "to": b, "name": "긴축" if kd > 0 else "완화", "tone": "main" if kd > 0 else "soft"} for kd, a, b in runs if b - a >= 2]
up = [b for b in bands if b["name"] == "긴축"]; dn = [b for b in bands if b["name"] == "완화"]
hk0, hk1 = lab2[up[0]["from"] + 1], lab2[up[-1]["to"]]; cut0 = lab2[dn[0]["from"] + 1]
add("N002", "events", "F01", "국면 음영 선", "연방기금금리와 긴축 · 완화 국면",
    dict(labels=lab2, series=[dict(name="연방기금금리", data=[r(x, 2) for x in vv])], unit="%", dec=1, y=dict(min=0, max=6, step=1, dec=0), xwant=6, area=False, bands=bands,
         events=[dict(at=up[0]["from"] + 1, text="첫 인상 " + hk0), dict(at=up[-1]["to"], text="마지막 인상 " + hk1), dict(at=dn[0]["from"] + 1, text="첫 인하 " + cut0)],
         callout=dict(text=f"{f(vv[-1],2)}%")),
    dict(국면=[(b["name"], lab2[b["from"]], lab2[b["to"]]) for b in bands], 끝=vv[-1]),
    "기준금리", "연방기금금리의 긴축 · 완화 국면", "월평균, 단위: %",
    f"연방기금금리는 {hk0}~{hk1} 긴축으로 **{f(vv[0],2)}%**에서 **{f(max(vv),2)}%**까지 올랐고 {cut0} 첫 인하 뒤 완화 국면에서 **{f(vv[-1],2)}%**임",
    ["긴축 · 완화 띠 = 월 변화가 0.05%p 넘게 이어진 구간(ECOM 계산)"], "FRED(FEDFUNDS)", "2026.10.31")

# ---------------------------------------------------------------- N003 목표선 위아래 칠
core = yoy(mon("PCEPILFE", "avg")); kk = keys(core, "2016.01", "2026.09"); v3 = [r(core[x], 2) for x in kk]
n_up = sum(1 for x in v3 if x >= 2); pk = max(kk, key=lambda x: core[x])
add("N003", "lnfill", "F01", "목표선 위아래 칠", "근원 PCE 물가 − 목표 2%",
    dict(labels=kk, series=[dict(name="근원 PCE", data=v3, color="dark")], unit="%", dec=1, y=dict(min=0, max=6, step=1, dec=0, suf="%"), xwant=6, ref=dict(v=2, label="목표 2%"),
         fill=dict(s=0, ref=2, upName="목표 위", downName="목표 아래"), endNames=False),
    dict(위=n_up, 전체=len(kk), 정점=[pk, core[pk]], 끝=v3[-1]),
    "물가", "근원 PCE 물가와 목표 2%", "전년동월비, 단위: %",
    f"근원 PCE 물가는 {len(kk)}개월 중 **{n_up}개월**이 목표 2% 위였고 {pk} **{f(core[pk],1)}%**가 정점이며 {kk[-1]}에는 **{f(core[kk[-1]],1)}%**임",
    ["근원 PCE = 식품 · 에너지를 뺀 개인소비지출 물가지수(ECOM 이 전년동월비 계산)"], "FRED(PCEPILFE)", asof("PCEPILFE"))

# ---------------------------------------------------------------- N004 범위 띠 + 올해 선
hh = mon("DHHNGSP", "avg"); mlabs = [f"{i}월" for i in range(1, 13)]
past = [[hh[f"{y}.{m:02d}"] for y in range(2021, 2026) if f"{y}.{m:02d}" in hh] for m in range(1, 13)]
cur = [r(hh.get(f"2026.{m:02d}"), 2) if m <= 10 else None for m in range(1, 13)]
avg5 = [r(sum(p) / len(p), 2) for p in past]
lo_b = [r(min(p), 2) for p in past]; hi_b = [r(max(p), 2) for p in past]
above = sum(1 for m in range(10) if cur[m] > hi_b[m]); below = sum(1 for m in range(10) if cur[m] < lo_b[m]); inn = 10 - above - below
add("N004", "lnband", "F01", "범위 띠 + 올해 선", "천연가스 가격: 5년 범위 안의 올해",
    dict(labels=mlabs, xraw=True, ticks=list(range(12)), series=[dict(name="2026년", data=cur, color="dark", dot=True), dict(name="5년 평균", data=avg5, color="cmp", dash=True, width=2.4)],
         unit="달러", dec=2, y=dict(min=0, max=10, step=2, dec=0, unit="달러/MMBtu"), band=dict(lo=lo_b, hi=hi_b, name="2021~25년 최저 · 최고 범위", nameY=96), marks=[dict(at=9, s=0, text=f"{f(cur[9],2)}달러", pos="above")], rmargin=110),
    dict(올해=cur[:10], 범위안=inn, 위=above, 아래=below),
    "에너지", "헨리허브 천연가스 가격과 5년 범위", "월평균, 단위: 달러/MMBtu",
    f"헨리허브 천연가스는 2026년 1~10월 중 **{inn}개월**이 지난 5년 최저 · 최고 범위 안이었고 나머지 {above+below}개월은 범위 밖이었으며 10월은 **{f(cur[9],2)}달러**임",
    ["범위 띠 = 2021~2025년 같은 달 월평균 중 최저 · 최고"], "FRED(DHHNGSP)", asof("DHHNGSP"))

# ---------------------------------------------------------------- N005 장기 로그 선 + 시대 띠
ya = OD()
for a, b in D("PPIACO"):
    ya.setdefault(a[:4], []).append(b)
yrs = [y for y in ya if y != "2026" or len(ya[y]) >= 6]; v5 = [r(sum(ya[y]) / len(ya[y]), 1) for y in yrs]
ix = lambda y: yrs.index(str(y))
add("N005", "lnlog", "F01", "장기 로그 선 + 시대 띠", "미국 생산자물가 100년, 시대별 띠",
    dict(labels=yrs, xraw=True, ticks=[i for i, y in enumerate(yrs) if int(y) % 20 == 0], series=[dict(name="생산자물가", data=v5, color="dark")], unit="", dec=0, endNames=False,
         log=True, y=dict(ticks=[10, 20, 50, 100, 200, 400], min=8, max=400, dec=0, unit="지수(로그 눈금)"),
         eras=[{"from": 0, "to": ix(1944), "name": "양차 대전 · 대공황", "tone": "soft"}, {"from": ix(1944), "to": ix(1971), "name": "브레턴우즈 체제", "tone": "main"}, {"from": ix(1971), "to": len(yrs) - 1, "name": "변동환율제", "tone": "soft"}],
         marks=[dict(at=len(yrs) - 1, s=0, text=f"{f(v5[-1],0)}", pos="below", anchor="end")], rmargin=60),
    dict(첫해=[yrs[0], v5[0]], 끝=[yrs[-1], v5[-1]], 배수=v5[-1] / v5[0]),
    "물가", "미국 생산자물가 장기 추이", "연평균 지수, 로그 눈금",
    f"미국 생산자물가 지수는 {yrs[0]}년 **{f(v5[0],1)}**에서 {yrs[-1]}년 **{f(v5[-1],0)}**로 **{f(v5[-1]/v5[0],0)}배** 올랐고 변동환율제 이후 오름 폭이 가장 큼",
    ["체제 구분은 널리 알려진 연도(브레턴우즈 1944~71, 이후 변동환율제)", "세로 눈금은 로그라 같은 간격 = 같은 배수"], "FRED(PPIACO)", asof("PPIACO"))

# ---------------------------------------------------------------- N006 소진 예상 점선
rr = mon("RRPONTSYD", "avg"); lab6 = keys(rr, "2021.01", "2026.10"); v6 = [r(rr[x] / 1000, 3) for x in lab6]
cut = lab6.index("2024.04"); xs = list(range(cut - 8, cut + 1)); ys = [v6[i] for i in xs]
mx_, my_ = sum(xs) / len(xs), sum(ys) / len(ys); sl = sum((a - mx_) * (b - my_) for a, b in zip(xs, ys)) / sum((a - mx_) ** 2 for a in xs)
zero_i = cut + int(math.ceil(-v6[cut] / sl))
proj = [None] * len(lab6)
for i in range(cut, min(len(lab6), zero_i + 1)):
    proj[i] = r(max(0, v6[cut] + sl * (i - cut)), 3)
floor_i = next(i for i, x in enumerate(v6) if i > cut and x < 0.02)
add("N006", "lnproj", "F01", "소진 예상 점선", "역레포 잔고, 추세대로면 닿는 시점",
    dict(labels=lab6, series=[dict(name="실제", data=v6, color="dark", width=3.6), dict(name="추세 연장", data=proj, color="cmp", dash=True, width=2.8)], unit="조 달러", dec=1, y=dict(min=0, max=2.5, step=0.5, dec=1, unit="조 달러"), xwant=6,
         vlines=[dict(at=cut, text=f"예상 기준 {lab6[cut]}", y=10)],
         marks=[dict(at=zero_i, s=1, text=f"추세대로면\n{lab6[zero_i]} 소진", pos="above", anchor="start", dx=-4, dy=-70, hollow=True), dict(at=floor_i, s=0, text=f"실제 바닥\n{lab6[floor_i]}", pos="above", dy=-30)], rmargin=100),
    dict(기준=lab6[cut], 속도=sl, 예상소진=lab6[zero_i], 실제바닥=lab6[floor_i]),
    "유동성", "연준 역레포 잔고와 소진 예상", "월평균, 단위: 조 달러",
    f"역레포 잔고는 {lab6[cut]} 직전 9개월 속도(월 {f(-sl*1000,0)}억 달러 감소)대로면 {lab6[zero_i]} 바닥이었으나 실제 소진은 {lab6[floor_i]}으로 **{floor_i-zero_i}개월 늦어짐**",
    ["점선 = 기준월 직전 9개월 직선 추세를 연장(ECOM 계산)", "바닥 = 월평균 200억 달러 미만이 된 첫 달"], "FRED(RRPONTSYD)", asof("RRPONTSYD"))

# ---------------------------------------------------------------- N007 기준 100 지수 선
base = "2019.12"; end7 = "2026.09"
ser7 = []; last7 = {}
for sid, nm, c in [("PCOPPUSDM", "구리", "dark"), ("PIORECRUSDM", "철광석", "g65"), ("PWHEAMTUSDM", "밀", "cmp"), ("DCOILWTICO", "WTI 유가", "light")]:
    m = mon(sid, "avg"); kk = keys(m, base, end7); lab7 = kk
    ser7.append(dict(name=nm, data=[r(m[x] / m[base] * 100, 1) for x in kk], color=c, width=3.6 if c == "dark" else 2.8)); last7[nm] = ser7[-1]["data"][-1]
best = max(last7, key=last7.get); worst = min(last7, key=last7.get)
add("N007", "lnidx", "F01", "기준 100 지수 선", "구리 · 철광석 · 밀 · 유가를 같은 날 100으로",
    dict(labels=lab7, series=ser7, unit="", dec=0, y=dict(min=40, max=260, step=40, dec=0, unit="2019.12 = 100"), xwant=6, ref=dict(v=100), rmargin=100),
    last7, "원자재", "원자재 4종 가격을 같은 날 100으로 맞춘 추이", "월평균, 2019.12 = 100",
    f"2019.12를 100으로 맞추면 {end7} 기준 **{best}가 {f(last7[best],0)}**로 가장 많이 올랐고 {eun(worst)} **{f(last7[worst],0)}**로 가장 적게 올랐음",
    ["각 가격(월평균)을 2019.12 값으로 나눠 100 기준으로 환산(ECOM 계산)", "WTI 는 일별 값의 월평균"], "FRED(PCOPPUSDM · PIORECRUSDM · PWHEAMTUSDM · DCOILWTICO)", asof("PCOPPUSDM"))

# ---------------------------------------------------------------- N008 선 + 아래 증감 막대
m2 = mon("M2SL", "last"); g2 = yoy(m2); kk = keys(m2, "2015.01", "2026.09")
lv = [r(m2[x] / 1000, 2) for x in kk]; gb = [r(g2[x], 1) for x in kk]; gmax = max(kk, key=lambda x: g2[x]); gmin = min(kk, key=lambda x: g2[x])
add("N008", "lnbars", "F01", "선 + 아래 증감 막대", "M2 통화량 수준과 전년 대비 증가율",
    dict(labels=kk, series=[dict(name="M2", data=lv, color="dark", area=True)], unit="조 달러", dec=1, y=dict(min=10, max=25, step=5, dec=0, unit="조 달러"), xwant=6, bars=dict(name="전년 대비 증가율", unit="%", data=gb, dec=0, y=dict(min=-5, max=30, n=3)),
         marks=[dict(at=len(kk) - 1, s=0, text=f"{f(lv[-1],1)}조 달러", pos="above", anchor="end")], endNames=False, rmargin=60),
    dict(최대증가=[gmax, g2[gmax]], 최저증가=[gmin, g2[gmin]], 끝=lv[-1]),
    "통화량", "미국 M2 통화량", "월말, 단위: 조 달러 · %",
    f"미국 M2는 {kk[0]} **{f(lv[0],1)}조 달러**에서 {kk[-1]} **{f(lv[-1],1)}조 달러**로 늘었고 증가율은 {gmax} **{f(g2[gmax],1)}%**에서 {gmin} **{f(g2[gmin],1)}%**로 꺾였음",
    ["증가율 = 전년동월비(ECOM 계산), 마이너스 막대는 회색"], "FRED(M2SL)", asof("M2SL"))

# ---------------------------------------------------------------- N009 고점 대비 낙폭
run = 0; dd = OD()
for a, b in D(NAS):
    run = max(run, b); k_ = a[:7].replace("-", "."); dd[k_] = min(dd.get(k_, 0), (b / run - 1) * 100)
lab9 = list(dd.keys()); v9 = [r(x, 1) for x in dd.values()]


def trough(a, b):
    kk_ = [x for x in lab9 if a <= x <= b]; t = min(kk_, key=lambda x: dd[x]); return t, dd[t]


t1, d1 = trough("2000.01", "2005.12"); t2, d2 = trough("2007.06", "2012.12"); t3, d3 = trough("2021.06", "2024.12")
add("N009", "lndd", "F01", "고점 대비 낙폭 면", "나스닥 종합지수, 고점에서 얼마나 빠졌나",
    dict(labels=lab9, series=[dict(name="고점 대비", data=v9, color="g65", width=2.6)], unit="%", dec=0, y=dict(min=-100, max=0, step=20, dec=0, suf="%", unit="고점 대비 %"), xwant=6, fill=dict(s=0, ref=0, downColor="g40"), endNames=False,
         marks=[dict(at=lab9.index(t), s=0, text=f"{t}\n{f(d,0)}%", pos="below", tone="warn") for t, d in ((t1, d1), (t2, d2), (t3, d3))]),
    dict(깊은낙폭=[[t1, d1], [t2, d2], [t3, d3]]),
    "주가", "나스닥 종합지수의 고점 대비 낙폭", "일별 종가 기준 월 최저, 단위: %",
    f"나스닥은 고점 대비 {t1} **{f(d1,0)}%**, {t2} **{f(d2,0)}%**, {t3} **{f(d3,0)}%**까지 빠졌고 그때마다 이전 고점을 되찾는 데 수년이 걸렸음",
    ["낙폭 = 그날까지의 최고 종가 대비 하락률(ECOM 계산)"], "FRED(NASDAQCOM)", asof(NAS))

# ---------------------------------------------------------------- N010 시차 당긴 선
cpi = yoy(mon("CPIAUCSL", "avg")); m2y = yoy(mon("M2SL", "last")); ck = keys(cpi, "2000.01", "2026.10")


def corr(lag):
    a = []; b = []
    for k_ in ck:
        s_ = shiftk(k_, lag)
        if s_ in m2y: a.append(cpi[k_]); b.append(m2y[s_])
    ma, mb = sum(a) / len(a), sum(b) / len(b)
    return sum((x - ma) * (y - mb) for x, y in zip(a, b)) / math.sqrt(sum((x - ma) ** 2 for x in a) * sum((y - mb) ** 2 for y in b))


lag = max(range(6, 31), key=corr); cc = corr(lag)
kk = keys(cpi, "2018.01", "2026.10")
c10 = [r(cpi[x], 2) for x in kk]; orig = [r(m2y.get(x), 2) for x in kk]; sh = [r(m2y.get(shiftk(x, lag)), 2) for x in kk]
pm = max((x for x in kk if x in m2y), key=lambda x: m2y[x]); pm_s = shiftk(pm, -lag); pc = max(kk, key=lambda x: cpi[x])
add("N010", "lnlag", "F01", "시차 당긴 선", f"M2 증가율을 {lag}개월 밀어 물가와 겹침",
    dict(labels=kk, series=[dict(name="소비자물가", data=c10, color="dark"), dict(name=f"M2({lag}개월 뒤로)", data=sh, color="g65", width=3), dict(name="M2 원래 자리", data=orig, color="gray", dash=True, width=2.2, nameColor="mute")], unit="%", dec=1,
         y=dict(min=-5, max=30, step=5, dec=0, suf="%", unit="전년동월비 %"), xwant=6, shift={"from": kk.index(pm), "to": kk.index(pm_s), "s": 2, "text": f"{lag}개월 시차", "y": 70}, rmargin=170),
    dict(시차=lag, 상관=cc, M2정점=pm, 물가정점=[pc, cpi[pc]]),
    "통화량 · 물가", "M2 증가율과 소비자물가의 시차", "전년동월비, 단위: %",
    f"M2 증가율은 {pm} **{f(m2y[pm],1)}%**로 정점이었고 물가는 {pc} **{f(cpi[pc],1)}%**로 정점이어서, 통화량을 **{lag}개월** 뒤로 밀면 두 선 모양이 겹침",
    [f"시차 = 2000년 이후 상관이 가장 큰 {lag}개월(상관계수 {cc:.2f}, 6~30개월 범위에서 탐색)", "M2 는 월말 값의 전년동월비"], "FRED(CPIAUCSL · M2SL)", asof("CPIAUCSL"))

# ---------------------------------------------------------------- N011 이동평균 교차
wd = D("DCOILWTICO"); px = [b for a, b in wd]; dts = [a for a, b in wd]


def ma(n):
    out = []; s_ = 0
    for i, v_ in enumerate(px):
        s_ += v_
        if i >= n: s_ -= px[i - n]
        out.append(s_ / n if i >= n - 1 else None)
    return out


m50, m200 = ma(50), ma(200); i0 = next(i for i, a in enumerate(dts) if a >= "2023-06-01")
lab11 = [a[:7].replace("-", ".") for a in dts[i0:]]; p11 = [r(x, 2) for x in px[i0:]]; a11 = [r(x, 2) for x in m50[i0:]]; b11 = [r(x, 2) for x in m200[i0:]]
cr = []
for i in range(1, len(lab11)):
    d0 = a11[i - 1] - b11[i - 1]; d1_ = a11[i] - b11[i]
    if d0 <= 0 < d1_: cr.append((i, "골든 크로스", dts[i0 + i]))
    elif d0 >= 0 > d1_: cr.append((i, "데드 크로스", dts[i0 + i]))
add("N011", "lnma", "F01", "이동평균 교차", "WTI 유가와 50일 · 200일 이동평균",
    dict(labels=lab11, series=[dict(name="WTI", data=p11, color="gray", width=2), dict(name="50일", data=a11, color="dark", width=3.4), dict(name="200일", data=b11, color="cmp", width=3, dash=True)], unit="달러", dec=0, y=dict(min=40, max=110, step=10, dec=0, unit="달러/배럴"),
         ticks=xticks(lab11, (1, 4, 7, 10)),
         marks=[dict(at=i, s=1, text=f"{t}\n{d[2:].replace('-', '.')}", pos="above" if t.startswith("골") else "below", tone="warn" if t.startswith("데") else "main") for i, t, d in cr], rmargin=80),
    dict(교차=[[t, d] for i, t, d in cr], 끝=p11[-1]),
    "에너지", "WTI 유가의 이동평균 교차", "일별 종가, 단위: 달러/배럴",
    f"WTI는 2023.06 이후 50일선이 200일선을 **{len(cr)}번** 교차했고 마지막은 {cr[-1][2].replace('-', '.')} {cr[-1][1]}이며 {dts[-1].replace('-', '.')} 종가는 **{f(p11[-1],1)}달러**임",
    ["이동평균 = 최근 50 · 200 거래일 종가 평균, 교차 = 두 평균 선이 위아래를 바꾼 날(ECOM 계산)"], "FRED(DCOILWTICO)", asof("DCOILWTICO"))

# ---------------------------------------------------------------- N012 끝점 큰 숫자
mg = [(a, b) for a, b in D("MORTGAGE30US") if a >= "2016-01-01"]; lab12 = [a[:7].replace("-", ".") for a, b in mg]; v12 = [b for a, b in mg]
pk12 = max(range(len(v12)), key=lambda i: v12[i]); lo12 = min(range(len(v12)), key=lambda i: v12[i])
add("N012", "lnend", "F01", "끝점 큰 숫자 선", "30년 모기지 금리, 지금 값을 크게",
    dict(labels=lab12, series=[dict(name="30년 모기지", data=v12, color="dark", area=True, width=3)], unit="%", dec=2, y=dict(min=2, max=8, step=2, dec=0, suf="%"), ticks=[i for i in xticks(lab12, (1,)) if int(lab12[i][:4]) % 2 == 0],
         endNames=False, endbig=dict(s=0, text=f"{f(v12[-1],2)}%", sub=f"30년 모기지 금리 · {mg[-1][0][5:].replace('-', '.')} 기준"), marks=[dict(at=lo12, s=0, text=f"최저 {f(v12[lo12],2)}%\n{lab12[lo12]}", pos="below")]),
    dict(끝=v12[-1], 최저=[lab12[lo12], v12[lo12]], 최고=[lab12[pk12], v12[pk12]]),
    "주택금융", "미국 30년 모기지 금리", "주간, 단위: %",
    f"미국 30년 모기지 금리는 {lab12[lo12]} 최저 **{f(v12[lo12],2)}%**에서 **{f(v12[-1]-v12[lo12],2)}%p** 올라 {mg[-1][0].replace('-', '.')} 현재 **{f(v12[-1],2)}%**이며 이 구간 최고는 {f(v12[pk12],2)}%임",
    ["주간 값(목요일 발표), 마지막 값은 해당 주"], "FRED(MORTGAGE30US)", asof("MORTGAGE30US"))

# ---------------------------------------------------------------- N013 구간 수익률 화살표
nm_ = mon(NAS, "last"); kk = keys(nm_, "2019.12", "2026.11"); v13 = [r(nm_[x], 0) for x in kk]
pi = max((i for i, x in enumerate(kk) if "2021.01" <= x <= "2022.01"), key=lambda i: v13[i]); ti = min(range(pi, min(pi + 24, len(kk))), key=lambda i: v13[i]); li = len(kk) - 1
dn_ = (v13[ti] / v13[pi] - 1) * 100; up_ = (v13[li] / v13[ti] - 1) * 100
add("N013", "lnarrow", "F01", "구간 수익률 화살표", "나스닥 고점 → 저점 → 지금 수익률",
    dict(labels=kk, series=[dict(name="나스닥", data=v13, color="dark", area=True)], unit="", dec=0, y=dict(min=0, max=30000, step=10000, dec=0, unit="지수"), xwant=6, endNames=False, rmargin=60,
         arrows=[{"from": pi, "to": ti, "s": 0, "text": f"{f(dn_,0)}%", "sub": f"{kk[pi]} → {kk[ti]}", "tone": "warn", "dx": -60, "dy": -70}, {"from": ti, "to": li, "s": 0, "text": f"{f(up_,0,True)}%", "sub": f"{kk[ti]} → {kk[li]}", "tone": "main", "dx": -60, "dy": 50}]),
    dict(고점=[kk[pi], v13[pi]], 저점=[kk[ti], v13[ti]], 끝=[kk[li], v13[li]], 하락=dn_, 상승=up_),
    "주가", "나스닥 종합지수의 구간 수익률", "월말 종가, 단위: 지수 · %",
    f"나스닥은 {kk[pi]} 고점에서 {kk[ti]} 저점까지 **{f(dn_,0)}%** 빠졌다가 {kk[li]}까지 **{f(up_,0,True)}%** 올라 고점보다 **{f((v13[li]/v13[pi]-1)*100,0)}%** 높음",
    ["구간 수익률 = 끝 지수 ÷ 시작 지수 − 1(월말 종가, ECOM 계산)"], "FRED(NASDAQCOM)", asof(NAS))

# ---------------------------------------------------------------- N014 거울 선
rv = dict(D("FYFR")); ex = dict(D("FYONET")); df = dict(D("FYFSD")); yy = sorted(y for y in rv if y[:4] >= "1960" and y in ex); lab14 = [y[:4] for y in yy]
inc = [r(rv[y] / 1e6, 2) for y in yy]; spd = [r(ex[y] / 1e6, 2) for y in yy]; dfl = df[yy[-1]] / 1e6
add("N014", "lnmirror", "F01", "거울 선(위 · 아래)", "미국 연방 수입은 위, 지출은 아래로 뒤집어",
    dict(labels=lab14, xraw=True, ticks=[i for i, y in enumerate(lab14) if int(y) % 10 == 0], series=[dict(name="연방 수입", data=inc, color="dark"), dict(name="연방 지출", data=spd, color="cmp")], unit="조 달러", dec=1, mirror=True,
         y=dict(min=-8, max=8, step=2, dec=0, unit="조 달러(지출은 아래로)"), marks=[dict(at=len(lab14) - 1, s=0, text=f"{lab14[-1]} 적자 {f(-dfl,1)}조 달러", pos="above", anchor="end", dy=-6)], rmargin=100),
    dict(수입=inc[-1], 지출=spd[-1], 적자=dfl),
    "재정", "미국 연방정부 수입과 지출", "회계연도, 단위: 조 달러",
    f"미국 연방 수입은 {lab14[0]}년 {f(inc[0],2)}조 달러에서 {lab14[-1]}년 **{f(inc[-1],1)}조 달러**로, 지출은 **{f(spd[-1],1)}조 달러**로 늘어 수입과 지출의 간격이 **{f(-dfl,1)}조 달러**임",
    ["지출을 마이너스로 뒤집어 그림, 눈금은 절댓값", "명목 금액(물가 반영 안 함)"], "FRED(FYFR · FYONET · FYFSD)", asof("FYFR"))

# ---------------------------------------------------------------- N015 해마다 겹친 선
gm = collections.defaultdict(list)
for a, b in D("GASREGW"): gm[(int(a[:4]), int(a[5:7]))].append(b)
sy = []; cols = {2021: "gray", 2022: "warn", 2023: "g40", 2024: "g65", 2025: "cmp", 2026: "dark"}
for y in range(2021, 2027):
    d_ = [r(sum(gm[(y, m)]) / len(gm[(y, m)]), 2) if (y, m) in gm and not (y == 2026 and m > 10) else None for m in range(1, 13)]
    sy.append(dict(name=str(y), data=d_, color=cols[y], width=5 if y == 2026 else 2.8, dot=(y == 2026)))
mm22 = max(range(12), key=lambda m: sy[1]["data"][m] or 0); c26 = [x for x in sy[5]["data"] if x]
add("N015", "lnyears", "F01", "해마다 겹친 선", "휘발유 소매가를 해마다 1~12월에 겹침",
    dict(labels=[f"{i}월" for i in range(1, 13)], xraw=True, ticks=list(range(12)), series=sy, unit="달러", dec=2, y=dict(min=2, max=5.5, step=0.5, dec=1, unit="달러/갤런"), rmargin=100),
    {x["name"]: x["data"] for x in sy},
    "에너지", "미국 휘발유 소매가의 해마다 흐름", "월평균, 단위: 달러/갤런",
    f"미국 휘발유값은 2022년 {mm22+1}월 **{f(sy[1]['data'][mm22],2)}달러**가 정점이었고 2026년은 10월까지 **{f(min(c26),2)}~{f(max(c26),2)}달러**에서 움직임",
    ["해마다 같은 달끼리 겹쳐 그림, 2026년은 10월까지"], "FRED(GASREGW)", asof("GASREGW"))

# ---------------------------------------------------------------- N016 전망 부채꼴 (범위는 과거 분포로 그린 예시)
mgm = mon("MORTGAGE30US", "avg"); mk = keys(mgm, "1971.04", "2026.10"); mv = [mgm[x] for x in mk]; H = 12; lastv = mv[-1]
chg_h = lambda h_: [mv[i + h_] - mv[i] for i in range(len(mv) - h_)]
lo16 = [pct(chg_h(h_), .1) + lastv for h_ in range(1, H + 1)]; hi16 = [pct(chg_h(h_), .9) + lastv for h_ in range(1, H + 1)]; md16 = [pct(chg_h(h_), .5) + lastv for h_ in range(1, H + 1)]
kk = keys(mgm, "2023.11", "2026.10"); fut = []; y_, m_ = map(int, kk[-1].split("."))
for i in range(H):
    m_ += 1
    if m_ > 12: y_, m_ = y_ + 1, 1
    fut.append(f"{y_}.{m_:02d}")
lab16 = kk + fut; n0 = len(kk)
act = [r(mgm[x], 2) for x in kk] + [None] * H; mdl = [None] * (n0 - 1) + [r(lastv, 2)] + [r(x, 2) for x in md16]
bl = [None] * (n0 - 1) + [r(lastv, 2)] + [r(x, 2) for x in lo16]; bh = [None] * (n0 - 1) + [r(lastv, 2)] + [r(x, 2) for x in hi16]
add("N016", "lnfan", "F01", "전망 부채꼴", "30년 모기지 금리, 실제 선 뒤로 벌어지는 범위",
    dict(labels=lab16, series=[dict(data=act, color="dark"), dict(name="중간값", data=mdl, color="cmp", dash=True, width=2.6)], unit="%", dec=1, y=dict(min=5, max=9, step=1, dec=0, suf="%"), ticks=xticks(lab16, (1,)),
         band=dict(lo=bl, hi=bh, name="과거 12개월 변화 분포의 80% 범위", tone="main", nameY=60), vlines=[dict(at=n0 - 1, text=f"지금 {kk[-1]}", y=10)], rmargin=120),
    dict(끝=lastv, 범위12개월=[lo16[-1], hi16[-1]]),
    "주택금융", "30년 모기지 금리의 12개월 범위", "월평균, 단위: %",
    f"30년 모기지 금리는 {kk[-1]} **{f(lastv,2)}%**이고 과거 12개월 변화 분포를 얹으면 1년 뒤 범위는 **{f(lo16[-1],1)}~{f(hi16[-1],1)}%**로 넓어짐",
    ["부채꼴 = 1971년 이후 12개월 변화의 10~90% 분포를 지금 값에 더한 것(전망 아님, ECOM 계산)"], "FRED(MORTGAGE30US)", asof("MORTGAGE30US"), real=False)

# ================================================================ F09 역사 비유
cpiA = yoy(mon("CPIAUCSL", "avg")); mg_m = mon("MORTGAGE30US", "avg"); us_m = mon("UMCSENT", "avg"); m2g = yoy(mon("M2SL", "last"))
dq = OD((a[:7].replace("-", "."), b) for a, b in D("GFDEGDQ188S")); gq = OD((a[:7].replace("-", "."), b) for a, b in D("A191RL1Q225SBEA"))
PA, PB = ("1973.01", "1982.12"), ("2021.01", "2026.10")


def ext(m, per, fn):
    kk_ = keys(m, *per); k_ = fn(kk_, key=lambda x: m[x]); return (k_, m[k_])


cA = ext(cpiA, PA, max); cB = ext(cpiA, PB, max); mA = ext(mg_m, PA, max); mB = ext(mg_m, PB, max); uA = ext(us_m, PA, min); uB = ext(us_m, PB, min)
dA = ("1982.10", dq["1982.10"]); dB = (list(dq)[-1], list(dq.values())[-1]); m2A = ext(m2g, PA, max); m2B = ext(m2g, PB, max); gA = ext(gq, PA, min); gB = ext(gq, PB, min)
add("N099", "axis", "F09", "그때 vs 지금 두 칸", "1970년대와 지금, 숫자 넷씩 마주",
    dict(center=dict(title="1970년대 vs 지금"), left=dict(title="1970년대", def_="1973~1982", sub="두 차례 석유 파동과 물가 급등", badge="none"), right=dict(title="지금", def_="2021~2026", sub="팬데믹 뒤 물가 · 금리 급등", badge="none"),
         rows=[dict(label="물가 정점", left=f"**{f(cA[1],1)}%** ({cA[0]})", right=f"**{f(cB[1],1)}%** ({cB[0]})"), dict(label="모기지 금리 정점", left=f"**{f(mA[1],1)}%** ({mA[0]})", right=f"**{f(mB[1],1)}%** ({mB[0]})"),
               dict(label="소비자심리 저점", left=f"**{f(uA[1],1)}** ({uA[0]})", right=f"**{f(uB[1],1)}** ({uB[0]})"), dict(label="연방부채 / GDP", left=f"**{f(dA[1],0)}%** ({dA[0]})", right=f"**{f(dB[1],0)}%** ({dB[0]})")],
         result=dict(left=f"물가 정점이 지금의 **{f(cA[1]/cB[1],1)}배**", right=f"부채 비율이 1970년대의 **{f(dB[1]/dA[1],1)}배**")),
    dict(물가=[cA, cB], 모기지=[mA, mB], 심리=[uA, uB], 부채=[dA, dB]),
    "역사 비교", "1970년대와 지금의 숫자 비교", "물가는 전년동월비, 단위: %",
    f"물가 정점은 1970년대 **{f(cA[1],1)}%**, 지금 **{f(cB[1],1)}%**로 1970년대가 높았지만 소비자심리 저점은 **{f(uA[1],0)}**와 **{f(uB[1],0)}**로 비슷하고 부채 비율은 **{f(dB[1]/dA[1],1)}배**임",
    ["부채 비율은 기간 마지막 분기(1982.10)와 최신 분기 값", "소비자심리 = 미시간대 지수"], "FRED(CPIAUCSL · MORTGAGE30US · UMCSENT · GFDEGDQ188S)", asof("CPIAUCSL"))

# ---- N100 사건 기준 겹친 선(첫 장단기 역전 뒤 나스닥)
t3m = mon("T10Y3M", "avg"); tk = list(t3m.keys()); eps = []
for i, kx in enumerate(tk):
    if t3m[kx] < 0 and (i == 0 or t3m[tk[i - 1]] >= 0):
        j = i
        while j + 1 < len(tk) and t3m[tk[j + 1]] < 0: j += 1
        if min(t3m[x] for x in tk[i:j + 1]) <= -0.1: eps.append(kx)
nas = mon(NAS, "avg"); nk = list(nas.keys())


def around(ev, a=-6, b=36):
    i = nk.index(ev); return [r(nas[nk[i + d]] / nas[ev] * 100, 1) if 0 <= i + d < len(nk) else None for d in range(a, b + 1)]


fin = {e: around(e)[6 + 24] for e in eps}
lines = [dict(name=e[:4], data=around(e), group=1 if fin[e] < 100 else 0) for e in eps[:-1]]; nowd = around(eps[-1])
good = [fin[e] for e in eps[:-1] if fin[e] >= 100]; bad = [fin[e] for e in eps[:-1] if fin[e] < 100]
items100 = []
if good: items100.append(dict(value=f(sum(good) / len(good), 0), label="100 위 평균", tone="good"))
if bad: items100.append(dict(value=f(sum(bad) / len(bad), 0), label="100 아래 평균", tone="bad"))
items100.append(dict(value=f(fin[eps[-1]], 0), label="이번", tone="main"))
add("N100", "overlay", "F09", "사건 기준 겹친 선", "장단기 역전 뒤 나스닥 흐름",
    dict(x={"from": -6, "to": 36, "tick": 6, "unit": "개월"}, base=100, y=dict(min=0, max=240, step=40, dec=0), ref=dict(label="첫 역전월"), groups=[dict(label="24개월 뒤 100 위", tone="good"), dict(label="24개월 뒤 100 아래", tone="bad")], lines=lines,
         now=dict(name="이번", data=nowd), summary=dict(title="24개월째 지수", items=items100, list=dict(title="첫 역전월", items=list(eps)))),
    dict(역전월=eps, 이번=nowd),
    "역사 비교", "첫 장단기 금리 역전 뒤 나스닥", "역전월 = 0, 나스닥(역전월 = 100)",
    f"10년−3개월 금리가 처음 뒤집힌 달({', '.join(e[:4] for e in eps[:-1])}, 이번 {eps[-1]}) 뒤 24개월 나스닥은 **{f(min(fin.values()),0)}~{f(max(fin.values()),0)}**로 갈려 일정한 모양이 없음",
    ["역전월 = 10년−3개월 금리차 월평균이 처음 마이너스가 된 달(깊이 −0.1%p 이상 구간만)", "나스닥은 월평균, 역전월 값을 100으로 환산"], "FRED(T10Y3M · NASDAQCOM)", asof(NAS))

# ---- N101 닮은 점 · 다른 점 표


def sim(a, b, tol=.3): return abs(a - b) / max(abs(a), abs(b)) <= tol


rowsT = [("물가 정점(전년동월비)", f"{f(cA[1],1)}% · {cA[0]}", f"{f(cB[1],1)}% · {cB[0]}", sim(cA[1], cB[1])),
         ("모기지 금리 정점", f"{f(mA[1],1)}% · {mA[0]}", f"{f(mB[1],1)}% · {mB[0]}", sim(mA[1], mB[1], .45)),
         ("소비자심리 저점", f"{f(uA[1],1)} · {uA[0]}", f"{f(uB[1],1)} · {uB[0]}", sim(uA[1], uB[1])),
         ("M2 증가율 정점", f"{f(m2A[1],1)}% · {m2A[0]}", f"{f(m2B[1],1)}% · {m2B[0]}", sim(m2A[1], m2B[1])),
         ("실질 GDP 최저 분기(연율)", f"{f(gA[1],1)}% · {gA[0]}", f"{f(gB[1],1)}% · {gB[0]}", sim(gA[1], gB[1])),
         ("연방부채 / GDP", f"{f(dA[1],0)}% · {dA[0]}", f"{f(dB[1],0)}% · {dB[0]}", sim(dA[1], dB[1]))]
nsim = sum(1 for x in rowsT if x[3])
add("N101", "table", "F09", "닮은 점 · 다른 점 표", "1970년대와 지금, 항목별 닮음 여부",
    dict(cols=[dict(t="항목", w=300, k=True), dict(t="1970년대(1973~82)", w=260, align="center"), dict(t="지금(2021~26)", w=260, align="center"), dict(t="판정", w=160, align="center", hc=True)],
         rows=[dict(c=[a, b, c, ""], hi=bool(s_)) for a, b, c, s_ in rowsT], chips={f"{i},3": dict(text="비슷" if s_ else "다름", dir="up" if s_ else "") for i, (a, b, c, s_) in enumerate(rowsT)}),
    dict(항목=[[a, b, c, s_] for a, b, c, s_ in rowsT]),
    "역사 비교", "1970년대와 지금의 닮은 점 · 다른 점", "정점 · 저점 비교",
    f"여섯 항목 중 **{nsim}개**는 1970년대와 지금이 비슷했고 **{6-nsim}개**는 달랐으며, 가장 크게 다른 것은 연방부채 비율로 **{f(dA[1],0)}%**에서 **{f(dB[1],0)}%**가 됨",
    ["비슷 = 두 값 차이가 큰 값의 30%(모기지 금리는 45%) 이내(ECOM 기준)", "부채 비율은 1982.10과 최신 분기 값"], "FRED(CPIAUCSL · MORTGAGE30US · UMCSENT · M2SL · A191RL1Q225SBEA · GFDEGDQ188S)", asof("CPIAUCSL"))

# ---- N102 사례 카드 연표 (침체 사례)
us = mon("USREC", "last"); uk = list(us.keys()); allrec = []; st_ = None
for kx in uk:
    if us[kx] == 1 and st_ is None: st_ = kx
    if us[kx] == 0 and st_ is not None: allrec.append((st_, kx)); st_ = None


def decy(k_): return int(k_[:4]) + (int(k_[5:7]) - 1) / 12


cards = []
for a, b in [x for x in allrec if x[0] >= "1981.01"][-5:]:
    qv = [(k_, v_) for k_, v_ in gq.items() if mnum(a) - 2 <= mnum(k_) <= mnum(b)]
    worst = min(qv, key=lambda x: x[1]); t_ = [t3m[x] for x in tk if shiftk(a, 12) <= x <= a]
    cards.append(dict(start=decy(a), end=decy(b), title=f"{a}~{b[5:] if a[:4] == b[:4] else b}", big=dict(value=str(mdiff(a, b)), unit="개월"), label="침체 기간",
                      rows=[dict(k="실질 GDP 최저 분기", v=f"{f(worst[1],1)}% · {worst[0]}"), dict(k="침체 전 12개월 10Y−3M 최저", v=(f"{f(min(t_),2)}%p" if t_ else "자료 없음"))], hi=False))
cards[-1]["hi"] = True; nmax = max(cards, key=lambda c: int(c["big"]["value"]))
add("N102", "lncards", "F09", "사례 카드 연표", "1981년 이후 침체 다섯 번과 결과",
    dict(axis={"from": 1980, "to": 2026, "step": 10}, axisTitle="침체 시기(막대 폭 = 기간)", cards=cards),
    dict(사례=cards),
    "역사 비교", "1981년 이후 미국 경기 침체 사례", "NBER 침체 기간, 단위: 개월",
    f"1981년 이후 침체 다섯 번은 짧게는 **{min(int(c['big']['value']) for c in cards)}개월**, 길게는 **{nmax['big']['value']}개월**({nmax['title']}) 이어졌고 마지막은 {cards[-1]['title']}임",
    ["침체 기간 = FRED USREC(NBER 판정)가 1인 달 수, 시작 · 끝은 그 달 표기", "금리차는 침체 시작 전 12개월 중 10년−3개월 최저(2000년 이후 자료만)"], "FRED(USREC · A191RL1Q225SBEA · T10Y3M)", asof("USREC"))


# ---- N103 두 시대 같은 축 (시작 뒤 몇 해, 연평균 물가)
def annual(m, y0, n):
    out = []
    for i in range(n):
        v_ = [x for k_, x in m.items() if k_[:4] == str(y0 + i)]
        out.append(r(sum(v_) / len(v_), 1) if v_ else None)
    return out


a73 = annual(cpiA, 1973, 11); b21 = annual(cpiA, 2021, 11); b21v = [x for x in b21 if x is not None]
peakA = max(range(11), key=lambda i: a73[i])
add("N103", "overlay", "F09", "두 시대 같은 축", "물가 급등 시작 뒤 해마다, 1970년대와 지금",
    dict(x={"from": 0, "to": 10, "tick": 1, "unit": "년"}, y=dict(min=0, max=14, step=2, dec=0, unit="%"), groups=[dict(label="1970년대", tone="bad")], lines=[dict(name="1973~", data=a73, group=0)],
         now=dict(name="2021~", data=b21, chip=f"{f(b21v[-1],1)}%"),
         summary=dict(title="연평균 물가 최고", items=[dict(value=f"{f(max(a73),1)}%", label="1970년대", tone="bad"), dict(value=f"{f(max(b21v),1)}%", label="지금 시대", tone="main")],
                      list=dict(title="1970년대 모양", items=["정점 뒤 내려오다 다시 올라 두 번째 파도", "시작 뒤 7년째 둘째 정점"]))),
    dict(a73=a73, b21=b21),
    "역사 비교", "물가 급등 시작 뒤 해마다 연평균 물가", "시작 해 = 0, 연평균 전년동월비, 단위: %",
    f"물가 급등 시작 뒤 {peakA}년째 1970년대는 **{f(max(a73),1)}%**로 정점이었고 이어 두 번째 파도가 왔으나 지금은 **{f(max(b21v),1)}%** 정점 뒤 한 번 꺾임",
    ["1973년 · 2021년을 0으로 맞추고 해마다 소비자물가 전년동월비의 연평균을 그림"], "FRED(CPIAUCSL)", asof("CPIAUCSL"))

# ---- N104 사례별 결과 막대(역전 → 침체 시작까지 개월)
starts = [kx for i, kx in enumerate(uk) if us[kx] == 1 and i > 0 and us[uk[i - 1]] == 0]
data104 = []; fin104 = []
for e in eps:
    nx = next((s_ for s_ in starts if s_ > e), None)
    if nx: data104.append([f"{e} 역전", mdiff(e, nx)]); fin104.append((e, nx, mdiff(e, nx)))
    else: data104.append([f"{e} 역전(침체 아직 없음)", mdiff(e, uk[-1])]); fin104.append((e, None, mdiff(e, uk[-1])))
done = [x[2] for x in fin104 if x[1]]
add("N104", "bar", "F09", "사례별 결과 막대", "장단기 금리 역전 뒤 침체까지 걸린 달",
    dict(labels=[f"{e} 역전" for e, nx, n_ in fin104], data=[n_ for e, nx, n_ in fin104], unit="개월", dec=0, y=dict(min=0, max=60, step=10),
         hi=[dict(idx=[len(fin104) - 1])],
         notes=[dict(at=i, text=(f"{n_}개월" + (" 뒤 침체" if nx else " 경과")), sub=(f"{nx} 침체 시작" if nx else "침체 판정 아직 없음"), pos="above") for i, (e, nx, n_) in enumerate(fin104)]),
    dict(사례=fin104),
    "역사 비교", "금리 역전부터 침체 시작까지", "10년−3개월 금리 역전월 → NBER 침체 시작, 단위: 개월",
    f"10년−3개월 금리가 뒤집힌 뒤 침체가 시작되기까지 **{min(done)}~{max(done)}개월** 걸렸고, {eps[-1]} 역전은 **{fin104[-1][2]}개월**이 지나도록 침체 판정이 없음",
    ["역전월 = 10년−3개월 금리차 월평균이 처음 마이너스가 된 달", f"마지막 막대는 침체가 아직 없어 {uk[-1]}까지 지난 개월 수"], "FRED(T10Y3M · USREC)", asof("USREC"))


# ---- N105 짝 도식(지금 ↔ 옛 사건)
def inv_len(e):
    j = tk.index(e); n_ = 0
    while j < len(tk) and t3m[tk[j]] < 0: n_ += 1; j += 1
    return n_


def inv_depth(e): return min(t3m[x] for x in tk[tk.index(e):tk.index(e) + inv_len(e)])


e_old = eps[1]; e_new = eps[-1]
add("N105", "lnpair", "F09", "짝 도식", "지금 상황과 옛 사건 짝 맞추기",
    dict(heads=["지금", "옛 사건"], pairs=[
        dict(link="물가가\n정점 뒤 하락", now=dict(title=f"{cB[0][:4]}년 물가 급등", value=f"{f(cB[1],1)}%", sub=f"{cB[0]} 정점, 전년동월비"), old=dict(title="1970년대 물가 급등", value=f"{f(cA[1],1)}%", sub=f"{cA[0]} 정점, 전년동월비")),
        dict(link="장단기 금리가\n뒤집힘", now=dict(title=f"{e_new} 역전", value=f"{inv_len(e_new)}개월", sub=f"뒤집힌 기간, 깊이 {f(inv_depth(e_new),2)}%p"), old=dict(title=f"{e_old} 역전", value=f"{inv_len(e_old)}개월", sub=f"뒤집힌 기간, 깊이 {f(inv_depth(e_old),2)}%p")),
        dict(link="주가가\n고점에서 하락", now=dict(title=f"{t3[:4]}년 나스닥 낙폭", value=f"{f(d3,0)}%", sub=f"{t3} 저점"), old=dict(title=f"{t1[:4]}년 나스닥 낙폭", value=f"{f(d1,0)}%", sub=f"{t1} 저점"))]),
    dict(),
    "역사 비교", "지금 상황과 닮은 옛 사건", "물가 · 금리 · 주가 세 짝",
    f"지금의 물가 급등(**{f(cB[1],1)}%**) · 금리 역전(**{inv_len(e_new)}개월**) · 나스닥 낙폭(**{f(d3,0)}%**)을 각각 1970년대 · {e_old[:4]}년 · {t1[:4]}년 옛 사건과 짝지어 크기를 견줌",
    ["짝 맞춤은 ECOM 이 고른 비교(같은 지표의 과거 대표 사례)", "낙폭은 일별 종가 기준 월 최저"], "FRED(CPIAUCSL · T10Y3M · NASDAQCOM)", asof("CPIAUCSL"))

# ---- N106 순환 원 위 지금 위치
recs = [x for x in allrec if x[0] >= "1945.01"]
rdur = [mdiff(a, b) for a, b in recs]; edur = [mdiff(recs[i][1], recs[i + 1][0]) for i in range(len(recs) - 1)]
avgE = sum(edur) / len(edur); avgR = sum(rdur) / len(rdur); curE = mdiff(recs[-1][1], uk[-1]) + 1
bars = [dict(label=f"{recs[i][1][:4]}~{recs[i+1][0][:4]}", value=edur[i]) for i in range(len(edur))][-9:] + [dict(label=f"{recs[-1][1][:4]}~지금", value=curE, hi=True)]
add("N106", "lnring", "F09", "주기 원 위 지금 위치", "경기 순환 한 바퀴와 지금 위치",
    dict(center=dict(title="경기 순환", sub="1945년 이후 평균"), arcs=[dict(name="확장", value=round(avgE, 1), sub=f"평균 {f(avgE,0)}개월", tone="good"), dict(name="침체", value=round(avgR, 1), sub=f"평균 {f(avgR,0)}개월", tone="bad")],
         now=dict(at=min(1, curE / avgE), label=f"지금 확장 {curE}개월째", sub=f"평균보다 {f(curE-avgE,0)}개월 김" if curE > avgE else f"평균까지 {f(avgE-curE,0)}개월"),
         side=dict(title="확장 기간, 최근 순환", unit="개월", dec=0, bars=bars)),
    dict(평균확장=avgE, 평균침체=avgR, 지금=curE, 순환수=len(recs)),
    "역사 비교", "경기 순환 위의 지금 위치", "NBER 침체 판정, 단위: 개월",
    f"1945년 이후 확장은 평균 **{f(avgE,0)}개월**, 침체는 **{f(avgR,0)}개월**이었고, {recs[-1][1]} 이후 확장은 **{curE}개월째**로 평균을 " + (f"**{f(curE-avgE,0)}개월** 넘어섬" if curE > avgE else "아직 못 채움"),
    ["고리 크기 = 평균 길이 비율, 점은 현재 확장 개월을 평균과 견준 위치(평균 초과 시 호 끝)", f"침체 {len(recs)}번 기준(1945년 이후 NBER 판정)"], "FRED(USREC)", asof("USREC"))

# ================================================================ N179 수익률 곡선
mats = [("3개월", .25, "DGS3MO"), ("6개월", .5, "DGS6MO"), ("1년", 1, "DGS1"), ("2년", 2, None), ("3년", 3, "DGS3"), ("5년", 5, "DGS5"), ("7년", 7, "DGS7"), ("10년", 10, None), ("20년", 20, "DGS20"), ("30년", 30, "DGS30")]
now_k = "2026.10"; ago_k = "2025.10"; cn = []; ca = []
f2 = snap1("fred_dgs2"); f10 = snap1("fred_dgs10")
for lb, yr, sid in mats:
    m = mon(sid, "avg") if sid else (f2 if yr == 2 else f10); cn.append(r(m[now_k], 2)); ca.append(r(m[ago_k], 2))
chg = [r(a - b, 2) for a, b in zip(cn, ca)]; mx = max(range(10), key=lambda i: abs(chg[i]))
add("N179", "curve", "F19", "수익률 곡선 전후", "미국 국채 수익률 곡선, 1년 전과 지금",
    dict(mats=[dict(label=a, years=b) for a, b, c in mats], unit="%", y=dict(min=3.5, max=6, step=0.5, dec=1),
         curves=[dict(name="1년 전", data=ca, tag=dict(at=2, text=f"{ago_k} 월평균", dx=6, dy=-18)), dict(name="지금", data=cn, tag=dict(at=7, text=f"{now_k} 월평균", dx=-4, dy=-40, anchor="end"))], arrows=dict(min=0.2),
         change=dict(title="만기별 1년 변화", unit="%p", dec=2, values=chg)),
    dict(전=ca, 후=cn, 변화=chg),
    "채권", "미국 국채 수익률 곡선", "만기별 금리 월평균, 단위: %",
    f"2년물이 **{f(ca[3],2)}%**에서 **{f(cn[3],2)}%**, 10년물이 **{f(ca[7],2)}%**에서 **{f(cn[7],2)}%**로 1년 사이 만기별 금리가 바뀌었고 변화가 가장 큰 만기는 **{mats[mx][0]}({f(chg[mx],2,True)}%p)**임",
    ["2년 · 10년물은 월평균(FRED DGS2 · DGS10), 나머지는 일별 값의 월평균"], "FRED(DGS3MO · DGS6MO · DGS1 · DGS2 · DGS3 · DGS5 · DGS7 · DGS10 · DGS20 · DGS30)", "2026.10.31")


# ---------------------------------------------------------------- 쓰기
def clean(o):
    if isinstance(o, dict): return {k.rstrip("_"): clean(v) for k, v in o.items()}
    if isinstance(o, list): return [clean(x) for x in o]
    return o


lib = []
for x in OUT:
    x = clean(x); x.pop("real", None); lib.append(x)
(ROOT / "library" / "mockups" / "v4").mkdir(parents=True, exist_ok=True)
(ROOT / "library" / "mockups" / "v4" / "F01.json").write_text(json.dumps(lib, ensure_ascii=False, indent=1), encoding="utf-8")
(ROOT / "style" / "demo4_r1_F01.json").write_text(json.dumps(dict(schema=3, meta=dict(session="R1", title="F01 1차 목업"), slides=[x["slide"] for x in lib]), ensure_ascii=False), encoding="utf-8")
print(len(lib), "목업", sum(1 for x in OUT if x["real"]), "실제 값", sum(1 for x in OUT if not x["real"]), "예시 값")
for x in lib: print(x["id"], x["kind"], hl(x["slide"]["head"]), x["slide"]["head"])
