# Copy register: "Analogue to AI" (Milestone 1)

Every public sentence added or changed in this milestone, for line-by-line
approval. Tick a line, or write the replacement under it. Unchanged site copy
is not listed.

Status key: **New** (written for this milestone) · **Supplied** (wording from
the brief) · **Adapted** (from the brief, changed for the honesty rule) ·
**To confirm** (a fact the owner must check).

---

## Home

### Hero (`src/pages/home/components/Hero.tsx`)

| # | Where | Text | Status |
|---|---|---|---|
| H1 | Headline | Analogue to AI. | Supplied |
| H2 | Lead | We give the tools doctors already trust a new lease of life — so your eye surgeon sees more, misses less, and your records never get lost. | Supplied |
| H3 | Primary button | Experience it online | Supplied |
| H4 | Ghost button | Book a visit | Supplied |

### The core idea (`CoreIdea.tsx`, `shared/data/content.ts` `clinicalCopy`)

| # | Where | Text | Status |
|---|---|---|---|
| C1 | Headline | We don't replace your doctor's equipment. / We give it a new lease of life. | New |
| C2 | Paragraph | Every eye clinic is full of machines that see a great deal and remember nothing: the lamp the doctor looks through, the printouts from the test machines, the paper file. ChakraVue AI plugs into the equipment the clinic already trusts, so every photo and reading lands in one file that follows the patient from visit to visit. | New |

### How it works (`shared/data/content.ts` `valueCards`)

| # | Stage | Text | Status |
|---|---|---|---|
| V1 | Capture | The lamp, the camera and the test machines keep a picture or a reading of every examination. | New |
| V2 | Connect | Each of them sends it straight into the patient's file. No printout to lose, nothing typed in twice. | New |
| V3 | Analyse | The software lays this visit beside the last one and flags what has changed. | New |
| V4 | Assist | The doctor sees it all on one screen while you are in the chair, and makes the call. | New |

### Product showcase (`product-suite/data.ts` `description`)

Shown on the home page. The Product Suite page keeps the technical wording
for doctors (`detail`, unchanged).

| # | Product | Text | Status |
|---|---|---|---|
| P1 | Surgical Assistant | During eye surgery it records the same view the surgeon sees, and afterwards helps the surgeon review and learn from every case. Live guidance, like a second pair of trained eyes, is coming after regulatory approval. | Adapted (see note) |
| P2 | Slit Lamp Module | It fits the examination lamp every eye clinic already has, and remembers every detail of your eye so the next visit can be compared with the last. | Supplied |
| P3 | AI Powered EMR | One file for a patient — photos, readings and the doctor's notes together — free for small clinics and optical stores. | Supplied |
| P4 | Integrated Devices | A small box that plugs into the machines a clinic already owns and sends their printouts straight into the patient's file. Nothing is thrown away. | Supplied |

