import { reduceMotion } from "./env";
import { ScrollTrigger } from "./gsap";

/**
 * The "curtain" state. While the preloader or a page transition covers the
 * screen, page entrance animations queue here instead of playing unseen;
 * they all start together the moment the curtain begins to open.
 */
let covered = !reduceMotion;
const queue = new Set<() => void>();

export function whenRevealed(cb: () => void): () => void {
  if (!covered) {
    cb();
    return () => {};
  }
  queue.add(cb);
  return () => queue.delete(cb);
}

export function cover() {
  covered = true;
}

export function reveal() {
  covered = false;
  const pending = [...queue];
  queue.clear();
  for (const cb of pending) {
    try {
      cb();
    } catch (error) {
      console.error("[motion]", error);
    }
  }
  // Pins add scroll distance, so triggers have to be measured in document order.
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
}
