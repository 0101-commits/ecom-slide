# 스킬 원본(skill/ecom-slide) → 작업 저장소 .claude/skills/ecom-slide 로 복사, 그리고 Claude 앱 올리기용 zip
# 실행: python tools/sync_skill.py <작업 저장소 경로> [--zip 출력.zip]
import argparse, shutil, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("study")
ap.add_argument("--zip", default="")
a = ap.parse_args()
src = ROOT / "skill" / "ecom-slide"
dst = Path(a.study) / ".claude" / "skills" / "ecom-slide"
if dst.exists():
    shutil.rmtree(dst)
shutil.copytree(src, dst, ignore=shutil.ignore_patterns("__pycache__", "*.pyc", ".omc"))
print("복사", dst)
if a.zip:
    with zipfile.ZipFile(a.zip, "w", zipfile.ZIP_DEFLATED) as z:
        for f in sorted(src.rglob("*")):
            if f.is_file() and not ({"__pycache__", ".omc"} & set(f.parts)):
                z.write(f, Path("ecom-slide") / f.relative_to(src))
    print("zip", a.zip)
