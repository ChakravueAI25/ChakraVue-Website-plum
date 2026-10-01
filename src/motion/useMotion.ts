import type { RefObject } from "react";
import { reduceMotion } from "./env";
import { whenRevealed } from "./gate";
import { useGSAP } from "./gsap";
import { initDeclarative } from "./reveal";

type Init = (root: HTMLElement) => void | (() => void);

/**
 * Component-level choreography. `init` runs once the curtain opens (right
 * away if it's already open), inside a GSAP context, so every tween,
 * ScrollTrigger and SplitText it creates is reverted on unmount. It may
 * return a cleanup for listeners and ticker callbacks.
 */
export function useMotion(scope: RefObject<HTMLElement | null>, init: Init, dependencies: unknown[] = []) {
  useGSAP(
    (context) => {
      if (reduceMotion) return;
      let alive = true;
      const cleanups: Array<() => void> = [];
      const off = whenRevealed(() => {
        const root = scope.current;
        if (!alive || !root) return;
        context.add(() => {
          const cleanup = init(root);
          if (typeof cleanup === "function") cleanups.push(cleanup);
        });
      });
      return () => {
        alive = false;
        off();
        cleanups.forEach((cleanup) => cleanup());
      };
    },
    { scope, dependencies },
  );
}

/** Page-level: wires every data-split / data-scramble / data-reveal / data-speed in the page. */
export function usePageMotion() {
  useGSAP((context) => {
    if (reduceMotion) return;
    let alive = true;
    const off = whenRevealed(() => {
      const main = document.querySelector<HTMLElement>("main.site-shell");
      if (!alive || !main) return;
      context.add(() => initDeclarative(main));
    });
    return () => {
      alive = false;
      off();
    };
  }, []);
}
