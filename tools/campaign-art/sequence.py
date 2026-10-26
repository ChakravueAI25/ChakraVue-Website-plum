"""Cuts the toddler out of a run of video frames into one sprite strip.

All frames share one crop window (the union of the character's boxes), so
the figure doesn't jitter between frames. Output: a vertical strip of
CELL_H-tall cells, plus a dark-background contact sheet to check by eye.
"""
import glob
import json
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from artlib import mask  # noqa: E402

START, END, STEP = float(sys.argv[1]), float(sys.argv[2]), int(sys.argv[3])
OUT = sys.argv[4]
CELL_H = 280

frames = [f for f in sorted(glob.glob("frames/f*.png")) if START <= float(f[-9:-4]) <= END][::STEP]


masks = [mask(f) for f in frames]
union = np.logical_or.reduce(masks)
ys, xs = np.nonzero(union)
pad = 6
box = (xs.min() - pad, ys.min() - pad, xs.max() + pad + 1, ys.max() + pad + 1)
w, h = box[2] - box[0], box[3] - box[1]
cell_w = round(w * CELL_H / h)

strip = Image.new("RGBA", (cell_w, CELL_H * len(frames)))
check = Image.new("RGBA", (cell_w * len(frames), CELL_H), (20, 8, 24, 255))
for i, (f, m) in enumerate(zip(frames, masks)):
    img = Image.open(f).convert("RGBA")
    alpha = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.9))
    img.putalpha(alpha)
    cell = img.crop(box).resize((cell_w, CELL_H), Image.LANCZOS)
    strip.alpha_composite(cell, (0, i * CELL_H))
    check.alpha_composite(cell, (i * cell_w, 0))

# A sparkle from the fly-in survives the cut in one frame (05.04 s, between
# his feet): that cell shows its neighbour instead.
PATCH = {12: 11} if (START, END, STEP) == (1.68, 9.96, 2) else {}
for bad, good in PATCH.items():
    strip.paste(strip.crop((0, good * CELL_H, cell_w, (good + 1) * CELL_H)), (0, bad * CELL_H))

strip.save(OUT, "WEBP", quality=78, method=6)
check.convert("RGB").save(OUT.replace(".webp", "-check.jpg"), quality=80)
print(json.dumps({"frames": len(frames), "cell": [cell_w, CELL_H], "times": [f[-9:-4] for f in frames]}))
