import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { scrollToTarget, scrollToTop } from "../motion/lenis";
import { pageTransition } from "../motion/transition";

/** Shown in the middle of the iris while the next page loads. */
const LABELS: Record<string, string> = {
  "/": "ChakraVue AI",
  "/product-suite": "Product Suite",
  "/services": "Services",
  "/about-us": "About Us",
  "/blog": "Blog",
  "/contact-us": "Contact Us",
  "/privacy-policy": "Privacy Policy",
};

function normalize(pathname: string) {
  const path = pathname.replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

function currentPath() {
  return normalize(window.location.pathname);
}

// One route store for the whole app (App and Header both read it), so a
// navigation re-renders everything in a single synchronous commit, while
// the iris has the screen covered.
let path = currentPath();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function commit(next: string) {
  if (next === path) return;
  path = next;
  flushSync(() => listeners.forEach((listener) => listener()));
}

if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";

window.addEventListener("popstate", () => {
  const next = currentPath();
  if (next === path) return; // hash-only change within the page
  void pageTransition({ label: LABELS[next], swap: () => commit(currentPath()) });
});

export type Origin = { x: number; y: number };

export function navigate(href: string, origin?: Origin) {
  const url = new URL(href, window.location.origin);
  const next = normalize(url.pathname);

  if (next === path) {
    const oldURL = window.location.href;
    window.history.pushState({}, "", url);
    // pushState announces nothing; components that open on a link (the platform console) listen for this.
    if (url.hash && url.href !== oldURL) window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL, newURL: url.href }));
    if (url.hash) scrollToTarget(url.hash);
    else scrollToTop(false);
    return;
  }

  void pageTransition({
    origin,
    label: LABELS[next],
    swap: () => {
      window.history.pushState({}, "", url);
      commit(next);
    },
    afterSwap: () => {
      if (url.hash) settleOn(url.hash);
    },
  });
}

/**
 * Jumps to an anchor on a page that has just mounted, and keeps it in view
 * while the page finishes laying out: the Product Suite theater grows by
 * thousands of pixels after mount (and Lenis clamps to the old height until
 * it measures again), which would leave a one-off jump to anything below it
 * far short. Stops once the anchor has held still for a moment.
 */
function settleOn(hash: string) {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  const until = performance.now() + 3000;
  let steady = 0;
  const follow = () => {
    const atBottom = window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 2;
    if (Math.abs(target.getBoundingClientRect().top) > 2 && !atBottom) {
      steady = 0;
      scrollToTarget(target, true);
    } else steady += 1;
    if (steady < 30 && performance.now() < until) requestAnimationFrame(follow);
  };
  follow();
}

export function useRoute() {
  return useSyncExternalStore(subscribe, () => path);
}
