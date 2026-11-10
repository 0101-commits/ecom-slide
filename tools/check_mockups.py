# 목업 점검 — 제목 25자 · 화면 글 40자(숫자 뺌) · 강조 1곳 · 읽기 겹 · 출처 형식 · 낱말 규칙
import json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from make_mockups import roles

ROOT = Path(__file__).resolve().parent.parent
D = json.loads((ROOT / "library" / "mockups" / "mockups.json").read_text(encoding="utf-8"))
bad = []


def strip(t):
    return t.replace("**", "").replace("^^", "")


def letters(t):
    return sum(1 for c in strip(t) if c.isalpha())


def texts(s):
    k = s["kind"]
    out = [s.get("title", ""), s.get("sub", "")]
    if k in ("kpi", "chart") and s.get("aside"):
        out += [s["aside"]["head"]] + s["aside"]["points"]
    if k == "chart":
        c = s["chart"]
        if c.get("head"):
            out.append(c["head"])
        out += [n["text"] for n in c.get("notes", [])]
        if c.get("mark"):
            out.append(c["mark"]["text"])
    if k == "headline":
        out += [re.sub(r"==|\{\{|\}\}", "", s["text"])] + s["points"]
    if k == "drivers":
        out += [i["text"] for i in s["items"]]
    if k == "term":
        out += [s["word"], s["def"], s["like"]]
    if k == "compare":
        out += [s.get("vs", "")]
    if k == "question":
        out += s["options"]
    return out


