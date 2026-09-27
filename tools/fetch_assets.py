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
  201: "image_1790501013329_adcc645a_1790501013730_ce6e68c7.png",
  202: "image_1790501015178_9fd6db16_1790501015577_b613eab2.png",
  203: "image_1790501020601_b3414064_1790501021103_4ce08e21.png",
  204: "image_1790501024423_17556689_1790501025061_ef70ee83.png",
  205: "image_1790501028101_14b25b4b_1790501028802_460ef33d.png",
  206: "image_1790501033834_4af45bb4_1790501034324_5d6633c1.png",
  207: "image_1790501036566_4e6c9295_1790501037308_7568f275.png",
  208: "image_1790501042289_f1a71bb6_1790501042984_2e095227.png",
  209: "image_1790501050046_2b2036ad_1790501050411_afc3a338.png",
  210: "image_1790501051981_48cd4c9d_1790501053221_20bd88e5.png",
}
ONLY = [int(a) for a in sys.argv[2:]] or list(ROOMS)
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
    if n not in ONLY: continue
    raw = f"tools/raw/{n}.png"
    get(f, raw)
    im = Image.open(raw).convert("RGB")
    im.resize((1080, 1920), Image.LANCZOS).save(f"assets/rooms/{n}.webp", quality=82, method=6)
    gridded(im, f"{PREVIEW_DIR}/{n}.jpg")
    print(n, "ok")

if len(sys.argv) > 2: sys.exit(0)
t = Image.open("tools/raw/title.png").convert("RGB")
t.resize((1080, 1920), Image.LANCZOS).save("assets/ui/title.webp", quality=82, method=6)
get(ICON, "tools/raw/icon.png")
ic = Image.open("tools/raw/icon.png").convert("RGB")
ic.resize((512, 512), Image.LANCZOS).save("assets/ui/icon-512.png", optimize=True)
ic.resize((192, 192), Image.LANCZOS).save("assets/ui/icon-192.png", optimize=True)
ic.resize((256, 256)).save(f"{PREVIEW_DIR}/icon.jpg", quality=85)
print("done")
