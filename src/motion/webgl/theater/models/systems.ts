import * as THREE from "three";
import { Build, type Kit, type ProductModel, type V3 } from "../kit";
import { emrLayer, type LayerKind } from "../textures";

/**
 * The two system products. The EMR is software, so "inside" is its layers:
 * the screen comes apart into the sheets of data it unifies. The device
 * network separates into hub, gateway, adapters and instruments while the
 * links between them stay live.
 */

const smooth = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);

export function aiPoweredEmr(kit: Kit): ProductModel {
  const b = new Build(kit);
  const { m } = kit;

  const base = b.put(kit.outline(kit.box(0.52, 0.03, 0.32, 0.012, m.graphite)), [0, 0.015, 0]);
  b.part(base, [0, 0, -0.34], { delay: 0.95 });
  const neck = b.put(kit.box(0.07, 0.55, 0.045, 0.02, m.alloy), [0, 0.3, -0.08]);
  b.part(neck, [0, 0, -0.42], { delay: 0.85 });

  const monitor = b.node([0, 0.95, 0]);
  b.put(kit.outline(kit.box(1.5, 0.88, 0.045, 0.025, m.rubber)), [0, 0, 0], monitor);
  b.put(kit.box(1.1, 0.55, 0.08, 0.04, m.shell), [0, 0, -0.055], monitor);
  b.put(kit.plane(1.44, 0.81, m.emrScreen), [0, 0, 0.0235], monitor);
  b.put(kit.box(0.3, 0.01, 0.01, 0.004, m.glowSoft, 1), [0, -0.43, 0.024], monitor);
  b.part(monitor, [0, 0.02, -0.6], { delay: 0.8 });

  // The layers start flush with the screen, invisible, and fan out toward you.
  const kinds: LayerKind[] = ["imaging", "devices", "notes", "timeline", "insight"];
  const layerMaterials: THREE.MeshBasicMaterial[] = [];
  kinds.forEach((kind, i) => {
    const material = kit.own(
      new THREE.MeshBasicMaterial({
        map: kit.own(emrLayer(kind)),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    );
    material.clippingPlanes = m.edge.clippingPlanes;
    layerMaterials.push(material);
    const sheet = b.put(kit.plane(1.3, 0.76, material), [0, 0.95, 0.03 + i * 0.002]);
    b.put(new THREE.LineSegments(kit.own(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1.3, 0.76))), m.edge), [0, 0, 0], sheet);
    // Fan out diagonally so every sheet (and its label) stays readable.
    b.part(sheet, [(i - 2) * 0.16, (i - 2) * 0.1, 0.4 * (i + 1)], { spin: [0, -0.16, 0], delay: 0.08 * i });
    b.anchor(kind, sheet, [i % 2 ? 0.63 : -0.63, 0.3 - i * 0.12, 0], i % 2 ? "right" : "left");
  });

  return b.finish((explode) => {
    const opacity = smooth(0.04, 0.4, explode) * 0.95;
    layerMaterials.forEach((material) => (material.opacity = opacity));
  });
}
