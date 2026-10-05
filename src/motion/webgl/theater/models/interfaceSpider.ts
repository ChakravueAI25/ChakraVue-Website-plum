import * as THREE from "three";
import { partProgress, type Anchor, type Build, type Focus, type Readout, type V3 } from "../kit";
import { flowMaterial, scanMaterial } from "./aiEffects";
import { displayScreen, projectionLines, type Pixel, type Presentation } from "./interfaceStack";

/**
 * A product's interface as a spider: the main screen in the middle, and
 * the screens it leads to around it, each on its own leg. Assembled, only
 * the main screen shows, on the display. Exploded, it lifts out and
 * gathers in front of the case, facing the viewer, and the other screens
 * travel out from behind it to the four diagonals, apart, so every screen
 * can be seen whole. Records stream along the legs from the main screen
 * to each of them, and an analysis beam sweeps the main screen.
 *
 * The layout has a landscape and a portrait form (`layout`): diagonals
 * either side of the main screen on wide stages, a pair above and a pair
 * below it on tall ones.
 *
 * Then the camera can move in on it (`focus`): the spider turns square to
 * the viewer, the screens straighten, and readout cards quote what the
 * screens show.
 */

export type SpiderScreen = {
  /** Names the screen; an id in the product's anatomy also gets a numbered label. */
  id: string;
  image: string;
  /** Capture size in pixels. */
  size: [number, number];
  /** Where the screen's centre settles, in main-screen widths from its centre: on wide stages and on tall ones. */
  at: { wide: [number, number]; tall: [number, number] };
  /** 0 leaves first, 1 last. */
  delay: number;
};

export type SpiderSpec = {
  main: { id: string; image: string; size: [number, number] };
  screens: SpiderScreen[];
  /** The surrounding screens' width, in main-screen widths. */
  scale: { wide: number; tall: number };
  /** Values on the screens (by id, or the main screen's), quoted as cards while the camera is in on them. */
  readouts: Array<{ screen: string; at: Pixel; label: string; value: string; card: [number, number] }>;
};

const STACK_DELAY = 0.25;
/** How much of the turntable's turn the gathered spider cancels out, so it stays readable as the product turns. */
const FACE = 0.85;
/** How far the surrounding screens angle in towards the centre before the camera moves in. */
const TURN = 0.16;
/** Records in flight per leg. */
const PARTICLES = 10;

