import { products, type Product } from "../../pages/product-suite/data.ts";
import { interestOptions } from "../../pages/contact/data.ts";

/**
 * Who ChakraVue AI is built for, and which products serve each of them: the
 * owner's mapping (2026-10-26), with `roles` (Home's "Who are you here
 * as?") below, the single source for the Try Demo page and the Product Suite rows'
 * "Built for". Change the mapping here only.
 *
 * Products on the Product Suite page are referenced by id, so their names,
 * taglines, descriptions, images and links come from product-suite/data.ts.
 * Offerings without a section of their own (Gaming, the microscope
 * integrations) are written out here in the owner's words and lead to the
 * Contact page with the matching interest chosen.
 *
 * Imports keep their .ts extension: the Product Assistant's guide generator
 * (server/sitePdf.ts) reads this file under Node too.
 */

/** One card in an audience group, resolved for display. */
export type AudienceItem = {
  key: string;
  name: string;
  tagline: string;
  description: string;
  /** A thumbnail (the detailed view). */
  image: string;
  /** A larger, brighter picture of the product at work (the overview's panels). */
  cover: string;
  /** Where the panel's crop of `cover` is anchored (CSS object-position). */
  coverPosition?: string;
  imageAlt: string;
  href: string;
  /** What the link does, for the detailed view's button. */
  action: string;
  /** Where the link goes, in two words, for the overview: into the suite, or to a conversation. */
  hint: string;
};

export type Audience = {
  id: string;
  label: string;
  /** What this audience needs, in a line. */
  need: string;
  items: AudienceItem[];
};

/** A Contact page link with an interest chosen in the form (ContactForm reads `interest`). */
function contactAbout(interest: (typeof interestOptions)[number]) {
  return `/contact-us?interest=${encodeURIComponent(interest)}`;
}

function product(id: Product["id"], imageAlt: string, coverPosition?: string): AudienceItem {
  const p = products.find((candidate) => candidate.id === id);
  if (!p) throw new Error(`Unknown product "${id}" in the audience mapping`);
  return {
    key: p.id,
    name: p.label,
    tagline: p.tagline,
    description: p.description,
    image: `/images/home/products/${p.id}.webp`,
    // The product's own screen, as on the Product Suite hero.
    cover: `/images/product-suite/hero/${p.id}.webp`,
    coverPosition,
    imageAlt,
    href: `/product-suite#${p.id}`,
    action: "See it in the suite",
    hint: "In the suite",
  };
}

export const audiences: Audience[] = [
  {
    id: "doctors",
    label: "Clinicians & Surgeons",
    need: "Support for their surgical, clinical and ophthalmic workflows.",
    items: [
      product("surgical-assistant", "The Surgical Assistant's live view of an eye during surgery."),
      product("slit-lamp-module", "The Slit Lamp Module's view of an eye under examination."),
    ],
  },
  {
    id: "trainees",
    label: "PGs & Surgical Trainees",
    need: "Skill development and surgical training.",
    items: [
      {
        key: "gaming",
        name: "Gaming",
        tagline: "Gaming-based surgical training",
        description: "Supports skill development and surgical training through gaming-based experiences.",
        image: "/images/campaign/theatres/training.webp",
        cover: "/images/campaign/theatres/training.webp",
        imageAlt: "Clinicians at a hands-on session, one wearing a headset.",
        href: contactAbout("VR/AR Gaming Environment"),
        action: "Ask about Gaming",
        hint: "Talk to us",
      },
    ],
  },
  {
    id: "institutions",
    label: "Hospitals & Training Institutions",
    need: "Clinical documentation and the workflows around it.",
    items: [{
        ...product("ai-powered-emr", "The ChakraVue System's patient dashboard."),
        // The dashboard's patient cards, below its title bar (which a corner badge would cover).
        cover: "/images/campaign/audience/emr-cover.webp",
      }],
  },
  {
    id: "oems",
    label: "OEMs & Medical Device Manufacturers",
    need: "Software capabilities integrated with their microscopes.",
    items: [
      {
        key: "microscope-integrations",
        name: "Microscope Software Integrations",
        tagline: "Software for your microscopes",
        description: "Software integrations for OEMs and medical device manufacturers who want to add software capabilities to their microscopes.",
        image: "/images/campaign/theatres/surgeon.webp",
        cover: "/images/campaign/theatres/surgeon.webp",
        imageAlt: "A surgeon operating at the microscope.",
        href: contactAbout("Partnership / Collaboration"),
        action: "Talk to us about integration",
        hint: "Talk to us",
      },
    ],
  },
];

