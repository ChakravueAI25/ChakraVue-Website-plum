const IMG = "/images/product-suite";

export type Product = {
  id: string;
  index: string;
  /** Short name, used on the hero and the product rail. */
  label: string;
  tagline: string;
  title: string;
  /** Plain words a patient can picture (home page). */
  description: string;
  /** The technical description, kept for doctors on the Product Suite page. */
  detail: string;
  image: string;
  /** "photo" fills the card; "render" is a smaller cut-out from the hero shot and is shown contained. */
  imageFit: "photo" | "render";
  cta: { label: string; href: string };
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
      "During eye surgery it records the same view the surgeon sees, and afterwards helps the surgeon review and learn from every case. Live guidance, like a second pair of trained eyes, is coming after regulatory approval.",
    detail:
      "A surgical assistance system that augments the surgeon’s field of view with real-time visual overlays, guidance, and procedural information while capturing structured data for surgical analysis.",
    image: `${IMG}/surgical-briefcase.webp`,
    imageFit: "photo",
    cta: { label: "Enter the system", href: "#" },
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
      "It fits the examination lamp every eye clinic already has, and remembers every detail of your eye so the next visit can be compared with the last.",
    detail:
      "An intelligence module for the slit lamp that captures every examination in high fidelity, highlights clinically relevant findings in real time, and files structured records straight into the patient history.",
    image: `${IMG}/slit-lamp-case.webp`,
    imageFit: "photo",
    cta: { label: "Enter the system", href: "#" },
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
      "One file for a patient — photos, readings and the doctor’s notes together — free for small clinics and optical stores.",
    detail:
      "An electronic medical record built around ophthalmic workflows that brings imaging, device output and clinical notes into one timeline, surfacing the insight each consultation needs.",
    image: `${IMG}/emr-case.webp`,
    imageFit: "photo",
    cta: { label: "Enter the system", href: "#" },
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
      "A small box that plugs into the machines a clinic already owns and sends their printouts straight into the patient’s file. Nothing is thrown away.",
    detail:
      "A connectivity module for the equipment you already own. It captures data from existing devices over a wired or wireless link and routes it into your EMR or EHR in real time, with no replacement hardware and no manual transcription.",
    image: `${IMG}/integration-module.webp`,
    imageFit: "render",
    cta: { label: "Enter the system", href: "#" },
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
