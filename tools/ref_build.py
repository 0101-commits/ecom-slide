# HCG 레퍼런스 → ECOM 공개 레퍼런스
# 관리자 PC 에서만 돈다(HCG 창고는 비공개). 장마다:
#   ① 원본에서 골격을 뽑음 — 도형 자리 · 모양 · 색 역할 · 칸마다 글자 「수」만. 글 · 이름 · 그림은 하나도 꺼내지 않음
#   ② 정리한 PPTX 를 씀 — 글 모두 「///」, 그림 모두 회색 자리, 메모 · 댓글 · 연결 · 숨은 속성 지움
#   ③ 정리본을 다시 검사(check_pptx) — 하나라도 걸리면 그 장은 빼고 보고서에 적음
# 실행: python -X utf8 tools/ref_build.py --meta <meta.json> --src <장 pptx 폴더> --build <작업 폴더> --lib library [--jobs 6] [--limit N]
import argparse, hashlib, json, math, os, posixpath, re, sys, zipfile
from collections import Counter, defaultdict
from multiprocessing import Pool
from pathlib import Path

from lxml import etree

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "c": "http://schemas.openxmlformats.org/drawingml/2006/chart",
    "pr": "http://schemas.openxmlformats.org/package/2006/relationships",
}
A, P, R, C = (lambda t: "{%s}%s" % (NS["a"], t)), (lambda t: "{%s}%s" % (NS["p"], t)), (lambda t: "{%s}%s" % (NS["r"], t)), (lambda t: "{%s}%s" % (NS["c"], t))

# 빼는 유형 : 사람 · 고객 목록 · 실적 · 회사 소개 · 솔루션 · 방법론
EXCLUDE_TYPES = {"T302", "T303", "T401", "T402", "T403", "T404", "T405", "T407", "T408"}
EXCLUDE_STRUCTS = {"화면 캡처"}

# 구조 → 화면 종류 · 도식 배치
STRUCT_KIND = {
    "가로 단계": ("diagram", "flow"), "세로 단계": ("diagram", "flow"), "순환": ("diagram", "cycle"),
    "로드맵·타임라인": ("diagram", "timeline"), "간트": ("diagram", "timeline"),
    "3~4단 기둥": ("diagram", "columns"), "카드 격자": ("diagram", "columns"), "좌우 2단": ("diagram", "columns"),
    "위 요약+아래 상세": ("diagram", "columns"), "줄 구조": ("diagram", "columns"), "프레임워크 블록": ("diagram", "columns"),
    "하우스": ("diagram", "columns"), "계층·조직도": ("diagram", "tree"), "로직 트리": ("diagram", "tree"),
    "피라미드": ("diagram", "pyramid"), "중심-방사": ("diagram", "hub"), "벤·동심원": ("diagram", "venn"),
    "2×2 매트릭스": ("diagram", "matrix"), "좌우 비교": ("compare", ""), "차트+시사점": ("chart", ""),
    "일반 표": ("table", ""), "옵션 비교표": ("table", ""), "평가표": ("table", ""), "역할표": ("table", ""),
}

PRST = {
    "rect": "rect", "roundRect": "round", "round1Rect": "round", "round2SameRect": "round", "round2DiagRect": "round",
    "snip1Rect": "round", "snip2SameRect": "round", "flowChartAlternateProcess": "round", "flowChartProcess": "rect",
    "ellipse": "ellipse", "flowChartConnector": "ellipse", "donut": "ellipse", "pie": "ellipse", "blockArc": "ellipse", "arc": "ellipse",
    "chevron": "chevron", "homePlate": "pentagon", "rightArrow": "arrowR", "notchedRightArrow": "arrowR",
    "stripedRightArrow": "arrowR", "downArrow": "arrowD", "triangle": "triangle", "rtTriangle": "triangle",
    "diamond": "diamond", "flowChartDecision": "diamond", "hexagon": "hexagon",
}
LINE_PRST = {"line", "straightConnector1", "bentConnector2", "bentConnector3", "curvedConnector3"}
DROP_REL = ("/notesSlide", "/comments", "/commentAuthors", "/image", "/oleObject", "/package", "/tags", "/hyperlink",
            "/customXml", "/video", "/audio", "/media", "/font", "/authors", "/thumbnail", "/custom-properties",
            "/externalLink", "/vmlDrawing", "/control", "/activeXControl", "/diagramDrawing", "/hdphoto")
