export type App = {
  title: string;
  summary: string;
  glyph: "patient" | "doctor";
  features: string[];
};

export type Platform = {
  id: string;
  index: string;
  category: string;
  title: string;
  summary: string;
  glyph: "implant" | "bundle" | "wellness";
  features: string[];
  flow?: string[];
  note?: string;
  /** A bundle's apps, each shown on its own within the platform. */
  apps?: App[];
};

/** Software platforms from the product development report, condensed. */
export const platforms: Platform[] = [
  {
    id: "implant-planning",
    index: "05",
    category: "Dental AI & 3D visualisation",
    title: "Dental Implant Planning",
    summary: "Patient-specific implant planning. It reconstructs the jaw in 3D, maps the nerve and warns when a planned implant comes too close.",
    glyph: "implant",
    features: [
      "3D reconstruction from patient scans",
      "Slice, panoramic and cross-section views",
      "Nerve mapping",
      "Implant library and custom models",
      "Nerve proximity warnings",
      "Facial registration and live overlay",
    ],
    flow: ["Scan", "3D", "Nerve map", "Place implant", "Clearance", "Verify"],
    note: "For planning, training and research; not a standalone clinical navigation system.",
  },
  {
    id: "chakravue-app",
    index: "06",
    category: "EMR ecosystem · Patients and doctors",
    title: "One ChakraVue app",
    summary: "One app for the care between visits: the patient's records, reminders and video consultations on their phone, joined to the hospital system.",
    glyph: "bundle",
    features: ["Records", "Reminders", "Video consultation", "Pay by UPI", "Health data from the phone", "Works offline"],
  },
];
