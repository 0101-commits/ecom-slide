"""지도 재료(5판) — 빌드 때 그 장에 필요한 나라 윤곽만 잘라 덱에 넣는다.
자료: style/geo/countries-{10m,50m,110m}.json (world-atlas 2.0.2 = Natural Earth 공개 자료, ISC) · names.json(한글 이름).
범위 폭이 좁을수록 고운 자료(10m)를 쓰고, 범위 밖은 점을 크게 솎아 파일을 작게 한다.
"""
import json
import math
from functools import lru_cache
from pathlib import Path

# 자주 쓰는 범위 [[서경, 남위], [동경, 북위]]
REGIONS = {
    "gulf": [[46.2, 21.2], [61.8, 31.4]], "hormuz": [[53.6, 24.2], [59.6, 28.2]],
    "redsea": [[30.0, 10.0], [46.0, 31.5]], "suez": [[29.5, 27.0], [35.5, 32.5]],
    "malacca": [[94.0, -2.0], [107.0, 9.0]], "taiwan": [[114.5, 20.0], [126.5, 28.5]],
    "korea": [[122.5, 32.0], [133.0, 43.5]], "eastasia": [[98.0, 15.0], [150.0, 50.0]],
    "blacksea": [[26.0, 40.0], [42.5, 48.0]], "panama": [[-84.5, 6.0], [-76.0, 11.0]],
    "northamerica": [[-130.0, 12.0], [-58.0, 58.0]], "europe": [[-12.0, 34.0], [42.0, 62.0]],
    "mideast": [[24.0, 10.0], [66.0, 42.0]], "asia": [[58.0, -12.0], [150.0, 56.0]],
    "southamerica": [[-85.0, -56.0], [-33.0, 14.0]], "africa": [[-20.0, -36.0], [55.0, 38.0]],
}
WIDE = {"world", "globe"}


@lru_cache(None)
def names(lib):
    return json.loads((Path(lib) / "style" / "geo" / "names.json").read_text(encoding="utf-8"))


@lru_cache(None)
def topo(lib, res):
    return json.loads((Path(lib) / "style" / "geo" / f"countries-{res}.json").read_text(encoding="utf-8"))


def find_id(lib, q):
    """'이란' · 'IRN' · 'Iran' · '364' → '364'"""
    q = str(q).strip()
    N = names(lib)
    if q in N:
        return q
    ql = q.lower()
    for k, v in N.items():
        if q == v["ko"] or q.upper() == v["a3"] or ql == v["en"].lower() or q in v.get("al", []):
            return k
    return None


@lru_cache(None)
def decoded(lib, res):
    """topojson → {id: [폴리곤[고리[[lon,lat]…]…]…]}"""
    t = topo(lib, res)
    sx, sy = t["transform"]["scale"]
    tx, ty = t["transform"]["translate"]
    arcs = []
    for a in t["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in a:
            x += dx
            y += dy
            pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)

    def ring(ix):
        out = []
        for i in ix:
            seg = arcs[i] if i >= 0 else arcs[~i][::-1]
            out.extend(seg if not out else seg[1:])
        return out

    shapes = {}
    for g in t["objects"]["countries"]["geometries"]:
        gid = g.get("id") or ("_" + g["properties"].get("name", ""))
        if g["type"] == "Polygon":
            polys = [[ring(r) for r in g["arcs"]]]
        elif g["type"] == "MultiPolygon":
            polys = [[ring(r) for r in p] for p in g["arcs"]]
        else:
            continue
        shapes.setdefault(gid, []).extend(polys)
    return shapes