APP_XML = (b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n<Properties xmlns="http://schemas.openxmlformats.org/'
           b'officeDocument/2006/extended-properties"><Application>Microsoft Office PowerPoint</Application><Slides>1</Slides>'
           b'<Company>ECOM</Company></Properties>')
CORE_XML = (b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/'
            b'package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:creator>ECOM</dc:creator>'
            b'<cp:lastModifiedBy>ECOM</cp:lastModifiedBy></cp:coreProperties>')
W, H = 1280, 720


# ───────── 공통 ─────────
def rels_of(part):
    return posixpath.join(posixpath.dirname(part), "_rels", posixpath.basename(part) + ".rels")


def target(part, t):
    return t.lstrip("/") if t.startswith("/") else posixpath.normpath(posixpath.join(posixpath.dirname(part), t))


def slide_part(pkg):
    rel = etree.fromstring(pkg["ppt/_rels/presentation.xml.rels"])
    for x in rel:
        if x.get("Type", "").endswith("/slide"):
            return target("ppt/presentation.xml", x.get("Target"))
    raise ValueError("장 없음")


def slide_size(pkg):
    s = etree.fromstring(pkg["ppt/presentation.xml"]).find(P("sldSz"))
    return int(s.get("cx")), int(s.get("cy"))


# ───────── ① 골격 ─────────
def _color_role(el):
    """spPr 안 채우기 → acc · dark · mid · light · none"""
    if el is None:
        return None
    if el.find(A("noFill")) is not None:
        return "none"
    sf = el.find(A("solidFill"))
    if sf is None:
        gf = el.find(A("gradFill"))
        if gf is not None:
            gs = gf.find(".//" + A("gs"))
            sf = gs
        elif el.find(A("blipFill")) is not None or el.find(A("pattFill")) is not None:
            return "mid"
        else:
            return None
    if sf is None:
        return None
    s = sf.find(A("schemeClr"))
    if s is not None:
        v = s.get("val", "")
        mod = {etree.QName(x).localname: int(x.get("val", "0")) for x in s}
        off, lm, tint = mod.get("lumOff", 0), mod.get("lumMod", 100000), mod.get("tint", 100000)
        if v.startswith("accent") or v in ("tx2", "dk2"):
            if off >= 40000 or tint <= 60000:
                return "light"
            if off >= 20000:
                return "mid"
            if lm <= 60000:
                return "dark"
            return "acc" if v in ("accent1", "accent2") else "mid"
        if v in ("tx1", "dk1"):
            return "light" if off >= 75000 else ("mid" if off >= 35000 else "dark")
        return "mid" if lm <= 85000 else "light"
    rgb = sf.find(A("srgbClr"))
    if rgb is None:
        rgb = sf.find(A("sysClr"))
        hexv = rgb.get("lastClr") if rgb is not None else None
    else:
        hexv = rgb.get("val")
    if not hexv or len(hexv) != 6:
        return "mid"
    r, g, b = (int(hexv[i:i + 2], 16) / 255 for i in (0, 2, 4))
    mx, mn = max(r, g, b), min(r, g, b)
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    sat = 0 if mx == 0 else (mx - mn) / mx
    if lum > 0.86:
        return "light"
    if lum < 0.22:
        return "dark"
    if sat > 0.35:
        return "acc"
    return "mid"


def _has_line(sppr, style):
    ln = sppr.find(A("ln")) if sppr is not None else None
    if ln is not None:
        if ln.find(A("noFill")) is not None:
            return False
        if ln.find(A("solidFill")) is not None or ln.find(A("gradFill")) is not None:
            return True
    if style is not None:
        lr = style.find(A("lnRef"))
        return lr is not None and lr.get("idx", "0") != "0"
    return False


def _arrow(sppr):
    ln = sppr.find(A("ln")) if sppr is not None else None
    if ln is None:
        return False
    for e in ("headEnd", "tailEnd"):
        x = ln.find(A(e))
        if x is not None and x.get("type", "none") != "none":
            return True
    return False


