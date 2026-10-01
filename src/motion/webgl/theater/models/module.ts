import * as THREE from "three";
import { Build, type Kit, type ProductModel, type V3 } from "../kit";
import * as tex from "../textures";

/**
 * Integrated Devices: the connectivity module. A smoked translucent case
 * with mounting flanges and four corner screws; inside, a board carrying
 * the wireless module and the battery, with the data and power ports on
 * one end and an interface header on the side. Exploded, the screws lift
 * out, the lid rises and the board comes apart, while data runs from the
 * port through the processor to the radio.
 */
export function integrationModule(kit: Kit): ProductModel {
  const b = new Build(kit);
  const { m } = kit;
  const clip = m.shell.clippingPlanes;
  const high = kit.quality === "high";
  const own = <T extends THREE.Material>(material: T) => {
    material.clippingPlanes = clip;
    return kit.own(material);
  };

  // Smoked polycarbonate: the board stays visible through the case.
  const smoke = own(
    high
      ? new THREE.MeshPhysicalMaterial({
          color: "#b9aa9c",
          metalness: 0,
          roughness: 0.12,
          transmission: 1,
          thickness: 0.02,
          ior: 1.49,
          attenuationColor: new THREE.Color("#5c4a3e"),
          attenuationDistance: 1.4,
          clearcoat: 1,
          clearcoatRoughness: 0.1,
        })
      : new THREE.MeshPhysicalMaterial({ color: "#5a4f46", roughness: 0.2, transparent: true, opacity: 0.32, depthWrite: false, clearcoat: 1 }),
  );
  const pcb = own(new THREE.MeshStandardMaterial({ map: kit.own(tex.pcbBlue()), roughness: 0.48, metalness: 0.2 }));
  const cell = own(new THREE.MeshStandardMaterial({ map: kit.own(tex.batteryLabel()), roughness: 0.32, metalness: 0.55 }));
  const gold = own(new THREE.MeshPhysicalMaterial({ color: "#d6b260", metalness: 1, roughness: 0.28 }));
  const led = own(new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff8b12").multiplyScalar(2.6), toneMapped: false }));

  // --- The case: base tray with flanges (stays put), lid, screws ----------
  b.put(kit.outline(kit.box(1.2, 0.15, 0.825, 0.04, smoke)), [0, 0.075, 0]);
  for (const x of [-0.68, 0.68]) {
    b.put(kit.box(0.18, 0.03, 0.6, 0.012, smoke), [x, 0.015, 0]);
    for (const z of [-0.2, 0.2]) b.put(kit.cyl(0.028, 0.028, 0.034, m.rubber, 24), [x + Math.sign(x) * 0.03, 0.016, z]);
  }

  const lid = b.node([0, 0.255, 0]);
  b.put(kit.outline(kit.box(1.2, 0.21, 0.825, 0.05, smoke)), [0, 0, 0], lid);
  b.part(lid, [0, 1.2, -0.1], { spin: [0.1, 0, -0.05], delay: 0.15 });
  b.anchor("enclosure", lid, [0.46, 0.1, 0.3], "right");

  const screws: Array<[number, number]> = [
    [-0.53, -0.33],
    [0.53, -0.33],
    [-0.53, 0.33],
    [0.53, 0.33],
  ];
  screws.forEach(([x, z], i) => {
    const screw = b.node([x, 0.37, z]);
    b.put(kit.cyl(0.036, 0.036, 0.022, m.chrome, 32), [0, 0, 0], screw);
    b.put(kit.box(0.05, 0.008, 0.01, 0.002, m.rubber, 1), [0, 0.012, 0], screw);
    b.put(kit.box(0.01, 0.008, 0.05, 0.002, m.rubber, 1), [0, 0.012, 0], screw);
    b.put(kit.cyl(0.012, 0.012, 0.3, m.alloy, 16), [0, -0.16, 0], screw);
    b.part(screw, [0, 1.7, -0.1], { spin: [0, 5, 0], delay: i * 0.02 });
  });

  // --- The board and everything on it ---------------------------------------
  const board = b.node([0, 0.1, 0]);
  b.put(kit.box(1.08, 0.016, 0.74, 0.005, pcb, 1), [0, 0, 0], board);
  b.part(board, [0, 0.3, 0], { delay: 0.35 });

  // Processor and passives.
  const mcu: V3 = [-0.16, 0.02, -0.1];
  b.put(kit.box(0.15, 0.022, 0.15, 0.004, m.graphite, 1), mcu, board);
  b.put(kit.box(0.04, 0.004, 0.04, 0.002, led, 1), [mcu[0] + 0.04, 0.033, mcu[2] + 0.04], board);
  for (let i = 0; i < 6; i++) b.put(kit.box(0.03, 0.016, 0.018, 0.003, i % 2 ? m.graphite : m.alloy, 1), [-0.38 + i * 0.05, 0.016, 0.22], board);
  for (let i = 0; i < 4; i++) b.put(kit.cyl(0.022, 0.022, 0.05, m.alloy, 20), [0.02 + i * 0.06, 0.034, 0.3], board);

  // Wireless module: a daughter board under a metal shield.
  const radio = b.node([0.1, 0.018, -0.2], board);
  b.put(kit.box(0.28, 0.012, 0.17, 0.004, pcb, 1), [0, 0, 0], radio);
  b.put(kit.box(0.19, 0.03, 0.14, 0.006, m.chrome, 2), [-0.03, 0.02, 0], radio);
  b.put(kit.box(0.06, 0.004, 0.13, 0.002, gold, 1), [0.1, 0.008, 0], radio);
  b.part(radio, [-0.18, 0.5, -0.12], { delay: 0.65 });
  b.anchor("radio", radio, [0, 0.04, 0], "right");

  // Radio: rings pulse out of the module.
  const rings = [0, 1, 2].map(() => {
    const material = own(
      new THREE.MeshBasicMaterial({ color: new THREE.Color("#ff9a2e").multiplyScalar(2.2), transparent: true, opacity: 0, depthWrite: false, toneMapped: false }),
    );
    return b.put(new THREE.Mesh(kit.own(new THREE.TorusGeometry(0.1, 0.004, 8, 64)), material), [0.1, 0.06, 0], radio, [Math.PI / 2, 0, 0]);
  });

  // The battery, wired to the board.
  const battery = b.node([0.27, 0.056, 0.12], board);
  b.put(kit.box(0.5, 0.075, 0.34, 0.03, cell, 3), [0, 0, 0], battery);
  b.put(kit.box(0.012, 0.008, 0.1, 0.003, own(new THREE.MeshStandardMaterial({ color: "#b3261e", roughness: 0.6 })), 1), [-0.2, -0.03, -0.2], battery);
  b.put(kit.box(0.012, 0.008, 0.1, 0.003, m.rubber, 1), [-0.17, -0.03, -0.2], battery);
  b.part(battery, [0.42, 0.3, 0.46], { spin: [0, 0.35, 0], delay: 0.55 });
  b.anchor("battery", battery, [0.1, 0.04, 0.08], "right");

  // Data port through the left end: shell, insert and pins.
  const port = b.node([-0.58, 0.07, -0.05], board);
  b.put(kit.box(0.022, 0.2, 0.46, 0.006, m.chrome, 1), [0, 0, 0], port);
  b.put(kit.box(0.12, 0.11, 0.3, 0.035, m.chrome, 3), [-0.06, 0, 0], port);
  b.put(kit.box(0.124, 0.08, 0.25, 0.028, m.rubber, 3), [-0.064, 0, 0], port);
  [
    ...Array.from({ length: 5 }, (_, i): V3 => [-0.13, 0.017, -0.08 + i * 0.04]),
    ...Array.from({ length: 4 }, (_, i): V3 => [-0.13, -0.017, -0.06 + i * 0.04]),
  ].forEach((p) => b.put(kit.cyl(0.007, 0.007, 0.02, gold, 10), p, port, [0, 0, Math.PI / 2]));
  for (const z of [-0.19, 0.19]) b.put(kit.cyl(0.018, 0.018, 0.05, m.alloy, 6), [-0.03, 0, z], port, [0, 0, Math.PI / 2]);
  b.part(port, [-0.45, 0.06, 0], { delay: 0.5 });
  b.anchor("port", port, [-0.12, 0.06, 0], "left");

  // Power and charging, beside the data port.
  const usb = b.node([-0.57, 0.03, 0.27], board);
  b.put(kit.box(0.08, 0.036, 0.1, 0.017, m.chrome, 3), [0, 0, 0], usb);
  b.put(kit.box(0.082, 0.018, 0.07, 0.008, m.rubber, 2), [-0.002, 0, 0], usb);
  b.part(usb, [-0.36, 0, 0.14], { delay: 0.55 });
  b.anchor("power", usb, [-0.04, 0.02, 0], "left");

  // Interface header and reset button on the long side.
  const side = b.node([0.3, 0.02, 0.35], board);
  b.put(kit.box(0.2, 0.05, 0.05, 0.006, m.rubber, 1), [0, 0.025, 0], side);
  for (let i = 0; i < 4; i++) b.put(kit.cyl(0.006, 0.006, 0.08, gold, 8), [-0.075 + i * 0.05, 0.07, 0], side);
  b.put(kit.box(0.07, 0.03, 0.07, 0.008, m.graphite, 1), [-0.2, 0.015, 0], side);
  b.put(kit.cyl(0.022, 0.022, 0.03, led, 20), [-0.2, 0.04, 0], side);
  b.part(side, [0, 0.12, 0.38], { delay: 0.6 });
  b.anchor("iface", side, [0, 0.08, 0.02], "right");

  // Data running from the port through the processor to the radio.
  const packetGeometry = kit.own(new THREE.SphereGeometry(0.014, 12, 8));
  const packets = [0, 1, 2].map(() => b.put(new THREE.Mesh(packetGeometry, m.glowWarm), [0, 0, 0], board));
  const route = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(...mcu), new THREE.Vector3()]);

  return b.finish((explode, time) => {
    const [start, , end] = route.points;
    start.copy(port.position).add(new THREE.Vector3(0.06, -0.03, 0));
    end.copy(radio.position).add(new THREE.Vector3(-0.03, 0.03, 0));
    route.points[1].set(mcu[0], mcu[1] + 0.02 + explode * 0.12, mcu[2]);
    route.updateArcLengths();
    packets.forEach((packet, k) => packet.position.copy(route.getPointAt((time * 0.45 + k / 3) % 1)));

    rings.forEach((ring, k) => {
      const t = (time * 0.6 + k / 3) % 1;
      ring.scale.setScalar(0.4 + t * 2.2);
      (ring.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.85;
    });
  });
}
