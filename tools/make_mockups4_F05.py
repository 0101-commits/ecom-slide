# F05 인과 사슬 · 흐름도(N051~N064) + F06 산키(N065) 1차 목업 — data/snap4 · data/snap 에서 계산해 만든다
# 실행: python -X utf8 tools/make_mockups4_F05.py → library/mockups/v4/F05.json · style/demo4_r1_F05.json
import json, datetime as dt
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
S4 = ROOT / "data" / "snap4"
S1 = ROOT / "data" / "snap"


def ld4(i):
    return json.load(open(S4 / f"{i}.json", encoding="utf8"))


def ld1(i):
    return json.load(open(S1 / f"{i}.json", encoding="utf8"))["data"]


def D(s):
    return dt.date.fromisoformat(s)


def at(ser, d):
    r = None
    for a, b in ser["data"]:
        if b is None:
            continue
        if D(a) <= d:
            r = (a, b)
        else:
            break
    return r


ASOF = []


def mark(d):
    ASOF.append(d)


def last(i):
    s = ld4(i)
    a, b = [x for x in s["data"] if x[1] is not None][-1]
    mark(a)
    return b, a


def chg(i, pct=True, monthly=False):
    """(현재값, 1년 전 값, 변화(%는 비율 %, pct=False 면 차이), 현재 날짜) — 월 · 분기 자료는 같은 달 1년 전과 짝을 맞춘다"""
    s = ld4(i)
    dat = [x for x in s["data"] if x[1] is not None]
    if s["freq"] in ("월", "분기", "연"):
        m = {a: b for a, b in dat}
        for a, b in reversed(dat):
            d = D(a)
            p = f"{d.year - 1}-{d.month:02d}-{d.day:02d}"
            if p in m:
                mark(a)
                return b, m[p], ((b / m[p] - 1) * 100 if pct else b - m[p]), a
    a, b = dat[-1]
    d = D(a)
    p = at(s, dt.date(d.year - 1, d.month, min(d.day, 28)))
    mark(a)
    return b, p[1], ((b / p[1] - 1) * 100 if pct else b - p[1]), a


def sg(v, d=1):
    return f"{v:+.{d}f}".replace("-", "−")


def fm(v, d=1):
    return f"{v:,.{d}f}".replace("-", "−")


def ymd(a):
    return a[:4] + "." + a[5:7] + ("." + a[8:10] if len(a) > 7 and a[8:10] != "01" else "")


def ym(a):
    return a[:4] + "." + a[5:7]


def monthly(i, n=24):
    s = ld4(i)
    return [round(x[1], 3) for x in s["data"] if x[1] is not None][-n:]


def foot(notes, src, asof=None):
    a = asof or max(ASOF)
    import re
    notes = [re.sub(r"^\d\)\s*", "", n) for n in notes]
    return {"notes": notes, "source": src, "asof": a[:4] + "." + a[5:7] + "." + a[8:10]}


def headlen(h):
    return len(h.replace("**", "").replace(" ", ""))


items = []


def add(nid, kind, fam, variant, title, facts, slide):
    h = slide["head"]
    n = headlen(h)
    assert 50 <= n <= 90, (nid, n, h)
    slide["kind"] = kind
    items.append({"id": nid, "kind": kind, "family": fam, "variant": variant, "title": title, "tags": ["4판"], "facts": facts, "slide": slide})


# ───────── 데이터 한꺼번에 ─────────
ASOF.clear()
wti = chg("DCOILWTICO"); gas = chg("GASREGW"); ppi = chg("PPIACO"); cpi = chg("CPIAUCSL"); core = chg("CPILFESL")
d30 = chg("DGS30", pct=False); mort = chg("MORTGAGE30US", pct=False); hp = chg("CSUSHPINSA"); sent = chg("UMCSENT", pct=False)
jolts = chg("JTSJOL", pct=False); cop = chg("PCOPPUSDM"); wheat = chg("PWHEAMTUSDM"); m2 = chg("M2SL"); usd = chg("DTWEXBGS")
fed = chg("DFEDTARU", pct=False)

# ===== N051 가로 사슬 + 고리 숫자 =====
chain = [("WTI 원유", wti, "{:,.1f}달러/배럴", "원료"), ("미국 휘발유", gas, "{:.3f}달러/갤런", "소매"), ("생산자물가", ppi, "지수 {:,.1f}", "도매"), ("소비자물가", cpi, "지수 {:,.1f}", "소비자")]
nodes = []
for nm, c, f, tg in chain:
    nodes.append({"name": nm, "value": sg(c[2]) + "%", "vsub": "1년 전 대비", "sub": f.format(c[0]), "tag": tg})
links = []
for k in range(3):
    r = chain[k + 1][1][2] / chain[k][1][2]
    links.append({"text": f"×{r:.2f}", "sub": "앞 고리의 몇 배"})
tot = cpi[2] / wti[2]
head = f"원유가 **1년 새 {wti[2]:.1f}%** 오르는 동안 휘발유 · 생산자물가를 거쳐 **소비자물가는 {cpi[2]:.1f}%** 오르는 데 그쳐 고리마다 전달 폭이 줄어드는 모습임"
add("N051", "czchain", "F05", "가로 사슬 + 고리 숫자", "유가 → 휘발유 → 생산자물가 → 소비자물가",
    {"wti": wti[2], "gas": gas[2], "ppi": ppi[2], "cpi": cpi[2], "ratio_total": round(tot, 3)},
    {"eyebrow": {"group": "물가 전파", "topic": "원유에서 소비자물가까지 가격이 번지는 길", "basis": "각 지표 자료 마지막 시점의 1년 전 대비, 단위: %"}, "head": head, "shape": "circle", "nodes": nodes, "lks": links,
     "total": {"text": f"끝까지 가면 {wti[2]:.1f}% → {cpi[2]:.1f}% (×{tot:.2f})"},
     "foot": foot(["1) 고리 숫자 = 뒤 지표 변화율 ÷ 앞 지표 변화율", "2) 지표마다 자료 시점이 달라 마지막 시점 기준(원유 · 휘발유는 일 · 주 자료)"], "FRED(DCOILWTICO · GASREGW · PPIACO · CPIAUCSL)")})

