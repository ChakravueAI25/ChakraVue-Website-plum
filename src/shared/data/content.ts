export const navItems = [
  { label: "Product Suite", href: "/product-suite" },
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/about-us" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "More", href: "/privacy-policy" },
];

/**
 * The channels ChakraVue AI has been featured on (owner, 2026-10-26: NDTV,
 * and India TV, whose microphone and camera are in the AI Impact Summit
 * photos). Each logo sits on its own tile: NDTV's is its red square,
 * India TV's dark lettering needs a light one. Add a channel here only when
 * the coverage is confirmed.
 */
export type MediaLogo = { name: string; src: string; tile: "square" | "light" };

export const featuredMedia: MediaLogo[] = [
  { name: "NDTV", src: "/images/brands/ndtv.png", tile: "square" },
  { name: "India TV", src: "/images/brands/india-tv.webp", tile: "light" },
];

/** The marquee's run of logos: the channels in turn, enough to fill a wide screen. */
export const featuredLogos = Array.from({ length: 5 }, () => featuredMedia).flat();

export const clinicalCopy =
  "Medical systems generate enormous amounts of visual, clinical and operational data. ChakraVue AI connects that data to intelligent software layers that help devices understand, assist and respond within the clinical workflow.";

/** One line per stage, drawn from the product descriptions. Confirm the wording before launch. */
export const valueCards = [
  {
    step: "01",
    title: "Capture",
    body: "Imaging and readings are captured at the instrument, in full fidelity, as the examination happens.",
  },
  {
    step: "02",
    title: "Connect",
    body: "Every device feeds one secure record, so nothing is lost between the instrument and the patient file.",
  },
  {
    step: "03",
    title: "Analyse",
    body: "Intelligent software reads the data alongside the clinician and surfaces what is clinically relevant.",
  },
  {
    step: "04",
    title: "Assist",
    body: "Insight returns to the point of care: in the field of view, in the workflow, in the patient history.",
  },
];
