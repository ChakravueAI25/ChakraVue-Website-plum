import { address, contactDetails } from "../src/pages/contact/data.ts";
import { products } from "../src/pages/product-suite/data.ts";
import { platforms } from "../src/pages/product-suite/platforms.ts";
import { services } from "../src/pages/services/data.ts";

/**
 * The assistant's catalogue, built from the same data files the pages
 * render, so it can never drift from what the site shows. Nothing here is
 * invented: the site publishes no prices, stock or purchase links, and the
 * assistant is told so (see SITE_FACTS).
 */
export type CatalogItem = {
  id: string;
  kind: "Hardware product" | "Software platform" | "Service";
  name: string;
  category: string;
  summary: string;
  /** Feature lines, as published on the page. */
  details: string[];
  /** The page (and anchor) where the item is shown. */
  url: string;
};

export const catalog: CatalogItem[] = [
  ...products.map(
    (product): CatalogItem => ({
      id: product.id,
      kind: "Hardware product",
      name: product.title,
      category: product.tagline,
      summary: product.description,
      details: product.anatomy.map((part) => `Component shown on the site: ${part.label}`),
      url: `/product-suite#${product.id}`,
    }),
  ),
  ...platforms.map(
    (platform): CatalogItem => ({
      id: platform.id,
      kind: "Software platform",
      name: platform.title,
      category: platform.category,
      summary: platform.summary,
      details: [
        ...platform.features,
        ...(platform.apps ?? []).flatMap((app) => [`${app.title}: ${app.summary}`, ...app.features.map((feature) => `${app.title}: ${feature}`)]),
        ...(platform.flow ? [`Workflow: ${platform.flow.join(" → ")}`] : []),
        ...(platform.note ? [`Note: ${platform.note}`] : []),
      ],
      url: `/product-suite?platform=${platform.id}#platforms`,
    }),
  ),
  ...services.map(
    (service): CatalogItem => ({
      id: service.id,
      kind: "Service",
      name: service.title,
      category: service.tag,
      summary: service.lead,
      details: [
        ...service.groups.flatMap((group) => group.items.map((item) => `${group.heading}: ${item}`)),
        ...(service.cases ?? []).map((study) => `Case study: ${study.title} (${study.subtitle}). ${study.outcome} For: ${study.audience}.`),
        ...(service.flow ? [`Workflow: ${service.flow.join(" → ")}`] : []),
        ...(service.note ? [`Note: ${service.note}`] : []),
      ],
      url: `/services#${service.id}`,
    }),
  ),
];

/** Pages the assistant may link to besides the catalogue items. */
export const sitePages: Record<string, string> = {
  "/": "Home",
  "/product-suite": "Product Suite",
  "/services": "Services",
  "/about-us": "About Us",
  "/blog": "Blog",
  "/contact-us": "Contact Us",
};

const contactLines = contactDetails
  .filter((detail) => detail.label !== "Address")
  .map((detail) => `- ${detail.label}: ${detail.value}`);

/** Verified, site-wide facts that aren't tied to one catalogue item. */
export const SITE_FACTS = [
  "Company: ChakraVue AI Private Limited, a healthcare technology company (AI for surgery, ophthalmology, dentistry and connected care).",
  "Prices, discounts, stock levels, delivery times, warranty terms and return policies are NOT published on this website. Nothing can be bought online here; enquiries, demos and quotes go through the Contact Us page (/contact-us).",
  "Contact details:",
  ...contactLines,
  `- Office: ${address}`,
].join("\n");

/** One line per item: what the assistant always sees, so it knows the whole range. */
export function catalogIndex() {
  return catalog.map((item) => `- ${item.name} (${item.kind}; ${item.category}): ${item.url}`).join("\n");
}

/** The full record for one item, as handed to the model. */
export function describe(item: CatalogItem) {
  return [
    `<item id="${item.id}">`,
    `Name: ${item.name}`,
    `Type: ${item.kind}`,
    `Category: ${item.category}`,
    `Page: ${item.url}`,
    `Summary: ${item.summary}`,
    ...(item.details.length ? ["Details:", ...item.details.map((line) => `- ${line}`)] : []),
    "Price: not published. Availability: not published (enquire via /contact-us).",
    "</item>",
  ].join("\n");
}
