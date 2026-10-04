import * as THREE from "three";
import { partProgress, type Build, type Focus, type Readout, type V3 } from "../kit";
import { flowMaterial, lockMaterial, scanMaterial } from "./aiEffects";

/**
 * A product's interface as a stack of layers. Assembled, the layers lie
 * flush on the display and read as one screen. Exploded, they lift out of
 * it and gather in front of the case, enlarged and turned to the viewer:
 * the panels part, the live view comes forward, and the AI overlay rises
 * off the video. The display dims behind them, tied to the stack by
 * projection lines.
 *
 * Then the camera can move in on it (`focus`): the stack turns square to
 * the viewer, the side panels straighten, the overlay settles back onto the
 * eye it was measuring, and readout cards quote the values on the screen.
 *
 * Throughout, the AI is seen working: an analysis beam sweeps the live
 * view, a reticle locks onto the eye, and readings stream into the panels
 * (`aiEffects.ts`).
 */

/** A rectangle of the capture, in pixels: x, y, width, height. */
export type Rect = [number, number, number, number];
/** A point on the capture, in pixels. */
export type Pixel = [number, number];

export type InterfaceLayer = {
  /** Names the layer; ids in the product's anatomy also get a numbered label. */
  id: string;
  rect: Rect;
  /** Where the layer settles in the exploded view, in screen widths: across, up, out of the screen. */
  to: V3;
  /** Turn about the vertical, so side panels angle in towards the centre. */
  turn?: number;
  /** 0 lifts first, 1 last. */
  delay: number;
  /** A transparent layer cut from its own image rather than the plate (the on-video overlay). */
  image?: string;
  /** Where the label sits, as a fraction of the layer: 0,0 top-left, 1,1 bottom-right. */
  labelAt?: [number, number];
};

export type InterfaceSpec = {
  /** The cleaned capture, with the on-video overlay painted out. */
  plate: string;
  /** Capture size in pixels. */
  size: [number, number];
  layers: InterfaceLayer[];
  /** Where the AI effects centre: the detected eye, the reticle's size, and the panels readings stream to. */
  ai: { eye: Pixel; lock: number; flows: Array<{ layer: string; at: Pixel }> };
  /** Values on the screen, quoted as cards while the camera is in on it. */
  readouts: Array<{ layer: string; at: Pixel; label: string; value: string; card: [number, number] }>;
};

/** Where the stack gathers: its centre in the model, its scale, and how far it leans back to face the camera. */
export type Presentation = { position: V3; scale: number; tilt: number };

const STACK_DELAY = 0.25;
/** How much of the turntable's turn the gathered stack cancels out, so it stays readable as the product turns. */
const FACE = 0.85;
/** Readings in flight per stream. */
const PARTICLES = 14;