/**
 * The demo allocation declared for every product on the Try Demo page
 * (owner, 2026-10-26): 10,000 points each, per product, not a shared pool.
 * It's a stated figure only: nothing on the site tracks or spends points.
 */
export const DEMO_POINTS = 10_000;

/** One product in "Who are you here as?", with a short line drawn from its own description. */
export type RoleProduct = Omit<AudienceItem, "image" | "cover"> & {
  /** The product's picture; software platforms without one show a plain panel. */
  image?: string;
  /** "contain" for a whole app screen, shown uncropped on the panel. */
  imageFit?: "contain";
  summary: string;
  /** A stage the product is at, shown beside its name (only where it isn't released). */
  status?: string;
};

export type RoleAction = { label: string; href: string };

export type Role = {
  id: string;
  /** The audience's name on its pill. */
  label: string;
  /** The audience in the question "Are you a …?", with its article. */
  article: "a" | "an";
  noun: string;
  /** What the role gets from ChakraVue AI, in a line. */
  line: string;
  products: RoleProduct[];
  /** The role's next steps, the first one primary. */
  actions: RoleAction[];
};

const item = (key: string) => {
  const found = audiences.flatMap((a) => a.items).find((i) => i.key === key);
  if (!found) throw new Error(`Unknown audience item "${key}"`);
  return found;
};

/** Try Demo with this product's request form open (TryDemoPage reads `demo`). */
const demoOf = (key: string) => `/try-demo?demo=${encodeURIComponent(key)}`;

// Two software platforms, condensed from product-suite/platforms.ts, with screens from the software.
const implantPlanning: RoleProduct = {
  key: "implant-planning",
  name: "Dental Implant Planning",
  tagline: "Dental AI & 3D visualisation",
  description: "Patient-specific implant planning. It reconstructs the jaw in 3D, maps the nerve and warns when a planned implant comes too close.",
  summary: "Patient-specific implant planning: the jaw in 3D, the nerve mapped, and a warning when an implant comes too close.",
  image: "/images/product-suite/dental/planner-arch.webp",
  imageAlt: "The planner's segmentation view: the dental arch traced point by point on an axial slice of the patient's scan.",
  imageFit: "contain",
  href: "/product-suite#implant-planning",
  action: "Explore product",
  hint: "In the suite",
};

const doctorPatientApp: RoleProduct = {
  key: "doctor-patient-app",
  name: "ChakraVue Doctor Patient App",
  tagline: "Clinicians & patients",
  description: "One connected pair of apps: the clinician and the patient each have their own, and the care between visits runs through both.",
  summary: "A connected pair of apps for the clinician and the patient, so the care between visits runs through both.",
  image: "/images/product-suite/apps/patient-vision-tests.webp",
  imageAlt: "The Patient App's vision tests, with recent results.",
  coverPosition: "50% 0%",
  href: "/product-suite#doctor-patient-app",
  action: "Explore product",
  hint: "In the suite",
};

const surgical: RoleProduct = {
  ...item("surgical-assistant"),
  summary: "Real-time visual overlays and guidance in the surgeon's field of view, with structured data captured from every procedure.",
};
const slitLamp: RoleProduct = {
  ...item("slit-lamp-module"),
  summary: "Captures each examination, highlights relevant findings in real time and files structured records into the patient history.",
};
const system: RoleProduct = {
  ...product("ai-powered-emr", "The ChakraVue System's patient dashboard."),
  summary: "Imaging, device output and clinical notes on one timeline, built around ophthalmic workflows.",
};
const gaming: RoleProduct = {
  ...item("gaming"),
  summary: "Supports skill development and surgical training through gaming-based experiences.",
};
const integratedDevices: RoleProduct = {
  ...product("integrated-devices", "The Integrated Devices connectivity module."),
  summary: "Connects the equipment you already own and routes its data into your patient records in real time.",
};

