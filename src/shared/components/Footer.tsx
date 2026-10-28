import { useRef } from "react";
import { scrollToTop } from "../../motion/lenis";
import { gsap } from "../../motion/gsap";
import { useMotion } from "../../motion/useMotion";
import { address, contactDetails } from "../../pages/contact/data";
import { navItems } from "../data/content";
import { BrandText } from "./BrandText";
import { Link } from "./Link";
import "./footer.css";
import { Logo } from "../../brand/Logo";

const WORDMARK = "ChakraVue AI";
// The Privacy Policy ("More" in the bar) is already in the bottom row, so it isn't repeated here.
const exploreLinks = navItems.filter((item) => item.href !== "/privacy-policy");
const reachLinks = contactDetails.filter((detail) => detail.href);

/**
 * Closing band, the same on every page and kept compact: Explore on the
 * left, Reach us in the middle and Office on the right, over the large
 * faint mark centred behind them, then the wordmark. It rises from beneath
 * the content as you reach it, and the wordmark lifts in letter by letter.
 */
export function Footer() {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    const inner = root.querySelector(".footer__inner");
    gsap.fromTo(
      inner,
      { yPercent: -18 },
      { yPercent: 0, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "top 25%", scrub: true } },
    );

    // The mark arrives exactly as supplied, never turned: it rises and
    // settles into place, then its glyphs light in turn around the ring.
    const emblem = root.querySelector(".footer__emblem");
    gsap
      .timeline({ scrollTrigger: { trigger: root, start: "top 75%", once: true } })
      .fromTo(emblem, { autoAlpha: 0, scale: 0.88, y: 40 }, { autoAlpha: 1, scale: 1, y: 0, duration: 1.6, ease: "cv.out" })
      .fromTo(
        root.querySelectorAll(".footer__emblem .logo__glyph"), // in order round the ring
        { opacity: 0.2 },
        { opacity: 1, duration: 0.5, stagger: { each: 0.025 }, ease: "power2.out" },
        0.3,
      );

    const chars = root.querySelectorAll(".footer__mark-char");
    gsap.from(chars, {
      yPercent: 105,
      duration: 1.5,
      stagger: 0.05,
      clearProps: "transform",
      scrollTrigger: { trigger: root.querySelector(".footer__mark"), start: "top 98%", once: true },
    });
  });

  return (
    <footer ref={ref} className="footer">
      <div className="footer__glow" aria-hidden="true" />

      <div className="footer__emblem-wrap" aria-hidden="true">
        <Logo className="footer__emblem" disc={false} />
      </div>

      <div className="section__inner footer__inner">
        <nav className="footer__col footer__col--explore" aria-label="Footer">
          <h3>Explore</h3>
          <div className="footer__links">
            {exploreLinks.map((item) => (
              <Link key={item.href + item.label} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="footer__col footer__col--reach">
          <h3>Reach us</h3>
          <div className="footer__links">
            {reachLinks.map(({ label, value, href }) => {
              const external = href?.startsWith("http");
              return (
                <a key={label} href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
                  {label === "LinkedIn" ? "LinkedIn" : value}
                </a>
              );
            })}
          </div>
        </div>
        <div className="footer__col footer__col--office">
          <h3>Office</h3>
          <address>{address}</address>
        </div>
      </div>

      <div className="footer__mark" aria-hidden="true">
        {[...WORDMARK].map((char, i) => (
          <span key={i} className="footer__mark-char">
            {char === " " ? " " : char}
          </span>
        ))}
      </div>

      <div className="section__inner footer__bottom">
        <span>
          © {new Date().getFullYear()} <BrandText text="ChakraVue AI" /> Private Limited
        </span>
        <Link href="/privacy-policy">Privacy Policy</Link>
        <button type="button" className="footer__top" onClick={() => scrollToTop(false)} data-magnetic="0.4">
          Back to top <span aria-hidden="true">↑</span>
        </button>
      </div>
    </footer>
  );
}
