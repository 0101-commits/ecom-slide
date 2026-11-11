# 목업 3판 변환 — 차트 부품 13묶음(race · zoom · wipe · slope · rank · morph · split · bridge · waffle · donut · minis · combo · drivers)
# 판 2 목업 숫자만 씀(합 · 평균 · 비율 · 증감은 그 숫자로 계산, 각주에 ECOM 계산). 헤드메시지는 숫자로 새로 씀.
import re
from mock3_lib import nf, du, ulab, josa, group_of, foot, fit_head, hlen, has_batchim, MINUS

NB = " "   # 숫자와 단위 사이가 줄 끝에서 갈라지지 않게
FULL = {"본원소득": "본원소득수지", "이전소득": "이전소득수지", "미국 고용 증감": "미국 비농업 고용 증감", "미국 물가": "미국 소비자물가 상승률",
        "한국 물가": "한국 소비자물가 상승률", "미국 정책금리": "미국 정책금리(실효)", "미국 10년물": "미국 국채 10년물 금리", "미국 2년물": "미국 국채 2년물 금리",
        "미국 산업생산": "미국 산업생산지수", "한국 물가 상승": "한국 소비자물가 상승률", "미국 물가 상승": "미국 소비자물가 상승률"}


def full(n):
    n = str(n).strip()
    return FULL.get(n, n)


def eb(group, topic, basis):
    return {"group": group, "topic": topic, "basis": basis}


def pj(word, pair):
    """조사만 : 괄호 앞 낱말 기준"""
    a, b = pair.split("/")
    return a if has_batchim(word) else b


def hu(unit):
    return ulab(unit).replace(" ", NB)


def V(v, d, unit, sign=False):
    """헤드메시지용 숫자 + 단위(붙임 띄어쓰기)"""
    return nf(v, d, sign) + hu(unit)


def fix_ro(h):
    """숫자 · 단위 뒤 「로」를 받침에 맞게(원 · 명 · 0 · 3 · 6 → 으로)"""
    return re.sub(r"([0-9원명%p])(\*\*)?로(?=[\s,*]|$)", lambda m: m.group(1) + (m.group(2) or "") + ("으로" if m.group(1) in "036원명" else "로"), h)


def H(*cands):
    """헤드메시지 고르기 : 50~84자(2줄 넉넉히) 먼저, 없으면 50~90자, 그다음 가장 가까운 것"""
    cs = [fix_ro(c) for c in cands if c]
    for c in cs:
        if 50 <= hlen(c) <= 84:
            return c
    return fit_head(*cs)


def dec_for(unit, d=None, name=""):
    if unit == "%":
        return 2 if re.search(r"금리|10년물|2년물", name) else 1
    if unit == "천 명":
        return 0
    return 1 if d is None else max(0, min(2, d))


def prec(vals):
    """값들에 실제로 쓰인 소수 자리(0~2)"""
    best = 0
    for v in vals:
        if v is None:
            continue
        for k in (0, 1, 2):
            if abs(round(v, k) - v) < 1e-9:
                best = max(best, k)
                break
        else:
            best = 2
    return best


def pts(data):
    return [str(p[0]) for p in data], [None if p[1] is None else float(p[1]) for p in data]


def yr(n):
    return f"{n}년" if re.fullmatch(r"\d{4}", str(n)) else str(n)


def asof_of(s):
    m = re.search(r"(\d{4}\.\d{2})", s.get("sub", "") or "")
    return m.group(1) if m else ""


def flow(unit):
    return unit in ("억 달러", "천 명")


def bigw(unit, up):
    return ("컸" if up else "작았") if flow(unit) else ("높았" if up else "낮았")


def chg(unit, up):
    return ("늘었" if up else "줄었") if flow(unit) else ("올랐" if up else "내렸")


def ym_add(p, k):
    y, m = map(int, p.split("."))
    t = y * 12 + (m - 1) + k
    return f"{t // 12}.{t % 12 + 1:02d}"


def short(p):
    m = re.fullmatch(r"(\d{4})\.(\d{2})", p)
    return f"{int(m.group(2))}월" if m else p


# ───── race : 누적 두 선 ─────
def conv_race(m):
    s = m["slide"]
    ch = s["chart"]
    unit = ch.get("unit", "")
    name = full(re.match(r"^(.*?)\s+\d{4}년", m["variant"]).group(1))
    d = dec_for(unit, ch.get("decimals"), name)
    s0, s1 = ch["series"][0], ch["series"][1]
    y0, y1 = yr(s0["name"]), yr(s1["name"])
    _, v0 = pts(s0["data"])
    l1, v1 = pts(s1["data"])
    c0, c1, a = [], [], 0.0
    for v in v0:
        a += v
        c0.append(a)
    a = 0.0
    for v in v1:
        a += v
        c1.append(a)
    ref = c0[-1]
    n1 = len(v1)
    m1 = int(l1[-1][5:7])
    same = c0[n1 - 1]
    cross = next((i for i, v in enumerate(c1) if v >= ref), None)
    per = "연간" if n1 == 12 else f"1~{m1}월"
    ratio = c1[-1] / same if same > 0 else None
    pct = (c1[-1] / same - 1) * 100 if same > 0 else None
    heads = []
    if cross is not None:
        tail = (f"{per} 누적 {V(c1[-1], d, unit)}로 {y0}보다 {nf(pct, 1)}% 많음" if n1 == 12 else
                f"{per} 누적 {V(c1[-1], d, unit)}로 {y0} 같은 기간의 {ratio:.1f}배임" if ratio and ratio >= 1.5 else
                f"{per} 누적 {V(c1[-1], d, unit)}로 {y0} 같은 기간보다 {nf(pct, 1)}% 많음")
        heads += [f"{y1} {name} 누적은 **{cross + 1}월에 {y0} 연간({V(ref, d, unit)})을 넘었으며**, {tail}",
                  f"{y1} {name} 누적은 **{cross + 1}월에 {y0} 연간을 넘었으며**, {tail}"]
    elif n1 == len(v0):
        share = c1[-1] / ref * 100 if ref else 0
        heads += [f"{y1} {name}{pj(name, '은/는')} 연간 **{V(c1[-1], d, unit)}**로 {y0}({V(ref, d, unit)})보다 {V(abs(ref - c1[-1]), d, unit)} {'적었' if c1[-1] < ref else '많았'}으며, {y0}의 {share:.1f}% 수준임"]
    else:
        share = c1[-1] / ref * 100 if ref else 0
        cmp = ("" if pct is None else f", 같은 기간 {y0}보다 {nf(abs(pct), 1)}% {'많음' if pct >= 0 else '적음'}")
        heads += [f"{y1} {name} 누적은 {per} **{V(c1[-1], d, unit)}**로 {y0} 연간({V(ref, d, unit)})의 {share:.1f}%이며{cmp}" + ("" if cmp else "임"),
                  f"{y1} {name} 누적은 {per} **{V(c1[-1], d, unit)}**로 {y0} 연간의 {share:.1f}%{'이며' + cmp if cmp else '임'}"]
    gsub = f"같은 기간 {ratio:.1f}배" if ratio and ratio >= 1.5 else (f"같은 기간 대비 {nf(pct, 1, True)}%" if pct is not None else "")
    sl = {"kind": "race", "eyebrow": eb(group_of(name), f"{y0} · {y1} 월별 누적 {name}", f"1월부터 누적, 단위: {unit}"), "head": H(*heads),
          "series": [{"name": y0, "data": [round(v, 3) for v in v0]}, {"name": y1, "data": [round(v, 3) for v in v1]}], "unit": ulab(unit), "dec": d,
          "ref": {"value": "auto", "name": f"{y0} 연간"}, "gap": {"sub": gsub} if gsub else {},
          "foot": foot(s.get("source", ""), ["월 값을 1월부터 더한 누적(ECOM 계산)"])}
    return sl


