# ChakraVue AI website (Plum)

The ChakraVue AI company website: React 19 + TypeScript + Vite 7, GSAP 3.15
(ScrollTrigger, SplitText, ScrambleText), Lenis, three.js r186. It began as a
"motion lab" copy of the original site (`../Chakravueai-website`, a separate
repo) and is now its own repo: `github.com/ChakravueAI25/ChakraVue-Website-plum`.

`README.md` is the detailed map: what each page and section does, where each
system lives, the declarative motion attributes (`data-split`, `data-reveal`,
`data-scramble`, `data-magnetic`, `data-cursor`, ...), typography and the
palette engine. Read it before changing a section, and keep it up to date
when you change one.

## Run

- `npm install`, then `npm run dev`: http://127.0.0.1:5175 (5173 is the
  original site, 5174 the About Us colour lab).
- `npm run build` must pass; `npx tsc --noEmit -p .` for types.

## Standing rules from the owner (always apply)

- **A professional company site, not a portfolio.** Build on the existing
  design (sunset hero, amber-on-black identity now graded to Plum). Use a
  conventional company structure, and don't pin sections or hijack the
  scroll for storytelling. Motion supports the content and never becomes
  the content. The owner shares this work with their head, so finish
  should be senior-level.
- **Audiowide is the only typeface.** Never add another.
- **The name is always written "ChakraVue AI"**, even inside labels set in
  capitals: wrap it with `BrandText` / `setBrandText`
  (`src/shared/components/BrandText.tsx`), which applies `.brand-name`
  (`text-transform: none`). Product names read "ChakraVue Doctor App", and
  so on.
- **The logo is used exactly as supplied and is never rotated.** That
  applies to the header, footer, hero, intro and page transitions.
  Animate it with fades, scale or glyph lighting only.
- **No confidential details.** Never publish part numbers, specs, chipsets,
  ratings or security internals. Use generic part names: "Bluetooth", not a
  module number; "Battery", "Port", "Compute unit". This covers copy,
  exploded-view labels and ids in code (the JS bundle is public). Strip
  these details when condensing the owner's documents, and grep the built
  bundle before calling a job done.
- **Commit or push only when asked.** Never modify `../Chakravueai-website`
  from here unless the owner asks to port something.
- **Verify visually before reporting.** Screenshot desktop (1440×860),
  tablet (1024×768) and phone (390×844) after layout changes, and say what
  was checked.

## Current state of the site (as of 2026-10-02)

- **Palette:** Plum only, with no switcher. The stylesheets are still
  authored in the original Ember colours; `src/theme/theme.ts` rewrites
  every stylesheet colour at runtime (OKLCH transform), WebGL scenes apply
  the same grade in their shaders (`theme/grade.ts`), and decorative art
  takes the SVG filter `#cv-theme-filter`. `SITE_THEME = "plum"` in
  `theme.ts` is the single switch. Write new CSS in the Ember amber
  colours (`#ff8b12`, `#ffb46a`, `#fbd896`, ...) and it comes out Plum.
  Canvases read colours from CSS custom properties, so they're recoloured
  too.
- **Intro:** a WebGL torn-blueprint film (`motion/webgl/introFilm.ts`), with
  a DOM fallback (`motion/introPaper.ts`). The name's glow was deliberately
  softened (`hot` 1.02, bloom 0.24 once lit). The owner asked twice for
  less brightness, so don't brighten it.
  `sessionStorage.cv-intro-seen = "1"` skips it.
