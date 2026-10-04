import type { InterfaceSpec } from "./interfaceStack";

/**
 * The two product interfaces shown on the rugged cases, cut into layers
 * (rectangles in capture pixels). Both captures are cleaned before they
 * ship: chip and GPU names, performance figures, model names and internal
 * detector strings are painted out, and the on-video overlay is lifted
 * into its own transparent image so it can rise off the video.
 *
 * Layer ids that match the product's anatomy get a numbered label; the
 * rest only name the layer for the readouts and AI effects. Readouts quote
 * values already on the captured screen, nothing invented.
 */

const IMG = "/images/product-suite";

export const SURGICAL_UI: InterfaceSpec = {
  plate: `${IMG}/surgical-interface.webp`,
  size: [1600, 910],
  layers: [
    { id: "toolbar", rect: [0, 0, 1600, 71], to: [0, 0.05, 0.05], delay: 0.45 },
    { id: "controls", rect: [0, 71, 331, 781], to: [-0.035, 0, 0.1], turn: 0.22, delay: 0.5 },
    { id: "display", rect: [331, 179, 1005, 564], to: [0, 0, 0.05], delay: 0.4, labelAt: [0.9, 0.08] },
    { id: "settings", rect: [1336, 71, 264, 781], to: [0.035, 0, 0.1], turn: -0.22, delay: 0.55 },
    { id: "status", rect: [0, 852, 1600, 58], to: [0, -0.05, 0.05], delay: 0.45 },
    { id: "overlay", rect: [649, 220, 292, 340], image: `${IMG}/surgical-overlay.webp`, to: [0, 0, 0.2], delay: 0.6, labelAt: [0.95, 0.42] },
  ],
  ai: {
    eye: [797, 414],
    lock: 250,
    flows: [
      { layer: "display", at: [1280, 715] },
      { layer: "controls", at: [150, 540] },
    ],
  },
  readouts: [
    { layer: "overlay", at: [797, 360], label: "Pupil", value: "9.0 mm", card: [-150, -96] },
    { layer: "overlay", at: [891, 414], label: "White to white", value: "12.0 mm", card: [170, -40] },
    { layer: "overlay", at: [866, 300], label: "Eye rotation", value: "+1.7°", card: [150, -110] },
    { layer: "display", at: [372, 679], label: "Main incision", value: "OK", card: [-90, 80] },
  ],
};

export const SLIT_LAMP_UI: InterfaceSpec = {
  plate: `${IMG}/slit-lamp-interface.webp`,
  size: [1600, 910],
  layers: [
    { id: "patient", rect: [262, 38, 1046, 180], to: [0, 0.05, 0.06], delay: 0.45 },
    { id: "tabs", rect: [262, 220, 1046, 36], to: [0, 0.025, 0.04], delay: 0.42 },
    { id: "controls", rect: [0, 32, 258, 738], to: [-0.035, 0, 0.1], turn: 0.22, delay: 0.5 },
    { id: "display", rect: [271, 258, 1027, 595], to: [0, 0, 0.05], delay: 0.4, labelAt: [0.9, 0.08] },
    { id: "measurements", rect: [1310, 32, 290, 858], to: [0.035, 0, 0.1], turn: -0.22, delay: 0.55 },
    { id: "status", rect: [0, 888, 1600, 22], to: [0, -0.05, 0.05], delay: 0.45 },
    { id: "overlay", rect: [524, 394, 487, 393], image: `${IMG}/slit-lamp-overlay.webp`, to: [0, 0, 0.2], delay: 0.6, labelAt: [0.92, 0.5] },
  ],
  ai: {
    eye: [785, 567],
    lock: 330,
    flows: [
      { layer: "measurements", at: [1440, 540] },
      { layer: "measurements", at: [1440, 715] },
    ],
  },
  readouts: [
    { layer: "overlay", at: [785, 518], label: "Pupil", value: "2.94 mm", card: [-160, -100] },
    { layer: "overlay", at: [860, 562], label: "Pupil offset", value: "0.97 mm", card: [180, -70] },
    { layer: "overlay", at: [785, 650], label: "Cataract grade", value: "NS2 · 60%", card: [-170, 70] },
    { layer: "overlay", at: [985, 590], label: "Limbus", value: "13.02 × 9.72 mm", card: [50, 150] },
  ],
};
