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
  the top). Nav labels roll letter by letter on hover.
- **Logo marquee.** Speeds up and leans with scroll velocity, follows scroll
  direction, and slows under the pointer.
- **Footer (new).** The same on every page, kept short: Explore on the left
  (two short columns), Reach us in the middle and Office on the right, over
  the large faint mark centred behind them, then the wordmark, which rises
  letter by letter.
- **Film grain.** A faint moving grain over the glows (desktop only).
- **One typeface.** Audiowide everywhere (see Typography below).

**Home.** A company homepage built on the original design: the original
sections and art, plus the parts a company site needs (clear calls to action,
product shortcuts, the team, the latest posts). Nothing on the homepage pins;
sections animate in as they arrive. In order:
- **Hero.** The original sunset, with a live particle landscape that breathes
  and ripples under the pointer. Nothing in the hero moves with scroll. The logo, as
  supplied and never turned, is centred behind the copy, as large as fits
  between the nav and the horizon: cream glyphs deepening to amber toward the
  horizon, softer behind the words (which carry a soft shadow), with a glint
  of light travelling round the ring. Headline, one-line summary, "Explore products"
  and "Contact us", and shortcuts to the four products on the lit ground.
- **Featured in** marquee (homepage only).
- **Statement.** "Built From Experience. Guided by Science. Elevated by
  Intelligence." lights word by word as it passes, closed by "Shaping What
  Healthcare Can See, Understand, and Do." under a short rule.
- **Product suite showcase.** "Four products, one connected line of
  sight." Four dark panels, each crossed by a slit of
  light (a nod to the slit lamp) showing a sliver of its product. Opening a
  panel widens it and splits the slit into two beams that sweep apart until
  the whole product is lit. Opens on hover, click, tap or keyboard; plays by
  itself with a progress line until the visitor picks one. Product shots are
  cut from the Product Suite hero render (`public/images/home/products/`).
- **The core idea** (original).
- **How it works.** Capture → Connect → Analyse → Assist on one line; a signal
  of light travels through the stages as you scroll and lights each one.
- **Team.** The three leaders and the wider team, linking to About.
- **Blog.** The three latest posts, linking to the blog.

**Product Suite**
- The hero opens outward from the ChakraVue ring, with data pulses travelling
  along each device's leader line into the ring.
- Hovering a product spotlights it.
- "Intelligence, Engineered for the Operating Room." follows the hero as a
  compact band that lights as it passes (not pinned).
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
    Solid/Mesh and axial/oblique load. The SVG drawings are the fallback.
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

**3D products.** Surgical Assistant is a carry case beside a microscope
(`models/briefcase.ts`): the lid opens onto the surgical display, the compute
unit lifts out, and data runs along the cable from the microscope. Integrated
Devices is the connectivity module (`models/module.ts`). The homepage shots
and fallback images are renders of these models.

**Confidentiality.** Public copy and the exploded-view labels name parts only
generically (Port, Battery, Bluetooth, Compute unit…): no part numbers,
ratings, chipsets or security implementation details. Keep it that way when
adding products.

**About**
- The hero is the statement "The Technology Is Only as Strong as the Minds
  Behind It." over a live network of minds (`about-us/components/minds.ts`):
  points drift, link up and pass signals; the pointer draws the nearest ones
  together.
- Leader cards swing in, with the portrait wiping up inside them.
- The team portraits pop in.

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
  webgl/dataHorizon.ts home hero particle landscape
  webgl/theater/       3D products: engine.ts (stage + inline modes),
                       kit.ts (materials, explode parts), models/*.ts, textures.ts
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
  shaders (`theme/grade.ts`), and decorative renders take it as an SVG
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

The whole site is set in Audiowide. The stylesheets still use role tokens
(`--font-display`, `--font-body`, `--font-nav`, `--font-ui` in
`src/styles/global.css`), and they now all point to Audiowide. To bring the
original mix back:
1. Set `--font-body` and `--font-nav` to `"Inria Serif", Georgia, serif` and
   `--font-ui` to `"Montserrat", "Segoe UI", Arial, sans-serif`.
2. Put those families back in the Google Fonts `@import` at the top of that file.
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