export function interfaceStack(b: Build, spec: InterfaceSpec, display: THREE.Object3D, width: number, at: V3, show: Presentation) {
  const { kit } = b;
  const [W, H] = spec.size;
  const height = (width * H) / W;
  const clip = kit.m.shell.clippingPlanes;

  const plateMaterial = kit.interfaceScreen(spec.plate);
  const plate = b.put(kit.plane(width, height, plateMaterial), at, display);
  // Glass: only a faint reflection is added, and the screen's mark (alpha) is
  // kept, so the screen behind keeps its true colours.
  const glass = kit.own(
    new THREE.MeshPhysicalMaterial({
      color: "#000000",
      roughness: 0.16,
      clearcoat: 1,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.ZeroFactor,
      blendDstAlpha: THREE.OneFactor,
    }),
  );
  glass.clippingPlanes = clip;
  b.put(kit.plane(width, height, glass), [at[0], at[1], at[2] + 0.0008 * (spec.layers.length + 2)], display);

  const stack = b.node([0, 0, 0]);
  const layerMaterial = kit.interfaceScreen(spec.plate);
  const layers = spec.layers.map((layer, i) => {
    const [x, y, w, h] = layer.rect;
    const size = new THREE.Vector2((w / W) * width, (h / H) * height);
    const geometry = new THREE.PlaneGeometry(size.x, size.y);
    let material = layerMaterial;
    if (layer.image) material = kit.interfaceScreen(layer.image, { transparent: true });
    else {
      // Cut from the plate: map the plane to its rectangle of the capture.
      const uv = geometry.attributes.uv;
      for (let k = 0; k < uv.count; k++) uv.setXY(k, (x + uv.getX(k) * w) / W, 1 - (y + (1 - uv.getY(k)) * h) / H);
    }
    const mesh = kit.outline(new THREE.Mesh(kit.own(geometry), material));
    // Flush with the plate, each a hair in front of the one before.
    const home = new THREE.Vector3(((x + w / 2) / W - 0.5) * width, (0.5 - (y + h / 2) / H) * height, 0.0008 * (i + 1));
    b.put(mesh, [home.x, home.y, home.z], stack);
    if (layer.labelAt) {
      const [fx, fy] = layer.labelAt;
      b.anchor(layer.id, mesh, [((fx - 0.5) * w * width) / W, ((0.5 - fy) * h * height) / H, 0], "right");
    }
    return { layer, mesh, material, home, size };
  });
  const byId = (id: string) => {
    const found = layers.find(({ layer }) => layer.id === id);
    if (!found) throw new Error(`interface layer "${id}" not found`);
    return found;
  };
  /** A capture pixel as a point on its layer (the layer's own coordinates). */
  const onLayer = (id: string, [px, py]: Pixel, lift = 0.0005) => {
    const [x, y, w, h] = byId(id).layer.rect;
    return new THREE.Vector3(((px - x - w / 2) / W) * width, ((y + h / 2 - py) / H) * height, lift);
  };

  // --- The AI at work ------------------------------------------------------------
  const video = byId("display");
  const overlay = layers.find(({ layer }) => layer.image)!;
  const scan = scanMaterial(video.layer.rect[2] / video.layer.rect[3], clip);
  b.put(new THREE.Mesh(kit.own(new THREE.PlaneGeometry(video.size.x, video.size.y)), kit.own(scan)), [0, 0, 0.0004], video.mesh);

  const reticle = lockMaterial(clip);
  const lockSize = (spec.ai.lock / W) * width;
  b.put(new THREE.Mesh(kit.own(new THREE.PlaneGeometry(lockSize, lockSize)), kit.own(reticle)), onLayer(overlay.layer.id, spec.ai.eye).toArray() as V3, overlay.mesh);

  const flows = spec.ai.flows.map(({ layer, at: to }) => ({ from: onLayer(overlay.layer.id, spec.ai.eye), to: onLayer(layer, to), target: byId(layer) }));
  const flowPositions = new THREE.BufferAttribute(new Float32Array(flows.length * PARTICLES * 3), 3);
  const flowFades = new THREE.BufferAttribute(new Float32Array(flows.length * PARTICLES), 1);
  const flowGeometry = kit.own(new THREE.BufferGeometry().setAttribute("position", flowPositions).setAttribute("aFade", flowFades));
  const stream = flowMaterial(clip);
  const streams = b.put(new THREE.Points(flowGeometry, kit.own(stream)), [0, 0, 0], stack);
  streams.frustumCulled = false;

  const readouts: Readout[] = spec.readouts.map(({ layer, at: pixel, label, value, card }) => ({ object: byId(layer).mesh, point: onLayer(layer, pixel, 0), label, value, card }));

  // Projection lines from the display's corners to the gathered screen's.
  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([sx, sy]) => new THREE.Vector3((sx * width) / 2, (sy * height) / 2, 0));
  const linePositions = new THREE.BufferAttribute(new Float32Array(8 * 3), 3);
  const lineGeometry = kit.own(new THREE.BufferGeometry().setAttribute("position", linePositions));
  const lines = b.put(new THREE.LineSegments(lineGeometry, kit.m.edge), [0, 0, 0]);
  lines.frustumCulled = false;

  const inverse = new THREE.Matrix4();
  const relative = new THREE.Matrix4();
  const from = { position: new THREE.Vector3(), quaternion: new THREE.Quaternion(), scale: new THREE.Vector3() };
  const toQuaternion = new THREE.Quaternion();
  const toPosition = new THREE.Vector3();
  const euler = new THREE.Euler(0, 0, 0, "YXZ");
  const up = new THREE.Vector3(0, 1, 0);
  const point = new THREE.Vector3();
  const start = new THREE.Vector3();
  const end = new THREE.Vector3();
  const bend = new THREE.Vector3();
  const bounds = new THREE.Box3();

  const focus: Focus = {
    elevation: show.tilt,
    readouts,
    frame(target, core) {
      bounds.makeEmpty();
      for (const { layer, mesh, size } of layers) {
        if (layer.image || (core && layer !== video.layer)) continue;
        bounds.expandByPoint(point.set(mesh.position.x - size.x / 2, mesh.position.y - size.y / 2, mesh.position.z));
        bounds.expandByPoint(point.set(mesh.position.x + size.x / 2, mesh.position.y + size.y / 2, mesh.position.z));
      }
      stack.localToWorld(bounds.getCenter(target));
      return { width: (bounds.max.x - bounds.min.x) * stack.scale.x, height: (bounds.max.y - bounds.min.y) * stack.scale.x };
    },
  };

  return {
    plate,
    stack,
    focus,
    update(explode: number, time: number, focused = 0) {
      const k = partProgress({ delay: STACK_DELAY }, explode);
      b.group.updateMatrixWorld(true);
      // Start from wherever the display is now (it moves with the lid).
      relative.multiplyMatrices(inverse.copy(b.group.matrixWorld).invert(), plate.matrixWorld);
      relative.decompose(from.position, from.quaternion, from.scale);
      const yaw = -b.group.rotation.y * THREE.MathUtils.lerp(FACE, 1, focused);
      toQuaternion.setFromEuler(euler.set(-show.tilt, yaw, 0));
      toPosition.set(...show.position).applyAxisAngle(up, yaw);
      stack.position.lerpVectors(from.position, toPosition, k);
      stack.quaternion.slerpQuaternions(from.quaternion, toQuaternion, k);
      stack.scale.setScalar(THREE.MathUtils.lerp(from.scale.x, show.scale, k));

      // In focus the panels straighten and close up, and the overlay settles back onto the eye.
      for (const { layer, mesh, home } of layers) {
        const t = partProgress(layer, explode);
        const depth = 1 - (layer.image ? 0.9 : 0.45) * focused;
        mesh.position.set(home.x + layer.to[0] * width * t, home.y + layer.to[1] * width * t, home.z + layer.to[2] * width * t * depth);
        mesh.rotation.y = (layer.turn ?? 0) * t * (1 - focused);
      }
      // The overlay always rides just in front of the live view it annotates.
      overlay.mesh.position.z = Math.max(overlay.mesh.position.z, video.mesh.position.z + 0.006);
      for (const { mesh } of layers) mesh.updateMatrix();
      // The display dims as its contents leave it; the overlay breathes.
      plateMaterial.color.setScalar(1 - 0.8 * k);
      const pulse = 0.5 + 0.5 * Math.sin(time * 2.4);
      overlay.material.color.setScalar(1.05 + (0.08 + 0.25 * k) * pulse);

      // The AI at work: faint on the closed case's display, full once it's open.
      scan.uniforms.uTime.value = time;
      scan.uniforms.uStrength.value = 0.3 + 0.7 * k;
      reticle.uniforms.uTime.value = time;
      reticle.uniforms.uStrength.value = 0.3 + 0.7 * k;
      reticle.uniforms.uLock.value = 1 - partProgress(overlay.layer, explode) * (1 - focused);
      stream.uniforms.uStrength.value = k;
      streams.visible = k > 0.01;
      if (streams.visible) {
        flows.forEach(({ from: a, to: c, target }, f) => {
          start.copy(a).applyMatrix4(overlay.mesh.matrix);
          end.copy(c).applyMatrix4(target.mesh.matrix);
          // Arc out towards the viewer between the eye and the panel.
          bend.lerpVectors(start, end, 0.5);
          bend.z += 0.12 * width;
          for (let i = 0; i < PARTICLES; i++) {
            const t = (time * 0.32 + i / PARTICLES + f * 0.37) % 1;
            const u = 1 - t;
            const n = f * PARTICLES + i;
            flowPositions.setXYZ(
              n,
              u * u * start.x + 2 * u * t * bend.x + t * t * end.x,
              u * u * start.y + 2 * u * t * bend.y + t * t * end.y,
              u * u * start.z + 2 * u * t * bend.z + t * t * end.z,
            );
            flowFades.setX(n, Math.pow(Math.sin(Math.PI * t), 1.5));
          }
        });
        flowPositions.needsUpdate = true;
        flowFades.needsUpdate = true;
      }

      stack.updateMatrixWorld(true);
      corners.forEach((corner, i) => {
        point.copy(corner).applyMatrix4(plate.matrixWorld).applyMatrix4(inverse);
        linePositions.setXYZ(i * 2, point.x, point.y, point.z);
        point.copy(corner).applyMatrix4(stack.matrixWorld).applyMatrix4(inverse);
        linePositions.setXYZ(i * 2 + 1, point.x, point.y, point.z);
      });
      linePositions.needsUpdate = true;
      lines.visible = k > 0.01;
    },
  };
}
