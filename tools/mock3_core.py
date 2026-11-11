# 목업 3판 변환 — kpi · bar · table (판 2 목업 숫자 그대로, 헤드메시지는 숫자로 새로 씀)
import re
from mock3_lib import nf, du, ulab, josa, verb, group_of, foot, fit_head, ext, hlen, MINUS


def eb(group, topic, basis):
    return {"group": group, "topic": topic, "basis": basis}


def big_word(unit, name, up):
    return ("큼" if up else "작음") if unit in ("억 달러", "천 명") else ("높음" if up else "낮음")


def conv_kpi(m):
    s = m["slide"]
    cards = s["cards"]
    hero = cards[0]
    unit = hero["unit"]
    sp = hero.get("spark") or []
    d = hero.get("decimals", 1)
    out_cards = []
    for i, c in enumerate(cards):
        ch = c.get("change") or {}
        out_cards.append({"label": c["label"], "sub": (c.get("asof") or "").replace("데이터월 ", ""), "value": round(c["value"], c.get("decimals", 1)), "dec": c.get("decimals", 1), "unit": c["unit"],
                          "chip": {"text": ch.get("text", ""), "dir": "up" if ch.get("dir") == "up" else ("dn" if ch.get("dir") == "down" else "flat")} if ch.get("text") else None, "hero": i == 0})
    words = hero["label"].split(" ")
    name = " ".join(w for w in words if not re.match(r"^(\d+월|\d+~\d+월|1~\d+월|연간|\d{4}년)$", w)) or hero["label"]
    heads = []
    if sp:
        e = ext(sp)
        fp, fv = e["first"]
        lp, lv = e["last"]
        mxp, mxv = e["max"]
        mnp, mnv = e["min"]
        dd = 2 if unit == "%" else d
        cum = bool(re.search(r"~|누적|연간", hero["label"]))
        if cum:
            name = name + " 누적"
        if round(hero["value"], d) != round(lv, d):   # 누적 · 연간 카드
            heads.append(f"{josa(hero['label'], '은/는')} **{nf(hero['value'], d)}{ulab(unit)}**이며, 월별로는 {mxp}에 {nf(mxv, d)}{ulab(unit)}로 가장 컸고 {mnp}에 {nf(mnv, d)}{ulab(unit)}로 가장 작았음")
        allneg = all(v < 0 for _, v in sp)
        ext_ph = (f"최근 {e['n']}개월 가운데 가장 {big_word(unit, name, True)}" if lp == mxp else (f"최근 {e['n']}개월 가운데 가장 {big_word(unit, name, False)}" if lp == mnp else f"{e['n']}개월 최고는 {mxp}의 {nf(mxv, d)}{ulab(unit)}임"))
        if allneg and unit == "억 달러":
            ext_ph = f"{e['n']}개월 가운데 적자 폭이 가장 컸던 달은 {mnp}({nf(mnv, d)}{ulab(unit)})임"
        heads.append(f"{josa(name, '은/는')} {lp} **{nf(lv, d)}{ulab(unit)}**로 {fp}({nf(fv, d)}{ulab(unit)})보다 {nf(abs(lv - fv), dd)}{du(unit)} {verb(unit, name, lv >= fv)}으며, {ext_ph}")
        if len(cards) > 1 and cards[1]["unit"] == unit and round(hero["value"], d) == round(lv, d) and not cum:
            c2 = cards[1]
            n2 = " ".join(w for w in c2["label"].split(" ") if not re.match(r"^(\d+월|1~\d+월|연간)$", w))
            gap = hero["value"] - c2["value"]
            heads.insert(0, f"{josa(name, '은/는')} {lp} **{nf(lv, d)}{ulab(unit)}**로 {fp}보다 {nf(abs(lv - fv), dd)}{du(unit)} {verb(unit, name, lv >= fv)}고, {n2}({nf(c2['value'], c2.get('decimals', 1))}{ulab(unit)})와의 차이는 **{nf(abs(gap), dd)}{du(unit)}**임")
    head = fit_head(*heads)
    chart = None
    if sp:
        chart = {"type": "bar" if unit in ("억 달러", "천 명") else "line", "labels": [p for p, _ in sp], "series": [{"name": name, "data": [round(v, 3) for _, v in sp], "color": "main"}],
                 "unit": ulab(unit), "dec": d, "suf": ulab(unit), "marks": "auto", "avg": True, "title": f"{name} 최근 {len(sp)}개월"}
        same = [c for c in cards[1:3] if c["unit"] == unit and c.get("spark") and len(c["spark"]) == len(sp)]
        if same and round(hero["value"], d) == round(sp[-1][1], d):
            chart["type"] = "line"
            chart["avg"] = False
            chart["series"] += [{"name": " ".join(w for w in c["label"].split(" ") if not re.match(r"^(\d+월|1~\d+월)$", w)), "data": [round(v, 3) for _, v in c["spark"]], "color": "cmp" if i == 0 else "g65"} for i, c in enumerate(same)]
            chart["title"] = f"최근 {len(sp)}개월 비교"
    lp0 = sp[-1][0] if sp else ""
    sl = {"kind": "kpi", "eyebrow": eb(group_of(name), f"{name} 최근 값과 {len(sp)}개월 흐름" if sp else name, f"월, 단위: {unit}"), "head": head, "cards": out_cards,
          "foot": foot(s.get("source", ""), [f"데이터월 {lp0}, 차트는 월 값"] if lp0 else [])}
    if chart:
        sl["chart"] = chart
    return sl


