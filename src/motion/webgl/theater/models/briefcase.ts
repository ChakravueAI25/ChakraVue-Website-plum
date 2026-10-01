import * as THREE from "three";
import { Build, type Kit, type ProductModel } from "../kit";

/**
 * Surgical Assistant: a rugged carry case beside a surgical microscope,
 * linked by a cable. Opening it (the exploded view) swings the lid up on its
 * hinge to show the built-in display running the surgical interface; the
 * compute unit lifts out of the foam, still cabled to the display, and the
 * microscope eases back while data runs along its link into the case.
 */
export function surgicalBriefcase(kit: Kit): ProductModel {
  const b = new Build(kit);
  const { m } = kit;
  const clip = m.shell.clippingPlanes;
  const own = <T extends THREE.Material>(material: T) => {
    material.clippingPlanes = clip;
    return kit.own(material);
  };

  const hardShell = own(new THREE.MeshPhysicalMaterial({ color: "#1f2227", metalness: 0.25, roughness: 0.58, clearcoat: 0.35, clearcoatRoughness: 0.5 }));
  const foam = own(new THREE.MeshStandardMaterial({ color: "#0d0e10", roughness: 0.95, metalness: 0 }));

  const W = 1.3;
  const D = 0.9;
  const BASE = 0.22;
  const LID = 0.14;
  const X = -0.18;

  // --- The case -------------------------------------------------------------
  const base = b.node([X, 0, 0]);
  b.put(kit.outline(kit.box(W, BASE, D, 0.05, hardShell)), [0, BASE / 2, 0], base);
  b.put(kit.box(W + 0.02, 0.022, D + 0.02, 0.008, m.alloy, 2), [0, BASE - 0.004, 0], base);
  b.put(kit.box(W - 0.1, 0.02, D - 0.1, 0.01, foam, 1), [0, BASE - 0.012, 0], base);
  for (const x of [-0.36, 0.36]) {
    b.put(kit.box(0.12, 0.07, 0.03, 0.01, m.chrome, 2), [x, BASE - 0.02, D / 2 + 0.012], base);
  }
  for (const z of [-0.2, 0.2]) b.put(kit.box(W + 0.01, 0.03, 0.05, 0.012, hardShell, 2), [0, 0.07, z], base);
  // Carry handle: an arc standing out from the front face.
  const handle = b.put(kit.torus(0.13, 0.022, m.rubber, Math.PI, 40), [0, BASE * 0.5, D / 2 + 0.01], base, [Math.PI / 2, 0, 0]);
  handle.scale.set(1, 0.6, 1);
  b.put(kit.box(0.14, 0.05, 0.03, 0.01, m.graphite, 1), [W / 2 + 0.005, 0.12, 0.2], base, [0, Math.PI / 2, 0]);
  b.anchor("case", base, [-0.4, BASE * 0.6, D / 2], "left");

  // Lid, hinged along the back edge; the display is set into its underside.
  const lid = b.node([X, BASE, -D / 2]);
  b.put(kit.outline(kit.box(W, LID, D, 0.05, hardShell)), [0, LID / 2, D / 2], lid);
  b.put(kit.box(W - 0.12, 0.018, D - 0.14, 0.01, m.graphite, 1), [0, 0.002, D / 2], lid);
  const screen = b.put(kit.plane(W - 0.2, D - 0.24, m.surgicalScreen), [0, -0.008, D / 2], lid, [Math.PI / 2, 0, 0]);
  b.put(kit.cyl(0.02, 0.02, W - 0.1, m.alloy, 16), [0, 0.01, 0.012], lid, [0, 0, Math.PI / 2]);
  b.part(lid, [0, 0, 0], { spin: [-1.85, 0, 0], delay: 0.05 });
  b.anchor("display", screen, [0.18, 0.1, 0], "right");

  // Compute unit in the foam: board, heatsink and fan.
  const compute = b.node([X - 0.18, BASE + 0.004, 0.05]);
  b.put(kit.board(0.4, 0.3, 0.34), [0, 0.008, 0], compute);
  b.put(kit.fins(0.32, 0.07, 0.24, 9), [0, 0.06, 0], compute);
  b.put(kit.cyl(0.075, 0.075, 0.018, m.graphite, 32), [0, 0.105, 0], compute);
  b.put(kit.torus(0.06, 0.006, m.glowSoft, Math.PI * 2, 48), [0, 0.116, 0], compute, [Math.PI / 2, 0, 0]);
  b.put(kit.box(0.08, 0.03, 0.05, 0.006, m.chrome, 1), [0.24, 0.02, 0.06], compute);
  b.part(compute, [-0.1, 0.3, 0.55], { spin: [0.25, 0.5, 0], delay: 0.55 });
  b.anchor("compute", compute, [0, 0.1, 0], "left");

  // I/O block beside it.
  const io = b.put(kit.box(0.26, 0.05, 0.2, 0.01, m.graphite, 1), [X + 0.34, BASE + 0.02, 0.12]);
  b.put(kit.box(0.2, 0.012, 0.01, 0.003, m.glow, 1), [0, 0.02, 0.101], io);
  b.part(io, [0.2, 0.2, 0.45], { delay: 0.6 });

  // --- The microscope ---------------------------------------------------------
  const scope = b.node([0.74, 0, -0.62], b.group, [0, -0.5, 0]);
  b.put(kit.outline(kit.cyl(0.26, 0.3, 0.07, m.graphite)), [0, 0.035, 0], scope);
  b.put(kit.cyl(0.042, 0.05, 1.22, m.alloy, 32), [0, 0.68, 0], scope);
  b.put(kit.torus(0.05, 0.009, m.chrome), [0, 1.2, 0], scope, [Math.PI / 2, 0, 0]);
  b.put(kit.outline(kit.box(0.62, 0.07, 0.1, 0.03, m.alloy)), [-0.26, 1.3, 0], scope);
  const head = b.node([-0.52, 1.08, 0.02], scope);
  b.put(kit.cyl(0.03, 0.03, 0.16, m.alloy), [0, 0.13, 0], head);
  b.put(kit.outline(kit.box(0.2, 0.2, 0.22, 0.05, m.alloy)), [0, 0, 0], head);
  b.put(kit.cyl(0.07, 0.06, 0.14, m.graphite, 40), [0, -0.16, 0], head);
  b.put(kit.cyl(0.058, 0.058, 0.01, m.lens, 40), [0, -0.235, 0], head);
  for (const x of [-0.045, 0.045]) b.put(kit.cyl(0.024, 0.026, 0.16, m.graphite, 24), [x, 0.12, 0.1], head, [0.9, 0, 0]);
  const camera = b.put(kit.box(0.1, 0.09, 0.1, 0.02, m.graphite, 2), [0.14, -0.02, 0], head);
  b.put(kit.torus(0.03, 0.005, m.glowSoft, Math.PI * 2, 32), [0.051, 0, 0], camera, [0, Math.PI / 2, 0]);
  b.part(scope, [0.3, 0, -0.22], { delay: 0.75 });
  b.anchor("microscope", head, [0, 0.12, 0.1], "right");

  // --- Cables: rebuilt as the pieces move, so they stretch rather than snap --
  const packetGeometry = kit.own(new THREE.SphereGeometry(0.016, 12, 8));
  const makeCable = (radius: number) => ({
    mesh: b.put(new THREE.Mesh(new THREE.BufferGeometry(), m.rubber), [0, 0, 0]),
    curve: new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]),
    radius,
  });
  const scopeCable = makeCable(0.014);
  const screenCable = makeCable(0.01);
  const packets = [0, 1, 2].map(() => b.put(new THREE.Mesh(packetGeometry, m.glowWarm), [0, 0, 0]));
  const marker = b.node([0, 0, 0]);
  b.anchor("links", marker, [0, 0, 0], "right");

  const local = new THREE.Vector3();
  const toGroup = (object: THREE.Object3D, point: THREE.Vector3) => b.group.worldToLocal(object.localToWorld(local.copy(point)));
  const ports = {
    caseSide: new THREE.Vector3(W / 2 + 0.02, 0.12, 0.2),
    camera: new THREE.Vector3(0.05, -0.02, 0),
    compute: new THREE.Vector3(0.24, 0.03, 0.06),
    screen: new THREE.Vector3(W / 2 - 0.14, 0.004, 0.14),
  };
  let builtAt = -1;

  return b.finish((explode, time) => {
    if (builtAt < 0 || Math.abs(explode - builtAt) > 0.002) {
      builtAt = explode;
      b.group.updateMatrixWorld(true);

      const [a1, a2, a3, a4] = scopeCable.curve.points;
      a1.copy(toGroup(base, ports.caseSide));
      a4.copy(toGroup(camera, ports.camera));
      a2.copy(a1).add(new THREE.Vector3(0.22, -0.08, 0.02));
      a3.lerpVectors(a1, a4, 0.62).setY(Math.min(a1.y, a4.y) - 0.02);
      scopeCable.mesh.geometry.dispose();
      scopeCable.mesh.geometry = new THREE.TubeGeometry(scopeCable.curve, 48, scopeCable.radius, 8);

      const [c1, c2, c3, c4] = screenCable.curve.points;
      c1.copy(toGroup(compute, ports.compute));
      c4.copy(toGroup(lid, ports.screen));
      c2.copy(c1).add(new THREE.Vector3(0.12, 0.02, -0.1));
      c3.set(c4.x - 0.02, BASE + 0.03, -D / 2 + 0.06);
      screenCable.mesh.geometry.dispose();
      screenCable.mesh.geometry = new THREE.TubeGeometry(screenCable.curve, 40, screenCable.radius, 8);

      marker.position.copy(scopeCable.curve.getPointAt(0.5));
    }
    packets.forEach((packet, k) => packet.position.copy(scopeCable.curve.getPointAt(1 - ((time * 0.35 + k / 3) % 1))));
  });
}