# ───── zoom : 전체 → 최근 구간 ─────
def conv_zoom(m):
    s = m["slide"]
    ch = s["chart"]
    unit = ch.get("unit", "")
    ser = ch["series"][0]
    name = full(ser["name"])
    d = dec_for(unit, ch.get("decimals"), name)
    lab, val = pts(ser["data"])
    z = ch.get("zoom", {})
    ia = lab.index(z["from"]) if z.get("from") in lab else max(0, len(lab) - 12)
    ib = lab.index(z["to"]) if z.get("to") in lab else len(lab) - 1
    w = [(lab[i], val[i]) for i in range(ia, ib + 1) if val[i] is not None]
    rest = [v for v in val[:ia] if v is not None]
    nw, nall = len(w), len(lab)
    av = sum(v for _, v in w) / nw
    av0 = sum(rest) / len(rest) if rest else None
    mx = max(w, key=lambda x: x[1])
    mn = min(w, key=lambda x: x[1])
    fp, fv = w[0]
    lp, lv = w[-1]
    allneg = all(v < 0 for v in val if v is not None)
    heads = []
    if allneg and flow(unit):
        heads += [f"{name} 적자는 최근 {nw}개월 평균 **{V(abs(av), d, unit)}**로 앞선 {len(rest)}개월 평균({V(abs(av0), d, unit)})보다 {'작았' if abs(av) < abs(av0) else '컸'}으며, 적자가 가장 작은 달은 {mx[0]}({V(mx[1], d, unit)})임",
                  f"{name} 적자는 최근 {nw}개월 평균 **{V(abs(av), d, unit)}**로 앞선 기간보다 {'작았' if abs(av) < abs(av0) else '컸'}으며, 가장 작은 달은 {mx[0]}임"]
    elif flow(unit):
        heads += [f"{name}{pj(name, '은/는')} 최근 {nw}개월 평균 **{V(av, d, unit)}**로 앞선 {len(rest)}개월 평균({V(av0, d, unit)})의 {av / av0:.1f}배이며, 구간 최고는 {mx[0]} {V(mx[1], d, unit)}임" if av0 and av0 > 0 and av / av0 >= 1.3 else
                  f"{name}{pj(name, '은/는')} 최근 {nw}개월 평균 **{V(av, d, unit)}**로 앞선 {len(rest)}개월 평균({V(av0, d, unit)})보다 {'컸' if av >= av0 else '작았'}으며, 구간 최고는 {mx[0]} {V(mx[1], d, unit)}임",
                  f"{name}{pj(name, '은/는')} 최근 {nw}개월 평균 **{V(av, d, unit)}**이며, 구간 최고는 {mx[0]} {V(mx[1], d, unit)} · 최저는 {mn[0]} {V(mn[1], d, unit)}임"]
    elif unit == "지수":
        p = (lv / fv - 1) * 100
        top_t = f"{lp}가 구간 최고이고 구간 평균은 {nf(av, 1)}임" if mx[0] == lp else f"구간 평균은 {nf(av, 1)}이고 최고는 {mx[0]}의 {nf(mx[1], 1)}임"
        heads += [f"{name}{pj(name, '은/는')} 최근 {nw}개월 동안 {nf(fv, 1)}에서 **{nf(lv, 1)}**로 {nf(abs(p), 1)}% {'올랐' if p >= 0 else '내렸'}으며, {top_t}"]
    else:
        dd = round(lv, d) - round(fv, d)
        same = round(dd, d) == 0
        if same:
            heads += [f"{name}{pj(name, '은/는')} 최근 {nw}개월의 처음과 끝이 모두 **{V(lv, d, unit)}**로 같으며, 그 사이 최저는 {mn[0]} {V(mn[1], d, unit)}, 구간 평균은 {V(av, d, unit)}임"]
        heads += [f"{name}{pj(name, '은/는')} 최근 {nw}개월 동안 {V(fv, d, unit)}에서 **{V(lv, d, unit)}**로 " + ("같은 수준이며" if same else f"{nf(abs(dd), d)}{du(unit)} {'올랐' if dd > 0 else '내렸'}으며") + f", 구간 최고는 {mx[0]} {V(mx[1], d, unit)}, 평균은 {V(av, d, unit)}임",
                  f"{name}{pj(name, '은/는')} 최근 {nw}개월 동안 " + ("같은 수준을 유지했으며" if same else f"{nf(abs(dd), d)}{du(unit)} {'올랐' if dd > 0 else '내렸'}으며") + f", {lp} 값은 **{V(lv, d, unit)}**이고 구간 평균은 {V(av, d, unit)}임"]
    sl = {"kind": "zoom", "type": "bar" if flow(unit) else "line", "eyebrow": eb(group_of(name), f"{name} 전체 {nall}개월 → 최근 {nw}개월", f"월, 단위: {unit}"), "head": H(*heads),
          "name": name, "labels": lab, "data": [None if v is None else round(v, 3) for v in val], "zoom": {"from": lab[ia], "to": lab[ib]}, "unit": ulab(unit), "dec": d,
          "avg": True, "avgText": f"최근 {nw}개월 평균 {{v}}", "foot": foot(s.get("source", ""), ["세로 눈금은 전체 기간과 같게 고정, 평균은 월 값 단순 평균(ECOM 계산)"])}
    if unit == "지수":
        sl["y"] = {"unit": "2017=100"}
    return sl


