import { products } from "../product-suite/data";

/** Who's signing up or visiting. Shared by both forms (and the sign-up backend). */
export const roleOptions = [
  "Patient or visitor",
  "Eye doctor or resident",
  "Hospital or clinic owner",
  "Equipment maker or partner",
  "Student",
  "Investor",
];

export const hero = {
  title: "See it for yourself.",
  lead: "Two ways to experience ChakraVue AI: try it online, or come and see it working in a hospital.",
};

/** The two paths at the top of the page. */
export const paths = [
  {
    id: "online",
    tag: "Online",
    title: "Try it in your browser",
    body: "Sign in and try the products in your browser. It takes about ten minutes, and you need nothing but this screen.",
    action: { label: "Sign in or sign up", href: "#signin" },
  },
  {
    id: "in-person",
    tag: "In person",
    title: "Visit the Experience Centre",
    body: "Come to the ChakraVue Experience Centre at Spark Eye Care Hospital, Secunderabad, and see the products at work with our team.",
    action: { label: "Book a visit", href: "#visit" },
  },
];

export const signIn = {
  eyebrow: "Online",
  title: "Get your ChakraVue AI ID.",
  lead: "Tell us who you are and we'll send you a ChakraVue ID. Use it to sign in and try the products in your browser.",
  submit: "Send my ChakraVue ID",
  /** {name} and {contact} are filled in. */
  sent: "Thank you, {name}. Your ChakraVue ID is on its way to {contact}. Use it to sign in and try the products in your browser.",
};

/** Beside the sign-up form: what the ID opens. */
export const tryOnline = {
  eyebrow: "With your ID",
  title: "Try all four products in your browser.",
};

export const visit = {
  eyebrow: "In person",
  title: "Book a visit to the Experience Centre.",
  lead: "Pick a day and a time of day. We'll call you to confirm, and have the products you want to see ready when you arrive.",
  submit: "Request my visit",
  sent: "Thank you. We've received your request for {date}, {slot}. We'll call {phone} to confirm.",
  slots: ["Morning", "Afternoon"],
  /** What to see: the four products, or everything. */
  interests: [...products.map((product) => product.title), "Everything"],
};

/** Where the Experience Centre is (as supplied by the owner). */
export const centre = {
  name: "ChakraVue Experience Centre",
  host: "Spark Eye Care Hospital, Secunderabad",
  address:
    "First Floor, Vijetha Sanjeevani Apartments, Opposite Gandhi Hospital, Metro Pillar No 1034, Musheerabad, Secunderabad, Telangana 500080",
  /** Placeholder: confirm the opening hours with the owner before launch. */
  hours: "Opening hours to be confirmed",
  mapLabel: "ChakraVue Experience Centre, Spark Eye Care Hospital",
  // The building name alone is what the no-key embed geocodes precisely (see contact/data.ts).
  mapSrc: `https://maps.google.com/maps?q=${encodeURIComponent("Vijetha Sanjeevani Apartments, Musheerabad, Secunderabad, Telangana")}&z=17&output=embed`,
};

/** The closing band: what each familiar thing becomes. */
export const beforeAfter = {
  title: "Analogue to AI.",
  lead: "Nothing the clinic owns is thrown away. It just stops forgetting.",
  pairs: [
    { before: "The old slit lamp", after: "sees and remembers" },
    { before: "The paper file", after: "one living record" },
    { before: "The ECG printout", after: "straight into the file" },
  ],
};
