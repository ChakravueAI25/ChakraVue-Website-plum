# Copy register: Milestones 1 and 2

Every public sentence added or changed in "Analogue to AI" (Milestone 1)
and "Join ChakraVue AI / Hospital System" (Milestone 2), for line-by-line
approval. Tick a line, or write the replacement under it. Unchanged site
copy is not listed.

Status key: **Supplied** (wording from a brief) · **New** (written for the
milestone) · **Adapted** (from a brief, changed for the honesty rule) ·
**Draft** (condensed from the briefs and existing site copy because
CHAKRAVUE_FEATURES_FOR_WEBSITE.md hasn't been supplied yet; to be replaced
from it) · **To confirm** (a fact the owner must check).

---

## Home

### Hero (`src/pages/home/components/Hero.tsx`) — M1

| # | Where | Text | Status |
|---|---|---|---|
| H1 | Headline | Analogue to AI. | Supplied |
| H2 | Lead | We give the tools doctors already trust a new lease of life — so your eye surgeon sees more, misses less, and your records never get lost. | Supplied |
| H3 | Primary button | Experience it online | Supplied |
| H4 | Ghost button | Book a visit | Supplied |

### Product showcase (`product-suite/data.ts` `description`) — M1

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
> surgery, which the honesty rule rules out. P1 keeps the picture ("a second
> pair of trained eyes") but places it after regulatory approval. The build
> check now requires "helps the surgeon review and learn" and "coming after
> regulatory approval" to be in the bundle.
>
> **Also to review:** the Product Suite page's technical Surgical Assistant
> text (unchanged) still says "real-time visual overlays, guidance".

### Join ChakraVue AI (`shared/components/JoinChakraVue.tsx` `joinCopy`) — M2

Used on home (band), /experience#join and /hospital-system#join (page).

| # | Where | Text | Status |
|---|---|---|---|
| J1 | Eyebrow | One ChakraVue ID | New |
| J2 | Headline | Join ChakraVue AI. | Supplied |
| J3 | Lead | Get a ChakraVue ID to try the products online, book a visit, and hear when something new is live. | Supplied |
| J4 | Three points | Try the products online · Book a visit · Hear when something new is live | New (from J3) |
| J5 | Fields | Your name* · Email or phone* · Who are you?* · Referral code (optional) | Supplied |
| J6 | Placeholders | Enter your name · you@example.com or +91 … · Choose one · From a QR code or an invite | New |
| J7 | Role options | Patient or visitor · Eye doctor or resident · Hospital or clinic owner · Equipment maker or partner · Student · Investor | Supplied |
| J8 | Checkbox (on by default) | Keep me posted | Supplied |
| J9 | Button | Get my ChakraVue ID → | Supplied |
| J10 | Privacy line | Only used to send your ChakraVue ID and updates. See our Privacy Policy. | Supplied |
| J11 | Success (backend accepted only) | Thanks. Your ChakraVue ID is on its way to {contact}. We write rarely, and only when something is live. | Supplied |
| J12 | Field errors | Please enter an email address or a phone number. · That doesn't look like an email address or a phone number. | New |
| J13 | Gmail subject (no backend yet) | Join ChakraVue AI | Supplied |
| J14 | Footer line | Join ChakraVue AI → | Supplied |

### The core idea (`CoreIdea.tsx`, `shared/data/content.ts` `clinicalCopy`) — M1

| # | Where | Text | Status |
|---|---|---|---|
| C1 | Headline | We don't replace your doctor's equipment. / We give it a new lease of life. | New |
| C2 | Paragraph | Every eye clinic is full of machines that see a great deal and remember nothing: the lamp the doctor looks through, the printouts from the test machines, the paper file. ChakraVue AI plugs into the equipment the clinic already trusts, so every photo and reading lands in one file that follows the patient from visit to visit. | New |

### A day in the hospital (`HospitalDay.tsx`, `content.ts` `hospitalDay`) — M2

Replaces the Capture / Connect / Analyse / Assist cards.

| # | Where | Text | Status |
|---|---|---|---|
| D0 | Label / heading / link | A day in the hospital / Running in a hospital today. / See the hospital system → | New |
| D1 | Check in at the kiosk | You tap in at the kiosk by the door, and your file is ready before you sit down. | Step supplied, sentence new |
| D2 | Called by name | The waiting-room TV shows your name when it is your turn, so nobody has to shout. | Step supplied, sentence new |
| D3 | Examined; the lamp remembers | The doctor's lamp keeps a picture of your eye, to compare with at your next visit. | Step supplied, sentence new |
| D4 | Surgery; the right patient, confirmed | Before anything begins, the system checks that you are the patient on the list. | Step supplied, sentence new |
| D5 | Bill and pay by UPI | Your bill is ready at the counter, and you can pay it by UPI from your phone. | Step supplied, sentence new |
| D6 | Reminders and video follow-up | The ChakraVue app reminds you of your next visit, and your follow-up can be a video call. | Step supplied, sentence new |

## Header and footer

| # | Where | Text | Status |
|---|---|---|---|
| N1 | Nav | Product Suite · Experience · Hospital System · Services · About Us · Blog · Contact Us | Supplied |
| N2 | Header button / phone-menu button | Experience it | Supplied (M1) |
| N3 | Footer, under Reach us | Visit the Experience Centre → · Join ChakraVue AI → | Supplied |

"More" is gone from the nav; Privacy Policy is linked from the footer.

## Experience page (`src/pages/experience/data.ts`)

### Hero

| # | Where | Text | Status |
|---|---|---|---|
| E1 | Label / headline | Experience / See it for yourself. | Supplied |
| E2 | Lead | Two ways to experience ChakraVue AI: try it online, or come and see it working in a hospital. | New |
| E3 | Card: tag / title | Online / Try it in your browser | New |
| E4 | Card: body | Sign in and try the products in your browser. It takes about ten minutes, and you need nothing but this screen. | New |
| E5 | Card: action | Get my ChakraVue ID → | New (M2) |
| E6 | Card: tag / title | In person / Visit the Experience Centre | New |
| E7 | Card: body | See the products at work with our team at the ChakraVue Experience Centre, Spark Eye Care Hospital, Secunderabad. By invitation only, from 1 November 2026. | New (M2, invite-only) |
| E8 | Card: action | Request an invitation → | New (M2, invite-only) |

The sign-in / sign-up block is now Join ChakraVue AI (J1–J13).

### Request an invitation (was "Book a visit")

| # | Where | Text | Status |
|---|---|---|---|
| B1 | Eyebrow / heading | In person / Request an invitation to the Experience Centre. | New (invite-only) |
| B2 | Lead | The Experience Centre opens on 1 November 2026, by invitation only. Pick a day and a time of day; we'll call you to confirm your invitation, and have the products you want to see ready when you arrive. | New (invite-only) |
| B3 | Fields | Your name* · Date* (from 1 November 2026) · Time of day* (Morning / Afternoon) · Visitors* · Who are you?* · What would you like to see?* · Phone* | Supplied (plus name) |
| B4 | What to see | Surgical Assistant · Slit Lamp Module · AI Powered EMR · Integrated Devices · Everything | Supplied |
| B5 | Button | Request my invitation | New |
| B6 | Success (backend accepted only) | Thank you. We've received your request for {date}, {slot}. We'll call {phone} to confirm your invitation. | New |
| B7 | Error | Choose at least one thing to see. | New |
| B8 | Side panel | Where / ChakraVue Experience Centre / Spark Eye Care Hospital, Secunderabad | New |
| B9 | Address | First Floor, Vijetha Sanjeevani Apartments, Opposite Gandhi Hospital, Metro Pillar No 1034, Musheerabad, Secunderabad, Telangana 500080 | **To confirm** (PIN 500080 vs the office's 500003 on the Contact page) |
| B10 | Opening line | Opens 1 November 2026 · By invitation only | Supplied (owner, 2026-10-20); daily hours still to come |
| B11 | Map label | ChakraVue Experience Centre, Spark Eye Care Hospital | New |
| B12 | Gmail subject | Experience Centre invitation request: {date}, {slot} | New |

### When there is no backend yet (all forms)

| # | Text | Status |
|---|---|---|
| F1 | We've opened an email to our team in Gmail with your details. Press send there and we'll reply. Nothing is sent until you do. Open the email again | New |

### Closing band

| # | Where | Text | Status |
|---|---|---|---|
| A1 | Headline | Analogue to AI. | Supplied |
| A2 | Lead | Nothing the clinic owns is thrown away. It just stops forgetting. | New |
| A3–A5 | Pairs | The old slit lamp → sees and remembers · The paper file → one living record · The ECG printout → straight into the file | Supplied |

## Hospital System page (`src/pages/hospital-system/data.ts`) — M2

### Hero

| # | Where | Text | Status |
|---|---|---|---|
| S1 | Label | Hospital System | Supplied |
| S2 | Badge | Live in a hospital today | Supplied |
| S3 | Headline | From registration to discharge to NABH-style registers — one system, built for Indian eye and dental hospitals. | Supplied |
| S4 | Buttons | Join ChakraVue AI → · Book a visit | Supplied |
| S5 | Tabs heading | What it does, and for whom. | New |

### Audience tabs — all **Draft** until the feature document arrives

**Hospital** — intro: "One system for the whole visit, from the front door to the registers."

| # | Card | Text |
|---|---|---|
| T1 | One system, door to discharge | Registration, examination, surgery, billing and discharge run in one system, so no file is carried from room to room. |
| T2 | Kiosk check-in | Patients check themselves in at a kiosk, and their file is open at the front desk before they reach it. |
| T3 | Called by name | The waiting-room TV calls each patient by name, in turn, so the hall stays calm. |
| T4 | Billing and UPI | The bill is drawn up from what was done, and the patient can pay at the counter or by UPI. |
| T5 | NABH-style registers | The registers an inspection asks for are kept from the day's own work, not copied out at night. |
| T6 | Free for small clinics | Small clinics and optical stores can keep their patient records in it free. |
| T7 | See everything | Built for Indian eye and dental hospitals · Works with the equipment the hospital already owns · Staff sign in with two-factor login |

**Doctors** — intro: "Everything about the patient on one screen, while they are in the chair."

| # | Card | Text |
|---|---|---|
| T8 | The lamp remembers | The examination lamp keeps a picture of every eye, ready to lay beside the last visit. |
| T9 | Readings arrive by themselves | Test machines send their readings straight into the file; nothing is typed in twice. |
| T10 | One screen | Photos, readings and notes sit together on one screen for the patient in front of you. |
| T11 | Flags what changed | AI-assisted checks flag what has changed since the last visit. The doctor decides what it means. |
| T12 | Notes in a tap | Common findings go in with a tap (Quick Fill), so notes take less time than writing. |
| T13 | The right patient | Before an examination or surgery begins, the system confirms it is the right patient. |
| T14 | See everything | The surgical assistant helps the surgeon review and learn from recorded cases; live guidance is coming after regulatory approval |

**Patients** — intro: "Less waiting, less paper, and your care in your pocket."

| # | Card | Text |
|---|---|---|
| T15 | Check in and sit down | Tap in at the kiosk and take a seat; the TV will call you by name. |
| T16 | Your records in the app | Your records are in the ChakraVue app on your phone, not in a paper file. |
| T17 | Reminders | The app reminds you when your next visit is due. |
| T18 | Video follow-up | Your follow-up can be a video call with your doctor, from home. |
| T19 | Pay by UPI | Pay your bill by UPI, at the counter or from the app. |
| T20 | Works offline | The app can bring in health data from your phone, and keeps working when the signal drops. |
| T21 | See everything | Face match is used only if you agree to it |

**Devices** — intro: "Nothing is thrown away. The equipment the hospital trusts simply stops forgetting."

| # | Card | Text |
|---|---|---|
| T22 | Examination lamp | The lamp every eye clinic already has gains a camera and a memory. |
| T23 | Test machines | Their readings go straight into the patient's file instead of onto a slip of paper. |
| T24 | Printouts | Machines that only print now send what they print into the file. |
| T25 | Surgical view | The view through the surgical microscope can be recorded, for the surgeon to review and learn from. |
| T26 | Kiosk and waiting-room TV | The kiosk and the waiting-room TV run on the same system as the doctors' screens. |
| T27 | See everything | No device is replaced to join the system |

> Please check in particular: T5 (how the registers are kept), T6 (free
> tier), T12 (Quick Fill, taken from the EMR capture), T20 (offline and
> phone health data), T25 (surgical recording live in the hospital?).

### Safety and privacy, built for India's DPDP Act

| # | Card | Text | Status |
|---|---|---|---|
| Y0 | Heading / lead | Safety and privacy, built for India's DPDP Act / Patient data is handled with care at every step. | Supplied / New |
| Y1 | Wrong-patient guard | Before an examination or surgery, the system checks it has the right patient. | Title supplied, sentence new |
| Y2 | Consent-only face match | Face matching is used only when the patient has agreed to it. | Title supplied, sentence new |
| Y3 | Two-factor staff login | Staff sign in with a password and a second check. | Title supplied, sentence new |
| Y4 | Tamper-evident audit trail | Every change to a record is logged, and the log shows if anyone tries to alter it. | Title supplied, sentence new |
| Y5 | Encrypted backups | Backups are encrypted, so a lost copy can't be read. | Title supplied, sentence new |

### Coming with the ChakraVue Box

| # | Where | Text | Status |
|---|---|---|---|
| X0 | Label / heading | What's next / Coming with the ChakraVue Box. | New / Supplied |
| X1 | Lead | A small AI computer that runs the clinic's records inside the clinic. | Supplied |
| X2 | Card label (all four) | Built, not yet live | Supplied |
| X3 | Inside the clinic | A small AI computer that runs the clinic's records inside the clinic, on its own premises. | **Draft** |
| X4 | A key for every machine | Each machine the clinic owns gets a small key that lets it talk to the Box. | **Draft** |
| X5 | Nothing retyped | Readings travel from the machine to the patient's file without anyone copying them out. | **Draft** |
| X6 | Nothing lost | Every photo, reading and printout lands in one record that follows the patient. | **Draft** |

X3–X6 follow the Box story rather than the feature document's section 5,
which hasn't been supplied.

### "The Box opens" animation (`boxStory` in data.ts, labels in `boxStoryLayout.ts`)

| # | Where | Text | Status |
|---|---|---|---|
| Z1 | Eyebrow | Every machine in a clinic talks. None of them talk to each other. | Supplied |
| Z2 | Machine labels | Lamp · Test machine · Scanner · Printer · Front desk · Phone | New |
| Z3 | Record card | Patient record | New |
| Z4 | Headline | Analogue to AI. | Supplied |
| Z5 | Sub | The Box gives every device one language. Nothing is retyped. Nothing is lost. | Supplied |
| Z6 | Buttons | Replay · Sound | Supplied |
| Z7 | Screen-reader description | Six clinic machines, each out of step, are connected by keys from one small box; their scattered papers settle into a single patient record. | New |

## Product Suite — M2

| # | Where | Text | Status |
|---|---|---|---|
| Q1 | Surgical Assistant / Slit Lamp Module buttons | Try it online → (/experience) | New |
| Q2 | AI Powered EMR button | See the hospital system → (/hospital-system) | New |
| Q3 | Integrated Devices button | See the ChakraVue Box → (/hospital-system#box) | New |
| Q4 | Platforms intro | Planning and care platforms that ChakraVue AI has built alongside its devices. | Adapted ("wellness" removed) |
| Q5 | Platform 06 title / category | One ChakraVue app / EMR ecosystem · Patients and doctors | Supplied / New |
| Q6 | Platform 06 summary | One app for the care between visits: the patient's records, reminders and video consultations on their phone, joined to the hospital system. | New |
| Q7 | Platform 06 features | Records · Reminders · Video consultation · Pay by UPI · Health data from the phone · Works offline | Supplied |

ChakraVue Wellness has been removed. Tell us if it still ships and it comes back.

## Contact page — M2

| # | Where | Text | Status |
|---|---|---|---|
| K1 | "What excited you about us?" options | Surgical Assistant · Slit Lamp Module · AI Powered EMR / Hospital System · Integrated Devices · ChakraVue App · Dental Implant Planning · Partnership · Investment · Training | Supplied |