def conv_bar(m):
    s = m["slide"]
    ch = s["chart"]
    ser = ch["series"][0]
    pts = ser["data"]
    unit = ch.get("unit", "")
    name = ser["name"]
    e = ext(pts)
    d = 2 if unit == "%" and ("금리" in name or "10년물" in name or "2년물" in name) else (0 if unit == "천 명" else 1)
    labels = [p for p, _ in pts]
    data = [round(v, 3) for _, v in pts]
    n = len(data)
    imx, imn = labels.index(e["max"][0]), labels.index(e["min"][0])
    anc = lambda i: "end" if i > n * .75 else ("start" if i < n * .25 else "middle")  # noqa: E731
    allneg = all(v < 0 for v in data)
    notes = []
    if allneg:
        notes.append({"at": imn, "text": f"적자 최대 {nf(e['min'][1], d)}{ulab(unit)}", "sub": e["min"][0], "pos": "below", "anchor": anc(imn)})
        notes.append({"at": imx, "text": f"적자 최소 {nf(e['max'][1], d)}{ulab(unit)}", "sub": e["max"][0], "pos": "below", "anchor": anc(imx)})
    else:
        if imx != n - 1:
            notes.append({"at": imx, "text": f"최고 {nf(e['max'][1], d)}{ulab(unit)}", "sub": e["max"][0], "pos": "above", "anchor": anc(imx)})
        if imn != imx and imn != n - 1:
            notes.append({"at": imn, "text": f"최저 {nf(e['min'][1], d)}{ulab(unit)}", "sub": e["min"][0], "pos": "below" if e["min"][1] < 0 else "above", "anchor": anc(imn)})
    avg = sum(data) / n
    fp, fv = e["first"]
    lp, lv = e["last"]
    if allneg:
        heads = [f"{josa(name, '은/는')} 최근 {n}개월 모두 적자였으며, 적자 폭은 {e['min'][0]}에 **{nf(abs(e['min'][1]), d)}{ulab(unit)}**로 가장 컸고 {e['max'][0]}에 {nf(abs(e['max'][1]), d)}{ulab(unit)}로 가장 작았음"]
    else:
        bw, sw = ('컸고', '작았으며') if unit in ('억 달러', '천 명') else ('높았고', '낮았으며')
        heads = [f"{josa(name, '은/는')} 최근 {n}개월 가운데 {e['max'][0]}에 **{nf(e['max'][1], d)}{ulab(unit)}**로 가장 {bw} {e['min'][0]}에 {nf(e['min'][1], d)}{ulab(unit)}로 가장 {sw}, 평균은 {nf(avg, d)}{ulab(unit)}임",
                 f"{josa(name, '은/는')} 최근 {n}개월 가운데 {e['max'][0]}에 **{nf(e['max'][1], d)}{ulab(unit)}**로 가장 컸으며, {lp} 값은 {nf(lv, d)}{ulab(unit)}로 첫 달보다 {nf(abs(lv - fv), d)}{du(unit)} {verb(unit, name, lv >= fv)}음"]
    sl = {"kind": "bar", "eyebrow": eb(group_of(name), f"{name} 최근 {n}개월", f"월, 단위: {unit}"), "head": fit_head(*heads),
          "labels": labels, "data": data, "unit": ulab(unit), "y": {"dec": d, "unit": "" if unit == "지수" else unit}, "hi": [{"max": True, "color": "dark"}, {"last": True, "color": "main"}],
          "notes": notes, "last": {"text": ("최고 " if imx == n - 1 and not allneg else "") + f"{nf(lv, d)}{ulab(unit)}"}, "avg": {"text": "평균 {v}"}, "foot": foot(s.get("source", ""), [f"{labels[0]}~{labels[-1]} 월 값, 평균은 ECOM 계산"])}
    if allneg:
        sl["hi"] = [{"idx": [imn], "color": "warn"}, {"last": True, "color": "main"}]
    return sl


