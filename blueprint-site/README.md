# ChakraVue AI website: blueprint design (round 3)

The new "Analogue to AI" blueprint design of the ChakraVue AI website, built from the round 3 design
mockups (canvas: https://claude.ai/artifact/LVfiSP8TSmUtRy4fc94eST). It lives in its own folder on the
`blueprint-site` branch and has its own build: the Plum React app at the repo root is untouched, so the
two can be compared side by side before anything is merged.

Design differences from Plum to be aware of: serif headlines with Audiowide labels (Plum is
Audiowide only), the navy blueprint / circuit palette (Plum is graded Plum), and the official
chakravue.ai wordmark image for "ChakraVue AI" wherever it appears as a logo.

Every page carries `noindex, nofollow` and a "Preview — not the live site" badge. The forms are not
connected yet.

## Run it

```
cd blueprint-site
npm install
npm run build    # writes dist/
npm run serve    # http://127.0.0.1:5191
```

## How it is built

- `src/pages/*.dc.html` are the design pages exported from the canvas (Design Component format:
  a template with `{{holes}}`, `<sc-for>`, `<sc-if>` and a small logic class).
- `build.mjs` runs each page's logic, renders the template to plain HTML with linkedom, maps
  canvas asset links to `/assets/…` (`src/assets-map.txt`) and page links to clean URLs.
- `site/site.js` adds what the canvas runtime did: the phone menu, the audience tabs, the hero video
  pause, the logo reveal, the visit booking choices and the burn demo. `site/site.css` holds the
  site-wide fixes (phone menu, overflow clipping).

## Pages

| URL | Source |
|---|---|
| `/` | R3Home |
| `/products/` | R3Products |
| `/about/` | R3About |
| `/hospitals/insurance/` | R3Insurance |
| `/visit/` | R3Signup |
| `/partners/` | R3Partners |
| `/design-system/` | R3Components |

## Still to do before it goes live

- Connect the visit, trial and partnership forms.
- Replace the placeholders: Salem conference name and date, insurer list, OEM reel, Dentist and Patient screenshots.
- Confirm the AIIMS name and the statuses marked `[Status]`.
- Remove the `noindex` tag and the preview badge.
