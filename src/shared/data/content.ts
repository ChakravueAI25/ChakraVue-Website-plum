export const navItems = [
  { label: "Product Suite", href: "/product-suite" },
  { label: "Experience", href: "/experience" },
  { label: "Hospital System", href: "/hospital-system" },
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/about-us" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact-us" },
];

/** Who's signing up or visiting (Join ChakraVue AI, Book a visit, and the sign-up backend). */
export const roleOptions = [
  "Patient or visitor",
  "Eye doctor or resident",
  "Hospital or clinic owner",
  "Equipment maker or partner",
  "Student",
  "Investor",
];

/** The header's call to action (right of the nav; inside the menu on phones). */
export const experienceCta = { label: "Experience it", href: "/experience" };

export const featuredLogos = Array.from({ length: 9 }, () => ({ name: "NDTV", src: "/images/brands/ndtv.png" }));

export const clinicalCopy =
  "Every eye clinic is full of machines that see a great deal and remember nothing: the lamp the doctor looks through, the printouts from the test machines, the paper file. ChakraVue AI plugs into the equipment the clinic already trusts, so every photo and reading lands in one file that follows the patient from visit to visit.";

/** "A day in the hospital": six steps, in plain words (home page). Confirm the wording before launch. */
export const hospitalDay = [
  { step: "01", title: "Check in at the kiosk", body: "You tap in at the kiosk by the door, and your file is ready before you sit down." },
  { step: "02", title: "Called by name", body: "The waiting-room TV shows your name when it is your turn, so nobody has to shout." },
  { step: "03", title: "Examined; the lamp remembers", body: "The doctor's lamp keeps a picture of your eye, to compare with at your next visit." },
  { step: "04", title: "Surgery; the right patient, confirmed", body: "Before anything begins, the system checks that you are the patient on the list." },
  { step: "05", title: "Bill and pay by UPI", body: "Your bill is ready at the counter, and you can pay it by UPI from your phone." },
  { step: "06", title: "Reminders and video follow-up", body: "The ChakraVue app reminds you of your next visit, and your follow-up can be a video call." },
];
