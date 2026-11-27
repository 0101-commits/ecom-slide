# 스킬 원본(skill/ecom-slide) → 작업 저장소 .claude/skills/ecom-slide 로 복사, 그리고 Claude 앱 올리기용 zip
# 엔진 3판부터 zip 안에 lib/(엔진 · 부품 · 규칙 · 목업 264(4판) · 용어 · 계열 사전)를 함께 넣어 레퍼런스 저장소 없이도 돈다.
# 실행: python tools/sync_skill.py <작업 저장소 경로 | -> [--zip 출력.zip]
import argparse, shutil, sys, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB_FILES = ["style/deck.css", "style/deck.js", "style/SCHEMA3.md", "style/SCHEMA3_charts.md", "style/SCHEMA3_diagrams.md",
             "style/v2/deck.css", "style/v2/deck.js", "style/v2/SCHEMA.md", "style/v2/SCHEMA2.md",
             "rules/plan.md", "rules/write.md", "rules/design_grammar.md", "rules/mockup_map.md", "style/SCHEMA4.md", "style/SCHEMA6_blocks.md", "terms/glossary.json",
             "library/mockups/mockups.json", "library/mockups/xtypes.json", "library/packs/packs.json", "library/mockups/index.md", "library/catalog.json", "data/series_ids.json"]
LIB_DIRS = ["style/parts", "style/brand", "style/fonts", "style/geo", "style/vendor", "style/icons", "style/tossface"]


def lib_items():
    out = [ROOT / f for f in LIB_FILES if (ROOT / f).exists()]
    out += sorted((ROOT / "style").glob("SCHEMA4_*.md"))
    for d in LIB_DIRS:
        out += sorted(p for p in (ROOT / d).rglob("*") if p.is_file() and not ({"__pycache__", ".omc"} & set(p.parts)))
    return out


ap = argparse.ArgumentParser()
ap.add_argument("study")
ap.add_argument("--zip", default="")
a = ap.parse_args()
src = ROOT / "skill" / "ecom-slide"
ign = shutil.ignore_patterns("__pycache__", "*.pyc", ".omc")
if a.study != "-":
    dst = Path(a.study) / ".claude" / "skills" / "ecom-slide"
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst, ignore=ign)
    for f in lib_items():
        t = dst / "lib" / f.relative_to(ROOT)
        t.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(f, t)
    print("복사", dst)
if a.zip:
    with zipfile.ZipFile(a.zip, "w", zipfile.ZIP_DEFLATED) as z:
        for f in sorted(src.rglob("*")):
            if f.is_file() and not ({"__pycache__", ".omc"} & set(f.parts)):
                z.write(f, Path("ecom-slide") / f.relative_to(src))
        # Claude 앱 스킬 zip 은 파일 200개까지 : 부품 *.js 는 이름순으로 이은 한 파일(엔진이 이름순으로 잇는 것과 같은 결과),
        # 라인 아이콘 원본 SVG 는 이미 parts/a_icons.js 에 들어 있어 라이선스 전문만. Tossface 는 원본 그대로(변형 금지 조건)
        pdir = ROOT / "style" / "parts"
        z.writestr(str(Path("ecom-slide") / "lib" / "style" / "parts" / "_parts.js"), "\n".join(f.read_text(encoding="utf-8") for f in sorted(pdir.glob("*.js"))))
        for f in lib_items():
            if f.parent == pdir or (f.parent == ROOT / "style" / "icons" and f.suffix == ".svg"):
                continue
            z.write(f, Path("ecom-slide") / "lib" / f.relative_to(ROOT))
        n = len(z.namelist())
    print("zip", a.zip, round(Path(a.zip).stat().st_size / 1024), "KB", n, "파일")
    if n > 200:
        sys.exit(f"파일 {n}개 — Claude 앱 한도 200개를 넘음")
