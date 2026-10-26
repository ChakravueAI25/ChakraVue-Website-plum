"""Real photos for "In real theatres": the microscope maker's marks, its
REF/SN plate and the on-screen FPS readout painted out (no part numbers,
serials or performance readouts on the site)."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from artlib import smooth  # noqa: E402

jobs = {
    # Cropped 64px off the top first (the REF/SN plate), so these sit 64px higher.
    "or-surgeon.jpg": [(40, 194, 172, 270), (284, 130, 388, 202), (372, 540, 430, 570)],
    "slitlamp-doctor.jpg": [(518, 342, 604, 374)],
}
for name, boxes in jobs.items():
    img = Image.open(name).convert("RGB")
    if name == "or-surgeon.jpg":
        img = img.crop((0, 64, img.width, img.height))
    for box in boxes:
        h = box[3] - box[1]
        side = "above" if box[1] - 2 * h - 6 > 0 and name != "or-surgeon.jpg" else "grain"
        soft = 14 if name == "or-surgeon.jpg" else 8
        img = smooth(img, box, feather=soft, radius=20, side=side)
        img = smooth(img, box, feather=soft, radius=26, side=side)
    img.save("clean-" + name, quality=88)
    print(name, "done")

im = Image.open("clean-or-surgeon.jpg"); im.resize((im.width // 3, im.height // 3)).save("check-surgeon.jpg")
im = Image.open("clean-slitlamp-doctor.jpg"); im.crop((440, 120, 920, 380)).save("check-slit.jpg")