def bbox_of(spec, lib):
    if isinstance(spec, str):
        if spec in REGIONS:
            return REGIONS[spec]
        if spec in WIDE:
            return None
        spec = [spec]
    if isinstance(spec, list) and len(spec) == 2 and all(isinstance(p, (list, tuple)) and len(p) == 2 and isinstance(p[0], (int, float)) for p in spec):
        return [list(spec[0]), list(spec[1])]
    # 나라 목록 → 그 나라들을 감싸는 범위(50m 기준)
    D = decoded(lib, "50m")
    xs, ys = [], []
    for q in spec if isinstance(spec, list) else [spec]:
        i = find_id(lib, q)
        polys = D.get(i, [])
        if not polys:
            continue
        main = max(polys, key=lambda pl: len(pl[0]))  # 본토(가장 큰 덩어리)
        for x, y in main[0]:
            xs.append(x)
            ys.append(y)
    if not xs:
        return None
    # 본토 위주: 위아래 2% 버림(먼 섬 때문에 범위가 커지지 않게)
    xs.sort(); ys.sort()
    k = int(len(xs) * .02)
    x0, x1, y0, y1 = xs[k], xs[-1 - k], ys[k], ys[-1 - k]
    px, py = (x1 - x0) * .08 + .5, (y1 - y0) * .08 + .5
    return [[x0 - px, y0 - py], [x1 + px, y1 + py]]


def res_for(bb):
    if not bb:
        return "110m"
    (x0, y0), (x1, y1) = bb
    span = max((x1 - x0) * math.cos(math.radians((y0 + y1) / 2)), y1 - y0)
    return "10m" if span <= 26 else ("50m" if span <= 85 else "110m")


def thin(r, tol, inside):
    out = [r[0]]
    for p in r[1:-1]:
        q = out[-1]
        t = tol if inside(p) else tol * 10
        if abs(p[0] - q[0]) + abs(p[1] - q[1]) >= t:
            out.append(p)
    out.append(r[-1])
    return out if len(out) >= 4 else None


def enc(r, dec):
    """고리 → 정수 차분 [x0, y0, dx1, dy1, …] (× 10^dec) — 엔진 l_fullmap.js 의 dec() 가 풂"""
    m = 10 ** dec
    out, px, py = [], 0, 0
    for x, y in r:
        ix, iy = round(x * m), round(y * m)
        out += [ix - px, iy - py]
        px, py = ix, iy
    return out


def pack(lib, spec, margin=0.25):
    """범위 spec → {'res','bb','f':[{id,n,a3,g:[[고리…]…]}]} (좌표 소수 자리 = 해상도별)"""
    bb = bbox_of(spec, lib)
    res = res_for(bb)
    D = decoded(lib, res)
    N = names(lib)
    if bb:
        (x0, y0), (x1, y1) = bb
        mx, my = (x1 - x0) * margin, (y1 - y0) * margin
        X0, Y0, X1, Y1 = x0 - mx, y0 - my, x1 + mx, y1 + my
        tol = max(x1 - x0, y1 - y0) / 1280 * 1.2  # 약 1.2px
    else:
        X0, Y0, X1, Y1 = -180, -90, 180, 90
        tol = .25
    dec = 3 if res == "10m" else (2 if res == "50m" else 1)

    def inside(p):
        return X0 <= p[0] <= X1 and Y0 <= p[1] <= Y1

    feats = []
    for gid, polys in D.items():
        keep = []
        for poly in polys:
            outer = poly[0]
            ox = [p[0] for p in outer]
            oy = [p[1] for p in outer]
            if max(ox) < X0 or min(ox) > X1 or max(oy) < Y0 or min(oy) > Y1:
                continue
            if max(max(ox) - min(ox), max(oy) - min(oy)) < tol * 2.5:  # 3px 안 되는 섬은 뺌
                continue
            rings = [thin(r, tol, inside) for r in poly]
            if not rings[0]:
                continue
            keep.append([enc(r, dec) for r in rings if r])
        if keep:
            n = N.get(gid, {})
            feats.append({"id": gid, "n": n.get("ko", gid.lstrip("_")), "a3": n.get("a3", ""), "g": keep})
    return {"res": res, "bb": bb, "dec": dec, "f": feats}


def canon(lib, q):
    if not isinstance(q, str):
        return q
    i = find_id(lib, q)
    return names(lib)[i]["ko"] if i and i in names(lib) else q


