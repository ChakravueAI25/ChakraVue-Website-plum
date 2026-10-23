import { products } from "../product-suite/data";

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
    action: { label: "Get my ChakraVue ID", href: "#join" },
  },
  {
    id: "in-person",
    tag: "In person",
    title: "Visit the Experience Centre",
    body: "See the products at work with our team at the ChakraVue Experience Centre, Spark Eye Care Hospital, Secunderabad. By invitation only, from 1 November 2026.",
    action: { label: "Request an invitation", href: "#visit" },
  },
];

export const visit = {
  eyebrow: "In person",
  title: "Request an invitation to the Experience Centre.",
  lead: "The Experience Centre opens on 1 November 2026, by invitation only. Pick a day and a time of day; we'll call you to confirm your invitation, and have the products you want to see ready when you arrive.",
  submit: "Request my invitation",
  sent: "Thank you. We've received your request for {date}, {slot}. We'll call {phone} to confirm your invitation.",
  /** The first day visits can be booked for (yyyy-mm-dd). */
  opens: "2026-11-01",
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
  /** Supplied by the owner (2026-10-20). Daily hours are still to come. */
  hours: "Opens 1 November 2026 · By invitation only",
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
