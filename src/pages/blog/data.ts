export type Post = {
  slug: string;
  date: string;
  tag: string;
  title: string;
  excerpt: string;
  author: string;
  role: string;
  /** Shown in the avatar circle and on the card art until real photos/cover images exist. */
  initials: string;
};

/** Article text is still placeholder copy — swap in the real posts when they're written. */
export const featuredPost: Post = {
  slug: "ai-reshaping-ophthalmic-surgery",
  date: "Sep 2026",
  tag: "Clinical AI",
  title: "How AI Is Reshaping Ophthalmic Surgery",
  excerpt:
    "From real-time surgical assistance to predictive clinical insight, AI is becoming a genuine partner in the operating room — not a replacement for the surgeon, but an extension of what they can see and decide.",
  author: "Dr. Ajay Chakravarthy",
  role: "Founder & CEO",
  initials: "AC",
};

export const posts: Post[] = [
  {
    slug: "common-language-for-devices",
    date: "Sep 2026",
    tag: "Product",
    title: "Why Devices Need a Common Language",
    excerpt: "Every surgical suite runs a different mix of hardware. Here's how we're building one platform that speaks to all of it.",
    author: "N. Sushanth",
    role: "Technical Strategy Engineer",
    initials: "NS",
  },
  {
    slug: "designing-software-clinicians-trust",
    date: "Aug 2026",
    tag: "Design",
    title: "Designing Clinical Software Clinicians Actually Trust",
    excerpt: "Trust in the OR is earned in milliseconds. Notes from designing interfaces for high-stakes, high-speed decisions.",
    author: "Srinidhi Chintaluri",
    role: "Product Designer",
    initials: "SC",
  },
  {
    slug: "securing-patient-data",
    date: "Aug 2026",
    tag: "Security",
    title: "Securing Patient Data on Every Connected Device",
    excerpt: "As more devices join the network, the attack surface grows. Here's our approach to securing the whole chain.",
    author: "K. Abhinay Srikanth",
    role: "Android Architect & Security Engineer",
    initials: "KS",
  },
  {
    slug: "ai-diagnostics-every-clinic",
    date: "Jul 2026",
    tag: "Strategy",
    title: "Bringing AI Diagnostics to Every Clinic",
    excerpt: "Advanced diagnostics shouldn't be limited to flagship hospitals. Our roadmap for reaching clinics of every size.",
    author: "A. Karthikeya",
    role: "Business & Marketing Strategist",
    initials: "AK",
  },
  {
    slug: "prototype-to-operating-room",
    date: "Jul 2026",
    tag: "Engineering",
    title: "From Prototype to Operating Room",
    excerpt: "What it actually takes to move a working prototype through validation and into a live surgical environment.",
    author: "Ram Kashyap Isikella",
    role: "Product Engineer",
    initials: "RI",
  },
  {
    slug: "hardware-for-the-sterile-field",
    date: "Jun 2026",
    tag: "Hardware",
    title: "Engineering Hardware for the Sterile Field",
    excerpt: "Designing devices that hold up to sterilisation, repeated use and the realities of a working operating room.",
    author: "Hrushikesh Patki",
    role: "Mechanical Engineer",
    initials: "HP",
  },
];

/**
 * ChakraVue AI in the media: the AI Impact Summit 2026, from the post on the
 * live site (chakravue.ai/blog-page). Only what that post says; the channels
 * are the ones in shared/data/content.ts (`featuredMedia`).
 */
export const mediaAppearance = {
  eyebrow: "In the media",
  event: "AI Impact Summit 2026",
  place: "New Delhi",
  dates: "16–21 February 2026",
  title: "ChakraVue AI Showcases the Future of Real-Time Surgical Intelligence",
  summary:
    "At the AI Impact Summit 2026 in New Delhi, ChakraVue AI presented its Real-Time Surgical Assistant for Ophthalmology to innovators, clinicians, investors and technology leaders, with live demonstrations at its stall throughout the summit.",
  shown: [
    "Real-time surgical step recognition",
    "AI visual overlays during procedures",
    "Surgeon Performance Scoring (SPS) framework",
    "Data-driven analytics for surgical performance and training",
  ],
  coverage:
    "A key highlight was strong media engagement: ChakraVue AI took part in several television and digital media interviews, bringing attention to AI-assisted surgery and what it can mean for surgical safety, training and outcomes.",
  outcome:
    "The summit widened ChakraVue AI's network across healthcare and technology, opened early talks on clinical collaborations, pilot deployments and technology partnerships, and raised its national profile in AI-assisted surgery.",
  photos: [
    { src: "/images/media/summit-interview.webp", alt: "A television reporter with an India TV microphone interviewing at the ChakraVue AI stall." },
    { src: "/images/media/summit-interview-crew.webp", alt: "A camera crew filming the Surgical Assistant demonstration at the stall." },
    { src: "/images/media/summit-team.webp", alt: "The ChakraVue AI team at its stall at the summit." },
  ],
};

/**
 * The Salem visit (owner's photographs, 2026-10-31): the dental implant
 * planning platform at Vinayaka Mission's Research Foundation. What was
 * shown follows the planner's knowledge-transfer document; no date was
 * supplied, so none is shown.
 */
export const salemVisit = {
  eyebrow: "Field visit",
  event: "Vinayaka Mission's Research Foundation",
  place: "Salem",
  title: "Dental Implant Planning, Shown in Salem",
  summary:
    "At Vinayaka Mission's Research Foundation in Salem, the ChakraVue AI team presented its dental implant planning platform: a session on reading dental imaging, and hands-on time with the plan in an XR headset.",
  shown: [
    "3D reconstruction from patient CBCT scans",
    "Panoramic and cross-section views of the jaw",
    "Nerve mapping and implant placement",
    "Implant-to-nerve clearance review",
    "The plan viewed in an XR headset",
  ],
  note: "For planning, training and research; not a standalone clinical navigation system.",
  photos: [
    { src: "/images/blog/salem-session.webp", alt: "The ChakraVue AI team in XR headsets during the dental imaging session at Vinayaka Mission's Research Foundation, Salem." },
    { src: "/images/blog/salem-lecture.webp", alt: "A presenter walking the audience through dental imaging on the screen at the Salem session." },
  ],
};
