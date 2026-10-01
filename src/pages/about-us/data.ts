export type Leader = {
  eyebrow: string;
  title: string;
  name: string;
  role: string;
  quote: string;
  /** Head-and-shoulders portrait shown in the quote card. */
  photo: string;
  /** CSS object-position for the portrait crop; defaults to centered. */
  photoPosition?: string;
  /** Extra zoom for portraits framed with a lot of empty space; defaults to 1. */
  photoZoom?: number;
};

const photoDir = "/images/About%20us%20img";

/** Quotes are still placeholders — swap in their real words once provided. */
export const leaders: Leader[] = [
  {
    eyebrow: "Our Founder & CEO",
    title: "Here's what Dr. Ajay Chakravarthy believes.",
    name: "Dr. Ajay Chakravarthy",
    role: "Founder & CEO, ChakraVue AI",
    quote:
      "Every clinical breakthrough starts with connecting the data that already exists. ChakraVue AI exists to make that connection invisible — so devices assist, and clinicians decide.",
    photo: `${photoDir}/51b6f551-7a70-4554-ad82-f4b927c4f1a6.png`,
    photoPosition: "48% 20%",
  },
  {
    eyebrow: "Our Co-Founder",
    title: "Here's what Dr. Chitra Chakravarthy believes.",
    name: "Dr. Chitra Chakravarthy",
    role: "Co-Founder, ChakraVue AI",
    quote:
      "Great clinical software disappears into the workflow. Our job is to make every device in the room feel like it was built to work together.",
    photo: `${photoDir}/chitra-chakravarthy.png`,
    photoPosition: "50% 14%",
    photoZoom: 1.15,
  },
  {
    eyebrow: "Our Founding Executive Officer",
    title: "Here's what Sumanth Akula believes.",
    name: "Sumanth Akula",
    role: "Founding Executive Officer, ChakraVue AI",
    quote:
      "We build with clinicians in the room from day one — every model tested against how surgery actually happens, not how a demo looks.",
    photo: `${photoDir}/sumanth-akula.png`,
    photoPosition: "50% 25%",
  },
];

export type TeamMember = {
  name: string;
  role: string;
  /** Square headshot, pre-cropped so every face shares the same eye line and size. */
  photo: string;
};

const teamDir = "/images/about/team";

export const teamMembers: TeamMember[] = [
  { name: "N. Sushanth", role: "Technical Strategy Engineer", photo: `${teamDir}/n-sushanth.png` },
  { name: "Srinidhi Chintaluri", role: "Product Designer", photo: `${teamDir}/srinidhi-chintaluri.png` },
  { name: "K. Abhinay Srikanth", role: "Android Architect & Security Engineer", photo: `${teamDir}/k-abhinay-srikanth.png` },
  { name: "A. Karthikeya", role: "Business & Marketing Strategist", photo: `${teamDir}/a-karthikeya.png` },
  { name: "Ram Kashyap Isikella", role: "Product Engineer", photo: `${teamDir}/ram-kashyap-isikella.png` },
  { name: "Hrushikesh Patki", role: "Mechanical Engineer", photo: `${teamDir}/hrushikesh-patki.png` },
];
