"""Shared helpers for the campaign art scripts (see README.md).

mask():   the character cut out of a light, low-saturation background.
paint():  covers a box with the colour of the surface around it.
smooth(): blurs a mark away and restores the picture's own grain.
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

# Background = light, greyish pixels connected to the frame's edge. The clip's
# backgrounds stay above 138 in every channel and within 72 of grey; the
# toddler's skin, hair and costume don't.
MIN_LIGHT, MAX_CHROMA = 138, 72


def mask(path):
    a = np.asarray(Image.open(path).convert("RGB")).astype(np.int16)
    mx, mn = a.max(axis=2), a.min(axis=2)
    bg_like = (mn >= MIN_LIGHT) & ((mx - mn) <= MAX_CHROMA)
    labels, _ = ndimage.label(bg_like)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    fg = ~np.isin(labels, border[border != 0])
    fl, n = ndimage.label(fg)
    sizes = ndimage.sum(fg, fl, range(1, n + 1))
    fg = ndimage.binary_fill_holes(fl == (int(np.argmax(sizes)) + 1))
    # Sparkles from the fly-in cling to the cape and feet: near-white pixels
    # close to the outline are background. (Eye whites sit well inside.)
    near_edge = ndimage.distance_transform_edt(fg) < 16
    sparkle = (mn > 205) & ((mx - mn) < 30) & near_edge
    fg &= ~ndimage.binary_dilation(sparkle, iterations=2)
    fl, n = ndimage.label(fg)
    sizes = ndimage.sum(fg, fl, range(1, n + 1))
    fg = ndimage.binary_fill_holes(fl == (int(np.argmax(sizes)) + 1))
    return ndimage.binary_opening(fg, iterations=1)


def paint(img, box, ring=10, feather=6):
    x0, y0, x1, y1 = box
    a = np.asarray(img).astype(float)
    outer = a[max(y0 - ring, 0):y1 + ring, max(x0 - ring, 0):x1 + ring].reshape(-1, 3)
    inner = a[y0:y1, x0:x1].reshape(-1, 3)
    # Median of the ring only (the outer area minus the box).
    colour = np.median(np.concatenate([outer[: ring * (x1 - x0)], outer[-ring * (x1 - x0):]]), axis=0)
    patch = Image.new("RGB", img.size, tuple(int(c) for c in colour))
    noise = Image.effect_noise(img.size, 6).convert("RGB")
    patch = Image.blend(patch, noise, 0.04)
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(box, radius=8, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(feather))
    return Image.composite(patch, img, mask)


def smooth(img, box, feather=7, radius=14, side="above"):
    """Blurs the mark away, then puts back the picture's own grain (the
    fine detail of the surface just above), so the paint still reads."""
    x0, y0, x1, y1 = box
    h = y1 - y0
    a = np.asarray(img).astype(float)
    blurred = np.asarray(img.filter(ImageFilter.GaussianBlur(radius))).astype(float)
    detail = a - np.asarray(img.filter(ImageFilter.GaussianBlur(2))).astype(float)
    out = a.copy()
    w = x1 - x0
    if side == "above":
        grain = detail[y0 - h - 6:y1 - h - 6, x0:x1]
    else:
        # Fine film grain, for a surface too patterned to borrow from.
        grain = np.random.default_rng(7).normal(0, 4, (h, w, 1)).repeat(3, axis=2)
    out[y0:y1, x0:x1] = blurred[y0:y1, x0:x1] + grain
    layer = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle(box, radius=10, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(feather))
    return Image.composite(layer, img, mask)
