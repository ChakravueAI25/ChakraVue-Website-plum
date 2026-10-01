const EMAIL = "chakravueai@chakravue.ai";

/** Opens Gmail's own compose view instead of relying on the OS's default mail handler. */
export const gmailComposeUrl = (params: { subject?: string; body?: string } = {}) => {
  const query = new URLSearchParams({ view: "cm", fs: "1", to: EMAIL });
  if (params.subject) query.set("su", params.subject);
  if (params.body) query.set("body", params.body);
  return `https://mail.google.com/mail/?${query.toString()}`;
};

export type ContactDetail = {
  label: string;
  value: string;
  href?: string;
};

export const address =
  "ChakraVue AI Private Limited, First Floor, Vijetha Sanjeevani Apartments, Opposite Gandhi Hospital, Metro Pillar No 1034, Musheerabad, Secunderabad, Telangana 500003, India";

export const contactDetails: ContactDetail[] = [
  { label: "Call us", value: "+91 6300147979", href: "tel:+916300147979" },
  { label: "Email Us", value: EMAIL, href: gmailComposeUrl() },
  { label: "LinkedIn", value: "ChakraVue AI", href: "https://www.linkedin.com/company/chakravue-ai-pvt-ltd/" },
  { label: "Address", value: address },
];

/** The map pin sits at the real office address — labeled with the company
 *  name below instead of Google's own listing for that building, since a
 *  plain address/lat-lng query has no place name of its own to override.
 *  The full postal address (floor, "Opposite Gandhi Hospital", metro pillar
 *  number) is too much for the no-API-key embed's geocoder — it finds no
 *  match and centers on the area with no pin at all. Just the building
 *  name resolves precisely to the real "Sanjeevani Vijeta apartments"
 *  listing, directly across the road from Gandhi Hospital as described. */
export const mapLabel = "ChakraVue AI Pvt. Ltd.";
const mapAddress = "Vijetha Sanjeevani Apartments, Musheerabad, Secunderabad, Telangana 500003";
export const mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapAddress)}&z=17&output=embed`;

export const whoAreYouOptions = ["Investors", "Working Professionals", "Student", "Others"];

export const interestOptions = [
  "AI Surgical Assistant",
  "EMR Dashboard",
  "VR/AR Gaming Environment",
  "AI Powered Optical Camera",
  "Dental Solutions",
  "Partnership / Collaboration",
  "Our Future Vision",
  "Training Solutions",
  "Investment",
];
