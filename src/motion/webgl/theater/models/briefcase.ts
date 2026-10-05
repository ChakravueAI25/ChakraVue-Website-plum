import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Build, partProgress, type Focus, type Kit, type ProductModel, type V3 } from "../kit";
import * as tex from "../textures";
import { computeUnit, MM } from "./computeUnit";
import { interfaceSpider } from "./interfaceSpider";
import { interfaceStack, type Presentation } from "./interfaceStack";
import { EMR_UI, SLIT_LAMP_UI, SURGICAL_UI } from "./interfaces";

// Shell (scene units: about 1 unit = 34 cm).
const W = 1.5;
const D = 1.04;
const BASE_H = 0.33;
const DECK = 0.3;
const LID_H = 0.13;
const R = 0.075;
const BEV = 0.012;
const WALL = 0.05;
/** Lid open angle: just past upright, as the case stands in the reference photograph. */
const OPEN = 1.75;
/** How far the whole case sits forward of the turntable axis. */
const SHIFT = 0.16;
// The faceplates that fill the base and the lid inside the rim.
const H = 0.695;
const V = 0.465;

/** A rounded rectangle centred on the origin. */
function roundedRect(w: number, h: number, r: number, path: THREE.Shape | THREE.Path = new THREE.Shape()) {
  const x = -w / 2;
  const y = -h / 2;
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  path.lineTo(x + w, y + h - r);
  path.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  path.lineTo(x + r, y + h);
  path.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  path.lineTo(x, y + r);
  path.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return path;
}

/**
 * The system in a rugged field case, open as it is used. The lid carries
 * the display running the product's interface, framed by a port strip and
 * status windows; the base carries the instrument strip, the compute unit,
 * a network switch and the keyboard with touchpad.
 *
 * Exploded, the lid tips back and the interface lifts out of the display
 * as a stack of layers that gathers in front of the case, facing the viewer
 * (`interfaceStack`); the keyboard slides out, and the compute unit moves
 * out to the side, enlarged and turned to the viewer, with its heatsink
 * rising off the module. Data runs along the display cable.
 *
 * The Surgical Assistant, the Slit Lamp Module and the AI Powered EMR ship
 * in the same case and differ in the interface they run: the first two as
 * a stack of layers, the EMR as a spider of screens (`interfaceSpider`).
 */
export const surgicalBriefcase = (kit: Kit) => ruggedCase(kit, (b, display) => interfaceStack(b, SURGICAL_UI, display, SCREEN_W, SCREEN_AT, STACK));
export const slitLampCase = (kit: Kit) => ruggedCase(kit, (b, display) => interfaceStack(b, SLIT_LAMP_UI, display, SCREEN_W, SCREEN_AT, STACK));
export const emrCase = (kit: Kit) => ruggedCase(kit, (b, display) => interfaceSpider(b, EMR_UI, display, SCREEN_W, SCREEN_AT, SPIDER));

/** The screen on the display: its width and where it sits. */
const SCREEN_W = 0.97;
const SCREEN_AT: V3 = [0, 0, 0.0245];
/**
 * Where an exploded interface gathers: the stack in front of and above the
 * case; the spider, which spreads wider, above the open lid, clear of the
 * case and the compute unit.
 */
const STACK: Presentation = { position: [0.1, 1.04, 0.4], scale: 1.85, tilt: 0.3 };
const SPIDER: Presentation = { position: [0.05, 1.62, 0], scale: 1.3, tilt: 0.3 };

/** The interface a case runs, built onto its display. */
type CaseScreen = { focus: Focus; update(explode: number, time: number, focus: number): void; layout?(tall: boolean): void };

