import { makePdf, type Block } from "./makePdf.ts";

/** A made-up three-product catalogue (version 1, then version 2 with new figures). */

function catalogue(v: { alphaPrice: string; alphaHours: number }): Block[][] {
  return [
    [
      { heading: "Product Catalogue 2026" },
      { text: "This catalogue describes the Alpha Monitor, the Beta Scanner and the Gamma Hub. All prices are in US dollars and include standard shipping." },
      { heading: "Alpha Monitor (Model AM-200)" },
      {
        text: `The Alpha Monitor supports Bluetooth 5.3 connectivity and provides up to ${v.alphaHours} hours of battery life. It supports USB-C charging. The Alpha Monitor weighs 1.2 kg and folds flat for transport.`,
      },
      { bullets: [`Price: ${v.alphaPrice}`, "Display: 15.6 inch, 1920 x 1080", "Warranty: 2 years"] },
    ],
    [
      { heading: "Beta Scanner (Model BS-310)" },
      {
        text: "The Beta Scanner captures images at 30 frames per second. Its battery lasts up to 8 hours on a single charge. It connects over Wi-Fi and Ethernet.",
      },
      { bullets: ["Price: $849", "Weight: 650 g", "Warranty: 1 year"] },
      { heading: "Gamma Hub (Model GH-5)" },
      { text: "The Gamma Hub links up to 12 devices on one network. It is powered from the mains and has no battery." },
      { bullets: ["Price: $399", "Ports: 4 Ethernet, 2 USB-C", "Warranty: 3 years"] },
    ],
    [
      { heading: "Ordering and Support" },
      {
        text: "Orders ship within 5 business days of payment. Support is available Monday to Friday, 9 am to 6 pm. Returns are accepted within 30 days of delivery, in the original packaging.",
      },
    ],
  ];
}

export const catalogueV1 = () => makePdf(catalogue({ alphaPrice: "$1,299", alphaHours: 20 }));
export const catalogueV2 = () => makePdf(catalogue({ alphaPrice: "$1,399", alphaHours: 24 }));

/** The same product priced differently on two pages. */
export const conflicting = () =>
  makePdf([
    [{ heading: "Delta Probe (Model DP-9)" }, { text: "The Delta Probe measures surface temperature to within 0.5 degrees." }, { bullets: ["Price: $250"] }],
    [{ heading: "Delta Probe (Model DP-9)" }, { text: "Updated pricing: the Delta Probe now costs $275 including the carry case." }],
  ]);