def _txt(el):
    tb = el.find(P("txBody"))
    if tb is None:
        return 0, 0, 0
    chars = paras = 0
    sz = 0
    for para in tb.findall(A("p")):
        t = "".join(x.text or "" for x in para.iter(A("t")))
        n = len(re.sub(r"\s", "", t))
        if n:
            chars += n
            paras += 1
        for rp in para.iter(A("rPr"), A("defRPr"), A("endParaRPr")):
            if rp.get("sz"):
                sz = max(sz, int(rp.get("sz")) // 100)
    return chars, paras, sz


class Xf:
    """그룹 좌표 → 장 좌표(EMU)"""
    def __init__(self, sx=1.0, sy=1.0, dx=0.0, dy=0.0):
        self.sx, self.sy, self.dx, self.dy = sx, sy, dx, dy

    def child(self, grp_xfrm):
        off, ext = grp_xfrm.find(A("off")), grp_xfrm.find(A("ext"))
        cho, che = grp_xfrm.find(A("chOff")), grp_xfrm.find(A("chExt"))
        if off is None or ext is None or cho is None or che is None:
            return self
        cx, cy = int(che.get("cx")) or 1, int(che.get("cy")) or 1
        ksx, ksy = int(ext.get("cx")) / cx, int(ext.get("cy")) / cy
        return Xf(self.sx * ksx, self.sy * ksy,
                  self.dx + self.sx * (int(off.get("x")) - int(cho.get("x")) * ksx),
                  self.dy + self.sy * (int(off.get("y")) - int(cho.get("y")) * ksy))

    def box(self, xfrm):
        off, ext = xfrm.find(A("off")), xfrm.find(A("ext"))
        if off is None or ext is None:
            return None
        x, y = self.dx + self.sx * int(off.get("x")), self.dy + self.sy * int(off.get("y"))
        return x, y, self.sx * int(ext.get("cx")), self.sy * int(ext.get("cy"))


def _ph_type(el):
    ph = el.find(".//" + P("nvPr") + "/" + P("ph"))
    if ph is None:
        return None
    return ph.get("type", "body")


def skeleton(pkg):
    sp_name = slide_part(pkg)
    cx, cy = slide_size(pkg)
    kx, ky = W / cx, H / cy
    root = etree.fromstring(pkg[sp_name])
    tree = root.find(P("cSld") + "/" + P("spTree"))
    boxes, lines = [], []

    def put(kind, b, el, extra=None):
        x, y, w, h = b[0] * kx, b[1] * ky, b[2] * kx, b[3] * ky
        if w < 3 and h < 3:
            return
        if x > W or y > H or x + w < 0 or y + h < 0:
            return
        d = {"k": kind, "x": round(x), "y": round(y), "w": round(w), "h": round(h)}
        if extra:
            d.update(extra)
        boxes.append(d)

    def walk(parent, xf):
        for el in parent:
            tag = etree.QName(el).localname
            if tag == "grpSp":
                gx = el.find(P("grpSpPr") + "/" + A("xfrm"))
                walk(el, xf.child(gx) if gx is not None else xf)
            elif tag in ("sp", "cxnSp"):
                sppr = el.find(P("spPr"))
                xfrm = sppr.find(A("xfrm")) if sppr is not None else None
                if xfrm is None:
                    continue
                b = xf.box(xfrm)
                if b is None:
                    continue
                pg = sppr.find(A("prstGeom"))
                prst = pg.get("prst") if pg is not None else ("custom" if sppr.find(A("custGeom")) is not None else "rect")
                style = el.find(P("style"))
                if tag == "cxnSp" or prst in LINE_PRST:
                    x1, y1, w, h = b
                    fh, fv = xfrm.get("flipH") == "1", xfrm.get("flipV") == "1"
                    xa, xb = (x1 + w, x1) if fh else (x1, x1 + w)
                    ya, yb = (y1 + h, y1) if fv else (y1, y1 + h)
                    lines.append({"x1": round(xa * kx), "y1": round(ya * ky), "x2": round(xb * kx), "y2": round(yb * ky), "arrow": _arrow(sppr)})
                    continue
                chars, paras, sz = _txt(el)
                fill = _color_role(sppr)
                if fill is None:
                    fr = style.find(A("fillRef")) if style is not None else None
                    fill = "acc" if fr is not None and fr.get("idx", "0") != "0" else "none"
                ex = {"fill": fill, "line": _has_line(sppr, style)}
                rot = int(xfrm.get("rot", "0")) // 60000
                if rot:
                    ex["rot"] = rot
                if chars:
                    ex.update({"chars": chars, "paras": paras, "sz": sz})
                ph = _ph_type(el)
                if ph:
                    ex["ph"] = ph
                put(PRST.get(prst, "other"), b, el, ex)
            elif tag == "pic":
                sppr = el.find(P("spPr"))
                xfrm = sppr.find(A("xfrm")) if sppr is not None else None
                b = xf.box(xfrm) if xfrm is not None else None
                if b:
                    put("rect", b, el, {"fill": "light", "line": False, "pic": True})
            elif tag == "graphicFrame":
                xfrm = el.find(P("xfrm"))
                b = xf.box(xfrm) if xfrm is not None else None
                if not b:
                    continue
                gd = el.find(A("graphic") + "/" + A("graphicData"))
                uri = gd.get("uri", "") if gd is not None else ""
                if uri.endswith("/table"):
                    tbl = gd.find(A("tbl"))
                    rows = tbl.findall(A("tr"))
                    cols = tbl.find(A("tblGrid")).findall(A("gridCol"))
                    put("table", b, el, {"fill": "none", "line": True, "rows": len(rows), "cols": len(cols)})
                elif uri.endswith("/chart"):
                    ch = {"fill": "none", "line": False}
                    cref = gd.find(C("chart"))
                    rid = cref.get(R("id")) if cref is not None else None
                    try:
                        rel = etree.fromstring(pkg[rels_of(sp_name)])
                        tgt = next(target(sp_name, x.get("Target")) for x in rel if x.get("Id") == rid)
                        cx_ = etree.fromstring(pkg[tgt])
                        pa = cx_.find(".//" + C("plotArea"))
                        types = [etree.QName(t).localname.replace("Chart", "") for t in pa if etree.QName(t).localname.endswith("Chart")]
                        sers = pa.findall(".//" + C("ser"))
                        pts = [len(s_.findall(".//" + C("cat") + "//" + C("pt"))) for s_ in sers]
                        ch.update({"chart": "+".join(types) or "other", "ser": len(sers), "cat": max(pts) if pts else 0})
                    except Exception:
                        ch["chart"] = "other"
                    put("chart", b, el, ch)
                elif "diagram" in uri:
                    put("smartart", b, el, {"fill": "none", "line": False})
                else:
                    put("rect", b, el, {"fill": "light", "line": False, "pic": True})

    walk(tree, Xf())
    # 머리(어깨끈 · 핵심 메시지) · 꼬리 자리 빼고 본문 자리
    body = [b for b in boxes if not (b.get("ph") in ("title", "ctrTitle", "subTitle", "dt", "ftr", "sldNum"))
            and not (b.get("ph") and b["y"] < 0.22 * H) and b["y"] >= 0.10 * H and b["y"] + b["h"] > 0.20 * H
            and not (b["y"] > 0.93 * H and b["h"] < 0.07 * H)]
    if body:
        bx0 = max(0, min(b["x"] for b in body)); by0 = max(0, min(b["y"] for b in body))
        bx1 = min(W, max(b["x"] + b["w"] for b in body)); by1 = min(H, max(b["y"] + b["h"] for b in body))
    else:
        bx0, by0, bx1, by1 = 0, round(0.2 * H), W, H
    inb = set(map(id, body))
    boxes = [b for b in boxes if id(b) in inb]
    for b in boxes:
        b.pop("ph", None)
    lines = [l for l in lines if min(l["y1"], l["y2"]) >= by0 - 4]
    # 글 칸 = 읽는 차례(위 → 아래, 같은 줄은 왼 → 오)
    tol = 0.04 * H
    slots = sorted([b for b in boxes if b.get("chars") and b["k"] not in ("table", "chart")],
                   key=lambda b: (round((b["y"] + b["h"] / 2) / tol), b["x"]))
    for i, b in enumerate(slots):
        b["slot"] = i

    def clusters(vals, t):
        vals = sorted(vals)
        n, last = 0, None
        for v in vals:
            if last is None or v - last > t:
                n += 1
            last = v
        return n

    cols = clusters([b["x"] + b["w"] / 2 for b in slots], 0.06 * W) if slots else 0
    rows = clusters([b["y"] + b["h"] / 2 for b in slots], 0.06 * H) if slots else 0
    steps = sum(1 for b in boxes if b["k"] in ("chevron", "pentagon", "arrowR"))
    return {"w": W, "h": H, "body": [round(bx0), round(by0), round(bx1 - bx0), round(by1 - by0)],
            "boxes": boxes, "lines": lines}, {"nb": len(boxes), "ns": len(slots), "cols": cols, "rows": rows, "steps": steps,
                                                  "tbl": sum(1 for b in boxes if b["k"] == "table"),
                                                  "cht": sum(1 for b in boxes if b["k"] == "chart"),
                                                  "pic": sum(1 for b in boxes if b.get("pic"))}


# ───────── ② 정리 ─────────
GRAY = "D9D9D9"


def _gray_sp(idn, xfrm_el, a_ns_xfrm=True):
    sp = etree.Element(P("sp"))
    nv = etree.SubElement(sp, P("nvSpPr"))
    etree.SubElement(nv, P("cNvPr"), id=str(idn), name="Picture %s" % idn)
    etree.SubElement(nv, P("cNvSpPr"))
    etree.SubElement(nv, P("nvPr"))
    sppr = etree.SubElement(sp, P("spPr"))
    xf = etree.SubElement(sppr, A("xfrm"))
    if xfrm_el is not None:
        for k in ("rot", "flipH", "flipV"):
            if xfrm_el.get(k):
                xf.set(k, xfrm_el.get(k))
        for child in xfrm_el:
            if etree.QName(child).localname in ("off", "ext"):
                xf.append(etree.fromstring(etree.tostring(child)))
    g = etree.SubElement(sppr, A("prstGeom"), prst="rect")
    etree.SubElement(g, A("avLst"))
    f = etree.SubElement(sppr, A("solidFill"))
    etree.SubElement(f, A("srgbClr"), val=GRAY)
    return sp


def _solid_gray():
    f = etree.Element(A("solidFill"))
    etree.SubElement(f, A("srgbClr"), val=GRAY)
    return f


def scrub_xml(name, data, dropped_ids):
    root = etree.fromstring(data)
    is_master = "/slideMasters/" in "/" + name or "/slideLayouts/" in "/" + name
    # 그림 → 회색 자리(바탕 · 레이아웃의 그림은 지움 — 로고)
    for pic in list(root.iter(P("pic"))):
        par = pic.getparent()
        if is_master:
            par.remove(pic)
            continue
        cnv = pic.find(".//" + P("cNvPr"))
        sppr = pic.find(P("spPr"))
        xf = sppr.find(A("xfrm")) if sppr is not None else None
        par.replace(pic, _gray_sp(cnv.get("id") if cnv is not None else 1, xf))
    # OLE · 알 수 없는 그림 틀 → 회색 자리
    for gf in list(root.iter(P("graphicFrame"))):
        gd = gf.find(A("graphic") + "/" + A("graphicData"))
        uri = gd.get("uri", "") if gd is not None else ""
        if uri.endswith(("/table", "/chart")) or "diagram" in uri:
            continue
        cnv = gf.find(".//" + P("cNvPr"))
        x = gf.find(P("xfrm"))
        par = gf.getparent()
        if is_master:
            par.remove(gf)
        else:
            par.replace(gf, _gray_sp(cnv.get("id") if cnv is not None else 1, x))
    # 그림 채우기 · 배경 그림 → 회색
    for bf in list(root.iter(A("blipFill"), P("blipFill"))):
        par = bf.getparent()
        if par is not None and etree.QName(par).localname != "pic":
            par.replace(bf, _solid_gray())
    # 글 → ///
    for t in root.iter(A("t")):
        if t.text and t.text.strip():
            t.text = "///"
    # 차트 숫자 · 글 캐시
    for v in root.iter(C("v")):
        par = v.getparent().getparent() if v.getparent() is not None else None
        anc = [etree.QName(x).localname for x in v.iterancestors()]
        if "numCache" in anc or "numLit" in anc:
            pt = v.getparent()
            idx = int(pt.get("idx", "0")) if pt is not None and pt.get("idx") else 0
            v.text = str(idx % 5 + 1)
        else:
            v.text = "///"
    for f in root.iter(C("f")):
        f.text = "Sheet1!$A$1"
    for fc in root.iter(C("formatCode")):
        pass
    for ed in list(root.iter(C("externalData"))):
        ed.getparent().remove(ed)
    # 이름 · 설명 · 연결 · 사용자 표시
    for nv in root.iter(P("cNvPr"), "{http://schemas.microsoft.com/office/drawing/2008/diagram}cNvPr"):
        nv.set("name", "Shape %s" % nv.get("id", "0"))
        for k in ("descr", "title"):
            if k in nv.attrib:
                del nv.attrib[k]
    for tag in ("hlinkClick", "hlinkHover", "hlinkMouseOver"):
        for e in list(root.iter(A(tag))):
            e.getparent().remove(e)
    for e in list(root.iter(P("custDataLst"))):
        e.getparent().remove(e)
    if etree.QName(root).localname == "presentation":
        for tag in ("custShowLst", "extLst", "embeddedFontLst", "custDataLst"):
            for e in list(root.findall(P(tag))):
                root.remove(e)
    csld = root.find(P("cSld"))
    if csld is not None and csld.get("name"):
        csld.set("name", "ECOM")
    if etree.QName(root).localname == "theme":
        root.set("name", "ECOM")
        for e in root.iter(A("clrScheme"), A("fontScheme"), A("fmtScheme")):
            e.set("name", "ECOM")
    # 지운 관계를 가리키는 나머지
    if dropped_ids:
        for el in list(root.iter()):
            for k, v in list(el.attrib.items()):
                if k.startswith("{%s}" % NS["r"]) and v in dropped_ids:
                    p_ = el.getparent()
                    if p_ is not None:
                        p_.remove(el)
                    break
    return etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)


