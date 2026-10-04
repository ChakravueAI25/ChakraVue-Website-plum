import * as THREE from "three";
import type { Build, Kit, V3 } from "../kit";
import * as tex from "../textures";

/** Millimetres to scene units. The unit is built in millimetres and scaled by this. */
export const MM = 0.0031;

export type ComputeUnit = {
  /** The whole unit, in millimetres (scaled by MM). The board's top face is y = 0; the I/O faces +z. */
  group: THREE.Group;
  /** Heatsink and fan, lifted off the module in the exploded view. */
  heatsink: THREE.Group;
  fan: THREE.Group;
  /** Mouths of the display and network sockets, local to `group`. */
  ports: { display: THREE.Vector3; network: THREE.Vector3 };
};

/**
 * The compute unit: a compact edge computer on a carrier board, modelled
 * on the product photograph but unbranded. A black base tray carries the
 * board; the compute module sits in its edge connector under a square
 * heatsink with a fan set into the top. Along the front: power, display,
 * two stacked pairs of USB, network and USB-C; a 40-pin header down the
 * right edge, two camera connectors on the left.
 */
export function computeUnit(b: Build, kit: Kit, own: <T extends THREE.Material>(m: T) => T, parent: THREE.Object3D, position: V3): ComputeUnit {
  const { m } = kit;
  const plastic = own(new THREE.MeshPhysicalMaterial({ color: "#101113", roughness: 0.7, metalness: 0.05 }));
  const board = own(new THREE.MeshStandardMaterial({ map: kit.own(tex.carrierBoard()), roughness: 0.5, metalness: 0.25 }));
  const module = own(new THREE.MeshStandardMaterial({ color: "#1a1e1c", roughness: 0.5, metalness: 0.3 }));
  const sink = own(new THREE.MeshPhysicalMaterial({ color: "#17181b", roughness: 0.58, metalness: 0.55, clearcoat: 0.15, clearcoatRoughness: 0.6 }));
  const steel = own(new THREE.MeshPhysicalMaterial({ color: "#a9adb4", roughness: 0.32, metalness: 1 }));
  const hole = own(new THREE.MeshBasicMaterial({ color: "#040405" }));
  const gold = own(new THREE.MeshPhysicalMaterial({ color: "#d6b260", metalness: 1, roughness: 0.3 }));
  const ivory = own(new THREE.MeshStandardMaterial({ color: "#ddd4bd", roughness: 0.6 }));
  const white = own(new THREE.MeshStandardMaterial({ color: "#e9e7e2", roughness: 0.55 }));
  const green = own(new THREE.MeshBasicMaterial({ color: new THREE.Color("#46ff7a").multiplyScalar(1.4), toneMapped: false }));

  const group = b.node(position, parent);
  group.scale.setScalar(MM);

  // --- Tray and carrier board -------------------------------------------------
  b.put(kit.outline(kit.box(106, 7, 88, 3, plastic, 2)), [0, -5.1, 0], group);
  b.put(new THREE.Mesh(kit.own(new THREE.BoxGeometry(100, 1.6, 80)), board), [0, -0.8, 0], group);
  for (const [x, z] of [[-47.2, -37.2], [47.2, -37.2], [-47.2, 37.2], [47.2, 37.2]]) {
    b.put(kit.cyl(2.4, 2.4, 1, steel, 20), [x, 0.5, z], group);
  }

  // --- Front I/O ------------------------------------------------------------------
  const FRONT = 41.5;
  /** A connector body sitting on the board's front edge, with dark openings [x, y from base, w, h]. */
  const port = (x: number, w: number, h: number, d: number, housing: THREE.Material, openings: Array<[number, number, number, number]>) => {
    const body = b.put(kit.box(w, h, d, 0.6, housing, 1), [x, h / 2, FRONT - d / 2], group);
    for (const [ox, oy, ow, oh] of openings) b.put(kit.box(ow, oh, 0.6, 0.2, hole, 1), [ox, oy - h / 2, d / 2 + 0.05], body);
    return body;
  };

  const jack = port(-40, 9, 11, 13, plastic, []);
  b.put(kit.cyl(3.1, 3.1, 0.6, hole, 24), [0, 0.5, 6.55], jack, [Math.PI / 2, 0, 0]);
  b.put(kit.cyl(0.9, 0.9, 0.8, steel, 12), [0, 0.5, 6.6], jack, [Math.PI / 2, 0, 0]);

  port(-25, 17, 8.5, 15, steel, [[0, 4.25, 13.6, 5.2]]);

  for (const x of [-7, 10]) {
    const usb = port(x, 14.5, 16, 17.5, steel, [
      [0, 4.4, 12.4, 5.4],
      [0, 11.6, 12.4, 5.4],
    ]);
    for (const y of [4.4, 11.6]) b.put(kit.box(11, 1.7, 0.8, 0.3, m.graphite, 1), [0, y - 8 - 0.9, 9], usb);
  }

  const rj45 = port(27, 16.5, 13.5, 21, steel, [[0, 6, 12, 8.6]]);
  b.put(kit.box(2.4, 1.4, 0.4, 0.2, green, 1), [-5.6, 5.2, 10.6], rj45);
  b.put(kit.box(2.4, 1.4, 0.4, 0.2, m.glowWarm, 1), [5.6, 5.2, 10.6], rj45);

  port(40.5, 9, 3.6, 7.5, steel, [[0, 1.8, 7.2, 1.6]]);

  // --- Edges: 40-pin header (right), camera connectors (left), fan socket ------
  b.put(kit.box(5.1, 2.5, 51, 0.3, plastic, 1), [46.1, 1.25, -1.5], group);
  const pins: Array<{ p: V3 }> = [];
  for (let i = 0; i < 20; i++) for (const x of [44.83, 47.37]) pins.push({ p: [x, 3.2, -1.5 - 24.13 + i * 2.54] });
  group.add(kit.instanced(new THREE.BoxGeometry(0.64, 6, 0.64), gold, pins));

  for (const z of [-20, -2]) {
    b.put(kit.box(3.6, 2.2, 15, 0.3, ivory, 1), [-46.6, 1.1, z], group);
    b.put(kit.box(3.9, 0.8, 15.4, 0.2, plastic, 1), [-46.6, 2.5, z], group);
  }
  b.put(kit.box(6, 5, 3.6, 0.4, white, 1), [37.5, 2.5, -33], group);

  // --- The compute module in its edge connector -----------------------------------
  b.put(kit.box(74, 4.8, 6.5, 0.4, plastic, 1), [-3, 2.4, 15.5], group);
  for (const x of [-41.5, 35.5]) b.put(kit.box(2.4, 4.2, 6, 0.3, steel, 1), [x, 2.6, 15.5], group);
  b.put(kit.box(70, 1, 45, 0.3, module, 1), [-3, 5.5, -10], group);
  b.put(kit.box(66, 0.8, 1.4, 0.2, gold, 1), [-3, 5.2, 12.4], group);

  // Small surface parts scattered over the free board area (deterministic).
  let seed = 4;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  const busy: Array<[number, number, number, number]> = [
    [-37, -38, 31, 20], // heatsink, module and connector
    [-50, 21, 50, 42], // front I/O
    [42, -28, 50, 25], // header
    [-50, -29, -43, 7], // camera connectors
    [33, -37, 42, -29], // fan socket
  ];
  const free = (x: number, z: number) =>
    !busy.some(([x0, z0, x1, z1]) => x > x0 && x < x1 && z > z0 && z < z1) && Math.min(...[[-47.2, -37.2], [47.2, -37.2], [-47.2, 37.2], [47.2, 37.2]].map(([sx, sz]) => Math.hypot(x - sx, z - sz))) > 5;
  let placed = 0;
  for (let tries = 0; tries < 400 && placed < 46; tries++) {
    const x = -48 + rnd() * 96;
    const z = -38 + rnd() * 76;
    if (!free(x, z)) continue;
    const w = 1.2 + rnd() * 3.2;
    const h = 0.5 + rnd() * 0.9;
    const material = rnd() > 0.8 ? steel : rnd() > 0.5 ? m.graphite : plastic;
    b.put(kit.box(w, h, 0.8 + rnd() * 2.6, 0.15, material, 1), [x, h / 2, z], group);
    placed++;
  }

  // --- Heatsink with the fan set into its top -------------------------------------
  const heatsink = b.node([-3, 6, -9], group);
  b.put(kit.outline(kit.box(64, 17, 54, 2.2, sink, 3)), [0, 8.5, 0], heatsink);
  const top = new THREE.Shape();
  const [tw, td, tr] = [62.4, 52.4, 2];
  top.moveTo(-tw / 2 + tr, -td / 2);
  top.lineTo(tw / 2 - tr, -td / 2);
  top.absarc(tw / 2 - tr, -td / 2 + tr, tr, -Math.PI / 2, 0, false);
  top.lineTo(tw / 2, td / 2 - tr);
  top.absarc(tw / 2 - tr, td / 2 - tr, tr, 0, Math.PI / 2, false);
  top.lineTo(-tw / 2 + tr, td / 2);
  top.absarc(-tw / 2 + tr, td / 2 - tr, tr, Math.PI / 2, Math.PI, false);
  top.lineTo(-tw / 2, -td / 2 + tr);
  top.absarc(-tw / 2 + tr, -td / 2 + tr, tr, Math.PI, Math.PI * 1.5, false);
  top.holes.push(new THREE.Path().absarc(0, 0, 20, 0, Math.PI * 2, true));
  const plate = kit.own(new THREE.ExtrudeGeometry(top, { depth: 3.4, bevelEnabled: true, bevelSize: 0.8, bevelThickness: 0.8, bevelSegments: 2, curveSegments: 40 }));
  plate.rotateX(-Math.PI / 2);
  b.put(new THREE.Mesh(plate, sink), [0, 17.8, 0], heatsink);
  for (const [x, z] of [[-27, -21], [27, -21], [-27, 21], [27, 21]]) b.put(kit.cyl(1.9, 1.9, 0.6, m.graphite, 16), [x, 22.3, z], heatsink);

  const fan = b.node([0, 17, 0], heatsink);
  b.put(kit.cyl(8.5, 8.5, 3.4, plastic, 40), [0, 1.7, 0], fan);
  b.put(kit.cyl(6, 6, 0.3, m.graphite, 40), [0, 3.5, 0], fan);
  for (let i = 0; i < 7; i++) {
    const pivot = b.node([0, 0, 0], fan, [0, (i / 7) * Math.PI * 2, 0]);
    b.put(kit.box(11, 0.8, 7, 0.3, plastic, 1), [13.8, 1.9, 0], pivot, [0.55, 0.22, 0]);
  }

  // Fan lead down to its socket.
  const lead = new THREE.CatmullRomCurve3([new THREE.Vector3(32, 10, -15), new THREE.Vector3(37, 7, -20), new THREE.Vector3(40.5, 2, -24), new THREE.Vector3(40.5, -1, -24)]);
  b.put(new THREE.Mesh(kit.own(new THREE.TubeGeometry(lead, 24, 0.9, 6)), m.rubber), [0, 0, 0], heatsink);

  return {
    group,
    heatsink,
    fan,
    ports: { display: new THREE.Vector3(-25, 4.25, FRONT + 1), network: new THREE.Vector3(27, 6, FRONT + 1) },
  };
}
