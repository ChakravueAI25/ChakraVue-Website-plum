"""Cuts a character out of a light, low-saturation background.

python cutout.py <in> <out.png> [min_light] [max_chroma] [--keep-bbox]
Background = light, greyish pixels connected to the image border.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

src, dst = sys.argv[1], sys.argv[2]
min_light = int(sys.argv[3]) if len(sys.argv) > 3 and not sys.argv[3].startswith("--") else 190
max_chroma = int(sys.argv[4]) if len(sys.argv) > 4 and not sys.argv[4].startswith("--") else 48

img = Image.open(src).convert("RGB")
a = np.asarray(img).astype(np.int16)
mx, mn = a.max(axis=2), a.min(axis=2)
bg_like = (mn >= min_light) & ((mx - mn) <= max_chroma)

labels, _ = ndimage.label(bg_like)
border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
border = border[border != 0]
bg = np.isin(labels, border)

fg = ~bg
# Keep the largest foreground blob (the character), drop sparkles and specks.
fl, n = ndimage.label(fg)
if n:
    sizes = ndimage.sum(fg, fl, range(1, n + 1))
    fg = fl == (int(np.argmax(sizes)) + 1)
fg = ndimage.binary_fill_holes(fg)
fg = ndimage.binary_opening(fg, iterations=1)

alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.9))
out = img.convert("RGBA")
out.putalpha(alpha)
ys, xs = np.nonzero(fg)
pad = 4
box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad + 1, img.width), min(ys.max() + pad + 1, img.height))
if "--keep-bbox" not in sys.argv:
    out = out.crop(box)
out.save(dst)
print(dst, out.size, "box", box)
