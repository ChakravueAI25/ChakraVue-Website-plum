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
- `npm run build` must pass; `npx tsc --noEmit -p .` for types (covers
  `server/` too). `npm run test:assistant` for the Product Assistant.
- Production: `npm run build && npm run serve` (Node 22.9+, `server/index.ts`
  runs as TypeScript via type stripping, so no enums or constructor
  parameter properties there, and imports keep their `.ts` extension).

## Standing rules from the owner (always apply)

- **A professional company site, not a portfolio.** Build on the existing
  design (sunset hero, amber-on-black identity now graded to Plum). Use a
  conventional company structure, and don't pin sections or hijack the
  scroll for storytelling. Motion supports the content and never becomes
  the content. The owner shares this work with their head, so finish
  should be senior-level.
- **Audiowide is the only typeface.** Never add another. (Its metric-matched
  Arial fallbacks in `global.css` only show until it loads; they stop the
  page jumping when it swaps in.)
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
- **Intro:** (owner, 2026-10-27) only the logo: the particle-burst film
  (`motion/introLogo.ts`, `public/images/intro/intro-logo.mp4`) plays on
  black as the site loads, then the camera flies through the ring and its
  centre opens onto the hero. No paper/blueprint tear and no kid: both
  were tried (the torn-blueprint film, the kid's hello, a kid video with
  sound) and removed at the owner's request, so don't bring them back.
  `sessionStorage.cv-intro-seen = "1"` skips it.
- **Home**, in order:
  - Hero (`pages/home/components/Hero.tsx`), rebuilt 2026-10-26 at the
    owner's request: the dream. The whole campaign film (the kid walks a
    blueprint, strikes a match, and it burns open onto the circuit) loops
    (owner, 2026-10-27), dissolving back into the walk. Two encodes
    (`analogue-to-ai-loop.mp4`, `-sm` for phones). It replaced the sunset,
    the particle landscape (`dataHorizon.ts`, now unused) and the centred
    logo. "Every doctor started small" above the unchanged headline (the
    owner hasn't yet decided whether the story line replaces it), copy low
    on the left, a play/pause chip, product shortcuts along
    the bottom. On phones the film fills the top half so the boy stays in
    view. Nothing in the hero moves with scroll.
  - Featured-in (NDTV) marquee: home only.
  - The page tells the kid's story in six chapters (`shared/data/story.ts`,
    added 2026-10-26 at the owner's request): dream, beginning, discovery,
    transformation, journey, aspiration. The owner's direction (2026-10-26):
    the kid is a future doctor and ChakraVue's products are his powers;
    the film's curly-haired boy is the canonical character (the 3D
    superhero toddler and the illustrated doctor are stand-ins until
    matching art exists). Power lines must paraphrase each product's own
    description; never claim the site trains or qualifies doctors. `ChapterMark`s sit between
    sections, so technical sections carry no story code; keep it that way
    (the owner asked for the technical content to stay exactly as it is).
  - Statement band: "Built from Experience. / Guided by Science. / Elevated
    by Intelligence.", closed by the coda "Shaping What Healthcare Can See,
    Understand, and Do." (the `coda` prop of `InsightStatement`).
  - The beginning: problem reels (`ProblemReels.tsx`), three campaign
    scenes linking to products; the car and clerk turn into their "after".
  - The discovery (`DiscoveryReveal.tsx`): the burnt blueprint opens out
    onto the boy at the circuit, once, with Replay. Not pinned.
  - Product showcase: "Four products, one connected line of sight."
  - Who we serve (`AudienceMap`, overview): "Technology Built for Every
    Role in Surgery", the owner's product-to-audience mapping.
  - The core idea (eclipse glow), then How it works.
  - The journey: real theatres (`RealTheatres.tsx`), four real photos.
  - Team and Latest posts.
  - The aspiration (`CampaignClose.tsx`): toddler and doctor at a height
    chart, the doctor rising to full height; Explore products / Contact us.
  - The art pipeline (frames, sprites, retouching, film cuts) is in
    `tools/campaign-art/`; rebuild art from there, not by hand.
  - Campaign and reel art is retouched before it ships: no State Emblem,
    no car or microscope maker's marks, no REF/SN plates, no FPS or GPU
    readouts on screens (the summit setup photo was left out for a GPU
    name). Do the same for any new photo or illustration.
  - Campaign art lives in `public/images/campaign/`, copied selectively
    from `blueprint-site/` (the separate static redesign on the
    `blueprint-site` branch). Campaign scenes appear on Home and About
    only. Don't bring over the blueprint's serif fonts, navy/cyan palette,
    wordmark PNG or burn-on-click buttons.