> **Note on P1.** The supplied line ("watches the same view as the surgeon
> and quietly points out what to look at") reads as live guidance during
> surgery, which the honesty rule in the same brief rules out. P1 keeps the
> picture ("a second pair of trained eyes") but places it after regulatory
> approval. Please confirm.
>
> **Also to review:** the Product Suite page's technical Surgical Assistant
> text (unchanged in this milestone) still says "real-time visual overlays,
> guidance". It is aimed at doctors, but it is the same claim.

## Header and footer

| # | Where | Text | Status |
|---|---|---|---|
| N1 | Nav item (2nd) | Experience | Supplied |
| N2 | Header button / phone menu button | Experience it | Supplied |
| N3 | Footer, under Reach us | Visit the Experience Centre → | Supplied |

"More" is gone from the nav; Privacy Policy is linked from the footer.

## Experience page (`src/pages/experience/data.ts`)

### Hero

| # | Where | Text | Status |
|---|---|---|---|
| E1 | Label | Experience | New |
| E2 | Headline | See it for yourself. | Supplied |
| E3 | Lead | Two ways to experience ChakraVue AI: try it online, or come and see it working in a hospital. | New |
| E4 | Card: tag / title | Online / Try it in your browser | New |
| E5 | Card: body | Sign in and try the products in your browser. It takes about ten minutes, and you need nothing but this screen. | New |
| E6 | Card: action | Sign in or sign up → | New |
| E7 | Card: tag / title | In person / Visit the Experience Centre | New |
| E8 | Card: body | Come to the ChakraVue Experience Centre at Spark Eye Care Hospital, Secunderabad, and see the products at work with our team. | New |
| E9 | Card: action | Book a visit → | New |

### Sign in / sign up

| # | Where | Text | Status |
|---|---|---|---|
| S1 | Eyebrow / heading | Online / Get your ChakraVue AI ID. | New |
| S2 | Lead | Tell us who you are and we'll send you a ChakraVue ID. Use it to sign in and try the products in your browser. | New |
| S3 | Fields | Your name* · Email or phone* · Who are you?* · Referral code (optional) | New |
| S4 | Placeholders | Enter your name · you@example.com or +91 … · Choose one · From a QR code or an invite | New |
| S5 | Role options | Patient or visitor · Eye doctor or resident · Hospital or clinic owner · Equipment maker or partner · Student · Investor | Supplied |
| S6 | Button | Send my ChakraVue ID | New |
| S7 | Side panel | With your ID / Try all four products in your browser. (then the four product names) | New |
| S8 | Confirmation (backend accepted) | Thank you, {name}. Your ChakraVue ID is on its way to {contact}. Use it to sign in and try the products in your browser. | New |
| S9 | Field errors | Please enter an email address or a phone number. · That doesn't look like an email address or a phone number. | New |

### Book a visit

| # | Where | Text | Status |
|---|---|---|---|
| B1 | Eyebrow / heading | In person / Book a visit to the Experience Centre. | New |
| B2 | Lead | Pick a day and a time of day. We'll call you to confirm, and have the products you want to see ready when you arrive. | New |
| B3 | Fields | Your name* · Date* · Time of day* (Morning / Afternoon) · Visitors* · Who are you?* · What would you like to see?* · Phone* | Supplied (plus name) |
| B4 | What to see | Surgical Assistant · Slit Lamp Module · AI Powered EMR · Integrated Devices · Everything | Supplied |
| B5 | Button | Request my visit | New |
| B6 | Confirmation (backend accepted) | Thank you. We've received your request for {date}, {slot}. We'll call {phone} to confirm. | New |
| B7 | Error | Choose at least one thing to see. | New |
| B8 | Side panel | Where / ChakraVue Experience Centre / Spark Eye Care Hospital, Secunderabad | New |
| B9 | Address | First Floor, Vijetha Sanjeevani Apartments, Opposite Gandhi Hospital, Metro Pillar No 1034, Musheerabad, Secunderabad, Telangana 500080 | **To confirm** (supplied by the owner; PIN 500080 differs from the office's 500003 on the Contact page) |
| B10 | Hours | Opening hours to be confirmed [To confirm] | **To confirm** |
| B11 | Map label | ChakraVue Experience Centre, Spark Eye Care Hospital | New |

### When there is no backend yet (both forms)

| # | Text | Status |
|---|---|---|
| F1 | We've opened an email to our team in Gmail with your details. Press send there and we'll reply. Nothing is sent until you do. Open the email again | New |
| F2 | Email subjects: "ChakraVue AI ID request" · "Experience Centre visit request: {date}, {slot}" | New |

### Closing band

| # | Where | Text | Status |
|---|---|---|---|
| A1 | Headline | Analogue to AI. | Supplied |
| A2 | Lead | Nothing the clinic owns is thrown away. It just stops forgetting. | New |
| A3 | Pair | The old slit lamp → sees and remembers | Supplied |
| A4 | Pair | The paper file → one living record | Supplied |
| A5 | Pair | The ECG printout → straight into the file | Supplied |
