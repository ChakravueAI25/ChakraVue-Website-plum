const IMG = "/images/product-suite";

export type Product = {
  id: string;
  index: string;
  /** Short name used in the hero callouts. */
  label: string;
  tagline: string;
  title: string;
  description: string;
  image: string;
  /** "photo" fills the card; "render" is a smaller cut-out from the hero shot and is shown contained. */
  imageFit: "photo" | "render";
  cta: { label: string; href: string };
  /** Top-left of the product's label baked into the hero artwork, in 1440×814 frame coordinates. */
  callout: { x: number; y: number };
  /**
   * What the 3D exploded view labels, in order (the ids match anchors in the
   * models). Drawn from each product's own description; confirm the names
   * with the product team before this ships.
   */
  anatomy: Array<{ id: string; label: string }>;
  /**
   * Has an interface to read: once the product is open the camera moves in
   * on it and quotes its readings, so the chapter runs longer.
   */
  focus?: boolean;
};

export const products: Product[] = [
  {
    id: "surgical-assistant",
    index: "01",
    label: "Digital Surgical Assistant",
    tagline: "Intraoperative visual intelligence",
    title: "Surgical Assistant",
    description:
      "A surgical assistance system that augments the surgeon’s field of view with real-time visual overlays, guidance, and procedural information while capturing structured data for surgical analysis.",
    image: `${IMG}/surgical-briefcase.webp`,
    imageFit: "photo",
    cta: { label: "Enter the system", href: "#" },
    callout: { x: 52, y: 150 },
    focus: true,
    anatomy: [
      { id: "case", label: "Rugged case" },
      { id: "display", label: "Surgical display" },
      { id: "overlay", label: "AI guidance overlay" },
      { id: "compute", label: "Compute unit" },
      { id: "controls", label: "Keyboard and touchpad" },
      { id: "io", label: "Ports" },
    ],
  },
  {
    id: "slit-lamp-module",
    index: "02",
    label: "Slit Lamp Module",
    tagline: "Intelligent ophthalmic examination",
    title: "Slit Lamp Module",
    description:
      "An intelligence module for the slit lamp that captures every examination in high fidelity, highlights clinically relevant findings in real time, and files structured records straight into the patient history.",
    image: `${IMG}/slit-lamp-case.webp`,
    imageFit: "photo",
    cta: { label: "Enter the system", href: "#" },
    callout: { x: 1172, y: 156 },
    focus: true,
    anatomy: [
      { id: "case", label: "Rugged case" },
      { id: "display", label: "Analysis display" },
      { id: "overlay", label: "AI measurement overlay" },
      { id: "compute", label: "Compute unit" },
      { id: "controls", label: "Keyboard and touchpad" },
      { id: "io", label: "Ports" },
    ],
  },
  {
    id: "ai-powered-emr",
    index: "03",
    label: "AI Powered EMR",
    tagline: "Clinical data and workflow intelligence",
    title: "AI Powered EMR",
    description:
      "An electronic medical record built around ophthalmic workflows that brings imaging, device output and clinical notes into one timeline, surfacing the insight each consultation needs.",
    image: `${IMG}/emr-case.webp`,
    imageFit: "photo",
    cta: { label: "Enter the system", href: "#" },
    callout: { x: 52, y: 522 },
    focus: true,
    anatomy: [
      { id: "case", label: "Rugged case" },
      { id: "dashboard", label: "Patient dashboard" },
      { id: "overview", label: "Patient overview" },
      { id: "details", label: "Patient details" },
      { id: "optometry", label: "Optometry" },
      { id: "examination", label: "Ophthalmic examination" },
      { id: "compute", label: "Compute unit" },
    ],
  },
  {
    id: "integrated-devices",
    index: "04",
    label: "Integrated Devices",
    tagline: "Legacy equipment, connected",
    title: "Integrated Devices",
    description:
      "A connectivity module for the equipment you already own. It captures data from existing devices over a wired or wireless link and routes it into your EMR or EHR in real time, with no replacement hardware and no manual transcription.",
    image: `${IMG}/integration-module.webp`,
    imageFit: "render",
    cta: { label: "Enter the system", href: "#" },
    callout: { x: 1197, y: 502 },
    anatomy: [
      { id: "enclosure", label: "Enclosure" },
      { id: "port", label: "Port" },
      { id: "radio", label: "Bluetooth" },
      { id: "battery", label: "Battery" },
      { id: "power", label: "Power" },
      { id: "iface", label: "Interface" },
    ],
  },
];

/** The opening statement under the Product Suite hero. */
export const suiteLines: Array<Array<string | [string]>> = [
  [["Intelligence"], ","],
  ["Engineered for the ", ["Operating Room"], "."],
];