fam = {}
for m in D["mockups"]:
    s, i = m["slide"], m["id"]
    fam[m["family"]] = fam.get(m["family"], 0) + 1
    title = strip(s.get("title") or re.sub(r"==|\{\{|\}\}", "", s.get("text") or ""))
    if len(title) > 25 and s["kind"] != "term":
        bad.append((i, "제목", len(title), title))
    n = sum(letters(t) for t in texts(s))
    if n > 40:
        bad.append((i, "화면글", n, [t for t in texts(s) if t]))
    marks = sum(len(re.findall(r"\*\*|\^\^", t)) for t in texts(s)) // 2
    if marks > 1:
        bad.append((i, "강조", marks, title))
    if s["kind"] not in ("cover", "part", "end"):
        r = s.get("read")
        if not r:
            bad.append((i, "읽기 없음", 0, title))
        else:
            if not (r["head"].endswith("임") or r["head"].endswith("함")):
                bad.append((i, "head 끝", 0, r["head"]))
            if not 2 <= len(r["points"]) <= 4:
                bad.append((i, "points 수", len(r["points"]), title))
    numeric = bool(m["facts"])
    if numeric:
        src = s.get("source", "")
        if "데이터월" not in src or not (src.endswith("받음") or s.get("concl")):
            bad.append((i, "출처", 0, src))
        if s["kind"] != "kpi" and "source" not in s:
            bad.append((i, "source 없음", 0, title))
    if s["kind"] == "diagram":
        for it in s["items"]:
            lim = (14, 40) if (s.get("style") or s["layout"] in ("modules", "tiers", "wells", "circles")) else (6, 20)
            if len(it["head"]) > lim[0] or len(it.get("body", "")) > lim[1]:
                bad.append((i, "도식 칸", 0, it))
    ct = (s.get("concl") or {}).get("text", "")
    if ct and ("=" in ct or ct.endswith(("(억 달러)", "단위")) or re.fullmatch(r"[\d\s.,%+−~-]+", ct) or sum(1 for ch in ct if "가" <= ch <= "힣") < 6
               or re.match(r"(기간|단위|비교 기준|비교한|막대|선 =|모든 열|정의:|비유:|구성:|배치:|\d{4}\.\d{2}부터)", ct)
               or (len(ct) <= 18 and re.fullmatch(r"[가-힣A-Za-z/ ]{1,12} [\d,.−+%]+[가-힣%/ ]{0,6}", ct))):
        bad.append((i, "결론 띠가 풀이 아님", 0, ct))
    if s.get("concl") and (len(s["concl"]["text"]) > 40 or s["concl"]["text"] == title):
        bad.append((i, "결론 띠", len(s["concl"]["text"]), s["concl"]["text"]))
    if s.get("key") and s["key"] not in strip(s.get("title") or s.get("text", "")):
        bad.append((i, "key", 0, s["key"]))
    if s.get("key") and s["key"] in ("달러", "%", "원", "억", "억 달러", "천", "명", "%p", "지수", "개월", "배", "월", "분기"):
        bad.append((i, "key 단위만", 0, s["key"]))
    if s.get("concl") and len(s.get("source", "")) > 40:
        bad.append((i, "출처 김(결론 띠 장)", len(s["source"]), s["source"]))
    if s.get("align") == "center" and s["kind"] not in ("term", "statement", "question", "headline"):
        bad.append((i, "center 허용 아님", 0, s["kind"]))
    if s["kind"] not in ("cover", "part", "end") and len(roles(s)) > 3:
        bad.append((i, "강조 역할", len(roles(s)), sorted(roles(s))))
    if s["kind"] == "compare" and s.get("style") == "pair":
        for side in ("left", "right"):
            q = s[side]
            if len(q["head"]) > 14 or len(q.get("body", "")) > 40 or any(len(x) > 40 for x in q.get("wells", [])) or len(q.get("tag", "")) > 8:
                bad.append((i, "pair 칸", 0, q))
        if len(s.get("ribbon", "")) > 4 or not s.get("concl"):
            bad.append((i, "pair ribbon/concl", 0, s.get("ribbon")))
    if s["kind"] == "diagram" and s.get("layout") == "wells":
        for it in s["items"]:
            if len(it["head"]) > 14 or any(len(x) > 18 for x in it["parts"]) or not 3 <= len(s["items"]) <= 4:
                bad.append((i, "wells 칸", 0, it))
    if s["kind"] == "diagram" and s.get("layout") == "tiers" and not 3 <= len(s["items"]) <= 5:
        bad.append((i, "tiers 수", 0, title))
    if s["kind"] == "diagram" and s.get("layout") == "circles" and s.get("nest") and max(x["value"] for x in s["items"]) / min(x["value"] for x in s["items"]) <= 2:
        bad.append((i, "circles nest 값 차이 2배 이하", 0, title))
    if s.get("concl") and s.get("source") and len(re.findall(r"ECOS", s["source"])) > 1:
        bad.append((i, "출처 기관 중복", 0, s["source"]))
    if s["kind"] == "diagram" and s.get("layout") == "circles" and (not 2 <= len(s["items"]) <= 4 or any(it["value"] <= 0 for it in s["items"])):
        bad.append((i, "circles", 0, title))
    if s["kind"] == "chart" and s["chart"]["type"] == "minis" and len(s["chart"]["minis"]) != 3:
        bad.append((i, "minis 3개", 0, title))
    if s["kind"] == "chart" and s["chart"]["type"] == "donut" and not 1 <= len(s["chart"]["rings"]) <= 4:
        bad.append((i, "donut 고리", 0, title))
    if s["kind"] == "compare" and s.get("style") == "rows" and (not 3 <= len(s["rows"]) <= 6 or any(len(c) > 18 for r in s["rows"] for c in r)):
        bad.append((i, "rows 칸", 0, title))
    if s["kind"] == "table" and len(s["rows"]) > 5:
        bad.append((i, "표 행", len(s["rows"]), title))
    if "NaN" in json.dumps(s) or "None" in json.dumps(s):
        bad.append((i, "NaN/None", 0, title))
body = [m["slide"] for m in D["mockups"] if m["slide"]["kind"] not in ("cover", "part", "end")]
nc = sum(1 for x in body if x.get("concl"))
if not 0.2 <= nc / len(body) <= 0.4:
    bad.append(("전체", "결론 띠 비율", round(nc / len(body), 2), nc))
kc = sum(1 for x in body if x.get("key") and x.get("keyStyle", "color") == "color")
print("결론 띠", nc, f"{nc / len(body):.0%}", "· key(색)", kc, f"{kc / len(body):.0%}", "· 굵기", sum(1 for x in body if x.get("keyStyle") == "weight"),
      "· 스타일", {st: sum(1 for x in body if (x.get("concl") or {}).get("style") == st) for st in ("pill", "band", "top")})
from collections import Counter
print("짜임", dict(Counter(m["pattern"] for m in D["mockups"] if m["family"] in ("compare", "diagram", "combo", "minis", "donut", "term", "table"))))
for b in bad:
    print(b)
print("항목", len(D["mockups"]), "문제", len(bad), fam)
