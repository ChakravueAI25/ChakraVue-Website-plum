# ChakraVue AI — Motion Lab

A copy of the full site (`../Chakravueai-website`) with a complete motion layer:
page transitions, smooth scroll, scroll choreography, text animation, a WebGL
hero and pointer interactions. The original site is untouched.

```bash
npm install
npm run dev      # http://127.0.0.1:5175  (main site stays on 5173)
```

The Product Assistant chat needs an admin password in `.env` to upload its
product PDF (see "Product Assistant" below). It uses no AI service or API key.

## What's in it

**Across the site**
- **Iris page transitions.** The screen closes like an eye onto the link you
  clicked, shows the destination's name, then opens onto the new page from the
  centre. Back and forward buttons get the same treatment.
- **Intro (first visit per session)** (`motion/introLogo.ts`, 2026-10-27,
  owner's request). Straight away, on black, the ChakraVue AI mark gathers
  out of a particle burst (the owner's film, `public/images/intro/intro-logo.mp4`,
  5 s, silent). Once it settles, the camera flies through the ring: the
  film scales up while a hole held inside the ring's clear centre opens onto
  the hero (the iris is lifted with `releaseIris()`). The logo is only
  scaled, never turned. About 5 s in all; click, tap, Esc or "Skip intro"
  goes straight to the fly-through. If the film can't load, the iris simply
  opens. The torn-blueprint film and the kid's hello were removed.
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
  letter by letter. The Privacy Policy is linked once, in the bottom row
  (Explore leaves it out).
- **The kid growing up** (`shared/components/GrowRail.tsx`, `growRail.css`).
  A fixed height chart in the right margin. The page's scroll plays the
  superhero toddler from the campaign clip (landing, waving, pointing,
  thumbs-up: 35 cut-out frames in `grow/toddler-seq.webp`); he becomes the
  doctor in a warm flare and grows to full height. A reading above his head
  goes from 0.95 m to 1.74 m. The first time the chart appears he flies in
  from the screen's edge (the clip's flight, `grow/toddler-fly.webp`).
  He is also the Product Assistant's button (see "Product Assistant" below): hovering him shows "Ask me about our products" and the toddler waves.
  On the homepage it tells the story: it shows from the hero, names the
  chapter above the chart, paces the growing up by the chapters (he grows
  up as the journey begins), and steps aside when the closing scene takes
  over. Elsewhere it appears once the hero has scrolled away. Below 1360px
  wide, and always on Product Suite (the product rows use that margin),
  it's a 46px badge (ring filling with the page, face changing) that shows
  for about three seconds at each new chapter and then fades, so it never
  sits on what's being read. Decorative (`aria-hidden`), on every page. The
  frames were cut from the supplied clip; the clip itself isn't shipped.
- **Film grain.** A faint moving grain over the glows (desktop only).
- **One typeface.** Audiowide everywhere (see Typography below).

