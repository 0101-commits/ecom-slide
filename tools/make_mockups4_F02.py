# 2차 목업 F02(두 지표 · 이중축 10종) + F19(채권 · 금리 구조 5종) = 15종 — data/snap4 · data/snap 공개 통계(없는 것은 FRED 에서 받아 snap4 에 저장)
# 실행: python -X utf8 tools/make_mockups4_F02.py  → library/mockups/v4/F02.json · style/demo4_r2_F02.json
import json, re, math, collections, subprocess, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
S4, S1 = ROOT / "data" / "snap4", ROOT / "data" / "snap"
OD = collections.OrderedDict
M = "−"


def fetch(i, name=None, unit="", freq="월"):
    """snap4 에 없는 FRED 계열은 fredgraph.csv 로 받아 snap4/<id>.json 으로 저장(있으면 그대로)"""
    p = S4 / f"{i}.json"
    if p.exists():
        return
    r = subprocess.run(["curl", "-s", "-f", "-m", "60", f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={i}"], capture_output=True)
    if r.returncode:
        raise RuntimeError(f"curl 실패 {i}")
    rows = []
    for ln in r.stdout.decode("utf-8").splitlines()[1:]:
        a, _, b = ln.partition(",")
        try:
            rows.append([a, float(b)])
        except ValueError:
            rows.append([a, None])
    p.write_text(json.dumps(dict(id=i, name=name or i, unit=unit, freq=freq, src="FRED", got=time.strftime("%Y.%m.%d %H:%M"), data=rows), ensure_ascii=False), encoding="utf-8")


for _i, _n, _u, _f in [("DGS10", "미국 국채 10년", "%", "일"), ("DGS2", "미국 국채 2년", "%", "일"), ("DGS1MO", "미국 국채 1개월", "%", "일"), ("UNRATE", "미국 실업률", "%", "월")]:
    fetch(_i, _n, _u, _f)
CC = [("KR", "한국"), ("US", "미국"), ("JP", "일본"), ("DE", "독일"), ("GB", "영국"), ("FR", "프랑스"), ("IT", "이탈리아"), ("CA", "캐나다"), ("AU", "호주"), ("ES", "스페인")]
for c, n in CC:
    fetch(f"GGGDTA{c}A188N", f"{n} 일반정부 총부채/GDP", "%", "연")
    if c not in ("KR", "JP", "DE"):
        fetch(f"IRLTLT01{c}M156N", f"{n} 10년물 금리(OECD)", "%", "월")


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


def hl(t):
    return len(re.sub(r"[\s*]", "", t))


def pearson(a, b):
    n = len(a); ma = sum(a) / n; mb = sum(b) / n
    sa = math.sqrt(sum((x - ma) ** 2 for x in a)); sb = math.sqrt(sum((y - mb) ** 2 for y in b))
    return sum((x - ma) * (y - mb) for x, y in zip(a, b)) / (sa * sb)


def yticks(keys_, step=1):
    """x 눈금 = 해 첫 달(1월) 중 step 해마다"""
    return [i for i, k in enumerate(keys_) if k.endswith(".01") and int(k[:4]) % step == 0]


def nice_range(lo, hi, nint, steps):
    for st in steps:
        a = math.floor(lo / st) * st
        if a + nint * st >= hi:
            return a, a + nint * st, st
    raise ValueError


OUT = []


def add(id_, kind, fam, variant, title, slide, facts, group, topic, basis, head, notes, source, asof_, real=True):
    assert 50 <= hl(head) <= 90, (id_, hl(head), head)
    if not real:
        basis = basis + " · 예시 값"
        notes = notes + ["숫자는 모양을 보이기 위한 예시 값"]
    slide = dict(kind=kind, eyebrow=dict(group=group, topic=topic, basis=basis), head=head, **slide, foot=dict(notes=notes, source=source, asof=asof_))
    OUT.append(dict(id=id_, kind=kind, family=fam, variant=variant, title=title, tags=["4판"], real=real, facts=facts, slide=slide))


# ================================================================ N017 이중축 두 선 : 미국 10년물 × 원/달러
k10 = snap1("fred_dgs10"); kfx = snap1("fred_dexkous"); lab = [k for k in k10 if k in kfx]
a = [r(k10[k], 2) for k in lab]; b = [r(kfx[k], 1) for k in lab]; cc = pearson(a, b)
lo, hi, st = nice_range(min(b) - 5, max(b), 6, [50, 100, 150, 200])
ia = a.index(max(a[:60])); ib = b.index(max(b))
add("N017", "dxdual", "F02", "이중축 두 선", "미국 10년물 금리와 원/달러 환율, 축 둘",
    dict(labels=lab, left=dict(name="미국 10년물", unit="%", data=a, dec=2, suf="%", y=dict(min=0, max=6, step=1, dec=0)),
         right=dict(name="원/달러 환율", unit="원", data=b, dec=0, suf="원", color="cmp", y=dict(min=lo, max=hi, step=st, dec=0)), ticks=yticks(lab, 1), xyear=True,
         corr=dict(text=f"같은 방향으로 움직임 · 상관계수 {f(cc,2,True)}"),
         marks=[dict(side="left", at=ia, text=f"10년물 최고 {f(a[ia],2)}%\n{lab[ia]}", pos="above"), dict(side="right", at=ib, text=f"환율 최고 {f(b[ib],0)}원\n{lab[ib]}", pos="left")]),
    dict(상관=cc, 기간=[lab[0], lab[-1]], 끝=[a[-1], b[-1]]),
    "금리 · 환율", "미국 10년물 금리와 원/달러 환율", "월평균, 왼쪽 단위: % · 오른쪽 단위: 원",
    f"미국 10년물 금리와 원/달러 환율은 {lab[0][:4]}~{lab[-1][:4]}년 같은 방향으로 움직여 월평균 상관계수가 **{f(cc,2,True)}**이고 지금 **{f(a[-1],2)}%** · **{f(b[-1],0)}원**임",
    ["왼쪽 축은 10년물 금리, 오른쪽 축은 환율(눈금 간격이 달라 선이 만나는 곳에 뜻 없음)", "상관계수 = 월평균 수준 값끼리(ECOM 계산)"], "FRED(DGS10 · DEXKOUS)", "2026.10.31")

# ================================================================ N018 차이 면(역전 색) : 10년물 − 2년물
m10 = mon("DGS10"); m2 = mon("DGS2"); lab = keys(m10, "2000.01", "2026.10"); lab = [k for k in lab if k in m2]
a = [r(m10[k], 2) for k in lab]; b = [r(m2[k], 2) for k in lab]; dif = [x - y for x, y in zip(a, b)]
inv = [i for i, d in enumerate(dif) if d < 0]; runs = []
for i in inv:
    if runs and runs[-1][1] == i - 1:
        runs[-1][1] = i
    else:
        runs.append([i, i])
big = [x for x in runs if x[1] - x[0] + 1 >= 4]; dp = min(dif); dpi = dif.index(dp)
add("N018", "dxgap", "F02", "차이 면(역전 색)", "10년물과 2년물 사이 면, 역전 구간",
    dict(labels=lab, a=dict(name="10년물", data=a, color="dark"), b=dict(name="2년물", data=b, color="g65"), y=dict(min=0, max=7, step=1, dec=0, unit="%", suf="%"), ticks=yticks(lab, 4), xyear=True, runMin=4, runText="역전", posName="10년물이 높음(정상)", negName="2년물이 높음(역전)"),
    dict(역전구간=[[lab[x[0]], lab[x[1]], x[1] - x[0] + 1] for x in big], 최대역전=[lab[dpi], r(dp)]),
    "채권", "10년물 − 2년물 사이 면", "월평균, 단위: %",
    f"2년물이 10년물보다 높았던 역전 구간은 {lab[0][:4]}년 이후 **{len(big)}번**(4개월 이상)이었고 가장 깊은 역전은 {lab[dpi]} **{f(dp,2)}%p**임",
    ["역전 = 10년물 월평균이 2년물 월평균보다 낮은 달", "일별 값의 월평균"], "FRED(DGS10 · DGS2)", asof("DGS10"))

# ================================================================ N019 한 · 미 10년물 금리차 한 줄 + 0선
kk = OD((a_[:7].replace("-", "."), b_) for a_, b_ in D("IRLTLT01KRM156N")); lab = [k for k in kk if k in m10 and k >= "2000.10"]
g = [r(kk[k] - m10[k], 2) for k in lab]; neg = [i for i, v in enumerate(g) if v < 0]
runs = []
for i in neg:
    if runs and runs[-1][1] == i - 1:
        runs[-1][1] = i
    else:
        runs.append([i, i])
lr = max(runs, key=lambda x: x[1] - x[0]); mn = min(g); mi = g.index(mn)
add("N019", "dxzero", "F02", "차이 한 줄 + 0선", "한 · 미 10년물 금리차, 0 아래 구간",
    dict(labels=lab, data=g, unit="%p", y=dict(min=-3, max=3, step=1, dec=0, unit="%p", suf="%p"), ticks=yticks(lab, 4), xyear=True, rmargin=110, posTone="soft", posFill=False, negTone="warn", runs=dict(min=6, unit="개월", prefix="역전 "), posName="한국이 높음", negName="한국이 낮음(역전)",
         endbig=dict(text=f"{f(g[-1],2,True)}%p")),
    dict(끝=g[-1], 역전달수=len(neg), 최장=[lab[lr[0]], lab[lr[1]]], 최저=[lab[mi], mn]),
    "금리차", "한국 10년물 − 미국 10년물", "월평균, 단위: %p",
    f"한국 10년물이 미국보다 낮았던 달은 {lab[0]} 이후 **{len(neg)}개월**이고 가장 길게 이어진 역전은 **{lr[1]-lr[0]+1}개월**, 지금은 **{f(g[-1],2,True)}%p**임",
    ["금리차 = 한국 10년물(OECD) − 미국 10년물(월평균)", "0 아래 = 한국 금리가 미국보다 낮음"], "OECD(IRLTLT01KRM156N) · FRED(DGS10)", lab[-1] + ".01".replace(".01", ""))

# ================================================================ N020 연결 산점(시간 경로) : 실업률 × 물가
un = mon("UNRATE"); cp = yoy(mon("CPIAUCSL")); yrs = list(range(2015, 2027)); pts = []
for y in yrs:
    ks = [f"{y}.{m:02d}" for m in range(1, 13) if f"{y}.{m:02d}" in un and f"{y}.{m:02d}" in cp]
    pts.append(dict(label=str(y) if y < 2026 else f"{y}(~{int(ks[-1][5:])}월)", x=r(sum(un[k] for k in ks) / len(ks), 2), y=r(sum(cp[k] for k in ks) / len(ks), 2), n=len(ks)))
ux = [p["x"] for p in pts]; uy = [p["y"] for p in pts]; pkc = uy.index(max(uy)); pku = ux.index(max(ux))
add("N020", "dxpath", "F02", "연결 산점(시간 경로)", "미국 실업률 × 물가, 해마다 이은 경로",
    dict(points=pts, x=dict(title="실업률(연평균, %)", min=3, max=9, step=1, dec=0, suf="%"), y=dict(title="물가 상승률(연평균, 전년동월비 %)", min=0, max=9, step=1, dec=0, suf="%"), refy=dict(v=2, label="물가 목표 2%"),
         notes=[dict(at=pku, text=f"실업률 최고 {pts[pku]['label']} {f(ux[pku],1)}%", dx=-250, dy=-36), dict(at=pkc, text=f"물가 최고 {pts[pkc]['label']} {f(uy[pkc],1)}%", dx=24, dy=8, tone="warn")]),
    dict(점=[[p["label"], p["x"], p["y"]] for p in pts]),
    "물가 · 고용", "실업률과 물가의 해마다 경로", "연평균, 단위: %",
    f"미국 실업률은 {pts[pku]['label']}년 **{f(ux[pku],1)}%**에서 {pts[-1]['label'][:4]}년 **{f(ux[-1],1)}%**까지 내려오는 동안 물가는 {pts[pkc]['label']}년 **{f(uy[pkc],1)}%**를 찍고 **{f(uy[-1],1)}%**로 내려옴",
    ["물가 = 소비자물가지수 전년동월비의 연평균(ECOM 계산)", f"{pts[-1]['label'][:4]}년은 {pts[-1]['n']}개월 평균"], "FRED(UNRATE · CPIAUCSL)", asof("CPIAUCSL"))

# ================================================================ N021 산점 + 추세선 + 지금 점 : 나라별 부채비율 × 10년물
def yld(c, year=2023):
    if c == "KR": m = OD((a_[:7].replace("-", "."), b_) for a_, b_ in D("IRLTLT01KRM156N"))
    elif c == "JP": m = OD((a_[:7].replace("-", "."), b_) for a_, b_ in D("IRLTLT01JPM156N"))
    elif c == "DE": m = OD((a_[:7].replace("-", "."), b_) for a_, b_ in D("IRLTLT01DEM156N"))
    else: m = OD((a_[:7].replace("-", "."), b_) for a_, b_ in D(f"IRLTLT01{c}M156N"))
    v = [m[f"{year}.{k:02d}"] for k in range(1, 13) if f"{year}.{k:02d}" in m]
    return sum(v) / len(v)


def debt(c, year=2023):
    return dict((a_[:4], b_) for a_, b_ in D(f"GGGDTA{c}A188N"))[str(year)]


pts = [dict(label=n, x=r(debt(c), 1), y=r(yld(c), 2), now=(c == "KR")) for c, n in CC]
xs = [p["x"] for p in pts]; ys = [p["y"] for p in pts]; mx_ = sum(xs) / len(xs); my_ = sum(ys) / len(ys)
sl = sum((x - mx_) * (y - my_) for x, y in zip(xs, ys)) / sum((x - mx_) ** 2 for x in xs); ic = my_ - sl * mx_; rr = pearson(xs, ys)
kr = [p for p in pts if p["now"]][0]; res = kr["y"] - (ic + sl * kr["x"])
add("N021", "dxscat", "F02", "산점 + 추세선 + 지금 점", "나라별 정부 부채비율과 10년물 금리, 한국 강조",
    dict(points=pts, x=dict(title="일반정부 총부채/GDP(2023, %)", min=0, max=300, step=50, dec=0, suf="%"), y=dict(title="10년물 금리(2023 평균, %)", min=0, max=5, step=1, dec=0, suf="%"),
         trend=dict(a=r(ic, 4), b=r(sl, 5), from_=5, to=270, text=f"추세선 · 상관 {f(rr,2,True)}"), callout=dict(big=f"추세선 {f(res,1,True)}%p", sub=f"한국 10년물 − 부채비율 {f(kr['x'],0)}%에 맞는 추세값", x=860, y=40)),
    dict(상관=rr, 기울기=sl, 한국=kr, 추세대비=res),
    "나라 비교", "부채비율과 10년물 금리", "10개국, 2023년",
    f"10개국에서 부채비율과 10년물 금리의 상관은 **{f(rr,2,True)}**로 " + ("부채비율이 높은 나라의 금리가 오히려 낮은 편이고" if rr < -.3 else "부채비율이 높은 나라의 금리가 높은 편이고" if rr > .3 else "뚜렷한 관계가 없고") + f" 한국은 부채비율 **{f(kr['x'],0)}%** · 금리 **{f(kr['y'],1)}%**로 추세선보다 **{f(res,1,True)}%p**임",
    ["부채비율 = IMF 일반정부 총부채/GDP(FRED, 연 단위 2023), 금리 = OECD 10년물의 2023년 월평균", "추세선은 10개국 단순 회귀(ECOM 계산)"], "FRED(GGGDTA…A188N · IRLTLT01…M156N)", "2026.11.13")

# ================================================================ N022 비율 선 + 평균 : 원유 ÷ 천연가스
mw = mon("DCOILWTICO"); mg = mon("DHHNGSP"); lab = keys(mw, "2000.01", "2026.10"); lab = [k for k in lab if k in mg]
ra = [r(mw[k] / mg[k], 2) for k in lab]; avg = sum(ra) / len(ra); sd = math.sqrt(sum((x - avg) ** 2 for x in ra) / len(ra))
pc = sum(1 for x in ra if x <= ra[-1]) / len(ra) * 100; imax = ra.index(max(ra)); imin = ra.index(min(ra))
hi_ = math.ceil(max(ra) / 10) * 10
add("N022", "dxratio", "F02", "비율 선 + 평균", "원유 ÷ 천연가스 가격 비율과 장기 평균",
    dict(labels=lab, data=ra, mean=r(avg, 2), sd=r(sd, 2), meanText=f"평균 {f(avg,1)}배", bandText="평균 ±1표준편차", y=dict(min=0, max=hi_, step=10, dec=0, unit="배"), ticks=yticks(lab, 4), xyear=True, rangeMin=0, rangeMax=hi_, dec=1, stripTitle="역대 위치",
         pctl=dict(text=f"과거의 {f(pc,0)}%보다 높음", sub=f"평균 {f(avg,1)}배"), marks=[dict(at=imax, text=f"최고 {f(ra[imax],1)}배\n{lab[imax]}", pos="below", dx=40), dict(at=imin, text=f"최저 {f(ra[imin],1)}배\n{lab[imin]}", pos="above", tone="warn", dx=34)]),
    dict(평균=avg, 표준편차=sd, 지금=ra[-1], 백분위=pc, 최고=[lab[imax], ra[imax]], 최저=[lab[imin], ra[imin]]),
    "에너지", "원유 ÷ 천연가스 가격 비율", "월평균 WTI(달러/배럴) ÷ 헨리허브(달러/MMBtu), 단위: 배",
    f"원유 가격은 천연가스의 {lab[0][:4]}년 이후 평균 **{f(avg,1)}배**이고 지금 **{f(ra[-1],1)}배**로 과거 달의 **{f(pc,0)}%**보다 높음({lab[imax]}에 **{f(ra[imax],1)}배**까지 벌어짐)",
    ["비율 = 배럴당 WTI 가격 ÷ MMBtu당 헨리허브 가격(열량 단위가 달라 에너지 등가는 약 6배)", "평균 · 표준편차는 같은 기간 월 값 기준(ECOM 계산)"], "FRED(DCOILWTICO · DHHNGSP)", asof("DCOILWTICO"))

# ================================================================ N023 위아래 두 칸 : 유가 / 달러
mu = mon("DTWEXBGS"); lab = keys(mw, "2010.01", "2026.10"); lab = [k for k in lab if k in mu]
oil = [r(mw[k], 1) for k in lab]; usd = [r(mu[k], 1) for k in lab]; mo = OD(zip(lab, oil)); mu2 = OD(zip(lab, usd)); yo = yoy(mo); yu = yoy(mu2); kc = [k for k in lab if k in yo and k in yu]
cc = pearson([yo[k] for k in kc], [yu[k] for k in kc])
rec = OD((a_[:7].replace("-", "."), b_) for a_, b_ in D("USREC")); rb = [i for i, k in enumerate(lab) if rec.get(k, 0) == 1]
bands = [dict(from_=rb[0], to=rb[-1], name="침체")] if rb else []
io = oil.index(max(oil)); iu = usd.index(max(usd))
add("N023", "dxstack", "F02", "위아래 두 칸 같은 시간축", "WTI 유가(위)와 달러 지수(아래)",
    dict(labels=lab, top=dict(name="WTI 원유", unit="달러/배럴", data=oil, dec=0, suf="달러", y=dict(min=0, max=160, step=40, dec=0), color="main", area=True), bottom=dict(name="달러 지수(광의)", unit="지수", data=usd, dec=0, y=dict(min=90, max=130, step=10, dec=0), color="cmp"),
         ticks=yticks(lab, 2), xyear=True, bands=bands, link=dict(text=f"12개월 변화율 상관 {f(cc,2,True)}"), marks=[dict(panel=0, at=io, text=f"유가 최고 {f(oil[io],0)}달러\n{lab[io]}", pos="above", dx=0)]),
    dict(상관=cc, 유가최고=[lab[io], oil[io]], 달러최고=[lab[iu], usd[iu]]),
    "에너지 · 달러", "유가와 달러 지수, 같은 시간축", "월평균, 위 단위: 달러/배럴 · 아래 단위: 지수",
    f"WTI 유가는 {lab[io]} **{f(oil[io],0)}달러**까지 올랐다 지금 **{f(oil[-1],0)}달러**이고 달러 지수는 **{f(usd[-1],0)}**로 두 지표 12개월 변화율의 상관은 **{f(cc,2,True)}**임",
    ["두 칸은 같은 시간축(눈금 간격이 다름)", "음영 = 미국 침체 기간(NBER 판정)", "상관 = 12개월 변화율끼리(ECOM 계산)"], "FRED(DCOILWTICO · DTWEXBGS · USREC)", asof("DTWEXBGS"))

# ================================================================ N024 끝 라벨 차이 화살표 : 한국 vs 일본 10년물
mj = OD((a_[:7].replace("-", "."), b_) for a_, b_ in D("IRLTLT01JPM156N")); lab = [k for k in kk if k in mj and k >= "2000.10"]
a = [r(kk[k], 2) for k in lab]; b = [r(mj[k], 2) for k in lab]; g0 = a[0] - b[0]; g1 = a[-1] - b[-1]
add("N024", "dxend", "F02", "끝 라벨 차이 화살표", "한국 · 일본 10년물, 끝 차이를 화살표로",
    dict(labels=lab, a=dict(name="한국", data=a, color="main"), b=dict(name="일본", data=b, color="cmp"), y=dict(min=0, max=9, step=1, dec=0, unit="%", suf="%"), ticks=yticks(lab, 4), xyear=True,
         diff=dict(text=f"{f(g1,2,True)}%p", sub="한국 − 일본(지금)"), start=dict(at=0, y=3.2, text=f"{lab[0][:4]} {f(g0,1,True)}%p")),
    dict(처음차=g0, 끝차=g1),
    "나라 비교", "한국 · 일본 10년물 금리", "월평균, 단위: %",
    f"한국과 일본의 10년물 금리 차이는 {lab[0][:4]}년 **{f(g0,1,True)}%p**에서 지금 **{f(g1,1,True)}%p**로 좁혀졌고 한국 **{f(a[-1],2)}%** · 일본 **{f(b[-1],2)}%**임",
    ["두 나라 모두 OECD 장기금리(10년물 근사)", "화살표는 두 선 끝의 값 차이"], "OECD(IRLTLT01KRM156N · IRLTLT01JPM156N)", lab[-1])

# ================================================================ N025 굴린 상관 : 주식(S&P500) × 장기채(20년물)
sp = OD(D("SP500")); y20 = OD(D("DGS20")); dts = [d for d in sp if d in y20]; rs = []; rb_ = []; dd = []
for i in range(1, len(dts)):
    s0, s1 = sp[dts[i - 1]], sp[dts[i]]; y0_, y1_ = y20[dts[i - 1]], y20[dts[i]]
    rs.append(math.log(s1 / s0)); rb_.append(-(y1_ - y0_)); dd.append(dts[i])
WIN = 252; cor = OD()
for i in range(WIN, len(dd)):
    cor[dd[i][:7].replace("-", ".")] = pearson(rs[i - WIN + 1:i + 1], rb_[i - WIN + 1:i + 1])
lab = list(cor.keys()); cv = [r(cor[k], 2) for k in lab]; pos = sum(1 for v in cv if v > 0); mxi = cv.index(max(cv)); mni = cv.index(min(cv))
cross = [i - 1 for i in range(1, len(cv)) if cv[i - 1] < 0 <= cv[i] and sum(1 for v in cv[i:i + 12] if v > 0) >= 10][0]
add("N025", "dxzero", "F02", "굴린 상관 선(구간 띠)", "주식 · 장기채 1년 굴린 상관",
    dict(labels=lab, data=cv, unit="", y=dict(min=-1, max=1, step=0.5, dec=1, unit="상관계수"), ticks=yticks(lab, 1), xyear=True, rmargin=110, posTone="warn", negTone="main", segColor=True, strip=True, posName="같이 움직임(분산 효과 약함)", negName="반대로 움직임(분산 효과 있음)",
         marks=[dict(at=cross, text=f"{lab[cross+1]} 처음\n0 위로 전환", pos="above", tone="warn", dx=-40), dict(at=mni, text=f"상관 최저 {f(cv[mni],2,True)}\n{lab[mni]}", pos="below")], endbig=dict(text=f"{f(cv[-1],2,True)}")),
    dict(끝=cv[-1], 양수달수=pos, 전체=len(cv), 최고=[lab[mxi], cv[mxi]], 최저=[lab[mni], cv[mni]]),
    "주식 · 채권", "주식과 장기채의 1년 굴린 상관", "일별 수익률 252거래일 굴린 상관계수, 월말",
    f"S&P500과 20년물 채권 가격의 1년 굴린 상관은 {lab[0][:4]}년 이후 **{pos}개월**(전체 {len(cv)}개월)이 0 위였고 {lab[cross+1]} 처음 0 위로 올라선 뒤 지금 상관계수 **{f(cv[-1],2,True)}**(최고 **{f(cv[mxi],2,True)}**)임",
    ["채권 수익 = 20년물 금리 일별 변화의 부호를 뒤집은 값, 주식 수익 = S&P500 일별 로그수익률", "0 위 = 주식과 채권이 같이 움직여 한쪽 손실을 다른 쪽이 못 막음(ECOM 계산, 월말 값)"], "FRED(SP500 · DGS20)", asof("SP500"))

# ================================================================ N026 두 지표 4분면 경로 : 성장 × 물가 8분기
gq = OD((a_[:7], b_) for a_, b_ in D("A191RL1Q225SBEA")); cpm = yoy(mon("CPIAUCSL")); qs = []
for key in sorted(gq)[-8:]:
    y, mm = int(key[:4]), int(key[5:7]); ms = [f"{y}.{m:02d}" for m in range(mm, mm + 3)]
    ms = [k for k in ms if k in cpm]; assert len(ms) >= 2, key
    qs.append(dict(label=f"{str(y)[2:]}.{(mm-1)//3+1}Q", x=r(gq[key], 1), y=r(sum(cpm[k] for k in ms) / len(ms), 1)))
for q in qs: pass
gx = [q["x"] for q in qs]; gy = [q["y"] for q in qs]; xl = math.floor(min(gx + [0]) - .5); xh = math.ceil(max(gx) + .5); yl = math.floor(min(gy) - .5); yh = math.ceil(max(gy) + .5)
xl, xh, yl, yh = -1, 5, 1, 5
assert min(gx) >= xl and max(gx) <= xh and min(gy) >= yl and max(gy) <= yh, (gx, gy)
qd = lambda q: ("성장 위 · 물가 위" if q["x"] >= 2 and q["y"] >= 2 else "성장 아래 · 물가 위" if q["y"] >= 2 else "성장 위 · 물가 아래" if q["x"] >= 2 else "성장 아래 · 물가 아래")
qc = collections.Counter(qd(q) for q in qs).most_common(2); qc = qc + [("", 0)] * (2 - len(qc))
add("N026", "dxquad", "F02", "두 지표 4분면 경로", "성장 × 물가 4분면 위 최근 8분기",
    dict(points=qs, x=dict(title="실질 GDP 성장률(분기, 연율 %)", min=xl, max=xh, step=1, dec=0, suf="%", pivot=2), y=dict(title="소비자물가 상승률(분기 평균, 전년동월비 %)", min=yl, max=yh, step=1, dec=0, suf="%", pivot=2),
         names=[dict(t="스태그플레이션 쪽", s="성장 아래 · 물가 위"), dict(t="과열 쪽", s="성장 위 · 물가 위"), dict(t="침체 · 디플레 쪽", s="성장 아래 · 물가 아래"), dict(t="적정 성장 쪽", s="성장 위 · 물가 아래")], tones=["warn", "soft", "soft", "main"]),
    dict(점=[[q["label"], q["x"], q["y"], qd(q)] for q in qs]),
    "성장 · 물가", "성장 × 물가 4분면 위 이동 경로", "분기, 기준선: 성장 2% · 물가 2%",
    f"미국 성장 · 물가의 최근 8분기 중 **{qc[0][1]}분기**가 {qc[0][0]}에 있었고 {qc[1][1]}분기는 {qc[1][0]}에 있었으며 최근 분기는 성장 **{f(gx[-1],1)}%** · 물가 **{f(gy[-1],1)}%**임",
    ["성장 = 실질 GDP 전기비 연율, 물가 = 소비자물가지수 전년동월비의 분기 평균", "기준선 2%는 물가 목표 · 성장 비교용 기준(ECOM 설정)"], "FRED(A191RL1Q225SBEA · CPIAUCSL)", asof("CPIAUCSL"))

# ================================================================ N180 장단기 차 + 침체 띠 (F19)
t3 = mon("T10Y3M"); lab = keys(t3, "2000.01", "2026.10"); sp3 = [r(t3[k], 2) for k in lab]
rec = OD((a_[:7].replace("-", "."), b_) for a_, b_ in D("USREC")); rs_ = [rec.get(k, 0) for k in lab]
rruns = [];
for i, v in enumerate(rs_):
    if v == 1:
        if rruns and rruns[-1][1] == i - 1: rruns[-1][1] = i
        else: rruns.append([i, i])
iruns = []
for i, v in enumerate(sp3):
    if v < 0:
        if iruns and iruns[-1][1] == i - 1: iruns[-1][1] = i
        else: iruns.append([i, i])
leads = []
for a_, b_ in rruns:
    cand = [x for x in iruns if x[0] < a_ and a_ - x[0] <= 48]
    if cand: leads.append(dict(from_=cand[0][0], to=a_, text=f"{a_-cand[0][0]}개월 뒤 침체", n=a_ - cand[0][0]))
iruns = [x for x in iruns if x[1] - x[0] + 1 >= 3]
leads = []
for a_, b_ in rruns:
    cand = [x for x in iruns if x[0] < a_ and a_ - x[0] <= 48]
    if cand: leads.append(dict(from_=cand[0][0], to=a_, text=f"{a_-cand[0][0]}개월 뒤 침체", n=a_ - cand[0][0]))
last_inv = iruns[-1]; mnv = min(sp3); mni = sp3.index(mnv)
add("N180", "dxzero", "F19", "장단기 차 + 침체 띠", "10년물 − 3개월물 금리차와 침체 기간",
    dict(labels=lab, data=sp3, unit="%p", y=dict(min=-3, max=4, step=1, dec=0, unit="%p", suf="%p"), ticks=yticks(lab, 4), xyear=True, bands=[dict(from_=a_, to=b_, name="침체") for a_, b_ in rruns], bandName="미국 침체 기간", posTone="soft", posFill=False, negTone="warn", posName="10년물이 높음", negName="3개월물이 높음(역전)",
         leads=[dict(from_=l["from_"], to=l["to"], text=l["text"]) for l in leads], marks=[dict(at=mni, text=f"최저 {f(mnv,2)}%p\n{lab[mni]}", pos="below", tone="warn", dx=0)]),
    dict(침체=[[lab[a_], lab[b_]] for a_, b_ in rruns], 역전=[[lab[a_], lab[b_]] for a_, b_ in iruns], 앞선달=[l["n"] for l in leads], 최저=[lab[mni], mnv]),
    "채권", "10년물 − 3개월물 금리차와 침체", "월평균, 단위: %p",
    f"10년물−3개월물 금리차가 0 아래로 3개월 넘게 내려간 {len(iruns)}번 중 **{len(leads)}번** 뒤에 침체가 왔고 앞선 기간은 **{min(l['n'] for l in leads)}~{max(l['n'] for l in leads)}개월**이며 {lab[last_inv[0]][:4]}년 역전 뒤엔 아직 침체가 없음",
    ["역전 시작월부터 침체 시작월(NBER 판정)까지의 개월 수, 48개월 이내만 연결", f"{lab[last_inv[0]]}~{lab[last_inv[1]]} 역전 뒤에는 {lab[-1]}까지 침체 판정 없음"], "FRED(T10Y3M · USREC)", asof("T10Y3M"))

# ================================================================ N181 만기별 변화 막대 (F19)
mats = [("3개월", "DGS3MO"), ("6개월", "DGS6MO"), ("1년", "DGS1"), ("2년", "DGS2"), ("3년", "DGS3"), ("5년", "DGS5"), ("7년", "DGS7"), ("10년", "DGS10"), ("20년", "DGS20"), ("30년", "DGS30")]
now_d = min(D(i)[-1][0] for _, i in mats); y_, m_, d_ = int(now_d[:4]), int(now_d[5:7]), int(now_d[8:])
pm, py_ = (m_ - 1, y_) if m_ > 1 else (12, y_ - 1); prev_d = f"{py_}-{pm:02d}-{d_:02d}"
def at_or_before(i, d):
    ds = [(a_, b_) for a_, b_ in D(i) if a_ <= d]; return ds[-1]
lv = []; ch = []
for lb, i in mats:
    n_ = at_or_before(i, now_d)[1]; p_ = at_or_before(i, prev_d)[1]; lv.append(r(n_, 2)); ch.append(round((n_ - p_) * 100))
mxm = max(range(10), key=lambda i: abs(ch[i])); av = sum(ch) / 10
grp = [(0, 2, "단기(3개월~1년)"), (3, 5, "중기(2~5년)"), (6, 9, "장기(7~30년)")]
yh = max(10, math.ceil(max(abs(c) for c in ch) / 10) * 10 + 10) if max(abs(c) for c in ch) > 0 else 10
add("N181", "dxmat", "F19", "만기별 변화 막대(세로)", "미국 국채 만기별 한 달 금리 변화",
    dict(mats=[a_ for a_, _ in mats], values=ch, levels=lv, caption="한 달 변화(bp)", y=dict(min=-yh, max=yh, step=yh / 2 if yh % 20 == 0 else yh / 2, dec=0, suf="bp"), dec=0, avgText=f"평균 {f(av,0,True)}bp", maxText=f"변화 최대 {mats[mxm][0]}",
         groups=[dict(from_=a_, to=b_, name=n_, value=f"평균 {f(sum(ch[a_:b_+1])/(b_-a_+1),0,True)}bp") for a_, b_, n_ in grp]),
    dict(기준=[prev_d, now_d], 변화=ch, 지금=lv),
    "채권", "미국 국채 만기별 한 달 변화", f"{prev_d.replace('-','.')} → {now_d.replace('-','.')}, 단위: bp(1bp = 0.01%)",
    f"{prev_d[5:7].lstrip('0')}월 {int(prev_d[8:])}일 이후 미국 국채 금리는 만기별로 **{f(min(ch),0)}~{f(max(ch),0,True)}bp** 움직였고 변화가 가장 큰 만기는 **{mats[mxm][0]}({f(ch[mxm],0,True)}bp)**임",
    ["일별 값 기준, 지난달 같은 날(없으면 그 전 영업일)과 비교", "1bp = 0.01%"], "FRED(" + " · ".join(i for _, i in mats) + ")", now_d.replace("-", "."))

# ================================================================ N182 국채 입찰 결과 표 (예시 값)
rows = [("2년", "140", 3.92, 0.4, 2.71, "양호", "good"), ("3년", "150", 3.98, -0.9, 2.84, "양호", "good"), ("5년", "150", 4.12, 1.6, 2.46, "부진", "bad"), ("10년", "130", 4.30, -0.3, 2.66, "보통", "mid"), ("30년", "90", 4.55, 2.2, 2.31, "부진", "bad")]
avgb = 2.60; nb = sum(1 for x in rows if x[3] > 0); nl = sum(1 for x in rows if x[4] < avgb)
add("N182", "dxauct", "F19", "국채 입찰 결과 표", "A국 국채 입찰 5회 결과(예시)",
    dict(rows=[dict(name=a_, size=b_, yield_=c_, tail=d_, btc=e_, verdict=dict(text=v_, tone=t_)) for a_, b_, c_, d_, e_, v_, t_ in rows], sizeUnit="억", btcAvg=avgb, tailMax=3, btcMax=4, heads=["만기", "발행액(가국 통화)", "낙찰 금리", "시장 예상 대비", "응찰률(평균 점선)", "판정"], legend="예상 대비 + = 예상보다 높은 금리에 낙찰(수요 약함)"),
    dict(예상보다높음=nb, 평균아래응찰=nl),
    "채권", "국채 입찰 결과 읽기", "최근 5회 입찰(가상), 금리 단위: % · 예상 대비 단위: bp",
    f"A국 국채 입찰 5회 중 **{nb}회**는 낙찰 금리가 시장 예상보다 높았고 응찰률이 평균 **{f(avgb,2)}배** 아래인 회차는 **{nl}회**로 **5년 · 30년** 입찰이 약했음",
    ["A국 · 가상 입찰 결과로 실제 입찰 값이 아님", "응찰률 = 응찰 금액 ÷ 낙찰 금액, 예상 대비 = 낙찰 금리 − 입찰 직전 시장 예상 금리"], "예시 값(실제 입찰 결과 아님)", "2026.11.13", real=False)

# ================================================================ N183 국채 보유자 구성 (예시 값)
parts = [dict(name="중앙은행", share=18.0, prev=12.0), dict(name="연기금 · 보험", share=15.0, prev=17.0), dict(name="은행", share=9.0, prev=12.0), dict(name="투자 펀드", share=19.0, prev=14.0), dict(name="개인 · 기타", share=14.0, prev=17.0), dict(name="해외 투자자", share=25.0, prev=28.0)]
dom = sum(p["share"] for p in parts[:5]); fo = parts[5]["share"]; ud = max(parts, key=lambda p: p["share"] - p["prev"])
add("N183", "dxholder", "F19", "보유자 구성 쌓은 막대 + 카드", "A국 국채 보유자 구성(예시)",
    dict(parts=parts, heads=["5년 전", "지금"], groups=[dict(from_=0, to=4, name="국내", value=f"{f(dom,0)}%"), dict(from_=5, to=5, name="해외", value=f"{f(fo,0)}%")]),
    dict(국내=dom, 해외=fo),
    "채권", "국채는 누가 들고 있나", "보유 비중, 단위: %",
    f"5년 전과 견주면 A국 국채의 해외 투자자 보유는 **{f(parts[5]['prev'],0)}%**에서 **{f(fo,0)}%**로 줄었고 {ud['name']} 보유가 **{f(ud['prev'],0)}%**에서 **{f(ud['share'],0)}%**로 가장 크게 늘었음",
    ["A국 · 가상 구성으로 실제 보유 비중이 아님", "비중은 국채 잔액 대비, 6개 보유 주체 합 100%"], "예시 값(실제 보유 통계 아님)", "2026.11.13", real=False)

# ================================================================ N184 실질금리 분해 선 (F19)
n10 = mon("DGS10"); rl = mon("DFII10"); lab = [k for k in keys(rl, "2003.01", "2026.10") if k in n10]
re_ = [r(rl[k], 2) for k in lab]; be = [r(n10[k] - rl[k], 2) for k in lab]; no = [r(n10[k], 2) for k in lab]
imr = re_.index(min(re_)); imb = be.index(max(be)); ipr = re_.index(max(re_))
add("N184", "dxdecomp", "F19", "실질금리 분해 쌓은 면", "10년물 명목금리 = 실질금리 + 기대물가",
    dict(labels=lab, real=re_, be=be, y=dict(min=-2, max=6, step=2, dec=0, unit="%", suf="%"), ticks=yticks(lab, 4), xyear=True,
         names=[dict(at=lab.index("2006.06"), kind="real", text="실질금리"), dict(at=lab.index("2017.06"), kind="be", text="기대물가")], marks=[dict(s="real", at=imr, text=f"실질금리 최저 {f(re_[imr],2)}%\n{lab[imr]}", pos="below", tone="warn")]),
    dict(명목=no[-1], 실질=re_[-1], 기대물가=be[-1], 실질최저=[lab[imr], re_[imr]], 실질최고=[lab[ipr], re_[ipr]]),
    "채권", "명목금리 = 실질금리 + 기대물가", "10년물, 월평균, 단위: %",
    f"미국 10년물 명목금리 **{f(no[-1],2)}%**는 실질금리 **{f(re_[-1],2)}%**와 기대물가 **{f(be[-1],2)}%**로 나뉘고 실질금리는 {lab[imr]} **{f(re_[imr],2)}%**까지 내려갔었음",
    ["기대물가 = 명목 10년물 − 물가연동 10년물(손익분기 물가상승률, ECOM 계산)", "물가연동 10년물 금리는 실질금리의 시장 값"], "FRED(DGS10 · DFII10)", asof("DFII10"))


# ---------------------------------------------------------------- 쓰기
def clean(o):
    if isinstance(o, dict): return {k.rstrip("_"): clean(v) for k, v in o.items()}
    if isinstance(o, list): return [clean(x) for x in o]
    return o


lib = []
for x in OUT:
    x = clean(x); x.pop("real", None); lib.append(x)
(ROOT / "library" / "mockups" / "v4").mkdir(parents=True, exist_ok=True)
(ROOT / "library" / "mockups" / "v4" / "F02.json").write_text(json.dumps(lib, ensure_ascii=False, indent=1), encoding="utf-8")
(ROOT / "style" / "demo4_r2_F02.json").write_text(json.dumps(dict(schema=3, meta=dict(session="R2", title="F02 2차 목업"), slides=[x["slide"] for x in lib]), ensure_ascii=False), encoding="utf-8")
print(len(lib), "목업", sum(1 for x in OUT if x["real"]), "실제 값", sum(1 for x in OUT if not x["real"]), "예시 값")
for x in lib: print(x["id"], x["kind"], hl(x["slide"]["head"]), x["slide"]["head"])