# ───── wipe : 같은 칸 두 계열 ─────
def conv_wipe(m):
    s = m["slide"]
    ch = s["chart"]
    unit = ch.get("unit", "")
    labels = ch["labels"]
    A, B = list(ch["a"]["data"]), list(ch["b"]["data"])
    na, nb = ch["a"]["name"], ch["b"]["name"]
    years = bool(re.fullmatch(r"\d{4}", str(na)))
    if not years and sum(b - a for a, b in zip(A, B)) < 0:      # 지표 쌍 : 차이가 양수가 되게 뒤집음
        A, B, na, nb = B, A, nb, na
    n = min(len(A), len(B))
    A, B = A[:n], B[:n]
    name = full(re.match(r"^(.*?)\s+(\d{4}년|vs)", m["variant"]).group(1)) if years else ""
    d = dec_for(unit, ch.get("decimals"), name or na)
    dd = d
    k = sum(1 for a, b in zip(A, B) if b > a)
    heads = []
    if years:
        y0, y1 = yr(na), yr(nb)
        per = f"1~{len(labels[:n])}월"
        sa, sb = sum(A), sum(B)
        if flow(unit) and all(v < 0 for v in A + B):
            ra, rb = round(abs(sa), d), round(abs(sb), d)
            heads += [f"{y1} {per} {name} 적자는 **{k}개월이 {y0} 같은 달보다 작았으며**, {per} 적자 합계는 {V(ra, d, unit)}에서 {V(rb, d, unit)}로 {nf(abs(ra - rb), d)}{hu(unit)} {'줄었' if rb < ra else '늘었'}음"]
        elif flow(unit):
            cnt = f"{n}개월 모두" if k == n else f"{n}개월 중 {k}개월이"
            heads += [f"{y1} {per} {name}{pj(name, '은/는')} **{cnt} {y0} 같은 달보다 컸으며**, {per} 합계는 {V(sa, d, unit)}에서 {V(sb, d, unit)}로 {chg(unit, sb >= sa)}음",
                      f"{y1} {per} {name}{pj(name, '은/는')} **{k}개월이 {y0} 같은 달보다 컸으며**, 합계는 {V(sa, d, unit)}에서 {V(sb, d, unit)}로 바뀌었음"]
        else:
            ma, mb = round(sa / n, dd), round(sb / n, dd)
            avg_t = f"{per} 평균은 두 해 모두 {V(mb, dd, unit)}로 같음" if ma == mb else f"{per} 평균은 {V(ma, dd, unit)}에서 {V(mb, dd, unit)}로 {nf(abs(mb - ma), dd)}{du(unit)} {chg(unit, mb >= ma)}음"
            heads += [f"{y1} {per} {name}{pj(name, '은/는')} **{k}개월이 {y0} 같은 달보다 {bigw(unit, True)}으며**, {avg_t}",
                      f"{y1} {per} {name}{pj(name, '은/는')} **{k}개월이 {y0} 같은 달보다 {bigw(unit, True)}으며**, 평균은 {V(mb, dd, unit)}임"]
        topic, an, bn = f"{per} 월별 {name} {y0} · {y1}", y0, y1
        dtitle = f"{y1} − {y0}, {du(unit) or unit}"
    else:
        an, bn = full(na), full(nb)
        g0, g1 = B[0] - A[0], B[-1] - A[-1]
        heads += [f"최근 {n}개월 {bn}{pj(bn, '은/는')} {'매달 ' if k == n else f'{k}개월 '}{an}보다 높았으며, 차이는 {labels[0]} {nf(g0, 2)}%p에서 {labels[-1]} **{nf(g1, 2)}%p**로 {'축소' if abs(g1) < abs(g0) else '확대'}됨",
                  f"최근 {n}개월 {bn}{pj(bn, '은/는')} {an}보다 높았으며, 차이는 {labels[-1]} **{nf(g1, 2)}%p**임"]
        topic, name = f"{an} · {bn} 최근 {n}개월", bn
        dtitle = f"{bn} − {an}, %p"
    sl = {"kind": "wipe", "eyebrow": eb(group_of(name + an), topic, f"월, 단위: {unit}"), "head": H(*heads), "labels": labels[:n],
          "a": {"name": an, "data": [round(v, 3) for v in A]}, "b": {"name": bn, "data": [round(v, 3) for v in B]}, "unit": ulab(unit), "dec": dd, "diffTitle": dtitle,
          "foot": foot(s.get("source", ""), ["아래 줄은 같은 달 차이(ECOM 계산)"])}
    if unit == "%":
        sl["y"] = {"min": 0}
    return sl


# ───── slope : 두 시점 기울기 ─────
def conv_slope(m):
    s = m["slide"]
    ch = s["chart"]
    unit = ch.get("unit", "")
    P = [{"label": full(p["label"]), "a": float(p["a"]), "b": float(p["b"])} for p in ch["pairs"]]
    h0, h1 = [yr(x) for x in ch.get("heads", ["", ""])]
    var = m["variant"]
    mm = re.match(r"^(.*?)\s+(변화 큰 달|분기 합|같은 달)", var)
    items = var.startswith("항목별")
    name = "경상수지 항목" if items else full(mm.group(1)) if mm else ""
    d = dec_for(unit, ch.get("decimals"), name)
    ratio = all(p["a"] > 0 and p["b"] > 0 for p in P) and min(p["b"] / p["a"] for p in P) >= 1.5
    D = [p["b"] / p["a"] if ratio else p["b"] - p["a"] for p in P]
    hi = max(range(len(P)), key=lambda i: D[i] if ratio else abs(D[i]))
    hp = P[hi]
    k = sum(1 for x in D if (x > 1 if ratio else x > 0))
    unitk = "분기" if "분기" in var else ("항목" if items else "달")
    n = len(P)
    heads = []
    if ratio:
        heads += [f"{h1} {name}{pj(name, '은/는')} 비교한 {n}개 {unitk} 모두 {h0}보다 커서 {min(D):.1f}~{max(D):.1f}배였으며, **{hp['label']}{pj(hp['label'], '이/가')} {D[hi]:.1f}배**로 가장 크게 늘었음",
                  f"{h1} {name}{pj(name, '은/는')} {n}개 {unitk} 모두 {h0}의 {min(D):.1f}~{max(D):.1f}배였으며, **{hp['label']} {D[hi]:.1f}배**가 가장 큼"]
    elif items:
        per = (re.search(r"(1~\d+월)", var) or [None, "같은 기간"])[1]
        heads += [f"{h0} → {h1} {per} 누적에서 **{hp['label']}{pj(hp['label'], '이/가')} {V(D[hi], d, du(unit), True)}**로 가장 크게 바뀌었으며, 네 항목 가운데 {k}개가 늘었음",
                  f"{h0} → {h1} {per} 누적에서 {hp['label']}{pj(hp['label'], '은/는')} {V(hp['a'], d, unit)}에서 **{V(hp['b'], d, unit)}**로 {V(D[hi], d, du(unit), True)} 바뀌어 네 항목 가운데 변화가 가장 큼"]
    else:
        dd = d
        up = D[hi] > 0
        verbw = chg(unit, up)
        defic = all(p["a"] < 0 and p["b"] < 0 for p in P) and flow(unit)
        kk = f"{n}개 {unitk} 모두" if k == n else f"{n}개 {unitk} 가운데 {k}개가"
        if defic:
            heads += [f"{h0} → {h1} {name} 적자는 {kk} 줄었으며, **{hp['label']}{pj(hp['label'], '이/가')} {V(abs(hp['a']), dd, unit)}에서 {V(abs(hp['b']), dd, unit)}로** 가장 크게 줄었음"]
        heads += [f"{h0} → {h1} {name}{pj(name, '은/는')} 비교한 {kk} {chg(unit, True)}으며, **{hp['label']}{pj(hp['label'], '이/가')} {V(hp['a'], dd, unit)}에서 {V(hp['b'], dd, unit)}로** 가장 크게 {verbw}음",
                  f"{h0} → {h1} {name}{pj(name, '은/는')} {n}개 {unitk} 가운데 {k}개가 {chg(unit, True)}으며, **{hp['label']} 변화({V(D[hi], dd, du(unit), True)})**가 가장 큼",
                  f"{h0} → {h1} {name}{pj(name, '은/는')} {n}개 {unitk} 가운데 {k}개가 {chg(unit, True)}고, {hp['label']}{pj(hp['label'], '이/가')} **{V(D[hi], dd, du(unit), True)}**로 가장 크게 {verbw}음"]
    sl = {"kind": "slope", "eyebrow": eb(group_of(name + " ".join(p["label"] for p in P)), f"{name} {h0} → {h1}" if not items else f"경상수지 항목 {h0} → {h1}", f"단위: {unit}" + (", 배" if ratio else f", {du(unit)}" if du(unit) != unit else "")),
          "head": H(*heads), "pairs": P, "heads": [h0, h1], "unit": ulab(unit), "dec": d, "delta": "ratio" if ratio else "diff", "hi": [hi],
          "foot": foot(s.get("source", ""), [("배수 = 뒤 시점 ÷ 앞 시점" if ratio else "변화 = 뒤 시점 − 앞 시점") + "(ECOM 계산)"])}
    if not du(unit) or du(unit) == unit:
        sl["dunit"] = ulab(unit)
    return sl