export function interfaceSpider(b: Build, spec: SpiderSpec, display: THREE.Object3D, width: number, at: V3, show: Presentation) {
  const { kit } = b;
  const clip = kit.m.shell.clippingPlanes;
  const [W, H] = spec.main.size;
  const height = (width * H) / W;
  const { plate, dim } = displayScreen(b, spec.main.image, display, width, height, at, 2);

  const stack = b.node([0, 0, 0]);
  const main = kit.outline(new THREE.Mesh(kit.own(new THREE.PlaneGeometry(width, height)), kit.interfaceScreen(spec.main.image)));
  b.put(main, [0, 0, 0.0008], stack);
  // Each screen is captioned on its top-left corner, like a window title.
  b.anchor(spec.main.id, main, [-width / 2, height / 2, 0], "top");

  let tall = false;
  const screens = spec.screens.map((screen) => {
    const mesh = kit.outline(new THREE.Mesh(kit.own(new THREE.PlaneGeometry(1, screen.size[1] / screen.size[0])), kit.interfaceScreen(screen.image)));
    // Tucked behind the main screen until it leaves.
    b.put(mesh, [0, 0, -0.004], stack);
    const anchor: Anchor = { id: screen.id, object: mesh, point: new THREE.Vector3(), side: "top" };
    b.anchors.push(anchor);
    return { screen, mesh, anchor, aspect: screen.size[1] / screen.size[0] };
  });
  /** Where each screen settles, its size, and its label, for the current layout. */
  const place = () => {
    const scale = (tall ? spec.scale.tall : spec.scale.wide) * width;
    for (const s of screens) {
      const [x, y] = tall ? s.screen.at.tall : s.screen.at.wide;
      // Captioned on the top-left corner, or the bottom-left for those below the main screen in portrait.
      s.anchor.side = tall && y < 0 ? "bottom" : "top";
      s.anchor.point.set(-0.5, ((s.anchor.side === "top" ? 1 : -1) * s.aspect) / 2, 0);
      Object.assign(s, { home: new THREE.Vector3(x * width, y * width, 0.0008), scale });
    }
  };
  const settled = screens as Array<(typeof screens)[number] & { home: THREE.Vector3; scale: number }>;
  place();

  // --- The AI at work --------------------------------------------------------------
  const scan = scanMaterial(W / H, clip);
  scan.uniforms.uStrength.value = 0;
  b.put(new THREE.Mesh(kit.own(new THREE.PlaneGeometry(width, height)), kit.own(scan)), [0, 0, 0.0004], main);

  const flowPositions = new THREE.BufferAttribute(new Float32Array(screens.length * PARTICLES * 3), 3);
  const flowFades = new THREE.BufferAttribute(new Float32Array(screens.length * PARTICLES), 1);
  const flowGeometry = kit.own(new THREE.BufferGeometry().setAttribute("position", flowPositions).setAttribute("aFade", flowFades));
  const stream = flowMaterial(clip);
  const streams = b.put(new THREE.Points(flowGeometry, kit.own(stream)), [0, 0, 0], stack);
  streams.frustumCulled = false;

  // The legs: from inside the main screen, out past its corner, to each screen's near corner.
  const legPositions = new THREE.BufferAttribute(new Float32Array(screens.length * 4 * 3), 3);
  const legs = b.put(new THREE.LineSegments(kit.own(new THREE.BufferGeometry().setAttribute("position", legPositions)), kit.m.edge), [0, 0, 0], stack);
  legs.frustumCulled = false;

  const readouts: Readout[] = spec.readouts.map(({ screen, at: [px, py], label, value, card }) => {
    if (screen === spec.main.id) return { object: main, point: new THREE.Vector3((px / W - 0.5) * width, (0.5 - py / H) * height, 0), label, value, card };
    const found = screens.find((s) => s.screen.id === screen);
    if (!found) throw new Error(`spider screen "${screen}" not found`);
    const [w, h] = found.screen.size;
    // The screen's plane is 1 wide and scaled, so its points are in capture fractions.
    return { object: found.mesh, point: new THREE.Vector3(px / w - 0.5, (0.5 - py / h) * found.aspect, 0), label, value, card };
  });

  const lines = projectionLines(b, plate, stack, width, height);
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
    frame(target) {
      bounds.makeEmpty();
      bounds.expandByPoint(point.set(-width / 2, -height / 2, 0)).expandByPoint(point.set(width / 2, height / 2, 0));
      for (const { home, scale, aspect } of settled) {
        bounds.expandByPoint(point.set(home.x - scale / 2, home.y - (scale * aspect) / 2, 0));
        bounds.expandByPoint(point.set(home.x + scale / 2, home.y + (scale * aspect) / 2, 0));
      }
      stack.localToWorld(bounds.getCenter(target));
      return { width: (bounds.max.x - bounds.min.x) * stack.scale.x, height: (bounds.max.y - bounds.min.y) * stack.scale.x };
    },
  };

  return {
    plate,
    stack,
    focus,
    layout(isTall: boolean) {
      tall = isTall;
      place();
    },
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

      // The screens leave from behind the main one, growing as they go, and angle in until the camera moves in.
      for (const { screen, mesh, home, scale } of settled) {
        const t = partProgress(screen, explode);
        mesh.visible = t > 0.001;
        mesh.position.set(home.x * t, home.y * t, THREE.MathUtils.lerp(-0.004, home.z, Math.min(1, t * 4)));
        mesh.scale.setScalar(THREE.MathUtils.lerp(0.3, 1, t) * scale);
        mesh.rotation.set(Math.sign(home.y) * TURN * 0.5 * t * (1 - focused), -Math.sign(home.x) * TURN * t * (1 - focused), 0);
        mesh.updateMatrix();
      }
      dim(k);

      // The AI at work: faint on the closed case's display, full once it's open.
      scan.uniforms.uTime.value = time;
      // Lighter over a dense screen, and lighter again while the camera is in on it.
      scan.uniforms.uStrength.value = (0.15 + 0.35 * k) * (1 - 0.45 * focused);
      stream.uniforms.uStrength.value = k;
      streams.visible = legs.visible = k > 0.01;
      if (streams.visible) {
        settled.forEach(({ screen, mesh, home, scale, aspect }, f) => {
          const t = partProgress(screen, explode);
          const sx = Math.sign(home.x);
          const sy = Math.sign(home.y);
          // Leg: from inside the main screen's corner, to the screen's nearest corner.
          start.set(sx * width * 0.3, sy * height * 0.3, 0.0002);
          end.set(mesh.position.x - (sx * scale * t) / 2, mesh.position.y - (sy * scale * aspect * t) / 2, mesh.position.z);
          legPositions.setXYZ(f * 4, start.x, start.y, start.z);
          legPositions.setXYZ(f * 4 + 1, end.x, start.y + (end.y - start.y) * 0.35, end.z);
          legPositions.setXYZ(f * 4 + 2, end.x, start.y + (end.y - start.y) * 0.35, end.z);
          legPositions.setXYZ(f * 4 + 3, end.x, end.y, end.z);
          // Records arc out towards the viewer from the main screen to the screen's centre.
          start.set(sx * width * 0.18, sy * height * 0.12, 0.001);
          end.copy(mesh.position);
          bend.lerpVectors(start, end, 0.5);
          bend.z += 0.1 * width;
          for (let i = 0; i < PARTICLES; i++) {
            const p = (time * 0.28 + i / PARTICLES + f * 0.23) % 1;
            const u = 1 - p;
            const n = f * PARTICLES + i;
            flowPositions.setXYZ(n, u * u * start.x + 2 * u * p * bend.x + p * p * end.x, u * u * start.y + 2 * u * p * bend.y + p * p * end.y, u * u * start.z + 2 * u * p * bend.z + p * p * end.z);
            flowFades.setX(n, Math.pow(Math.sin(Math.PI * p), 1.5) * t);
          }
        });
        legPositions.needsUpdate = true;
        flowPositions.needsUpdate = true;
        flowFades.needsUpdate = true;
      }

      lines.update(k, inverse);
    },
  };
}
