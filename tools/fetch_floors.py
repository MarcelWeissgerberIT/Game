"""Download the generated floor renders (floors 3-10), convert to WebP, and draw layout-check contact sheets."""
import json, subprocess, sys, os
from PIL import Image, ImageDraw
BASE = "https://cdn.openart.ai/openart-ai/production/2026-09/create-image/wRD6PTxSzjxZwjWN69MC/"
LAY = {
 "A": {"door": (30,30,40,47), "plate": (41,37,18,5), "keypad": (77,43,16,16), "sconce": (76,20,22,22), "frame": (1,29,24,24), "note": (41,76,20,11)},
 "B": {"door": (30,30,40,47), "plate": (41,37,18,5), "s1": (19,8,13,14), "s2": (35,8,13,14), "s3": (52,8,13,14), "s4": (68,8,13,14), "panel": (69,41,15,28), "shelf": (0,49,26,15), "note": (41,76,20,11)},
}
out_dir = sys.argv[1]
assets = json.load(open("tools/floor_assets.json"))
os.makedirs("tools/raw", exist_ok=True)
for floor in range(3, 11):
    sheet = Image.new("RGB", (10 * 270, 480), (0, 0, 0))
    for li, layout in enumerate("AB"):
        for k, name in enumerate(assets[f"{floor}{layout}"]):
            room = floor * 100 + li * 5 + k + 1
            raw = f"tools/raw/{room}.png"
            if not os.path.exists(raw):
                subprocess.run(["curl", "-sSfL", "-o", raw, BASE + name], check=True)
            im = Image.open(raw).convert("RGB")
            im.resize((1080, 1920), Image.LANCZOS).save(f"assets/rooms/{room}.webp", quality=82, method=6)
            th = im.resize((270, 480)); d = ImageDraw.Draw(th)
            for lab, (x, y, w, h) in LAY[layout].items():
                d.rectangle([x*2.7, y*4.8, (x+w)*2.7, (y+h)*4.8], outline=(255, 0, 0), width=1)
            d.text((4, 4), str(room), fill=(255, 255, 0))
            sheet.paste(th, ((li * 5 + k) * 270, 0))
    sheet.save(f"{out_dir}/sheet-{floor}.jpg", quality=80)
    print("floor", floor, "ok")
