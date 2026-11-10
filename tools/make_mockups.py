# 목업 ~300장 만들기 — data/snap/*.json 숫자만 써서 library/mockups/mockups.json 으로
# 실행: python -X utf8 tools/make_mockups.py   (같은 입력이면 같은 결과)
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SNAPDIR = ROOT / "data" / "snap"
OUT = ROOT / "library" / "mockups"
OUT.mkdir(parents=True, exist_ok=True)

SNAP = {}
for p in sorted(SNAPDIR.glob("*.json")):
    if p.name.startswith("_"):
        continue
    d = json.loads(p.read_text(encoding="utf-8"))
    SNAP[p.stem] = d
GOT = SNAP["ecos_ca"]["got"]

# 지표 표: file, 이름, 짧은 이름, 단위, 나눗수(백만 달러 → 억 달러), 소수 자릿수, 종류(flow 합산 가능 · rate 비율 · level 수준), 출처, 계열 id
IND = {
    "ca": ("ecos_ca", "경상수지", "경상수지", "억 달러", 100, 1, "flow", "한국은행 ECOS 301Y013", "ecos:301Y013:000000:M"),
    "goods": ("ecos_goods", "상품수지", "상품수지", "억 달러", 100, 1, "flow", "한국은행 ECOS 301Y013", "ecos:301Y013:100000:M"),
    "serv": ("ecos_serv", "서비스수지", "서비스수지", "억 달러", 100, 1, "flow", "한국은행 ECOS 301Y013", "ecos:301Y013:200000:M"),
    "pinc": ("ecos_pinc", "본원소득수지", "본원소득", "억 달러", 100, 1, "flow", "한국은행 ECOS 301Y013", "ecos:301Y013:300000:M"),
    "sinc": ("ecos_sinc", "이전소득수지", "이전소득", "억 달러", 100, 1, "flow", "한국은행 ECOS 301Y013", "ecos:301Y013:400000:M"),
    "krrate": ("ecos_rate", "한국 기준금리", "한국 기준금리", "%", 1, 2, "rate", "한국은행 ECOS 722Y001", "ecos:722Y001:0101000:M"),
    "krcpi": ("ecos_cpi_yoy", "한국 소비자물가 상승률", "한국 물가", "%", 1, 1, "rate", "통계청 · ECOS 901Y009", "ecos:901Y009:0:M:yoy"),
    "unrate": ("fred_unrate", "미국 실업률", "미국 실업률", "%", 1, 1, "rate", "연준 세인트루이스 FRED UNRATE", "fred:UNRATE:M"),
    "uscpi": ("fred_cpi_yoy", "미국 소비자물가 상승률", "미국 물가", "%", 1, 1, "rate", "연준 세인트루이스 FRED CPIAUCSL", "fred:CPIAUCSL:M:yoy"),
    "fedfunds": ("fred_fedfunds", "미국 연방기금금리", "미국 정책금리", "%", 1, 2, "rate", "연준 세인트루이스 FRED FEDFUNDS", "fred:FEDFUNDS:M"),
    "dgs10": ("fred_dgs10", "미국 국채 10년물 금리", "미국 10년물", "%", 1, 2, "rate", "연준 세인트루이스 FRED DGS10", "fred:DGS10:M:avg"),
    "dgs2": ("fred_dgs2", "미국 국채 2년물 금리", "미국 2년물", "%", 1, 2, "rate", "연준 세인트루이스 FRED DGS2", "fred:DGS2:M:avg"),
    "payems": ("fred_payems_chg", "미국 비농업 고용 증감", "미국 고용 증감", "천 명", 1, 0, "flow", "연준 세인트루이스 FRED PAYEMS", "fred:PAYEMS:M:diff"),
    "indpro": ("fred_indpro", "미국 산업생산지수", "미국 산업생산", "지수", 1, 1, "level", "연준 세인트루이스 FRED INDPRO", "fred:INDPRO:M"),
    "fx": ("fred_dexkous", "원/달러 환율", "원/달러 환율", "원", 1, 0, "level", "연준 세인트루이스 FRED DEXKOUS", "fred:DEXKOUS:M:avg"),
}
KEYS = list(IND)


def meta(k):
    f, name, short, unit, div, dec, kind, src, sid = IND[k]
    return dict(file=f, name=name, short=short, unit=unit, div=div, dec=dec, kind=kind, src=src, sid=sid)


_S, _D = {}, {}


def S(k):
    if k not in _S:
        m = meta(k)
        _S[k] = [[p, v / m["div"]] for p, v in SNAP[m["file"]]["data"]]
    return _S[k]


def D(k):
    if k not in _D:
        _D[k] = dict(S(k))
    return _D[k]


def last(k):
    return S(k)[-1][0]


def pm(p, n):
    y, m = int(p[:4]), int(p[5:7])
    t = y * 12 + m - 1 + n
    return f"{t // 12}.{t % 12 + 1:02d}"


def tail(k, n, end=None):
    """달력 기준 최근 n개월(자료가 빠진 달이 있으면 그 달은 건너뜀)"""
    s = S(k)
    if end:
        s = [x for x in s if x[0] <= end]
    lo = pm(s[-1][0], -(n - 1))
    return [x for x in s if x[0] >= lo]


def f(v, d=1):
    s = f"{abs(v):,.{d}f}"
    return ("−" + s) if v < 0 and float(s.replace(",", "")) != 0 else s


def sg(v, d=1):
    s = f"{abs(v):,.{d}f}"
    return ("−" if v < 0 and float(s.replace(",", "")) != 0 else "+") + s


def josa(w, a, b):
    c = w[-1]
    if "가" <= c <= "힣":
        return a if (ord(c) - 0xAC00) % 28 else b
    return a if c in "0136780" else b


def _bat(c):
    if "가" <= c <= "힣":
        t = (ord(c) - 0xAC00) % 28
        return 0 if t == 0 else 1 if t == 8 else 2
    return {"0": 2, "1": 1, "3": 2, "6": 2, "7": 1, "8": 1}.get(c, 0)


def ro(w):
    return w + ("으로" if _bat(w[-1]) == 2 else "로")


def gwa(w):
    return w + ("과" if _bat(w[-1]) else "와")


def i_ga(w):
    return w + josa(w, "이", "가")


def eun(w):
    return w + josa(w, "은", "는")


def eul(w):
    return w + josa(w, "을", "를")


def rnd(v, d=3):
    return round(v + 0.0, d)


def val(k, p):
    return D(k)[p]


def ytd(k, y, m):
    return sum(val(k, f"{y}.{i:02d}") for i in range(1, m + 1))


def lastm(k):
    return int(last(k)[5:7])


def lasty(k):
    return int(last(k)[:4])


def streak(s):
    """끝에서부터 같은 방향으로 이어진 달 수, 방향(+1/-1)"""
    d = [s[i][1] - s[i - 1][1] for i in range(1, len(s))]
    if not d or d[-1] == 0:
        return 0, 0
    sign = 1 if d[-1] > 0 else -1
    n = 0
    for x in reversed(d):
        if x * sign > 0:
            n += 1
        else:
            break
    return n, sign


class Fx:
    def __init__(self):
        self.d = {}

    def pt(self, k, p):
        m = meta(k)
        key = f"{k}_{p.replace('.', '_')}"
        self.d[key] = {"series": m["sid"], "period": p, "value": rnd(D(k)[p], 4), "unit": m["unit"], "source": m["src"]}
        return key

    def agg(self, k, tag, period, v):
        m = meta(k)
        key = f"{k}_{tag}"
        self.d[key] = {"series": m["sid"], "period": period, "value": rnd(v, 4), "unit": m["unit"], "source": m["src"] + " · 합산"}
        return key


def SRC(keys, asof):
    ss = []
    for k in keys:
        s = meta(k)["src"]
        if s not in ss:
            ss.append(s)
    return f"{' · '.join(ss)} · 데이터월 {asof} · {GOT} 받음"


ENDS = [("컸음", "컸던 값임"), ("작았음", "작았던 값임"), ("바뀌었음", "바뀐 것임"), ("달라졌음", "달라진 것임"), ("늘었음", "늘어난 것임"), ("넘었음", "넘어선 것임"), ("변했음", "변한 것임"),
        ("갈림", "갈리는 것임"), ("큼", "큰 값임"), ("작음", "작은 값임"), ("높음", "높은 수준임"), ("낮음", "낮은 수준임"), ("같음", "같은 수준임"), ("다름", "다른 것임"), ("컸음", "컸던 값임"),
        ("차지함", "차지함"), ("셈임", "셈임"), ("기록함", "기록함"), ("정리함", "정리함"), ("모아 비교함", "모아 비교함"), ("움직였음", "움직인 것임"), ("었음", "었던 것임"), ("였음", "였던 것임"), ("았음", "았던 것임"), ("겠음", "겠음")]


def fin(h):
    h = h.rstrip(". ")
    if h[-1] in "임함":
        return h
    for a, b in ENDS:
        if h.endswith(a):
            return h[: -len(a)] + b
    raise AssertionError("head 끝말: " + h)


def rd(head, points, keys, asof):
    head = fin(head)
    return {"head": head, "points": points, "source": SRC(keys, asof)}


def unit_of(k):
    return meta(k)["unit"]


def u_txt(k):
    u = unit_of(k)
    return "%" if u == "%" else ("" if u == "지수" else u)


def val_txt(k, v, signed=False):
    m = meta(k)
    s = sg(v, m["dec"]) if signed else f(v, m["dec"])
    return s + u_txt(k)


def diff_txt(k, d):
    m = meta(k)
    if m["kind"] == "rate":
        return sg(d, m["dec"]) + "%p"
    return sg(d, m["dec"]) + m["unit"]


def wan(v, signed=False):
    """천 명 값을 만 명으로 읽기 쉽게(90천 → 9만 명, 942천 → 94.2만 명)"""
    x = abs(v) / 10
    t = f"{x:,.1f}".rstrip("0").rstrip(".")
    return (("−" if v < 0 else "+") if signed else "") + t + "만 명"


def mlabel(p):
    return f"{int(p[5:7])}월"


ENTRIES = []


def ent(fam, pat, var, tags, slide, fx):
    ENTRIES.append({"pattern": pat, "family": fam, "variant": var, "title": strip(slide.get("title") or slide.get("text") or slide.get("word") or slide.get("name") or ""),
                    "tags": tags, "slide": slide, "facts": fx.d if fx else {}})


def strip(t):
    return t.replace("**", "").replace("^^", "")


def lo_hi(k, mx, mn):
    """음수 구간에서 쓰는 낱말(적자 · 감소)"""
    m = meta(k)
    neg = "적자" if m["unit"] == "억 달러" else "감소" if k == "payems" else None
    hi = "최고" if mx >= 0 or not neg else f"{neg} 최소"
    lo = "최저" if mn >= 0 or not neg else f"{neg} 최대"
    return hi, lo


COMP = ["goods", "serv", "pinc", "sinc"]
CN = {"goods": "상품수지", "serv": "서비스수지", "pinc": "본원소득", "sinc": "이전소득"}


# ───────────────────────── kpi ─────────────────────────
GROUP = {
    "bop": ["ca", "goods", "serv", "pinc", "sinc"],
    "kr": ["krrate", "krcpi"],
    "us": ["unrate", "uscpi", "fedfunds", "dgs10", "dgs2", "payems"],
    "mkt": ["fx", "indpro"],
}


def group_of(k):
    for g, ks in GROUP.items():
        if k in ks:
            return g


def card(k, mode, F):
    m = meta(k)
    s = S(k)
    lp = last(k)
    v = s[-1][1]
    mon = mlabel(lp)
    if mode == "ytd":
        y, mm = lasty(k), lastm(k)
        v = ytd(k, y, mm)
        pv = ytd(k, y - 1, mm)
        key = F.agg(k, f"ytd_{y}_{mm:02d}", f"{y}.01~{y}.{mm:02d}", v)
        spark, c = [], 0
        for i in range(1, mm + 1):
            c += val(k, f"{y}.{i:02d}")
            spark.append([f"{y}.{i:02d}", rnd(c, 2)])
        label = f"{m['short']} 1~{mm}월"
        ch = {"text": f"전년 동기 {diff_txt(k, v - pv)}", "dir": "up" if v >= pv else "down"}
    else:
        key = F.pt(k, lp)
        spark = [[p, rnd(x, 3)] for p, x in s[-12:]]
        if mode == "yoy" and pm(lp, -12) not in D(k):
            mode = "latest"  # 1년 전 달 자료가 비어 있으면 전월 대비로
        base = s[-2][1] if mode == "latest" else D(k)[pm(lp, -12)]
        pre = "전월" if mode == "latest" else "전년 동월"
        if m["kind"] == "level":
            pct = (v / base - 1) * 100
            ch = {"text": f"{pre}비 {sg(pct, 1)}%", "dir": "up" if pct >= 0 else "down"}
        else:
            ch = {"text": f"{pre} {diff_txt(k, v - base)}", "dir": "up" if v >= base else "down"}
        label = f"{m['short']} {mon}"
    c = {"label": label, "value": rnd(v, m["dec"] + 1 if m["kind"] != "level" else m["dec"]), "decimals": m["dec"], "unit": m["unit"],
         "change": ch, "asof": f"데이터월 {lp}", "source": m["src"], "fact": key, "spark": spark}
    if m["unit"] == "천 명":  # 카드는 만 명 단위로
        c.update({"value": rnd(v / 10, 2), "decimals": 1, "unit": "만 명", "spark": [[p, rnd(x / 10, 3)] for p, x in spark]})
        c["change"] = {"text": ch["text"].split(" ")[0] + " " + wan(v - base, True), "dir": ch["dir"]}
    return c, v


def kpi_title(cards_meta, topic, n, vals):
    k, mode = cards_meta[0]
    m = meta(k)
    k2, mode2 = cards_meta[1]
    m2 = meta(k2)
    if mode == "ytd":
        return f"1~{lastm(k)}월 누적 숫자 {n}개"
    if m["unit"] == m2["unit"] and mode == mode2 and m["unit"] in ("억 달러", "%"):
        g = vals[0] - vals[1]
        a, b = ALIAS(m["short"], m2["short"])
        if m["unit"] == "%":
            gap = f(abs(g), m["dec"]) + "%p"
            t = f"{eun(a)} {b}보다 {gap} {'높음' if g > 0 else '낮음'}" if g else f"{a}, {b}와 같음"
        else:
            t = f"{eun(a)} {b}보다 {f(abs(g), 1)}억 달러 {'큼' if g > 0 else '작음'}"
        if len(t) <= 25 and g:
            return t
    if mode != "ytd":
        sk, sign = streak(S(k)[-13:])
        if sk >= 2 and m["kind"] != "flow":
            return f"{m['short']} {sk}개월 연속 {'오름' if sign > 0 else '내림'}"
    return f"{topic} {n}개, 한눈에"