def normalize(s, lib):
    """나라 이름 표기를 지도 자료 이름(한글 짧은 이름)으로 맞춤 — 사우디아라비아 → 사우디, USA → 미국"""
    for k in ("paint", "tags", "points"):
        for it in s.get(k) or []:
            if isinstance(it, dict) and isinstance(it.get("c"), str):
                it["c"] = canon(lib, it["c"])
    for it in s.get("flows") or []:
        for k in ("from", "to"):
            it[k] = canon(lib, it.get(k))
    if isinstance(s.get("values"), dict):
        s["values"] = {canon(lib, k): v for k, v in s["values"].items()}
    if s.get("key"):
        s["key"] = canon(lib, s["key"])

    def walk(o):  # 칸 어디든 at 에 나라 이름이 오면 맞춤
        if isinstance(o, dict):
            for k, v in o.items():
                if k == "at" and isinstance(v, str):
                    o[k] = canon(lib, v)
                elif not k.startswith("_"):
                    walk(v)
        elif isinstance(o, list):
            for x in o:
                walk(x)
    walk(s)


GEO_LAY = {"map": ("region", "bubbles", "lanes"), "kpi": ("map",), "hub": ("map",), "discuss": ("map",)}


def derive(s, lib):
    """장 자료에 나온 나라 이름 · 좌표(at · from · to · via · fill · iso · view)로 범위를 정함"""
    pts, cs = [], []

    def walk(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k.startswith("_"):
                    continue
                if k in ("at", "from", "to", "c"):
                    if isinstance(v, str):
                        cs.append(v)
                    elif isinstance(v, list) and len(v) == 2 and all(isinstance(x, (int, float)) for x in v):
                        pts.append(v)
                elif k == "via" and isinstance(v, list):
                    pts.extend(p for p in v if isinstance(p, list) and len(p) == 2)
                elif k == "fill" and isinstance(v, dict):
                    cs.extend(v.keys())
                elif k == "iso" and isinstance(v, list):
                    cs.extend(v)
                elif k == "view" and isinstance(v, dict) and v.get("bbox"):
                    b = v["bbox"]
                    pts.extend([[b[0], b[1]], [b[2], b[3]]])
                else:
                    walk(v)
        elif isinstance(o, list):
            for x in o:
                walk(x)

    v = s.get("view") or {}
    if v.get("bbox"):  # 지은이가 정한 범위가 먼저
        b = v["bbox"]
        return [[b[0], b[1]], [b[2], b[3]]]
    walk(s)
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    cs = [c for c in cs if find_id(lib, c)]
    if cs:
        bb = bbox_of(cs, lib)
        if bb:
            xs += [bb[0][0], bb[1][0]]
            ys += [bb[0][1], bb[1][1]]
    if not xs:
        return "world"
    x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    px, py = max((x1 - x0) * .12, 2), max((y1 - y0) * .14, 2)
    x0, x1, y0, y1 = x0 - px, x1 + px, y0 - py, y1 + py
    if x1 - x0 < 14:
        c = (x0 + x1) / 2; x0, x1 = c - 7, c + 7
    if y1 - y0 < 9:
        c = (y0 + y1) / 2; y0, y1 = c - 4.5, c + 4.5
    return [[max(-180, x0), max(-85, y0)], [min(180, x1), min(85, y1)]]


def add_geo(deck, lib):
    """지도 쓰는 장(fullmap · 지도 위 배치)에 _geo 를 붙이고, 덱에 세계 110m(_w110)를 한 번 넣는다. 지도 장이 없으면 None."""
    used = False
    for s in deck.get("slides", []):
        g = s.get("geo") if isinstance(s.get("geo"), dict) else None
        lay = s.get("layout") in GEO_LAY.get(s.get("kind"), ())
        if s.get("kind") != "fullmap" and not g and not lay:
            continue
        if lay and not (g and g.get("region")):
            normalize(s, lib)
            s["_geo"] = pack(lib, derive(s, lib), margin=.2)
            used = True
            continue
        used = True
        normalize(s, lib)
        spec = (g or {}).get("region", s.get("region", "world"))
        if s.get("form") in ("globe", "flow") and spec in (None, "world"):
            continue
        s["_geo"] = pack(lib, spec, margin=float((g or s).get("margin", .25)))
    if not used:
        return None
    w = pack(lib, "world")
    deck["_w110"] = {"dec": w["dec"], "f": w["f"]}
    return True
