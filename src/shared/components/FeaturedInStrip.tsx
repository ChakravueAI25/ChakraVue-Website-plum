import { useRef } from "react";
import { gsap, ScrollTrigger } from "../../motion/gsap";
import { useMotion } from "../../motion/useMotion";
import { featuredLogos, featuredMedia } from "../data/content";
import { Link } from "./Link";

type FeaturedInStripProps = {
  className?: string;
};

/** One logo set per 46s at rest, the same pace as the original CSS marquee. */
const BASE_SPEED = 50 / 46;

/**
 * "We got featured in" band with a continuously scrolling logo marquee.
 * The track renders the logo list twice back-to-back and moves by exactly
 * one copy's width, so the loop is seamless regardless of viewport size.
 *
 * With motion on, the marquee answers the page: it speeds up and leans with
 * scroll velocity, follows the scroll direction, and eases almost to a stop
 * under the pointer. Without it, the CSS animation in global.css runs as before.
 */
export function FeaturedInStrip({ className = "" }: FeaturedInStripProps) {
  const ref = useRef<HTMLElement>(null);
  const loop = [...featuredLogos, ...featuredLogos];

  useMotion(ref, (root) => {
    const track = root.querySelector<HTMLElement>(".featured-strip__track");
    if (!track) return;
    track.classList.add("is-driven");

    const setX = gsap.quickSetter(track, "xPercent");
    const setSkew = gsap.quickSetter(track, "skewX", "deg");
    let x = 0;
    let speed = 1;
    let boost = 0;
    let skew = 0;
    let skewTarget = 0;
    let direction = -1;
    let hovering = false;

    ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const velocity = self.getVelocity();
        boost = Math.min(Math.abs(velocity) / 180, 9);
        direction = self.direction === 1 ? -1 : 1;
        skewTarget = gsap.utils.clamp(-6, 6, -velocity / 380);
      },
    });

    const onEnter = () => (hovering = true);
    const onLeave = () => (hovering = false);
    track.addEventListener("pointerenter", onEnter);
    track.addEventListener("pointerleave", onLeave);

    const tick = (_time: number, deltaMs: number) => {
      boost *= 0.94;
      skewTarget *= 0.9;
      speed += ((hovering ? 0.12 : 1 + boost) - speed) * 0.07;
      skew += (skewTarget - skew) * 0.12;
      x = gsap.utils.wrap(-50, 0, x + direction * BASE_SPEED * speed * (deltaMs / 1000));
      setX(x);
      setSkew(skew);
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      track.removeEventListener("pointerenter", onEnter);
      track.removeEventListener("pointerleave", onLeave);
      track.classList.remove("is-driven");
    };
  });

  return (
    <section ref={ref} className={`featured-strip ${className}`.trim()} aria-labelledby="featured-strip-title">
      <h2 id="featured-strip-title" className="featured-strip__title" data-scramble>
        We got featured in
      </h2>

      <div className="featured-strip__viewport">
        <ul className="featured-strip__track" aria-hidden="true">
          {/* Both copies load eagerly: the marquee scrolls the second copy
              into view via `transform`, which browsers' native lazy-load
              heuristics don't account for (they key off layout position, not
              the animated paint position) — lazy-loading it left it blank
              well after the page loaded, showing as a gap in the loop. */}
          {loop.map((logo, i) => (
            <li key={i} className={`featured-strip__logo featured-strip__logo--${logo.tile}`}>
              <img src={logo.src} alt="" loading="eager" />
            </li>
          ))}
        </ul>
      </div>

      {/* Real, non-duplicated list for assistive tech; the marquee above is decorative. */}
      <ul className="sr-only">
        {featuredMedia.map((logo) => (
          <li key={logo.name}>{logo.name}</li>
        ))}
      </ul>

      {/* Where the coverage came from, with the full story on the Blog page. */}
      <p className="featured-strip__note">
        National TV and digital media interviews at the AI Impact Summit 2026, New Delhi.{" "}
        <Link href="/blog#media">
          Read about it <span aria-hidden="true">→</span>
        </Link>
      </p>
    </section>
  );
}