# ───── rank : 순위 막대 ─────
def conv_rank(m):
    s = m["slide"]
    ch = s["chart"]
    unit = ch.get("unit", "")
    var = m["variant"]
    mm = re.match(r"^(.*?)\s+(\d{4}년 1~\d+월|최근 \d+개월)", var)
    name, per = full(mm.group(1)), mm.group(2)
    per = re.sub(r"최근 \d+개월", f"최근 {len(ch['data'])}개월", per)
    d = dec_for(unit, ch.get("decimals"), name)
    data = [[str(a), round(float(b), 3)] for a, b in ch["data"]]
    n = len(data)
    o = sorted(range(n), key=lambda i: -data[i][1])
    av = sum(x[1] for x in data) / n
    L = lambda i: data[i][0]  # noqa: E731
    val = lambda i: V(data[i][1], d, unit)  # noqa: E731
    allneg = all(x[1] < 0 for x in data)
    negs = [i for i in range(n) if data[i][1] < 0]
    heads = []
    if allneg and flow(unit):
        heads += [f"{per} {name} 적자는 **{L(o[0])}({V(abs(data[o[0]][1]), d, unit)})**{pj(L(o[0]), '이/가')} 가장 작았고 {L(o[-1])}({V(abs(data[o[-1]][1]), d, unit)}){pj(L(o[-1]), '이/가')} 가장 컸으며, {n}개월 평균 적자는 {V(abs(av), d, unit)}임",
                  f"{per} {name} 적자는 **{L(o[0])}**{pj(L(o[0]), '이/가')} 가장 작았고 {L(o[-1])}{pj(L(o[-1]), '이/가')} 가장 컸으며, {n}개월 평균 적자는 {V(abs(av), d, unit)}임"]
    else:
        tail = (f"이며, {len(negs)}개월은 {'감소' if unit == '천 명' else '적자'}였고 평균은 {V(av, d, unit)}임" if negs and flow(unit) else f"이며, {n}개월 평균은 {V(av, d, unit)}임")
        heads += [f"{per} {name}{pj(name, '은/는')} **{L(o[0])} {val(o[0])}**{pj(val(o[0]), '이/가')} 가장 {bigw(unit, True)}고 {L(o[1])}({val(o[1])}) · {L(o[2])}({val(o[2])}) 순{tail}",
                  f"{per} {name}{pj(name, '은/는')} **{L(o[0])} {val(o[0])}**{pj(val(o[0]), '이/가')} 가장 {bigw(unit, True)}고 {L(o[1])} · {L(o[2])} 순{tail}",
                  f"{per} {name}{pj(name, '은/는')} **{L(o[0])}**{pj(L(o[0]), '이/가')} 가장 {bigw(unit, True)}고 {L(o[-1])}({val(o[-1])}){pj(L(o[-1]), '이/가')} 가장 {bigw(unit, False)}으며, 평균은 {V(av, d, unit)}임"]
    sl = {"kind": "rank", "eyebrow": eb(group_of(name), f"{name} {per} 순위", f"월, 단위: {unit}"), "head": H(*heads), "data": data, "unit": ulab(unit), "dec": d, "top": 3,
          "avgText": f"{n}개월 평균 {{v}}", "foot": foot(s.get("source", ""), ["평균은 단순 평균(ECOM 계산)" + (", 적자는 작은 순서가 위" if allneg else "")])}
    return sl


# ───── morph : 달 → 분기 · 반기 ─────
def conv_morph(m):
    s = m["slide"]
    ch = s["chart"]
    unit = ch.get("unit", "")
    G = ch.get("group", 3)
    name = full(re.match(r"^(.*?)\s+\d{4}년", m["variant"]).group(1))
    d = dec_for(unit, ch.get("decimals"), name)
    lab, val = pts(ch["data"])
    y = lab[0][:4]
    tot = [sum(val[i:i + G]) for i in range(0, len(val), G)]
    sm = sum(val)
    last_m = int(lab[-1][5:7])
    per = "연간" if last_m == 12 else f"1~{last_m}월"
    sl = {"kind": "morph", "labels": lab, "data": [round(v, 3) for v in val], "group": G, "unit": ulab(unit), "dec": d}
    if G == 6:
        h1, h2 = tot[0], tot[1] if len(tot) > 1 else None
        g = (h2 / h1 - 1) * 100
        heads = [f"{y}년 {name}{pj(name, '은/는')} 하반기 **{V(h2, d, unit)}**로 상반기({V(h1, d, unit)})보다 {nf(abs(g), 1)}% {'많았' if g >= 0 else '적었'}으며, 연간 합계는 {V(sm, d, unit)}임"]
        sl.update({"glabels": [["상반기", f"{y}년"], ["하반기", ""]], "gname": "상반기"})
        topic = f"{y}년 월별 {name} → 반기 합계"
    else:
        b = max(range(len(tot)), key=lambda i: tot[i])
        g = (tot[-1] / tot[-2] - 1) * 100 if len(tot) > 1 and tot[-2] else 0
        qs = " → ".join(f"{i + 1}분기 {nf(t, d)}" for i, t in enumerate(tot))
        heads = [f"{y}년 {name}{pj(name, '을/를')} 분기로 묶으면 {qs}{hu(unit)}이며, **{b + 1}분기가 가장 컸고** {per} 합계는 {V(sm, d, unit)}임",
                 f"{y}년 {name}{pj(name, '을/를')} 분기로 묶으면 **{b + 1}분기가 {V(tot[b], d, unit)}로 가장 컸으며**, 마지막 분기는 전분기보다 {nf(abs(g), 1)}% {'늘었' if g >= 0 else '줄었'}고 {per} 합계는 {V(sm, d, unit)}임",
                 f"{y}년 {name}{pj(name, '을/를')} 분기로 묶으면 **{b + 1}분기가 {V(tot[b], d, unit)}로 가장 컸으며**, {per} 합계는 {V(sm, d, unit)}임"]
        topic = f"{y}년 월별 {name} → 분기 합계"
    sl.update({"eyebrow": eb(group_of(name), topic, f"월, 단위: {unit}"), "head": H(*heads),
               "foot": foot(s.get("source", ""), ["묶음 합계 · 증감률은 월 값을 더해 계산(ECOM 계산)"])})
    return sl


