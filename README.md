# ChakraVue AI — Motion Lab

A copy of the full site (`../Chakravueai-website`) with a complete motion layer:
page transitions, smooth scroll, scroll choreography, text animation, a WebGL
hero and pointer interactions. The original site is untouched.

```bash
npm install
npm run dev      # http://127.0.0.1:5175  (main site stays on 5173)
```

## What's in it

**Across the site**
- **Iris page transitions.** The screen closes like an eye onto the link you
  clicked, shows the destination's name, then opens onto the new page from the
  centre. Back and forward buttons get the same treatment.
- **Intro film (first visit per session).** One continuous shot, rendered
  live in WebGL (`motion/webgl/introFilm.ts`). Lamp light on an 1887
  engineering sheet (`public/images/intro/`): the camera starts close on the
  gears and drifts back while "Transformation / from Analog to AI" tracks in,
  with dust turning in the light. Warm light leaks through a crack that runs
  down the sheet, throwing off paper fibres. The right side then curls back
  as real paper (you see its reverse, lit from behind) and is pulled away
  past the camera. Behind it, in depth, only "Vue AI" is uncovered, and it
  powers on letter by letter. The rest of the sheet peels away, the full
  name closes up and centres, the logo lights in a clockwise sweep, and the
  camera dives into the black of the disc, which is where the page opens
  from. Bloom, grain, vignette and a touch of lens fringing give the film
  finish. Click, tap or Esc hurries it. Without WebGL the same story plays
  with DOM layers (`motion/introPaper.ts`); `motion/intro.ts` picks one.
- **Logo.** `src/brand/` holds the vectorised mark, with each glyph a
  separate path (`Logo.tsx`, `logoData.ts`). It appears in the header, the
  footer (it rises into place and its glyphs light round the ring), page
  transitions and the favicon, always exactly as supplied and never rotated.
- **The name.** Always written "ChakraVue AI", even in labels set in
  capitals: wrap it with `BrandText` (`shared/components/BrandText.tsx`).
- **Smooth scrolling** (Lenis), running on the same clock as every animation.
- **Cursor.** The standard system cursor (a grab hand over the 3D models);
  a small tag beside it reads "View" or "Drag" where that's the action. Magnetic buttons, and a spotlight
  on cards that follows the pointer. Mouse only.
- **Text.** Headlines rise line by line out of masks, labels decode from random
  glyphs, and paragraphs drift in. Blocks enter in staggered groups.
- **Header.** Hides as you read down, returns when you scroll up (or reach for
  the top). Nav labels roll letter by letter on hover. Up to 960px wide the
  bar holds the brand and a menu button, which opens every page in a
  full-screen menu (numbered links, then phone and email). Escape, a link or
  the button closes it; the page behind stays still while it's open.
- **Logo marquee.** Speeds up and leans with scroll velocity, follows scroll
  direction, and slows under the pointer.
- **Footer (new).** The same on every page, kept short: Explore on the left
  (two short columns), Reach us in the middle and Office on the right, over
  the large faint mark centred behind them, then the wordmark, which rises
  letter by letter.