def gen_kpi(i):
    F = Fx()
    if i < 8:
        k, mode = [("ca", "latest"), ("goods", "latest"), ("ca", "ytd"), ("serv", "latest"), ("pinc", "latest"), ("unrate", "latest"), ("fx", "yoy"), ("krcpi", "latest")][i]
        cards = [(k, mode)]
        var = "카드 1장 + 오른쪽 요점" + (" + 아래 요약 줄" if i % 2 else "")
    elif i < 16:
        cards = [[("ca", "latest"), ("goods", "yoy")], [("serv", "latest"), ("pinc", "latest")], [("krrate", "latest"), ("fedfunds", "latest")], [("unrate", "latest"), ("uscpi", "yoy")],
                 [("dgs10", "latest"), ("dgs2", "latest")], [("krcpi", "latest"), ("uscpi", "latest")], [("ca", "ytd"), ("goods", "ytd")], [("payems", "latest"), ("unrate", "yoy")]][i - 8]
        var = "카드 2장" + (" + 아래 요약 줄" if i % 2 else "")
    elif i < 24:
        cards = [[("ca", "latest"), ("goods", "latest"), ("serv", "latest")], [("goods", "yoy"), ("pinc", "latest"), ("sinc", "latest")], [("krrate", "latest"), ("krcpi", "latest"), ("fx", "latest")],
                 [("fedfunds", "latest"), ("uscpi", "latest"), ("unrate", "latest")], [("dgs10", "yoy"), ("dgs2", "yoy"), ("fedfunds", "yoy")],
                 [("ca", "ytd"), ("goods", "ytd"), ("serv", "ytd")], [("payems", "latest"), ("unrate", "latest"), ("indpro", "latest")], [("krrate", "yoy"), ("fedfunds", "yoy"), ("fx", "yoy")]][i - 16]
        var = "카드 3장" + (" + 아래 요약 줄" if i % 2 == 0 else "")
    else:
        cards = [[("ca", "latest"), ("goods", "latest"), ("serv", "latest"), ("pinc", "latest")], [("krrate", "latest"), ("krcpi", "latest"), ("fedfunds", "latest"), ("uscpi", "latest")],
                 [("unrate", "latest"), ("uscpi", "latest"), ("fedfunds", "latest"), ("payems", "latest")], [("fx", "latest"), ("dgs10", "latest"), ("dgs2", "latest"), ("indpro", "latest")],
                 [("ca", "ytd"), ("goods", "ytd"), ("serv", "ytd"), ("pinc", "ytd")], [("krrate", "yoy"), ("fedfunds", "yoy"), ("dgs10", "yoy"), ("fx", "yoy")]][i - 24]
        var = "카드 4장" + (" + 아래 요약 줄" if i % 2 else "")
    if i < 8:
        cards = cards
    n = len(cards)
    cs, vals = [], []
    for k, mode in cards:
        c, v = card(k, mode, F)
        cs.append(c)
        vals.append(v)
    keys = [k for k, _ in cards]
    asof = max(last(k) for k in keys)
    slide = {"kind": "kpi", "part": 1, "cards": cs}
    k0, mode0 = cards[0]
    m0 = meta(k0)
    if n == 1:
        s = S(k0)
        w = s[-12:] if mode0 != "ytd" else None
        if mode0 == "ytd":
            y, mm = lasty(k0), lastm(k0)
            w = [[f"{y}.{j:02d}", val(k0, f"{y}.{j:02d}")] for j in range(1, mm + 1)]
        pmx, pmn = max(w, key=lambda x: x[1]), min(w, key=lambda x: x[1])
        hd = f"{len(w)}개월 중" if mode0 != "ytd" else f"{lasty(k0)}년 월별"
        slide["aside"] = {"head": hd, "points": [f"최고 {pmx[0]} {f(pmx[1], m0['dec'])}", f"최저 {pmn[0]} {f(pmn[1], m0['dec'])}"]}
        F.pt(k0, pmx[0]) if mode0 != "ytd" else None
        if m0["kind"] == "flow" and m0["unit"] == "억 달러":
            sign = "흑자" if vals[0] > 0 else "적자"
            per = f"1~{lastm(k0)}월" if mode0 == "ytd" else mlabel(last(k0))
            slide["title"] = f"{m0['short']} {per} {sign} {f(abs(vals[0]), 1)}억 달러"
        else:
            slide["title"] = f"{m0['short']} {mlabel(last(k0))} {val_txt(k0, vals[0])}"
        head = f"{eun(m0['short'])} {last(k0)}에 {eul(val_txt(k0, vals[0]))} 기록함"
        pts = [f"비교 기준: {cs[0]['change']['text']}", f"{hd} 최고는 {pmx[0]}, 최저는 {pmn[0]}"]
        if i % 2:
            others = [x for x in GROUP[group_of(k0)] if x != k0][:2]
            slide["foot"] = [[meta(o)["short"], val_txt(o, val(o, last(o)))] for o in others]
            for o in others:
                F.pt(o, last(o))
            keys += others
    else:
        topic = {"bop": "대외 숫자", "kr": "한국 금리·물가", "us": "미국 금리·고용", "mkt": "시장 숫자"}.get(group_of(k0), "경제 숫자")
        if len({group_of(k) for k, _ in cards}) > 1:
            topic = "경제 숫자"
        slide["title"] = kpi_title(cards, topic, n, vals)
        head = f"{'·'.join(meta(k)['short'] for k, _ in cards)}의 최근 값을 한 장에 모아 비교함"
        pts = [f"{meta(k)['short']} {val_txt(k, v)}" for (k, _), v in zip(cards, vals)][:3]
        if i % 2 == (0 if 16 <= i < 24 else 1):
            others = [x for x in GROUP[group_of(k0)] if x not in keys][:2]
            if others:
                slide["foot"] = [[meta(o)["short"], val_txt(o, val(o, last(o)))] for o in others]
                for o in others:
                    F.pt(o, last(o))
                keys += others
    slide["source"] = SRC(keys, asof)
    slide["read"] = rd(head, pts, keys, asof)
    ent("kpi", f"kpi-{n}", var, [meta(k0)["name"], "월"], slide, F)


# ───────────────────────── table ─────────────────────────
def gen_table(i):
    F = Fx()
    t, v = i // 4, i % 4
    chips = {}
    hi = None
    if t == 0:  # 국제수지 항목 × 최근 4개월
        lp = pm(last("ca"), -v)
        ps = [pm(lp, -3 + j) for j in range(4)]
        rows = []
        for r, k in enumerate(["ca", "goods", "serv", "pinc", "sinc"]):
            rows.append([meta(k)["name"]] + [f(val(k, p)) for p in ps])
            a, b = val(k, lp), val(k, pm(lp, -12))
            if a > 0 and b > 0:
                chips[f"{r},4"] = f"{sg((a / b - 1) * 100, 0)}%"
        big = max(COMP, key=lambda k: abs(val(k, lp)))
        for k in ["ca"] + COMP:
            F.pt(k, lp)
        cols = ["항목(억 달러)"] + ps
        title = f"{lp} 가장 큰 항목은 {CN[big]}"
        keys, asof = ["ca"] + COMP, lp
        head = f"{lp} 경상수지는 {f(val('ca', lp))}억 달러, 항목 중 {CN[big]}의 절댓값이 가장 큼"
        pts = ["가장 최근 열에 옅은 띠", "칩은 전년 같은 달 대비 증감률"]
        var = "국제수지 항목 × 4개월 · 띠 + 칩"
        tags = ["경상수지", "월"]
        hic = 4
    elif t == 1:  # 연도별 누적
        mm = [lastm("ca"), 6, 3, 12][v]
        ys = list(range(2022, 2027)) if v != 3 else list(range(2021, 2026))
        if v == 3:
            mm = 12
        rows = []
        for r, k in enumerate(["ca", "goods", "serv", "pinc", "sinc"]):
            rows.append([meta(k)["name"]] + [f(ytd(k, y, mm)) for y in ys])
            a, b = ytd(k, ys[-1], mm), ytd(k, ys[-2], mm)
            if a > 0 and b > 0:
                chips[f"{r},{len(ys)}"] = f"{sg((a / b - 1) * 100, 0)}%"
        tot = {y: ytd("ca", y, mm) for y in ys}
        rank = sorted(tot, key=lambda y: -tot[y]).index(ys[-1]) + 1
        per = f"1~{mm}월" if mm != 12 else "연간"
        title = f"{per} 경상수지 {ys[-1]}년 {rank}위" if rank > 1 else f"{per} 경상수지 {ys[-1]}년이 가장 큼"
        cols = ["항목(억 달러)"] + [str(y) for y in ys]
        for k in ["ca"]:
            F.agg(k, f"ytd_{ys[-1]}_{mm:02d}", f"{ys[-1]}.01~{ys[-1]}.{mm:02d}", tot[ys[-1]])
        keys, asof = ["ca"] + COMP, last("ca")
        head = f"{per} 경상수지 누적은 {ys[-1]}년 {f(tot[ys[-1]])}억 달러로 {len(ys)}개 해 중 {rank}위임"
        pts = [f"{ys[0]}~{ys[-1]}년 {per} 합산 비교", "마지막 열 = 가장 최근 해"]
        var = f"해별 {per} 누적 · 띠 + 칩"
        tags = ["경상수지", "연"]
        hic = len(ys)
    elif t == 2:
        sets = [["krrate", "fedfunds", "krcpi", "uscpi"], ["unrate", "uscpi", "fedfunds", "dgs10", "dgs2"], ["dgs10", "dgs2", "fedfunds", "krrate"], ["krcpi", "uscpi", "unrate"]][v]
        lp = min(last(k) for k in sets)
        ps = [pm(lp, -3 + j) for j in range(4)]
        rows = [[meta(k)["name"] + " (%)"] + [f(val(k, p), meta(k)["dec"]) for p in ps] for k in sets]
        for k in sets:
            F.pt(k, lp)
        if v == 0:
            g = val("krrate", lp) - val("fedfunds", lp)
            title = f"한미 기준금리 격차 {f(abs(g), 2)}%p"
            head = f"{lp} 기준으로 한국 기준금리는 미국 연방기금금리보다 {f(abs(g), 2)}%p {'높음' if g > 0 else '낮음'}"
        elif v == 1:
            g = val("dgs10", lp) - val("dgs2", lp)
            title = f"미국 장단기 금리차 {sg(g, 2)}%p"
            head = f"{lp} 미국 10년물 금리는 2년물보다 {f(abs(g), 2)}%p {'높음' if g > 0 else '낮음'}"
        elif v == 2:
            g = val("dgs10", lp) - val("fedfunds", lp)
            title = f"10년물이 정책금리보다 {f(abs(g), 2)}%p {'높음' if g > 0 else '낮음'}"
            head = f"{lp} 미국 10년물은 정책금리보다 {f(abs(g), 2)}%p {'높은' if g > 0 else '낮은'} 수준임"
        else:
            g = val("krcpi", lp) - val("uscpi", lp)
            title = f"한국 물가가 미국보다 {f(abs(g), 1)}%p {'높음' if g > 0 else '낮음'}"
            head = f"{lp} 소비자물가 상승률은 한국이 미국보다 {f(abs(g), 1)}%p {'높음' if g > 0 else '낮음'}"
        cols = ["지표"] + ps
        keys, asof = sets, lp
        pts = ["모든 열은 월 단위", "가장 최근 열에 옅은 띠"]
        var = ["한미 금리·물가", "미국 금리·고용", "금리 비교", "한미 물가"][v] + " × 4개월 · 띠"
        tags = [meta(sets[0])["name"], "월"]
        hic = 4
    elif t == 3:  # GDP 분기
        s = S("ecos_gdp_qoq") if False else [[p, x] for p, x in SNAP["ecos_gdp_qoq"]["data"]]
        e = len(s) - v
        w = s[e - 5:e]
        rows = []
        for r, (p, x) in enumerate(w):
            ann = ((1 + x / 100) ** 4 - 1) * 100
            rows.append([p, f(x, 1), f(ann, 1)])
        chips[f"4,2"] = f"{sg(w[-1][1] - w[-2][1], 1)}%p"
        title = f"{w[-1][0]} 성장률이 직전 분기보다 {'높음' if w[-1][1] > w[-2][1] else '낮음'}" if w[-1][1] != w[-2][1] else f"{w[-1][0]} 성장률은 직전 분기와 같음"
        cols = ["분기", "전기비(%)", "연율(%)"]
        fx_key = f"gdp_{w[-1][0].replace('.', '_')}"
        F.d[fx_key] = {"series": "ecos:200Y102:10111:Q", "period": w[-1][0], "value": w[-1][1], "unit": "%", "source": "한국은행 ECOS 200Y102"}
        keys, asof = None, w[-1][0]
        head = f"한국 실질 GDP는 {w[-1][0]}에 직전 분기보다 {f(w[-1][1], 1)}% 변했고 연율로는 약 {f(((1 + w[-1][1] / 100) ** 4 - 1) * 100, 1)}%임"
        pts = ["연율 = 한 분기 변화가 1년 이어질 때의 값", "칩은 직전 분기와의 차이(%p)"]
        var = f"분기 {w[0][0]}~{w[-1][0]} · 칩"
        tags = ["GDP", "분기"]
        hic = 1
        hi = [4]
    elif t == 4:  # 상위 5개월
        k = ["ca", "goods", "pinc", "payems"][v]
        s = sorted(S(k), key=lambda x: -x[1])[:5]
        m = meta(k)
        rows = [[f"{j + 1}위", p, f(x, m["dec"])] for j, (p, x) in enumerate(s)]
        title = f"{m['short']} 가장 큰 달은 {s[0][0]}"
        cols = ["순위", "월", m["unit"]]
        F.pt(k, s[0][0])
        keys, asof = [k], last(k)
        head = f"{i_ga(m['short'])} 가장 컸던 달은 {s[0][0]}({val_txt(k, s[0][1])})이고 2021년 이후 상위 5개 달을 정리함"
        pts = ["2021.01부터 최근까지 비교", "1위 행을 강조"]
        var = f"{m['short']} 상위 5개월"
        tags = [m["name"], "월"]
        hic = None
        hi = [0]
    else:  # 1년 전 대비
        sets = [["ca", "goods", "serv", "pinc", "sinc"], ["krrate", "fedfunds", "krcpi", "uscpi", "unrate"], ["ca", "krrate", "uscpi", "unrate"], ["goods", "pinc", "fedfunds", "dgs10"]][v]
        lp = min(last(k) for k in sets)
        rows = []
        for r, k in enumerate(sets):
            m = meta(k)
            a, b = val(k, pm(lp, -12)), val(k, lp)
            rows.append([m["short"], f(a, m["dec"]), f(b, m["dec"]), f(b - a, m["dec"]) if False else sg(b - a, m["dec"])])
            F.pt(k, lp)
            if m["kind"] == "rate":
                chips[f"{r},3"] = f"{sg(b - a, m['dec'])}%p"
            elif a > 0 and b > 0:
                chips[f"{r},3"] = f"{sg((b / a - 1) * 100, 0)}%"
        title = f"{lp} 1년 전과 견준 변화"
        cols = ["지표", pm(lp, -12), lp, "차이"]
        keys, asof = sets, lp
        head = f"{lp} 값을 1년 전 같은 달과 견주면 {meta(sets[0])['short']} 등 {len(sets)}개 지표의 방향이 갈림"
        pts = ["단위는 지표마다 다름(억 달러 · %)", "칩: 비율 지표는 %p, 금액 지표는 %"]
        var = "1년 전 대비 · 띠 + 칩"
        tags = [meta(sets[0])["name"], "월"]
        hic = 3
    slide = {"kind": "table", "part": 2, "title": title, "cols": cols, "rows": rows}
    if t == 0:
        slide["rowHi"] = 0
        slide["delta"] = True
        slide["marks"] = {f"{r},{c}": ("o" if float(rows[r][c].replace(",", "").replace("−", "-")) > 0 else "x") for r in range(len(rows)) for c in range(1, len(rows[0]))}
        if v % 2:
            slide["head"] = "col"
    elif t == 1:
        slide["rowHi"] = 0
        if v % 2 == 0:
            slide["head"] = "row"
    elif t in (3, 5):
        slide["delta"] = True
        if t == 5:
            slide["rowHi"] = 0
    if hic is not None:
        slide["hiCol"] = hic
    if chips:
        slide["chips"] = chips
    if hi:
        slide["hi"] = hi
    if keys:
        slide["source"] = SRC(keys, asof)
        slide["read"] = rd(head, pts, keys, asof)
    else:
        src = f"한국은행 ECOS 200Y102 · 데이터월 {asof} · {GOT} 받음"
        slide["source"] = src
        slide["read"] = {"head": head, "points": pts, "source": src}
    ent("table", "table-" + ("chips" if chips else "plain") + ("-hi" if hi else ""), var, tags, slide, F)