# ───── split : 합계 → 항목 ─────
def conv_split(m):
    s = m["slide"]
    ch = s["chart"]
    unit = ch.get("unit", "")
    d = dec_for(unit, ch.get("decimals"))
    per = re.match(r"^(.*?)\s+경상수지", m["variant"]).group(1)
    tv = float(ch["total"]["value"])
    P = [{"label": full(p["label"]), "value": float(p["value"])} for p in ch["parts"]]
    hi = max(range(len(P)), key=lambda i: abs(P[i]["value"]))
    hp = P[hi]
    neg = [p for p in P if p["value"] < 0]
    nsum = sum(p["value"] for p in neg)
    sh = hp["value"] / tv * 100 if tv else 0
    nn = " · ".join(p["label"].replace("수지", "") for p in neg) + "수지" if neg else ""
    heads = []
    if sh > 100:
        heads += [f"{per} 경상수지 **{V(tv, d, unit)}**는 {hp['label']} 흑자({V(hp['value'], d, unit)})만으로 경상수지보다 크며, {nn}{pj(nn, '은/는')} 합계 {V(abs(nsum), d, unit)} 적자임",
                  f"{per} 경상수지 **{V(tv, d, unit)}**는 {hp['label']} 흑자({V(hp['value'], d, unit)})가 {nf(sh, 1)}%로 경상수지보다 큼"]
    else:
        heads += [f"{per} 경상수지 **{V(tv, d, unit)}** 가운데 **{hp['label']}{pj(hp['label'], '이/가')} {nf(sh, 1)}%({V(hp['value'], d, unit)})**를 차지하며, {nn}{pj(nn, '은/는')} 합계 {V(abs(nsum), d, unit)} 적자임",
                  f"{per} 경상수지 **{V(tv, d, unit)}** 가운데 {hp['label']}{pj(hp['label'], '이/가')} {nf(sh, 1)}%를 차지하며, 적자 항목은 {len(neg)}개임"]
    return {"kind": "split", "eyebrow": eb("국제수지", f"{per} 경상수지 = 4개 항목의 합", "단위: 억 달러, 비중은 경상수지 대비"), "head": H(*heads),
            "total": {"label": "경상수지", "value": tv, "sub": per}, "parts": P, "unit": ulab(unit), "dec": d,
            "foot": foot(s.get("source", ""), ["비중 = 항목 ÷ 경상수지(ECOM 계산), 음수는 적자, 반올림으로 합이 0.1 다를 수 있음"])}


# ───── bridge : 증감 다리 ─────
def conv_bridge(m):
    s = m["slide"]
    ch = s["chart"]
    unit = ch.get("unit", "")
    d = dec_for(unit, ch.get("decimals"))
    st, en = ch["start"], ch["end"]
    S = [{"label": full(x["label"]), "value": float(x["value"])} for x in ch["steps"]]
    a, b = float(st["value"]), float(en["value"])
    dt = b - a
    hi = max(range(len(S)), key=lambda i: abs(S[i]["value"]))
    hs = S[hi]
    sh = hs["value"] / dt * 100 if dt else 0
    pos = max(S, key=lambda x: x["value"])
    ng = min(S, key=lambda x: x["value"])
    word = "늘었" if dt >= 0 else "줄었"
    heads = []
    if 0 < sh <= 100:
        heads += [f"경상수지는 {st['label']} {V(a, d, unit)}에서 {en['label']} **{V(b, d, unit)}**로 {V(abs(dt), d, unit)} {word}으며, 이 가운데 **{hs['label']} {'증가' if hs['value'] > 0 else '감소'}가 {nf(sh, 1)}%**를 차지함",
                  f"경상수지는 {st['label']}보다 {en['label']}에 {V(abs(dt), d, unit)} {word}으며, **{hs['label']} {'증가' if hs['value'] > 0 else '감소'}가 {nf(sh, 1)}%**를 차지함"]
    elif 100 < sh <= 110:
        heads += [f"경상수지는 {en['label']} **{V(b, d, unit)}**로 {st['label']}보다 {V(abs(dt), d, unit)} {word}으며, {hs['label']} {'증가' if hs['value'] > 0 else '감소'}({V(hs['value'], d, unit, True)})만으로 전체 {'증가분' if dt >= 0 else '감소분'}을 넘음"]
    else:
        big, small = (pos, ng) if dt >= 0 else (ng, pos)
        heads += [f"경상수지는 {en['label']} **{V(b, d, unit)}**로 {st['label']}보다 {V(abs(dt), d, unit)} {word}으며, {big['label']} {'증가' if big['value'] > 0 else '감소'}({V(big['value'], d, unit, True)})가 {small['label']} {'증가' if small['value'] > 0 else '감소'}({V(small['value'], d, unit, True)})를 웃돌았음",
                  f"경상수지는 {st['label']} {V(a, d, unit)}에서 {en['label']} **{V(b, d, unit)}**로 {V(abs(dt), d, unit)} {word}으며, {big['label']} {'증가' if big['value'] > 0 else '감소'}({V(big['value'], d, unit, True)})가 {small['label']} {'증가' if small['value'] > 0 else '감소'}({V(small['value'], d, unit, True)})를 웃돌았음",
                  f"경상수지는 {st['label']}보다 {en['label']}에 **{V(abs(dt), d, unit)} {word}으며**, {big['label']} 변화({V(big['value'], d, unit, True)})가 가장 큰 요인임"]
    return {"kind": "bridge", "eyebrow": eb("국제수지", f"경상수지 증감 분해 {st['label']} → {en['label']}", "단위: 억 달러"), "head": H(*heads),
            "start": {"label": st["label"], "value": a}, "steps": S, "end": {"label": en["label"], "value": b}, "unit": ulab(unit), "dec": d, "share": 0 < sh <= 100,
            "foot": foot(s.get("source", ""), ["항목 몫 = 같은 기간 항목 값의 증감(ECOM 계산), 반올림으로 합이 0.1 다를 수 있음"])}


# ───── waffle : 칸 채우기 ─────
def nums(t):
    return [float(x.replace(",", "")) for x in re.findall(r"(?<![\d.])(\d[\d,]*\.?\d*)", t)]


