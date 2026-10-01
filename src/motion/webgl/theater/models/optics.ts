import { Build, type Kit, type ProductModel } from "../kit";

/**
 * Stylised stand-in for the slit lamp, modelled from the product render.
 * The housing opens to show what the ChakraVue layer adds inside. Swap for real CAD
 * (GLB) when it exists; the engine only needs parts and anchors.
 */

/** Slit lamp with the ChakraVue capture-and-inference module fitted to its side. */
export function slitLampModule(kit: Kit): ProductModel {
  const b = new Build(kit);
  const { m } = kit;

  const table = b.put(kit.outline(kit.box(1.0, 0.08, 0.7, 0.03, m.graphite)), [0, 0.04, 0]);
  b.part(table, [0, 0, 0.42], { delay: 0.95 });

  const slider = b.put(kit.box(0.46, 0.09, 0.4, 0.04, m.shell), [0, 0.125, 0.06]);
  b.put(kit.cyl(0.014, 0.014, 0.14, m.chrome, 16), [0.16, 0.11, 0.1], slider);
  b.put(kit.sphere(0.03, m.rubber), [0.16, 0.19, 0.1], slider);
  b.part(slider, [0, 0.06, 0.62], { delay: 0.85 });

  // Patient frame: rods, forehead band, chin cup
  const frame = b.node([0, 0.08, -0.3]);
  for (const x of [-0.3, 0.3]) b.put(kit.cyl(0.02, 0.02, 1.18, m.alloy, 24), [x, 0.59, 0], frame);
  b.put(kit.box(0.64, 0.045, 0.045, 0.015, m.alloy), [0, 1.18, 0], frame);
  b.put(kit.box(0.58, 0.035, 0.035, 0.015, m.rubber), [0, 1.0, 0.02], frame);
  b.put(kit.sphere(0.07, m.rubber, Math.PI * 2, Math.PI / 2), [0, 0.72, 0.04], frame, [Math.PI, 0, 0]);
  b.part(frame, [0, 0.05, -0.52], { delay: 0.75 });

  b.put(kit.cyl(0.04, 0.05, 0.52, m.graphite), [0, 0.43, 0.06]);

  // Microscope body
  const body = b.node([0, 0.8, 0.06]);
  b.put(kit.outline(kit.box(0.2, 0.16, 0.36, 0.05, m.alloy)), [0, -0.04, 0], body);
  const cover = b.put(kit.outline(kit.box(0.2, 0.08, 0.36, 0.035, m.alloy)), [0, 0.08, 0], body);
  b.part(cover, [0, 0.44, 0], { delay: 0.15 });

  const splitter = b.put(kit.box(0.075, 0.075, 0.075, 0.006, m.glass, 2), [0, 0.02, 0], body, [0, Math.PI / 4, 0]);
  b.part(splitter, [0, 0.7, 0.1], { spin: [0.5, 0.9, 0.3], delay: 0.25 });
  b.anchor("splitter", splitter, [0.04, 0.04, 0], "right");

  const eyepieces = b.node([0, 0.08, 0.2], body, [-0.5, 0, 0]);
  for (const x of [-0.045, 0.045]) {
    b.put(kit.tube(0.03, 0.2, m.graphite), [x, 0, 0.08], eyepieces);
    b.put(kit.torus(0.032, 0.009, m.rubber), [x, 0, 0.18], eyepieces);
  }
  b.part(eyepieces, [0, 0.3, 0.46], { spin: [-0.3, 0, 0], delay: 0.4 });

  const objective = b.node([0, -0.02, -0.2], body);
  b.put(kit.outline(kit.tube(0.06, 0.1, m.graphite)), [0, 0, 0], objective);
  b.put(kit.tube(0.052, 0.012, m.lens), [0, 0, -0.055], objective);
  b.part(objective, [0, -0.06, -0.3], { delay: 0.45 });
  b.anchor("optics", objective, [0, 0.06, -0.05], "left");

  const camera = b.node([0.13, 0, 0.02], body);
  b.put(kit.cyl(0.042, 0.042, 0.13, m.graphite), [0.02, 0, 0], camera, [0, 0, Math.PI / 2]);
  b.put(kit.cyl(0.034, 0.034, 0.012, m.lens), [0.09, 0, 0], camera, [0, 0, Math.PI / 2]);
  b.put(kit.board(0.08, 0.08), [-0.055, 0, 0], camera, [0, 0, Math.PI / 2]);
  b.part(camera, [0.52, 0.18, 0.08], { delay: 0.3 });
  b.anchor("camera", camera, [0.06, 0.05, 0], "right");

  // Illumination tower: lamp housing, slit optics, mirror
  const tower = b.node([0.26, 0.5, -0.02]);
  b.put(kit.box(0.16, 0.03, 0.05, 0.012, m.graphite), [-0.08, -0.04, 0], tower);
  b.put(kit.outline(kit.box(0.06, 0.6, 0.06, 0.02, m.alloy)), [0, 0.3, 0], tower);
  b.put(kit.outline(kit.cyl(0.06, 0.06, 0.14, m.graphite)), [0, 0.67, 0], tower);
  b.put(kit.cyl(0.045, 0.045, 0.01, m.glowWarm), [0, 0.595, 0], tower);
  b.put(kit.box(0.07, 0.005, 0.07, 0.002, m.chrome, 1), [0, 0.05, -0.05], tower, [-Math.PI / 4, 0, 0]);
  b.part(tower, [0.42, 0.05, 0.05], { delay: 0.55 });
  b.anchor("illumination", tower, [0.06, 0.67, 0], "right");
  [0, 1].forEach((i) => {
    const lens = b.put(kit.cyl(0.042, 0.042, 0.01, m.lens), [0, 0.64 + i * 0.05, 0], tower);
    b.part(lens, [0, 0.3 + i * 0.14, 0], { spin: [0.5, 0, 0], delay: 0.5 });
  });

  // ChakraVue module: the cover comes away, then the AI board inside
  const module = b.node([-0.16, 0.8, 0.06]);
  b.put(kit.outline(kit.box(0.1, 0.24, 0.28, 0.03, m.shell)), [0, 0, 0], module);
  b.put(kit.cyl(0.06, 0.06, 0.006, m.slitScreen), [-0.052, 0, 0], module, [0, 0, Math.PI / 2]);
  b.put(kit.torus(0.066, 0.008, m.glow), [-0.053, 0, 0], module, [0, Math.PI / 2, 0]);
  b.part(module, [-0.52, 0.02, 0.05], { delay: 0.2 });

  const board = b.put(kit.board(0.2, 0.14), [-0.16, 0.8, 0.06], b.group, [0, 0, Math.PI / 2]);
  b.part(board, [-0.3, 0.32, 0.16], { spin: [0, 0.6, 0], delay: 0.1 });
  b.anchor("module", board, [0, 0.03, 0], "left");

  return b.finish();
}