def reachable(out):
    seen, todo = set(), [""]
    while todo:
        part = todo.pop()
        rn = "_rels/.rels" if part == "" else rels_of(part)
        if rn not in out:
            continue
        for rel in etree.fromstring(out[rn]):
            if rel.get("TargetMode") == "External":
                continue
            t = rel.get("Target", "")
            p_ = target(part, t) if part else posixpath.normpath(t.lstrip("/"))
            if p_ in out and p_ not in seen:
                seen.add(p_)
                todo.append(p_)
    return seen


def scrub(pkg):
    out = dict(pkg)
    for n in ("ppt/viewProps.xml", "ppt/_rels/viewProps.xml.rels"):
        out.pop(n, None)
    dropped = defaultdict(set)
    for n in list(out):
        if not n.endswith(".rels"):
            continue
        rel = etree.fromstring(out[n])
        for x in list(rel):
            t = x.get("Type", "")
            if t.endswith(DROP_REL) or x.get("TargetMode") == "External" or "viewProps" in x.get("Target", ""):
                src = n.replace("_rels/", "")[:-5]
                dropped[src].add(x.get("Id"))
                rel.remove(x)
        out[n] = etree.tostring(rel, xml_declaration=True, encoding="UTF-8", standalone=True)
    keep = reachable(out)
    for n in list(out):
        if n in ("[Content_Types].xml", "_rels/.rels"):
            continue
        src = n.replace("_rels/", "")[:-5] if n.endswith(".rels") else n
        if src not in keep:
            del out[n]
    ct = etree.fromstring(out["[Content_Types].xml"])
    for o in list(ct):
        if o.tag.endswith("Override") and o.get("PartName", "").lstrip("/") not in out:
            ct.remove(o)
    out["[Content_Types].xml"] = etree.tostring(ct, xml_declaration=True, encoding="UTF-8", standalone=True)
    for n in list(out):
        if n == "docProps/app.xml":
            out[n] = APP_XML
        elif n == "docProps/core.xml":
            out[n] = CORE_XML
        elif n.endswith(".xml") and not n.endswith(".rels") and n != "[Content_Types].xml" and n.startswith("ppt/"):
            out[n] = scrub_xml(n, out[n], dropped.get(n, set()))
    return out


