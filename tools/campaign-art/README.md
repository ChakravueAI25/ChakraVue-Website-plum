# Campaign art pipeline

How the homepage's campaign art in `public/images/campaign/` was made, so it
can be rebuilt or extended. None of this is part of the site's build: the
outputs are committed, and these scripts are only run by hand when the art
changes.

## Tools

- Python 3 with Pillow, NumPy and SciPy.
- Node with `playwright-core` and the installed Chrome (to read video frames),
  as in the main README's testing notes. Not a project dependency.
- ffmpeg (for the hero film). `pip install --target <somewhere> imageio-ffmpeg`
  gives a standalone binary without touching the system.

Run everything from a scratch working folder (not inside the repo), with the
inputs copied in. The scripts read and write relative to the current folder.

## Inputs

| Input | Where it comes from |
| --- | --- |
| The superhero clip (`grow.mp4`, 10 s, 1280×720) | Supplied by the owner (`gemini_generated_video_*.mp4`) |
| The doctor (`1.webp`, transparent) | Supplied by the owner |
| `reel-*.jpg`, `or-surgeon.jpg`, `slitlamp-doctor.jpg`, `summit-demo.jpg`, `training-room.jpg` | `blueprint-site/site/assets/` on the `blueprint-site` branch (`git show refs/heads/blueprint-site:blueprint-site/site/assets/<file>`) |
| `analogue-to-ai.mp4` | Already in `public/images/campaign/` (the blueprint redesign's hero film) |

## The growth rail's toddler

1. Frames from the clip, every 0.12 s:
   `node frames.mjs http://<dev server>/<path to grow.mp4> frames 0 9.96 0.12`
   (serve the clip from the dev server so the canvas isn't tainted).
2. Standing and moving (landing, waving, pointing, thumbs-up), 35 cells of
   280 px on one crop window, so he doesn't jitter between cells:
   `python sequence.py 1.68 9.96 2 cut/toddler-seq.webp`
   → `public/images/campaign/grow/toddler-seq.webp`. A sparkle in one frame is
   patched with its neighbour (`PATCH`).
3. The flight, at the same scale, its window running from the standing
   crop's left edge to the clip's right edge, so the last cell is exactly the
   first standing one: `python fly.py` → `cut/toddler-fly.webp`
   → `public/images/campaign/grow/toddler-fly.webp`.
4. The cut-out helper (`artlib.mask`) treats light, greyish pixels joined to
   the frame's edge as background. `cutout.py` runs it on a single image.

The rail's CSS depends on these numbers: 35 cells (`FRAMES` in
`GrowRail.tsx`, `/ 34` and `3500%` in `growRail.css`), 13 flight cells, and the
cell proportions 245/280 (standing) and 380/280 (flight). Change them together.

The doctor (`grow/doctor.webp`, `grow/doctor-tall.webp`), the faces for the
phone badge (`grow/face-*.webp`) and the closing scene's toddler
(`grow/toddler-still.webp`, the last standing cell) were trimmed and resized
from these with Pillow.

## Retouching (required before anything ships)

The site must never show a part number, serial, performance readout, chip
or GPU name, a maker's mark, or the State Emblem (see `CLAUDE.md`).

- `retouch.py`: the reels. Paints out the State Emblem on the government files
  (`reel-insurance*.jpg`) and the car maker's badge (`reel-analogue*.jpg`),
  writing `clean-*.jpg`. Exported at 720 px wide to
  `public/images/campaign/reels/`.
- `theatres.py`: the real photographs. Crops off the microscope's REF/SN
  plate, paints out its maker's marks (`or-surgeon.jpg`) and an on-screen FPS
  readout (`slitlamp-doctor.jpg`). Exported at up to 760 px to
  `public/images/campaign/theatres/`.

The summit setup photo was left out: its screens show a GPU name. Check every
new photo at full size, screens especially, before it goes in.

## The hero film

The hero plays the film's first 5.5 s (the boy walks, kneels and strikes the
match) and holds on that frame; the burn is the discovery further down.

```
ffmpeg -i analogue-to-ai.mp4 -t 5.5 -an -c:v copy -movflags +faststart analogue-to-ai-dream.mp4
ffmpeg -i analogue-to-ai.mp4 -t 5.5 -an -vf "scale=1280:-2:flags=lanczos" -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -profile:v high -movflags +faststart analogue-to-ai-dream-sm.mp4
```

The second is the phone version (`Hero.tsx` picks it below 760 px).