def conv_waffle(m):
    s = m["slide"]
    ch = s["chart"]
    v = float(ch["value"])
    lab = ch.get("label", "")
    pts_ = (s.get("read") or {}).get("points") or []
    src = s.get("source", "")
    ao = asof_of(s)
    bd = ch.get("breakdown") or []
    side = {"type": "bars", "title": "구성, %", "labels": [x[0] for x in bd], "data": [round(float(x[1]), 1) for x in bd], "unit": "%", "dec": 1} if bd else None
    cnt = re.search(r"(흑자|증가) (\d+)개월 · (적자|감소) (\d+)개월", " ".join(pts_))
    var = m["variant"]
    if cnt:                                                   # 달 수 비중 : 칸 1개 = 1개월
        k1, k2 = int(cnt.group(2)), int(cnt.group(4))
        n = k1 + k2
        nm = full(re.match(r"^(.*?)\s+(흑자|증가) 달", var).group(1))
        start = ym_add(ao, -(n - 1))
        lastv = re.search(r"끝 달 ([\d,.\-−]+)(억 달러|천 명)", " ".join(pts_))
        word, rest_w = cnt.group(1), cnt.group(3)
        u2 = lastv.group(2) if lastv else ""
        tail = f", {ao} {'증감은' if word == '증가' else '값은'} {lastv.group(1)}{u2.replace(' ', NB)}임" if lastv else "임"
        if word == "증가":
            nm2 = nm.replace(" 증감", "")
            head = H(f"최근 {n}개월({start}~{ao}) 가운데 {nm2}{pj(nm2, '이/가')} 늘어난 달은 **{k1}개월({nf(v, 1)}%)**이며 줄어든 달은 {k2}개월{tail}",
                     f"최근 {n}개월 가운데 {nm2}{pj(nm2, '이/가')} 늘어난 달은 **{k1}개월({nf(v, 1)}%)**이며 줄어든 달은 {k2}개월임")
        else:
            head = H(f"최근 {n}개월({start}~{ao}) 가운데 {nm}{pj(nm, '이/가')} {word}인 달은 **{k1}개월({nf(v, 1)}%)**이며 {rest_w}는 {k2}개월{tail}",
                     f"최근 {n}개월 가운데 {nm}{pj(nm, '이/가')} {word}인 달은 **{k1}개월({nf(v, 1)}%)**이며 {rest_w}는 {k2}개월임")
        return {"kind": "waffle", "eyebrow": eb(group_of(nm), f"{nm} {word} 달 비중, 최근 {n}개월", "칸 1개 = 1개월"), "head": head, "unit": "%", "dec": 1,
                "grids": [{"label": f"{start}~{ao}", "n": n, "cols": next(c for c in range(1, n + 1) if n % c == 0 and c * c >= n), "value": k1, "big": {"value": v, "dec": 1, "unit": "%"}, "sub": f"{n}개월 중 {k1}개월 {word}", "maxCell": 104 if n <= 24 else 76}],
                "legend": [{"text": f"{word} 달", "color": "main"}, {"text": f"{rest_w} 달", "color": "light"}],
                "side": {"type": "bars", "title": f"{word} · {rest_w} 달 수, 개월", "labels": [f"{word} 달", f"{rest_w} 달"], "data": [k1, k2], "unit": "개월", "dec": 0},
                "foot": foot(src, [f"{word} 달 비중 = {word} 달 ÷ {n}개월(ECOM 계산), 칸은 달 순서가 아니라 개수를 나타냄"])}
    if "실업률" in lab:
        head = H(f"{ao} 미국 실업률은 **{nf(v, 1)}%**로, 노동력 100명 가운데 약 {nf(v, 1)}명이 실업 상태이며 나머지 {nf(100 - v, 1)}명은 취업 상태임")
        return {"kind": "waffle", "eyebrow": eb("고용", "미국 실업률 100칸", f"{ao}, 칸 1개 = 노동력의 1%"), "head": head, "unit": "%", "dec": 1,
                "grids": [{"label": f"{ao} 미국 실업률", "value": v, "sub": "노동력 100명 중 실업자"}],
                "legend": [{"text": "실업자", "color": "main"}, {"text": "취업자", "color": "light"}],
                "side": dict(side, title="노동력 구성, %", labels=["실업자", "취업자"]) if side else None, "foot": foot(src, ["마지막 칸은 소수점만큼 일부만 채움"])}
    if "물가" in lab:
        nm = "한국" if "한국" in lab else "미국"
        head = H(f"{ao} {nm} 소비자물가 상승률은 **{nf(v, 1)}%**로, 1년 전 100원이던 물건값이 평균 {nf(100 + v, 1)}원이 된 수준이며 오른 몫은 100칸 가운데 {nf(v, 1)}칸임")
        return {"kind": "waffle", "eyebrow": eb("물가", f"{nm} 소비자물가 상승률 100칸", f"{ao}, 전년동월비, 칸 1개 = 1%"), "head": head, "unit": "%", "dec": 1,
                "grids": [{"label": f"{ao} {nm} 소비자물가 상승률", "value": v, "sub": "1년 전 100원 기준 오른 몫"}],
                "legend": [{"text": "1년 사이 오른 몫", "color": "main"}, {"text": "1년 전 값", "color": "light"}],
                "side": {"type": "bars", "title": "100원어치 물건값, 원", "labels": ["1년 전", ao], "data": [100, round(100 + v, 1)], "unit": "원", "dec": 1},
                "foot": foot(src, ["마지막 칸은 소수점만큼 일부만 채움, 물건값은 상승률로 환산(ECOM 계산)"])}
    # 흑자 항목 몫
    pt = " ".join(pts_)
    mm = re.search(r"상품수지 ([\d,.]+)억 달러 / 흑자 항목 합 ([\d,.]+)억 달러", pt)
    per = re.match(r"^(.*?)\s+흑자 항목", var).group(1)
    g, tsum = (mm.group(1), mm.group(2)) if mm else ("", "")
    other = bd[1][0] if len(bd) > 1 else "다른 흑자 항목"
    head = H(f"{per} 흑자 항목 합계 {tsum}억{NB}달러 가운데 **상품수지가 {nf(v, 1)}%({g}억{NB}달러)**를 차지하며, 나머지 {nf(100 - v, 1)}%는 {full(other)}임")
    return {"kind": "waffle", "eyebrow": eb("국제수지", f"{per} 흑자 항목 중 상품수지 몫", "칸 1개 = 흑자 항목 합의 1%"), "head": head, "unit": "%", "dec": 1,
            "grids": [{"label": f"{per} 상품수지 몫", "value": v, "sub": "흑자 항목 합 = 100칸"}],
            "legend": [{"text": "상품수지", "color": "main"}, {"text": full(other), "color": "light"}],
            "side": dict(side, title="흑자 항목 구성, %", labels=[full(x[0]) for x in bd]) if side else None,
            "foot": foot(src, ["적자 항목은 몫 계산에서 뺌, 몫 = 항목 ÷ 흑자 항목 합(ECOM 계산)"])}


