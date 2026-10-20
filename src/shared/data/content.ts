export const navItems = [
  { label: "Product Suite", href: "/product-suite" },
  { label: "Experience", href: "/experience" },
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/about-us" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact-us" },
];

/** The header's call to action (right of the nav; inside the menu on phones). */
export const experienceCta = { label: "Experience it", href: "/experience" };

export const featuredLogos = Array.from({ length: 9 }, () => ({ name: "NDTV", src: "/images/brands/ndtv.png" }));

export const clinicalCopy =
  "Every eye clinic is full of machines that see a great deal and remember nothing: the lamp the doctor looks through, the printouts from the test machines, the paper file. ChakraVue AI plugs into the equipment the clinic already trusts, so every photo and reading lands in one file that follows the patient from visit to visit.";

/** One line per stage, in plain words. Confirm the wording before launch. */
export const valueCards = [
  {
    step: "01",
    title: "Capture",
    body: "The lamp, the camera and the test machines keep a picture or a reading of every examination.",
  },
  {
    step: "02",
    title: "Connect",
    body: "Each of them sends it straight into the patient's file. No printout to lose, nothing typed in twice.",
  },
  {
    step: "03",
    title: "Analyse",
    body: "The software lays this visit beside the last one and flags what has changed.",
  },
  {
    step: "04",
    title: "Assist",
    body: "The doctor sees it all on one screen while you are in the chair, and makes the call.",
  },
];
