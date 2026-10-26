"""Paints marks out of the reel illustrations: the State Emblem on the
government files, and the car maker's badge. Each box is filled with the
colour of the surface around it, then feathered back into the picture."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from artlib import paint, smooth  # noqa: E402

jobs = {
    "reel-insurance.jpg": [(676, 818, 756, 878), (536, 766, 574, 790)],
    "reel-insurance-after.jpg": [(506, 684, 574, 734)],
    "reel-analogue.jpg": [(548, 468, 700, 524)],
    "reel-analogue-after.jpg": [(536, 486, 704, 548)],
}
for name, boxes in jobs.items():
    img = Image.open(name).convert("RGB")
    for b in boxes:
        img = paint(img, b)
    img.save("clean-" + name, quality=86)


for name, box, side in [("reel-analogue.jpg", (548, 470, 700, 524), "above"), ("reel-analogue-after.jpg", (536, 488, 704, 548), "grain")]:
    img = Image.open(name).convert("RGB")
    soft = 7 if side == "above" else 13
    img = smooth(img, box, feather=soft, side=side)
    img = smooth(img, box, feather=soft, radius=18, side=side)
    img.save("clean-" + name, quality=86)