# ───────── ③ 정리본 검사 ─────────
BAD_EXT = re.compile(r"\.(png|jpe?g|gif|bmp|emf|wmf|tiff?|svg|wdp|jxr|mp4|wav|mp3|m4a|xlsx|xls|bin|docx|ole|vml|fntdata|odttf)$", re.I)


def check_pptx(out, hashes=None):
    bad = []
    for n, d in out.items():
        if BAD_EXT.search(n):
            bad.append("파일 " + n)
            continue
        if re.search(r"(notesSlide|comment|customXml/|/tags/|thumbnail|custom\.xml|embeddings/|media/)", n):
            bad.append("남은 부품 " + n)
        if not n.endswith(".xml") and not n.endswith(".rels"):
            continue
        root = etree.fromstring(d)
        for t in root.iter(A("t"), C("v")):
            if t.text and t.text.strip() and t.text.strip() != "///" and not re.fullmatch(r"\d+", t.text.strip()):
                bad.append("글 남음 %s" % n)
                break
        for x in root.iter():
            if x.get("TargetMode") == "External":
                bad.append("바깥 연결 %s" % n)
            for k in ("descr", "title"):
                if x.get(k) and etree.QName(x).localname == "cNvPr":
                    bad.append("설명 남음 %s" % n)
        if hashes:
            for s_ in strings_of(root):
                if hit(s_, hashes):
                    bad.append("고객명 해시 %s" % n)
                    break
    return sorted(set(bad))