- **Growth rail** (`shared/components/GrowRail.tsx`, every page, added
  2026-10-26 at the owner's request, moved to the right the same day): a
  fixed height chart in the right margin where the superhero toddler (frames cut from the owner's clip)
  flies in, then grows into the doctor as the page scrolls. On Home it
  names the story's chapter, paces the growing up by the chapter marks,
  shows from the hero, and hides for the aspiration scene. Elsewhere it
  appears after the hero. Below 1360px and on Product Suite and Try Demo it's a badge
  that only shows for about three seconds per chapter (it covered text
  when it stayed), and never over the footer. Keep it clear of content: check
  the right margin whenever a section's layout changes. The kid is also
  the Product Assistant's button (below), so the badge now stays on screen
  wherever the chart isn't showing.
  - The orbit "Products engineered for clinical systems" section and the
    old vision/lens panel were removed on request.
- **Product Suite:**
  - Rebuilt 2026-10-28 at the owner's request after their references (grey
    studio product pages): the hero and the products are light studio
    panels set into the dark page; everything else on the page stays dark.
    Write the panels' colours in Ember like the rest (greys stay neutral,
    `#8a4a10` grades to deep plum). Audiowide still, not the references'
    fonts.
  - Hero (`SuiteHero.tsx`): "Product Suite" large, the statement "We Add
    Intelligence to Your Devices." beside it, and all four products on one
    stage, one leading and the rest around it, rotating every 4.2 s (the
    owner asked for a looped hero showing every product at once). The
    pictures are studio cut-outs rendered from the 3D models
    (`public/images/product-suite/studio/`); the owner is sending their
    own images for the hero, so swap them in there under the same names.
  - Under the hero, a small banner: "Already running successfully at Spark
    Eye and Dental Care, Musheerabad" (`InUseBanner.tsx`, owner's request).
  - The products are a slideshow (`ProductSlides.tsx`, owner's request):
    one product per slide, name and copy on the left, the 3D product on a
    plate with its number on the right; arrows, squares, keys, autoplay
    that pauses on interaction. One inline theater swaps between the four.
    Pointing opens the product, drag turns it, "Look inside" on touch; no
    part labels (owner). The scroll-driven stage (chapters, labels, focus
    beat, AI readouts) isn't on the page; the notes below about it describe
    the engine's stage mode and the models, which the slideshow still uses.
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
  - The "By role" section was removed (2026-10-26, owner's request); the
    audience picker now lives only on Try Demo.
  - The audience mapping lives only in `shared/data/audiences.ts` (owner,
    2026-10-26): Doctors & Surgeons → Digital Surgical Assistant, Slit Lamp;
    PG Students & Surgical Trainees → Gaming; Hospitals & Training
    Institutions → EMR; OEMs & Medical Device Manufacturers → microscope
    software integrations. Don't misclassify or add products. Gaming and
    the integrations have no section yet, so they link to Contact with the
    interest chosen (`?interest=`).
  - Then the software platforms console (`product-suite/platforms.ts`):
    05 Dental Implant Planning; 06 ChakraVue Doctor Patient App, a bundle
    showing the Doctor App and Patient App individually (`apps` field);
    07 ChakraVue Wellness.
  - The closing "Institute creates data…" band and the platforms EMR
    Mobile, Face & Eye, Voice, Data Sender and Secure Edge were removed on
    request.
- **Try Demo** (`/try-demo`, added 2026-10-26 at the owner's request; README
  "Try Demo"): hero, "Who Are You?" (the four audiences), "Choose Your
  Demo" (five cards like a pricing page, one per product, each declaring
  10,000 demo points), footer. In the header it's a button at the right
  of the bar. The points are `DEMO_POINTS` in `audiences.ts`, a declared
  figure only: never present them as money, credits, a balance, or with
  rules or expiry, and never fake deductions. No product has a demo
  environment yet, so "Try Demo" opens a request dialog with the Contact
  page's fields (owner's request) that hands the request to Gmail like the
  Contact form; when real demo links or a form backend exist, wire them in
  `DemoRequest.tsx` per product.
- **About Us:** hero "The Technology Is Only as Strong as the Minds Behind
  It." over a canvas network of minds (`about-us/components/minds.ts`), then
  "Why we exist" with the campaign's height-chart pair (`AboutStory.tsx`),
  then the leaders and the team. Each card links to the person's LinkedIn profile
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
- **Product Assistant** (from the `chatbot` branch, 2026-10-23; README
  "Product Assistant"): answers from one product PDF the admin uploads at
  `/admin` (Basic auth, scrypt hash in `.env`). The owner ruled out any LLM,
  API key, embeddings or outside service: answers are sentences quoted from
  the PDF with page numbers, found by local TF-IDF and keyword search
  (`server/assistant/`). Never add generated or paraphrased text, and never
  let it invent prices or specs. Its fixed texts (header, welcome,
  not-found message) are the owner's wording. Classes are `.assist-*`,
  because Services owns `.chat`. On merger (2026-10-26, owner's request)
  the growth rail's kid is its button: the kid in the chart, or his face
  badge wherever the chart isn't showing; there is no separate launcher.
  The rail's state classes are set imperatively, so never render its
  `className` from React state (it wipes `is-on` and the rest).
  `shared/data/audiences.ts` imports keep `.ts` extensions because
  `server/sitePdf.ts` reads it under Node.
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