# ===== N052 갈래(하나 → 셋) =====
leaves = [
    {"name": "30년 모기지 금리", "value": f"{mort[0]:.2f}%", "sub": f"1년 전 {mort[1]:.2f}%", "rel": sg(mort[2], 2) + "%p"},
    {"name": "케이스-실러 주택가격", "value": f"{hp[0]:.1f}", "sub": "지수 · 1년 전 " + f"{hp[1]:.1f}", "rel": sg(hp[2]) + "%"},
    {"name": "구인 건수", "value": f"{jolts[0] / 1000:.2f}백만 건", "sub": f"1년 전 {jolts[1] / 1000:.2f}백만 건", "rel": sg(jolts[2] / 1000, 2) + "백만"},
]
head = f"30년 국채금리가 **1년 새 {d30[2]:.2f}%p** 올라 {d30[0]:.2f}%가 되자 **모기지 금리는 {mort[0]:.2f}%** 로 뛰고 주택가격 · 구인 쪽으로 번짐"
add("N052", "czfan", "F05", "갈래(하나 → 셋)", "장기금리가 모기지 · 주택 · 구인으로",
    {"d30": d30[0], "d30_chg": d30[2], "mort": mort[0], "hp": hp[0], "jolts": jolts[0]},
    {"eyebrow": {"group": "금리 전파", "topic": "장기금리 하나가 세 곳으로 갈라지는 길", "basis": "수준과 1년 전 대비 변화"}, "head": head, "mode": "out",
     "hub": {"tag": "원인", "name": "미국 국채 30년물 금리", "value": f"{d30[0]:.2f}%", "sub": f"1년 전 {d30[1]:.2f}% 대비 {sg(d30[2], 2)}%p"}, "leaves": leaves,
     "foot": foot(["1) 띠 위 이름표 = 각 지표의 1년 전 대비 변화(%p · % · 백만 건)", "2) 같은 시기 변화를 나란히 놓은 것으로 인과의 크기는 아님"], "FRED(DGS30 · MORTGAGE30US · CSUSHPINSA · JTSJOL)")})

# ===== N053 합류(셋 → 하나) =====
leaves = [
    {"name": "소비자물가 상승률", "value": f"{cpi[2]:.1f}%", "sub": "1년 전 대비", "rel": "물가"},
    {"name": "30년 모기지 금리", "value": f"{mort[0]:.2f}%", "sub": f"1년 전 대비 {sg(mort[2], 2)}%p", "rel": "금리"},
    {"name": "미국 휘발유 소매가", "value": f"{gas[0]:.2f}달러", "sub": f"1년 전 대비 {sg(gas[2])}%", "rel": "에너지"},
]
head = f"물가 **{cpi[2]:.1f}%** · 모기지 금리 **{mort[0]:.2f}%** · 휘발유 {gas[0]:.2f}달러가 한곳에 모여 **소비자심리는 {sent[0]:.1f}**로 1년 새 {abs(sent[2]):.1f}포인트 내려앉음"
add("N053", "czfan", "F05", "합류(셋 → 하나)", "세 부담이 모여 소비자심리로",
    {"cpi": cpi[2], "mort": mort[0], "gas": gas[0], "sent": sent[0], "sent_chg": sent[2]},
    {"eyebrow": {"group": "가계 심리", "topic": "세 가지 부담이 소비자심리로 모이는 길", "basis": "수준과 1년 전 대비 변화"}, "head": head, "mode": "in",
     "hub": {"tag": "결과", "name": "미시간대 소비자심리지수", "value": f"{sent[0]:.1f}", "sub": f"1년 전 {sent[1]:.1f} 대비 {sg(sent[2])}포인트"}, "leaves": leaves,
     "foot": foot(["1) 같은 시기 값을 모아 놓은 것으로 심리 하락의 몫을 나눈 것은 아님", "2) 소비자물가 상승률 = 지수의 1년 전 같은 달 대비"], "FRED(CPIAUCSL · MORTGAGE30US · GASREGW · UMCSENT)")})

