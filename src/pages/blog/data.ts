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
    excerpt: "Designing devices that hold up to sterilization, repeated use and the realities of a working operating room.",
    author: "Hrushikesh Patki",
    role: "Mechanical Engineer",
    initials: "HP",
  },
];
