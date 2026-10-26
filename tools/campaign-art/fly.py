"""The toddler's flight from the clip, as a sprite strip that lines up with
the standing sprite (toddler-seq.webp): same scale, same vertical crop, and
the window runs from the standing crop's left edge to the clip's right
edge, so his flight ends exactly where the standing frames begin.
"""
import glob
import json
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

CELL_H = 280

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from artlib import mask  # noqa: E402

stand = [f for f in sorted(glob.glob("frames/f*.png")) if 1.68 <= float(f[-9:-4]) <= 9.96][::2]
union = np.logical_or.reduce([mask(f) for f in stand])
ys, xs = np.nonzero(union)
pad = 6
sx0, sy0, sx1, sy1 = xs.min() - pad, ys.min() - pad, xs.max() + pad + 1, ys.max() + pad + 1
scale = CELL_H / (sy1 - sy0)

flight = [f for f in sorted(glob.glob("frames/f*.png")) if 0.24 <= float(f[-9:-4]) <= 1.69]
W = 1280
box = (sx0, sy0, W, sy1)
cell_w = round((W - sx0) * scale)
strip = Image.new("RGBA", (cell_w, CELL_H * len(flight)))
check = Image.new("RGBA", (cell_w, CELL_H * len(flight)), (20, 8, 24, 255))
for i, f in enumerate(flight):
    m = mask(f)
    img = Image.open(f).convert("RGBA")
    alpha = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.9))
    img.putalpha(alpha)
    cell = img.crop(box).resize((cell_w, CELL_H), Image.LANCZOS)
    strip.alpha_composite(cell, (0, i * CELL_H))
    check.alpha_composite(cell, (0, i * CELL_H))
strip.save("cut/toddler-fly.webp", "WEBP", quality=78, method=6)
check.convert("RGB").resize((cell_w // 2, CELL_H * len(flight) // 2)).save("cut/toddler-fly-check.jpg")
stand_w = round((sx1 - sx0) * scale)
print(json.dumps({"frames": len(flight), "cell": [cell_w, CELL_H], "standCell": [stand_w, CELL_H], "times": [f[-9:-4] for f in flight]}))
