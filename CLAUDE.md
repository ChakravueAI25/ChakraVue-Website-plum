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
- **Terminology (owner, 2026-10-29), in all visible copy:** the EMR is the
  "ChakraVue System" (never "EMR" or "AI Powered EMR"); "clinician(s)", not
  "doctor(s)"; the trainee audience is "PGs", not "PG Students"; "Practice
  Intelligence", not "Hospital Intelligence". Where "EMR" means any clinic's
  records software, write "patient records". Internal ids (`ai-powered-emr`,
  `doctors`) stay. The product names "ChakraVue Doctor App" / "Doctor
  Patient App" are kept until the owner confirms renaming them.
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

## Current state of the site (as of 2026-10-29)

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
    owner's request: the dream. Since 2026-10-29 (owner) it holds only the
    nav, the film, the headline and two buttons (Explore products, Book a
    demo): no story line, summary, film chip or product shortcuts. Don't
    add them back. The whole campaign film (the kid walks a
    blueprint, strikes a match, and it burns open onto the circuit) loops
    (owner, 2026-10-27), dissolving back into the walk. Two encodes
    (`analogue-to-ai-loop.mp4`, `-sm` for phones). It replaced the sunset,
    the particle landscape (`dataHorizon.ts`, now unused) and the centred
    logo. Copy low on the left. On phones the film fills the top half so the boy stays in
    view. Nothing in the hero moves with scroll.
  - Order (2026-10-30, a storytelling flow: introduction, who we are,
    what we do, products, in practice, action): hero, Our journey
    (`JourneyStrip.tsx`, real summit and theatre photos; in place of the
    Featured-in marquee since 2026-10-30), statement band, the glowing banner and early-bird
    offer (`IntroBridge.tsx`: a light travels round the banner's outline,
    CSS-only SVG dash), Who we are (`WhoWeAre.tsx`, was Why ChakraVue AI:
    lead plus six principles), the beginning (From analog to intelligent),
    the discovery, the core idea, Know how it works, Who are you here as?
    (`RoleShowcase`: three roles and their products, plays by itself, plus
    the software platform chips), Integrated devices, the ChakraVue System,
    the journey: Surgical tools (ID / Platform / Research), real theatres,
    then the aspiration with Book a demo / Collaborate. Team and Latest
    posts were removed from Home (owner, 2026-10-30); don't add them back.
  - Who we are, Integrated devices and Surgical tools make no
    security, storage, compatibility or validation claims beyond the
    product descriptions; the owner's notes say to add specifics only once
    verified. Keep it that way until the product team confirms them.
  - Featured-in (NDTV / India TV) marquee: removed from Home (owner,
    2026-10-30), replaced by Our journey; `FeaturedInStrip.tsx` is kept,
    unused.
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
  - The beginning: From analog to intelligent (`AnalogToIntelligent.tsx`,
    owner, 2026-10-29), which replaced the "Still on the old blueprint"
    reels: three stages on one line that fills once as it arrives.
  - The discovery (`DiscoveryReveal.tsx`): "What we do / We connect
    clinicians, data and devices." over the connected-care photo, with the
    mascot and Clinicians / Data / Devices cards (2026-10-29/30). Since
    2026-10-29 (owner) it carries the tagline "We connect clinicians, data
    and devices." with three linked cards (Clinicians, Data, Devices).
  - Who are you here as? (`RoleShowcase.tsx`): Clinicians, PGs,
    Researchers; the roles and their products are `roles` in
    `shared/data/audiences.ts`. Sidekick is the blueprint redesign's pilot
    research assistant until the owner supplies its real copy and art.
    Redesigned 2026-10-30: a compact intro, the roles as selectable cards
    in one row, then an even product grid sized to the count (1, 2 or 3).
    Phones don't autoplay (their stacked products change the page height).
  - The older "Who are you?" section (`AudienceMap`) was removed from Home
    and deleted (owner, 2026-10-29): "Who are you here as?" replaces it.
    Don't bring both back.
  - The core idea (eclipse glow), then Know how it works.
  - The journey: real theatres (`RealTheatres.tsx`), four real photos.
  - The aspiration (`CampaignClose.tsx`): toddler and doctor at a height
    chart, the doctor rising to full height; Book a demo / Collaborate cards.
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
  - Hero (`SuiteHero.tsx`): a slideshow of the four product renders with
    their copy, arrows and numbered indicators. Each product stands on a
    platform ellipse fitted to its footprint in the render and hovers a
    few pixels over it in step with the platform's light (2026-10-30);
    slide changes take about half a second. Then a compact (unpinned) lead
    statement "Intelligence, Engineered for the Operating Room.", then the
    products.
  - The product rows' theaters are built one at a time in idle time and
    compile their shaders asynchronously before drawing (README "Product
    Suite"); building them on scroll froze the page. Keep new theater work
    off the scroll path.
  - The products (rebuilt 2026-10-26 at the owner's request, after a
    reference spec sheet): one row per product, stacked, copy on the left
    and the product in 3D on the right, in the site's own colours. No
    scrolling drives them: pointing at a row opens the product up, and
    "Look inside" does it on touch. That's the only motion: no idle spin
    and no drag to turn (owner, 2026-10-30), so don't add rotation
    back. The owner asked for the
    parts not to be named, so no labels. Each row is an inline theater
    (`motion/webgl/theater/`) with a backdrop matched to the panel. The
    scroll-driven stage (chapters, labels, focus beat, AI readouts) is no
    longer on the page; the notes below about it describe the engine's
    stage mode and the models, which the rows still use.
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
    2026-10-26): Clinicians & Surgeons → Digital Surgical Assistant, Slit Lamp;
    PGs & Surgical Trainees → Gaming; Hospitals & Training
    Institutions → ChakraVue System; OEMs & Medical Device Manufacturers → microscope
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

- **Text motion (owner, 2026-10-30):** one entrance site-wide, fade in and
  rise 16px over 0.55s, once, as text comes into view, staggered 70ms
  (`motion/reveal.ts`, which picks up section text automatically). Don't
  add other text effects (masks, blur, scramble, scrubbed or pinned text);
  mark a container `data-motion="own"` only if its text has state-driven
  motion (crossfades, slideshows).

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
