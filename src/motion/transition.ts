import { reduceMotion } from "./env";
import { cover, reveal } from "./gate";
import { ScrollTrigger } from "./gsap";
import { closeIris, openIris } from "./iris";
import { lockScroll, scrollToTop } from "./lenis";

export type TransitionOptions = {
  /** Renders the new route. Must commit synchronously (the router uses flushSync). */
  swap: () => void;
  origin?: { x: number; y: number };
  label?: string;
  afterSwap?: () => void;
};

let running = false;
let pending: TransitionOptions | null = null;
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function swapNow({ swap, afterSwap }: TransitionOptions) {
  swap();
  scrollToTop();
  afterSwap?.();
}

/** Close the iris on the click, swap the page while it's dark, open onto the new page. */
export async function pageTransition(options: TransitionOptions) {
  if (reduceMotion) {
    swapNow(options);
    ScrollTrigger.refresh();
    return;
  }
  if (running) {
    // Back/forward pressed mid-transition: the latest destination wins.
    pending = options;
    return;
  }

  running = true;
  try {
    cover();
    lockScroll(true);
    await closeIris(options.origin, options.label);
    const target = pending ?? options;
    pending = null;
    swapNow(target);
    await nextFrame();
    await wait(target.label ? 240 : 80);
    const opening = openIris();
    lockScroll(false);
    reveal();
    await opening;
  } finally {
    running = false;
  }

  if (pending) {
    const next = pending;
    pending = null;
    void pageTransition(next);
  }
}
