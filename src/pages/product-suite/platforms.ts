/** A screen capture of the software; app captures carry anonymised test data only. */
export type Shot = { src: string; alt: string };

export type App = {
  title: string;
  summary: string;
  glyph: "patient" | "doctor";
  features: string[];
  shots?: Shot[];
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
  shots?: Shot[];
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
    shots: [
      { src: "/images/product-suite/dental/planner-arch.webp", alt: "The planner's segmentation view: the dental arch traced point by point on an axial slice of the patient's scan." },
      { src: "/images/product-suite/dental/planner-panoramic.webp", alt: "The panoramic view along the arch, with the right and left nerve canals traced in orange and yellow." },
      { src: "/images/product-suite/dental/planner-mpr.webp", alt: "Axial, coronal and sagittal views of the scan with a planned implant shown in each." },
    ],
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
        shots: [
          { src: "/images/product-suite/apps/doctor-call-requests.webp", alt: "The Doctor App's video call requests: each patient's request with the reason they gave." },
          { src: "/images/product-suite/apps/doctor-progress.webp", alt: "The Doctor App's drug adherence view: a patient's doses taken, day by day." },
        ],
      },
      {
        title: "ChakraVue Patient App",
        summary: "The patient's companion to their care: medicines on time, a direct line to the clinic, and simple eye checks at home.",
        glyph: "patient",
        features: ["Medicine reminders", "Video call requests", "Emergency messaging", "Eye redness and itching checks", "Amsler grid test", "Visual acuity test"],
        shots: [
          { src: "/images/product-suite/apps/patient-eye-checkin.webp", alt: "The Patient App's daily eye check-in: blurred vision, pain, redness, watering, itching and discharge, each from none to severe." },
          { src: "/images/product-suite/apps/patient-vision-tests.webp", alt: "The Patient App's vision tests: the Amsler grid and the tumbling E test, with recent results." },
          { src: "/images/product-suite/apps/patient-request-call.webp", alt: "The Patient App's call request: the patient explains their concern to their clinician." },
        ],
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