def num(x):
    try:
        return float(str(x).replace(",", "").replace(MINUS, "-").replace("%", "").replace("+", ""))
    except Exception:
        return None


def unit_of(name):
    if re.search(r"금리|물가|실업률|성장률", name):
        return "%"
    if "수지" in name or "소득" in name:
        return "억 달러"
    if "환율" in name:
        return "원"
    if "고용" in name:
        return "천 명"
    return ""


def conv_table(m):
    s = m["slide"]
    cols, rows = s["cols"], s["rows"]
    rh = (s.get("read") or {}).get("head", "")
    hc = s.get("hiCol")
    chips = {k: {"text": v, "dir": "dn" if str(v)[:1] in (MINUS, "-") else "up"} for k, v in (s.get("chips") or {}).items()}
    c3 = []
    for j, c in enumerate(cols):
        x = {"t": c}
        if j == 0:
            x["align"] = "left"
        if j == hc:
            x["hc"] = True
        c3.append(x)
    r3 = [{"c": r, "hi": i == s.get("rowHi")} for i, r in enumerate(rows)]
    c0 = cols[0]
    unit = (re.search(r"\(([^)]+)\)", c0) or [None, ""])[1]
    head, topic, basis = "", s.get("title", ""), ""
    extra = {}
    if c0.startswith("항목") and all(re.match(r"^\d{4}$", c) for c in cols[1:]):   # 해별 누적
        per = (re.match(r"^(\S+?) ", rh) or [None, ""])[1]
        v = [(cols[j], num(rows[0][j])) for j in range(1, len(cols))]
        best = max(v, key=lambda x: x[1])
        prev = max(v[:-1], key=lambda x: x[1])
        big = max(rows[1:], key=lambda r: abs(num(r[-1]) or 0))
        head = f"{per} {josa(rows[0][0], '은/는')} {cols[-1]}년 **{rows[0][-1]}억 달러**로 {len(v)}개 해 가운데 {'가장 크며' if best[0] == cols[-1] else str(best[0]) + '년 다음으로 크며'}, 이 가운데 {josa(big[0], '이/가')} {big[-1]}억 달러를 차지함"
        topic, basis = f"{per} 경상수지 항목 누적, {cols[1]}~{cols[-1]}", f"{per} 누적, 단위: 억 달러"
        extra = {"bars": {"col": len(cols) - 1, "dec": 1}}
    elif c0.startswith("항목"):   # 항목 × 달
        tot = rows[0]
        comp = rows[1:]
        big = max(comp, key=lambda r: abs(num(r[-1]) or 0))
        neg = [r for r in comp if (num(r[-1]) or 0) < 0]
        dlt = num(tot[-1]) - num(tot[-2])
        head = f"{cols[-1]} {josa(tot[0], '은/는')} **{tot[-1]}억 달러**로 전월보다 {nf(abs(dlt), 1)}억 달러 {'늘었' if dlt >= 0 else '줄었'}으며, 항목 가운데 {josa(big[0], '이/가')} {big[-1]}억 달러로 가장 큼"
        if neg and hlen(head) < 70:
            head = head[:-1] + f"크고, {josa(neg[0][0], '은/는')} {neg[0][-1].lstrip(MINUS)}억 달러 적자임"
        topic, basis = f"국제수지 항목 {cols[1]}~{cols[-1]}", "월, 단위: 억 달러"
    elif c0 == "지표" and len(cols) == 4 and cols[-1] == "차이":   # 1년 전 대비
        up = [r for r in rows if (num(r[3]) or 0) > 0]
        u0 = unit_of(rows[0][0])
        head = f"{cols[2]} 값을 1년 전({cols[1]})과 견주면 {len(rows)}개 지표 가운데 {len(up)}개가 늘거나 올랐으며, {josa(rows[0][0], '은/는')} {rows[0][1]}{u0}에서 **{rows[0][2]}{u0}**로 바뀜"
        topic, basis = f"주요 지표 1년 전 대비 {cols[1]} → {cols[2]}", "월, 단위: 지표마다 다름"
    elif c0 == "지표":   # 지표 × 달(%)
        a, b = rows[0], rows[1]
        na, nb = re.sub(r"\s*\(%\)", "", a[0]), re.sub(r"\s*\(%\)", "", b[0])
        dd = num(a[-1]) - num(b[-1])
        ch = num(a[-1]) - num(a[1])
        dec = 2 if "." in a[-1] and len(a[-1].split(".")[1]) == 2 else 1
        tail = f"{cols[1]}과 같음" if round(ch, dec) == 0 else f"{cols[1]}보다 {nf(abs(ch), dec)}%p {'올랐' if ch >= 0 else '내렸'}음"
        head = f"{cols[-1]} {josa(na, '은/는')} **{a[-1]}%**, {josa(nb, '은/는')} {b[-1]}%로 차이는 {nf(abs(dd), dec)}%p이며, {josa(na, '은/는')} {tail}"
        topic, basis = f"{na} · {nb} 등 {cols[1]}~{cols[-1]}", "월, 단위: %"
    elif c0 == "분기":
        last = rows[-1]
        mx = max(rows, key=lambda r: num(r[1]))
        head = f"한국 실질 GDP는 {last[0]}에 직전 분기보다 **{last[1]}%** 늘었고 연율로는 {last[2]}%이며, 다섯 분기 가운데 {mx[0]}의 {mx[1]}%가 가장 높음"
        if num(last[1]) < 0:
            head = f"한국 실질 GDP는 {last[0]}에 직전 분기보다 **{last[1]}%** 줄었고 연율로는 {last[2]}%이며, 다섯 분기 가운데 {mx[0]}의 {mx[1]}%가 가장 높음"
        topic, basis = f"한국 실질 GDP 성장률 {rows[0][0]}~{last[0]}", "분기, 단위: %"
        extra = {"bars": {"col": 1, "dec": 1, "unit": "%"}}
    elif c0 == "순위":
        nm = (re.match(r"^(\S+?)(이|가) 가장", rh) or [None, s.get("title", "")])[1]
        u = cols[2]
        yrs = [r[1][:4] for r in rows]
        top = max(set(yrs), key=yrs.count)
        head = f"2021년 이후 {josa(nm, '이/가')} 가장 컸던 달은 **{rows[0][1]}({rows[0][2]}{u})**이며, 상위 {len(rows)}개 달 가운데 {yrs.count(top)}개가 {top}년임"
        topic, basis = f"{nm} 상위 {len(rows)}개 달(2021년 이후)", f"월, 단위: {u}"
        extra = {"bars": {"col": 2, "dec": 0 if u == "천 명" else 1}}
    sl = {"kind": "table", "eyebrow": eb(group_of(topic + " ".join(r[0] for r in rows)), topic, basis or s.get("sub", "")), "head": head or rh, "cols": c3, "rows": r3, "chips": chips,
          "foot": foot(s.get("source", ""))}
    sl.update(extra)
    return sl


CONV = {"kpi": conv_kpi, "bar": conv_bar, "table": conv_table}
