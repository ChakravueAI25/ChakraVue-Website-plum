import { finePointer, reduceMotion } from "./env";

/**
 * A faint, moving film grain over the whole site. Overlay blending leaves
 * true black untouched and only textures the glows. Desktop only: phones
 * don't need the extra full-screen layer.
 */
export function Grain() {
  if (reduceMotion || !finePointer) return null;
  return <div className="grain" aria-hidden="true" />;
}