# ===== N054 두 고리 8자 =====
intr = ld4("A091RC1Q027SBEA"); iv = [x for x in intr["data"] if x[1] is not None][-1]; mark(iv[0])
debt = chg("GFDEGDQ188S", pct=False); fy_exp, a1 = last("FYONET"); fy_rev, a2 = last("FYFR"); fy_def, a3 = last("FYFSD")
q = (D(iv[0]).month - 1) // 3 + 1
head = f"연방 이자 지출이 연 **{iv[1] / 1000:.2f}조 달러**로 불어 **적자 {abs(fy_def) / 1e6:.2f}조 달러**를 키우고 부채는 **GDP의 {debt[0]:.1f}%** 까지 쌓이는 두 고리가 맞물림"
add("N054", "czloop", "F05", "두 고리 8자", "부채 ↔ 금리 악순환",
    {"interest_bn": iv[1], "deficit_m": fy_def, "debt_gdp": debt[0], "d30": d30[0]},
    {"eyebrow": {"group": "재정 악순환", "topic": "이자 지출을 가운데 두고 맞물린 두 고리", "basis": "연율 · 회계연도 합계, 단위: 조 달러 · %"}, "head": head,
     "center": {"name": "연방 이자 지출", "value": f"{iv[1] / 1000:.2f}조 달러", "sub": f"연율 · {iv[0][:4]}.{q}분기"},
     "left": {"title": "고리 ① 부채 눈덩이", "sub": "이자 → 지출 → 부채 → 이자", "nodes": [
         {"name": "연방 지출", "value": f"{fy_exp / 1e6:.2f}조 달러", "sub": f"수입 {fy_rev / 1e6:.2f}조 달러"},
         {"name": "연방부채 / GDP", "value": f"{debt[0]:.1f}%", "sub": f"1년 전 {debt[1]:.1f}%"}], "links": [{"text": "지출에 포함"}, {"text": "빚으로 쌓임"}, {"text": "이자 부담 ↑"}]},
     "right": {"title": "고리 ② 금리 눌림", "sub": "이자 → 국채 → 금리 → 이자", "nodes": [
         {"name": "국채로 메울 몫", "value": f"{abs(fy_def) / 1e6:.2f}조 달러", "sub": "지출 − 수입"},
         {"name": "30년 국채금리", "value": f"{d30[0]:.2f}%", "sub": f"1년 전 대비 {sg(d30[2], 2)}%p"}], "links": [{"text": "적자 메우려 발행"}, {"text": "공급 늘면 금리 ↑"}, {"text": "차환 이자 ↑"}]},
     "foot": foot(["1) 이자 지출 = 연방정부 이자 지출(연율, 분기 자료), 수입 · 지출 · 적자 = 회계연도 합계", "2) 고리 방향 · 이름표는 구조 설명이며 값은 모두 실제 자료"], "FRED(A091RC1Q027SBEA · FYONET · FYFR · FYFSD · GFDEGDQ188S · DGS30)")})

# ===== N055 도미노 (2008) =====
cs = ld4("CSUSHPINSA"); pk = max([x for x in cs["data"] if "2004" <= x[0][:4] <= "2008"], key=lambda x: x[1]); tr = min([x for x in cs["data"] if "2009" <= x[0][:4] <= "2013"], key=lambda x: x[1])
vx = ld4("VIXCLS"); vmax = max([x for x in vx["data"] if "2008-09" <= x[0][:7] <= "2009-06" and x[1] is not None], key=lambda x: x[1])
wc = ld4("WALCL"); w0 = at(wc, D("2008-09-03")); w1 = at(wc, D("2008-12-31"))
ic = ld4("ICSA"); imax = max([x for x in ic["data"] if "2008-09" <= x[0][:7] <= "2010-12" and x[1] is not None], key=lambda x: x[1])
ft = ld4("DFEDTARU"); f0 = ft["data"][0]
dp = (tr[1] / pk[1] - 1) * 100
for a in (pk[0], tr[0], vmax[0], w1[0], imax[0], f0[0]):
    pass
head = f"주택가격이 고점 대비 **{abs(dp):.0f}%** 떨어지자 VIX가 **{vmax[1]:.1f}**까지 치솟고 연준 자산은 **{w1[1] / w0[1]:.1f}배**로 불었으며 실업수당 청구는 **{imax[1] / 1000:.0f}천 건**까지 늘었음"
tiles = [
    {"name": "주택가격 하락", "value": sg(dp, 0) + "%", "sub": f"케이스-실러 {pk[1]:.0f} → {tr[1]:.0f}", "date": ym(pk[0]) + "~" + ym(tr[0])},
    {"name": "공포 지수 VIX 급등", "value": f"{vmax[1]:.1f}", "sub": "금융위기 중 최고", "date": ymd(vmax[0])},
    {"name": "연준 자산 확대", "value": f"{w1[1] / 1e6:.1f}조 달러", "sub": f"{w0[1] / 1e6:.1f}조에서 {w1[1] / w0[1]:.1f}배", "date": "2008.09~12"},
    {"name": "정책금리 0.25%", "value": f"{f0[1]:.2f}%", "sub": "목표금리 상단", "date": ymd(f0[0])},
    {"name": "실업수당 청구 급증", "value": f"{imax[1] / 1000:.0f}천 건", "sub": "주간 신규 청구 최고", "date": ymd(imax[0])},
]
add("N055", "czdomino", "F05", "도미노 연쇄", "2008년 금융위기 연쇄",
    {"hp_decline": dp, "vix_max": vmax[1], "walcl_x": w1[1] / w0[1], "icsa_max": imax[1], "fed_top": f0[1]},
    {"eyebrow": {"group": "금융위기 연쇄", "topic": "2008년 주택가격 하락에서 실업까지 번진 순서", "basis": "고점 · 최고치 기준, 단위: % · 지수 · 조 달러 · 천 건"}, "head": head, "tiles": tiles, "lead": {"text": "2008년 위기 · 쓰러진 순서 →"},
     "foot": foot(["주택가격 고점 = 2004~08년 최고, 저점 = 2009~13년 최저(케이스-실러)", "VIX · 실업수당 = 2008.9~2010.12 최고, 연준 자산 = 2008.9.3 대비 12.31"], "FRED(CSUSHPINSA · VIXCLS · WALCL · DFEDTARU · ICSA)", "2026-11-13")})
ASOF.append("2026-11-13")

# ===== N056 정책 전파 배관 (+1%p 넘은 순서) =====
def first_up(d, pp):
    b = d[0][1]
    for k, v in d:
        if v >= b + pp:
            return k


def mi(k):
    y, m = k.split(".")
    return (int(y) - 2021) * 12 + int(m) - 1