# ───────────────────────── bar ─────────────────────────
def gen_bar(i):
    F = Fx()
    k = KEYS[i % len(KEYS)]
    m = meta(k)
    j = i // 15
    n = [12, 18, 24][(i // 5 + j) % 3]
    s = tail(k, n)
    nn = (i + 2 * j) % 4
    mx, mn = max(s, key=lambda x: x[1]), min(s, key=lambda x: x[1])
    lp = s[-1]
    ttype = (i + j) % 3
    hi_w, lo_w = lo_hi(k, mx[1], mn[1])
    if ttype == 0:
        title = f"{m['short']} {hi_w}는 **{mx[0]}**"
        cb = {mx[0]: "acc"}
    elif ttype == 1:
        d = lp[1] - s[0][1]
        if m["kind"] == "level":
            tx = f"{sg((lp[1] / s[0][1] - 1) * 100, 1)}%"
        else:
            tx = diff_txt(k, d)
        title = f"{m['short']} {n}개월 새 **{tx}**"
        cb = {lp[0]: "acc"}
    else:
        title = f"{m['short']} {lo_w}는 ^^{mn[0]}^^"
        cb = {mn[0]: "hot"}
    cand = [(hi_w, mx[0]), (lo_w, mn[0]), ("최근", lp[0])]
    seen, notes = set(), []
    for t, p in cand:
        if p in seen:
            continue
        seen.add(p)
        notes.append({"at": p, "text": t})
    notes = notes[:nn]
    if len(notes) < nn:  # 겹쳐서 모자라면 시작점
        notes.append({"at": s[0][0], "text": "시작"})
    F.pt(k, mx[0])
    F.pt(k, lp[0])
    asof = lp[0]
    slide = {"kind": "chart", "part": 3, "title": title, "source": SRC([k], asof),
             "chart": {"type": "bar", "unit": m["unit"], "series": [{"name": m["name"], "data": [[p, rnd(x, 3)] for p, x in s], "fact": F.pt(k, lp[0])}], "colorBy": cb}}
    if notes:
        slide["chart"]["notes"] = notes
    if nn == 0:
        slide["aside"] = {"head": f"{n}개월 중", "points": [f"{hi_w} {mx[0]}", f"{lo_w} {mn[0]}"]}
    d = lp[1] - s[0][1]
    head = f"{m['short']}의 최근 {n}개월 최고는 {mx[0]}의 {val_txt(k, mx[1])}, 최저는 {mn[0]}의 {val_txt(k, mn[1])}임"
    slide["read"] = rd(head, [f"기간 {s[0][0]} ~ {lp[0]}", f"끝 달은 시작 달보다 {diff_txt(k, d) if m['kind'] != 'level' else sg((lp[1] / s[0][1] - 1) * 100, 1) + '%'}"], [k], asof)
    ent("bar", f"bar-notes{len(notes)}", f"{m['short']} {n}개월 · 주석 {len(notes)}개", [m["name"], "월"], slide, F)


# ───────────────────────── race ─────────────────────────
def race_ok(k, Y, gap):
    mm = lastm(k) if Y == lasty(k) else 12
    prev = [val(k, f"{Y - gap}.{j:02d}") for j in range(1, 13)]
    cur = [val(k, f"{Y}.{j:02d}") for j in range(1, mm + 1)]
    cp = [sum(prev[:j]) for j in range(1, 13)]
    cc = [sum(cur[:j]) for j in range(1, mm + 1)]
    return sum(prev) > 0 and min(cp) >= 0 and min(cc) >= 0


def race_cases():
    """누적선이 0 아래로 내려가지 않는 경우만(엔진 축이 0부터)"""
    out = []
    for gap in (1, 2):
        for Y in range(lasty("ca"), 2021, -1):
            for k in ["ca", "goods", "pinc", "payems"]:
                if Y <= lasty(k) and Y - gap >= 2021 and race_ok(k, Y, gap):
                    out.append((k, Y, gap))
    return out


def gen_race(i):
    F = Fx()
    k, Y, gap = race_cases()[i]
    m = meta(k)
    py = Y - gap
    pl = "전년" if gap == 1 else f"{py}년"
    mm = lastm(k) if Y == lasty(k) else 12
    prev = [val(k, f"{py}.{j:02d}") for j in range(1, 13)]
    cur = [val(k, f"{Y}.{j:02d}") for j in range(1, mm + 1)]
    ref = sum(prev)
    cum, cross = 0, None
    for j, x in enumerate(cur, 1):
        cum += x
        if cross is None and cum >= ref:
            cross = j
    ratio = cum / ref
    sh = m["short"]
    if cross:
        title = f"{sh}, {cross}월에 {pl} 연간 넘음"
        mark = {"at": f"{cross}월", "text": f"{pl} 연간 넘음"}
        head = f"{Y}년 {sh} 누적은 {cross}월에 {py}년 연간 합({val_txt(k, ref)})을 넘어선 것임"
    else:
        title = f"{sh}, {pl} 연간의 {f(ratio * 100, 0)}%"
        mark = None
        head = f"{Y}년 {mm}월까지 {sh} 누적은 {ro(val_txt(k, cum))} {py}년 연간 합의 {f(ratio * 100, 1)}%임"
    ch = {"type": "race", "unit": m["unit"], "decimals": m["dec"],
          "series": [{"name": str(py), "data": [[f"{py}.{j:02d}", rnd(x, 3)] for j, x in enumerate(prev, 1)]}, {"name": str(Y), "data": [[f"{Y}.{j:02d}", rnd(x, 3)] for j, x in enumerate(cur, 1)]}],
          "ref": {"name": f"{py}년 연간", "value": rnd(ref, 3)}}
    if mark:
        ch["mark"] = mark
    F.agg(k, f"cum_{Y}_{mm:02d}", f"{Y}.01~{Y}.{mm:02d}", cum)
    F.agg(k, f"year_{py}", f"{py}.01~{py}.12", ref)
    asof = f"{Y}.{mm:02d}"
    slide = {"kind": "chart", "part": 4, "title": title, "source": SRC([k], asof), "chart": ch,
             "read": rd(head, [f"{py}년 연간 합 {val_txt(k, ref)}", f"{Y}년 {mm}월 누적 {val_txt(k, cum)}"], [k], asof)}
    ent("race", "chart-race", f"{sh} {Y}년 vs {py}년 누적" + (" · 기준선 넘음" if cross else " · 못 넘음"), [m["name"], "월", "누적"], slide, F)


# ───────────────────────── zoom ─────────────────────────
def gen_zoom(i):
    F = Fx()
    k = KEYS[i % len(KEYS)]
    m = meta(k)
    n = [6, 12, 18][(i // 6) % 3]
    L = [36, 48, 69][(i // 3) % 3]
    s = tail(k, L)
    w = s[-n:]
    mx = max(w, key=lambda x: x[1])
    d = w[-1][1] - w[0][1]
    if i % 2 == 0:
        title = f"{m['short']} {n}개월 {lo_hi(k, mx[1], 0)[0]} **{mx[0]}**"
    else:
        tx = diff_txt(k, d) if m["kind"] != "level" else sg((w[-1][1] / w[0][1] - 1) * 100, 1) + "%"
        title = f"{m['short']}, {n}개월 새 **{tx}**"
    F.pt(k, mx[0])
    F.pt(k, w[-1][0])
    asof = w[-1][0]
    slide = {"kind": "chart", "part": 5, "title": title, "source": SRC([k], asof),
             "chart": {"type": "zoom", "unit": m["unit"], "decimals": m["dec"], "series": [{"name": m["name"], "data": [[p, rnd(x, 3)] for p, x in s]}], "zoom": {"from": w[0][0], "to": w[-1][0]}},
             "read": rd(f"{eul(m['short'])} {w[0][0]}~{ro(w[-1][0])} 확대하면 최고는 {mx[0]}({val_txt(k, mx[1])})이고 끝 달은 시작 달보다 {diff_txt(k, d) if m['kind'] != 'level' else sg((w[-1][1] / w[0][1] - 1) * 100, 1) + '%'}임",
                        [f"전체 {len(s)}개월 중 {n}개월만 확대", "세로 축은 0부터 고정"], [k], asof)}
    ent("zoom", "chart-zoom", f"{m['short']} 전체 {L}개월 → 최근 {n}개월 확대", [m["name"], "월"], slide, F)


# ───────────────────────── wipe ─────────────────────────
def ALIAS(a, b):
    """제목을 줄이려 같은 말머리를 뺌"""
    if a.startswith("한국") and b.startswith("미국"):
        return a, "미국"
    if a.startswith("미국") and b.startswith("미국"):
        return a, b[3:]
    return a, b


def gen_wipe(i):
    F = Fx()
    if i < 10:
        k = ["ca", "goods", "serv", "pinc", "sinc", "payems", "unrate", "uscpi", "fx", "krcpi"][i]
        m = meta(k)
        Y = lasty(k)
        mm = lastm(k)
        js = [j for j in range(1, mm + 1) if f"{Y - 1}.{j:02d}" in D(k) and f"{Y}.{j:02d}" in D(k)]
        a = [val(k, f"{Y - 1}.{j:02d}") for j in js]
        b = [val(k, f"{Y}.{j:02d}") for j in js]
        labels = [f"{j}월" for j in js]
        c = sum(1 for x, y in zip(a, b) if y > x)
        title = f"{m['short']}, {c}개월이 지난해보다 큼"
        na, nb = str(Y - 1), str(Y)
        keys, asof = [k], last(k)
        head = f"{Y}년 {eun(m['short'])} 1~{mm}월 {len(js)}개월 중 {c}개월이 {Y - 1}년 같은 달보다 큰 달임"
        pts = [f"{len(js)}개월 중 {c}개월이 지난해보다 큼", f"{Y - 1}년 합 {val_txt(k, sum(a))}, {Y}년 합 {val_txt(k, sum(b))}"]
        for j in (js[0], js[-1]):
            F.pt(k, f"{Y}.{j:02d}")
        var = f"{m['short']} {Y - 1}년 → {Y}년 월별"
        tags = [m["name"], "월"]
        unit = m["unit"]
        dec_w = m["dec"]
    else:
        A, B = [("krrate", "fedfunds"), ("dgs10", "dgs2"), ("ca", "goods"), ("krcpi", "uscpi"), ("unrate", "krcpi")][i - 10]
        ma, mb = meta(A), meta(B)
        lp = min(last(A), last(B))
        ps = [p for p in (pm(lp, -11 + j) for j in range(12)) if p in D(A) and p in D(B)]
        a = [val(A, p) for p in ps]
        b = [val(B, p) for p in ps]
        labels = ps
        c = sum(1 for x, y in zip(a, b) if x > y)
        title = f"{eun(ALIAS(ma['short'], mb['short'])[0])} {ALIAS(ma['short'], mb['short'])[1]}보다 큰 달 {c}개월"
        na, nb = ma["short"], mb["short"]
        keys, asof = [A, B], lp
        head = f"{ps[0]}~{ps[-1]} {len(ps)}개월 중 {i_ga(ma['short'])} {mb['short']}보다 큰 달은 {c}개월임"
        pts = [f"비교 기간 {ps[0]} ~ {ps[-1]}", f"끝 달 {ma['short']} {val_txt(A, a[-1])}, {mb['short']} {val_txt(B, b[-1])}"]
        F.pt(A, lp)
        F.pt(B, lp)
        var = f"{ma['short']} vs {mb['short']} 12개월"
        tags = [ma["name"], mb["name"], "월"]
        unit = ma["unit"]
        dec_w = max(ma["dec"], mb["dec"])
    slide = {"kind": "chart", "part": 6, "title": title, "source": SRC(keys, asof),
             "chart": {"type": "wipe", "unit": unit, "decimals": dec_w, "labels": labels, "a": {"name": na, "data": [rnd(x, 3) for x in a]}, "b": {"name": nb, "data": [rnd(x, 3) for x in b]}},
             "read": rd(head, pts, keys, asof)}
    ent("wipe", "chart-wipe", var, tags, slide, F)


# ───────────────────────── slope ─────────────────────────
def gen_slope(i):
    F = Fx()
    if i < 5:  # 월별: 가장 크게 늘어난 달들
        k = ["ca", "goods", "pinc", "payems", "sinc"][i]
        m = meta(k)
        Y, mm = lasty(k), lastm(k)
        pairs = [(j, val(k, f"{Y - 1}.{j:02d}"), val(k, f"{Y}.{j:02d}")) for j in range(1, mm + 1) if f"{Y - 1}.{j:02d}" in D(k)]
        top = sorted(sorted(pairs, key=lambda x: -(x[2] - x[1]))[:5])
        big = max(pairs, key=lambda x: x[2] - x[1])
        title = f"{m['short']}, {big[0]}월이 가장 크게 바뀜"
        ps = [{"label": f"{j}월", "a": rnd(a, 1), "b": rnd(b, 1)} for j, a, b in top]
        heads = [str(Y - 1), str(Y)]
        keys, asof = [k], last(k)
        F.pt(k, f"{Y}.{big[0]:02d}")
        F.pt(k, f"{Y - 1}.{big[0]:02d}")
        head = f"{eun(m['short'])} {big[0]}월에 {Y - 1}년 {val_txt(k, big[1])}에서 {Y}년 {ro(val_txt(k, big[2]))} 가장 크게 바뀌었음"
        pts = ["변화 폭이 큰 달 5개만 골라 이음", f"{big[0]}월 차이 {diff_txt(k, big[2] - big[1])}"]
        var = f"{m['short']} 변화 큰 달 5개"
        unit = m["unit"]
        tags = [m["name"], "월"]
    elif i < 9:  # 분기 합
        k = ["ca", "goods", "serv", "pinc"][i - 5]
        m = meta(k)
        Y = lasty(k)
        nq = lastm(k) // 3
        ps, ups = [], 0
        for q in range(1, nq + 1):
            a = sum(val(k, f"{Y - 1}.{j:02d}") for j in range(3 * q - 2, 3 * q + 1))
            b = sum(val(k, f"{Y}.{j:02d}") for j in range(3 * q - 2, 3 * q + 1))
            ps.append({"label": f"{q}분기", "a": rnd(a, 1), "b": rnd(b, 1)})
            ups += b > a
        title = f"{m['short']}, {ups}개 분기가 지난해보다 큼"
        heads = [str(Y - 1), str(Y)]
        keys, asof = [k], last(k)
        F.agg(k, f"q{nq}_{Y}", f"{Y}.Q{nq}", ps[-1]["b"])
        head = f"{Y}년 {m['short']} 분기 합은 {nq}개 분기 중 {ups}개가 {Y - 1}년 같은 분기보다 컸음"
        pts = ["분기 합 = 석 달 값의 합", f"{nq}분기 {Y - 1}년 {f(ps[-1]['a'])} → {Y}년 {f(ps[-1]['b'])} {m['unit']}"]
        var = f"{m['short']} 분기 합 {Y - 1} → {Y}"
        unit = m["unit"]
        tags = [m["name"], "분기"]
    elif i < 12:  # 비율 지표 월별(같은 달)
        k = ["unrate", "uscpi", "krcpi"][i - 9]
        m = meta(k)
        Y, mm = lasty(k), lastm(k)
        picks = [j for j in sorted({max(1, mm - 8), max(1, mm - 5), max(1, mm - 3), mm}) if f"{Y - 1}.{j:02d}" in D(k)]
        ps = [{"label": f"{j}월", "a": rnd(val(k, f"{Y - 1}.{j:02d}"), 2), "b": rnd(val(k, f"{Y}.{j:02d}"), 2)} for j in picks]
        up = sum(1 for p in ps if p["b"] > p["a"])
        title = f"{m['short']}, {up}개 달이 지난해보다 높음"
        heads = [str(Y - 1), str(Y)]
        keys, asof = [k], last(k)
        F.pt(k, last(k))
        head = f"{eun(m['short'])} 비교한 {len(ps)}개 달 중 {up}개에서 {Y - 1}년 같은 달보다 높았음"
        pts = [f"비교한 달: {', '.join(p['label'] for p in ps)}", f"끝 달 {val_txt(k, ps[-1]['b'])}"]
        var = f"{m['short']} 같은 달 {len(ps)}개"
        unit = m["unit"]
        tags = [m["name"], "월"]
    else:  # 항목별 누적 (구성)
        Y, mm = lasty("ca"), lastm("ca")
        n = i - 12
        yb, ya = Y - [1, 2, 3][n], Y - [1, 2, 3][n] - 1
        ps = [{"label": CN[c], "a": rnd(ytd(c, ya, mm), 1), "b": rnd(ytd(c, yb, mm), 1)} for c in COMP]
        big = max(ps, key=lambda p: p["b"] - p["a"])
        title = f"{ya}→{yb} 가장 {'늘어난' if big['b'] > big['a'] else '덜 줄어든'} 건 {big['label'].replace('수지', '')}"
        heads = [str(ya), str(yb)]
        keys, asof = ["ca"] + COMP, last("ca")
        F.agg("ca", f"ytd_{yb}_{mm:02d}", f"{yb}.01~{yb}.{mm:02d}", sum(p["b"] for p in ps))
        head = f"1~{mm}월 누적을 {ya}년과 {yb}년으로 견주면 {i_ga(big['label'])} {f(big['a'])}에서 {f(big['b'])}억 달러로 가장 크게 늘었음"
        pts = ["네 가지 항목의 1~" + f"{mm}월 누적", f"{big['label']} 변화 {sg(big['b'] - big['a'])}억 달러"]
        var = f"항목별 1~{mm}월 누적 {ya} → {yb}"
        unit = "억 달러"
        tags = ["경상수지", "연"]
    slide = {"kind": "chart", "part": 7, "title": title, "source": SRC(keys, asof),
             "chart": {"type": "slope", "unit": unit, "decimals": 1 if unit in ("억 달러", "천 명") else 2 if unit == "%" else 1, "pairs": ps, "heads": heads}, "read": rd(head, pts, keys, asof)}
    ent("slope", "chart-slope", var, tags, slide, F)


# ───────────────────────── rank ─────────────────────────
def gen_rank(i):
    F = Fx()
    order = ["ca", "goods", "serv", "pinc", "sinc", "payems", "krcpi", "uscpi", "unrate", "fedfunds", "dgs10", "fx", "indpro", "krrate", "dgs2"]
    k = order[i]
    m = meta(k)
    if i % 2 == 0:
        Y, mm = lasty(k), lastm(k)
        s = [[f"{j}월", val(k, f"{Y}.{j:02d}")] for j in range(1, mm + 1)]
        scope = f"{Y}년 1~{mm}월"
    else:
        w = tail(k, 12)
        s = [[p, x] for p, x in w]
        scope = f"최근 12개월"
    top = max(s, key=lambda x: x[1])
    if top[1] >= 0:
        title = f"{m['short']} 가장 큰 달은 **{top[0]}**"
        what = "가장 큰 값"
    else:
        title = f"{m['short']} {'적자' if m['unit'] == '억 달러' else '감소'} 가장 작은 달 **{top[0]}**"
        what = ("적자" if m["unit"] == "억 달러" else "감소") + "가 가장 작은 값"
    srt = sorted(s, key=lambda x: -x[1])
    ptop = f"{last(k)[:4]}.{int(top[0][:-1]):02d}" if top[0].endswith("월") else top[0]
    F.pt(k, ptop)
    asof = last(k)
    head = f"{scope} 가운데 {eun(m['short'])} {top[0]}에 {ro(val_txt(k, top[1]))} {what}임"
    slide = {"kind": "chart", "part": 8, "title": title, "source": SRC([k], asof),
             "chart": {"type": "rank", "unit": m["unit"], "decimals": m["dec"], "data": [[p, rnd(x, 3)] for p, x in s]},
             "read": rd(head, [f"2위 {srt[1][0]} {val_txt(k, srt[1][1])}", f"3위 {srt[2][0]} {val_txt(k, srt[2][1])}"], [k], asof)}
    if i % 3 == 0:
        slide["aside"] = {"head": "순위", "points": [f"1위 {srt[0][0]}", f"2위 {srt[1][0]}"]}
    ent("rank", "chart-rank", f"{m['short']} {scope} 순위", [m["name"], "월"], slide, F)


# ───────────────────────── morph ─────────────────────────
def morph_cases():
    """모든 달이 양수인 경우만(엔진 축이 0부터)"""
    out = []
    for g in (3, 6, 4):
        for Y in range(lasty("ca"), 2020, -1):
            for k in ["ca", "goods", "pinc"]:
                full = Y < lasty(k)
                if g != 3 and not full:
                    continue
                mm = (lastm(k) if not full else 12) // g * g
                if mm and all(val(k, f"{Y}.{j:02d}") > 0 for j in range(1, mm + 1)):
                    out.append((k, Y, g))
    return out


def gen_morph(i):
    F = Fx()
    k, Y, g = morph_cases()[i]
    m = meta(k)
    mm = (lastm(k) if Y == lasty(k) else 12) // g * g
    vs = [val(k, f"{Y}.{j:02d}") for j in range(1, mm + 1)]
    qs = [sum(vs[g * q:g * q + g]) for q in range(mm // g)]
    qb = max(range(len(qs)), key=lambda q: qs[q])
    lab = {3: f"{qb + 1}분기", 6: "상반기" if qb == 0 else "하반기", 4: f"{qb * 4 + 1}~{qb * 4 + 4}월"}[g]
    nm = {3: "분기별 합", 6: "반기별 합", 4: "4개월별 합"}[g]
    title = f"{Y}년 {m['short']}, **{lab}**이 가장 큼" if g != 3 else f"{Y}년 {m['short']}, **{lab}**가 가장 큼"
    F.agg(k, f"blk{g}_{Y}_{qb + 1}", f"{Y}.{qb * g + 1:02d}~{Y}.{qb * g + g:02d}", qs[qb])
    asof = f"{Y}.{mm:02d}"
    head = f"{Y}년 {eun(m['short'])} {nm}으로 보면 {lab}({val_txt(k, qs[qb])})이 가장 큰 값임"
    slide = {"kind": "chart", "part": 9, "title": title, "source": SRC([k], asof),
             "chart": {"type": "morph", "unit": m["unit"], "decimals": m["dec"], "data": [[f"{Y}.{j:02d}", rnd(x, 3)] for j, x in enumerate(vs, 1)], "group": g},
             "read": rd(head, [f"{nm}: " + ", ".join(f(x, m['dec']) for x in qs), f"{Y}년 1~{mm}월 합 {val_txt(k, sum(vs))}"], [k], asof)}
    ent("morph", "chart-morph", f"{m['short']} {Y}년 월 → {nm} 쌓기", [m["name"], "분기" if g == 3 else "월"], slide, F)


# ───────────────────────── split / bridge / drivers 공통: 기간 ─────────────────────────
def period_defs():
    """(라벨, 합산 함수 ym -> dict comp -> value) 목록"""
    Y, mm = lasty("ca"), lastm("ca")
    out = []
    for n in range(4):
        p = pm(last("ca"), -n)
        out.append(("m", p, p, lambda k, p=p: val(k, p), lambda k, p=p: val(k, pm(p, -12))))
    return out


def agg_period(kind, a, b=None):
    """kind 'ytd' (Y, m) / 'year' Y / 'q' (Y, q) / 'm' 'YYYY.MM' -> function k -> value"""
    if kind == "m":
        return lambda k: val(k, a)
    if kind == "ytd":
        return lambda k: ytd(k, a, b)
    if kind == "year":
        return lambda k: ytd(k, a, 12)
    if kind == "q":
        return lambda k: sum(val(k, f"{a}.{j:02d}") for j in range(3 * b - 2, 3 * b + 1))


def plabel(kind, a, b=None):
    if kind == "m":
        return a
    if kind == "ytd":
        return f"{a}년 1~{b}월"
    if kind == "year":
        return f"{a}년"
    return f"{a}년 {b}분기"


def pshift(kind, a, b=None):
    """한 해 앞"""
    if kind == "m":
        return (pm(a, -12), None)
    return (a - 1, b)


def gen_split(i):
    F = Fx()
    Y, mm = lasty("ca"), lastm("ca")
    lp = last("ca")
    defs = [("m", pm(lp, -n), None) for n in range(4)] + [("ytd", Y, mm), ("ytd", Y - 1, mm)] + [("year", Y - 1 - j, None) for j in range(5)] + [("q", Y, q) for q in range(1, mm // 3 + 1)] + [("q", Y - 1, 4)]
    defs = defs[:15]
    kind, a, b = defs[i]
    fn = agg_period(kind, a, b)
    parts = [{"label": CN[c], "value": rnd(fn(c), 1)} for c in COMP]
    tot = fn("ca")
    assert abs(sum(p["value"] for p in parts) - tot) < 0.3
    big = max(parts, key=lambda p: abs(p["value"]))
    lab = plabel(kind, a, b)
    title = f"{lab} 경상수지는 {i_ga(big['label'])} 좌우"
    F.agg("ca", f"{kind}_{a}_{b}", lab, tot)
    asof = last("ca")
    head = f"{lab} 경상수지({val_txt('ca', tot)})에서 절댓값이 가장 큰 항목은 {big['label']}({f(big['value'])}억 달러)임"
    slide = {"kind": "chart", "part": 10, "title": title, "source": SRC(["ca"] + COMP, asof),
             "chart": {"type": "split", "unit": "억 달러", "decimals": 1, "total": {"label": "경상수지", "value": rnd(tot, 1)}, "parts": parts},
             "read": rd(head, ["항목을 더하면 경상수지와 같음", "음수는 0선 아래로 갈라짐"], ["ca"] + COMP, asof)}
    ent("split", "chart-split", f"{lab} 경상수지 = 네 항목의 합", ["경상수지", {"m": "월", "ytd": "연", "year": "연", "q": "분기"}[kind]], slide, F)


def gen_bridge(i):
    F = Fx()
    Y, mm = lasty("ca"), lastm("ca")
    lp = last("ca")
    defs = ([("ytd", Y - j, mm) for j in range(5)] + [("year", Y - 1 - j, None) for j in range(4)] + [("m", pm(lp, -n), None) for n in range(4)] + [("q", Y, q) for q in range(1, mm // 3 + 1)])[:15]
    kind, a, b = defs[i]
    fn1 = agg_period(kind, *( (a, b) if kind != "m" else (a, None)))
    pa, pb = pshift(kind, a, b)
    fn0 = agg_period(kind, pa, pb) if kind != "m" else agg_period("m", pa)
    steps = [{"label": CN[c], "value": rnd(fn1(c) - fn0(c), 1)} for c in COMP]
    if i % 2:
        steps.sort(key=lambda s: -abs(s["value"]))
    s0 = sum(fn0(c) for c in COMP)
    s1 = sum(fn1(c) for c in COMP)
    lab, lab0 = plabel(kind, a, b), plabel(kind, pa, pb)
    big = max(steps, key=lambda s: abs(s["value"]))
    title = f"증감의 가장 큰 몫은 {big['label']}"
    F.agg("ca", f"br_{kind}_{a}_{b}", lab, s1)
    F.agg("ca", f"br_{kind}_{pa}_{pb}", lab0, s0)
    asof = last("ca")
    head = f"경상수지는 {lab0} {f(s0)}억 달러에서 {lab} {f(s1)}억 달러로 바뀌었고 {big['label']}의 몫({sg(big['value'])}억 달러)이 가장 컸음"
    slide = {"kind": "chart", "part": 11, "title": title, "source": SRC(["ca"] + COMP, asof),
             "chart": {"type": "bridge", "unit": "억 달러", "decimals": 1, "start": {"label": lab0, "value": rnd(s0, 1)}, "steps": steps, "end": {"label": lab, "value": rnd(s1, 1)}},
             "read": rd(head, [f"비교: {lab0} → {lab}", "몫 = 항목별 전년 대비 증감"], ["ca"] + COMP, asof)}
    ent("bridge", "chart-bridge", f"{lab0} → {lab} 경상수지 증감 분해", ["경상수지", {"m": "월", "ytd": "연", "year": "연", "q": "분기"}[kind]], slide, F)


# ───────────────────────── waffle ─────────────────────────
def pct1(x):
    return round(x, 1)


def gen_waffle(i):
    F = Fx()
    if i < 3:  # 비율 지표 자체
        k = ["unrate", "krcpi", "uscpi"][i]
        m = meta(k)
        v = pct1(val(k, last(k)))
        F.pt(k, last(k))
        if k == "unrate":
            label, rest, bd = "미국 실업률", "일하는 중", [["일자리 찾는 중", v], ["일하는 중", pct1(100 - v)]]
            title = f"미국 노동력 100명 중 **{f(v)}명**이 실업"
            head = f"{last(k)} 미국 실업률은 {f(v)}%로 노동력 100명 중 약 {f(v)}명이 일자리를 찾는 중임"
        else:
            label = m["short"] + " 상승"
            rest = "그대로"
            bd = [["오른 몫", v], ["그대로", pct1(100 - v)]]
            title = f"{m['short']}, 100원이 1년 새 **{f(100 + v)}원**"
            head = f"{last(k)} {eun(m['short'])} 전년 동월보다 {f(v)}% 올라 100원어치가 {f(100 + v)}원이 된 셈임"
        keys, asof = [k], last(k)
        pts = ["칸 100개 = 100%", "마지막 칸은 부분만 채움"]
        var = f"{m['short']} 100칸"
        tags = [m["name"], "월"]
    elif i < 9:  # 흑자 달 비중
        k, n = [("ca", 60), ("goods", 60), ("pinc", 24), ("payems", 12), ("payems", 36), ("payems", 24)][i - 3]
        m = meta(k)
        w = tail(k, n)
        c = sum(1 for _, x in w if x > 0)
        n = len(w)
        v = pct1(c / n * 100)
        pos = "흑자" if m["kind"] == "flow" and m["unit"] == "억 달러" else "증가"
        neg = "적자" if pos == "흑자" else "감소"
        title = f"{n}개월 중 {m['short']} {pos} **{c}개월**"
        label, rest = f"{pos} 달", f"{neg} 달"
        bd = [[f"{pos} 달", v], [f"{neg} 달", pct1(100 - v)]]
        keys, asof = [k], last(k)
        F.pt(k, last(k))
        head = f"{w[0][0]}~{w[-1][0]} {n}개월 중 {i_ga(m['short'])} {pos}였던 달은 {c}개월({f(v)}%)임"
        pts = [f"{pos} {c}개월 · {neg} {n - c}개월", f"끝 달 {val_txt(k, w[-1][1])}"]
        var = f"{m['short']} {pos} 달 비중 {n}개월"
        tags = [m["name"], "월"]
    elif i < 12:  # 흑자 항목 중 상품 몫
        Y, mm = lasty("ca"), lastm("ca")
        kind, a, b = [("ytd", Y, mm), ("year", Y - 1, None), ("ytd", Y - 1, mm)][i - 9]
        fn = agg_period(kind, a, b)
        pos = {c: fn(c) for c in COMP if fn(c) > 0}
        big = max(pos, key=lambda c: pos[c])
        tot = sum(pos.values())
        v = pct1(pos[big] / tot * 100)
        lab = plabel(kind, a, b)
        title = f"{lab} 흑자 중 {CN[big].replace('수지', '')} **{f(v)}%**"
        label, rest = f"{CN[big]} 몫", "다른 흑자 항목"
        bd = [[CN[c], pct1(x / tot * 100)] for c, x in sorted(pos.items(), key=lambda t: -t[1])]
        if abs(sum(x[1] for x in bd) - 100) > 0.15:
            bd = [bd[0]] + [["다른 항목", pct1(100 - bd[0][1])]]
        keys, asof = ["ca"] + COMP, last("ca")
        F.agg(big, f"waf_{kind}_{a}_{b}", lab, pos[big])
        head = f"{lab} 흑자였던 항목({', '.join(CN[c] for c in pos)})의 합에서 {i_ga(CN[big])} {f(v)}%를 차지함"
        pts = ["적자 항목은 몫 계산에서 뺌", f"{CN[big]} {f(pos[big])}억 달러 / 흑자 항목 합 {f(tot)}억 달러"]
        var = f"{lab} 흑자 항목 몫"
        tags = ["경상수지", "연"]
    else:  # 분기 몫
        Y, mm = lasty("ca"), lastm("ca")
        yy = [Y, Y - 1, Y - 2][i - 12]
        mmm = mm if yy == Y else mm
        qn = mmm // 3
        tot = ytd("ca", yy, qn * 3)
        qv = sum(val("ca", f"{yy}.{j:02d}") for j in range(3 * qn - 2, 3 * qn + 1))
        v = pct1(qv / tot * 100)
        title = f"1~{qn}분기 흑자 중 {qn}분기 **{f(v)}%**"
        label, rest = f"{yy}년 {qn}분기 몫", f"{yy}년 1~{qn - 1}분기 몫"
        bd = [[f"{qn}분기", v], [f"1~{qn - 1}분기", pct1(100 - v)]]
        keys, asof = ["ca"], last("ca")
        F.agg("ca", f"waf_q{qn}_{yy}", f"{yy}.Q{qn}", qv)
        head = f"{yy}년 경상수지 1~{qn}분기 누적({f(tot)}억 달러) 중 {qn}분기 몫이 {f(v)}%임"
        pts = [f"{qn}분기 {f(qv)}억 달러", "누적이 양수일 때만 몫으로 읽음"]
        var = f"{yy}년 {qn}분기가 누적에서 차지한 몫"
        tags = ["경상수지", "분기"]
    slide = {"kind": "chart", "part": 12, "title": title, "source": SRC(keys, asof),
             "chart": {"type": "waffle", "decimals": 1, "value": v, "label": label, "rest": rest, "breakdown": bd},
             "read": rd(head, pts, keys, asof)}
    ent("waffle", "chart-waffle", var, tags, slide, F)



# ───────────────────────── combo · minis · donut (판 2) ─────────────────────────
COMBOS = [("ca", "m"), ("goods", "m"), ("fx", "m"), ("indpro", "m"), ("ca", "y"), ("goods", "y")]


def gen_combo(i):
    F = Fx()
    k, mode = COMBOS[i]
    m = meta(k)
    sh = m["short"]
    if mode == "m":
        lp = last(k)
        ps = [pm(lp, -11 + j) for j in range(12)]
        bars = [[p, rnd(val(k, p), 3)] for p in ps]
        line = [[p, rnd((val(k, p) / val(k, pm(p, -12)) - 1) * 100, 1)] for p in ps]
        pct = line[-1][1]
        title = f"{sh} {mlabel(lp)} 전년비 {sg(pct, 0)}%"
        asof = lp
        F.pt(k, lp)
        F.pt(k, pm(lp, -12))
        sumtxt = f"합계 {f(sum(b[1] for b in bars), 1)}{m['unit']}" if m["kind"] == "flow" else f"평균 {f(sum(b[1] for b in bars) / 12, m['dec'])}{u_txt(k)}"
        cards = [{"label": f"{sh} {mlabel(lp)}", "value": rnd(val(k, lp), m["dec"] + 1), "unit": m["unit"]}, {"label": "전년 같은 달비", "value": pct, "unit": "%"}]
        summary = [[f"{ps[0]}~{ps[-1]}", sumtxt]]
        head = f"{sh}은 {lp}에 {val_txt(k, val(k, lp))}로 전년 같은 달({val_txt(k, val(k, pm(lp, -12)))})보다 {sg(pct, 1)}% 달라졌음"
        var = f"{sh} 최근 12개월 막대 + 전년비 선"
    else:
        ys = list(range(2021, lasty(k)))
        bars = [[str(y), rnd(ytd(k, y, 12), 3)] for y in ys]
        line = [[str(y), rnd((ytd(k, y, 12) / ytd(k, y - 1, 12) - 1) * 100, 1)] for y in ys[1:]]
        pct = line[-1][1]
        title = f"{sh} 연간 {ys[-1]}년 전년비 {sg(pct, 0)}%"
        asof = last(k)
        F.agg(k, f"year_{ys[-1]}", f"{ys[-1]}.01~{ys[-1]}.12", ytd(k, ys[-1], 12))
        cards = [{"label": f"{ys[-1]}년 {sh}", "value": rnd(ytd(k, ys[-1], 12), 2), "unit": m["unit"]}]
        summary = [[f"{ys[0]}~{ys[-1]}", f"합계 {f(sum(b[1] for b in bars), 1)}{m['unit']}"]]
        head = f"{sh}은 {ys[-1]}년 연간 {val_txt(k, ytd(k, ys[-1], 12))}로 전년보다 {sg(pct, 1)}% 달라졌음"
        var = f"{sh} 연간 막대 + 전년비 선"
    sl = {"kind": "chart", "part": 0, "title": title, "source": SRC([k], asof),
          "chart": {"type": "combo", "bars": bars, "line": line, "units": [m["unit"], "%"], "decimals": m["dec"], "cards": cards, "summary": summary},
          "read": rd(head, [f"막대 = {m['name']}({m['unit']})", "선 = 전년 같은 달(연간은 전년) 대비 변화율"], [k], asof)}
    ent("combo", "chart-combo", var, [m["name"], "월" if mode == "m" else "연"], sl, F)


MINIS = [(["ca", "goods", "serv"], ["bar", "bar", "bar"], 6), (["krrate", "fedfunds", "dgs10"], ["line"] * 3, 12), (["unrate", "uscpi", "krcpi"], ["line"] * 3, 12), (["fx", "indpro", "payems"], ["line", "line", "bar"], 12)]


def gen_minis(i):
    F = Fx()
    ks, kinds, n = MINIS[i]
    ms, up = [], 0
    for k, kd in zip(ks, kinds):
        m = meta(k)
        w = tail(k, n)
        up += w[-1][1] > w[0][1]
        F.pt(k, w[-1][0])
        ms.append({"label": m["short"], "value": rnd(w[-1][1], m["dec"] + 1), "unit": m["unit"], "kind": kd, "data": [[x, rnd(v, 3)] for x, v in w]})
    asof = max(last(k) for k in ks)
    title = f"3개 중 {up}개가 {n}개월 새 올랐음"
    head = f"{', '.join(meta(k)['short'] for k in ks)} 가운데 {n}개월 전보다 끝 값이 큰 지표는 {up}개임"
    sl = {"kind": "chart", "part": 0, "title": title, "source": SRC(ks, asof), "chart": {"type": "minis", "minis": ms},
          "read": rd(head, [f"{meta(k)['short']} {val_txt(k, val(k, last(k)))}" for k in ks], ks, asof)}
    ent("minis", "chart-minis", f"{'·'.join(meta(k)['short'] for k in ks)} 미니 3열", [meta(ks[0])["name"], "월"], sl, F)


def pos_share(k, n):
    w = tail(k, n)
    return round(sum(1 for _, x in w if x > 0) / len(w) * 100, 1), len(w)


def gen_donut(i):
    F = Fx()
    Y, mm = lasty("ca"), lastm("ca")
    half = i in (1, 3)
    if i == 0:
        rings = [{"label": meta(k)["short"], "value": pos_share(k, 60)[0]} for k in ("ca", "goods", "pinc")]
        head_t, keys = "흑자 달 비중(60개월)", ["ca", "goods", "pinc"]
        title = f"60개월 중 경상수지 흑자 {f(rings[0]['value'])}%"
        r = f"최근 60개월 중 흑자였던 달의 비중은 경상수지 {f(rings[0]['value'])}%, 상품수지 {f(rings[1]['value'])}%, 본원소득 {f(rings[2]['value'])}%임"
        pts = ["흑자 달 수 ÷ 전체 달 수", "각 고리는 한 항목"]
    elif i == 1:
        rings = [{"label": f"{n}개월", "value": pos_share("payems", n)[0]} for n in (12, 24, 36)]
        head_t, keys = "미국 고용 증가 달 비중", ["payems"]
        title = f"고용 증가 달 비중, 12개월 {f(rings[0]['value'])}%"
        r = f"미국 비농업 고용이 늘어난 달의 비중은 12개월 {f(rings[0]['value'])}%, 24개월 {f(rings[1]['value'])}%, 36개월 {f(rings[2]['value'])}%임"
        pts = ["증가 달 수 ÷ 전체 달 수", "기간이 길수록 고리가 바깥"]
    elif i == 2:
        defs = [("ytd", Y, mm), ("ytd", Y - 1, mm), ("year", Y - 1, None)]
        rings = []
        for kd, a, b in defs:
            fn = agg_period(kd, a, b)
            pos = {c: fn(c) for c in COMP if fn(c) > 0}
            rings.append({"label": plabel(kd, a, b), "value": round(max(pos.values()) / sum(pos.values()) * 100, 1)})
        head_t, keys = "흑자 항목 중 상품수지 몫", ["ca"] + COMP
        title = f"흑자 항목 중 상품수지 몫 {f(rings[0]['value'])}%"
        r = f"흑자였던 항목의 합에서 상품수지가 차지하는 몫은 {rings[0]['label']} {f(rings[0]['value'])}%, {rings[1]['label']} {f(rings[1]['value'])}%임"
        pts = ["적자 항목은 몫 계산에서 뺌", "가장 큰 흑자 항목의 몫"]
    elif i == 3:
        rings = []
        for yy in (Y, Y - 1, Y - 2):
            qn = mm // 3
            tot = ytd("ca", yy, qn * 3)
            qv = sum(val("ca", f"{yy}.{j:02d}") for j in range(3 * qn - 2, 3 * qn + 1))
            rings.append({"label": f"{yy}년", "value": round(qv / tot * 100, 1)})
        head_t, keys = f"1~{mm // 3}분기 누적 중 {mm // 3}분기 몫", ["ca"]
        title = f"{mm // 3}분기 몫, {Y}년 {f(rings[0]['value'])}%"
        r = f"경상수지 1~{mm // 3}분기 누적 중 {mm // 3}분기가 차지한 몫은 {Y}년 {f(rings[0]['value'])}%, {Y - 1}년 {f(rings[1]['value'])}%, {Y - 2}년 {f(rings[2]['value'])}%임"
        pts = ["누적이 양수인 해만 비교", "한 해에 한 고리"]
    else:
        a, b = val("krcpi", last("krcpi")), val("uscpi", last("uscpi"))
        rings = [{"label": "한국", "value": round(a, 1)}, {"label": "미국", "value": round(b, 1)}]
        head_t, keys = "물가 상승률(전년 동월 대비)", ["krcpi", "uscpi"]
        title = f"물가 상승률, 한국 {f(a)}% · 미국 {f(b)}%"
        r = f"소비자물가 상승률은 한국 {f(a)}%, 미국 {f(b)}%로 한국이 {f(abs(a - b))}%p {'낮음' if a < b else '높음'}"
        pts = ["고리 가득 = 100%", "전년 동월 대비 상승률"]
    for k in keys[:1]:
        F.agg(k, f"donut_{i}", "", rings[0]["value"]) if k in IND and i in (0, 1, 2, 3) else F.pt(k, last(k))
    asof = max(last(k) for k in keys)
    ch = {"type": "donut", "decimals": 1, "head": head_t, "rings": rings}
    if half:
        ch["half"] = True
    sl = {"kind": "chart", "part": 0, "title": title, "source": SRC(keys, asof), "chart": ch, "read": rd(r, pts, keys, asof)}
    ent("donut", "chart-donut" + ("-half" if half else ""), f"{head_t} · {'반원' if half else '고리'} {len(rings)}개", [meta(keys[0])["name"], "월"], sl, F)


# ───────────────────────── headline ─────────────────────────
def gen_headline(i):
    F = Fx()
    t, v = i // 4, i % 4
    if t == 0:
        Y, mm = lasty("ca"), lastm("ca")
        yy = Y - v
        tot = ytd("ca", yy, mm)
        parts = {c: ytd(c, yy, mm) for c in COMP}
        big = max(COMP, key=lambda c: parts[c] * (1 if tot > 0 else -1))
        share = parts[big] / tot if tot else 0
        sign = "흑자" if tot > 0 else "적자"
        nm = CN[big].replace("수지", "")
        adj = "거의 전부" if share >= 0.9 else "대부분" if share >= 0.6 else "상당 부분" if share >= 0.3 else "일부"
        text = f"{sign}보다 큰 몫이 「{nm}」에서 나옴" if share > 1 else f"{sign}의 {eun(adj)} 「{nm}」에서 나옴"
        key = f"「{nm}」에서"
        ev = [{"label": CN[big], "value": rnd(parts[big], 1), "unit": "억 달러", "note": f"1~{mm}월"}, {"label": "경상수지", "value": rnd(tot, 1), "unit": "억 달러", "note": f"1~{mm}월"}]
        pts = [f"{CN[c].replace('수지', '')} {sg(parts[c])}" for c in COMP if c != big]
        F.agg("ca", f"hl_ytd_{yy}", f"{yy}.01~{yy}.{mm:02d}", tot)
        F.agg(big, f"hl_ytd_{yy}", f"{yy}.01~{yy}.{mm:02d}", parts[big])
        keys, asof = ["ca"] + COMP, last("ca")
        head = f"{yy}년 1~{mm}월 경상수지({f(tot)}억 달러)에서 {i_ga(CN[big])} {f(parts[big])}억 달러로 {f(share * 100, 0)}%를 차지함"
        rp = ["나머지 항목: " + ", ".join(pts), "누적은 1월부터 합산"]
        var = f"{yy}년 누적 · 가장 큰 항목"
        tags = ["경상수지", "연"]
    elif t == 1:
        lp = min(last("krrate"), last("fedfunds"))
        p = pm(lp, -[0, 3, 6, 11][v])
        g = val("krrate", p) - val("fedfunds", p)
        word = "낮음" if g < 0 else "높음" if g > 0 else "같음"
        text = f"한국 기준금리는 미국보다 {f(abs(g), 2)}%p {word}" if g != 0 else "한국 기준금리는 미국과 같음"
        key = f"{f(abs(g), 2)}%p {word}" if g != 0 else "같음"
        ev = [{"label": "한국 기준금리", "value": rnd(val("krrate", p), 2), "unit": "%", "note": p}, {"label": "미국 연방기금금리", "value": rnd(val("fedfunds", p), 2), "unit": "%", "note": p}]
        pts = [f"한국 물가 {f(val('krcpi', min(p, last('krcpi'))), 1)}%", f"미국 물가 {f(val('uscpi', min(p, last('uscpi'))), 1)}%"]
        F.pt("krrate", p)
        F.pt("fedfunds", p)
        keys, asof = ["krrate", "fedfunds", "krcpi", "uscpi"], p
        head = f"{p} 한국 기준금리({f(val('krrate', p), 2)}%)는 미국 연방기금금리({f(val('fedfunds', p), 2)}%)보다 {f(abs(g), 2)}%p {word}임"
        rp = ["월평균 기준", "물가는 전년 동월 대비 상승률"]
        var = f"{p} 한미 기준금리 격차"
        tags = ["기준금리", "월"]
    elif t == 2:
        n = [6, 12, 24, 36][v]
        w = tail("payems", n)
        n = len(w)
        c = sum(1 for _, x in w if x > 0)
        total = sum(x for _, x in w)
        text = f"최근 {n}개월 중 {c}개월 고용이 늘었음"
        key = f"{c}개월"
        ev = [{"label": "누적 증감", "value": rnd(total, 0), "unit": "천 명", "note": f"{n}개월"}, {"label": "월평균", "value": rnd(total / n, 0), "unit": "천 명", "note": f"{n}개월"}]
        mxm = max(w, key=lambda x: x[1])
        pts = [f"최대 {mxm[0]} {sg(mxm[1], 0)}", f"끝 달 {sg(w[-1][1], 0)}"]
        F.pt("payems", w[-1][0])
        keys, asof = ["payems"], last("payems")
        head = f"{w[0][0]}~{w[-1][0]} 미국 비농업 고용은 {n}개월 중 {c}개월 늘었고 누적 {sg(total, 0)}천 명 변했음"
        rp = ["단위: 천 명", "월별 증감은 이후 수정될 수 있음"]
        var = f"미국 고용 증감 {n}개월"
        tags = ["고용", "월"]
    elif t == 3:
        k = ["ca", "goods", "serv", "pinc"][v]
        n = 24
        w = tail(k, n)
        c = sum(1 for _, x in w if x > 0)
        m = meta(k)
        if c == n:
            text = f"{eun(m['short'])} {n}개월 내내 흑자임"
            key = f"{n}개월 내내"
        elif c == 0:
            text = f"{eun(m['short'])} {n}개월 내내 적자임"
            key = f"{n}개월 내내"
        else:
            text = f"{eun(m['short'])} {n}개월 중 {c}개월 흑자임"
            key = f"{c}개월 흑자"
        ev = [{"label": "누적", "value": rnd(sum(x for _, x in w), 1), "unit": "억 달러", "note": f"{n}개월"}, {"label": "월평균", "value": rnd(sum(x for _, x in w) / n, 1), "unit": "억 달러", "note": f"{n}개월"}]
        mxm = max(w, key=lambda x: x[1])
        pts = [f"최대 {mxm[0]} {sg(mxm[1])}", f"끝 달 {sg(w[-1][1])}"]
        F.pt(k, w[-1][0])
        keys, asof = [k], last(k)
        head = f"{w[0][0]}~{w[-1][0]} {n}개월 중 {i_ga(m['short'])} 흑자였던 달은 {c}개월이며 누적은 {f(sum(x for _, x in w))}억 달러임"
        rp = ["흑자 = 0보다 큰 달", "단위: 억 달러"]
        var = f"{m['short']} 흑자 달 수"
        tags = [m["name"], "월"]
    elif t == 4:
        n = [3, 12, 36, 60][v]
        w = tail("fx", n)
        mx, mn = max(w, key=lambda x: x[1]), min(w, key=lambda x: x[1])
        rg = mx[1] - mn[1]
        text = f"환율 {n}개월 변동 폭은 {f(rg, 0)}원"
        key = f"{f(rg, 0)}원"
        ev = [{"label": "최고", "value": rnd(mx[1], 0), "unit": "원", "note": mx[0]}, {"label": "최저", "value": rnd(mn[1], 0), "unit": "원", "note": mn[0]}, {"label": "끝 달", "value": rnd(w[-1][1], 0), "unit": "원", "note": w[-1][0]}]
        pts = [f"최고는 최저보다 {f((mx[1] / mn[1] - 1) * 100, 1)}% 큼"]
        F.pt("fx", mx[0])
        F.pt("fx", mn[0])
        keys, asof = ["fx"], last("fx")
        head = f"최근 {n}개월 월평균 원/달러 환율은 {mn[0]} {f(mn[1], 0)}원에서 {mx[0]} {f(mx[1], 0)}원까지 {f(rg, 0)}원 움직였음"
        rp = ["월평균 기준", "일별 최고·최저는 더 클 수 있음"]
        var = f"환율 {n}개월 변동 폭"
        tags = ["환율", "월"]
    else:
        n = [0, 2, 4, 6][v]
        lp = min(last("krcpi"), last("uscpi"))
        p = pm(lp, -n)
        g = val("krcpi", p) - val("uscpi", p)
        word = "낮음" if g < 0 else "높음" if g > 0 else "같음"
        text = f"한국 물가 상승률은 미국보다 {f(abs(g), 1)}%p {word}"
        key = f"{f(abs(g), 1)}%p {word}"
        ev = [{"label": "한국", "value": rnd(val("krcpi", p), 1), "unit": "%", "note": p}, {"label": "미국", "value": rnd(val("uscpi", p), 1), "unit": "%", "note": p}]
        pts = [f"한국 기준금리 {f(val('krrate', min(p, last('krrate'))), 2)}%", f"미국 정책금리 {f(val('fedfunds', min(p, last('fedfunds'))), 2)}%"]
        F.pt("krcpi", p)
        F.pt("uscpi", p)
        keys, asof = ["krcpi", "uscpi", "krrate", "fedfunds"], p
        head = f"{p} 소비자물가 상승률은 한국 {f(val('krcpi', p), 1)}%, 미국 {f(val('uscpi', p), 1)}%로 한국이 {f(abs(g), 1)}%p {word}임"
        rp = ["전년 동월 대비 상승률", "차이는 %p"]
        var = f"{p} 한미 물가 상승률 차이"
        tags = ["물가", "월"]
    assert key in text, (key, text)
    text = text.replace(key, "**" + key + "**") if False else text
    slide = {"kind": "headline", "part": 13, "text": text, "key": key, "evidence": ev, "points": pts, "source": SRC(keys, asof), "read": rd(head, rp, keys, asof)}
    ent("headline", "headline", var, tags, slide, F)


# ───────────────────────── drivers ─────────────────────────
FOOT = ["¹", "²", "³", "⁴"]


def gen_drivers(i):
    F = Fx()
    Y, mm = lasty("ca"), lastm("ca")
    lp = last("ca")
    defs = [("m", pm(lp, -n), None) for n in range(6)] + [("ytd", Y - j, mm) for j in range(5)] + [("q", Y, q) for q in range(1, mm // 3 + 1)] + [("year", Y - 1, None)]
    kind, a, b = defs[i]
    fn1 = agg_period(kind, a, b) if kind != "m" else agg_period("m", a)
    pa, pb = pshift(kind, a, b)
    fn0 = agg_period(kind, pa, pb) if kind != "m" else agg_period("m", pa)
    ds = sorted([(c, fn1(c) - fn0(c)) for c in COMP], key=lambda t: -abs(t[1]))
    lab, lab0 = plabel(kind, a, b), plabel(kind, pa, pb)
    tot = sum(d for _, d in ds)
    top = ds[0]
    nm = CN[top[0]].replace("수지", "")
    title = f"{lab} 변화의 주역은 {nm}"
    items = [{"sign": "+" if d >= 0 else "−", "text": CN[c], "num": f"{sg(d)}억 달러", "note": FOOT[j]} for j, (c, d) in enumerate(ds)]
    F.agg("ca", f"drv_{kind}_{a}_{b}", lab, sum(fn1(c) for c in COMP))
    asof = last("ca")
    head = f"{lab} 경상수지는 {lab0}보다 {sg(tot)}억 달러 달라졌고 그중 {CN[top[0]]}({sg(top[1])}억 달러)가 가장 크게 움직인 항목임"
    pts = [f"{FOOT[j]} {CN[c]} {lab0} {f(fn0(c))} → {lab} {f(fn1(c))}억 달러" for j, (c, _) in enumerate(ds)][:4]
    slide = {"kind": "drivers", "part": 14, "title": title, "items": items, "source": SRC(["ca"] + COMP, asof), "read": rd(head, pts[:3], ["ca"] + COMP, asof)}
    ent("drivers", "drivers", f"{lab0} → {lab} 변화 요인", ["경상수지", {"m": "월", "ytd": "연", "year": "연", "q": "분기"}[kind]], slide, F)


# ───────────────────────── term (appendix) ─────────────────────────
TERMS = [
    ("경상수지", "상품·서비스·소득 거래의 합", "가계부의 한 달 수입 − 지출", "ca"),
    ("상품수지", "수출 − 수입(소유권 기준)", "물건을 팔고 사 온 장부의 차이", "goods"),
    ("본원소득", "해외에서 받은 임금·배당·이자 − 내준 것", "해외에 둔 일터가 보내온 월급과 이자", None),
    ("이전소득", "대가 없이 주고받은 돈", "가족끼리 주고받는 용돈", None),
    ("전기비", "바로 앞 기간과 견준 변화율", "어제 몸무게와 오늘 몸무게 비교", None),
    ("전년동기비", "1년 전 같은 때와 견준 변화율", "작년 이맘때 키와 지금 키 비교", "uscpi"),
    ("기준금리", "중앙은행이 정하는 정책 금리", "돈값의 기본 요금표", "krrate"),
    ("계절조정", "해마다 되풀이되는 움직임을 뺀 값", "여름 · 명절 효과를 걷어낸 눈금", None),
    ("실질", "물가 변화를 뺀 값", "물가 오른 만큼 눈금을 되돌린 값", None),
    ("근원물가", "식료품 · 에너지를 뺀 물가", "날씨 따라 널뛰는 것을 뺀 체온", None),
    ("외환보유액", "당국이 가진 대외 지급 준비 자산", "집안 비상금 통장", None),
    ("연율", "한 기간 변화를 1년치로 환산한 값", "한 달 속도로 1년을 달린 거리", None),
]


def gen_term(i):
    F = Fx()
    w, d, like, k = TERMS[i]
    slide = {"kind": "term", "part": 0, "appendix": f"A{i + 1}", "word": w, "def": d, "like": like}
    if i % 2 == 0 and i < 10:
        slide["style"] = "plate"
    keys = None
    if k:
        m = meta(k)
        lp = last(k)
        slide["example"] = f"{lp} {m['short']} {val_txt(k, val(k, lp))}"
        F.pt(k, lp)
        slide["source"] = SRC([k], lp)
        keys, asof = [k], lp
    head = f"{w}의 뜻은 「{d}」이고 비유하면 {like}임"
    pts = [f"정의: {d}", f"비유: {like}"]
    if keys:
        slide["read"] = rd(head, pts + [f"예: {slide['example']}"], keys, asof)
    else:
        slide["read"] = {"head": head, "points": pts, "source": "ECOM 용어 풀이(terms/glossary.json)"}
    ent("term", "term", f"{w} 부록 정의", [w, "용어"], slide, F)


# ───────────────────────── compare ─────────────────────────
COMPARE = [
    ("무역수지 vs 상품수지", ("무역수지", "통관 기준", ["세관을 지난 때", "수출액 − 수입액"]), ("상품수지", "소유권 기준", ["주인이 바뀐 때", "국제수지의 한 항목"]), "무엇이 다를까"),
    ("명목 vs 실질", ("명목", "그해 가격", ["물가 오름이 섞임", "금액이 그대로 보임"]), ("실질", "물가 뺀 값", ["기준년 가격으로 계산", "성장을 볼 때 씀"]), "어느 쪽으로 볼까"),
    ("전기비 vs 전년동기비", ("전기비", "바로 앞 기간", ["흐름 바뀜이 빨리 보임", "계절 영향이 섞임"]), ("전년동기비", "1년 전 같은 때", ["계절 영향이 빠짐", "바뀜은 느리게 보임"]), "비교 기준이 달라요"),
    ("GDP vs GNI", ("GDP", "나라 안 기준", ["나라 안에서 만든 값", "외국인 생산도 포함"]), ("GNI", "국민 기준", ["국민이 번 소득의 합", "해외 소득도 포함"]), "범위가 달라요"),
    ("CPI vs PCE", ("CPI", "가계 구매 기준", ["소비자물가지수", "가계가 사는 값"]), ("PCE", "지출 기준", ["개인소비지출 물가", "미국 연준이 중시"]), "누가 더 보나"),
    ("소비자물가 vs 근원물가", ("소비자물가", "전체", ["모든 품목 평균", "에너지 · 식료품 포함"]), ("근원물가", "변동 큰 것 제외", ["에너지 · 식료품 뺌", "기조적 흐름을 봄"]), "무엇을 뺄까"),
    ("경상수지 vs 금융계정", ("경상수지", "벌고 쓴 돈", ["상품 · 서비스 · 소득", "실물 거래가 중심"]), ("금융계정", "자산 · 부채", ["투자 · 대출 · 증권", "돈의 이동을 적음"]), "다른 칸의 장부"),
    ("원계열 vs 계절조정", ("원계열", "있는 그대로", ["계절 움직임 포함", "전년 같은 달과 비교"]), ("계절조정", "계절 뺀 값", ["해마다 같은 흐름 제거", "직전 달과 비교 가능"]), "비교 방법이 달라요"),
    ("연율 vs 전기비", ("전기비", "그 기간만", ["한 분기의 변화율", "작은 숫자로 보임"]), ("연율", "1년치로 환산", ["이 속도로 1년이면", "큰 숫자로 보임"]), "같은 변화 다른 크기"),
    ("본원소득 vs 이전소득", ("본원소득", "일해서 번 몫", ["임금 · 배당 · 이자", "대가가 있음"]), ("이전소득", "그냥 오간 몫", ["무상원조 · 송금", "대가가 없음"]), "대가가 있나"),
    ("기준금리 vs 시장금리", ("기준금리", "정책으로 정함", ["중앙은행이 발표", "다른 금리의 기준"]), ("시장금리", "시장에서 정해짐", ["채권 · 대출 거래 값", "기대에 따라 움직임"]), "누가 정하나"),
    ("흑자 vs 적자", ("흑자", "번 돈이 큼", ["받은 돈 > 낸 돈", "수지가 0보다 큼"]), ("적자", "쓴 돈이 큼", ["받은 돈 < 낸 돈", "수지가 0보다 작음"]), "부호의 뜻"),
]


ROWS = [
    ("무역수지와 상품수지의 차이", ["무역수지", "상품수지"], [["통관 기준", "소유권 기준"], ["세관을 지난 때", "주인이 바뀐 때"], ["수출액 − 수입액", "국제수지의 한 항목"]], ["기준 시점이 다름", "집계 때가 다름", "쓰임이 다름"]),
    ("명목과 실질의 차이", ["명목", "실질"], [["그해 가격 그대로", "물가 변화를 뺀 값"], ["물가 오름이 섞임", "기준년 가격으로 계산"], ["금액을 볼 때", "성장을 볼 때"]], ["가격 처리가 다름", "계산이 다름", "쓰임이 다름"]),
    ("전기비와 전년동기비의 차이", ["전기비", "전년동기비"], [["바로 앞 기간과 비교", "1년 전 같은 때와 비교"], ["흐름이 빨리 보임", "계절 영향이 빠짐"], ["계절 영향이 섞임", "바뀜이 느리게 보임"]], ["비교 대상이 다름", "장점이 다름", "단점이 다름"]),
    ("GDP와 GNI의 차이", ["GDP", "GNI"], [["나라 안 기준", "국민 기준"], ["나라 안에서 만든 값", "국민이 번 소득의 합"], ["외국인 생산도 포함", "해외 소득도 포함"]], ["범위가 다름", "정의가 다름", "포함이 다름"]),
    ("CPI와 PCE의 차이", ["CPI", "PCE"], [["가계 구매 기준", "지출 기준"], ["소비자물가지수", "개인소비지출 물가"], ["가계가 사는 값", "연준이 중시"]], ["기준이 다름", "이름이 다름", "쓰는 곳이 다름"]),
    ("소비자물가와 근원물가의 차이", ["소비자물가", "근원물가"], [["모든 품목 평균", "변동 큰 것 제외"], ["에너지 · 식료품 포함", "에너지 · 식료품 뺌"], ["체감에 가까움", "기조적 흐름을 봄"]], ["품목이 다름", "포함이 다름", "쓰임이 다름"]),
]


def gen_pair(j):
    F = Fx()
    Y, mm = lasty("ca"), lastm("ca")
    if j in (0, 1):
        kd = "ytd" if j == 0 else "year"
        a, b = (Y - 1, Y) if j == 0 else (Y - 2, Y - 1)
        mmx = mm if j == 0 else None
        fa, fb = agg_period(kd, a, mmx), agg_period(kd, b, mmx)
        la, lb = plabel(kd, a, mmx), plabel(kd, b, mmx)
        ta, tb = fa("ca"), fb("ca")
        L = {"head": la, "tag": "이전", "body": f"경상수지 {f(ta)}억 달러", "wells": [f"상품수지 {f(fa('goods'))}억 달러", f"서비스수지 {f(fa('serv'))}억 달러"]}
        R = {"head": lb, "tag": "이후", "body": f"경상수지 {f(tb)}억 달러", "wells": [f"상품수지 {f(fb('goods'))}억 달러", f"서비스수지 {f(fb('serv'))}억 달러"]}
        title = f"경상수지 1~{mm}월, {a}→{b}년" if j == 0 else f"경상수지, {a}년에서 {b}년으로"
        F.agg("ca", f"pair_{kd}_{a}", la, ta)
        F.agg("ca", f"pair_{kd}_{b}", lb, tb)
        keys, asof = ["ca"] + COMP, last("ca")
        ribbon = "올해" if j == 0 else "전년"
        concl = f"경상수지는 {sg(tb - ta)}억 달러 달라졌음"
        head = f"경상수지는 {la} {f(ta)}억 달러에서 {lb} {f(tb)}억 달러로 {sg(tb - ta)}억 달러 달라졌음"
        pts = [f"상품수지 {f(fa('goods'))} → {f(fb('goods'))}억 달러", f"서비스수지 {f(fa('serv'))} → {f(fb('serv'))}억 달러"]
    elif j == 2:
        lp = min(last("krrate"), last("fedfunds"), last("krcpi"), last("uscpi"))
        g = val("krrate", lp) - val("fedfunds", lp)
        L = {"head": "한국", "tag": lp, "body": f"기준금리 {f(val('krrate', lp), 2)}%", "wells": [f"물가 {f(val('krcpi', lp))}%"]}
        R = {"head": "미국", "tag": lp, "body": f"정책금리 {f(val('fedfunds', lp), 2)}%", "wells": [f"물가 {f(val('uscpi', lp))}%"]}
        title = "한국과 미국의 금리 · 물가"
        for k in ("krrate", "fedfunds", "krcpi", "uscpi"):
            F.pt(k, lp)
        keys, asof = ["krrate", "fedfunds", "krcpi", "uscpi"], lp
        ribbon = "미국"
        concl = f"기준금리는 한국이 {f(abs(g), 2)}%p {'낮음' if g < 0 else '높음'}"
        head = f"{lp} 한국 기준금리는 미국 정책금리보다 {f(abs(g), 2)}%p {'낮은 수준' if g < 0 else '높은 수준'}임"
        pts = [f"한국 물가 {f(val('krcpi', lp))}%", f"미국 물가 {f(val('uscpi', lp))}%"]
    else:
        lp = min(last("unrate"), last("uscpi"))
        pa = pm(lp, -12)
        L = {"head": "1년 전", "tag": pm(lp, -12), "body": f"실업률 {f(val('unrate', pm(lp, -12)))}%", "wells": [f"물가 {f(val('uscpi', pa))}%"]}
        R = {"head": "지금", "tag": lp, "body": f"실업률 {f(val('unrate', lp))}%", "wells": [f"물가 {f(val('uscpi', lp))}%"]}
        title = "미국 실업률 · 물가, 1년 전과 지금"
        F.pt("unrate", lp)
        F.pt("uscpi", lp)
        F.pt("unrate", pm(lp, -12))
        keys, asof = ["unrate", "uscpi"], lp
        ribbon = "지금"
        d = val("unrate", lp) - val("unrate", pm(lp, -12))
        concl = f"실업률은 1년 새 {sg(d)}%p 달라졌음"
        head = f"미국 실업률은 1년 전 {f(val('unrate', pm(lp, -12)))}%에서 {f(val('unrate', lp))}%로 {sg(d)}%p 달라졌음"
        pts = [f"물가 {f(val('uscpi', pa))}% → {f(val('uscpi', lp))}%", "물가는 전년 동월 대비 상승률"]
    sl = {"kind": "compare", "style": "pair", "part": 16, "title": title, "left": L, "right": R, "ribbon": ribbon, "concl": {"text": concl, "tone": "dark", "style": "pill"},
          "source": SRC(keys, asof), "read": rd(head, pts, keys, asof)}
    ent("compare", "compare-pair", title, [L["head"], R["head"], "전후"], sl, F)


def gen_compare(i):
    if 4 <= i < 8:
        return gen_pair(i - 4)
    if i >= 8:
        i = i - 2
    if i < 4:
        t, hd, rows, notes = ROWS[i]
        slide = {"kind": "compare", "style": "rows", "part": 16, "title": t, "heads": hd, "rows": rows, "notes": notes,
                 "read": {"head": f"{eun(hd[0])} 왼쪽 줄, {eun(hd[1])} 오른쪽 줄로 견주어 구분하는 개념임", "points": [f"{hd[0]}: {rows[0][0]}", f"{hd[1]}: {rows[0][1]}"], "source": "ECOM 용어 풀이(terms/glossary.json)"}}
        ent("compare", "compare-rows", t, [hd[0], hd[1], "개념"], slide, None)
        return
    t, l, r, vs = COMPARE[i]
    slide = {"kind": "compare", "part": 16, "title": t if len(t) <= 25 else t[:25], "left": {"head": l[0], "tag": l[1], "points": l[2]}, "right": {"head": r[0], "tag": r[1], "points": r[2]}, "vs": vs,
             "read": {"head": f"{eun(l[0])} 「{l[1]}」, {eun(r[0])} 「{r[1]}」으로 구분되는 개념임", "points": [f"{l[0]}: {l[1]}", f"{r[0]}: {r[1]}"], "source": "ECOM 용어 풀이(terms/glossary.json)"}}
    ent("compare", "compare", t, [l[0], r[0], "개념"], slide, None)


# ───────────────────────── diagram ─────────────────────────
def it(h, b=""):
    return {"head": h, "body": b} if b else {"head": h}


def W(h, *parts):
    return {"head": h, "parts": list(parts)}


DIAGRAMS = [
    ("flow", "경상수지가 만들어지는 순서", [it("거래", "물건 · 서비스를 사고팖"), it("집계", "한국은행이 자료를 모음"), it("조정", "소유권이 바뀐 때로 맞춤"), it("공개", "월별 숫자로 공개")], {"style": "pill"}),
    ("flow", "물가가 금리를 움직이는 길", [it("물가", "물가가 오름"), it("금리", "기준금리를 올림"), it("이자", "대출 이자가 늘어남"), it("수요", "소비 · 투자가 둔해짐")], {"style": "pill"}),
    ("flow", "통계 숫자가 고쳐지는 순서", [it("속보", "첫 추정치 공개"), it("잠정", "자료를 더해 고침"), it("확정", "최종 숫자로 정함")], {"style": "pill"}),
    ("columns", "경상수지는 네 가지의 합", [it("상품", "물건 판 돈 − 산 돈"), it("서비스", "여행 · 운송 · 특허료"), it("본원소득", "배당 · 이자 · 임금"), it("이전소득", "대가 없이 오간 돈")], {"op": "+", "style": "card"}),
    ("columns", "GDP는 세 가지 면이 같음", [it("생산", "누가 만들었나"), it("분배", "누가 나눠 가졌나"), it("지출", "누가 썼나")], {"op": "=", "style": "card"}),
    ("columns", "물가를 보는 세 가지 눈", [it("소비자물가", "가계가 사는 값"), it("근원물가", "식료품 · 에너지 뺀 값"), it("PCE", "연준이 보는 물가")], {"style": "card"}),
    ("columns", "금리가 닿는 세 곳", [it("대출", "이자 부담이 바뀜"), it("예금", "이자 수익이 바뀜"), it("환율", "자금 이동이 바뀜")], {"style": "card"}),
    ("columns", "고용을 보는 세 숫자", [it("실업률", "일자리 찾는 비율"), it("취업자", "일하는 사람 수"), it("임금", "받는 돈")], {"style": "card"}),
    ("columns", "환율을 움직이는 세 힘", [it("금리차", "돈이 몰리는 방향"), it("무역", "수출입 균형"), it("심리", "위험을 피하려는 마음")], {"style": "card"}),
    ("hub", "경상수지의 네 갈래", [it("상품", "물건"), it("서비스", "여행 · 운송"), it("본원소득", "배당 · 이자"), it("이전소득", "송금 · 원조")], {"center": "경상수지"}),
    ("hub", "기준금리가 닿는 곳", [it("대출", "대출 이자"), it("예금", "예금 이자"), it("환율", "자금 이동"), it("물가", "수요 조절")], {"center": "기준금리"}),
    ("hub", "고용지표를 이루는 것", [it("실업률", "일자리 찾는 비율"), it("취업자", "일하는 사람 수"), it("임금", "받는 돈"), it("구인", "빈 일자리")], {"center": "고용"}),
    ("hub", "물가를 이루는 것", [it("식료품", "먹거리 값"), it("에너지", "기름 · 전기 값"), it("서비스", "외식 · 교통 값"), it("주거", "집세 · 관리비")], {"center": "물가"}),
    ("hub", "환율에 닿는 것", [it("금리차", "돈이 향하는 곳"), it("무역", "수출입 균형"), it("자본", "투자 자금"), it("심리", "위험을 피하는 마음")], {"center": "환율"}),
    ("modules", "성장 × 물가 네 칸", [it("골디락스", "성장 높고 물가 낮음"), it("과열", "성장 높고 물가 높음"), it("침체", "성장 낮고 물가 낮음"), it("스태그", "성장 낮고 물가 높음")], {"cols": 2}),
    ("modules", "수준 × 방향으로 읽기", [it("완화", "높고 내리는 중"), it("주의", "높고 오르는 중"), it("정상화", "낮고 오르는 중"), it("약세", "낮고 내리는 중")], {"cols": 2}),
    ("modules", "지표를 볼 때 묻는 셋", [it("얼마인가", "지금 값과 단위"), it("얼마나 바뀌었나", "전월 · 전년 비교"), it("왜 바뀌었나", "구성 항목 분해")], {"cols": 3}),
    ("timeline", "지표 읽기 다섯 단계", [it("확인", "정의와 단위"), it("비교", "전년 · 전월"), it("분해", "구성 항목"), it("원인", "움직인 이유"), it("결론", "한 줄 정리")], {"style": "chevron"}),
    ("timeline", "통계 숫자의 한살이", [it("속보", "첫 공개"), it("잠정", "보완"), it("확정", "최종"), it("개편", "기준 바꿈")], {"style": "chevron"}),
    ("timeline", "금리가 경제에 닿는 차례", [it("결정", "기준금리 정함"), it("시장", "시장금리 움직임"), it("대출", "대출 · 예금 이자"), it("지출", "소비 · 투자"), it("물가", "물가 반영")], {"style": "chevron"}),
    ("wells", "물가가 성장으로 번지는 길", [W("물가", "오름", "가계 부담"), W("소비", "줄임", "지출 조정"), W("성장", "둔화", "수요 약해짐")], {}),
    ("wells", "금리가 대출로 닿는 길", [W("기준금리", "정책 결정", "발표"), W("시장금리", "채권", "대출"), W("가계", "이자", "부담")], {}),
    ("wells", "통계 숫자가 확정되는 길", [W("속보", "첫 추정"), W("잠정", "자료 보완"), W("확정", "최종 숫자")], {}),
    ("wells", "수출이 경상수지로 모이는 길", [W("수출", "상품", "서비스"), W("수입", "상품", "서비스"), W("소득", "배당", "이자"), W("경상수지", "네 항목의 합")], {}),
    ("tiers", "지표를 읽는 세 단계", [it("원인", "왜 그런가"), it("변화", "얼마나 바뀌었나"), it("수준", "지금 얼마인가")], {"shape": "pyramid"}),
    ("tiers", "숫자 읽기 네 층", [it("의미", "그래서 무엇인가"), it("비교", "무엇과 견주나"), it("변화율", "얼마나 바뀌었나"), it("값", "지금 숫자")], {"shape": "pyramid"}),
    ("tiers", "금리가 퍼지는 세 층", [it("정책금리", "중앙은행이 정함"), it("시장금리", "시장에서 정해짐"), it("대출금리", "가계가 체감")], {"shape": "stairs"}),
    ("tiers", "통계 신뢰의 네 계단", [it("확정", "최종 숫자"), it("잠정", "자료 보완"), it("속보", "첫 추정"), it("전망", "예상치")], {"shape": "stairs"}),
    ("cycle", "금리와 경기의 순환", [it("인하", "기준금리를 내림"), it("회복", "소비 · 투자가 늘어남"), it("과열", "물가가 오름"), it("인상", "기준금리를 올림"), it("둔화", "경기가 식음")], {"center": "경기"}),
    ("cycle", "임금과 물가의 맞물림", [it("임금", "임금이 오름"), it("소비", "쓰는 돈이 늘어남"), it("물가", "물건 값이 오름"), it("요구", "더 올려 달라 함")], {"center": "물가"}),
    ("venn", "경기 판단의 세 요소", [it("성장"), it("물가"), it("고용")], {"center": "경기"}),
    ("venn", "금리 · 환율 · 물가", [it("금리"), it("환율"), it("물가")], {"center": "서로 영향"}),
]


def gen_circles(j):
    F = Fx()
    Y, mm = lasty("ca"), lastm("ca")
    if j == 0:
        c, g, pn = ytd("ca", Y, mm), ytd("goods", Y, mm), ytd("pinc", Y, mm)
        items = [{"head": "경상수지", "value": rnd(c, 1), "unit": "억 달러"}, {"head": "본원소득", "value": rnd(pn, 1), "unit": "억 달러"}]
        title = f"본원소득은 경상수지의 {f(pn / c * 100, 0)}%"
        nest, hero = True, 0
        F.agg("goods", f"circ_ytd_{Y}", f"{Y}.01~{Y}.{mm:02d}", g)
        F.agg("ca", f"circ_ytd_{Y}", f"{Y}.01~{Y}.{mm:02d}", c)
        keys = ["ca", "pinc"]
        head = f"{Y}년 1~{mm}월 누적은 경상수지 {f(c)}억 달러, 본원소득 {f(pn)}억 달러임"
    elif j == 1:
        ys = [Y - 1, Y - 2, Y - 3]
        vs = [ytd("ca", y, 12) for y in ys]
        items = [{"head": f"{y}년", "value": rnd(v, 1), "unit": "억 달러"} for y, v in zip(ys, vs)]
        title = f"{ys[0]}년 경상수지는 {ys[2]}년의 {f(vs[0] / vs[2])}배"
        nest, hero = False, 0
        F.agg("ca", f"circ_year_{ys[0]}", f"{ys[0]}", vs[0])
        keys = ["ca"]
        head = f"경상수지 연간은 {ys[0]}년 {f(vs[0])}억 달러, {ys[1]}년 {f(vs[1])}억 달러, {ys[2]}년 {f(vs[2])}억 달러임"
    elif j == 2:
        w = tail("fx", 36)
        mx, mn = max(w, key=lambda x: x[1]), min(w, key=lambda x: x[1])
        items = [{"head": f"최고 {mx[0]}", "value": rnd(mx[1], 0), "unit": "원"}, {"head": f"최저 {mn[0]}", "value": rnd(mn[1], 0), "unit": "원"}]
        title = f"환율 최고는 최저보다 {f((mx[1] / mn[1] - 1) * 100, 0)}% 높음"
        nest, hero = False, 0
        F.pt("fx", mx[0])
        F.pt("fx", mn[0])
        keys = ["fx"]
        head = f"최근 36개월 월평균 환율은 {mx[0]} {f(mx[1], 0)}원이 최고, {mn[0]} {f(mn[1], 0)}원이 최저임"
    else:
        qn = mm // 3
        qs = [sum(val("ca", f"{Y}.{x:02d}") for x in range(3 * q - 2, 3 * q + 1)) for q in range(1, qn + 1)]
        items = [{"head": f"{q}분기", "value": rnd(v, 1), "unit": "억 달러"} for q, v in enumerate(qs, 1)]
        title = f"{qn}분기가 1분기의 {f(qs[-1] / qs[0])}배"
        nest, hero = False, qn - 1
        F.agg("ca", f"circ_q{qn}_{Y}", f"{Y}.Q{qn}", qs[-1])
        keys = ["ca"]
        head = f"{Y}년 경상수지 분기 합은 " + ", ".join(f"{q}분기 {f(v)}억 달러" for q, v in enumerate(qs, 1)) + "임"
    asof = last("ca") if keys[0] != "fx" else last("fx")
    if nest:
        vs = [x["value"] for x in items]
        assert max(vs) / min(vs) > 2, title  # 거의 같은 값을 포함 관계로 그리지 않음
    sl = {"kind": "diagram", "part": 17, "title": title, "layout": "circles", "items": items, "nest": nest, "hero": hero, "source": SRC(keys, asof),
          "read": rd(head, ["원 지름은 값의 제곱근에 비례", "양수 값만 비교"], keys, asof)}
    ent("diagram", "diagram-circles" + ("-nest" if nest else ""), f"크기 원 {len(items)}개" + (" · 포함" if nest else ""), ["도식", "circles"], sl, F)


def gen_diagram(i):
    if i >= len(DIAGRAMS):
        return gen_circles(i - len(DIAGRAMS))
    lay, title, items, extra = DIAGRAMS[i]
    slide = {"kind": "diagram", "part": 17, "title": title, "layout": lay, "items": items}
    slide.update(extra)
    if lay in ("flow", "cycle", "timeline"):
        slide["steps"] = True
    if slide.get("style") == "pill":
        for j, x in enumerate(items):
            x["note"] = f"{j + 1}단계"
        slide["now"] = i % len(items)
    if slide.get("style") == "card":
        for x in items:
            x["tags"] = [f"#{x['head']}"]
    if slide.get("style") == "chevron":
        slide["now"] = len(items) - 1
    if lay == "wells":
        heads = " → ".join(x["head"] for x in items)
    else:
        heads = " → ".join(x["head"] for x in items) if lay in ("flow", "timeline", "cycle", "tiers") else " · ".join(x["head"] for x in items)
    slide["read"] = {"head": f"{eul(title)} {len(items)}칸 도식으로 정리한 개념임", "points": [f"구성: {heads}", f"배치: {lay}"], "source": "ECOM 개념 정리(경제 기초)"}
    pat = f"diagram-{lay}" + (f"-{slide['style']}" if slide.get("style") else "")
    ent("diagram", pat, f"{lay}{'/' + slide['style'] if slide.get('style') else ''} {len(items)}칸 · {title}", ["도식", lay, "개념"], slide, None)


# ───────────────────────── question ─────────────────────────
QUESTIONS = [
    ("금리를 올리면 원화 값은?", ["오름", "내림", "그대로"], "금리와 환율의 관계는 상황마다 달라 토의하기 좋은 질문임"),
    ("경상수지 흑자가 커지면 환율은?", ["원화 강세 쪽", "원화 약세 쪽", "관계 없음"], "흑자와 환율의 연결 고리를 손들기로 확인하는 질문임"),
    ("실업률이 낮으면 물가는?", ["오르는 쪽", "내리는 쪽", "관계 없음"], "고용과 물가의 관계에 대한 각자 생각을 모으는 질문임"),
    ("다음 회차에 먼저 볼 지표는?", ["물가", "고용", "금리"], "다음 회차 주제를 참석자가 고르는 질문임"),
    ("경기가 좋다는 신호로 먼저 볼 것은?", ["고용", "소비", "수출"], "무엇을 먼저 보는지 견해가 갈리는 질문임"),
    ("서비스수지 적자, 걱정해야 할까?", ["걱정", "괜찮음", "더 봐야 함"], "서비스수지 적자의 의미를 토의로 짚는 질문임"),
]


def gen_question(i):
    q, op, why = QUESTIONS[i]
    slide = {"kind": "question", "part": 18, "title": q, "options": op, "read": {"head": why, "points": ["손든 수를 눌러 셈", "정답이 하나로 정해지지 않는 질문임"], "source": "ECOM 토의 질문"}}
    assert slide["read"]["head"].endswith("임") or slide["read"]["head"].endswith("함")
    ent("question", "question", q, ["토의", "질문"], slide, None)


# ───────────────────────── 표지 · 간지 · 끝 ─────────────────────────
def gen_frame(i):
    today = GOT[:10]
    defs = [
        ("cover", {"kind": "cover", "title": "경제지표101 · 대외", "sub": "나라 밖에서 번 돈의 성적표", "date": today}),
        ("cover", {"kind": "cover", "title": "금리와 물가 읽는 법", "sub": "한미 숫자 나란히 보기", "date": today}),
        ("part", {"kind": "part", "part": 1, "name": "경상수지", "desc": "나라 밖에서 번 돈의 성적표"}),
        ("part", {"kind": "part", "part": 2, "name": "금리 · 물가", "desc": "돈값과 물건값의 관계"}),
        ("end", {"kind": "end", "title": "다음 회차 : 물가지표", "sub": "소비자물가 읽는 법"}),
        ("end", {"kind": "end", "title": "다음 회차 : 고용지표", "sub": "실업률과 일자리 숫자"}),
    ]
    pat, sl = defs[i]
    sl["part"] = sl.get("part", 19) if pat == "part" else 0
    ent("frame", f"frame-{pat}", {"cover": "표지", "part": "간지", "end": "끝"}[pat] + f" {i % 2 + 1}", ["표지" if pat == "cover" else "간지" if pat == "part" else "끝"], sl, None)


PLAN = [("kpi", 30, gen_kpi), ("table", 24, gen_table), ("bar", 18, gen_bar), ("combo", 6, gen_combo), ("race", min(18, len(race_cases())), gen_race), ("zoom", 14, gen_zoom), ("minis", 4, gen_minis),
        ("wipe", 12, gen_wipe), ("slope", 15, gen_slope), ("rank", 12, gen_rank), ("morph", min(12, len(morph_cases())), gen_morph), ("split", 15, gen_split), ("bridge", 12, gen_bridge),
        ("waffle", 10, gen_waffle), ("donut", 5, gen_donut), ("headline", 24, gen_headline), ("drivers", 10, gen_drivers), ("term", 12, gen_term), ("compare", 14, gen_compare),
        ("diagram", 36, gen_diagram), ("question", 6, gen_question), ("frame", 6, gen_frame)]

FAMILY_PART = {fam: n for n, (fam, _, _) in enumerate(PLAN, 1)}
FAMILY_NAME = {"combo": "막대 + 선", "minis": "미니 차트", "donut": "도넛", "kpi": "지표 카드", "table": "표", "bar": "막대", "race": "누적 경주", "zoom": "확대", "wipe": "쓸어 비교", "slope": "기울기", "rank": "순위", "morph": "묶어 쌓기",
               "split": "나눠 보기", "bridge": "증감 다리", "waffle": "100칸", "headline": "결론 문장", "drivers": "요인", "term": "용어(부록)", "compare": "비교", "diagram": "도식",
               "question": "토의 질문", "frame": "표지 · 간지 · 끝"}


ACCENTS = ["green", "blue", "violet", "coral", "amber", "mono"]
NOCONCL_KIND = ("cover", "part", "end")
HERO_DIAG = ("pill", "chevron")


def roles(sl):
    """강조 역할 수(같은 역할 되풀이는 하나) — eyebrow · key · 주인공 · 꼬리표/바뀐 쪽 · 결론 띠"""
    r = set()
    if sl.get("eyebrow"):
        r.add("eyebrow")
    if sl.get("key") and sl.get("keyStyle", "color") == "color":
        r.add("key")
    if "==" in (sl.get("text") or ""):
        r.add("key")
    k = sl["kind"]
    if k in ("chart", "kpi") or (k == "table" and ("hiCol" in sl or "rowHi" in sl)) or \
            (k == "diagram" and (sl.get("style") in HERO_DIAG or sl.get("layout") in ("wells", "tiers", "circles", "hub"))) or (k == "term" and sl.get("style") == "plate"):
        r.add("hero")
    if k == "compare" or (k == "diagram" and sl.get("style") == "card"):
        r.add("tag")
    c = sl.get("concl")
    if c and (c.get("tone") == "acc" or c.get("style") == "band"):
        r.add("concl")
    return r


def _num(x):
    return float(str(x).replace(",", "").replace("−", "-").replace("+", ""))


def _du(unit):
    return "%p" if unit == "%" else unit


def _d(v, unit, dec=1):
    """차이 값 글(부호 없이)"""
    if unit == "천 명":
        return wan(abs(v))
    return f(abs(v), dec) + ("" if unit in ("", "지수") else _du(unit))


def make_concl(e):
    """「그래서」 결론 문장(40자 안). 값 되풀이 · 단위 · 범례 · 주석이 아닌 풀이만. 없으면 None"""
    sl, pat, k = e["slide"], e["pattern"], e["slide"]["kind"]
    ch = sl.get("chart") or {}
    t = None
    try:
        if pat == "kpi-1":
            c = sl["cards"][0]
            m = re.match(r"(전월|전년 동기|전년 동월)비?\s*([+−-]?)([\d,.]+)(.*)", c["change"]["text"])
            if m:
                name = c["label"].rsplit(" ", 1)[0]
                t = f"{eun(name)} {m.group(1)}보다 {m.group(3)}{m.group(4)} {'늘었음' if c['change']['dir'] == 'up' else '줄었음'}".replace("%비", "%")
        elif pat.startswith("kpi-"):
            cs = sl["cards"]
            up = sum(1 for c in cs if c["change"]["dir"] == "up")
            t = f"{len(cs)}개 지표 중 {up}개가 비교 기준보다 올랐음"
        elif k == "table" and sl["cols"][0] == "분기":
            t = f"연율로 환산하면 약 {sl['rows'][-1][2]}% 수준임"
        elif k == "table" and sl["cols"][0] == "순위":
            u = sl["cols"][2]
            d = _num(sl["rows"][0][2]) - _num(sl["rows"][1][2])
            t = f"1위는 2위보다 {wan(d) if u == '천 명' else f(d, 1) + (u if u != '지수' else '')} 큼"
        elif k == "chart" and ch.get("type") == "bar":
            d = ch["series"][0]["data"]
            u = ch["unit"]
            diff = d[-1][1] - d[0][1]
            t = f"{len(d)}개월 새 {_d(diff, u, 1)} {'늘었음' if diff > 0 else '줄었음'}" if u not in ("지수", "원") else f"{len(d)}개월 새 {f(abs((d[-1][1] / d[0][1] - 1) * 100), 1)}% {'늘었음' if diff > 0 else '줄었음'}"
        elif k == "chart" and ch.get("type") == "zoom":
            d = [x for x in ch["series"][0]["data"] if ch["zoom"]["from"] <= x[0] <= ch["zoom"]["to"]]
            u = ch["unit"]
            diff = d[-1][1] - d[0][1]
            t = f"확대한 구간은 {_d(diff, u, 1)} {'늘어난' if diff > 0 else '줄어든'} 흐름임" if u not in ("지수", "원") else f"확대한 구간은 {f(abs((d[-1][1] / d[0][1] - 1) * 100), 1)}% {'늘어난' if diff > 0 else '줄어든'} 흐름임"
        elif k == "chart" and ch.get("type") == "combo":
            v = ch["line"][-1][1]
            t = f"마지막 값은 전년보다 {f(abs(v), 1)}% {'늘었음' if v > 0 else '줄었음'}"
        elif k == "chart" and ch.get("type") == "race":
            ref = ch["ref"]
            cum = sum(x[1] for x in ch["series"][1]["data"])
            if ch.get("mark"):
                t = f"{ch['mark']['at']}에 {ch['ref']['name']} 합을 넘어섰음"
            else:
                t = f"{ch['ref']['name']} 합의 {f(cum / ref['value'] * 100, 0)}%까지 채웠음"
        elif k == "chart" and ch.get("type") == "slope":
            pr = max(ch["pairs"], key=lambda x: abs(x["b"] - x["a"]))
            t = f"{i_ga(pr['label'])} {_d(pr['b'] - pr['a'], ch['unit'], 1)} {'늘어' if pr['b'] > pr['a'] else '줄어'} 가장 크게 바뀌었음"
        elif k == "chart" and ch.get("type") == "rank":
            d = sorted(ch["data"], key=lambda x: -x[1])
            t = f"1위 {d[0][0]}는 2위보다 {_d(d[0][1] - d[1][1], ch['unit'], 1)} 큼"
        elif k == "chart" and ch.get("type") == "morph":
            g = ch["group"]
            vs = [x[1] for x in ch["data"]]
            gs = [sum(vs[i:i + g]) for i in range(0, len(vs) - g + 1, g)]
            b = max(range(len(gs)), key=lambda i: gs[i])
            t = f"가장 큰 묶음이 연 누적의 {f(gs[b] / sum(gs) * 100, 0)}%를 차지함"
        elif k == "chart" and ch.get("type") == "bridge":
            tot = ch["end"]["value"] - ch["start"]["value"]
            bg = max(ch["steps"], key=lambda x: abs(x["value"]))
            t = f"총 증감 {sg(tot)}억 달러 중 {i_ga(bg['label'])} {sg(bg['value'])}억 달러"
        elif k == "drivers":
            it0 = sl["items"][0]
            t = f"가장 큰 몫은 {it0['text']} {it0['num']}"
        elif k == "term":
            t = f"쉽게 말해 {sl['like']}"
        elif pat == "compare-rows":
            t = f"핵심 차이: {sl['notes'][0]}"
        elif pat == "compare":
            t = f"갈림길은 「{sl['left']['tag']}」과 「{sl['right']['tag']}」"
        elif pat == "compare-pair":
            t = sl["concl"]["text"]
        elif k == "diagram":
            lay, st, it_ = sl["layout"], sl.get("style"), sl["items"]
            if lay == "circles":
                vs = [x["value"] for x in it_]
                t = f"가장 큰 값은 가장 작은 값의 {f(max(vs) / min(vs), 1)}배"
            elif lay in ("flow", "timeline"):
                t = f"{it_[0]['head']}부터 {it_[-1]['head']}까지 한 줄로 이어짐"
            elif lay == "columns":
                t = f"{len(it_)}가지를 함께 봐야 전체가 보임"
            elif lay == "hub":
                t = f"{len(it_)}갈래를 모두 봐야 {sl['center']} 전체가 보임"
            elif lay == "modules":
                t = f"{len(it_)}칸을 함께 읽어야 뜻이 완성됨"
            elif lay == "tiers":
                t = "아래 단계가 쌓여야 위 단계를 읽을 수 있음"
            elif lay == "wells":
                t = f"{it_[0]['head']}에서 시작해 {it_[-1]['head']}로 이어짐"
            elif lay == "cycle":
                t = "한 바퀴를 돌면 처음 자리로 돌아옴"
            elif lay == "venn":
                t = "겹치는 곳이 핵심 판단 지점임"
    except (KeyError, IndexError, ValueError, ZeroDivisionError):
        t = None
    if t and len(t) <= 40 and t != plain_of(sl):
        return t
    return None


UNITS = {"달러", "%", "원", "억", "억달러", "천", "명", "%p", "지수", "개월", "배", "분기", "월"}
WORDS = {"낮음", "높음", "큼", "작음", "오름", "내림", "좌우", "주역", "적자", "흑자"}


def pick_key(plain, mk):
    """결론의 핵심 낱말 : 표시한 낱말 > 숫자+단위(3,406.6억) > 바뀐 쪽 낱말 > 몇 분기. 없으면 None"""
    if mk and mk not in UNITS:
        return mk
    toks = [x.rstrip(",") for x in plain.split()]
    for t in toks:
        if re.search(r"\d", t) and re.search(r"(억|%p|%|원|배|개월)$", t) and not re.fullmatch(r"[\d.~]+월?", t):
            return t
    for t in toks:
        if t in WORDS:
            return t
    for t in toks:
        m = re.match(r"\d분기", t)
        if m:
            return m.group()
    for t in toks:  # 주인공 이름 · 기간
        if not re.search(r"\d", t) and len(t) >= 3 and t not in UNITS and not t.endswith(("는", "은", "이", "가", "의", "을", "를")):
            return t
    for t in toks:
        if re.fullmatch(r"\d{4}\.\d{2}|\d{4}\.Q\d", t):
            return t
    return None


def short_src(src):
    if " · 데이터월 " not in src:
        return src
    left, right = src.split(" · 데이터월 ", 1)
    left = left.replace("통계청 · ECOS", "통계청 ECOS")
    left = re.sub(r"\s*\d{3}Y\d{3}", "", left)
    left = re.sub(r"연준 세인트루이스 FRED \w+", "FRED", left)
    parts = []
    for x in left.split(" · "):
        if x not in parts and not (x == "한국은행 ECOS" and "ECOS" in parts):
            parts.append(x)
    if "한국은행 ECOS" in parts and "통계청 ECOS" in parts:
        parts = ["한국은행·통계청 ECOS"] + [x for x in parts if x not in ("한국은행 ECOS", "통계청 ECOS")]
    return " · ".join(parts) + " · 데이터월 " + right.split(" · ")[0]


def decorate():
    """디자인 문법 판 2 칸: theme · eyebrow · key · sub · concl · align · surface · band"""
    fams = list(FAMILY_PART)
    CT = {idx: make_concl(e) for idx, e in enumerate(ENTRIES)}
    last_of = {}
    for idx, e in enumerate(ENTRIES):
        if CT[idx]:
            last_of[e["family"]] = idx
    body = [x for x in ENTRIES if x["slide"]["kind"] not in NOCONCL_KIND]
    target = round(len(body) * 0.26)
    # 결론 띠 후보 : 묶음 마지막 · 요약(headline 3장에 1) · 핵심 숫자(kpi 1장 카드) · 나머지는 4장에 1
    cand = []
    for idx, e in enumerate(ENTRIES):
        sl, fam = e["slide"], e["family"]
        if sl["kind"] in NOCONCL_KIND or sl.get("concl") or not CT[idx]:
            continue
        pri = 3
        if idx == last_of.get(fam):
            pri = 0
        elif fam == "kpi" and len(sl["cards"]) == 1:
            pri = 2
        cand.append((pri, idx))
    chosen = set(i for pr, i in cand if pr < 3)
    extra = [i for pr, i in cand if pr == 3 and i % 4 == 0]
    for i in extra:
        if len(chosen) + sum(1 for x in ENTRIES if x["slide"].get("concl")) >= target:
            break
        chosen.add(i)
    nconcl_pre = sum(1 for x in ENTRIES if x["slide"].get("concl"))
    topn = 0
    nband = 0
    for idx, e in enumerate(ENTRIES):
        sl, fam = e["slide"], e["family"]
        if sl["kind"] in NOCONCL_KIND:
            continue
        sl["theme"] = {"accent": ACCENTS[fams.index(fam) % 6]}
        pno = FAMILY_PART[fam]
        sl["eyebrow"] = ("부록 " + sl["appendix"]) if fam == "term" else f"PART {pno} › {FAMILY_NAME[fam]}"
        plain = plain_of(sl)
        # 부제 : 숫자 장은 데이터월
        src = sl.get("source", "")
        if e["facts"] and "sub" not in sl and sl["kind"] != "kpi" and "데이터월" in src:
            sl["sub"] = "데이터월 " + src.split("데이터월 ")[1].split(" ·")[0]
        # 결론 띠
        pts = (sl.get("read") or {}).get("points") or []
        if idx in chosen and not sl.get("concl"):
            text = CT[idx]
            if text:
                style, tone = "pill", "dark"
                if idx == last_of.get(fam) and nband < 8:
                    style, tone, nband = "band", "acc", nband + 1
                elif sl["kind"] in ("diagram", "compare", "table") and topn < 8:
                    style, topn = "top", topn + 1
                sl["concl"] = {"text": text, "tone": tone, "style": style}
        # 가운데 정렬 · 면 · 머리띠
        if fam == "question" or (fam == "term" and sl.get("style") == "plate") or (fam == "headline" and idx % 3 == 1 and "aside" not in sl):
            sl["align"] = "center"
        if fam in ("term", "question") or (fam == "headline" and idx % 2 == 0):
            sl["surface"] = "open"
        elif sl["kind"] == "diagram" and sl.get("layout") == "wells" or (fam == "table" and idx % 5 == 0):
            sl["surface"] = "well"
        if (sl["kind"] in ("compare", "diagram") and sl.get("style") in ("rows", "card", "pair") and idx % 2 == 0) or (fam == "table" and idx % 7 == 0):
            sl["band"] = "head"
        # 제목 key : 57% 안팎(색) · 일부는 굵기 · 나머지는 없음 — 역할 3 이하 안에서
        t = sl.get("title")
        if t is not None:
            mk = re.findall(r"\*\*(.+?)\*\*|\^\^(.+?)\^\^", t)
            sl["title"] = plain
            key = pick_key(plain, [a or b for a, b in mk][0] if mk else None)
            if key:
                assert key in plain, (plain, key)
            slot = idx % 14
            if not key:
                pass
            elif slot < 8:
                sl["key"] = key
                if len(roles(sl)) > 3:
                    if sl.get("concl", {}).get("tone") == "acc" or sl.get("concl", {}).get("style") == "band":
                        pass
                    del sl["key"]
            elif slot == 8:
                sl["key"], sl["keyStyle"] = key, "weight"
        if sl.get("concl") and sl.get("source"):
            sl["source"] = short_src(sl["source"])
        # 역할 3 초과 : 결론 띠 강조를 내림
        if len(roles(sl)) > 3 and sl.get("concl"):
            sl["concl"]["tone"], sl["concl"]["style"] = "dark", ("pill" if sl["concl"]["style"] == "band" else sl["concl"]["style"])
        while len(roles(sl)) > 3 and sl.get("key"):
            del sl["key"]
            sl.pop("keyStyle", None)
    # 결론 문장 장 : 형광 칠 · 문장 속 알약
    hl = [e for e in ENTRIES if e["family"] == "headline" and e["pattern"] == "headline"]
    for n, e in enumerate(hl):
        sl = e["slide"]
        if n % 6 == 2 and sl.get("key") and sl["key"] in sl["text"]:
            sl["text"] = sl["text"].replace(sl["key"], "==" + sl["key"] + "==", 1)
            sl.pop("key", None)
            sl.pop("keyStyle", None)
        elif n % 8 == 5 and sl.get("key") and sl["key"] in sl["text"]:
            sl["text"] = sl["text"].replace(sl["key"], "{{" + sl["key"] + "}}", 1)
            sl.pop("key", None)
            sl.pop("keyStyle", None)


def plain_of(sl):
    return strip(sl.get("title") or sl.get("text") or "")


def main():
    for fam, n, g in PLAN:
        for i in range(n):
            g(i)
    decorate()
    out = []
    counts = {}
    for idx, e in enumerate(ENTRIES, 1):
        e = dict(e)
        e["id"] = f"M{idx:03d}"
        e["slide"]["part"] = e["slide"]["part"] if e["family"] in ("term", "frame") and e["slide"].get("part") is not None else FAMILY_PART[e["family"]]
        if e["family"] == "frame":
            e["slide"]["part"] = 0 if e["slide"]["kind"] != "part" else e["slide"]["part"]
        e["slide"]["note"] = f"{e['id']} · {e['pattern']} · {e['variant']}"
        out.append({k: e[k] for k in ("id", "pattern", "family", "variant", "title", "tags", "slide", "facts")})
        counts[e["family"]] = counts.get(e["family"], 0) + 1
    (OUT / "mockups.json").write_text(json.dumps({"got": GOT, "family_names": FAMILY_NAME, "family_part": FAMILY_PART, "mockups": out}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(len(out), counts)


if __name__ == "__main__":
    main()