def strings_of(root):
    """사람이 읽는 글이 들어갈 수 있는 자리만 — 글 마디 · 이름 · 설명 · 제목"""
    for x in root.iter():
        if isinstance(x.tag, str) and x.text and x.text.strip():
            yield x.text
        for k in ("name", "descr", "title"):
            v = x.get(k)
            if v:
                yield v


def norm(s):
    import unicodedata
    return re.sub(r"[\s()·.\-_,]", "", unicodedata.normalize("NFKC", s)).lower()


HANGUL = re.compile(r"[가-힣]")


def hash_key():
    """고객명 해시 열쇠 — 환경 변수 ECOM_HASH_KEY(GitHub 비밀값 · 관리자 PC). 열쇠 없이는 이름을 대어 봐도 맞춰 볼 수 없음"""
    return os.environ.get("ECOM_HASH_KEY", "").strip()


def _h(x, key=None):
    import hmac
    k = (key if key is not None else hash_key()).encode()
    if not k:
        raise RuntimeError("ECOM_HASH_KEY 없음")
    return hmac.new(k, x.encode(), hashlib.sha256).hexdigest()[:20]


def hit(s, hashes):
    """한글이 든 이름은 글 속 아무 자리 조각으로, 영문 · 숫자 이름은 낱말 단위(1~3낱말 이어 붙임)로 대조. 긴 글도 끝까지 봄"""
    import unicodedata
    ns = norm(s)
    for i in range(len(ns)):
        for j in range(i + 2, min(len(ns), i + 20) + 1):
            w = ns[i:j]
            if HANGUL.search(w) and _h(w) in hashes:
                return w
    # 영문 낱말 : S-Oil · A&B 같은 이름은 한 낱말로, 띄어 쓴 이름(LG Display)은 2글자 넘는 낱말끼리만 이어 봄
    toks = [norm(t) for t in re.findall(r"[A-Za-z0-9][A-Za-z0-9&\-.]*", unicodedata.normalize("NFKC", s))]
    for i in range(len(toks)):
        for n in (1, 2, 3):
            part = toks[i:i + n]
            # 한 글자 낱말은 맨 앞에서 긴 낱말(4글자+)과 이을 때만(K Bank 꼴) — 코드의 「sk d」 같은 우연 막기
            if len(part) < n or (n > 1 and (any(len(t) < 2 for t in part[1:]) or (len(part[0]) < 2 and len(part[1]) < 4))):
                continue
            w = "".join(part)
            if len(w) >= 2 and _h(w) in hashes:
                return w
    return None