ser = [("미 국채 2년물", "fred_dgs2"), ("미 국채 10년물", "fred_dgs10"), ("한국 기준금리", "ecos_rate"), ("미 정책금리", "fred_fedfunds")]
info = []
for nm, f in ser:
    d = ld1(f)
    st = first_up(d, 1.0)
    pkk = max(d, key=lambda x: x[1])
    info.append((nm, st, pkk[0], pkk[1], d[-1]))
info.sort(key=lambda x: mi(x[1]))
nodes = []
for i, (nm, st, pk_, pv, ls) in enumerate(info):
    nodes.append({"name": nm, "value": st, "lag": ("" if i == 0 else f"+{mi(st) - mi(info[i - 1][1])}개월")})
gap = mi(info[-1][1]) - mi(info[0][1])
bars = [{"from": mi(st), "to": mi(pk_), "label": nm, "tone": ["main", "g65", "g40", "g18"][i]} for i, (nm, st, pk_, pv, ls) in enumerate(info)]
ASOF.append("2026-10-01")
head = f"금리가 2021.01보다 **+1%p를 넘긴 순서**는 {info[0][0]} {ym(info[0][1].replace('.', '-') + '-01')} → {info[-1][0]} {ym(info[-1][1].replace('.', '-') + '-01')}로 시장금리가 정책금리보다 **{gap}개월 앞섬**"
add("N056", "pipe", "F05", "정책 전파 배관", "금리가 움직인 순서와 시차",
    {"order": [(n[0], n[1]) for n in info], "gap_months": gap},
    {"eyebrow": {"group": "금리 전파", "topic": "2021년 이후 금리가 +1%p를 넘긴 순서", "basis": "월평균, 2021.01 대비, 단위: 개월"}, "head": head, "nodes": nodes,
     "lane2": {"from": 0, "to": len(nodes) - 1, "label": f"시장이 먼저, 정책은 {gap}개월 뒤", "sub": "정책금리는 시장금리를 따라 올랐음"},
     "gantt": {"title": "+1%p 넘은 달 → 정점(2021.01 = 0개월)", "max": 72, "step": 12, "unit": "개월", "bars": bars},
     "foot": foot(["1) +1%p 넘은 달 = 2021.01 월평균보다 1%p 이상 높아진 첫 달, 정점 = 이후 월평균 최고", "2) 10년물 정점은 자료 마지막 달(진행 중)"], "FRED(DGS2 · DGS10 · FEDFUNDS), 한국은행 ECOS(기준금리)", "2026-10-31")})

# ===== N057 물고기뼈 =====
head = f"소비자물가 **{cpi[2]:.1f}%** 상승의 뒤에는 원유 **{sg(wti[2], 0)}%** · 밀 **{sg(wheat[2], 0)}%** · 구리 **{sg(cop[2], 0)}%** 등 원재료 가격이 오른 여섯 갈래가 있음"
bones = [
    {"name": "에너지(WTI 원유)", "value": sg(wti[2]) + "%", "sub": f"{wti[0]:.1f}달러/배럴"},
    {"name": "식량(밀)", "value": sg(wheat[2]) + "%", "sub": f"{wheat[0]:.0f}달러/톤"},
    {"name": "금속(구리)", "value": sg(cop[2]) + "%", "sub": f"{cop[0]:,.0f}달러/톤"},
    {"name": "통화량(M2)", "value": sg(m2[2]) + "%", "sub": f"{m2[0] / 1000:.1f}조 달러"},
    {"name": "주거(주택가격)", "value": sg(hp[2]) + "%", "sub": f"케이스-실러 {hp[0]:.1f}"},
    {"name": "달러 가치", "value": sg(usd[2]) + "%", "sub": f"달러지수 {usd[0]:.1f}"},
]
add("N057", "czfish", "F05", "물고기뼈 원인도", "소비자물가 상승의 여섯 갈래",
    {"cpi": cpi[2], "wti": wti[2], "wheat": wheat[2], "cu": cop[2], "m2": m2[2], "hp": hp[2], "usd": usd[2]},
    {"eyebrow": {"group": "물가 원인", "topic": "소비자물가 상승 옆에 놓인 여섯 가지 변화", "basis": "1년 전 대비 변화, 단위: %"}, "head": head, "bones": bones,
     "foot": foot(["1) 각 가지 숫자 = 지표의 1년 전 대비 변화, 같은 시기 변화를 나열한 것으로 원인의 크기는 아님", "2) 소비자물가 상승률은 지수의 1년 전 같은 달 대비"], "FRED(CPIAUCSL · DCOILWTICO · PWHEAMTUSDM · PCOPPUSDM · M2SL · CSUSHPINSA · DTWEXBGS)")})
# czfish 의 결과(머리) 칸은 slide.head 와 겹치지 않도록 fishHead 로 둠
items[-1]["slide"]["fishHead"] = {"name": "미국 소비자물가 상승률", "value": f"{cpi[2]:.1f}%", "sub": "1년 전 같은 달 대비"}