- **Home**, in order:
  - Hero (`pages/home/components/Hero.tsx`):
    - Sunset gradient plus the WebGL particle landscape
      (`motion/webgl/dataHorizon.ts`), which breathes and ripples under
      the pointer. Nothing in the hero moves with scroll; the owner asked
      for this.
    - The logo sits whole and centred behind the copy (`.hero__mark` in
      `home.css`): up to 680px wide, set 36px below centre, with cream
      glyphs deepening to amber toward the horizon.
    - The ring is softer behind the words (a vertical mask band, aligned
      to the copy), the copy carries a soft text-shadow, and a glint
      travels round the glyphs.
    - The owner iterated on this many times. They want it big, clearly
      visible, even and centred behind the text, with the text readable.
  - Featured-in (NDTV) marquee: home only.
  - Statement band: "Built From Experience. / Guided by Science. / Elevated
    by Intelligence.", closed by the coda "Shaping What Healthcare Can See,
    Understand, and Do." (the `coda` prop of `InsightStatement`).
  - Product showcase: "Four products, one connected line of sight."
  - The core idea (eclipse glow), then How it works, Team and Latest posts.
  - The orbit "Products engineered for clinical systems" section and the
    old vision/lens panel were removed on request.
- **Product Suite:**
  - Hero (rebuilt 2026-10-19, `SuiteHero.tsx`): the same structure as the
    old artwork (ChakraVue at the centre, four products around it, linked
    in) but built live: "We Add Intelligence to Your Devices." inside the
    ring, each product card showing its own screen, data travelling along
    the links. On tablets and phones (≤900px) the diagram stands upright
    (statement, two products, ring, two products, all linked); the owner
    asked for the phone hero to be as good as desktop (2026-10-19). Then a compact (unpinned) lead statement "Intelligence,
    Engineered for the Operating Room.", then the 3D product theater
    (`motion/webgl/theater/`, generic part labels).
  - Product stills must never show ratings: the Integrated Devices photo
    used to show the battery's rating and was re-rendered from the 3D
    model (2026-10-19).
  - Surgical Assistant, Slit Lamp Module and AI Powered EMR (rebuilt
    2026-10-02/05 from the owner's references) are the same open rugged
    field case (`models/briefcase.ts`) with an unbranded
    developer-kit-style compute unit (`models/computeUnit.ts`). They differ
    only in the interface on the lid display (`models/interfaces.ts`): the
    real surgical UI, the real Slit-Lamp Analytics UI and the real EMR, as
    cleaned captures. The owner asked for the slit lamp and the EMR to match
    the surgical case.
  - The EMR is a spider (`models/interfaceSpider.ts`): the patient
    dashboard in the middle, and the patient overview, patient details,
    optometry and ophthalmic examination screens on legs at its four
    diagonals. The owner asked for "a spider, not on one another", so every
    screen can be seen without overlap. It gathers above the lid, and has a
    portrait form on tall stages. Screens are captioned like window titles.
  - EMR captures carry patient data, so they're anonymised before they
    ship: every patient is "Chakravue 01", "02", … with test registration
    IDs, phones, email and address (the owner's instruction). Any new EMR
    capture gets the same treatment; never ship a real name, ID, phone,
    email or address.
  - The interface is a layer stack (`models/interfaceStack.ts`). Exploded,
    its panels, live view and AI overlay lift out of the display and gather
    in front of the case, enlarged and facing the viewer, so the contents
    can be seen; the compute unit stands off the front corner, below them.
    The owner asked for both: the interface "viewable when dismantled", and
    the compute unit never covering the screen.
  - Then a focus beat (longer chapter): the camera moves in until the
    interface fills the stage, the copy steps aside, and "AI" readout cards
    quote values from the capture. AI touches run on the screen throughout
    (`models/aiEffects.ts`: analysis beam, lock-on reticle, readings
    streaming into the panels). The owner asked for "some AI touch" and for
    the interface content to be visible. Readouts quote only what the
    capture shows; never invent clinical figures.
  - Screens keep true colours through `kit.interfaceScreen()`: it inverts
    the ACES tone curve and writes alpha 0, which the palette grade pass
    skips. Anything drawn over a screen must keep that alpha (see the glass
    and overlay blending).
  - Never label the compute unit with a chipset or board name. Any new
    capture must have chip/GPU names, performance readouts, model names
    (for example the segmentation model) and internal detector strings
    painted out.
  - Then the software platforms console (`product-suite/platforms.ts`):
    05 Dental Implant Planning; 06 ChakraVue Doctor Patient App, a bundle
    showing the Doctor App and Patient App individually (`apps` field);
    07 ChakraVue Wellness.
  - The closing "Institute creates data…" band and the platforms EMR
    Mobile, Face & Eye, Voice, Data Sender and Secure Edge were removed on
    request.
- **About Us:** hero "The Technology Is Only as Strong as the Minds Behind
  It." over a canvas network of minds (`about-us/components/minds.ts`), then
  the leaders and the team. Each card links to the person's LinkedIn profile
  (`linkedin` in `about-us/data.ts`). Hrushikesh Patki has none yet.
- **Services:** FEA and tobacco cessation only. The hero reads "Research,
  Intelligence, and Technology Working Toward Better Health."
- **Footer** (`shared/components/Footer.tsx`, `footer.css`, plus the emblem
  in `brand/logo.css`):
  - The same on every page and kept compact (about 517px tall at 1440px).
  - Explore on the left (two short columns), Reach us in the middle (the
    email on one line, and "LinkedIn" as the link text), and Office on
    the right (the address from the Contact page data).
  - A large faint logo centred behind them, then the "ChakraVue AI"
    wordmark, which is solid so the logo never shows through it.
  - No call-to-action block.
- **Phone menu** (`Header.tsx`, `.menu` in `global.css`): up to 960px the
  six links don't fit, so the bar is the brand plus a menu button that opens
  a full-screen menu. Before 2026-10-19 phones only showed two links.
- **Cursor:** the standard system cursor, with grab/grabbing on 3D models.
  `PointerFX.tsx` only adds a small tag ("View", "Drag") beside the pointer
  over `[data-cursor]`, plus magnetic buttons and card spotlights. The owner
  rejected both the circle cursor and a custom arrow.

## Gotchas learned here

- GSAP transforms override the CSS individual `translate` / `scale`
  properties on the same element. To centre something with `translate` and
  also animate it, put the centring on a wrapper and the animation on an
  inner element. Don't use CSS `transform` for hover or positioning on
  animated elements.
- In an SVG with a centred viewBox (`-500 -500 1000 1000`),
  `transform-box: view-box` needs `transform-origin: 0 0` to rotate about the
  centre.
- `useMotion` is skipped under reduced motion. Anything that must still
  draw (a canvas's still frame) uses a plain `useEffect`.
- Bloom (UnrealBloomPass, threshold 1) is effectively on/off at the
  threshold. Tune glow with bloom strength, not with text brightness.
- A palette-rewrite trap: Chrome reads `background: <gradient>, #colour`
  back as "…, initial", which can't be written back, so `theme.ts` swaps it
  for `none`. Inline styles set from JS aren't rewritten, so animate CSS
  variables instead (for example `--glow`), and put `var(--cv-grade,)` in
  front of animated filters on art.
- Mask percentages on `.hero__mark` are relative to its own box. If you
  move or resize the hero logo, realign the soft band with the copy (the
  headline's top and the buttons' bottom).

## Testing

Screenshots are taken with `playwright-core` driving the installed Chrome
(it isn't a project dependency; install it in a scratch folder):

```js
const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"], // WebGL
});
await page.addInitScript(() => sessionStorage.setItem("cv-intro-seen", "1")); // skip the intro
```

Scroll with `page.mouse.wheel` (Lenis smooths it) and wait about 1.5s for
ScrollTrigger animations before capturing.

## Known open items

- On very short laptop screens (around 640px tall) the hero headline
  crowds the nav, and the top of the logo ring reaches it.
- Product part names in `product-suite/data.ts` (`anatomy`) still need
  confirming with the product team (generic names only).