/**
 * Home's "Who are you here as?" (RoleShowcase.tsx; eight audiences since
 * 2026-10-31): each visitor, the products most relevant to them and their
 * next steps. Products come from the mapping above, product-suite/data.ts
 * and platforms.ts; each `summary` paraphrases that product's own
 * description and claims nothing more. The distributor and OEM roles list
 * the products to ask about, not a promise that each is offered that way.
 * Add a role or a product here; the component needs no change.
 */
export const roles: Role[] = [
  {
    id: "clinicians",
    label: "Clinicians",
    article: "a",
    noun: "Clinician",
    line: "Bring clinical precision and real-time intelligence into your ophthalmic practice.",
    products: [surgical, slitLamp],
    actions: [
      { label: "Explore products", href: "/product-suite" },
      { label: "Try Demo", href: demoOf("surgical-assistant") },
    ],
  },
  {
    id: "pgs",
    label: "PGs",
    article: "a",
    noun: "PG",
    line: "Explore a smarter way to learn, understand, and work with ophthalmic clinical information.",
    products: [
      gaming,
      { ...slitLamp, summary: "Every examination captured in high fidelity, with relevant findings highlighted as they appear." },
      system,
    ],
    actions: [
      { label: "Explore training solutions", href: contactAbout("Training Solutions") },
      { label: "Try Demo", href: demoOf("slit-lamp-module") },
    ],
  },
  {
    id: "researchers",
    label: "Researchers",
    article: "a",
    noun: "Researcher",
    line: "Explore new possibilities in ophthalmic intelligence, clinical data, and AI-assisted research.",
    products: [
      {
        // The research assistant from the blueprint redesign (its art is the
        // campaign's "sidekick" scene). Confirm the description with the owner.
        key: "sidekick",
        name: "Sidekick",
        tagline: "AI-assisted research",
        description: "From your own de-identified ChakraVue System data to a paper, poster or slides.",
        summary: "From your own de-identified ChakraVue System data to a paper, poster or slides.",
        status: "Pilot",
        image: "/images/campaign/reels/research-before.webp",
        coverPosition: "50% 30%",
        imageAlt: "A researcher at a conference, notes on his lap, waiting for his turn to present.",
        href: contactAbout("Sidekick (research)"),
        action: "Ask about Sidekick",
        hint: "Talk to us",
      },
      // Its own note says it's for planning, training and research.
      implantPlanning,
    ],
    actions: [
      { label: "Explore solutions", href: "/product-suite" },
      { label: "Contact us", href: contactAbout("Sidekick (research)") },
    ],
  },
  {
    id: "oems",
    label: "OEMs",
    article: "an",
    noun: "OEM",
    line: "Add software capabilities to the microscopes and devices you build.",
    products: [{ ...item("microscope-integrations"), summary: "Software integrations for manufacturers who want to add software capabilities to their microscopes." }],
    actions: [{ label: "Explore OEM partnerships", href: contactAbout("OEM Partnership") }],
  },
  {
    id: "distributors",
    label: "Distributors",
    article: "a",
    noun: "Distributor",
    line: "Talk to us about distributing our ophthalmic products in your region.",
    products: [surgical, slitLamp],
    actions: [{ label: "Become a distributor", href: contactAbout("Distribution") }],
  },
  {
    id: "institutions",
    label: "Institutions",
    article: "an",
    noun: "Institution",
    line: "Clinical documentation, training and research tools for teaching institutions.",
    products: [system, gaming, implantPlanning],
    actions: [
      { label: "Explore solutions", href: "/product-suite" },
      { label: "Request a consultation", href: contactAbout("Training Solutions") },
    ],
  },
  {
    id: "hospitals",
    label: "Hospitals",
    article: "a",
    noun: "Hospital",
    line: "Clinical workflows, connected equipment and patient records in one place.",
    products: [system, integratedDevices, doctorPatientApp],
    actions: [
      { label: "Explore healthcare solutions", href: "/product-suite" },
      { label: "Try Demo", href: demoOf("ai-powered-emr") },
    ],
  },
  {
    id: "dental",
    label: "Dental clinicians",
    article: "a",
    noun: "Dental Clinician",
    line: "Plan implants patient by patient, with the jaw in 3D and the nerve in view.",
    products: [implantPlanning],
    actions: [
      { label: "Explore dental solutions", href: "/product-suite#implant-planning" },
      // No dental demo card on Try Demo yet: ask through Contact.
      { label: "Try Demo", href: contactAbout("Dental Solutions") },
    ],
  },
];