function ruggedCase(kit: Kit, screenOn: (b: Build, display: THREE.Object3D) => CaseScreen): ProductModel {
  const b = new Build(kit);
  const { m } = kit;
  const clip = m.shell.clippingPlanes;
  const own = <T extends THREE.Material>(material: T) => {
    material.clippingPlanes = clip;
    return kit.own(material);
  };
  const basic = (hex: string, strength = 1) => own(new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(strength), toneMapped: false }));
  const screenOf = (map: THREE.Texture, strength = 1) => own(new THREE.MeshBasicMaterial({ map: kit.own(map), color: new THREE.Color(strength, strength, strength), toneMapped: false }));

  const shell = own(new THREE.MeshPhysicalMaterial({ color: "#1b1d21", metalness: 0.15, roughness: 0.6, clearcoat: 0.25, clearcoatRoughness: 0.55 }));
  const grip = own(new THREE.MeshStandardMaterial({ color: "#4a4d53", roughness: 0.82, metalness: 0 }));
  const plateOf = (modules: tex.PanelModule[]) => own(new THREE.MeshPhysicalMaterial({ map: kit.own(tex.faceplate(H * 2, V * 2, modules)), metalness: 0.5, roughness: 0.42 }));
  const steel = own(new THREE.MeshPhysicalMaterial({ color: "#a9adb4", roughness: 0.32, metalness: 1 }));
  const hole = basic("#040405");
  // Smoked windows: glossy, but never a mirror for the studio light when the lid tips back.
  const smoked = own(new THREE.MeshPhysicalMaterial({ color: "#060708", metalness: 0.2, roughness: 0.2, clearcoat: 0.5, clearcoatRoughness: 0.3, envMapIntensity: 0.35 }));
  const housing = own(new THREE.MeshPhysicalMaterial({ color: "#2a2d33", metalness: 0.6, roughness: 0.4 }));
  const deckBody = own(new THREE.MeshStandardMaterial({ color: "#2b2d32", roughness: 0.55, metalness: 0.1 }));
  const keycap = own(new THREE.MeshPhysicalMaterial({ color: "#232529", roughness: 0.48, metalness: 0.05, clearcoat: 0.2 }));
  const pad = own(new THREE.MeshPhysicalMaterial({ color: "#1d1f23", roughness: 0.3, clearcoat: 0.5 }));
  const pale = own(new THREE.MeshPhysicalMaterial({ color: "#8e9196", metalness: 0.3, roughness: 0.45 }));
  const white = own(new THREE.MeshStandardMaterial({ color: "#b9b8b4", roughness: 0.55 }));
  const blue = own(new THREE.MeshStandardMaterial({ color: "#2f6fd6", roughness: 0.45 }));
  const strip = basic("#ff8b12", 0.95);
  const rocker = basic("#ff4a1f", 1.25);
  const green = basic("#46ff7a", 1.3);


  /** A slab of the shell's outline between two heights, optionally with an opening through it. */
  const slab = (w: number, d: number, r: number, y0: number, y1: number, opening?: [number, number, number]) => {
    const shape = roundedRect(w - 2 * BEV, d - 2 * BEV, r - BEV) as THREE.Shape;
    if (opening) shape.holes.push(roundedRect(opening[0] + 2 * BEV, opening[1] + 2 * BEV, opening[2] + BEV, new THREE.Path()));
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0 - 2 * BEV, bevelEnabled: true, bevelSize: BEV, bevelThickness: BEV, bevelSegments: 3, curveSegments: 10 });
    geometry.rotateX(-Math.PI / 2).translate(0, y0 + BEV, 0);
    return new THREE.Mesh(kit.own(geometry), shell);
  };

  /** Screw heads at the corners of each panel module. */
  const screwsFor = (modules: tex.PanelModule[], place: (u: number, v: number) => V3, r: V3) =>
    kit.instanced(
      new THREE.CylinderGeometry(0.0075, 0.0075, 0.004, 14),
      m.alloy,
      modules.flatMap(([u0, v0, u1, v1]) =>
        [
          [u0 + 0.018, v0 + 0.018],
          [u1 - 0.018, v0 + 0.018],
          [u0 + 0.018, v1 - 0.018],
          [u1 - 0.018, v1 - 0.018],
        ].map(([u, v]) => ({ p: place(u, v), r })),
      ),
    );

  // --- The base ---------------------------------------------------------------
  const base = b.node([0, 0, 0]);
  b.put(kit.outline(slab(W, D, R, 0, DECK - 0.01)), [0, 0, 0], base);
  b.put(slab(W, D, R, DECK - 0.04, BASE_H, [W - 2 * WALL, D - 2 * WALL, R - WALL]), [0, 0, 0], base);
  // The raised lip the lid closes onto.
  b.put(slab(W + 0.024, D + 0.024, R + 0.012, BASE_H - 0.06, BASE_H - 0.024, [W - 0.06, D - 0.06, R - 0.03]), [0, 0, 0], base);
  for (const x of [-1, 1]) for (const z of [-0.3, 0.3]) b.put(kit.box(0.014, 0.18, 0.04, 0.007, shell, 2), [x * (W / 2 + 0.004), 0.15, z], base);

  // Front: two latches hanging open, padlock tabs, the folded carry handle, the pressure valve.
  for (const x of [-0.42, 0.42]) {
    const latch = b.node([x, BASE_H - 0.02, D / 2 + 0.006], base, [-0.1, 0, 0]);
    b.put(kit.box(0.17, 0.13, 0.032, 0.012, shell, 2), [0, -0.065, 0.016], latch);
    for (const y of [-0.098, -0.114]) b.put(kit.box(0.13, 0.007, 0.008, 0.003, shell, 1), [0, y, 0.034], latch);
    b.put(kit.cyl(0.01, 0.01, 0.19, m.alloy, 16), [0, 0, 0.012], latch, [0, 0, Math.PI / 2]);
    b.put(kit.box(0.035, 0.05, 0.03, 0.008, shell, 1), [x * 0.57, BASE_H - 0.07, D / 2 + 0.012], base);
  }
  for (const x of [-0.2, 0.2]) b.put(kit.box(0.06, 0.07, 0.045, 0.015, shell, 2), [x, 0.17, D / 2 + 0.018], base);
  b.put(kit.box(0.36, 0.05, 0.05, 0.022, grip, 3), [0, 0.13, D / 2 + 0.04], base);
  b.put(kit.cyl(0.032, 0.032, 0.02, m.graphite, 32), [0.62, 0.17, D / 2 + 0.01], base, [Math.PI / 2, 0, 0]);
  b.put(kit.cyl(0.021, 0.021, 0.026, shell, 24), [0.62, 0.17, D / 2 + 0.012], base, [Math.PI / 2, 0, 0]);

  // Back: the long hinge.
  b.put(kit.cyl(0.008, 0.008, W - 0.16, m.alloy, 12), [0, BASE_H - 0.004, -D / 2 - 0.016], base, [0, 0, Math.PI / 2]);
  for (let x = -0.6; x <= 0.61; x += 0.2) b.put(kit.cyl(0.022, 0.022, 0.15, shell, 24), [x, BASE_H - 0.004, -D / 2 - 0.016], base, [0, 0, Math.PI / 2]);
  b.anchor("case", base, [-0.5, 0.16, D / 2 + 0.02], "left");

  // --- The deck: instrument strip at the back, keyboard in front -----------------
  const deck = b.node([0, DECK, 0]);
  const deckModules: Array<[number, number, number, number]> = [
    [-H, -V, -0.52, -0.155],
    [-0.52, -V, -0.29, -0.155],
    [-0.29, -V, -0.07, -0.155],
    [-0.07, -V, 0.31, -0.155],
    [0.31, -V, 0.43, -0.155],
    [0.43, -V, H, -0.155],
    [-H, -0.155, 0.6, V],
    [0.6, -0.155, H, V],
  ];
  // Panel modules as [left, bottom, right, top] with +v towards the back (the texture's top edge).
  const deckPanels = deckModules.map(([x0, z0, x1, z1]): tex.PanelModule => [x0, -z1, x1, -z0]);
  b.put(new THREE.Mesh(kit.own(new THREE.BoxGeometry(H * 2, 0.01, V * 2)), plateOf(deckPanels)), [0, -0.005, 0], deck);
  deck.add(screwsFor(deckPanels, (u, v) => [u, 0.002, -v], [0, 0, 0]));

  // Power: fuse holder, lit rocker, toggle.
  b.put(kit.cyl(0.022, 0.022, 0.016, shell, 28), [-0.607, 0.008, -0.39], deck);
  b.put(kit.cyl(0.014, 0.014, 0.008, m.graphite, 24), [-0.607, 0.02, -0.39], deck);
  b.put(kit.box(0.05, 0.012, 0.075, 0.004, m.graphite, 1), [-0.607, 0.006, -0.29], deck);
  b.put(kit.box(0.038, 0.014, 0.06, 0.005, rocker, 1), [-0.607, 0.014, -0.29], deck, [0.14, 0, 0]);
  b.put(kit.cyl(0.012, 0.012, 0.006, m.alloy, 6), [-0.607, 0.003, -0.205], deck);
  b.put(kit.cyl(0.004, 0.005, 0.03, m.chrome, 12), [-0.607, 0.018, -0.2], deck, [0.35, 0, 0]);

  // Panel meter and three status windows.
  b.put(kit.box(0.19, 0.016, 0.13, 0.008, m.graphite, 2), [-0.405, 0.008, -0.335], deck);
  b.put(kit.plane(0.16, 0.095, screenOf(tex.lcdMeter(), 0.9)), [-0.405, 0.0165, -0.34], deck, [-Math.PI / 2, 0, 0]);
  for (const x of [-0.44, -0.37]) b.put(kit.cyl(0.011, 0.011, 0.01, blue, 20), [x, 0.005, -0.22], deck);
  const amberSegments = screenOf(tex.segmentWindow("#ff8b12"), 1.25);
  const warmSegments = screenOf(tex.segmentWindow("#ffc27a"), 1.1);
  for (let i = 0; i < 3; i++) {
    const z = -0.4 + i * 0.075;
    b.put(kit.box(0.15, 0.012, 0.055, 0.005, m.graphite, 1), [-0.18, 0.006, z], deck);
    b.put(kit.plane(0.13, 0.04, i === 1 ? warmSegments : amberSegments), [-0.18, 0.0125, z], deck, [-Math.PI / 2, 0, 0]);
  }

  // The compute unit, on standoffs in its bay.
  const unitAt: V3 = [0.12, 0.012 + 8.6 * MM, -0.31];
  for (const [dx, dz] of [[-0.15, -0.12], [0.15, -0.12], [-0.15, 0.12], [0.15, 0.12]]) b.put(kit.cyl(0.008, 0.008, 0.012, m.alloy, 12), [unitAt[0] + dx, 0.006, unitAt[2] + dz], deck);
  const unit = computeUnit(b, kit, own, deck, unitAt);
  const UNIT_DELAY = 0.5;
  // Forward, over the keyboard, to stand off the front corner below the interface stack.
  b.part(unit.group, [0.62, 0.12, 1.15], { spin: [0.3, -0.35, 0], delay: UNIT_DELAY });
  b.part(unit.heatsink, [0, 22, 0], { delay: 0.85 });
  b.anchor("compute", unit.group, [34, 8, 30], "right");

  // Trackball and a pair of USB ports.
  b.put(kit.cyl(0.045, 0.045, 0.01, m.graphite, 40), [0.37, 0.005, -0.36], deck);
  b.put(kit.sphere(0.036, m.rubber, Math.PI * 2, Math.PI / 2), [0.37, 0.008, -0.36], deck);
  for (const x of [0.35, 0.39]) {
    b.put(kit.box(0.03, 0.006, 0.014, 0.002, steel, 1), [x, 0.003, -0.22], deck);
    b.put(kit.box(0.024, 0.002, 0.007, 0.0008, hole, 1), [x, 0.0062, -0.22], deck);
  }

  // Network switch, ports facing forward.
  const network = b.node([0.565, 0, -0.33], deck);
  b.put(kit.outline(kit.box(0.22, 0.05, 0.15, 0.008, housing, 2)), [0, 0.025, 0], network);
  b.put(kit.box(0.12, 0.002, 0.06, 0.001, m.graphite, 1), [0, 0.0505, -0.02], network);
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.04;
    b.put(kit.box(0.032, 0.026, 0.004, 0.002, steel, 1), [x, 0.021, 0.075], network);
    b.put(kit.box(0.026, 0.02, 0.004, 0.002, hole, 1), [x, 0.021, 0.0765], network);
    b.put(kit.box(0.006, 0.004, 0.002, 0.001, i % 2 ? green : m.glowWarm, 1), [x, 0.041, 0.076], network);
  }

  // Side panel: line ports, a USB port and a status light.
  for (const z of [-0.08, -0.03]) {
    b.put(kit.box(0.036, 0.006, 0.03, 0.002, steel, 1), [0.6475, 0.003, z], deck);
    b.put(kit.box(0.028, 0.002, 0.022, 0.001, hole, 1), [0.6475, 0.0062, z], deck);
  }
  b.put(kit.box(0.03, 0.006, 0.016, 0.002, steel, 1), [0.6475, 0.003, 0.12], deck);
  b.put(kit.box(0.024, 0.002, 0.008, 0.001, blue, 1), [0.6475, 0.0062, 0.12], deck);
  b.put(kit.cyl(0.005, 0.005, 0.004, green, 12), [0.6475, 0.002, 0.2], deck);
  // Labelled here rather than on the lid, which the interface covers when exploded.
  b.anchor("io", deck, [0.6475, 0.008, -0.055], "right");

  // Keyboard with touchpad.
  const keyboard = b.node([-0.04, 0, 0.17], deck);
  b.put(kit.outline(kit.box(1.2, 0.024, 0.46, 0.014, deckBody, 3)), [0, 0.012, 0], keyboard);
  const U = 0.058;
  const keys: Array<{ p: V3; s: V3 }> = [];
  const row = (z: number, depth: number, widths: number[], skipFirst = false) => {
    let x = -0.58;
    widths.forEach((w, i) => {
      if (!(skipFirst && i === 0)) keys.push({ p: [x + (w * U) / 2, 0.031, z], s: [w * U - 0.008, 0.014, depth] });
      x += w * U;
    });
  };
  row(-0.19, 0.032, Array(15).fill(1), true);
  row(-0.128, 0.056, [...Array(13).fill(1), 2]);
  row(-0.062, 0.056, [1.5, ...Array(12).fill(1), 1.5]);
  row(0.004, 0.056, [1.75, ...Array(11).fill(1), 2.25]);
  row(0.07, 0.056, [2.25, ...Array(10).fill(1), 2.75]);
  row(0.136, 0.056, [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25]);
  keyboard.add(kit.instanced(new RoundedBoxGeometry(1, 1, 1, 2, 0.22), keycap, keys));
  b.put(kit.cyl(0.012, 0.012, 0.006, m.glowWarm, 24), [-0.58 + U / 2, 0.027, -0.19], keyboard);
  b.put(kit.box(0.24, 0.004, 0.24, 0.006, pad, 1), [0.45, 0.025, -0.02], keyboard);
  b.put(kit.box(0.2, 0.002, 0.004, 0.001, strip, 1), [0.45, 0.0275, 0.085], keyboard);
  for (const dx of [-0.0605, 0.0605]) b.put(kit.box(0.115, 0.008, 0.04, 0.004, keycap, 1), [0.45 + dx, 0.028, 0.135], keyboard);
  for (const dx of [-0.08, 0, 0.08]) b.put(kit.box(0.05, 0.008, 0.022, 0.004, keycap, 1), [0.45 + dx, 0.028, -0.19], keyboard);
  b.part(keyboard, [0, 0.05, 0.16], { delay: 0.3 });
  b.anchor("controls", keyboard, [-0.36, 0.04, 0.02], "left");

  // --- The lid, hinged along the back edge, open --------------------------------
  // Built closed (open side at y = 0, facing down), then swung open about the hinge.
  const lid = b.node([0, BASE_H, -D / 2], b.group, [-OPEN, 0, 0]);
  const centre = (mesh: THREE.Object3D) => b.put(mesh, [0, 0, D / 2], lid);
  centre(slab(W, D, R, 0, 0.05, [W - 2 * WALL, D - 2 * WALL, R - WALL]));
  centre(kit.outline(slab(W, D, R, 0.045, LID_H)));
  centre(slab(W + 0.024, D + 0.024, R + 0.012, 0.012, 0.046, [W - 0.06, D - 0.06, R - 0.03]));
  for (const z of [-0.22, 0.22]) b.put(kit.box(W - 0.36, 0.014, 0.05, 0.007, shell, 2), [0, LID_H, D / 2 + z], lid);
  for (const x of [-0.45, 0.45]) b.put(kit.box(0.05, 0.014, D - 0.36, 0.007, shell, 2), [x, LID_H, D / 2], lid);
  for (const x of [-0.42, 0.42]) b.put(kit.box(0.12, 0.05, 0.025, 0.008, shell, 1), [x, 0.06, D + 0.008], lid);
  // Antennas on the top edge, leaning back a little.
  for (const x of [-0.36, 0.36]) {
    b.put(kit.cyl(0.02, 0.02, 0.035, m.rubber, 20), [x, 0.075, D + 0.02], lid, [0, 0, Math.PI / 2]);
    b.put(kit.cyl(0.011, 0.012, 0.24, m.rubber, 16), [x, 0.075 + 0.0156, D + 0.02 + 0.129], lid, [Math.PI / 2 - 0.12, 0, 0]);
  }

  // The inner faceplate: u across, v up the open lid, n towards the viewer.
  const face = b.node([0, 0.035, D / 2], lid, [Math.PI / 2, 0, 0]);
  const lidPanels: tex.PanelModule[] = [
    [-H, 0.3, -0.48, V],
    [-0.48, 0.3, -0.11, V],
    [-0.11, 0.3, 0.11, V],
    [0.11, 0.3, 0.48, V],
    [0.48, 0.3, H, V],
    [-H, -0.33, 0.4, 0.3],
    [0.4, 0.08, H, 0.3],
    [0.4, -0.11, H, 0.08],
    [0.4, -0.33, H, -0.11],
    [-H, -V, -0.25, -0.33],
    [-0.25, -V, 0.4, -0.33],
    [0.4, -V, H, -0.33],
  ];
  b.put(new THREE.Mesh(kit.own(new THREE.BoxGeometry(H * 2, V * 2, 0.01)), plateOf(lidPanels)), [0, 0, -0.005], face);
  face.add(screwsFor(lidPanels, (u, v) => [u, v, 0.002], [Math.PI / 2, 0, 0]));

  const status = screenOf(tex.statusPanel(), 1.05);
  const inset = (u: number, v: number, w: number, h: number, material: THREE.Material = smoked) => b.put(kit.box(w, h, 0.006, 0.004, material, 1), [u, v, 0.003], face);
  const facePort = (u: number, v: number) => {
    b.put(kit.box(0.045, 0.017, 0.008, 0.002, steel, 1), [u, v, 0.004], face);
    b.put(kit.box(0.037, 0.009, 0.002, 0.001, hole, 1), [u, v, 0.0085], face);
  };
  // Top strip: status window, USB ports over their indicator strips, camera, a dark window.
  b.put(kit.box(0.13, 0.09, 0.008, 0.004, m.graphite, 1), [-0.5875, 0.3825, 0.004], face);
  b.put(kit.plane(0.11, 0.07, status), [-0.5875, 0.3825, 0.0085], face);
  for (const u of [-0.385, -0.205, 0.205, 0.385]) {
    facePort(u, 0.415);
    b.put(kit.box(0.085, 0.022, 0.004, 0.002, strip, 1), [u, 0.35, 0.002], face);
  }
  b.put(kit.box(0.07, 0.07, 0.012, 0.006, m.graphite, 1), [0, 0.3825, 0.006], face);
  b.put(kit.torus(0.02, 0.003, m.alloy, Math.PI * 2, 40), [0, 0.3825, 0.012], face);
  b.put(kit.cyl(0.018, 0.018, 0.006, m.lens, 32), [0, 0.3825, 0.012], face, [Math.PI / 2, 0, 0]);
  b.put(kit.cyl(0.003, 0.003, 0.003, green, 8), [0.026, 0.408, 0.013], face, [Math.PI / 2, 0, 0]);
  inset(0.5875, 0.3825, 0.11, 0.1);

  // The display, which eases forward out of the lid in the exploded view (its screen is added below).
  const display = b.node([-0.1475, -0.015, 0], face);
  b.put(kit.outline(kit.box(1.03, 0.6, 0.024, 0.012, m.graphite, 2)), [0, 0, 0.012], display);
  b.part(display, [0, 0.01, 0.08], { delay: 0.2 });

  // Right column: a dark window, a status screen, a small window and a power jack.
  inset(0.5475, 0.19, 0.12, 0.12);
  b.put(kit.box(0.2, 0.09, 0.008, 0.004, m.graphite, 1), [0.5475, -0.015, 0.004], face);
  b.put(kit.plane(0.18, 0.07, status), [0.5475, -0.015, 0.0085], face);
  inset(0.5475, -0.21, 0.09, 0.09);
  b.put(kit.cyl(0.012, 0.012, 0.012, m.graphite, 20), [0.62, -0.29, 0.006], face, [Math.PI / 2, 0, 0]);

  // Bottom strip: a pale plate with two controls, the USB hub, one more port.
  inset(-0.4725, -0.399, 0.2, 0.06, pale);
  for (const du of [-0.05, 0.05]) b.put(kit.cyl(0.017, 0.017, 0.004, m.graphite, 24), [-0.4725 + du, -0.399, 0.008], face, [Math.PI / 2, 0, 0]);
  b.put(kit.box(0.32, 0.06, 0.02, 0.006, white, 2), [0.075, -0.399, 0.01], face);
  for (let i = 0; i < 7; i++) {
    const u = 0.075 + (i - 3) * 0.042;
    b.put(kit.box(0.03, 0.012, 0.004, 0.0015, steel, 1), [u, -0.399, 0.0205], face);
    b.put(kit.box(0.024, 0.006, 0.002, 0.001, i % 2 ? blue : hole, 1), [u, -0.399, 0.0225], face);
  }
  b.put(kit.cyl(0.004, 0.004, 0.003, m.glowWarm, 8), [-0.075, -0.38, 0.021], face, [Math.PI / 2, 0, 0]);
  facePort(0.5475, -0.399);

  b.part(lid, [0, 0.02, -0.05], { spin: [-0.14, 0, 0], delay: 0.05 });

  // Centre the case on the turntable axis: the open lid puts its mass at the
  // back, which would otherwise swing across the copy as the product turns.
  for (const child of b.group.children) child.position.z += SHIFT;
  for (const part of b.parts) if (part.object.parent === b.group) part.home.z += SHIFT;

  // The interface, in its true colours; exploded, it gathers in front of the case.
  const screen = screenOn(b, display);

  // --- Cables: rebuilt as the pieces move, so they stretch rather than snap --------
  const packetGeometry = kit.own(new THREE.SphereGeometry(0.012, 12, 8));
  const makeCable = (radius: number, points: number) => ({
    mesh: b.put(new THREE.Mesh(new THREE.BufferGeometry(), m.rubber), [0, 0, 0]),
    curve: new THREE.CatmullRomCurve3(Array.from({ length: points }, () => new THREE.Vector3()), false, "centripetal"),
    radius,
  });
  const displayCable = makeCable(0.008, 7);
  const networkCable = makeCable(0.006, 5);
  const packets = [0, 1, 2].map(() => b.put(new THREE.Mesh(packetGeometry, m.glowWarm), [0, 0, 0]));

  const local = new THREE.Vector3();
  const toGroup = (object: THREE.Object3D, point: THREE.Vector3 | V3) =>
    b.group.worldToLocal(object.localToWorld(Array.isArray(point) ? local.set(...point) : local.copy(point)));
  const rebuild = (cable: ReturnType<typeof makeCable>, segments: number) => {
    cable.mesh.geometry.dispose();
    cable.mesh.geometry = new THREE.TubeGeometry(cable.curve, segments, cable.radius, 8);
  };
  let builtAt = -1;

  return b.finish(
    (explode, time, focus) => {
      screen.update(explode, time, focus);
      unit.fan.rotation.y = time * 7;
      // The compute unit grows as it lifts out, so it can be read in detail.
      unit.group.scale.setScalar(MM * (1 + 0.7 * partProgress({ delay: UNIT_DELAY }, explode)));

      if (builtAt < 0 || Math.abs(explode - builtAt) > 0.002) {
        builtAt = explode;
        b.group.updateMatrixWorld(true);

        const p = displayCable.curve.points;
        p[0].copy(toGroup(unit.group, unit.ports.display));
        p[1].copy(toGroup(unit.group, [-25, 3, 60]));
        p[2].set(0, DECK + 0.012, SHIFT - 0.135);
        p[3].set(-0.66, DECK + 0.012, SHIFT - 0.135);
        p[4].set(-0.665, DECK + 0.012, SHIFT - 0.43);
        p[5].set(-0.665, BASE_H + 0.03, SHIFT - 0.5);
        p[6].copy(toGroup(face, [-0.66, -0.44, 0.006]));
        rebuild(displayCable, 96);

        const q = networkCable.curve.points;
        q[0].copy(toGroup(unit.group, unit.ports.network));
        q[1].copy(toGroup(unit.group, [27, 3, 60]));
        q[2].set(0.47, DECK + 0.012, SHIFT - 0.19);
        q[3].set(0.485, DECK + 0.021, SHIFT - 0.232);
        q[4].copy(toGroup(network, [-0.08, 0.021, 0.076]));
        rebuild(networkCable, 32);
      }
      packets.forEach((packet, k) => packet.position.copy(displayCable.curve.getPointAt((time * 0.3 + k / 3) % 1)));
    },
    { elevation: 0.36, focus: screen.focus, layout: screen.layout },
  );
}
