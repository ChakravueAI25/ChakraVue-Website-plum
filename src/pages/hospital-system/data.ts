/**
 * All public copy for /hospital-system, in one file for review (COPY.md
 * lists it line by line). Plain words: "AI-assisted", "helps", "flags";
 * the doctor always decides. Never: accreditation or certification claims,
 * specs, chip, board or model names, insurer or bank names.
 *
 * DRAFT: the audience cards, the "See everything" lists and the Box cards
 * are condensed from the Milestone 1 and 2 briefs and the existing site
 * copy, not yet from CHAKRAVUE_FEATURES_FOR_WEBSITE.md (not supplied yet).
 * Replace them from its sections 1–5 when it arrives.
 */

export const hero = {
  label: "Hospital System",
  badge: "Live in a hospital today",
  title: "From registration to discharge to NABH-style registers — one system, built for Indian eye and dental hospitals.",
  primary: { label: "Join ChakraVue AI", href: "#join" },
  secondary: { label: "Book a visit", href: "/experience#visit" },
};

export type Card = { title: string; body: string };
export type Audience = { id: string; label: string; intro: string; cards: Card[]; more: string[] };

export const audiences: Audience[] = [
  {
    id: "hospital",
    label: "Hospital",
    intro: "One system for the whole visit, from the front door to the registers.",
    cards: [
      { title: "One system, door to discharge", body: "Registration, examination, surgery, billing and discharge run in one system, so no file is carried from room to room." },
      { title: "Kiosk check-in", body: "Patients check themselves in at a kiosk, and their file is open at the front desk before they reach it." },
      { title: "Called by name", body: "The waiting-room TV calls each patient by name, in turn, so the hall stays calm." },
      { title: "Billing and UPI", body: "The bill is drawn up from what was done, and the patient can pay at the counter or by UPI." },
      { title: "NABH-style registers", body: "The registers an inspection asks for are kept from the day's own work, not copied out at night." },
      { title: "Free for small clinics", body: "Small clinics and optical stores can keep their patient records in it free." },
    ],
    more: ["Built for Indian eye and dental hospitals", "Works with the equipment the hospital already owns", "Staff sign in with two-factor login"],
  },
  {
    id: "doctors",
    label: "Doctors",
    intro: "Everything about the patient on one screen, while they are in the chair.",
    cards: [
      { title: "The lamp remembers", body: "The examination lamp keeps a picture of every eye, ready to lay beside the last visit." },
      { title: "Readings arrive by themselves", body: "Test machines send their readings straight into the file; nothing is typed in twice." },
      { title: "One screen", body: "Photos, readings and notes sit together on one screen for the patient in front of you." },
      { title: "Flags what changed", body: "AI-assisted checks flag what has changed since the last visit. The doctor decides what it means." },
      { title: "Notes in a tap", body: "Common findings go in with a tap (Quick Fill), so notes take less time than writing." },
      { title: "The right patient", body: "Before an examination or surgery begins, the system confirms it is the right patient." },
    ],
    more: ["The surgical assistant helps the surgeon review and learn from recorded cases; live guidance is coming after regulatory approval"],
  },
  {
    id: "patients",
    label: "Patients",
    intro: "Less waiting, less paper, and your care in your pocket.",
    cards: [
      { title: "Check in and sit down", body: "Tap in at the kiosk and take a seat; the TV will call you by name." },
      { title: "Your records in the app", body: "Your records are in the ChakraVue app on your phone, not in a paper file." },
      { title: "Reminders", body: "The app reminds you when your next visit is due." },
      { title: "Video follow-up", body: "Your follow-up can be a video call with your doctor, from home." },
      { title: "Pay by UPI", body: "Pay your bill by UPI, at the counter or from the app." },
      { title: "Works offline", body: "The app can bring in health data from your phone, and keeps working when the signal drops." },
    ],
    more: ["Face match is used only if you agree to it"],
  },
  {
    id: "devices",
    label: "Devices",
    intro: "Nothing is thrown away. The equipment the hospital trusts simply stops forgetting.",
    cards: [
      { title: "Examination lamp", body: "The lamp every eye clinic already has gains a camera and a memory." },
      { title: "Test machines", body: "Their readings go straight into the patient's file instead of onto a slip of paper." },
      { title: "Printouts", body: "Machines that only print now send what they print into the file." },
      { title: "Surgical view", body: "The view through the surgical microscope can be recorded, for the surgeon to review and learn from." },
      { title: "Kiosk and waiting-room TV", body: "The kiosk and the waiting-room TV run on the same system as the doctors' screens." },
    ],
    more: ["No device is replaced to join the system"],
  },
];

export const safety = {
  title: "Safety and privacy, built for India's DPDP Act",
  lead: "Patient data is handled with care at every step.",
  cards: [
    { title: "Wrong-patient guard", body: "Before an examination or surgery, the system checks it has the right patient." },
    { title: "Consent-only face match", body: "Face matching is used only when the patient has agreed to it." },
    { title: "Two-factor staff login", body: "Staff sign in with a password and a second check." },
    { title: "Tamper-evident audit trail", body: "Every change to a record is logged, and the log shows if anyone tries to alter it." },
    { title: "Encrypted backups", body: "Backups are encrypted, so a lost copy can't be read." },
  ],
};

export const box = {
  label: "What's next",
  title: "Coming with the ChakraVue Box.",
  lead: "A small AI computer that runs the clinic's records inside the clinic.",
  status: "Built, not yet live",
  cards: [
    { title: "Inside the clinic", body: "A small AI computer that runs the clinic's records inside the clinic, on its own premises." },
    { title: "A key for every machine", body: "Each machine the clinic owns gets a small key that lets it talk to the Box." },
    { title: "Nothing retyped", body: "Readings travel from the machine to the patient's file without anyone copying them out." },
    { title: "Nothing lost", body: "Every photo, reading and printout lands in one record that follows the patient." },
  ],
};

/** "The Box opens" animation (BoxStory.tsx). */
export const boxStory = {
  eyebrow: "Every machine in a clinic talks. None of them talk to each other.",
  headline: "Analogue to AI.",
  sub: "The Box gives every device one language. Nothing is retyped. Nothing is lost.",
  record: "Patient record",
  alt: "Six clinic machines, each out of step, are connected by keys from one small box; their scattered papers settle into a single patient record.",
};
