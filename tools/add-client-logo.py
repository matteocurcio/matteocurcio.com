#!/usr/bin/env python3
"""
Turn a client logo into a marquee-ready asset.

    python3 tools/add-client-logo.py ~/Desktop/yamaha.svg yamaha
    python3 tools/add-client-logo.py ~/Desktop/logos/*.png        # slug from filename

Writes public/images/clients/<slug>.png and prints the line to paste into
src/components/ClientMarquee.astro.

What it does and why:
  - Flattens the logo to a black-on-transparent silhouette. The site has a light
    and a dark theme; a black wordmark disappears on one and a white one on the
    other. A silhouette works in both because the dark theme just inverts it.
  - Keys out white/near-white backgrounds, so JPEGs and flat PNGs work.
  - Trims to the ink, so the marquee's single gap value gives an even rhythm.
  - Normalises to 160px tall (2x the ~80px display height).

Needs: Pillow (pip3 install Pillow). SVG/PDF input also needs Google Chrome,
which is used to rasterise before processing.
"""

import os
import re
import subprocess
import sys
import tempfile

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required:  pip3 install Pillow")

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(REPO, "public", "images", "clients")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

TARGET_H = 160          # 2x the ~80px the marquee displays
WHITE_CUTOFF = 26       # alpha below this is treated as paper, not ink
INK_BOOST = 1.35        # firms up mid-greys so thin marks stay visible


def slugify(name):
    s = re.sub(r"\.[A-Za-z0-9]+$", "", os.path.basename(name)).lower()
    s = re.sub(r"^brands[_-]", "", s)
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "logo"


def rasterise_vector(path):
    """Render an SVG/PDF via Chrome. Height is modest and the viewport wide so
    very wide wordmarks (GMC is nearly 6:1) don't get clipped."""
    if not os.path.exists(CHROME):
        sys.exit(f"Vector input needs Chrome at {CHROME}\n"
                 f"Export {os.path.basename(path)} to PNG at 400px tall and re-run.")
    work = tempfile.mkdtemp()
    local = os.path.join(work, os.path.basename(path))
    with open(path, "rb") as src, open(local, "wb") as dst:
        dst.write(src.read())
    html = os.path.join(work, "page.html")
    with open(html, "w") as f:
        f.write('<style>html,body{margin:0;background:#fff}'
                'img,embed{display:block;height:300px;width:auto}</style>'
                f'<img src="{os.path.basename(path)}">')
    shot = os.path.join(work, "shot.png")
    subprocess.run([CHROME, "--headless", "--disable-gpu", "--hide-scrollbars",
                    f"--screenshot={shot}", "--window-size=2400,400",
                    "--virtual-time-budget=4000", "file://" + html],
                   capture_output=True)
    if not os.path.exists(shot):
        sys.exit(f"Chrome could not render {path}")
    return Image.open(shot)


def silhouette(im):
    im = im.convert("RGBA")
    flat = Image.alpha_composite(Image.new("RGBA", im.size, (255, 255, 255, 255)), im).convert("L")
    src_a = im.getchannel("A")
    out = Image.new("RGBA", im.size, (0, 0, 0, 0))
    px, fp, ap = out.load(), flat.load(), src_a.load()
    for y in range(im.height):
        for x in range(im.width):
            a = 255 - fp[x, y]                 # dark ink -> opaque
            if a < WHITE_CUTOFF:
                a = 0                          # drop the paper
            a = min(255, int(a * INK_BOOST))
            if ap[x, y] == 0:
                a = 0                          # respect existing transparency
            px[x, y] = (0, 0, 0, a)
    return out


def process(path, slug=None):
    slug = slug or slugify(path)
    ext = os.path.splitext(path)[1].lower()
    if ext in (".svg", ".pdf"):
        im = rasterise_vector(path)
    elif ext in (".ai", ".eps"):
        sys.exit(f"{os.path.basename(path)}: Illustrator files can't be read here.\n"
                 f"Open it and export an SVG or a PNG at 400px tall, then re-run.")
    else:
        im = Image.open(path)

    im = silhouette(im)
    bbox = im.getbbox()
    if not bbox:
        sys.exit(f"{os.path.basename(path)}: nothing left after removing the background.\n"
                 f"Likely a light logo on a dark background — invert it first.")
    im = im.crop(bbox)
    width = max(1, round(im.width * TARGET_H / im.height))
    im = im.resize((width, TARGET_H), Image.LANCZOS)

    os.makedirs(OUT_DIR, exist_ok=True)
    dest = os.path.join(OUT_DIR, slug + ".png")
    im.save(dest, optimize=True)

    print(f"\n  wrote public/images/clients/{slug}.png  ({width}x{TARGET_H}, "
          f"{os.path.getsize(dest) // 1024}KB)")
    if width / TARGET_H > 6:
        print("  note: very wide mark — it will hit the marquee's max-width cap.")
    print("\n  1. add to DIMS in src/components/ClientMarquee.astro:")
    print(f'       "{slug}": [{width}, {TARGET_H}],')
    print("  2. give the client a logo (keep any existing href):")
    print(f'       {{ name: "…", logo: L + "{slug}.png" }},\n')


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    if len(args) == 2 and not os.path.exists(args[1]):
        process(args[0], args[1])          # explicit slug
    else:
        for p in args:
            process(p)
