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
  /** A line drawing beside the title; Dental Implant Planning has none. */
  glyph?: "bundle" | "wellness";
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
    id: "doctor-patient-app",
    index: "06",
    category: "ChakraVue System ecosystem · Clinicians & patients",
    title: "ChakraVue Doctor Patient App",
    summary: "One connected pair of apps: the clinician and the patient each have their own, and the care between visits runs through both.",
    glyph: "bundle",
    features: [],
    apps: [
      {
        title: "ChakraVue Doctor App",
        summary: "The clinician's side of the ecosystem: patient information and patient requests on a phone, not just at the desk.",
        glyph: "doctor",
        features: ["Patient information", "Drug adherence", "Submitted test results", "Patient call requests", "Video consultation"],
      },
      {
        title: "ChakraVue Patient App",
        summary: "The patient's companion to their care: medicines on time, a direct line to the clinic, and simple eye checks at home.",
        glyph: "patient",
        features: ["Medicine reminders", "Video call requests", "Emergency messaging", "Eye redness and itching checks", "Amsler grid test", "Visual acuity test"],
      },
    ],
  },
  {
    id: "wellness",
    index: "07",
    category: "Health & wellness",
    title: "ChakraVue Wellness",
    summary: "Personal health in one place: activity, vitals, rest and mindfulness, connected to the fitness apps people already use.",
    glyph: "wellness",
    features: ["Steps and heart rate", "Stress and mood", "Sleep", "Meditation and yoga", "Fitness app integration", "Offline video and audio"],
  },
];