# ───── donut : 비중 고리 ─────
def conv_donut(m):
    s = m["slide"]
    ch = s["chart"]
    R = [{"label": full(r["label"]), "value": float(r["value"])} for r in ch["rings"]]
    ttl = ch.get("head", "")
    src = s.get("source", "")
    ao = asof_of(s)
    o = sorted(R, key=lambda r: -r["value"])
    top_, low = o[0], o[-1]
    out = {"kind": "donut", "rings": R, "dec": 1, "half": bool(ch.get("half")), "ringTitle": ttl}
    if "물가" in ttl:
        a, b = R[0], R[1]
        for r in R:
            r["sub"] = f"1년 전 100원 → {nf(100 + r['value'], 1)}원"
        head = H(f"{ao} 소비자물가 상승률은 {a['label']} **{nf(a['value'], 1)}%**, {b['label']} {nf(b['value'], 1)}%로 {a['label']}{pj(a['label'], '이/가')} {nf(abs(a['value'] - b['value']), 1)}%p {'낮으며' if a['value'] < b['value'] else '높으며'}, 두 나라 모두 물가안정목표 2%를 넘음")
        out.update({"eyebrow": eb("물가", "한·미 소비자물가 상승률", f"{ao}, 전년동월비, 단위: %"), "head": head, "hero": 0,
                    "foot": foot(src, ["고리 가득 = 100%, 아래 글은 상승률로 환산한 물건값(ECOM 계산)"])})
        return out
    if "고용" in ttl:
        for r in R:
            k = int(re.match(r"(\d+)", r["label"]).group(1))
            r["sub"] = f"{k}개월 중 {round(r['value'] * k / 100)}개월 증가"
        head = H(f"미국 비농업 고용이 늘어난 달의 비중은 최근 {top_['label']} 기준 **{nf(top_['value'], 1)}%**로 가장 높고 " + " · ".join(f"{r['label']} {nf(r['value'], 1)}%" for r in o[1:]) + f"이며, 세 기간 모두 {int(low['value'] // 5 * 5)}%를 넘음")
        out.update({"eyebrow": eb("고용", "미국 비농업 고용 증가 달 비중", f"{ao}까지 최근 12 · 24 · 36개월, 단위: %"), "head": head, "hero": R.index(top_),
                    "foot": foot(src, ["비중 = 고용이 늘어난 달 ÷ 전체 달(ECOM 계산)"])})
        return out
    if "흑자 달" in ttl:
        head = H(f"최근 60개월 가운데 흑자인 달의 비중은 **{top_['label']} {nf(top_['value'], 1)}%**가 가장 높고 " + " · ".join(f"{r['label']} {nf(r['value'], 1)}%" for r in o[1:]) + f" 순이며, 세 항목 모두 {int(low['value'] // 5 * 5)}%를 넘음")
        out.update({"eyebrow": eb("국제수지", "항목별 흑자 달 비중", f"{ao}까지, 단위: %"), "head": head, "hero": R.index(top_),
                    "foot": foot(src, ["비중 = 흑자 달 ÷ 전체 달(ECOM 계산)"])})
        return out
    if "상품수지 몫" in ttl:
        r2 = max(R[1:], key=lambda r: r["value"])
        head = H(f"흑자 항목 합계에서 상품수지가 차지하는 몫은 **{R[0]['label']} {nf(R[0]['value'], 1)}%**로 {r2['label']}({nf(r2['value'], 1)}%)보다 {nf(R[0]['value'] - r2['value'], 1)}%p 높으며, " + " · ".join(f"{r['label']}은 {nf(r['value'], 1)}%" for r in R[1:] if r is not r2) + "임")
        out.update({"eyebrow": eb("국제수지", "흑자 항목 중 상품수지 몫", "단위: %"), "head": head, "hero": 0,
                    "foot": foot(src, ["적자 항목은 몫 계산에서 뺌, 몫 = 상품수지 ÷ 흑자 항목 합(ECOM 계산)"])})
        return out
    # 1~3분기 누적 중 3분기 몫
    mono = all(R[i]["value"] > R[i + 1]["value"] for i in range(len(R) - 1))
    head = H(f"경상수지 1~3분기 누적 가운데 3분기가 차지한 몫은 **{R[0]['label']} {nf(R[0]['value'], 1)}%**로 " + " · ".join(f"{r['label']}({nf(r['value'], 1)}%)" for r in R[1:]) + ("보다 높아 해마다 커졌음" if mono else "보다 높음"))
    out.update({"eyebrow": eb("국제수지", "1~3분기 경상수지 누적 중 3분기 몫", "단위: %"), "head": head, "hero": 0,
                "foot": foot(src, ["몫 = 3분기 합 ÷ 1~3분기 합(ECOM 계산), 누적이 양수인 해만 비교"])})
    return out


# ───── minis : 작은 차트 여러 개 ─────
def conv_minis(m):
    s = m["slide"]
    M = s["chart"]["minis"]
    out, rise = [], []
    for x in M:
        unit = x["unit"]
        nm = full(x["label"])
        d = dec_for(unit, x.get("decimals"), nm)
        lab, val = pts(x["data"])
        fv, lv = val[0], val[-1]
        dd = lv - fv
        o = {"label": nm, "value": round(float(x["value"]), d), "dec": d, "unit": ulab(unit), "kind": x.get("kind", "bar"), "data": [[l, None if v is None else round(v, 3)] for l, v in zip(lab, val)]}
        if unit == "지수":
            o["sub"] = "2017=100"
            p = (lv / fv - 1) * 100
            o["chip"] = {"text": f"{lab[0]} 대비 {nf(p, 1, True)}%", "dir": "up" if p > 0 else "dn"}
        else:
            o["chip"] = {"text": f"{lab[0]} 대비 {nf(dd, 2 if unit == '%' else d, True)}{du(unit)}", "dir": "up" if dd > 0 else ("dn" if dd < 0 else "flat")}
        if unit == "%" and "금리" not in nm:
            o["sub"] = "전년동월비" if "물가" in nm else ""
        out.append(o)
        rise.append((nm, fv, lv, unit, d, lab))
    k = sum(1 for r in rise if r[2] > r[1])
    n = len(rise[0][5])
    a = rise[0]
    rest = " · ".join(f"{r[0]} {nf(r[2], r[4])}{hu(r[3])}" for r in rise[1:])
    vb = "늘었" if flow(rise[0][3]) else "올랐"
    head = H(f"최근 {n}개월 {len(rise)}개 지표 가운데 {k}개가 {vb if k else '오르지 않았'}으며, {a[0]}{pj(a[0], '은/는')} {nf(a[1], a[4])}{hu(a[3])}에서 **{nf(a[2], a[4])}{hu(a[3])}**로 바뀌었고 {rest}임",
                    f"최근 {n}개월 {len(rise)}개 지표 가운데 {k}개가 {vb}으며, {a[0]}{pj(a[0], '은/는')} **{nf(a[2], a[4])}{hu(a[3])}**, {rest}임",
                    f"최근 {n}개월 {len(rise)}개 지표 가운데 {k}개가 {vb}으며, {a[0]}{pj(a[0], '은/는')} {a[5][-1]} **{nf(a[2], a[4])}{hu(a[3])}**임")
    units = []
    for r in rise:
        u = "2017=100" if r[3] == "지수" else r[3]
        if u not in units:
            units.append(u)
    names = " · ".join(r[0] for r in rise)
    return {"kind": "minis", "eyebrow": eb(group_of(names), f"{names} 최근 {n}개월" if hlen(names) < 22 else f"지표 {len(rise)}개 최근 {n}개월", f"월, 단위: {', '.join(units)}"),
            "head": head, "minis": out, "foot": foot(s.get("source", ""), ["칩 = 첫 달 대비 마지막 달 변화(ECOM 계산)"])}


