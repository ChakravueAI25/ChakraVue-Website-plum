import { reduceMotion } from "../../motion/env";
import { scrollToY } from "../../motion/lenis";
import type { Audience, AudienceItem } from "../../shared/data/audiences";

/** A product someone asked to try, with the audience it's listed for. */
export type DemoChoice = { item: AudienceItem; audience: Audience };

/** Scrolls a section's top to just under the fixed header. */
export function goTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  scrollToY(el.getBoundingClientRect().top + window.scrollY - 72, reduceMotion);
}
