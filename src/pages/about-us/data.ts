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
  /** Small square headshot for the hero's network of minds. */
  mind: string;
  /** Public LinkedIn profile, linked from the card. */
  linkedin?: string;
};

const mindDir = "/images/about/minds";

const linkedin = (handle: string) => `https://www.linkedin.com/in/${handle}/`;

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
    photo: `${photoDir}/51b6f551-7a70-4554-ad82-f4b927c4f1a6.webp`,
    photoPosition: "48% 20%",
    mind: `${mindDir}/ajay-chakravarthy.webp`,
    linkedin: linkedin("ajay-chakravarthy-20108876"),
  },
  {
    eyebrow: "Our Co-Founder",
    title: "Here's what Dr. Chitra Chakravarthy believes.",
    name: "Dr. Chitra Chakravarthy",
    role: "Co-Founder, ChakraVue AI",
    quote:
      "Great clinical software disappears into the workflow. Our job is to make every device in the room feel like it was built to work together.",
    photo: `${photoDir}/chitra-chakravarthy.webp`,
    photoPosition: "50% 14%",
    photoZoom: 1.15,
    mind: `${mindDir}/chitra-chakravarthy.webp`,
    linkedin: linkedin("chitra-chakravarthy-1b6930133"),
  },
  {
    eyebrow: "Our Founding Executive Officer",
    title: "Here's what Sumanth Akula believes.",
    name: "Sumanth Akula",
    role: "Founding Executive Officer, ChakraVue AI",
    quote:
      "We build with clinicians in the room from day one — every model tested against how surgery actually happens, not how a demo looks.",
    photo: `${photoDir}/sumanth-akula.webp`,
    photoPosition: "50% 25%",
    mind: `${mindDir}/sumanth-akula.webp`,
    linkedin: linkedin("sumanth-a-608267220"),
  },
];

export type TeamMember = {
  name: string;
  role: string;
  /** Square headshot, pre-cropped so every face shares the same eye line and size. */
  photo: string;
  /** The same, small, for the hero's network of minds. */
  mind: string;
  /** Public LinkedIn profile, linked from the card. */
  linkedin?: string;
};

const teamDir = "/images/about/team";

export const teamMembers: TeamMember[] = [
  { name: "N. Sushanth", role: "Technical Strategy Engineer", photo: `${teamDir}/n-sushanth.webp`, mind: `${mindDir}/n-sushanth.webp`, linkedin: linkedin("sushanth-nerella-a76348260") },
  { name: "Srinidhi Chintaluri", role: "Product Designer", photo: `${teamDir}/srinidhi-chintaluri.webp`, mind: `${mindDir}/srinidhi-chintaluri.webp`, linkedin: linkedin("srinidhi-chintaluri-2b434b222") },
  { name: "K. Abhinay Srikanth", role: "Android Architect & Security Engineer", photo: `${teamDir}/k-abhinay-srikanth.webp`, mind: `${mindDir}/k-abhinay-srikanth.webp`, linkedin: linkedin("abhinaysrikanthkhamithkar") },
  { name: "A. Karthikeya", role: "Business & Marketing Strategist", photo: `${teamDir}/a-karthikeya.webp`, mind: `${mindDir}/a-karthikeya.webp`, linkedin: linkedin("karthikeya-adula-28113a343") },
  { name: "Ram Kashyap Isikella", role: "Product Engineer", photo: `${teamDir}/ram-kashyap-isikella.webp`, mind: `${mindDir}/ram-kashyap-isikella.webp`, linkedin: linkedin("ram-kashyap-isikella-46038834b") },
  { name: "Hrushikesh Patki", role: "Mechanical Engineer", photo: `${teamDir}/hrushikesh-patki.webp`, mind: `${mindDir}/hrushikesh-patki.webp` },
];
