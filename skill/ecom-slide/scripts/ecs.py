#!/usr/bin/env python3
# ECOM 발표 만들기 — 단계 명령 하나로 묶음. Windows(앱 Code 탭) · Ubuntu(웹 Code 탭) 모두 파이썬 3.9+ 만 있으면 됨.
#   setup                       레퍼런스 저장소(ecom-slide) 받기 · 갱신, 필요한 꾸러미 · 브라우저 확인
#   new <회차> --title --date   sessions/<회차>/ 만들기
#   read <회차>                 자료 폴더 글 뽑기 → work/자료.txt
#   series [--q 말] [--id ID]   공개 수치 파일 찾기 · 값 보기
#   find [--layout --cols ...]  HCG 골격 찾기
#   table <회차>                outline.json · deck.json 을 계획 표로
#   lint <회차>                 deck.json 규칙 점검(브라우저 없이)
#   build <회차>                발표 파일 하나로 묶기 → sessions/<회차>/ECOM_<회차>.html
#   check <회차> [--shots]      화면 재기 + 규칙 점검 → work/check.md
# 결과는 늘 JSON 한 줄(마지막 줄). 오류면 {"error": "..."}.
import argparse, base64, html, json, os, re, shutil, subprocess, sys, zipfile
from pathlib import Path

LIB_URL = "https://github.com/0101-commits/ecom-slide"
KINDS = {"cover", "part", "end", "statement", "number", "chart", "diagram", "compare", "question", "table", "kpi", "headline", "drivers", "term"}
CHARTS = {"bar", "line", "cumline", "hbar", "race", "zoom", "wipe", "slope", "rank", "morph", "split", "bridge", "waffle", "combo", "minis", "donut"}
LAYOUTS = {"columns", "flow", "cycle", "hub", "tree", "pyramid", "matrix", "timeline", "venn", "skeleton"}


def say(obj, code=0):
    print(json.dumps(obj, ensure_ascii=False))
    sys.exit(code)


def root():
    try:
        r = subprocess.run(["git", "rev-parse", "--show-toplevel"], capture_output=True, text=True, timeout=10)
        if r.returncode == 0 and r.stdout.strip():
            return Path(r.stdout.strip())
    except Exception:
        pass
    return Path.cwd()


BUNDLED = Path(__file__).resolve().parent.parent / "lib"   # 스킬 묶음(zip)에 든 엔진 · 규칙 · 목업


def lib_dir():
    env = os.environ.get("ECOM_SLIDE_LIB")
    if env:
        return Path(env)
    if (BUNDLED / "style" / "deck.js").exists():
        return BUNDLED
    return root() / ".ecom-slide"


def sess(name):
    p = root() / "sessions" / name
    if not p.exists():
        say({"error": f"회차 폴더가 없어요 : sessions/{name} — 먼저 new"}, 1)
    (p / "work").mkdir(exist_ok=True)
    return p


def load(p, default=None):
    if not Path(p).exists():
        return default
    return json.load(open(p, encoding="utf-8"))


