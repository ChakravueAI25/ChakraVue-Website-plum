import * as THREE from "three";
import { getGrade, onThemeChange } from "./theme";

/**
 * The palette's colour matrix as a live shader uniform, so WebGL scenes
 * follow the theme inside their own pipeline (a CSS filter on a live
 * canvas costs a readback every frame). Identity on the original palette.
 */
export function gradeUniform() {
  const uniform = { value: new THREE.Matrix4() };
  const sync = () => {
    const m = getGrade();
    if (!m) uniform.value.identity();
    else uniform.value.set(m[0], m[1], m[2], m[3], m[4], m[5], m[6], m[7], m[8], m[9], m[10], m[11], 0, 0, 0, 1);
  };
  sync();
  return { uniform, active: () => getGrade() !== null, dispose: onThemeChange(sync) };
}

/** Full-screen pass for a composer: grades the finished (sRGB) frame. */
export const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uGrade: { value: new THREE.Matrix4() } },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform mat4 uGrade;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      gl_FragColor = vec4(clamp((uGrade * vec4(texel.rgb, 1.0)).rgb, 0.0, 1.0), texel.a);
    }`,
};
