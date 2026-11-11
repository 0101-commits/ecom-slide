# 목업 3판 공통 — 숫자 · 단위 · 조사 · 꼬리표 · 각주 · 헤드메시지 도우미 (make_mockups3.py · mock3_*.py 가 씀)
import re

MINUS = "−"
ASOF = "2026.11.10"


def nf(v, d=1, sign=False):
    if v is None:
        return "—"
    r = f"{abs(v):,.{d}f}"
    z = float(r.replace(",", "")) == 0
    s = MINUS if v < 0 and not z else ("+" if sign and v > 0 and not z else "")
    return s + r


def dec_of(unit, v=None):
    if unit in ("%", "%p"):
        return 2 if v is not None and abs(v) < 20 and unit == "%" and False else (1 if unit == "%" else 2)
    if unit in ("억 달러",):
        return 1
    if unit in ("원",):
        return 1
    if unit in ("천 명",):
        return 0
    if unit in ("지수",):
        return 1
    return 1


def du(unit):
    """차이 단위 : % → %p, 나머지는 같음"""
    return "%p" if unit == "%" else ("" if unit == "지수" else unit)


def ulab(unit):
    """숫자 뒤에 붙일 단위(지수는 안 붙임)"""
    return "" if unit == "지수" else unit


def has_batchim(word):
    w = re.sub(r"[\s)\]」』'\"]+$", "", str(word))
    if not w:
        return False
    c = w[-1]
    if "가" <= c <= "힣":
        return (ord(c) - 0xAC00) % 28 != 0
    if c.isdigit():
        return c in "013678"
    if c == "%":
        return False
    if c.lower() in "lmnr":
        return True
    return False


def josa(word, pair):
    a, b = pair.split("/")
    return word + (a if has_batchim(word) else b)


def kind_of(unit, name=""):
    if unit in ("%",) or "금리" in name or "물가" in name or "실업률" in name:
        return "rate"
    if unit in ("억 달러", "천 명"):
        return "flow"
    return "level"


def verb(unit, name, up):
    k = kind_of(unit, name)
    if k == "flow":
        return "늘었" if up else "줄었"
    return "올랐" if up else "내렸"


GROUPS = [("경상수지", "국제수지"), ("상품수지", "국제수지"), ("서비스수지", "국제수지"), ("본원소득", "국제수지"), ("이전소득", "국제수지"),
          ("기준금리", "금리"), ("정책금리", "금리"), ("연방기금", "금리"), ("10년물", "금리"), ("2년물", "금리"), ("국채", "금리"),
          ("물가", "물가"), ("실업률", "고용"), ("고용", "고용"), ("산업생산", "생산"), ("환율", "환율"), ("원/달러", "환율"), ("GDP", "성장")]


def group_of(text):
    for k, g in GROUPS:
        if k in text:
            return g
    return "경제지표"


def short_src(src):
    """'한국은행 ECOS 301Y013 · 데이터월 2026.09 · …' → '한국은행 ECOS(301Y013)'"""
    parts = [p.strip() for p in re.split(r"\s·\s", src or "") if p.strip() and not p.strip().startswith("데이터월") and "받음" not in p]
    out = []
    for p in parts:
        m = re.match(r"(한국은행 ECOS|연준 세인트루이스 FRED|FRED|통계청 · ECOS|통계청)\s+([A-Z0-9]+)$", p)
        out.append(f"{m.group(1)}({m.group(2)})" if m else p)
    grp, order = {}, []
    for p in out:
        m = re.match(r"^(.+?)\((.+)\)$", p)
        k, v = (m.group(1), m.group(2)) if m else (p, None)
        if k not in grp:
            grp[k] = []
            order.append(k)
        if v and v not in grp[k]:
            grp[k].append(v)
    res = [f"{k}({' · '.join(grp[k])})" if grp[k] else k for k in order]
    return ", ".join(res) or "한국은행 ECOS, 연준 세인트루이스 FRED"


def foot(src, notes=None):
    return {"notes": notes or [], "source": short_src(src), "asof": ASOF}


def hlen(s):
    return len(re.sub(r"\s|\*\*", "", s))


def fit_head(*cands):
    """후보 문장 중 50~90자에 드는 첫 것, 없으면 가장 가까운 것"""
    best = None
    for c in cands:
        if not c:
            continue
        n = hlen(c)
        if 50 <= n <= 90:
            return c
        d = 0 if 50 <= n <= 90 else min(abs(n - 50), abs(n - 90))
        if best is None or d < best[0]:
            best = (d, c)
    return best[1] if best else ""


def ext(series):
    """[[기간, 값], ...] → 처음 · 끝 · 최고 · 최저"""
    s = [(p, v) for p, v in series if v is not None]
    mx = max(s, key=lambda x: x[1])
    mn = min(s, key=lambda x: x[1])
    return {"first": s[0], "last": s[-1], "max": mx, "min": mn, "n": len(s)}
