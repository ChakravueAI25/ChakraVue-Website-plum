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
    window.history.pushState({}, "", url);
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
      if (url.hash) scrollToTarget(url.hash, true);
    },
  });
}

export function useRoute() {
  return useSyncExternalStore(subscribe, () => path);
}