def browser():
    cands = [os.environ.get("CHROME_PATH", ""),
             r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
             r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
             r"C:\Program Files\Google\Chrome\Application\chrome.exe",
             "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
             "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
    for c in cands:
        if c and Path(c).exists():
            return c
    for n in ("google-chrome", "chromium", "chromium-browser", "msedge"):
        w = shutil.which(n)
        if w:
            return w
    return None


# ───────── setup ─────────
def cmd_setup(a):
    lib = lib_dir()
    msg = []
    if lib == BUNDLED:
        msg.append("스킬 묶음 판")
    elif (lib / ".git").exists():
        r = subprocess.run(["git", "-C", str(lib), "pull", "--ff-only", "-q"], capture_output=True, text=True, timeout=300)
        msg.append("갱신" if r.returncode == 0 else "갱신 실패(지난 판으로 진행)")
    elif lib.exists() and (lib / "style").exists():
        msg.append("로컬 판")
    else:
        r = subprocess.run(["git", "clone", "--depth", "1", "-q", LIB_URL, str(lib)], capture_output=True, text=True, timeout=600)
        if r.returncode != 0:
            say({"error": "레퍼런스 저장소를 못 받았어요 : " + (r.stderr or "")[-200:]}, 1)
        msg.append("받음")
    gi = root() / ".gitignore"
    if lib.parent == root() and (not gi.exists() or ".ecom-slide" not in gi.read_text(encoding="utf-8")):
        with open(gi, "a", encoding="utf-8") as f:
            f.write("\n.ecom-slide/\nsessions/*/work/shots/\n")
    deps = {}
    for mod, pkg in (("pypdf", "pypdf"), ("fontTools", "fonttools"), ("brotli", "brotli")):
        try:
            __import__(mod)
            deps[pkg] = True
        except ImportError:
            r = subprocess.run([sys.executable, "-m", "pip", "install", "-q", "--user", pkg], capture_output=True, text=True, timeout=300)
            if r.returncode != 0:
                r = subprocess.run([sys.executable, "-m", "pip", "install", "-q", pkg], capture_output=True, text=True, timeout=300)
            deps[pkg] = r.returncode == 0
    cat = load(lib / "library" / "catalog.json", {"count": 0})
    ser = load(lib / "data" / "series.json", {"series": {}})
    say({"ready": True, "lib": str(lib), "lib_state": msg, "refs": cat.get("count", 0), "series": len(ser.get("series", {})),
         "series_updated": ser.get("updated", ""), "browser": browser(), "deps": deps})


# ───────── new ─────────
def cmd_new(a):
    p = root() / "sessions" / a.name
    (p / "자료").mkdir(parents=True, exist_ok=True)
    (p / "work").mkdir(exist_ok=True)
    meta = load(p / "session.json", {}) or {}
    meta.update({"session": a.name, "title": a.title or meta.get("title", ""), "date": a.date or meta.get("date", ""),
                 "series": a.series if a.series is not None else meta.get("series", "경제지표101")})
    json.dump(meta, open(p / "session.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    say({"ok": True, "dir": str(p), "자료": str(p / "자료"), "meta": meta})


# ───────── read ─────────
def text_of(f):
    ext = f.suffix.lower()
    if ext in (".txt", ".md", ".csv", ".json"):
        return f.read_text(encoding="utf-8", errors="ignore")
    if ext in (".html", ".htm"):
        t = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", f.read_text(encoding="utf-8", errors="ignore"), flags=re.S | re.I)
        return html.unescape(re.sub(r"<[^>]+>", " ", t))
    if ext == ".pdf":
        from pypdf import PdfReader
        return "\n".join((pg.extract_text() or "") for pg in PdfReader(str(f)).pages)
    if ext in (".docx", ".pptx", ".xlsx"):
        z = zipfile.ZipFile(f)
        parts = [n for n in z.namelist() if re.match(r"(word/document|ppt/slides/slide\d+|xl/sharedStrings)\.xml$", n)]
        parts.sort(key=lambda n: int(re.sub(r"\D", "", n) or 0))
        out = []
        for n in parts:
            x = z.read(n).decode("utf-8", "ignore")
            x = re.sub(r"</(w:p|a:p|si)>", "\n", x)
            out.append(html.unescape(re.sub(r"<[^>]+>", "", x)))
        return "\n".join(out)
    return ""


def cmd_read(a):
    p = sess(a.name)
    files = [f for f in sorted((p / "자료").rglob("*")) if f.is_file()]
    out, rows = [], []
    for f in files:
        try:
            t = re.sub(r"[ \t]+", " ", text_of(f)).strip()
        except Exception as e:
            t, err = "", str(e)[:80]
            rows.append({"file": f.name, "chars": 0, "error": err})
            continue
        rows.append({"file": f.name, "chars": len(t)})
        if t:
            out.append(f"===== {f.name} =====\n{t}\n")
    (p / "work" / "자료.txt").write_text("\n".join(out), encoding="utf-8")
    say({"ok": True, "files": rows, "out": str(p / "work" / "자료.txt"),
         "hint": "스캔 PDF(글자 0)는 그림으로 읽어 주세요" if any(r.get("chars") == 0 for r in rows) else ""})


# ───────── series · fetch (열쇠 없이 작성하는 날 최신 값) ─────────
def cmd_series(a):
    """계열 번호 사전(data/series_ids.json)에서 찾기 — 값은 fetch 로 받음"""
    cfg = load(lib_dir() / "data" / "series_ids.json", {"series": []})
    q = (a.q or "").lower()
    hits = [s for s in cfg.get("series", []) if not q or q in s["name"].lower() or q in s["id"].lower()]
    say({"count": len(hits), "series": hits, "hint": "값 받기 : ecs.py fetch <회차> <id> --since 2021.01"})


def http_get(url, tries=3):
    # FRED 는 파이썬 기본 이름표를 막음 → curl 과 같은 이름표 · 잠깐 끊김은 다시
    import time, urllib.request
    last = None
    for k in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "curl/8.4.0", "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode("utf-8", "ignore")
        except Exception as e:
            last = e
            time.sleep(2 * (k + 1))
    raise last


def periods(cyc, since, until):
    out = []
    if cyc == "M":
        y, m = int(since[:4]), int(since[5:7] or 1)
        while (y, m) <= until:
            out.append(f"{y}{m:02d}"); m += 1
            if m > 12: y, m = y + 1, 1
    elif cyc == "Q":
        y, q = int(since[:4]), (int(since[5:7] or 1) - 1) // 3 + 1
        while (y, q * 3) <= until:
            out.append(f"{y}Q{q}"); q += 1
            if q > 4: y, q = y + 1, 1
    else:
        out = [str(y) for y in range(int(since[:4]), until[0] + 1)]
    return out


def fetch_ecos(sid, since):
    from datetime import date
    _, stat, item, cyc = sid.split(":")
    t = date.today()
    ps = periods(cyc, since, (t.year, t.month))
    rows, unit, name, calls = [], "", "", 0
    for i in range(0, len(ps), 10):  # 공개 시험 열쇠 sample 은 한 번에 10건까지
        w = ps[i:i + 10]
        calls += 1
        if calls > 30:
            break
        j = json.loads(http_get(f"https://ecos.bok.or.kr/api/StatisticSearch/sample/json/kr/1/10/{stat}/{cyc}/{w[0]}/{w[-1]}/{item}"))
        for r in (j.get("StatisticSearch") or {}).get("row") or []:
            unit, name = r.get("UNIT_NAME", unit), r.get("ITEM_NAME1", name)
            tm = r["TIME"]
            p = f"{tm[:4]}.{tm[4:6]}" if cyc == "M" else (f"{tm[:4]}.Q{tm[-1]}" if cyc == "Q" else tm[:4])
            try:
                rows.append([p, float(r["DATA_VALUE"])])
            except (TypeError, ValueError):
                pass
    return {"name": name, "unit": unit, "source": f"한국은행 ECOS {stat}({item}) · 공개 시험 열쇠", "data": rows, "calls": calls}


def fetch_fred(sid, since):
    code = sid.split(":")[1]
    text = http_get(f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={code}&cosd={since[:4]}-{(since[5:7] or '01')}-01")
    acc = {}
    for line in text.splitlines()[1:]:
        d, _, v = line.partition(",")
        if not v or v.strip() in (".", ""):
            continue
        acc.setdefault(f"{d[:4]}.{d[5:7]}", []).append(float(v))
    data = [[k, round(sum(v) / len(v), 4)] for k, v in sorted(acc.items())]  # 날마다 나오는 계열은 월평균
    return {"name": code, "unit": "", "source": f"FRED {code}(세인트루이스 연준) · 열쇠 없는 내려받기", "data": data, "calls": 1}


def cmd_fetch(a):
    from datetime import datetime
    p = sess(a.name)
    try:
        r = fetch_ecos(a.id, a.since) if a.id.startswith("ecos:") else fetch_fred(a.id, a.since)
    except Exception as e:
        say({"error": f"숫자를 못 받았어요({type(e).__name__}). 웹 Code 탭이면 환경 네트워크에 ecos.bok.or.kr · fred.stlouisfed.org 를 허용하거나, 자료 폴더 · 웹 검색으로 받아 주세요."}, 1)
    cfg = {s["id"]: s for s in load(lib_dir() / "data" / "series_ids.json", {"series": []}).get("series", [])}
    if a.id in cfg:
        r["name"] = cfg[a.id]["name"]; r["unit"] = r["unit"] or cfg[a.id].get("unit", "")
    r.update({"id": a.id, "got": datetime.now().strftime("%Y.%m.%d %H:%M")})
    d = p / "work" / "series"; d.mkdir(parents=True, exist_ok=True)
    f = d / (re.sub(r"[^A-Za-z0-9_.-]+", "_", a.id) + ".json")
    json.dump(r, open(f, "w", encoding="utf-8"), ensure_ascii=False)
    if not r["data"]:
        say({"error": f"받은 값이 없어요 : {a.id} — 번호를 확인해 주세요"}, 1)
    say({"ok": True, "id": a.id, "name": r["name"], "unit": r["unit"], "n": len(r["data"]), "first": r["data"][0], "last": r["data"][-3:],
         "got": r["got"], "calls": r["calls"], "file": str(f)})


# ───────── mockup (목업 300) ─────────
def cmd_mockup(a):
    m = load(lib_dir() / "library" / "mockups" / "mockups.json")
    if not m:
        say({"error": "목업 목록이 없어요 — setup 먼저"}, 1)
    items = m if isinstance(m, list) else (m.get("items") or m.get("mockups") or [])
    if a.id:
        hit = next((x for x in items if x["id"] == a.id), None)
        if not hit:
            say({"error": f"목업 없음 : {a.id}"}, 1)
        say({"id": hit["id"], "kind": hit.get("kind"), "family": hit.get("family"), "slide": hit["slide"]})
    q = (a.q or "").lower()
    hits = [x for x in items if (not a.family or a.family in (x.get("kind"), x.get("family")))
            and (not q or q in json.dumps([x.get("title"), x.get("tags"), x.get("variant")], ensure_ascii=False).lower())]
    fams = {}
    for x in items:
        fams[x.get("kind") or x.get("family")] = fams.get(x.get("kind") or x.get("family"), 0) + 1
    say({"count": len(hits), "items": [{"id": x["id"], "kind": x.get("kind"), "variant": x.get("variant"), "title": x.get("title")} for x in hits[:a.n]],
         "families": fams if not (a.family or q) else None})


# ───────── find ─────────
def cmd_find(a):
    lib = lib_dir()
    cat = load(lib / "library" / "catalog.json")
    if not cat:
        say({"error": "레퍼런스 목록이 없어요 — setup 먼저"}, 1)
    sn = {s["code"]: s["name"] for s in cat["structs"]}
    it = [x for x in cat["items"] if x["nb"] > 0]  # 빈 골격(6장) 빼고
    if a.layout:
        it = [x for x in it if x["layout"] == a.layout]
    if a.kind:
        it = [x for x in it if x["kind"] == a.kind]
    if a.struct:
        it = [x for x in it if a.struct in sn.get(x["s"], "")]
    if a.cols:
        it = [x for x in it if x["cols"] == a.cols]
    if a.steps:
        it = [x for x in it if x["steps"] == a.steps]
    if a.slots:
        it = [x for x in it if abs(x["ns"] - a.slots) <= 1]
    it.sort(key=lambda x: (x["nb"], x["id"]))  # 단순한 것부터(무대용)
    say({"count": len(it), "items": [{"id": x["id"], "struct": sn.get(x["s"]), "layout": x["layout"], "cols": x["cols"],
                                       "rows": x["rows"], "slots": x["ns"], "steps": x["steps"], "boxes": x["nb"]} for x in it[:a.n]],
         "structs": None if (a.layout or a.kind or a.struct) else [(s["name"], s["n"], s["kind"], s["layout"]) for s in cat["structs"]]})


# ───────── 글 도우미 ─────────
MARK = re.compile(r"\*\*|\^\^|\[\[|\]\]")


def plain(s):
    return MARK.sub("", str(s or "")).replace("\\n", " ").replace("\n", " ")


def screen_texts(sl):
    """화면 겹 글(차트 라벨 · 숫자 · 출처 빼고)"""
    k = sl.get("kind")
    t = [sl.get("title", "")]
    if k in ("statement", "cover", "end", "part"):
        t += [sl.get("sub", ""), sl.get("desc", ""), sl.get("name", "") if k == "part" else ""] + list(sl.get("words", [])) + list(sl.get("captions", []))
    if k == "number":
        t += [sl.get("label", ""), sl.get("sub", "")]
    if k == "diagram":
        for i in sl.get("items", []):
            t += [i.get("head", ""), i.get("body", "")]
        t.append(sl.get("center", ""))
    if k == "compare":
        for side in ("left", "right"):
            s = sl.get(side, {}) or {}
            t += [s.get("head", ""), s.get("tag", "")] + list(s.get("points", []))
        t.append(sl.get("vs", ""))
    if k == "question":
        t += list(sl.get("options", []))
    return [plain(x) for x in t if x]


def nchars(texts):
    return sum(len(re.sub(r"[\s\d.,%·\-+=→()]", "", x)) for x in texts)


# ───────── table ─────────
def cmd_table(a):
    p = sess(a.name)
    d = load(p / "work" / "outline.json") or load(p / "deck.json")
    if not d:
        say({"error": "outline.json · deck.json 이 없어요"}, 1)
    if d.get("schema") == 3 or any(isinstance(x.get("eyebrow"), dict) for x in d.get("slides", [])):
        rows = ["| # | 종류 | 묶음 | 주제 | 헤드메시지 | 넘김 · 바뀜 |", "|---|---|---|---|---|---|"]
        for i, x in enumerate(d["slides"], 1):
            e = x.get("eyebrow") or {}
            e = e if isinstance(e, dict) else {"group": e}
            pg = x.get("appendix") or i
            rows.append(f"| {pg} | {x.get('kind')} | {e.get('group', '')} | {e.get('topic', '') or plain(x.get('title', ''))} | {plain(x.get('head', ''))[:60]} | {x.get('transition', '') or ''}{' · 바뀜 ' + str(len(x['beats'])) if x.get('beats') else ''} |")
        (p / "work" / "plan_table.md").write_text("\n".join(rows), encoding="utf-8")
        print("\n".join(rows))
        say({"ok": True, "slides": len(d["slides"]), "file": str(p / "work" / "plan_table.md")})
    rows = ["| # | 종류 | PART | 제목 | 골격 · 배치 |", "|---|---|---|---|---|"]
    for i, s in enumerate(d["slides"], 1):
        g = " · ".join(x for x in (s.get("layout", ""), s.get("skeleton", ""), (s.get("chart") or {}).get("type", "") if isinstance(s.get("chart"), dict) else s.get("chart", "")) if x)
        rows.append(f"| {i} | {s.get('kind')} | {s.get('part', '') or ''} | {plain(s.get('title') or s.get('name') or s.get('label', ''))} | {g} |")
    (p / "work" / "plan_table.md").write_text("\n".join(rows), encoding="utf-8")
    print("\n".join(rows))
    say({"ok": True, "slides": len(d["slides"]), "file": str(p / "work" / "plan_table.md")})


# ───────── lint (규칙 점검) ─────────
INVEST = re.compile(r"(사야|팔아야|매수\s*추천|매도\s*추천|오를\s*것|내릴\s*것|수익\s*보장|무조건)")
HOLDER = re.compile(r"(TODO|TBD|XX+|○○|\?\?\?|lorem|\[확인\]|\(확인\s*필요\)|작업\s*메모)", re.I)
def ends_nominal(t):
    """읽기 겹 결론 문장이 명사형(받침 ㅁ : ~임 · ~함 · ~름 · ~림 …)으로 끝나는지"""
    t = re.sub(r"[\s.)」』\]]+$", "", t)
    return bool(t) and "가" <= t[-1] <= "힣" and (ord(t[-1]) - 0xAC00) % 28 == 16
TOPIC_ONLY = re.compile(r"(의\s*정의|의\s*구성|개요|현황|소개)$")


ACCENTS = ("green", "blue", "violet", "coral", "amber", "mono")
CENTER_OK = {"term", "statement", "question", "headline"}


def grammar_lint(s, i, add):
    """rules/design_grammar.md 점검 — 제목 강조 낱말 · 결론 띠 · 카드 글 길이 · 알약 줄."""
    kind = s.get("kind")
    if kind in ("cover", "part", "end"):
        return
    title = re.sub(r"\*\*|\^\^", "", s.get("title") or s.get("text") or "")
    keys = s.get("key")
    if keys and kind != "headline":
        keys = [keys] if isinstance(keys, str) else list(keys)
        if len(keys) > 2:
            add(i, "제목 강조", f"강조 낱말 {len(keys)}개 — 2개까지")
        for k in keys:
            if k not in title:
                add(i, "제목 강조", f"key 「{k}」 가 제목에 없음")
    if s.get("align") == "center" and kind not in CENTER_OK:
        add(i, "가운데 정렬", f"{kind} 장은 왼쪽 정렬 — 가운데는 정의 · 문장 · 질문 · 결론 문장 장만", "확인할 것")
    if s.get("dark") or (s.get("bg") or "").startswith("#1"):
        add(i, "본문 바탕", "본문 장은 진한 바탕 금지(표지 · 간지 · 끝만)")
    if len(s.get("eyebrow") or "") > 16:
        add(i, "머리말", f"eyebrow {len(s['eyebrow'])}자 — 16자 안")
    if len(s.get("sub") or "") > 40:
        add(i, "부제", f"sub {len(s['sub'])}자 — 40자 안")
    c = s.get("concl")
    if c:
        t = c.get("text", "") if isinstance(c, dict) else str(c)
        if len(t) > 40:
            add(i, "결론 띠", f"{len(t)}자 — 40자 안")
        if t and title and re.sub(r"\s", "", t) == re.sub(r"\s", "", title):
            add(i, "결론 띠", "제목과 같은 문장 — 「그래서」를 쓸 것")
        if isinstance(c, dict) and c.get("tone", "dark") not in ("dark", "acc"):
            add(i, "결론 띠", f"tone {c.get('tone')} — dark · acc")
        if isinstance(c, dict) and c.get("style", "pill") not in ("pill", "band", "top"):
            add(i, "결론 띠", f"style {c.get('style')} — pill · band · top")
    if kind == "diagram" and (s.get("style") == "card" or s.get("layout") == "modules"):
        for it in s.get("items") or []:
            if len(it.get("head", "")) > 14:
                add(i, "카드 글", f"머리 「{it['head'][:10]}…」 {len(it['head'])}자 — 14자 안")
            if len(it.get("body", "")) > 40:
                add(i, "카드 글", f"설명 {len(it['body'])}자 — 40자 안")
    if kind == "compare" and s.get("style") == "rows":
        rows = s.get("rows") or []
        if not 3 <= len(rows) <= 6:
            add(i, "알약 줄 비교", f"줄 {len(rows)}개 — 3~6줄")
        if len(s.get("heads") or []) != 2:
            add(i, "알약 줄 비교", "heads 는 둘")
        for r in rows:
            for cell in r[:2]:
                if len(str(cell)) > 18:
                    add(i, "알약 줄 비교", f"「{str(cell)[:10]}…」 {len(str(cell))}자 — 18자 안")
        if s.get("notes") and len(s["notes"]) != len(rows):
            add(i, "알약 줄 비교", "notes 줄 수 = rows 줄 수")


def lint(deck, lib):
    iss = []
    gl = load(lib / "terms" / "glossary.json", {"same": [], "words": {}})
    slides = deck.get("slides", [])
    parts = {p["no"]: p for p in deck.get("meta", {}).get("parts", [])}
    facts = deck.get("facts", {})
    run, last = 0, None
    def add(i, kind, msg, sev="고칠 것"):
        iss.append({"slide": i, "item": kind, "sev": sev, "msg": msg})
    for i, s in enumerate(slides, 1):
        k = s.get("kind")
        if k not in KINDS:
            add(i, "화면 종류", f"모르는 종류 {k}")
            continue
        run = run + 1 if k == last else 1
        last = k
        if run == 5:
            add(i, "같은 종류 이어짐", f"{k} 가 4장 넘게 이어짐", "확인할 것")
        title = plain(s.get("title", ""))
        if k not in ("cover", "part", "end", "question") and len(title) > 25:
            add(i, "제목 길이", f"제목 {len(title)}자(25자 안)")
        if k not in ("cover", "part", "end", "question") and TOPIC_ONLY.search(title):
            add(i, "결론형 제목", f"주제만 있는 제목 : {title}")
        n = nchars(screen_texts(s))
        if n > 40:
            add(i, "화면 글 40자", f"화면 글 약 {n}자")
        if s.get("part") and s["part"] not in parts:
            add(i, "PART 지도", f"meta.parts 에 없는 PART {s['part']}")
        if k == "part" and s.get("part") in parts and plain(s.get("name")) != plain(parts[s["part"]]["name"]):
            add(i, "PART 지도", "간지 이름과 meta.parts 이름이 다름")
        if k not in ("cover", "part", "end"):
            r = s.get("read") or {}
            if not r.get("head"):
                add(i, "읽기 겹", "read.head 없음")
            elif not ends_nominal(plain(r["head"])):
                add(i, "종결 어미", "읽기 겹 결론 문장이 「~임 / ~함」으로 끝나지 않음", "확인할 것")
        if k == "diagram":
            if s.get("layout") not in LAYOUTS:
                add(i, "화면 종류", f"모르는 배치 {s.get('layout')}")
            if s.get("layout") == "skeleton" and not s.get("skeleton"):
                add(i, "화면 종류", "layout=skeleton 인데 skeleton id 없음")
            for it in s.get("items", []):
                if len(plain(it.get("head"))) > 8:
                    add(i, "도식 글", f"칸 머리 「{plain(it.get('head'))}」 8자 넘음", "확인할 것")
        if k in ("number", "chart"):
            if not s.get("source"):
                add(i, "출처 · 기준월", "숫자 장인데 source 없음")
            fk = s.get("fact") if k == "number" else None
            if k == "chart":
                fk = next((x.get("fact") for x in (s.get("chart") or {}).get("series", []) if x.get("fact")), None)
            if fk and fk not in facts:
                add(i, "사실표 대조", f"facts 에 없는 키 {fk}")
            if not fk:
                add(i, "사실표 대조", "facts 연결 없음(최신 값 비교 · 출처 추적 안 됨)", "확인할 것")
        if k == "table" and len(s.get("rows", [])) > 5:
            add(i, "작은 표", f"표 {len(s['rows'])}행(5행 안)")
        if k == "question" and not (2 <= len(s.get("options", [])) <= 4):
            add(i, "화면 종류", "보기 2~4개")
        blob = json.dumps(s, ensure_ascii=False)
        if HOLDER.search(blob):
            add(i, "자리표시자", "자리표시 · 작업 메모가 남음")
        if INVEST.search(blob):
            add(i, "투자 권유 문구", "투자 권유처럼 읽히는 말")
        for grp in gl.get("same", []):
            for w in grp[1:]:
                if re.search(r"(?<![가-힣A-Za-z])" + re.escape(w) + r"(?![가-힣A-Za-z])", blob):
                    add(i, "용어 사전", f"「{w}」 → 「{grp[0]}」", "확인할 것")
        for q in re.findall(r"[「\"“]([^」\"”]{120,})[」\"”]", blob):
            add(i, "긴 인용", f"인용 {len(q)}자", "확인할 것")
    apx = {s.get("appendix") for s in slides if s.get("appendix")}
    for i, s in enumerate(slides, 1):
        for l in s.get("links", []) or []:
            if l.get("to") not in apx:
                add(i, "부록 고리", f"없는 부록 {l.get('to')}")
        if s.get("kind") == "chart" and (s.get("chart") or {}).get("type") not in CHARTS:
            add(i, "화면 종류", f"모르는 차트 {(s.get('chart') or {}).get('type')}")
        if s.get("kind") == "kpi":
            cs = s.get("cards") or []
            if not 1 <= len(cs) <= 4:
                add(i, "지표 카드", "카드는 1~4장")
            for c in cs:
                if not (c.get("asof") and c.get("source")):
                    add(i, "지표 카드 4칸", f"「{c.get('label')}」 기준 · 출처 빠짐")
        if s.get("kind") == "headline" and not 2 <= len(s.get("evidence") or []) <= 4:
            add(i, "결론 문장 장", "근거 카드는 2~4장")
        if s.get("carry"):
            nb = [slides[j].get("carry") for j in (i - 2, i) if 0 <= j < len(slides)]
            if s["carry"] not in nb:
                add(i, "이어 넘기기", f"carry 「{s['carry']}」 짝이 앞뒤 장에 없음", "확인할 것")
        grammar_lint(s, i, add)
    body = [s for s in slides if s.get("kind") not in ("cover", "part", "end") and not s.get("appendix")]
    if len(body) >= 8:
        r = sum(1 for s in body if s.get("concl")) / len(body)
        if r > 0.4 or r < 0.15:
            add(0, "결론 띠 비율", f"본문 {len(body)}장 중 {r:.0%} — 핵심 장에만 20~30%", "확인할 것")
    run, prev = 0, None
    for i, s in enumerate(slides, 1):
        sig = (s.get("kind"), s.get("layout") or (s.get("chart") or {}).get("type"), s.get("style"))
        run = run + 1 if sig == prev else 1
        prev = sig
        if run == 3:
            add(i, "같은 짜임 잇기", f"{sig[0]}/{sig[1] or ''} 짜임이 3장 이어짐 — 번갈아 쓸 것", "확인할 것")
    th = (deck.get("theme") or {}).get("accent")
    if th and th not in ACCENTS:
        add(0, "강조색", f"모르는 강조색 {th} — {'/'.join(ACCENTS)} 중 하나")
    for key, f in facts.items():
        if not f.get("period") or not f.get("source"):
            add(0, "출처 · 기준월", f"facts.{key} 에 period · source 없음")
    used = set(re.findall(r"\[\[([^\]]+)\]\]", json.dumps(slides, ensure_ascii=False)))
    words = dict(gl.get("words", {}), **deck.get("glossary", {}))
    for w in sorted(used - set(words)):
        add(0, "용어 사전", f"용어 풀이 없는 낱말 [[{w}]]", "확인할 것")
    want = deck.get("meta", {}).get("length")
    if want and not (0.8 * want <= len(slides) <= 1.2 * want):
        add(0, "분량", f"장 수 {len(slides)} (고른 분량 {want})", "확인할 것")
    for no in parts:
        kinds = {s.get("kind") for s in slides if s.get("part") == no}
        if not kinds & {"diagram", "chart", "compare"}:
            add(0, "도식 없음", f"PART {no} 에 도식 · 차트 · 비교 장이 없음")
    return iss


# ───────── lint 3판(schema 3) ─────────
AI_TONE = [("꼭대기", "고점"), ("고원", "지속 구간"), ("방아쇠", "요인"), ("체력", "성장 여력"), ("웃돈", "프리미엄"), ("쉽게 말해", "(지움)"),
           ("한 줄로", "(지움)"), ("핵심은", "(지움)"), ("결국", "(지움)"), ("주목할 점은", "(지움)"), ("사실상", "(지움)"), ("좁힘", "축소"),
           ("함께 인하", "동반 인하"), ("한국 먼저", "한국 선제 인상"), ("넉 달째", "4개월 연속"), ("内", ""), ("現", "현재"), ("强", "강세"), ("高", "높음"), ("美", "미국"), ("韓", "한국")]
OLD_FIELDS = {"concl": "결론 띠(헤드메시지로 옮김)", "aside": "오른쪽 요점 칸(본문 안으로)", "heading": "어깨끈(꼬리표로)", "read": "읽기 겹(화면으로)", "title": "짧은 제목(head 2줄로)", "theme": "강조색(초록 고정)"}
BARE_NUM = re.compile(r"(?<![\d.])(\d+\.\d{2})(?![\d.%~]|\s*~|%p|bp|원|배|달러|억|조|만|명|건|개월|년|월|일|장|회|분기|p|포인트|\s*(%|원|배|달러|억|조|명|bp|개월))")
DATE = re.compile(r"\d{4}\.\d{2}")
MEET2 = re.compile(r"(오늘|발표|회의|결정|기준)\s*\d{1,2}\.\d{1,2}")
MEET = re.compile(r"\d{1,2}\.\d{1,2}(?=\s*(금통위|FOMC|회의|결정|발표|일|선거))")


def strings_of(o, out=None, key=""):
    out = [] if out is None else out
    if isinstance(o, str):
        out.append((key, o))
    elif isinstance(o, dict):
        for k, v in o.items():
            strings_of(v, out, k)
    elif isinstance(o, list):
        for v in o:
            strings_of(v, out, key)
    return out


def known_kinds(lib):
    ks = set()
    for f in (lib / "style" / "parts").glob("*.js"):
        ks |= set(re.findall(r"ECOM\.parts\.([a-z]+)\s*=", f.read_text(encoding="utf-8")))
        ks |= set(re.findall(r"ECOM\.parts\[['\"]([a-z]+)['\"]\]\s*=", f.read_text(encoding="utf-8")))
    return ks


def lint3(deck, lib):
    iss = []
    def add(i, item, sev, msg):
        iss.append({"slide": i, "item": item, "sev": sev, "msg": msg})
    kinds = known_kinds(lib)
    m = deck.get("meta", {})
    sl = deck.get("slides", [])
    if not m.get("cover"):
        add(0, "표지 모양", "확인할 것", "meta.cover 없음 — 질문 카드에서 고른 표지(A~E)를 적기")
    body = [s for s in sl if not s.get("appendix") and s.get("kind") not in ("cover", "part")]
    ln = m.get("length")
    if isinstance(ln, list) and len(ln) == 2 and not (ln[0] <= len(body) <= ln[1]):
        add(0, "본문 장 수", "확인할 것", f"본문 {len(body)}장 — 고른 범위 {ln[0]}~{ln[1]}장")
    apx_ids = {s.get("appendix") for s in sl if s.get("appendix")}
    prev, run = None, 0
    for i, s in enumerate(sl, 1):
        k = s.get("kind")
        if k not in kinds:
            add(i, "화면 종류", "고칠 것", f"모르는 kind : {k}")
        run = run + 1 if k == prev else 1
        prev = k
        if run == 3 and k not in ("cover", "part") and not s.get("appendix"):
            add(i, "같은 종류 연속", "확인할 것", f"{k} 3장째 — 2장까지 권고")
        for f, why in OLD_FIELDS.items():
            if f in s and not (f == "title" and k in ("cover", "part", "statement", "term", "further", "discuss")):
                add(i, "판 2 칸", "고칠 것", f"`{f}` — {why}")
        txt = strings_of(s)
        alltxt = " ".join(t for _, t in txt)
        for w, rep in AI_TONE:
            if w and w in alltxt:
                add(i, "AI 말투", "고칠 것", f"「{w}」 → {rep}")
        if INVEST.search(alltxt):
            add(i, "투자 권유 말", "고칠 것", INVEST.search(alltxt).group(0))
        if HOLDER.search(alltxt):
            add(i, "자리 표시 글", "고칠 것", HOLDER.search(alltxt).group(0))
        if "bp" in alltxt and "%p" in alltxt and k != "term":
            add(i, "단위 섞임", "고칠 것", "한 장에 bp 와 %p — 한 단위로")
        for key, t in txt:
            if key in ("text", "res", "sub", "head", "s1", "s2", "label", "end", "chip") and re.search(r"[가-힣]", t):
                t2 = MEET2.sub("", MEET.sub("", DATE.sub("", t)))
                for mm in BARE_NUM.finditer(t2):
                    add(i, "단위 없는 숫자", "고칠 것", f"「{t[:40]}」의 {mm.group(1)}")
                    break
        if k in ("cover", "part"):
            continue
        e = s.get("eyebrow")
        if not isinstance(e, dict) or not e.get("group") or not e.get("topic"):
            add(i, "꼬리표", "고칠 것", "eyebrow{group, topic, basis} — 어깨끈 내용(무엇을 · 기준 · 단위)을 꼬리표에")
        h = plain(s.get("head", ""))
        n = len(re.sub(r"\s", "", h))
        if not h:
            add(i, "헤드메시지", "고칠 것", "head 없음 — 사실 + 의미 2줄")
        elif n < 40 or n > 95:
            add(i, "헤드메시지 길이", "고칠 것", f"{n}자 — 50~90자(2줄)")
        elif ends_nominal(h) is False:
            add(i, "헤드메시지 문체", "확인할 것", "보고서체(~함 · ~임 · ~됨)로 끝내기")
        f = s.get("foot") or {}
        if re.search(r"\d", json.dumps({k2: v for k2, v in s.items() if k2 not in ("foot", "eyebrow", "note")}, ensure_ascii=False)) and not f.get("source"):
            add(i, "출처", "고칠 것", "숫자가 있는데 foot.source 없음")
        if f.get("source") and not f.get("asof"):
            add(i, "기준일", "확인할 것", "foot.asof(기준일) 없음")
        b = s.get("beats") or []
        if len(b) > 2:
            add(i, "바뀜 단계", "고칠 것", f"{len(b)}개 — 2개까지")
        for l in s.get("links") or []:
            if l.get("to") not in apx_ids:
                add(i, "부록 고리", "고칠 것", f"없는 부록 {l.get('to')}")
    return iss


def cmd_lint(a):
    p = sess(a.name)
    deck = load(p / "deck.json")
    if not deck:
        say({"error": "deck.json 이 없어요"}, 1)
    iss = lint3(deck, lib_dir()) if deck.get("schema") == 3 else lint(deck, lib_dir())
    say({"ok": True, "fix": sum(1 for x in iss if x["sev"] == "고칠 것"), "confirm": sum(1 for x in iss if x["sev"] != "고칠 것"), "issues": iss})


# ───────── build ─────────
def font_face(text, lib):
    src = lib / "style" / "fonts" / "PretendardVariable.woff2"
    if not src.exists():
        return ""
    try:
        from fontTools import subset
        from fontTools.ttLib import TTFont
    except ImportError:
        return ""
    chars = set(text) | set("0123456789.,%+-=→←↑↓·:;!?()[]「」『』'\"/ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz 억조원달러배월년분기")
    opt = subset.Options()
    opt.flavor = "woff2"
    opt.layout_features = ["*"]
    f = TTFont(str(src))
    s = subset.Subsetter(opt)
    s.populate(unicodes=[ord(c) for c in chars])
    s.subset(f)
    import io
    b = io.BytesIO()
    f.flavor = "woff2"
    f.save(b)
    data = base64.b64encode(b.getvalue()).decode()
    return ("@font-face{font-family:'Pretendard';font-weight:100 900;font-display:block;"
            f"src:url(data:font/woff2;base64,{data}) format('woff2')}}\n")


def skeleton_of(lib, rid):
    for f in (lib / "library" / "skeletons").glob("*.json"):
        d = load(f)
        if rid in d:
            return d[rid]
    return None


def engine(lib, v3=True):
    """엔진 3판 = style/deck.css · deck.js + style/parts/*.js(이름순) + 로고. 2판 데크(schema 없음)는 style/v2/ 로."""
    st = lib / "style"
    if not v3:
        return (st / "v2" / "deck.css").read_text(encoding="utf-8"), (st / "v2" / "deck.js").read_text(encoding="utf-8"), None
    js = (st / "deck.js").read_text(encoding="utf-8") + "\n" + "\n".join(f.read_text(encoding="utf-8") for f in sorted((st / "parts").glob("*.js")))
    logo = {}
    for k, f in (("green", "logo.png"), ("white", "logo_white.png")):
        q = st / "brand" / f
        if q.exists():
            logo[k] = "data:image/png;base64," + base64.b64encode(q.read_bytes()).decode()
    return (st / "deck.css").read_text(encoding="utf-8"), js, logo


def page_html(deck, lib, nofont=False, extra_head="", title=None):
    v3 = deck.get("schema") == 3
    css, js, logo = engine(lib, v3)
    payload = json.dumps(deck, ensure_ascii=False).replace("</", "<\\/")
    face = "" if nofont else font_face(payload + (js if v3 else ""), lib)
    m = deck.get("meta", {})
    title = html.escape(title or f"ECOM {m.get('session', '')} · {m.get('title', '')}")
    head_js = f"window.ECOM_LOGO={json.dumps(logo)};\n" if logo else ""
    return (f'<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n'
            f'<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>{title}</title>\n'
            f"{extra_head}<style>\n{face}{css}\n</style>\n</head>\n<body>\n"
            f'<script type="application/json" id="deck-data">{payload}</script>\n'
            f"<script>\n{head_js}{js}\n</script>\n</body>\n</html>\n")


def cmd_build(a):
    p = sess(a.name)
    lib = lib_dir()
    deck = load(p / "deck.json")
    if not deck:
        say({"error": "deck.json 이 없어요"}, 1)
    if deck.get("schema") != 3:
        gl = load(lib / "terms" / "glossary.json", {"words": {}})
        used = set(re.findall(r"\[\[([^\]]+)\]\]", json.dumps(deck.get("slides", []), ensure_ascii=False)))
        deck.setdefault("glossary", {})
        for w in used:
            if w not in deck["glossary"] and w in gl.get("words", {}):
                deck["glossary"][w] = gl["words"][w]
    miss = []
    for s in deck.get("slides", []):
        if s.get("kind") == "diagram" and s.get("layout") == "skeleton" and s.get("skeleton"):
            sk = skeleton_of(lib, s["skeleton"])
            if sk:
                s["skel"] = sk
            else:
                miss.append(s["skeleton"])
    page = page_html(deck, lib, a.nofont)
    out = p / f"ECOM_{a.name}.html"
    out.write_text(page, encoding="utf-8")
    say({"ok": True, "file": str(out), "kb": round(out.stat().st_size / 1024), "slides": len(deck.get("slides", [])),
         "engine": 3 if deck.get("schema") == 3 else 2, "font": "@font-face" in page, "missing_skeletons": miss})


# ───────── check ─────────
def run_browser(br, url, extra, timeout=180):
    args = [br, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--disable-extensions",
            "--virtual-time-budget=9000"] + extra + [url]
    if sys.platform.startswith("linux"):
        args.insert(1, "--no-sandbox")
    return subprocess.run(args, capture_output=True, text=True, encoding="utf-8", errors="ignore", timeout=timeout)


def cmd_check(a):
    p = sess(a.name)
    lib = lib_dir()
    deck = load(p / "deck.json")
    out = p / f"ECOM_{a.name}.html"
    if not deck or not out.exists():
        say({"error": "deck.json · 발표 파일이 없어요 — build 먼저"}, 1)
    v3 = deck.get("schema") == 3
    iss = lint3(deck, lib) if v3 else lint(deck, lib)
    br = browser()
    screen = None
    if br:
        r = run_browser(br, out.resolve().as_uri() + "?check", ["--dump-dom"])
        m = re.search(r'<pre id="ecom-check"[^>]*>(.*?)</pre>', r.stdout, re.S)
        if m:
            screen = json.loads(html.unescape(m.group(1)))
            kinds = {i + 1: x.get("kind") for i, x in enumerate(deck.get("slides", []))}
            for s in screen.get("slides", []):
                i = s.get("i")
                if v3:
                    pg = s.get("page")
                    for key, nm in (("textOverlap", "글끼리 겹침"), ("outside", "장 밖으로 나감"), ("outsideBody", "본문 칸 밖으로")):
                        if s.get(key):
                            iss.append({"slide": i, "item": nm, "sev": "고칠 것", "msg": f"{len(s[key])}곳 : {str(s[key])[:120]}"})
                    if (s.get("fnLines") or 0) > 2:
                        iss.append({"slide": i, "item": "각주 줄", "sev": "고칠 것", "msg": f"{s['fnLines']}줄 — 2줄 안"})
                    if (s.get("headLines") or 0) > 2:
                        iss.append({"slide": i, "item": "헤드메시지 줄", "sev": "고칠 것", "msg": f"{s['headLines']}줄 — 2줄 안"})
                    if s.get("minFont") and s["minFont"] < 11.5:
                        iss.append({"slide": i, "item": "글자 크기", "sev": "고칠 것", "msg": f"가장 작은 글 {s['minFont']}px — 11.5px 이상"})
                    if s.get("occupied") is not None and s["occupied"] < 45 and s.get("kind") not in ("cover", "part"):
                        iss.append({"slide": i, "item": "화면 채움", "sev": "확인할 것", "msg": f"본문 칸 차지 {s['occupied']}% — 45% 밑이면 비어 보임"})
                    continue
                if s.get("chars", 0) > 40 and kinds.get(i) not in ("table", "cover", "end"):
                    iss.append({"slide": i, "item": "화면 글 40자", "sev": "고칠 것", "msg": f"화면에 보이는 글 {s['chars']}자"})
                if s.get("overflow"):
                    iss.append({"slide": i, "item": "넘침", "sev": "고칠 것", "msg": f"넘침 {len(s['overflow'])}곳 : {str(s['overflow'])[:120]}"})
                if s.get("overlap"):
                    iss.append({"slide": i, "item": "겹침", "sev": "고칠 것", "msg": f"겹침 {len(s['overlap'])}곳"})
                for key, nm in (("textOverlap", "글끼리 겹침"), ("textOnMark", "글이 막대 · 점 위"), ("outside", "밖으로 나감")):
                    if s.get(key):
                        iss.append({"slide": i, "item": nm, "sev": "고칠 것", "msg": f"{len(s[key])}곳 : {str(s[key])[:100]}"})
                if (s.get("accentRoles") or 0) > 3:
                    iss.append({"slide": i, "item": "강조 역할 수", "sev": "고칠 것", "msg": f"강조색 역할 {s['accentRoles']}가지 — 3가지까지"})
                if (s.get("accentCount") or 0) > 8:
                    iss.append({"slide": i, "item": "강조색 요소 수", "sev": "확인할 것", "msg": f"강조색 칠한 요소 {s['accentCount']}개 — 8개까지"})
                if s.get("minFont") and s["minFont"] < 16:
                    iss.append({"slide": i, "item": "글자 크기", "sev": "고칠 것", "msg": f"가장 작은 글 {s['minFont']}px"})
        if a.shots:
            sd = p / "work" / "shots"
            sd.mkdir(parents=True, exist_ok=True)
            want = [int(x) for x in a.shots.split(",")] if a.shots != "all" else range(1, len(deck["slides"]) + 1)
            for n in want:
                run_browser(br, out.resolve().as_uri() + f"?still#{n}", ["--window-size=1280,720", f"--screenshot={sd / ('%02d.png' % n)}"], 60)
    seen = set()
    iss = [x for x in iss if not ((x["slide"], x["item"], x["msg"]) in seen or seen.add((x["slide"], x["item"], x["msg"])))]
    iss.sort(key=lambda x: (x["sev"] != "고칠 것", x["slide"]))
    lines = [f"# 점검 — {a.name}", "", f"- 화면 재기 : {'함' if screen else '못 함(브라우저 없음)'}",
             f"- 고칠 것 {sum(1 for x in iss if x['sev'] == '고칠 것')} · 확인할 것 {sum(1 for x in iss if x['sev'] != '고칠 것')}", "",
             "| 장 | 항목 | 구분 | 내용 |", "|---|---|---|---|"]
    lines += [f"| {x['slide'] or '전체'} | {x['item']} | {x['sev']} | {x['msg']} |" for x in iss]
    (p / "work" / "check.md").write_text("\n".join(lines), encoding="utf-8")
    say({"ok": True, "screen_checked": bool(screen), "fix": sum(1 for x in iss if x["sev"] == "고칠 것"),
         "confirm": sum(1 for x in iss if x["sev"] != "고칠 것"), "report": str(p / "work" / "check.md"),
         "issues": iss[:40]})


def main():
    ap = argparse.ArgumentParser(prog="ecs")
    sp = ap.add_subparsers(dest="cmd", required=True)
    sp.add_parser("setup")
    x = sp.add_parser("new"); x.add_argument("name"); x.add_argument("--title", default=""); x.add_argument("--date", default=""); x.add_argument("--series")
    x = sp.add_parser("read"); x.add_argument("name")
    x = sp.add_parser("series"); x.add_argument("--q")
    x = sp.add_parser("fetch"); x.add_argument("name"); x.add_argument("id"); x.add_argument("--since", default="2021.01")
    x = sp.add_parser("mockup"); x.add_argument("id", nargs="?"); x.add_argument("--family", help="화면 종류(kind) 또는 판 2 묶음 이름"); x.add_argument("--q"); x.add_argument("--n", type=int, default=20)
    x = sp.add_parser("find")
    for k in ("layout", "kind", "struct"):
        x.add_argument("--" + k)
    for k in ("cols", "steps", "slots"):
        x.add_argument("--" + k, type=int)
    x.add_argument("--n", type=int, default=12)
    x = sp.add_parser("table"); x.add_argument("name")
    x = sp.add_parser("lint"); x.add_argument("name")
    x = sp.add_parser("build"); x.add_argument("name"); x.add_argument("--nofont", action="store_true")
    x = sp.add_parser("check"); x.add_argument("name"); x.add_argument("--shots", default="")
    a = ap.parse_args()
    try:
        globals()["cmd_" + a.cmd](a)
    except SystemExit:
        raise
    except Exception as e:
        say({"error": f"{type(e).__name__}: {e}"}, 1)


if __name__ == "__main__":
    main()
