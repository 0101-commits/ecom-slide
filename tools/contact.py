# 골격 모아 보기 — 골격(글 없음)만으로 장 모양을 그려 한 쪽에 N장씩. 사람 확인 · 갤러리 미리보기용
# 실행: python -X utf8 tools/contact.py <library 폴더> <출력 폴더> [--per 50] [--ids r00001,r00002]
import argparse, json, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

FILL = {"acc": (0, 116, 79), "dark": (40, 48, 44), "mid": (150, 165, 158), "light": (226, 232, 229), "none": None}


def draw(skel, w=320):
    s = w / 1280
    im = Image.new("RGB", (w, round(720 * s)), "white")
    d = ImageDraw.Draw(im)
    bx, by, bw, bh = skel["body"]
    d.rectangle([bx * s, by * s, (bx + bw) * s, (by + bh) * s], outline=(235, 238, 236))
    for b in skel["boxes"]:
        x0, y0, x1, y1 = b["x"] * s, b["y"] * s, (b["x"] + b["w"]) * s, (b["y"] + b["h"]) * s
        f = FILL.get(b.get("fill"), None)
        ol = (120, 130, 125) if b.get("line") or not f else None
        if b.get("pic"):
            f, ol = (217, 217, 217), None
        k = b["k"]
        if k == "ellipse":
            d.ellipse([x0, y0, x1, y1], fill=f, outline=ol)
        elif k in ("chevron", "pentagon", "arrowR"):
            m = min((x1 - x0) * 0.3, (y1 - y0) * 0.5)
            pts = [(x0, y0), (x1 - m, y0), (x1, (y0 + y1) / 2), (x1 - m, y1), (x0, y1)]
            if k == "chevron":
                pts.append((x0 + m, (y0 + y1) / 2))
            d.polygon(pts, fill=f, outline=ol)
        elif k == "diamond":
            d.polygon([((x0 + x1) / 2, y0), (x1, (y0 + y1) / 2), ((x0 + x1) / 2, y1), (x0, (y0 + y1) / 2)], fill=f, outline=ol)
        elif k == "triangle":
            d.polygon([((x0 + x1) / 2, y0), (x1, y1), (x0, y1)], fill=f, outline=ol)
        elif k == "table":
            d.rectangle([x0, y0, x1, y1], outline=(120, 130, 125))
            for i in range(1, b.get("rows", 1)):
                yy = y0 + (y1 - y0) * i / b["rows"]
                d.line([x0, yy, x1, yy], fill=(200, 206, 203))
            for i in range(1, b.get("cols", 1)):
                xx = x0 + (x1 - x0) * i / b["cols"]
                d.line([xx, y0, xx, y1], fill=(200, 206, 203))
        elif k == "chart":
            d.rectangle([x0, y0, x1, y1], outline=(0, 116, 79))
            for i in range(5):
                hh = (y1 - y0) * (0.3 + 0.13 * i)
                xx = x0 + (x1 - x0) * (0.12 + i * 0.17)
                d.rectangle([xx, y1 - hh, xx + (x1 - x0) * 0.1, y1], fill=(195, 204, 200))
        elif x1 - x0 < 2 or y1 - y0 < 2:  # 얇은 띠는 선으로
            d.line([x0, y0, max(x0, x1), max(y0, y1)], fill=f or (120, 130, 125), width=1)
        else:
            r = int(min(6 * s, (x1 - x0) / 2, (y1 - y0) / 2)) if k == "round" else 0
            box = [int(x0), int(y0), max(int(x0) + 1, int(x1)), max(int(y0) + 1, int(y1))]
            if r >= 1:
                d.rounded_rectangle(box, radius=r, fill=f, outline=ol)
            else:
                d.rectangle(box, fill=f, outline=ol)
        if b.get("chars") and (x1 - x0) > 6:
            ty = y0 + 3
            for _ in range(min(b.get("paras", 1), max(1, int((y1 - y0 - 4) // 5)))):
                d.line([x0 + 3, ty + 2, x0 + 3 + (x1 - x0 - 6) * 0.7, ty + 2], fill=(90, 100, 95) if f in (None, FILL["light"]) else (255, 255, 255))
                ty += 5
    for l in skel["lines"]:
        d.line([l["x1"] * s, l["y1"] * s, l["x2"] * s, l["y2"] * s], fill=(110, 120, 115), width=1)
    return im


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("lib"); ap.add_argument("out")
    ap.add_argument("--per", type=int, default=50); ap.add_argument("--ids", default="")
    a = ap.parse_args()
    lib, out = Path(a.lib), Path(a.out); out.mkdir(parents=True, exist_ok=True)
    cat = json.load(open(lib / "catalog.json", encoding="utf-8"))
    sk = {}
    for f in (lib / "skeletons").glob("*.json"):
        sk.update(json.load(open(f, encoding="utf-8")))
    ids = a.ids.split(",") if a.ids else [x["id"] for x in cat["items"]]
    font = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", 13) if Path("C:/Windows/Fonts/malgun.ttf").exists() else ImageFont.load_default()
    cols, tw, th = 10, 320, 180
    for pg in range(math.ceil(len(ids) / a.per)):
        chunk = ids[pg * a.per:(pg + 1) * a.per]
        rows = math.ceil(len(chunk) / cols)
        sheet = Image.new("RGB", (cols * (tw + 8) + 8, rows * (th + 26) + 8), (245, 247, 245))
        d = ImageDraw.Draw(sheet)
        for i, rid in enumerate(chunk):
            x, y = 8 + (i % cols) * (tw + 8), 8 + (i // cols) * (th + 26)
            sheet.paste(draw(sk[rid], tw), (x, y))
            d.text((x, y + th + 4), rid, fill=(60, 70, 65), font=font)
        sheet.save(out / ("page_%03d.png" % (pg + 1)))
    print("쪽", math.ceil(len(ids) / a.per))


if __name__ == "__main__":
    main()