# ───────── 일 나누기 ─────────
_HASH = None


def _init(hpath):
    global _HASH
    _HASH = set(json.load(open(hpath, encoding="utf-8"))["h"]) if hpath else None


def work(job):
    rid, src, dst = job
    try:
        with zipfile.ZipFile(src) as z:
            pkg = {n: z.read(n) for n in z.namelist()}
        skel, stat = skeleton(pkg)
        out = scrub(pkg)
        bad = check_pptx(out, _HASH)
        if not bad:
            with zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED) as z:
                z.writestr("[Content_Types].xml", out["[Content_Types].xml"])
                for n, d in out.items():
                    if n != "[Content_Types].xml":
                        z.writestr(n, d)
            try:  # 정리본이 PPTX 로 다시 열리는지
                from pptx import Presentation
                Presentation(dst)
            except Exception as e:
                bad = ["다시 열기 실패 %s" % type(e).__name__]
                os.remove(dst)
        return rid, skel, stat, bad, None
    except Exception as e:
        return rid, None, None, [], "%s: %s" % (type(e).__name__, e)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--meta", required=True)
    ap.add_argument("--src", required=True)
    ap.add_argument("--build", required=True)
    ap.add_argument("--lib", required=True)
    ap.add_argument("--hash", default="")
    ap.add_argument("--jobs", type=int, default=6)
    ap.add_argument("--limit", type=int, default=0)
    a = ap.parse_args()
    meta = json.load(open(a.meta, encoding="utf-8"))
    rows = [r for r in meta if r.get("type") not in EXCLUDE_TYPES and r.get("s_name") not in EXCLUDE_STRUCTS and r.get("var_rep")]
    struct_n = Counter(r.get("s_name") or "기타" for r in rows)
    codes = {s: "S%02d" % (i + 1) for i, (s, _) in enumerate(struct_n.most_common())}
    rows.sort(key=lambda r: (codes[r.get("s_name") or "기타"], r.get("type") or "", r["id"]))
    if a.limit:
        rows = rows[:a.limit]
    build = Path(a.build); (build / "pptx").mkdir(parents=True, exist_ok=True)
    lib = Path(a.lib); (lib / "skeletons").mkdir(parents=True, exist_ok=True)
    jobs, private = [], {}
    for i, r in enumerate(rows, 1):
        rid = "r%05d" % i
        private[rid] = r["id"]
        jobs.append((rid, str(Path(a.src) / ("%s.pptx" % r["id"])), str(build / "pptx" / ("%s.pptx" % rid))))
    json.dump(private, open(build / "map_private.json", "w", encoding="utf-8"))
    byid = {("r%05d" % i): r for i, r in enumerate(rows, 1)}
    res, bundles, items, report = {}, defaultdict(dict), [], {"bad": {}, "err": {}}
    with Pool(a.jobs, initializer=_init, initargs=(a.hash,)) as pool:
        for k, (rid, skel, stat, bad, err) in enumerate(pool.imap_unordered(work, jobs, chunksize=8), 1):
            if err:
                report["err"][rid] = err
            elif bad:
                report["bad"][rid] = bad
            else:
                r = byid[rid]
                sn = r.get("s_name") or "기타"
                kind, layout = STRUCT_KIND.get(sn, ("diagram", "skeleton"))
                bundles[codes[sn]][rid] = skel
                items.append(dict({"id": rid, "s": codes[sn], "t": r.get("type") or "", "tn": r.get("fam_name") or "",
                                   "ch": r.get("p_name") or "", "kind": kind, "layout": layout}, **stat))
            if k % 250 == 0:
                print("…", k, "/", len(jobs), flush=True)
    items.sort(key=lambda x: x["id"])
    structs = [{"code": codes[s], "name": s, "n": sum(1 for x in items if x["s"] == codes[s]),
                "kind": STRUCT_KIND.get(s, ("diagram", "skeleton"))[0], "layout": STRUCT_KIND.get(s, ("diagram", "skeleton"))[1]}
               for s, _ in struct_n.most_common()]
    for code, b in bundles.items():
        json.dump(dict(sorted(b.items())), open(lib / "skeletons" / ("%s.json" % code), "w", encoding="utf-8"),
                  ensure_ascii=False, separators=(",", ":"))
    json.dump({"version": 1, "count": len(items), "structs": structs, "items": items},
              open(lib / "catalog.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    json.dump(report, open(build / "report.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("끝 : 고른 장 %d · 통과 %d · 검사 걸림 %d · 오류 %d" % (len(jobs), len(items), len(report["bad"]), len(report["err"])))


if __name__ == "__main__":
    main()
