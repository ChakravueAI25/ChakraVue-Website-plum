import { products, type Product } from "../../pages/product-suite/data.ts";
import { interestOptions } from "../../pages/contact/data.ts";

/**
 * Who ChakraVue AI is built for, and which products serve each of them: the
 * owner's mapping (2026-10-26), the single source for Home's audience
 * section (AudienceMap.tsx), the Try Demo page and the Product Suite rows'
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
    label: "Doctors & Surgeons",
    need: "Support for their surgical, clinical and ophthalmic workflows.",
    items: [
      product("surgical-assistant", "The Surgical Assistant's live view of an eye during surgery."),
      product("slit-lamp-module", "The Slit Lamp Module's view of an eye under examination."),
    ],
  },
  {
    id: "trainees",
    label: "PG Students & Surgical Trainees",
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
        ...product("ai-powered-emr", "The AI Powered EMR's patient dashboard."),
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
