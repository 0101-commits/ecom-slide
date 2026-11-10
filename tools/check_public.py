# 공개 검사 — 저장소에 고객 흔적이 들어오지 않았는지. push 마다 GitHub 작업이 돌리고, 걸리면 실패.
#  · 모든 글 파일의 글(줄 · JSON 글 값)을 고객명 해시(rules/client_hash.json)와 대조
#  · 골격 · 목록에 정해진 칸 말고 다른 칸(이름 · 글 · 고객 · 업종 · 연도)이 있으면 실패
#  · 그림 · PPTX · 엑셀 같은 파일이 들어오면 실패(글꼴 · 아이콘 자리 빼고)
# 실행: python tools/check_public.py [저장소 경로]
import json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from ref_build import hit  # noqa: E402

ROOT = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent
TEXT = {".json", ".md", ".py", ".js", ".css", ".html", ".yml", ".yaml", ".txt", ".ps1", ".cmd", ".svg"}
ALLOW_BIN = re.compile(r"^(style/fonts/.+\.woff2|\.git/.*)$")
SKEL_KEYS = {"w", "h", "body", "boxes", "lines"}
BOX_KEYS = {"k", "x", "y", "w", "h", "fill", "line", "rot", "chars", "paras", "sz", "slot", "pic", "rows", "cols", "chart", "ser", "cat"}
LINE_KEYS = {"x1", "y1", "x2", "y2", "arrow"}
ITEM_KEYS = {"id", "s", "t", "tn", "ch", "kind", "layout", "nb", "ns", "cols", "rows", "steps", "tbl", "cht", "pic"}
SKIP = {"rules/client_hash.json"}


def main():
    hashes = set(json.load(open(ROOT / "rules" / "client_hash.json", encoding="utf-8"))["h"])
    bad, strings = [], {}
    for f in sorted(ROOT.rglob("*")):
        if not f.is_file():
            continue
        rel = f.relative_to(ROOT).as_posix()
        if rel.startswith((".git/", ".omc/")) or "__pycache__/" in rel or rel in SKIP or rel == "style/preview.html":
            continue
        if f.suffix.lower() not in TEXT and f.name not in (".gitignore", ".gitattributes"):
            if not ALLOW_BIN.match(rel):
                bad.append(f"올리면 안 되는 파일 : {rel}")
            continue
        txt = f.read_text(encoding="utf-8", errors="ignore")
        if rel.startswith("library/skeletons/"):
            for rid, sk in json.loads(txt).items():
                if not re.fullmatch(r"r\d{5}", rid) or set(sk) - SKEL_KEYS:
                    bad.append(f"골격 칸 이상 : {rel} {rid}")
                for b in sk.get("boxes", []):
                    if set(b) - BOX_KEYS:
                        bad.append(f"골격 칸 이상 : {rel} {rid} {sorted(set(b) - BOX_KEYS)}")
                        break
                for l in sk.get("lines", []):
                    if set(l) - LINE_KEYS:
                        bad.append(f"골격 선 칸 이상 : {rel} {rid}")
                        break
            continue  # 골격엔 숫자 · 정해진 낱말만
        if rel == "library/catalog.json":
            for it in json.loads(txt)["items"]:
                if set(it) - ITEM_KEYS:
                    bad.append(f"목록 칸 이상 : {it['id']} {sorted(set(it) - ITEM_KEYS)}")
        for line in txt.splitlines():
            s = line.strip()
            if s:
                strings.setdefault(s[:400], rel)
    for s, rel in strings.items():
        h = hit(s, hashes)
        if h:
            bad.append(f"고객명 해시 일치 : {rel} (글자 수 {len(h)})")
    for b in bad:
        print("✗", b)
    print("공개 검사 :", "통과" if not bad else f"걸림 {len(bad)}")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
