export type Service = {
  id: string;
  index: string;
  tag: string;
  title: string;
  lead: string;
  visual: "fea" | "chat";
  groups: Array<{ heading: string; items: string[] }>;
  cases?: Array<{ title: string; subtitle: string; points: string[]; outcome: string; audience: string }>;
  flow?: string[];
  note?: string;
};

/**
 * Condensed from the Biomedical FEA brief and the tobacco cessation
 * chatbot. Integrated Devices is a product and lives on Product Suite.
 */
export const services: Service[] = [
  {
    id: "biomedical-fea",
    index: "01",
    tag: "Simulation",
    title: "Biomedical Finite Element Analysis",
    lead: "Simulation-driven biomechanical assessment for dental and maxillofacial devices. We show how implants and fixation systems behave under realistic loading, so design decisions are made before physical testing.",
    visual: "fea",
    groups: [
      {
        heading: "What we deliver",
        items: [
          "3D model preparation, meshing and material assignment",
          "Realistic loading and boundary conditions",
          "Stress, strain and displacement analysis",
          "Comparative studies across design variants and load cases",
          "Engineering reports with contour plots and interpretation",
        ],
      },
    ],
    cases: [
      {
        title: "Dental implant thread design",
        subtitle: "Thread pitch, bone quality and loading",
        points: [
          "Multiple thread pitches on one standardised implant",
          "Dense and porous trabecular bone",
          "Axial and oblique loads at varying forces",
          "Crestal bone stress, implant neck stress and micromotion",
        ],
        outcome: "Which thread designs reduce bone overload and implant stress, and how bone quality and load direction change the answer.",
        audience: "Implant manufacturers, dental R&D teams, researchers",
      },
      {
        title: "Mandibular fracture fixation",
        subtitle: "Plate-and-screw systems under function",
        points: [
          "Patient-representative mandible with fracture, plate and screws",
          "Physiological boundary conditions at the condyles",
          "Bite forces and muscle loading",
          "Plate, screw and bone stress, interfragmentary motion, optional screw loosening",
        ],
        outcome: "How load crosses the fracture, where the hardware concentrates stress, and how stable the fixation is.",
        audience: "Maxillofacial device companies, surgeons, validation teams",
      },
    ],
  },
  {
    id: "tobacco-cessation",
    index: "02",
    tag: "Digital care",
    title: "Tobacco Cessation Programme",
    lead: "A conversational companion for people quitting tobacco. It learns each person's habits, cravings and triggers, and guides them through the journey, remembering what they have already shared.",
    visual: "chat",
    groups: [
      {
        heading: "Inside the programme",
        items: [
          "A structured conversation about usage, past attempts, cravings, triggers and difficulties",
          "Spoken answers transcribed to text",
          "Semantic matching that understands meaning, not exact words",
          "Context carried across the conversation",
          "Conversation history, saved presets and re-recording",
        ],
      },
    ],
    flow: ["Assessment", "Triggers", "Guidance", "Support", "Progress"],
  },
];

export const principles = [
  { title: "Repeatable method", body: "Structured, documented workflows, so every study and deployment can be reproduced and compared." },
  { title: "Clinically relevant", body: "Outputs chosen for the decisions clinicians and device teams actually have to make." },
  { title: "Clear reporting", body: "Reports written for design reviews, regulatory files and research documentation." },
];