# ───── combo : 막대 + 선 ─────
def conv_combo(m):
    s = m["slide"]
    ch = s["chart"]
    u0, u1 = (ch.get("units") or ["", "%"])[:2]
    name = full(re.match(r"^(.*?)\s+(최근|연간)", m["variant"]).group(1))
    annual = "연간" in m["variant"]
    bl, bv = pts(ch["bars"])
    lmap = {str(a): float(b) for a, b in ch["line"]}
    lv = [lmap.get(x) for x in bl]
    d = dec_for(u0, ch.get("decimals"), name)
    lp, last = bl[-1], bv[-1]
    lch = lv[-1]
    lv_ok = [(bl[i], lv[i]) for i in range(len(bl)) if lv[i] is not None]
    lmx = max(lv_ok, key=lambda x: x[1])
    lmn = min(lv_ok, key=lambda x: x[1])
    bmn = min(range(len(bv)), key=lambda i: bv[i])
    up = lch >= 0
    if annual:
        lo_t = f"이 가장 작았고 그해 증감률은 {nf(lmap[bl[bmn]], 1)}%였음" if bl[bmn] in lmap else "이 가장 작았음"
        heads = [f"{name}{pj(name, '은/는')} {lp}년 **{V(last, d, u0)}**로 전년보다 {nf(abs(lch), 1)}% {chg(u0, up)}으며, {bl[0]}~{lp}년 가운데 {bl[bmn]}년({V(bv[bmn], d, u0)}){lo_t}",
                 f"{name}{pj(name, '은/는')} {lp}년 **{V(last, d, u0)}**로 전년보다 {nf(abs(lch), 1)}% {chg(u0, up)}으며, {bl[0]}~{lp}년 가운데 {bl[bmn]}년{lo_t}"]
        lname, per = "전년 대비 증감률", f"{bl[0]}~{bl[-1]}년"
    else:
        vv = "만큼" if u0 == "지수" else ""
        heads = [f"{name}{pj(name, '은/는')} {lp} **{V(last, d, u0)}**로 전년동월보다 {nf(abs(lch), 1)}% {chg(u0, up)}으며, 이는 최근 {len(bl)}개월 가운데 가장 높은 증가율이고 최저는 {lmn[0]}의 {nf(lmn[1], 1)}%임" if lmx[0] == lp else
                 f"{name}{pj(name, '은/는')} {lp} **{V(last, d, u0)}**로 전년동월보다 {nf(abs(lch), 1)}% {chg(u0, up)}으며, 최근 {len(bl)}개월 전년동월비는 {lmx[0]}에 {nf(lmx[1], 1)}%로 가장 높았음",
                 f"{name}{pj(name, '은/는')} {lp} **{V(last, d, u0)}**로 전년동월보다 {nf(abs(lch), 1)}% {chg(u0, up)}{vv}으며, 전년동월비 최고는 {lmx[0]} {nf(lmx[1], 1)}% · 최저는 {lmn[0]} {nf(lmn[1], 1)}%임"]
        lname, per = "전년동월비", f"{bl[0]}~{bl[-1]}"
    summ = [[a, b] for a, b in (ch.get("summary") or [])]
    summ.append([f"{lp} {name}", V(last, d, u0).replace(NB, " ")])
    summ.append([f"{lp} {lname}", nf(lch, 1, True) + "%"])
    return {"kind": "combo", "eyebrow": eb(group_of(name), f"{name}와 {lname}" if not has_batchim(name) else f"{name}과 {lname}", f"{per}, 단위: {u0 if u0 != '지수' else '2017=100'}, %"),
            "head": H(*heads), "labels": bl, "bars": {"name": name, "data": [round(v, 3) for v in bv], "unit": ulab(u0), "dec": d},
            "line": {"name": lname, "data": lv, "unit": "%", "dec": 1}, "summary": summ[:3],
            "foot": foot(s.get("source", ""), [f"선 = {lname}, 합계 · 평균은 ECOM 계산"])}


# ───── drivers : 변화 요인 ─────
def conv_drivers(m):
    s = m["slide"]
    var = m["variant"]
    mm = re.match(r"^(.+?) → (.+?) 변화 요인", var)
    a_p, b_p = mm.group(1), mm.group(2)
    pts_ = (s.get("read") or {}).get("points") or []
    items = []
    for it in s.get("items") or []:
        num = str(it.get("num", ""))
        v = float(num.replace(",", "").replace(MINUS, "-").replace("+", "").replace("억 달러", "").strip())
        lab = it["text"]
        sub = ""
        for p in pts_:
            q = re.sub(r"^[¹²³⁴⁵]\s*", "", p)
            if q.startswith(lab + " "):
                sub = q[len(lab) + 1:]
        o = {"sign": "+" if v >= 0 else "−", "text": full(lab), "value": v}
        if sub:
            o["sub"] = sub
        items.append(o)
    tot = sum(x["value"] for x in items)
    hi = max(items, key=lambda x: abs(x["value"]))
    k = sum(1 for x in items if x["value"] > 0)
    up = tot >= 0
    hw = ("증가" if hi["value"] > 0 else "감소")
    kk = "네 항목 모두 늘었음" if k == len(items) else (f"네 항목 가운데 {k}개가 늘었음" if k else "네 항목 모두 줄었음")
    heads = [f"{b_p} 경상수지는 {a_p}보다 **{V(abs(tot), 1, '억 달러')} {'늘었' if up else '줄었'}으며**, {hi['text']} {hw}({V(hi['value'], 1, '억 달러', True)})가 가장 큰 요인이고 {kk}",
             f"{b_p} 경상수지는 {a_p}보다 **{V(abs(tot), 1, '억 달러')} {'늘었' if up else '줄었'}으며**, {hi['text']} {hw}({V(hi['value'], 1, '억 달러', True)})가 가장 큰 요인임"]
    return {"kind": "drivers", "eyebrow": eb("국제수지", f"경상수지 변화 요인 {a_p} → {b_p}", "단위: 억 달러"), "head": H(*heads), "items": items, "unit": "억 달러", "dec": 1,
            "total": {"label": "경상수지 변화", "value": round(tot, 1), "sub": f"{a_p} → {b_p}, 네 항목 합(ECOM 계산)"},
            "foot": foot(s.get("source", ""), ["요인 = 항목 값의 증감, 반올림으로 합이 0.1 다를 수 있음"])}


CONV = {"race": conv_race, "zoom": conv_zoom, "wipe": conv_wipe, "slope": conv_slope, "rank": conv_rank, "morph": conv_morph, "split": conv_split,
        "bridge": conv_bridge, "waffle": conv_waffle, "donut": conv_donut, "minis": conv_minis, "combo": conv_combo, "drivers": conv_drivers}
