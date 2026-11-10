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
KINDS = {"cover", "part", "end", "statement", "number", "chart", "diagram", "compare", "question", "table"}
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


def lib_dir():
    env = os.environ.get("ECOM_SLIDE_LIB")
    return Path(env) if env else root() / ".ecom-slide"


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
    if (lib / ".git").exists():
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


# ───────── series ─────────
def cmd_series(a):
    ser = load(lib_dir() / "data" / "series.json", {"series": {}})
    s = ser.get("series", {})
    if a.id:
        if a.id not in s:
            say({"error": f"계열 없음 : {a.id}"}, 1)
        d = s[a.id]
        data = [x for x in d["data"] if not a.since or x[0] >= a.since]
        say({"id": a.id, "name": d["name"], "unit": d["unit"], "source": d.get("source", ""), "updated": ser.get("updated"), "data": data})
    q = (a.q or "").lower()
    hits = [{"id": k, "name": v["name"], "unit": v["unit"], "last": v["data"][-1] if v["data"] else None}
            for k, v in s.items() if not q or q in v["name"].lower() or q in k.lower()]
    say({"updated": ser.get("updated"), "count": len(hits), "series": hits, "failed": list(ser.get("failed", {}).keys())})


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


def cmd_lint(a):
    p = sess(a.name)
    deck = load(p / "deck.json")
    if not deck:
        say({"error": "deck.json 이 없어요"}, 1)
    iss = lint(deck, lib_dir())
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


def cmd_build(a):
    p = sess(a.name)
    lib = lib_dir()
    deck = load(p / "deck.json")
    if not deck:
        say({"error": "deck.json 이 없어요"}, 1)
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
    css = (lib / "style" / "deck.css").read_text(encoding="utf-8")
    js = (lib / "style" / "deck.js").read_text(encoding="utf-8")
    payload = json.dumps(deck, ensure_ascii=False).replace("</", "<\\/")
    face = "" if a.nofont else font_face(payload, lib)
    m = deck.get("meta", {})
    title = html.escape(f"ECOM {m.get('session', '')} · {m.get('title', '')}")
    page = (f'<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n'
            f'<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>{title}</title>\n'
            f"<style>\n{face}{css}\n</style>\n</head>\n<body>\n"
            f'<script type="application/json" id="deck-data">{payload}</script>\n'
            f"<script>\n{js}\n</script>\n</body>\n</html>\n")
    out = p / f"ECOM_{a.name}.html"
    out.write_text(page, encoding="utf-8")
    say({"ok": True, "file": str(out), "kb": round(out.stat().st_size / 1024), "slides": len(deck.get("slides", [])),
         "font": bool(face), "missing_skeletons": miss})


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
    iss = lint(deck, lib)
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
                if s.get("chars", 0) > 40 and kinds.get(i) not in ("table", "cover", "end"):
                    iss.append({"slide": i, "item": "화면 글 40자", "sev": "고칠 것", "msg": f"화면에 보이는 글 {s['chars']}자"})
                if s.get("overflow"):
                    iss.append({"slide": i, "item": "넘침", "sev": "고칠 것", "msg": f"넘침 {len(s['overflow'])}곳 : {str(s['overflow'])[:120]}"})
                if s.get("overlap"):
                    iss.append({"slide": i, "item": "겹침", "sev": "고칠 것", "msg": f"겹침 {len(s['overlap'])}곳"})
                if s.get("minFont") and s["minFont"] < 14:
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
    x = sp.add_parser("series"); x.add_argument("--q"); x.add_argument("--id"); x.add_argument("--since", default="")
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