# ===== N058 세로 인과 계단 (유동성) =====
wal = chg("WALCL"); res = chg("WRESBAL"); rrp = ld4("RRPONTSYD"); rr = chg("RRPONTSYD", pct=False); tga = chg("WTREGEN")
head = f"연준 자산 **{wal[0] / 1e6:.2f}조 달러**에서 은행 지준 **{res[0] / 1e6:.2f}조 달러**를 거쳐 역레포는 **{rr[2]:+.1f}억 달러**로 바닥나 유동성이 재무부 계좌로 옮겨 감".replace("+", "")
head = f"연준 자산 **{wal[0] / 1e6:.2f}조 달러**와 은행 지준 **{res[0] / 1e6:.2f}조 달러** 위에서 역레포가 **{rrp['data'][-1][1] * 10:.1f}억 달러**로 바닥나고 재무부 계좌는 **{tga[0] / 1e6:.2f}조 달러**임"
steps = [
    {"tag": "① 공급", "title": "연준이 푼 돈(총자산)", "sub": "연준 대차대조표", "ev": {"value": f"{wal[0] / 1e6:.2f}조", "label": f"1년 전 대비 {sg(wal[2])}%", "note": "연준 총자산(달러)"}},
    {"tag": "② 쌓임", "title": "은행이 연준에 맡긴 돈(지준)", "sub": "은행 지급준비금", "ev": {"value": f"{res[0] / 1e6:.2f}조", "label": f"1년 전 대비 {sg(res[2])}%", "note": "지준 잔액(달러)"}},
    {"tag": "③ 빠짐", "title": "단기 여윳돈의 대피처(역레포)", "sub": "연준에 하루 맡긴 돈", "ev": {"value": f"{rrp['data'][-1][1]:.2f}십억", "label": f"1년 전 대비 {sg(rr[2], 1)}십억", "note": "역레포 잔액(달러)"}},
    {"tag": "④ 이동", "title": "재무부 금고(TGA)", "sub": "정부가 쓰기 전에 쌓아 둔 돈", "ev": {"value": f"{tga[0] / 1e6:.2f}조", "label": f"1년 전 대비 {sg(tga[2])}%", "note": "재무부 일반계정(달러)"}},
]
mark(rrp["data"][-1][0])
add("N058", "czvstep", "F05", "세로 인과 계단", "연준에서 재무부 금고까지 유동성",
    {"walcl": wal[0], "wresbal": res[0], "rrp": rrp["data"][-1][1], "tga": tga[0]},
    {"eyebrow": {"group": "유동성", "topic": "연준에서 재무부 금고로 이어지는 돈의 길", "basis": "잔액(달러)과 1년 전 대비 변화"}, "head": head, "steps": steps, "evTitle": "근거 숫자(자료 마지막 시점)",
     "foot": foot(["1) 위에서 아래로 갈수록 돈이 놓이는 자리가 연준 → 은행 → 단기시장 → 재무부로 옮겨 감", "2) 역레포 · 지준 · TGA는 일 · 주 자료로 마지막 시점이 서로 다름"], "FRED(WALCL · WRESBAL · RRPONTSYD · WTREGEN)")})

# ===== N059 사슬 + 고리별 작은 선 (한국) =====
def corr(a, b):
    n = min(len(a), len(b)); a = a[-n:]; b = b[-n:]
    ma = sum(a) / n; mb = sum(b) / n
    c = sum((x - ma) * (y - mb) for x, y in zip(a, b)); va = sum((x - ma) ** 2 for x in a) ** .5; vb = sum((y - mb) ** 2 for y in b) ** .5
    return c / (va * vb)


fx = [x[1] for x in ld1("fred_dexkous")]; kc = [x[1] for x in ld1("ecos_cpi_yoy")]; kr = [x[1] for x in ld1("ecos_rate")]
k10 = [x[1] for x in ld4("IRLTLT01KRM156N")["data"] if x[1] is not None and x[0] >= "2021-01-01"]
lab = [x[0] for x in ld1("fred_dexkous")]
mark("2026-10-01")
ser5 = [("원/달러 환율", fx, "{:,.0f}원", "월평균", 0, "원"), ("소비자물가 상승률", kc, "{:.2f}%", "전년동월비", 2, "%"), ("한국 기준금리", kr, "{:.2f}%", "월말 수준", 2, "%"), ("국고채 10년 금리", k10, "{:.2f}%", "OECD 월 자료", 2, "%")]
nodes = []
for i, (nm, v, f, vs, dec, un) in enumerate(ser5):
    tail = v[-24:]
    nodes.append({"name": nm, "value": f.format(v[-1]), "vsub": vs, "mini": {"data": [round(x, 3) for x in tail], "first": "24.11" if i < 3 else "24.10", "last": "26.10" if i < 3 else "26.09", "dec": dec, "unit": un}})
links = []
for i in range(3):
    c = corr(ser5[i][1], ser5[i + 1][1][:len(ser5[i][1])] if len(ser5[i + 1][1]) >= len(ser5[i][1]) else ser5[i + 1][1])
    links.append({"text": f"상관 {sg(c, 2)}"})
head = f"원/달러 환율 **{fx[-1]:,.0f}원**에서 소비자물가 **{kc[-1]:.2f}%** · 기준금리 **{kr[-1]:.2f}%** · 국고채 10년 **{k10[-1]:.2f}%** 로 이어지는 한국 사슬의 최근 2년 흐름"
add("N059", "czchain", "F05", "사슬 + 고리별 작은 선", "환율 → 물가 → 기준금리 → 장기금리(한국)",
    {"fx": fx[-1], "cpi": kc[-1], "rate": kr[-1], "k10": k10[-1], "corr": [l["text"] for l in links]},
    {"eyebrow": {"group": "한국 사슬", "topic": "한국의 환율 · 물가 · 금리가 이어지는 길", "basis": "최근 24개월 월 자료"}, "head": head, "shape": "card", "nodes": nodes, "lks": links,
     "foot": foot(["1) 고리 숫자 = 2021.01 이후 월 값의 상관계수(인과의 세기가 아님)", "2) 국고채 10년은 OECD 월 자료로 마지막 달이 2026.09"], "한국은행 ECOS(기준금리 · 소비자물가), FRED(EXKOUS · IRLTLT01KRM156N)", "2026-10-31")})