- **The kid growing up** (`shared/components/GrowRail.tsx`, `growRail.css`).
  A fixed height chart in the right margin. The page's scroll plays the
  superhero toddler from the campaign clip (landing, waving, pointing,
  thumbs-up: 35 cut-out frames in `grow/toddler-seq.webp`); he becomes the
  doctor in a warm flare and grows to full height. A reading above his head
  goes from 0.95 m to 1.74 m. The first time the chart appears he flies in
  from the screen's edge (the clip's flight, `grow/toddler-fly.webp`).
  Hovering him shows "Every doctor started small." and the toddler waves.
  On the homepage it tells the story: it shows from the hero, names the
  chapter above the chart, paces the growing up by the chapters (he grows
  up as the journey begins), and steps aside when the closing scene takes
  over. Elsewhere it appears once the hero has scrolled away. Below 1360px
  wide, and always on Product Suite (the theater's copy uses that margin),
  it's a 46px badge (ring filling with the page, face changing) that shows
  for about three seconds at each new chapter and then fades, so it never
  sits on what's being read. Decorative (`aria-hidden`), on every page. The
  frames were cut from the supplied clip; the clip itself isn't shipped.
- **Film grain.** A faint moving grain over the glows (desktop only).
- **One typeface.** Audiowide everywhere (see Typography below).

**Home.** A company homepage built on the original design: the original
sections and art, plus the parts a company site needs (clear calls to action,
product shortcuts, the team, the latest posts). Nothing on the homepage pins;
sections animate in as they arrive. It tells the kid's story in six
chapters (`shared/data/story.ts`): The dream, The beginning, The discovery,
The transformation, The journey, The aspiration. Each starts at a
`ChapterMark` placed between sections, so the technical sections carry no
story code; the growth rail reads the marks. In order:
- **Hero: the dream** (`Hero.tsx`, `home.css`). The kid, who wants to be a
  doctor, walks across an old engineering blueprint and strikes a match. The
  film (`campaign/analogue-to-ai-dream.mp4`, the campaign film's first 5.5 s;
  `-dream-sm.mp4`, a lighter encode, below 760px) plays once and holds on
  the lit match; what it sets alight is the discovery further down. It
  replaced the sunset, the particle landscape and the centred logo
  (2026-10-26, at the owner's request). Framed into the site: the nav's band
  and the copy's corner are shaded, the edges vignetted, the bottom melts
  into the page over a warm hairline. Over it, low on the left: "Every
  doctor started small", the headline, the one-line summary, "Explore
  products" and "Contact us"; on the right a chip with play/pause ("Play
  again" once it has played); the four product shortcuts along the bottom.
  The film starts once the curtain opens (never under the intro), pauses
  off screen, and waits on its poster under reduced motion. On phones the
  film fills the top half and fades into the copy, so the boy stays in
  view. Nothing in the hero moves with scroll. The full campaign film
  (`analogue-to-ai.mp4`) is no longer used.
- **Featured in** marquee (homepage only).
- **Statement.** "Built From Experience. Guided by Science. Elevated by
  Intelligence." lights word by word as it passes, closed by "Shaping What
  Healthcare Can See, Understand, and Do." under a short rule.
- **The beginning: problem reels** (`ProblemReels.tsx`, `reels.css`). "Still
  on the old blueprint / Every doctor knows these days." Three scenes
  from the campaign's reel wall, each linking to the product that answers
  it: an old car (Integrated Devices), a clerk buried in paperwork (AI
  Powered EMR), a wobbly tower (Dental Implant Planning). The car and the
  clerk turn into their "after" (jet engine; clear desk) as the card
  arrives, with a "Before" / "With ChakraVue AI" tag; hovering peeks back at
  the old day. Images in `public/images/campaign/reels/`, retouched: the
  State Emblem on the government files and the car maker's badge are
  painted out.
- **The discovery** (`DiscoveryReveal.tsx`, `discovery.css`), from the
  blueprint redesign's logo reveal. The burnt blueprint (`burn-hole.webp`)
  hangs over the scene; as the section arrives it opens out past the screen
  and the boy is there at the glowing circuit (`circuit-reveal.jpg`), then
  "The spark / Not to burn the past. / To see what was underneath it all
  along." and the way on into the products: "Four new powers, built into
  the tools doctors already use ↓". The only place the burn is shown (the
  hero stops at the match). Plays once, with Replay; open from the start
  without motion.
- **Product suite showcase.** "Four products, one connected line of
  sight." Four dark panels, each crossed by a slit of
  light (a nod to the slit lamp) showing a sliver of its product. Opening a
  panel widens it and splits the slit into two beams that sweep apart until
  the whole product is lit. Opens on hover, click, tap or keyboard; plays by
  itself with a progress line until the visitor picks one. Product shots are
  cut from the Product Suite hero render (`public/images/home/products/`).
- **Who we serve** (`shared/components/AudienceMap.tsx`, `variant="overview"`).
  "Technology Built for Every Role in Surgery": four audiences side by side,
  each with its products as linked cards (a thumbnail, the name, an arrow).
  2×2 on tablets, stacked on phones.
- **The core idea** (original).
- **How it works.** Capture → Connect → Analyse → Assist on one line; a signal
  of light travels through the stages as you scroll and lights each one.
- **The journey: real theatres** (`RealTheatres.tsx`, `theatres.css`). "Not
  a render / In real theatres, with real surgeons.": four real photographs
  (`public/images/campaign/theatres/`): the Surgical Assistant at the
  microscope, the Slit Lamp Module, the AI Impact Summit, a hands-on
  session. The microscope maker's marks, its REF/SN plate and an on-screen
  FPS readout are painted out or cropped.
- **Team.** The three leaders and the wider team, linking to About.
- **Blog.** The three latest posts, linking to the blog.
- **The aspiration** (`CampaignClose.tsx`, `campaign.css`). A height chart:
  the toddler at 0.95 m and, beside him, the doctor he grows into rising to
  1.74 m as the section arrives, the tape lighting with him. "The dream,
  within reach / A doctor with new powers." and the four powers, each
  drawn from its product's own description: "Every case captured. Every
  examination remembered. Every patient on one timeline. Every instrument
  connected. Join the revolution." Then Explore products / Contact us.

**The audience mapping** (`shared/data/audiences.ts`) is the single source
for both "Who we serve" sections; change it there only. It is the owner's
mapping (2026-10-26):

| Audience | Products | Link |
| --- | --- | --- |
| Doctors & Surgeons | Digital Surgical Assistant, Slit Lamp Module | Their theater chapters (`/product-suite#…`) |
| PG Students & Surgical Trainees | Gaming | `/contact-us?interest=VR/AR Gaming Environment` |
| Hospitals & Training Institutions | AI Powered EMR | Its theater chapter |
| OEMs & Medical Device Manufacturers | Microscope Software Integrations | `/contact-us?interest=Partnership / Collaboration` |

Products on the Product Suite page are referenced by id, so their names,
taglines, descriptions and links come from `product-suite/data.ts`; Gaming
and the microscope integrations have no section of their own yet, so they're
written out in the owner's words and lead to Contact, whose form picks the
interest from the link (`?interest=`, only its own options). "Also in the
suite" is worked out from what the mapping leaves out. Don't add products,
capabilities or integrations the owner hasn't listed.

How the campaign art was made (frame cutting, sprites, retouching, the hero
film's cuts) is in `tools/campaign-art/README.md`, with the scripts.

The leaders' and team portraits are WebP (the PNGs they came from are still
in `public/images/` but no longer used): about 8 MB less on the homepage.

The campaign art comes from the blueprint redesign (`blueprint-site/` on the
`blueprint-site` branch); only the pieces used here are copied into
`public/images/campaign/`. Illustrations keep their own colours (the palette
grade leaves images alone). The campaign scenes appear on Home and About
only; elsewhere the character is just the small growth rail in the margin.

**Product Suite**
- **Hero** (`SuiteHero.tsx`): ChakraVue AI at the centre, with the page's
  statement "We Add Intelligence to Your Devices." inside its ring, and the
  four products at the corners, each showing its own screen
  (`public/images/product-suite/hero/`: the surgical live view, the slit-lamp
  eye, the anonymised EMR dashboard, and a render of the module). Links run
  from every screen into the ring and data travels along them; they are
  measured off the laid-out cards, so they follow any screen size. The ring
  opens, the products arrive from their corners and their links draw in.
  Hovering a product lights its link and quiets the rest; the diagram tilts
  slightly with the pointer. Below 900px the same diagram stands upright:
  the statement on top, then two products, the ring (the mark at its
  centre) and two more, every screen facing the ring and linked into it.
  The scroll fade is desktop-only, so phones never dim the products.
- "Intelligence, Engineered for the Operating Room." follows the hero as a
  compact band that lights as it passes (not pinned).
- **By role** (`AudienceMap.tsx`, `variant="detailed"`), between the lead
  statement and the theater: the same four audiences, one row each, with
  what they need and a card per product (tagline, the product's own
  description, and "See it in the suite ↓" to its theater chapter). Under
  it, "Also in the suite" lists the rest of the portfolio, so the audience
  view never reads as the whole suite.
- **3D product theater** (replaces the four podium sections). A studio stage
  stays fixed while each product's chapter scrolls over it: the product builds
  up through a glowing scan line, turns, comes apart into labelled internal
  parts, reassembles, and hands over to the next. There's a product rail on the
  right, drag to turn, and the parts list writes itself in beside the copy.
  Each chapter's copy fades as it hands over, so it never slides across the
  label or the product. With reduced motion or no WebGL it becomes a plain list
  with the photographs.

**Services (new, replaces "What We Do" in the nav).** `/services`,
`src/pages/services/`.
- **Hero:** an engineering drawing sheet (an implant in half section, with
  dimensions, a thread detail and a title block) that drafts itself in
  stroke by stroke. A drafting crosshair and coordinates follow the pointer.
- **Two services, each with its own interactive diagram:**
  - *Biomedical FEA:* the implant and mandibular fixation models in real 3D
    (`fea3d.ts`): the implant is one parametric surface (helical thread,
    collar grooves, taper, apex), and the mandible is a bone section swept
    along the jaw with a four-screw box plate across the fracture. They sit in
    a neutral solver viewport with no contour plot. Drag to turn; switch
    Solid/Mesh and axial/oblique load. The jaw is vertex-shaded (bone,
    enamel crowns with dark gaps, the fracture line, occlusion underneath)
    so it reads against the light viewport, and the bite load sits on the
    molars of the fixed side, beside the plate. The SVG drawings are the fallback.
  - *Tobacco cessation:* a phone-style chat plays out, with voice answers,
    transcripts and meaning matching.
- **Case studies, "Why work with us" and a contact call to action.** The
  diagrams are illustrative, not simulation output.

**Product Suite: software platforms.** A console under the 3D theater
(`PlatformConsole.tsx`, data in `product-suite/platforms.ts`) with three
platforms: Dental Implant Planning; the ChakraVue Doctor Patient App, one
bundle showing the Doctor App and the Patient App side by side; and
ChakraVue Wellness. Choosing one re-renders the screen with a scan line, a
decoding title and a self-drawing line icon.

**3D products.** The Surgical Assistant, the Slit Lamp Module and the AI
Powered EMR are the same rugged field case, standing open
(`models/briefcase.ts`, modelled on the owner's reference photo). They
differ only in the interface on the display (`models/interfaces.ts`).
- **Lid:** a screwed-down faceplate with a port strip, camera, status windows
  and a USB hub around the display.
- **Base:** an instrument strip (power, panel meter, status windows), the
  compute unit, a trackball, a network switch, and a keyboard with touchpad.
- **Compute unit** (`models/computeUnit.ts`): built in millimetres after the
  developer-kit photo, unbranded. It has a base tray, a carrier board with
  front I/O, a 40-pin header and camera connectors, and a module under a
  square heatsink with a spinning fan.
- **The interface** (`models/interfaceStack.ts`): a cleaned capture of the
  real product UI (`public/images/product-suite/*-interface.webp`), cut into
  layers (title and toolbar, side panels, live view, status bar) plus the
  on-video AI overlay, which lives in its own transparent image
  (`*-overlay.webp`) and is painted out of the capture underneath.
  Assembled, the layers lie flush and read as one screen; the overlay
  breathes slightly. Exploded, they lift out of the display and gather in
  front of the case, enlarged and turned to the viewer (cancelling most of
  the turntable's turn): the panels part, the live view comes forward, and
  the overlay rises off it. The display dims behind them, tied to the stack
  by projection lines. The layer rectangles are in capture pixels, so a new
  capture only needs new numbers (`models/interfaces.ts`).
- **The AI at work** (`models/aiEffects.ts`, cyan like the interfaces' own
  overlays): an analysis beam sweeps the live view, leaving a measuring grid
  and detection points in its wake, inside viewfinder corners; a reticle
  sits on the detected eye, opening as the overlay lifts off and locking on
  again as it settles, with pulses radiating from the pupil; and readings
  stream from the eye into the measurement panels. Faint on the closed
  case's screen, full once it opens.
- **Focus** (the chapter runs longer: `focus: true` in
  `product-suite/data.ts`, `.theater__chapter--focus`): after the parts are
  labelled, the camera moves in until the interface fills the stage, square
  to the viewer. The copy, shade and eyebrow step aside (`--focus`), the
  side panels straighten, the overlay settles back onto the eye, and
  readout cards (`.treadout`, each tagged "AI") quote values already on the
  captured screen, scrambling in as they appear. On phones the camera
  frames just the live view. Then it steps back and the case closes.
- **The EMR's interface** (`models/interfaceSpider.ts`) is a spider of
  whole screens rather than a stack of layers. The patient dashboard is the
  main screen (on the display, closed). Exploded, it gathers above the open
  lid, and the patient overview, patient details, optometry and ophthalmic
  examination screens travel out from behind it to its four diagonals, so
  none overlaps another. Each sits on a leg from the main screen, with
  records streaming along it, and each is captioned on its top-left corner
  like a window title (`.tlabel--top`; number only below 1200px). On tall
  stages (phones, portrait tablets) the spider switches to its portrait
  form, two screens above the dashboard and two below, captioned from
  below (`ProductModel.layout`; the engine re-measures it). The focus beat
  frames all five screens; its readout cards quote what the screens show
  (patient flow, Quick Fill, the autorefractor link, the Slit-Lamp Imaging
  module). Leader labels and readout cards step clear of each other.
- **Anonymising EMR captures:** every patient becomes "Chakravue NN" (one
  number per dashboard card) with a test registration ID
  (`REG-2026-0000NN`), phone number (`90000000NN`), email and address,
  repainted in the app's own fonts (Segoe UI, Consolas, Manrope), and every
  avatar takes the app's own "CH". The patient on the detail screens is card
  06. The app header reads "ChakraVue AI". Ages, sex, blood groups and visit
  dates stay as captured.
- **Cleaning a capture:** paint out chip and GPU names, memory and
  performance readouts, model names (for example the segmentation model)
  and internal detector strings; then lift the overlay into its own image
  (rendered at 2x with slightly heavier lines and a soft halo) and fill it
  out of the plate.
- **Colour:** `kit.interfaceScreen()` shows a capture as captured. It runs
  the stage's ACES tone curve backwards (held just under the bloom
  threshold, at 86% brightness) and writes alpha 0, which tells the palette
  grade (`GradeShader`) to leave those pixels alone, so a cyan pupil ring
  stays cyan. Transparent layers and the screen glass blend their colour but
  keep that mark. Everything else is graded as usual.
- **Exploded view:** the lid tips back, the interface gathers in front (then the focus beat), the
  keyboard slides out, and the compute unit comes forward over the keyboard
  to stand off the front corner, below the interface, turned and enlarged
  while its heatsink rises off the module. Data runs along the display cable.
- The model sits forward of the turntable axis (`SHIFT`) so the open lid
  doesn't swing across the copy, and it asks for a higher camera
  (`elevation`) so the deck can be seen.

Integrated Devices is the connectivity module (`models/module.ts`). The
cases' fallback images (`surgical-briefcase.webp`, `slit-lamp-case.webp`,
`emr-case.webp`) and the Surgical Assistant's homepage shot are renders of
the model, captured with the palette set to "original" (the page's CSS
grades them) at chapter progress 0.12, assembled. The Slit Lamp Module's
and the EMR's homepage panels still show their earlier renders.

**Confidentiality.** Public copy and the exploded-view labels name parts only
generically (Port, Battery, Bluetooth, Compute unit…): no part numbers,
ratings, chipsets or security implementation details. Keep it that way when
adding products.

**About**
- The hero is the statement "The Technology Is Only as Strong as the Minds
  Behind It." over a live network of minds (`about-us/components/minds.ts`):
  points drift, link up and pass signals; the pointer draws the nearest ones
  together.
- "Why we exist" (`AboutStory.tsx`): "Built inside a working eye hospital.
  For every hospital." beside the campaign's height-chart pair: the boy well
  short of an older boy, then on a stool and taller ("The same hospital, with
  ChakraVue AI").
- Leader cards swing in, with the portrait wiping up inside them.
- The team portraits pop in.
- Each leader card has a "LinkedIn" pill under the role, and each team card
  has the LinkedIn glyph at its foot (`about-us/components/LinkedInLink.tsx`).
  Profiles opened in a new tab are set in `about-us/data.ts` (`linkedin`).
  Anyone without a profile simply shows no link (Hrushikesh Patki, for now).

**Blog.** The doorway light flickers on, and scrolling walks you toward it.

**Contact.** Form fields cascade in, labels light up with focus, and the map
unrolls into view.

**Privacy.** A reading-progress hairline runs across the top.

**Accessibility and performance**
- With the OS "reduce motion" setting, everything is instant and static: no
  preloader, no smooth-scroll hijack, and content is visible immediately.
- Touch devices keep native scrolling and skip the cursor, hover and pinning
  effects.
- three.js is a separate lazy chunk (about 139 KB gzipped) that loads after
  first paint, only for the home hero and the Product Suite theater. The
  painted CSS hero is the fallback.

## Where things live

```
src/motion/            the motion system
  gsap.ts              GSAP + plugins, shared easings ("cv.out", "cv.inOut")
  lenis.ts             smooth scroll
  iris.ts              the iris overlay (transitions + preloader curtain)
  transition.ts        page-transition sequence
  intro.ts             first-visit intro (introFilm.ts, or introPaper.ts without WebGL)
  gate.ts              holds entrance animations until the curtain opens
  reveal.ts            declarative entrances (data-split, data-scramble, …)
  useMotion.ts         hooks components use to add choreography
  PointerFX.tsx        cursor tag, magnetic, spotlight
  webgl/dataHorizon.ts particle landscape (the old home hero; no longer used)
  webgl/theater/       3D products: engine.ts (stage + inline modes),
                       kit.ts (materials, explode parts), models/*.ts
                       (briefcase.ts + computeUnit.ts + interfaceStack.ts +
                       interfaceSpider.ts + interfaces.ts + aiEffects.ts,
                       module), textures.ts
  motion.css
src/pages/home/home.css            homepage additions (hero actions, team, blog…)
src/shared/components/Footer.tsx   new footer
```

Most entrances are attributes in the markup, so adding motion to new content
is usually just an attribute:

| Attribute | Effect |
| --- | --- |
| `data-split` | Headline lines rise out of masks. Also `="fade"` (paragraph lines drift in) and `="chars"` (characters from a blur). |
| `data-scramble` | Text decodes from random glyphs. Use `="digits"` for numbers. |
| `data-reveal` | Block fades up. Variants: `="pop"`, `="flip"`. |
| `data-speed="0.2"` | Scroll parallax. |
| `data-magnetic="0.3"` | Element leans toward the pointer. |
| `data-spotlight` | Card glow follows the pointer. |
| `data-cursor="View"` | A tag beside the cursor shows that word. |
| `data-delay` / `data-start` | Tune timing and trigger point for any of the above. |

Changes to existing files are limited to motion hooks and attributes, plus CSS
that moved from `transform` to `translate`/`scale` so it doesn't fight the
animations. One side effect fixed an existing bug: the top and bottom
system-map nodes no longer jump sideways on hover.

## The 3D products

The four models are **stylised stand-ins built in code**, modelled on the
product renders, not engineering CAD. The part names in the exploded view
live in `src/pages/product-suite/data.ts` (`anatomy`). They're drawn from each
product's own description; have the product team confirm them before this
ships. When real models exist, export them as GLB and replace the builders in
`motion/webgl/theater/models/`: the engine only needs a group, a list of parts
with explode offsets, and label anchors.

## Colour palette

The site is Plum (black and #331a31) throughout; there is no palette
switcher. The stylesheets are still written in the original Ember colours,
and Plum is applied over them at runtime (`SITE_THEME` in `theme.ts`).
- `src/theme/palette.ts` defines the palettes and one colour transform per
  palette (in OKLCH: darks take the base, lit colours take the tone's hue,
  near-whites become white).
- `src/theme/theme.ts` rewrites every colour in the loaded stylesheets
  through it at runtime. Nothing in
  the stylesheets needs to change when you add a section.
- The WebGL scenes apply the same transform as a colour matrix in their own
  shaders (`theme/grade.ts`; product interface screens opt out by
  drawing with alpha 0), and decorative renders take it as an SVG
  filter (`theme/theme.css`). Art whose filter is animated (the blog
  doorway) puts `var(--cv-grade)` in front of it, so the animation never
  drops the grade. Canvases read their colours from CSS custom properties
  (the About network, `--minds-*`), which the rewrite recolours too. Photographs of
  people and the press logos are left untouched.
- Pages built mostly from flat black (Services, About, Blog, Contact,
  Privacy) would lose the palette, so each palette also has a surface tint
  (dark cards and panels take its shade) and an ambient light: its tone
  glowing in from the top left and bottom right of the screen, screened
  over the page (`body::after` in `theme.css`, lighter on the home and
  Product Suite pages, which already carry lit colour).
- To change the site's palette, set `SITE_THEME` to another entry in
  `THEMES` (Ember is `"original"`, Midnight is `"navy"`).

## Typography

The whole site is set in Audiowide, linked from `index.html` (not
`@import`ed from a stylesheet, so it starts loading with the page). Until it
arrives, text is set in Arial resized to Audiowide's measurements, so nothing
moves when it swaps in: "Audiowide Fallback Caps" for headings, labels and
the nav (mostly capitals) and "Audiowide Fallback" for body text, since the
two fonts differ in width differently for capitals and lower case. The
stylesheets still use role tokens (`--font-display`, `--font-body`,
`--font-nav`, `--font-ui` in `src/styles/global.css`), and they all point to
Audiowide. To bring the original mix back:
1. Set `--font-body` and `--font-nav` to `"Inria Serif", Georgia, serif` and
   `--font-ui` to `"Montserrat", "Segoe UI", Arial, sans-serif`.
2. Add those families to the Google Fonts link in `index.html` (with fallbacks
   measured the same way).
3. Add them to `FAMILIES` in `src/motion/fonts.ts`, so text waits for them
   before it's split into lines.

`font-synthesis: none` stays either way. Audiowide has one weight and no italic,
so the browser mustn't fake them.

## Copy to confirm

Services and platforms: all text is condensed from the briefs supplied
(FEA, osteotomy and integrated-devices PDFs and the contribution report).
The summaries and "A method you can put in front of a design review." are
new; the hero line is the supplied quote. The FEA contour
view, the 0 to 300 N load scale, the pubic-gap readings and the chat
dialogue are illustrative, so please confirm they're acceptable to show.

Campaign copy (from the blueprint redesign, adapted). Please review:
- Hero: the "Analogue to AI" eyebrow and the "The campaign film" chip.
- Story chapter names (`story.ts`), shown on the growth rail.
- Who we serve / By role: the audiences' "need" lines, the Gaming and
  Microscope Software Integrations descriptions and taglines, "Find your role,
  then the products built for it.", and the two photos used for Gaming (the
  hands-on session) and the integrations (the surgeon at the microscope).
- Hero: "Every doctor started small" above the headline. The headline itself
  is unchanged until the owner decides whether the story line should replace
  it.
- Reels: "Still on the old blueprint?", "Every hospital knows these days.",
  each card's hook and punchline, and which product each links to.
- Discovery: "The spark" / "Not to burn the past." / "To see what was
  underneath it all along." / "Four new powers, built into the tools doctors
  already use".
- Real theatres: "Not a render", "In real theatres, with real surgeons." and
  the four captions. Confirm consent for the people shown, and that the
  summit appearance can be named.
- Aspiration: "The dream, within reach" / "A doctor with new powers." and the
  four power lines.
- About: "Why we exist", the blueprint's About hero lines, and the two
  captions under the height chart.
- The film shows the boy striking a match; confirm that's acceptable for a
  healthcare brand.
- Growth rail: "Every doctor started small." and the height readings.

New on the homepage. Please review before launch:
- "How it works" / "From the instrument to the decision." (above the value cards)
- The four value-card lines for Capture, Connect, Analyse and Assist
  (`valueCards` in `src/shared/data/content.ts`). The original site repeats one
  placeholder paragraph on all four.
- "Engineers, designers and strategists working alongside the founding team."
  (`pages/home/components/TeamTeaser.tsx`)

The blog cards show the Blog page's current posts, which are still placeholder
text. Everything else on the homepage is existing site copy: the hero summary
is the first line of the clinical-systems section, and the team and blog
headings come from the About and Blog pages.
#   C h a k r a V u e - W e b s i t e - p l u m 
 
 