"""Download the OpenArt renders, convert them to WebP for the game and build gridded previews."""
import sys, subprocess
from PIL import Image, ImageDraw

BASE = "https://cdn.openart.ai/openart-ai/production/2026-09/create-image/wRD6PTxSzjxZwjWN69MC/"
ROOMS = {
  101: "image_1790494993234_5ae9ef8c_1790494993933_e124f823.png",
  102: "image_1790495001702_3cdfb055_1790495002264_d6e6f872.png",
  103: "image_1790495003353_ee03b56f_1790495003934_6775034b.png",
  104: "image_1790495010550_1c73ec22_1790495011131_1e1e3851.png",
  105: "image_1790495010907_ffdd3682_1790495011376_1bc6b3e2.png",
  106: "image_1790495016096_640fb97a_1790495016420_02e06a16.png",
  107: "image_1790495023830_1307ccb8_1790495024429_75031fba.png",
  108: "image_1790495026074_0c9bfa3a_1790495026710_0321f928.png",
  109: "image_1790495030039_f025c26a_1790495030474_1ed7e3e9.png",
  110: "image_1790495036207_fe0b13d0_1790495036838_f2e1d167.png",
}
ICON = "image_1790495037459_7e2a94eb_1790495037983_c0ddb973.png"
PREVIEW_DIR = sys.argv[1]

def get(name, dest):
    subprocess.run(["curl","-sSfL","-o",dest,BASE+name],check=True)

def gridded(im, out, step=10):
    im = im.convert("RGB").resize((540, 960))
    d = ImageDraw.Draw(im)
    for p in range(0, 101, step):
        x = int(540 * p / 100); y = int(960 * p / 100)
        d.line([(x, 0), (x, 960)], fill=(255, 0, 0), width=1)
        d.line([(0, y), (540, y)], fill=(255, 0, 0), width=1)
        d.text((x + 2, 2), str(p), fill=(255, 255, 0))
        d.text((2, y + 2), str(p), fill=(255, 255, 0))
    im.save(out, quality=85)

for n, f in ROOMS.items():
    raw = f"tools/raw/{n}.png"
    get(f, raw)
    im = Image.open(raw).convert("RGB")
    im.resize((1080, 1920), Image.LANCZOS).save(f"assets/rooms/{n}.webp", quality=82, method=6)
    gridded(im, f"{PREVIEW_DIR}/{n}.jpg")
    print(n, "ok")

t = Image.open("tools/raw/title.png").convert("RGB")
t.resize((1080, 1920), Image.LANCZOS).save("assets/ui/title.webp", quality=82, method=6)
get(ICON, "tools/raw/icon.png")
ic = Image.open("tools/raw/icon.png").convert("RGB")
ic.resize((512, 512), Image.LANCZOS).save("assets/ui/icon-512.png", optimize=True)
ic.resize((192, 192), Image.LANCZOS).save("assets/ui/icon-192.png", optimize=True)
ic.resize((256, 256)).save(f"{PREVIEW_DIR}/icon.jpg", quality=85)
print("done")