# ===== N060 충격 동심원 (2020.03) =====
v20 = max([x for x in vx["data"] if "2020-02" <= x[0][:7] <= "2020-06" and x[1] is not None], key=lambda x: x[1])
i20 = max([x for x in ic["data"] if "2020-03" <= x[0][:7] <= "2020-07" and x[1] is not None], key=lambda x: x[1])
wa = at(wc, D("2020-02-26")); wp = max([x for x in wc["data"] if "2020-03" <= x[0][:7] <= "2023-12"], key=lambda x: x[1])
cy = ld1("fred_cpi_yoy"); cpk = max([x for x in cy if "2021" <= x[0][:4] <= "2023"], key=lambda x: x[1])
head = f"2020.03 팬데믹 충격은 VIX **{v20[1]:.1f}** → 실업수당 **{i20[1] / 1e6:.1f}백만 건** → 연준 자산 **{wp[1] / wa[1]:.1f}배** → 소비자물가 **{cpk[1]:.1f}%** 로 네 겹 번짐"
rings = [
    {"tag": "1차", "name": "금융시장 : VIX 최고", "value": f"{v20[1]:.1f}", "sub": f"{ymd(v20[0])} · 평소 10~20대에서 한 달 만에 치솟음"},
    {"tag": "2차", "name": "일자리 : 신규 실업수당 청구 최고", "value": f"{i20[1] / 1e6:.2f}백만 건", "sub": f"{ymd(i20[0])} 주간 · 한 주에 수백만 명이 청구"},
    {"tag": "3차", "name": "통화 대응 : 연준 총자산 정점", "value": f"{wp[1] / 1e6:.2f}조 달러", "sub": f"{ym(wp[0])} · 위기 직전 {wa[1] / 1e6:.2f}조의 {wp[1] / wa[1]:.1f}배"},
    {"tag": "4차", "name": "물가 : 소비자물가 상승률 정점", "value": f"{cpk[1]:.1f}%", "sub": f"{cpk[0]} 전년동월비 · 충격 2년 뒤"},
]
ASOF.append("2026-10-01")
add("N060", "czrings", "F05", "충격 동심원", "2020년 3월 팬데믹 충격의 번짐",
    {"vix": v20[1], "icsa": i20[1], "walcl_x": wp[1] / wa[1], "cpi_peak": cpk[1]},
    {"eyebrow": {"group": "충격 파급", "topic": "2020.03 팬데믹 충격이 안쪽에서 바깥으로 번진 모습", "basis": "각 고리별 정점 값"}, "head": head, "core": {"title": "2020.03\n팬데믹\n충격", "sub": ""}, "rings": rings,
     "foot": foot(["1) VIX · 실업수당 = 2020.2~7월 최고, 연준 자산 = 2020.2.26 대비 2023.12까지 최고", "2) 소비자물가 상승률 = 2021~2023년 중 최고(미국 CPI 전년동월비)"], "FRED(VIXCLS · ICSA · WALCL · CPIAUCSL)", "2026-10-31")})
items[-1]["slide"]["core"]["title"] = "2020.03 팬데믹"

# ===== N061 산업 연결망 (예시 값) =====
nd = [
    {"id": "A", "name": "A 소재", "value": 88, "x": .06, "y": .22, "tone": "dark"}, {"id": "D", "name": "D 에너지", "value": 74, "x": .06, "y": .78, "tone": "dark"},
    {"id": "B", "name": "B 부품", "value": 52, "x": .30, "y": .12, "tone": "main"}, {"id": "E", "name": "E 운송", "value": 34, "x": .30, "y": .88, "tone": "g65"},
    {"id": "C", "name": "C 완제품", "value": 100, "x": .52, "y": .48, "tone": "main"}, {"id": "F", "name": "F 유통", "value": 46, "x": .76, "y": .16, "tone": "g65"},
    {"id": "G", "name": "G 금융", "value": 40, "x": .76, "y": .84, "tone": "g40"}, {"id": "H", "name": "H 서비스", "value": 58, "x": .96, "y": .50, "tone": "g65"},
]
ed = [("A", "B", 9), ("A", "C", 6), ("D", "A", 8), ("D", "E", 5), ("D", "C", 4), ("B", "C", 10), ("E", "C", 5), ("C", "F", 9), ("C", "H", 6), ("F", "H", 7), ("G", "C", 4), ("G", "F", 3), ("E", "F", 3)]
head = "가상의 여덟 산업에서 **C 완제품**으로 선이 가장 많이 모이고 **A 소재 · D 에너지**가 앞단에서 공급하는 연결 구조를 큰 마디와 굵은 선으로 보임"
add("N061", "cznet", "F05", "산업 연결망", "산업 간 연결망(예시)",
    {"example": True, "nodes": len(nd), "edges": len(ed)},
    {"eyebrow": {"group": "산업 연결", "topic": "산업 사이 거래가 이어진 연결망", "basis": "마디 크기 = 규모 지수 · 예시 값"}, "head": head, "nodes": nd, "edges": [{"from": a, "to": b, "w": w} for a, b, w in ed], "dec": 0, "unit": "", "sizeKey": "마디 크기 = 산업 규모 지수(예시)", "edgeKey": "선 굵기 = 거래 비중(예시)",
     "foot": {"notes": ["숫자는 모양을 보이기 위한 예시 값", "산업 이름은 가상의 구분이며 실제 통계가 아님"], "source": "예시(모양 시험용)", "asof": "2026.11.13"}})

# ===== N062 두 경로 비교 =====
def snap_at(i, d, pct=False):
    s = ld4(i); a = at(s, d); p = at(s, dt.date(d.year - 1, d.month, min(d.day, 28)))
    return a[1], p[1], a[0]


def mon_pair(i, y, m):
    s = {a: b for a, b in ld4(i)["data"] if b is not None}
    return s.get(f"{y}-{m:02d}-01"), s.get(f"{y - 1}-{m:02d}-01")