**Home.** A company homepage built on the original design: the original
sections and art, plus the parts a company site needs (clear calls to action,
the team, the latest posts). Nothing on the homepage pins;
sections animate in as they arrive. It tells the kid's story in six
chapters (`shared/data/story.ts`): The dream, The beginning, The discovery,
The transformation, The journey, The aspiration. Each starts at a
`ChapterMark` placed between sections, so the technical sections carry no
story code; the growth rail reads the marks. The order (2026-10-30) reads
as one story, introduction to action: hero, Our journey, the statement band,
the glowing banner and early-bird offer, Who we are; then what we do (from
analog to intelligent, the discovery, the core idea, Know how it works);
then the products (Who are you here as?, Integrated devices, the ChakraVue
System, Surgical tools); then in practice (real theatres); and the
aspiration with Book a demo / Collaborate. Team and Latest posts were
removed from Home (owner, 2026-10-30); the team lives on About and the
posts on Blog. The bullets below describe each section; `HomePage.tsx` is the
source of truth for the order. The sections:
- **Hero: the dream** (`Hero.tsx`, `home.css`). The kid walks across an old engineering blueprint and strikes a match, and
  the blueprint burns open onto a circuit. The whole film loops
  (`campaign/analogue-to-ai-loop.mp4`; `-loop-sm.mp4`, a lighter encode,
  below 760px; owner's request, 2026-10-27), dissolving from the circuit
  back into the walk so the loop has no seam. It
  replaced the sunset, the particle landscape and the centred logo
  (2026-10-26, at the owner's request). Framed into the site: the nav's band
  and the copy's corner are shaded, the edges vignetted, the bottom melts
  into the page over a warm hairline. Over it, low on the left, only the
  headline, "Add Intelligence to Your Practice", and two buttons: "Explore
  products" and "Book a demo" (`/try-demo`). The story line, the one-line
  summary, the film's play/pause chip and the product shortcuts were
  removed (owner, 2026-10-29) so the headline stands alone.
  The film starts once the curtain opens (never under the intro), pauses
  off screen, and stays on its poster under reduced motion (there is no
  play button any more). On phones the
  film fills the top half and fades into the copy, so the boy stays in
  view. Nothing in the hero moves with scroll. The full campaign film
  (`analogue-to-ai.mp4`) is no longer used.
- **Featured in** marquee: off the page since 2026-10-30 (owner), when Our
  journey took its place under the hero. `FeaturedInStrip.tsx` and its
  styles in `global.css` are kept, unused, in case it comes back. It showed
  NDTV and India TV in turn, from
  `featuredMedia` in `shared/data/content.ts` (owner, 2026-10-26; India TV is
  confirmed by its microphone and camera in the AI Impact Summit photos, and
  its logo is the one on Wikipedia, a non-free logo). Each sits on a tile of
  the same height: NDTV's red square, India TV on white. Under them, "National
  TV and digital media interviews at the AI Impact Summit 2026, New Delhi.
  Read about it →" links to `/blog#media`. Add a channel there only when the
  coverage is confirmed.
- **Our journey** (`JourneyStrip.tsx`, `journey.css`, owner, 2026-10-29;
  right under the hero since 2026-10-30, in place of Featured in): a
  small strip of real photographs on an endless CSS loop (60s; the list
  rendered twice, moved by one copy), paused under the pointer and still,
  scrollable, under reduced motion. The blog's AI Impact Summit photos
  (`mediaAppearance.photos`) and the four retouched real-theatre photos, each
  with a short caption; "Read the story →" links to `/blog#media`. Real photos
  only: `about/hoarding.jpg` is a generated render and is left out.
- **Statement.** "Built from Experience. Guided by Science. Elevated by
  Intelligence." lights word by word as it passes, closed by "Shaping What
  Healthcare Can See, Understand, and Do." under a short rule.
- **The beginning: from analog to intelligent** (`AnalogToIntelligent.tsx`,
  `analog.css`, `#analog-to-intelligent`; replaced the "Still on the old
  blueprint" problem reels, owner, 2026-10-29). "How practice is changing /
  From analog to intelligent." and "Move beyond fragmented, paper-based
  workflows to connected clinical systems that bring your practice
  together." Three stages on one line, Analog → Digital → Intelligent:
  the campaign's paperwork scene (`campaign/reels/records-before.webp`,
  retouched, faded back), the ChakraVue System's anonymised patient
  dashboard, and the Slit Lamp Module's analysis with a beam sweeping it.
  Each has a title, one line and four tags (paper records … manual admin;
  digitised records … easier access; connected systems … workflow
  support). As the section arrives the line fills and the stages light in
  turn, once; nothing pins. On tablets and phones the line gives way to a
  stack with arrows between, and each image carries its stage. One button,
  Know how it works, at the head's top right: it opens the Contact form in
  a pop-up (`shared/components/ContactDialog.tsx`, 2026-10-31). The other reel images (car, dental
  tower, clerk's "after") stay in `public/images/campaign/reels/`, unused.
- **The discovery: what we do** (`DiscoveryReveal.tsx`, `discovery.css`).
  The company's tagline (owner, 2026-10-29; it replaced "The spark / Not to
  burn the past." and the burnt-blueprint reveal): "What we do / We connect
  clinicians, data and devices." and "From the instrument to the record, in
  one connected line of sight.", over the connected-care photo
  (`campaign/connected-care.webp`), with the mascot and three cards:
  Clinicians, Data, Devices, each line paraphrasing its product.
- **Who are you here as?** (`RoleShowcase.tsx`, `roles.css`,
  `#who-are-you-here-as`; replaced the slit-lit product showcase, owner's
  brief 2026-10-29; redesigned 2026-10-30 as a product discovery block).
  Top (from the Claude Design frames, 2026-10-31): "ChakraVue ecosystem"
  centred as the section's heading, with "Discover the intelligence, tools
  and technology designed around your role in advancing healthcare." under
  it and the pause control at the right. The question ("Are you a
  Clinician?") and the chosen audience's actions share a row: question
  left, actions right. Then the three
  roles as selectable cards in one row (index, a mark that is hollow or
  filled, so the choice reads without colour, the role, its line, how many
  products), then that role's products in an even grid that fits the count
  (one: picture and copy side by side; two or three: columns). Each card
  has a picture of one fixed height, the product's tagline, its name, a
  line paraphrasing its own description and "Explore product" (or the Ask
  / Talk link for Contact offerings). Under them the software platforms as
  chips and "View all products". The roles and their products are `roles`
  in `shared/data/audiences.ts`: Clinicians -> Surgical Assistant, Slit
  Lamp Module; PGs -> Gaming, Slit Lamp Module, ChakraVue System;
  Researchers -> Sidekick (pilot, Contact with "Sidekick (research)"
  chosen). A role with no products would show a short note and a Contact
  link. Every role's products share one grid cell, so on wider screens
  changing role never moves the page: the old set fades out (0.2 s) and
  the new one fades and rises 8px in (0.32 s), with a plum glow swelling
  behind. It plays Clinicians -> PGs -> Researchers by itself: the active
  card's bar fills over 6 s and its animationend brings the next role in,
  so there is only ever one timer. A pick restarts the bar; pointing at
  the cards or products, keyboard focus in the section, the pause button,
  the section being off screen or the browser tab hidden all pause it.
  The cards follow the tab pattern (arrow keys). Phones (700px and below)
  and reduced motion never change role by themselves; on phones the cards
  are compact, the chosen role's line sits under them and its products
  stack (only the chosen set is laid out). Product shots come
  from `public/images/home/products/` (the Integrated Devices shot's battery
  rating was painted out 2026-10-29); Gaming uses the hands-on session
  photo; Sidekick has no product imagery, so it uses the blueprint
  redesign's research reel (`campaign/reels/research-before.webp`, the
  campaign's "sidekick" scene). Under it, the software platforms as chips,
  each linking to `/product-suite#platforms`. The early-bird offer that
  used to sit above it moved under the glowing banner (2026-10-30).
- **Glowing banner and early-bird offer** (`IntroBridge.tsx`,
  `bridge.css`), right under the statement band, headed "We connect"
  (centred, 2026-10-31). A wide pill-shaped banner,
  near-black inside with a thin plum outline and a soft ambient glow, reads
  "Doctors · Data · Devices" (the company's line from What we do; "Doctors" by request, 2026-10-31, an exception to the "clinicians" wording). A
  light travels round its outline clockwise, about 7s a lap: an SVG stroke
  dash on a rounded rect with `pathLength=100`, in five layers (blurred
  bloom, faint tail, trail, streak, bright head) whose heads meet, animated
  by CSS `stroke-dashoffset` only, so no JavaScript runs and the loop has no
  seam. Dash lengths are in px because a unitless `calc()` isn't a valid
  dash length. Under reduced motion the light is hidden and the ambient
  glow stays. Under it, the early-bird offer (`EarlyBirdOffer.tsx`,
  `earlyBird.css`, posting to `/api/early-bird`).
- **The core idea** (original): "We don't replace the device. We extend
  what it can do."
- **Know how it works** (`ValueCards.tsx`, `#how-it-works`). Capture →
  Connect → Analyse → Assist on one line; a signal of light travels through
  the stages as you scroll and lights each one. A lead line says every
  product follows these steps inside the existing workflow.
- **Integrated devices** (`IntegratedDevices.tsx`, `devices.css`,
  `#integrated-devices`). "The equipment you already own, connected.": your
  equipment (generic kinds only) → the connectivity module → patient records, with
  pulses along the links (upright on tablets and phones), then three points
  drawn from the product's description and "Compatibility depends on the
  device. We confirm yours before anything is installed." with "Ask about
  your devices"; "Explore Integrated Devices" sits at the head's top right.
- **The ChakraVue System** (`EmrConnect.tsx`, `emr.css`, `#emr`; "EMR ×
  ChakraVue AI" until the 2026-10-29 renaming). "Every
  patient on one timeline.": the anonymised patient dashboard in a window
  frame, the Surgical Assistant, Slit Lamp Module, Integrated Devices and
  clinical notes linked into it from either side (each line from that
  product's description), and the clinic's stages as the dashboard tags
  them: Reception, Optometry, Examination, Check-out. The head is split:
  label and title left, the lead right, "Explore the ChakraVue System" at
  the top right.
- **Surgical tools** (`SurgicalTools.tsx`, `surgical.css`,
  `#surgical-tools`). "AI-powered assistance, in the surgeon's field of
  view.": three cards on the left, who it's for, what it does and what it's
  built on (real theatres and the AI Impact Summit demonstration, with the
  link to the summit post), beside the Surgical Assistant's interface
  capture (an analysis beam sweeps it). No validation or outcome claims.
  The ID / Platform / Research tags and the Book a demo button were
  removed (2026-10-31).
- **The journey: real theatres** (`RealTheatres.tsx`, `theatres.css`). "Inside
  ChakraVue AI / In real theatres, with real surgeons." (label changed
  2026-10-31): four real photographs
  (`public/images/campaign/theatres/`): the Surgical Assistant at the
  microscope, the Slit Lamp Module, the AI Impact Summit, a hands-on
  session. The microscope maker's marks, its REF/SN plate and an on-screen
  FPS readout are painted out or cropped.
- **Who we are** (`WhoWeAre.tsx`, `why.css`, `#who-we-are`; "Why
  ChakraVue AI" and `#why` until 2026-10-30), right after the early-bird
  offer. "Practical to adopt. Built on research.", a lead that introduces
  the company (a medical technology and engineering company developing
  hardware, software and AI together around real clinical environments;
  restated from the cards and About, no new claims), "Meet the team behind
  it" (`/about-us`), then the owner's six differentiators as principles (data
  security, ease of integration, easy onboarding, no new medical hardware,
  local data management, research & development) as cards. Deliberately
  general: no security mechanisms, certifications or storage details until
  they're confirmed (see "Copy to confirm").
- **The aspiration** (`CampaignClose.tsx`, `campaign.css`). A height chart:
  the toddler at 0.95 m and, beside him, the clinician he grows into rising to
  1.74 m as the section arrives, the tape lighting with him. "The dream,
  within reach / A clinician with new powers." and the four powers, each
  drawn from its product's own description: "Every case captured. Every
  examination remembered. Every patient on one timeline. Every instrument
  connected. Join the revolution." Then the page's last step as two
  cards: Book a demo (`/try-demo`) and Collaborate (Contact, with
  Partnership / Collaboration chosen), and "Or simply contact us".

**In the media** (`blog/components/MediaFeature.tsx`, `mediaAppearance` in
`blog/data.ts`), at the top of the Blog page (`/blog#media`), and since
2026-10-31 the page's only section under the hero (the placeholder featured
post and post grid, `FeaturedPost.tsx` / `PostGrid.tsx`, are kept but
unused): the AI Impact Summit 2026 (New Delhi, 16–21 February),
from the post on the live site (chakravue.ai/blog-page): what was shown
live, the channels ("Featured on", the same `featuredMedia`), the coverage
and the outcome, with three photos from the stall
(`public/images/media/`: the India TV interview, a camera crew at the demo,
the team). Only what that post says.

**The audience mapping** (`shared/data/audiences.ts`) is the single source
for Home's "Who we serve", the Try Demo page and the Product Suite rows' "Built for"; change it there only. It is the owner's
mapping (2026-10-26):

| Audience | Products | Link |
| --- | --- | --- |
| Clinicians & Surgeons | Digital Surgical Assistant, Slit Lamp Module | Their product rows (`/product-suite#…`) |
| PGs & Surgical Trainees | Gaming | `/contact-us?interest=VR/AR Gaming Environment` |
| Hospitals & Training Institutions | ChakraVue System | Its product row |
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
- **Hero** (`SuiteHero.tsx`): an editorial slideshow of the four products,
  one at a time: its render large on the left
  (`public/images/product-suite/slides/`, rendered on black from the 3D
  models), and on the right its number, name, tagline, brief and Built for
  between hairlines, View product and its call to action. Arrows, the
  numbered indicators, the arrow keys and a swipe change slides; it plays
  in a loop and holds off screen. A change takes about half a second: the
  outgoing product and copy fade a few pixels away (0.2 to 0.28 s), the new
  product comes in from the side asked for (0.45 s) with its copy just
  behind; a click mid-change kills the running tweens, so rapid clicks
  never stack. The product stands on a platform (`.ps-hero__base`,
  2026-10-30): an ellipse fitted to its footprint in the render (measured
  from the slides; the cases and the module each have their own fit,
  `data-shape`, and it eases between them), so its lowest point meets the
  lit front of the rim. Only the front is lit because the renders blend
  with "lighten", so a back rim would show through the case. The products
  hover a few pixels over it (`.ps-hero__float`, 6 s, eased, alternating)
  while the light pooled on the platform dims and tightens in step: both
  are CSS animations of one shared duration, so they never drift apart.
  The float layer does the "lighten" blending, so the stage itself must
  not start a stacking context. Under reduced motion nothing floats.
- "Intelligence, Engineered for the Operating Room." follows the hero as a
  compact band that lights as it passes (not pinned).
- **The products, as a spec sheet** (`ProductTheater.tsx`, `theater.css`;
  rebuilt 2026-10-26 at the owner's request, after a reference data sheet).
  The four products follow one another, each a row with the copy on the
  left (count, name, tagline, then hairline cells: Overview, Built for from
  `shared/data/audiences.ts`, and a hint) and the product in 3D on the right,
  on a dark panel with its large outlined index. Nothing is driven by
  scrolling: pointing at a row opens the product up (the engine's inline
  mode, `setPeek(true, 0.9)`) and leaving closes it. That is the only
  motion: the product holds one angle, with no idle spin and no drag to
  turn (owner, 2026-10-30). The
  parts are not named (no label layer, `anatomy: []`). Touch screens and the
  keyboard use the "Look inside" / "Close it up" button, and the hint
  changes with it. Each row has its own small theater. They are built one
  at a time in idle moments from soon after the page loads (a row about to
  come on screen jumps the queue). Each compiles its shaders with
  `compileAsync` once its interface captures have loaded (a capture
  arriving changes its material's shader), against the composer's buffer
  (which needs different shader variants from the canvas), then draws one
  frame. Building them as they scrolled in compiled every shader
  synchronously and froze the page for seconds (2026-10-30: about 14 s of
  blocked main thread in one scroll, under 1 s once built). A row
  assembles once as it comes into view. While the page scrolls, or once
  the product is at rest, a theater draws every other frame (only its
  screen effects move then); opening up and assembling get every frame.
  Shader error checks run in development only. The canvas clears to the panel's
  computed colour with alpha 0, so the grade pass leaves it alone and it
  matches the CSS panel exactly; the scan slice is left out there for the
  same reason. Rows keep the product ids as anchors (`/product-suite#…`).
  At 900px and below the product sits above its copy. With reduced motion
  or no WebGL each row shows the product photograph instead.

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

**Product Suite: our software suite.** Under the product rows
(`PlatformConsole.tsx`, data in `product-suite/platforms.ts`), "Our software
suite." shows the three platforms like the hardware: one row each, the copy
on the left (count, title, category, overview, use, Talk to us) and its
screen on the right (2026-10-31; it was a tabbed console). Dental Implant
Planning; the ChakraVue Doctor Patient App, one bundle showing the Doctor App
and the Patient App side by side; and ChakraVue Wellness. As a screen comes
into view its line drawing traces itself in and its features rise; pointing
at it runs a scan line down it. Dental Implant Planning has no drawing. Screens
from the software (owner's captures, 2026-10-31) sit in the panels:
`public/images/product-suite/dental/` for the planner (also on Home's Dental
tools) and `.../apps/` for the Doctor and Patient Apps. App captures had
the status bar cropped and patient names replaced with "Chakravue 01/02";
the doctor dashboard capture (a real eye photo and names) was left out.

**3D products.** The page now shows the models in the inline spec rows
above. The engine's stage mode (fixed stage, chapters, leader labels, the
focus beat and readout cards, described below) is kept but no longer used
on any page. The Surgical Assistant, the Slit Lamp Module and the AI
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

**Confidentiality.** Public copy and part names (no longer shown in the exploded view, but still in `data.ts` and so in the bundle) name parts only
generically (Port, Battery, Bluetooth, Compute unit…): no part numbers,
ratings, chipsets or security implementation details. Keep it that way when
adding products.

**About**
- The hero is the statement "The Technology Is Only as Strong as the Minds
  Behind It." over a live network of minds (`about-us/components/minds.ts`):
  points drift, link up and pass signals; the pointer draws the nearest ones
  together.
- "Why we exist" (`AboutStory.tsx`): "Built inside a working eye hospital.
  For every hospital." beside the footer's logo (glyphs only, never rotated;
  the campaign's height-chart pair was removed, owner, 2026-10-31).
- Leader cards swing in, with the portrait wiping up inside them.
- The team portraits pop in.
- Each leader card has a "LinkedIn" pill under the role, and each team card
  has the LinkedIn glyph at its foot (`about-us/components/LinkedInLink.tsx`).
  Profiles opened in a new tab are set in `about-us/data.ts` (`linkedin`).
  Anyone without a profile simply shows no link (Hrushikesh Patki, for now).

**Dental tools (Home)** (`DentalPlanner.tsx`, `dental.css`, `#dental`,
after Surgical tools, 2026-10-31): Dental Implant Planning from the same
`platforms.ts` entry (no drawing since 2026-10-31): its six features, the planning steps and its use note; then where it
runs (Desktop, Web, XR, from the planner's knowledge-transfer document) and
a link to the Salem session on the Blog.

**Forms.** Every form asks "How did you hear about us?" (`referralOptions`
in `contact/data.ts`): Contact, the Try Demo request and the early-bird
offer (saved with the lead as `heardAbout`). The early-bird form is laid out
in four columns so it fits a laptop screen without scrolling, and it (like
the pop-up Contact form) holds the page's smooth scroll while open
(`lockScroll`, `data-lenis-prevent`), so the wheel scrolls the form.

**Salem visit** (`blog/components/SalemVisit.tsx`, `salemVisit` in
`blog/data.ts`, `/blog#salem`, 2026-10-31): the dental implant planner at
Vinayaka Mission's Research Foundation, Salem, with the owner's two photos
(`public/images/blog/salem-*.webp`). No date was supplied, so none shows.

**Blog.** The doorway light flickers on, and scrolling walks you toward it.
The footer's faint logo (14%, never rotated) sits centred behind the hero copy.

**Try Demo (new, 2026-10-26).** Since 2026-10-31 the cards carry no
pictures: "Who Are You?" shows a line icon per audience (in
`RolePicker.tsx`), and each "Choose Your Demo" card opens with a "For …"
band, then the product's name in the accent colour. `/try-demo`, `src/pages/try-demo/`; in the
nav as a button at the right of the header bar (`.header__cta`, slimmer
below 1100px) and as a plain link in the phone menu and the footer.
- **Hero** (`DemoHero.tsx`): "Experience the Future of Surgery.", the
  supporting line, "Explore Demos" (scrolls to the roles), and the page at a
  glance (products, roles, demo points per product), all counted from the
  data. A glow and a faint grid; nothing large.
- **Who Are You?** (`RolePicker.tsx`): the four audiences from
  `shared/data/audiences.ts` as buttons (picture, role, need, its products as
  tags). Choosing one scrolls to the demos and highlights that role's cards
  (`aria-pressed`). Compact rows on phones.
- **Choose Your Demo** (`DemoCards.tsx`): five cards, one per product, set
  like a pricing page: picture with a "For <role>" tag, name, tagline, then
  **10,000 Demo points** ("Declared allocation for this product"), Try Demo,
  the description, and a link to the product's row in the suite where it
  has one. Each card spans six rows of the list (`grid-template-rows:
  subgrid`), so the allocations and buttons line up across the cards. A
  role filter above (`All products` + the four roles) stays in step with
  the picker: the role's cards are outlined, the others dim (still
  usable); an `aria-live` line says what's highlighted. 5 across on
  desktop, 3 + 2 to 900px, 2 on tablets, 1 on phones. No featured card.
- **The allocation** is `DEMO_POINTS` in `audiences.ts`: a stated figure,
  per product, not a shared pool. Nothing tracks, spends or expires points,
  and the page never says it does.
- **Try Demo opens a request dialog** (`DemoRequest.tsx`, a native
  `<dialog>` with `showModal()`: focus stays inside, the page behind is
  inert, Esc / Close / Cancel / a click on the backdrop close it, Lenis is
  stopped while it's open, and focus returns to the card's button). The
  product is fixed by the card (picture, name, role, allocation in the
  header). It asks for the Contact page's details (name, phone, email, who
  you are, from `contact/data.ts`) plus an optional organisation and note.
  Required fields are checked on blur and on submit with messages under
  each (`aria-invalid`, `aria-describedby`); the first bad field takes
  focus. The details carry over to the next product; the first empty
  field (or Send) takes focus on opening.
- **Sending**: there are no demo environments and no form backend yet, so,
  like the Contact form, it hands the finished request ("Demo request:
  <product> (<name>)", with the role, the allocation and every field) to
  Gmail's compose view, and the dialog says plainly that the visitor
  still has to press Send there. If a pop-up blocker stops the tab it says
  so and offers the link; it also offers a `mailto:` and "copy the request".
  Swap `send` for a real submit handler (and real demo links) once they
  exist.
- The growth rail is a corner badge here, as on Product Suite, so the kid
  never covers the cards.

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
  intro.ts             first-visit intro (introLogo.ts: the logo, then through its ring)
  gate.ts              holds entrance animations until the curtain opens
  reveal.ts            the one text entrance (fade and rise), applied site-wide
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

**Text entrance (owner, 2026-10-30).** The whole site uses one text
animation, in `motion/reveal.ts`: as text comes into view (its top 10% into
the viewport) it fades from 0 to 1 and rises 16px, over 0.55s with an
ease-out, once. Elements that arrive together are batched and staggered
70ms apart, and a batch never takes more than 0.35s to start its last
element, so a long list still appears at once. It's triggered by visibility
(ScrollTrigger.batch), never scrubbed or pinned. Headings, `.section-label`,
paragraphs, list items, quotes, captions and `.hsec-link` CTAs inside the
pages' sections are picked up automatically; text inside an element that
is already rising (a card with `data-reveal`) rises with it. Elements are
hidden by script only, so the text is there if scripts fail, and nothing is
hidden under reduced motion. The hero headline and the statement bands
(`InsightStatement`, word by word) use the same fade and rise in their own
timelines. The old masked lines, character blur, scramble, pop and flip
entrances, and the statement band's scroll-scrubbed words, were removed.

| Attribute | Effect |
| --- | --- |
| `data-split` / `data-scramble` / `data-reveal` | Opt an element in to the text entrance (for blocks such as cards that the automatic pick-up doesn't cover). Old variant values are accepted and mean the same thing. |
| `data-motion="own"` | Leave this container's text alone: it animates its own (hero, Product Suite slideshow, Who are you here as? crossfades, marquees, the Services chat, the founder card). |
| `data-speed="0.2"` | Scroll parallax for art. |
| `data-magnetic="0.3"` | Element leans toward the pointer. |
| `data-spotlight` | Card glow follows the pointer. |
| `data-cursor="View"` | A tag beside the cursor shows that word. |
| `data-delay` / `data-start` | No longer used by the text entrance (kept in markup, ignored). |

Changes to existing files are limited to motion hooks and attributes, plus CSS
that moved from `transform` to `translate`/`scale` so it doesn't fight the
animations. One side effect fixed an existing bug: the top and bottom
system-map nodes no longer jump sideways on hover.

## Product Assistant (PDF chatbot)

The campaign's kid on the growth rail is the chat button, on every page
(`GrowRail.tsx`, `ChatAssistant.tsx`, `shared/chat/assistantState.ts`):
pressing the kid in the height chart, or his face badge wherever the chart
isn't showing, opens the "Product Assistant", which answers visitors' questions from one PDF: the
product document the administrator uploads at `/admin`. Answers are
sentences copied word for word from that PDF, each with its page number.

It uses no AI. There is no language model, API key, embedding model or
outside service: a small search engine on the site's own server (TF-IDF,
cosine similarity, keyword, phrase and model-number matching) finds the
passages, and the answer is built from their sentences. Nothing is
generated or paraphrased, and questions and the PDF never leave the server.

**Setup**

```bash
npm install
npm run admin:password -- "choose a long password"   # prints ADMIN_PASSWORD_HASH=...
cp .env.example .env                                  # paste that line into .env
npm run dev                                           # site + assistant on http://127.0.0.1:5175
```

Production: `npm run build && npm run serve` (Node 22.9+) serves `dist/`, the
chat API and the admin page on port 4175 (`PORT` and `HOST` in `.env`). The
Vite build alone is a static site with no assistant; it needs this Node
server, or the same routes (`server/routes.ts`) mounted in another Node
host. Serve it over HTTPS (behind a reverse proxy, for example): the admin
sign-in is HTTP Basic authentication, which is only private over HTTPS.

Without `ADMIN_PASSWORD_HASH` (or `ADMIN_PASSWORD` for local use) the admin
area is switched off. Until a PDF is uploaded, the chat says it can't answer
yet.

**Updating the product information**

1. Open `/admin` (for example http://127.0.0.1:5175/admin) and sign in with
   `ADMIN_USERNAME` (default `admin`) and the password.
2. Choose the new PDF and press "Upload and process".
3. A green message confirms it, and "Document in use" shows the file name and
   when it was last updated. Every question from then on uses the new
   document. No code change or restart is needed. "Try a question" on the
   same page checks it.

If a file is refused (not a PDF, damaged, password-protected, scanned, or over
`PDF_MAX_MB`, default 10 MB), a red message says why and the previous document
stays in use. Only text-based PDFs work (exported from Word, Google Docs and
so on). A scanned PDF is pictures of pages with no text, and there is no
OCR. Export a text PDF instead, or run it through OCR first.

A starter document can be made from the website itself: `npm run
assistant:site-pdf` (`server/sitePdf.ts`) writes
`docs/ChakraVue-AI-Product-Guide.pdf` from the page data files (products,
platforms, services, team and contact details; nothing the site doesn't
publish). Run it again after editing those files, then upload the new PDF.

Writing the PDF so it answers well: give each product its own heading (its
name and model number, such as "Alpha Monitor (Model AM-200)"), and put specs
in short "Label: value" lines ("Price: $1,299", "Warranty: 2 years"). A
question that names a product is answered from that product's section only.

**How it answers**

1. The question is checked (1–500 characters, rate-limited per visitor),
   lower-cased, tokenised, stop words removed and words reduced to a stem
   ("batteries" → "battery"). Numbers and model numbers stay whole, and are
   also matched without their hyphen ("BS-310" = "bs310"). A short list of
   everyday wordings maps onto document words ("how much" → price, "how
   heavy" → weight). An amount of money in the PDF also counts as "price".
2. Every passage is scored: cosine similarity of TF-IDF vectors (40%), how
   much of the question it covers, weighted by rarity (35%), exact phrases
   (10%), model numbers (15%), plus a bonus when the question names its
   heading. A model number the passage lacks reduces the score.
3. Passages under `CHAT_MIN_SCORE` are dropped. If none is left, the reply
   is "Sorry, I couldn't find a relevant answer in the current product
   document. Please try rephrasing your question or contact our support
   team."
4. Inside the best passages each sentence is scored. A sentence has to
   mention what was asked about ("price", "battery") itself; the product may
   come from its heading ("It supports USB-C charging." under "Alpha
   Monitor"). The best sentence is kept, then others that answer another
   part of the question or answer it as fully, up to `CHAT_MAX_SENTENCES`,
   without duplicates.
5. A short question that fits several products equally ("What's the
   warranty?") shows each product's sentence and asks which one was meant.
   "Which…", "compare…" and "all…" questions list them without asking. When
   two pages give different figures for the same thing, both are shown with
   a note naming the pages. Several questions in one message are answered in
   turn; a follow-up such as "What is its price?" is read with the question
   before it.

**Files** (`server/assistant/`)

| File | Does |
| --- | --- |
| `pdf.ts` | Text extraction with PDF.js (`pdfjs-dist`), as lines with their size and spacing. |
| `passages.ts` | Headings, paragraphs, bullets and sentences; passages of about `CHAT_PASSAGE_WORDS` words that never cross a page, so page numbers are exact. Drops running headers, footers and page numbers. |
| `text.ts` | Normalising, tokenising, stop words, stemming, everyday synonyms, sentence splitting (keeps "5.3", "Rs. 499", "e.g." intact). |
| `search.ts` | The index (document frequencies, TF-IDF vector lengths, phrases, headings) and the scoring. |
| `respond.ts` | Sentence selection, duplicates, ambiguity, conflicts and the fixed messages. |
| `knowledge.ts` | The PDF manager: validates, processes and swaps in a new document; loads the current one. |
| `admin.ts`, `adminPage.ts`, `auth.ts` | `/admin` and `GET`/`POST /api/admin/document`, behind Basic authentication with a salted scrypt hash. Ten wrong passwords lock that address out for 15 minutes; uploads from other sites are refused. |
| `chatHandler.ts` | `POST /api/chat` `{ question }` → `{ status, quotes: [{ text, page, heading }], message, note, document }`. |
| `config.ts` | The settings below. |
| `../routes.ts` | Mounts the routes in the dev server (`vite.config.ts`) and the production server (`index.ts`). |

The chat window is `src/shared/components/ChatAssistant.tsx` (`chat.css`,
classes `.assist-*`), talking to `src/shared/chat/api.ts`.

**Storage and updates.** The processed document lives in `data/`
(`DATA_DIR`): `knowledge.json` (file details, the text of each page, the
passages and the search index) and `document.pdf` (a copy of the upload). The
folder is git-ignored and never served: the production server only serves
`dist/`, and the dev server answers 404 for it. An upload is extracted,
split, indexed and checked in memory first, then written beside the old files
and renamed over them, so a failed upload changes nothing and two versions
never mix. Uploads are processed one at a time. Answers are never cached, and
each question uses the document in memory, reloading it if `knowledge.json`
changed on disk. The chat keeps no history between visits.

**Settings** (`.env`, all optional)

| Variable | Default | |
| --- | --- | --- |
| `ADMIN_USERNAME` | `admin` | |
| `ADMIN_PASSWORD_HASH` | (none) | From `npm run admin:password`. `ADMIN_PASSWORD` (plain) works for local use. |
| `PDF_MAX_MB` | 10 | Largest upload. |
| `DATA_DIR` | `./data` | Never inside `dist/` or `public/`. |
| `CHAT_MIN_SCORE` | 0.3 | Raise it if unrelated passages are quoted, lower it if real answers are missed. |
| `CHAT_MIN_SENTENCE_SCORE` | 0.25 | The same for single sentences. |
| `CHAT_MAX_PASSAGES` / `CHAT_MAX_SENTENCES` | 4 / 4 | Size of one answer. |
| `CHAT_PASSAGE_WORDS` / `CHAT_PASSAGE_MAX_WORDS` | 80 / 160 | Passage length. Applies to the next upload. |
| `CHAT_RATE_PER_MINUTE` / `CHAT_RATE_PER_HOUR` | 20 / 300 | Questions per visitor. |
| `TRUST_PROXY` | off | `1` behind your own reverse proxy, so limits use `X-Forwarded-For`. |

**Tests.** `npm run test:assistant` writes sample PDFs, uploads them through
the protected endpoint and asks questions through `/api/chat`: a direct
answer returned as the single relevant sentence; different wording; prices;
specifications; model numbers with and without hyphens; answers from several
passages and two questions in one message; questions with no answer;
ambiguous questions; a replacement PDF (the old price and battery life never
come back); invalid uploads (not a PDF, damaged, no text, wrong type, too
large, from another site, no password) leaving the previous document in use;
page numbers; conflicting prices on two pages; and the sign-in lockout.

**The kid as the assistant (merger, 2026-10-26).** The owner asked for the
growth rail's kid to be the chatbot. He invites a question for a few
seconds after he lands ("Ask me about our products", also on hover), waves
when the chat opens, and bobs while it searches; his face (toddler, or the
doctor once grown up) heads the chat window. The window opens beside him:
left of the height chart on wide screens, above his badge elsewhere, full
screen on phones. Wherever the chart isn't showing (narrow screens, Product
Suite, the hero on other pages, the homepage's closing scene) the badge stays
on screen as the button. Escape closes the chat and puts focus back on him.
The header, welcome and not-found texts are the owner's wording, unchanged.

The starter guide (`npm run assistant:site-pdf`) also carries the audience
mapping (`shared/data/audiences.ts`): each audience under its own heading,
named with its products, and each product's section says who it's for, so
a question like "Which product is for surgical trainees?" finds Gaming
rather than a product that shares a word with it ("surgical").

## The 3D products

The four models are **stylised stand-ins built in code**, modelled on the
product renders, not engineering CAD. The part names (`anatomy` in
`src/pages/product-suite/data.ts`) are no longer shown on the page, which
opens the products without naming parts. They're drawn from each
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
- Who we serve / Try Demo: the audiences' "need" lines, the Gaming and
  Microscope Software Integrations descriptions and taglines, and the two photos used for Gaming (the
  hands-on session) and the integrations (the surgeon at the microscope).
- Discovery: "What we do" / "We connect clinicians, data and devices."
  ("clinicians", confirmed by the owner 2026-10-29) /
  "From the instrument to the record, in one connected line of sight." and
  the three cards' lines.
- Real theatres: "Not a render", "In real theatres, with real surgeons." and
  the four captions. Confirm consent for the people shown, and that the
  summit appearance can be named.
- Aspiration: "The dream, within reach" / "A clinician with new powers." and the
  four power lines.
- About: "Why we exist", the blueprint's About hero lines, and the two
  captions under the height chart.
- The film shows the boy striking a match; confirm that's acceptable for a
  healthcare brand.
- Growth rail: "Every doctor started small." and the height readings.

Who are you here as? (2026-10-29, third brief). Please review before launch:
- Sidekick: nothing in this project describes it. The blueprint redesign
  lists a pilot "Research Assistant" ("From your own de-identified EMR data
  to a paper, poster or slides"), and its research reel image is named
  `sidekick_before.jpg`, so Sidekick is shown as that, marked Pilot, with
  the research illustration and a Contact link. Confirm the name, the line
  and the status, and supply product imagery and a page if there is one.
- PGs: the brief suggested the Slit Lamp Module and the EMR; Gaming (the
  owner's training offering for PGs) leads, and none of the three claims a
  teaching feature. Confirm the three.
- Each product's one-line summary, and every role's question and line (the
  questions and lines are the brief's own).
- The older "Who are you?" section (`AudienceMap`, four audiences incl.
  Hospitals and OEMs, each with a next step) was removed from Home at the
  owner's request (2026-10-29), so Hospitals and OEMs no longer have a path
  on Home; they're still on Try Demo ("Who Are You?") and in the closing
  Collaborate card.

Refinement (2026-10-29, second brief). Please review before launch:
- From analog to intelligent: the eyebrow "How practice is changing", each
  stage's title, line and four tags, and the choice of images (the
  paperwork illustration, the patient dashboard, the slit-lamp analysis).
- Terminology, applied to visible copy site-wide: "AI Powered EMR" and
  "EMR" → "ChakraVue System"; doctor(s) → clinician(s); "PG Students" →
  "PGs" (audience "PGs & Surgical Trainees"); "Hospital Intelligence"
  appeared nowhere, so nothing changed for it. Where "EMR" meant any
  clinic's records software (Integrated Devices' description, the module
  diagram) it now reads "patient records", so the copy doesn't claim the
  module only feeds the ChakraVue System. Kept on purpose: the product
  names "ChakraVue Doctor App" and "ChakraVue Doctor Patient App"; the
  audience "Hospitals & Training Institutions"; internal ids
  (`ai-powered-emr`, `doctors`) and anchors, so old links still work. Text
  inside the EMR screen captures and the 3D interfaces is unchanged.
  Confirm the two product names, and the contact form's "ChakraVue System"
  interest (was "EMR Dashboard").
- The hero film now loops with no pause control (removed on request). Under
  reduced motion it stays on its poster.

Homepage restructure (2026-10-29, from the owner's notes). Please review
before launch:
- The section titles and leads of Integrated devices, the ChakraVue System,
  Surgical tools and Why ChakraVue AI, and the How it works lead line.
- Integrated devices: the generic device kinds ("Diagnostic devices",
  "Imaging systems", "Clinical instruments"). Which devices the module
  supports isn't stated anywhere yet.
- ChakraVue System: the "Clinical notes" card and the four workflow stages (taken from
  the dashboard's status tags).
- Surgical tools: "Ophthalmic surgeons and their teams, at the operating
  microscope", "It runs from a portable case beside the microscope", and
  the Research line. Add validation or studies only when they can be cited.
- Who we are (was Why ChakraVue AI): the new lead paragraph, and every card, above all Data security, Easy onboarding
  and Local data management. The notes ask for specific security and
  storage claims only where verified, so these stay general until the
  product team confirms what each product stores locally and how.
- Closing: "See a product working." / "Build it with us." and their lines.

New on the homepage. Please review before launch:
- "How it works" / "From the instrument to the decision." (above the value cards)
- The four value-card lines for Capture, Connect, Analyse and Assist
  (`valueCards` in `src/shared/data/content.ts`). The original site repeats one
  placeholder paragraph on all four.

Everything else on the homepage is existing site copy.
#   C h a k r a V u e - W e b s i t e - p l u m 
 
 