rows = []
for lab_, sub_, dd, (cy_, cm_), tone in [("지난번 경로", "2022.10", dt.date(2022, 10, 31), (2022, 10), "cmp"), ("이번 경로", "2026.11 기준", dt.date(2026, 11, 12), (2026, 9), "main")]:
    w_, wp_, _ = snap_at("DCOILWTICO", dd); c_, cp_ = mon_pair("CPIAUCSL", cy_, cm_); f_, _, _ = snap_at("DFEDTARU", dd); mo_, _, _ = snap_at("MORTGAGE30US", dd)
    rows.append({"label": lab_, "sub": sub_, "tone": tone, "nodes": [
        {"name": "원유 가격", "value": sg((w_ / wp_ - 1) * 100) + "%", "vsub": "1년 전 대비", "sub": f"{w_:.1f}달러/배럴"},
        {"name": "소비자물가", "value": sg((c_ / cp_ - 1) * 100) + "%", "vsub": "1년 전 대비", "sub": ""},
        {"name": "정책금리 상단", "value": f"{f_:.2f}%", "vsub": "연준 목표", "sub": ""},
        {"name": "30년 모기지 금리", "value": f"{mo_:.2f}%", "vsub": "주간", "sub": ""}], "links": [{"text": ""}, {"text": ""}, {"text": ""}],
        "raw": [(w_ / wp_ - 1) * 100, (c_ / cp_ - 1) * 100, f_, mo_]})
a, b = rows[0].pop("raw"), rows[1].pop("raw")
diffs = [sg(b[0] - a[0], 1) + "%p", sg(b[1] - a[1], 1) + "%p", sg(b[2] - a[2], 2) + "%p", sg(b[3] - a[3], 2) + "%p"]
for r in rows:
    r["links"] = [{} for _ in range(3)]
head = f"원유 변화율이 **{sg(a[0], 0)}% → {sg(b[0], 0)}%** 로 커졌어도 이번 경로의 물가는 **{b[1]:.1f}%** 로 지난번 **{a[1]:.1f}%** 의 절반 남짓이고 모기지는 **{b[3]:.2f}%** 로 비슷함"
add("N062", "czchain", "F05", "두 경로 비교 사슬", "지난번(2022.10)과 이번 경로",
    {"prev": a, "now": b},
    {"eyebrow": {"group": "경로 비교", "topic": "2022.10과 지금, 같은 네 고리의 값 비교", "basis": "같은 지표 · 같은 순서, 단위: % · %p"}, "head": head, "shape": "rows", "rows": rows, "diffs": diffs,
     "foot": foot(["1) 사이 이름표 = 이번 값 − 지난번 값(변화율은 %p, 금리는 %p)", "2) 소비자물가 = 지수의 1년 전 같은 달 대비, 지난번은 2022.10, 이번은 마지막으로 1년 전과 짝이 있는 2026.9"], "FRED(DCOILWTICO · CPIAUCSL · DFEDTARU · MORTGAGE30US)")})

# ===== N063 끊긴 고리 =====
d30_1 = d30; ff = fed
nodes = [
    {"name": "정책금리 상단", "value": f"{fed[0]:.2f}%", "vsub": f"1년 전 대비 {sg(fed[2], 2)}%p", "sub": "연준 목표"},
    {"name": "30년 국채금리", "value": f"{d30[0]:.2f}%", "vsub": f"1년 전 대비 {sg(d30[2], 2)}%p", "sub": "시장이 정함"},
    {"name": "30년 모기지 금리", "value": f"{mort[0]:.2f}%", "vsub": f"1년 전 대비 {sg(mort[2], 2)}%p", "sub": "주택 대출"},
    {"name": "주택가격", "value": sg(hp[2]) + "%", "vsub": "1년 전 대비", "sub": f"케이스-실러 {hp[0]:.1f}"},
]
links = [{"text": "움직임 0.00 vs +%.2f%%p" % d30[2], "broken": True}, {"text": "함께 움직임"}, {"text": ""}]
links[0]["text"] = f"0.00 vs {sg(d30[2], 2)}%p"
head = f"정책금리는 1년째 **{fed[0]:.2f}%** 로 그대로인데 30년 국채금리는 **{sg(d30[2], 2)}%p** 올라 이 고리가 끊겼고 모기지 **{sg(mort[2], 2)}%p** 는 시장금리를 따라감"
add("N063", "czchain", "F05", "끊긴 고리 강조", "정책금리와 장기금리 사이가 끊김",
    {"fed": fed[0], "fed_chg": fed[2], "d30_chg": d30[2], "mort_chg": mort[2], "hp": hp[2]},
    {"eyebrow": {"group": "전달 점검", "topic": "정책금리가 장기금리 · 모기지로 닿지 않은 곳", "basis": "수준과 1년 전 대비 변화"}, "head": head, "shape": "broke", "nodes": nodes, "lks": links,
     "callout": {"title": "어디서 막혔나 : 정책금리 → 30년 국채금리", "text": f"지난 1년 정책금리 상단은 {fed[1]:.2f}% → {fed[0]:.2f}%로 그대로였지만 30년 국채금리는 {d30[1]:.2f}% → {d30[0]:.2f}%로 올랐음. 모기지 금리는 정책금리가 아니라 장기금리를 따라 {mort[1]:.2f}% → {mort[0]:.2f}%로 움직임."},
     "foot": foot(["1) 끊김 표시 = 같은 기간 두 지표의 움직임 방향 · 크기가 맞지 않는 고리", "2) 주택가격 = 케이스-실러 지수의 1년 전 같은 달 대비(월 자료)"], "FRED(DFEDTARU · DGS30 · MORTGAGE30US · CSUSHPINSA)")})

# ===== N064 진행 점검 사슬 =====
corev = chg("CPILFESL")
T1, T2, T3, T4 = 3.0, 20.0, 55.0, 0.5
ok = [corev[2] < T1, wti[2] < T2, sent[0] >= T3, d30[2] < T4]
nodes = [
    {"name": "근원 물가 안정", "rule": f"근원 CPI 상승률 {T1:.1f}% 미만", "value": f"{corev[2]:.1f}%", "vsub": "1년 전 대비", "on": ok[0], "short": "물가"},
    {"name": "에너지 안정", "rule": f"WTI 1년 변화 +{T2:.0f}% 미만", "value": sg(wti[2]) + "%", "vsub": f"{wti[0]:.1f}달러/배럴", "on": ok[1], "short": "에너지"},
    {"name": "소비자심리 회복", "rule": f"미시간대 심리지수 {T3:.0f} 이상", "value": f"{sent[0]:.1f}", "vsub": f"1년 전 {sent[1]:.1f}", "on": ok[2], "short": "심리"},
    {"name": "장기금리 안정", "rule": f"30년 금리 1년 변화 +{T4:.1f}%p 미만", "value": sg(d30[2], 2) + "%p", "vsub": f"{d30[0]:.2f}%", "on": ok[3], "short": "금리"},
]
no = sum(ok)
on_names = [n["name"] for n in nodes if n["on"]]
head = f"점검 사슬 네 칸 중 **{no}칸만 켜져** 근원 물가 **{corev[2]:.1f}%** 만 기준 안이고 유가 **{sg(wti[2], 0)}%** · 심리 **{sent[0]:.1f}** · 장기금리 **{sg(d30[2], 2)}%p** 는 기준 밖임"
add("N064", "czchain", "F05", "진행 점검 사슬", "금리 인하 전 네 가지 점검",
    {"ok": ok, "core": corev[2], "wti": wti[2], "sent": sent[0], "d30": d30[2]},
    {"eyebrow": {"group": "조건 점검", "topic": "물가 · 에너지 · 심리 · 장기금리 네 칸 점검", "basis": "기준선은 예시, 값은 실제"}, "head": head, "shape": "gate", "nodes": nodes,
     "result": {"title": "점검 결과", "text": f"{no} / 4 켜짐"},
     "foot": foot(["1) 점검 기준선(3.0% · +20% · 55 · +0.5%p)은 모양을 보이기 위한 예시이며 값은 실제 자료", "2) 켜짐 = 기준 충족, 앞 칸이 꺼지면 뒤 화살은 점선"], "FRED(CPILFESL · DCOILWTICO · UMCSENT · DGS30)")})

# ===== N065 산키 =====
rev, _ = last("FYFR"); exp_, _ = last("FYONET"); defi, _ = last("FYFSD"); interest = iv[1] / 1000
R = rev / 1e6; X = exp_ / 1e6; Df = abs(defi) / 1e6
ind = round(R * .50, 2); soc = round(R * .32, 2); corp = round(R * .10, 2); oth = round(R - ind - soc - corp, 2)
sp_s = round(X * .22, 2); sp_m = round(X * .24, 2); sp_d = round(X * .12, 2); sp_o = round(X - interest - sp_s - sp_m - sp_d, 2)
head = f"연방정부는 **{R:.2f}조 달러**를 걷어 **{X:.2f}조 달러**를 써 **{Df:.2f}조 달러**가 모자라고 이자 지출만 연 **{interest:.2f}조 달러**에 이름"
add("N065", "sankey", "F06", "산키", "연방 수입 → 지출 항목",
    {"revenue": R, "outlay": X, "deficit": Df, "interest": interest, "split": "항목 나눔은 예시"},
    {"eyebrow": {"group": "재정", "topic": "미국 연방정부 돈의 들고남", "basis": "회계연도, 단위: 조 달러 · 항목 나눔은 예시 값"}, "head": head, "unit": "조 달러", "dec": 2,
     "left": {"items": [{"name": "개인소득세", "value": ind}, {"name": "사회보장세", "value": soc}, {"name": "법인세", "value": corp}, {"name": "관세 · 기타", "value": oth}, {"name": "국채 발행(적자)", "value": round(Df, 2), "tone": "warn"}]},
     "mid": {"label": f"연방 예산 {X:.2f}조 달러"},
     "right": {"items": [{"name": "사회보장", "value": sp_s}, {"name": "의료", "value": sp_m}, {"name": "국방", "value": sp_d}, {"name": "국채 이자", "value": round(interest, 2), "tone": "warn"}, {"name": "그 밖", "value": sp_o, "tone": "gray"}]},
     "note": {"title": f"적자 {Df:.2f}조 달러", "lines": ["국채를 발행해 메움", "수입 · 지출 합계는 실제"], "tone": "warn"},
     "foot": foot(["1) 수입 · 지출 합계, 적자, 국채 이자는 FRED 실제 값이고 나머지 항목별 나눔은 예시 값", "2) 이자 지출은 2026.3분기 연율, 나머지는 2026 회계연도"], "FRED(FYFR · FYONET · FYFSD · A091RC1Q027SBEA)", "2026-09-30")})

# ───────── 마무리 ─────────
# czfish 의 머리 칸 이름 맞추기(결과 상자는 head 와 겹치지 않게 fishHead 로 받음)

out1 = ROOT / "library" / "mockups" / "v4"
out1.mkdir(parents=True, exist_ok=True)
json.dump(items, open(out1 / "F05.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
deck = {"schema": 3, "meta": {"session": "R1", "title": "F05 1차 목업"}, "slides": [it["slide"] for it in items]}
json.dump(deck, open(ROOT / "style" / "demo4_r1_F05.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
print(len(items), "개 목업 ·", ", ".join(f"{i['id']}:{i['kind']}" for i in items))
