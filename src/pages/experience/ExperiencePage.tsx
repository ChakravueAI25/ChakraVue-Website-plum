import { useEffect, useRef } from "react";
import { whenRevealed } from "../../motion/gate";
import { gsap } from "../../motion/gsap";
import { scrollToTarget } from "../../motion/lenis";
import { useMotion, usePageMotion } from "../../motion/useMotion";
import { BrandText } from "../../shared/components/BrandText";
import { Header } from "../../shared/components/Header";
import { Link } from "../../shared/components/Link";
import { ContactMap } from "../contact/components/ContactMap";
import "../contact/contact.css";
import { SignInForm } from "./components/SignInForm";
import { VisitForm } from "./components/VisitForm";
import { products } from "../product-suite/data";
import { beforeAfter, centre, hero, paths, tryOnline } from "./data";
import "./experience.css";

/**
 * Two ways to experience ChakraVue AI: sign in and try it online, or book a
 * visit to the Experience Centre. A conventional page: nothing pins, and
 * sections simply animate in as they arrive.
 */
export function ExperiencePage() {
  const ref = useRef<HTMLElement>(null);
  usePageMotion();

  // Arriving from outside the site on /experience#visit (or #signin): the
  // router handles in-site links; a fresh page load lands here.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !document.querySelector(hash)) return;
    return whenRevealed(() => window.setTimeout(() => scrollToTarget(hash, true), 60));
  }, []);

  // Each before → after pair: the old thing dims as the new one lights.
  useMotion(ref, (root) => {
    root.querySelectorAll(".xp-pair").forEach((pair, i) => {
      gsap
        .timeline({ scrollTrigger: { trigger: pair, start: "top 85%", once: true }, delay: i * 0.08 })
        .from(pair.querySelector(".xp-pair__before"), { autoAlpha: 0, x: -24, duration: 0.8, ease: "cv.out" })
        .from(pair.querySelector(".xp-pair__arrow"), { autoAlpha: 0, scaleX: 0, transformOrigin: "0 50%", duration: 0.6, ease: "cv.out" }, 0.3)
        .from(pair.querySelector(".xp-pair__after"), { autoAlpha: 0, x: 24, duration: 0.8, ease: "cv.out" }, 0.5)
        .to(pair.querySelector(".xp-pair__before"), { opacity: 0.45, duration: 0.8 }, 0.9);
    });
  });

  return (
    <main ref={ref} className="site-shell experience-page">
      <Header />

      <section className="xp-hero section" aria-labelledby="xp-title">
        <div className="xp-hero__glow" aria-hidden="true" />
        <div className="section__inner">
          <p className="section-label" data-scramble>
            Experience
          </p>
          <h1 id="xp-title" className="xp-hero__title" data-split>
            {hero.title}
          </h1>
          <p className="xp-hero__lead" data-split="fade" data-delay="0.2">
            <BrandText text={hero.lead} />
          </p>

          <div className="xp-paths">
            {paths.map((path) => (
              <Link key={path.id} href={path.action.href} className={`xp-path xp-path--${path.id}`} data-reveal data-spotlight>
                <span className="xp-path__tag">{path.tag}</span>
                <h2 className="xp-path__title">{path.title}</h2>
                <p className="xp-path__body">
                  <BrandText text={path.body} />
                </p>
                <span className="xp-path__action">
                  {path.action.label} <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="signin" className="xp-block section">
        <div className="section__inner xp-split">
          <SignInForm />
          <aside className="xp-side" data-reveal>
            <p className="xp-form__eyebrow">{tryOnline.eyebrow}</p>
            <h2 className="xp-side__title">{tryOnline.title}</h2>
            <ol className="xp-side__list">
              {products.map((product) => (
                <li key={product.id}>
                  <span>{product.index}</span>
                  {product.title}
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <section id="visit" className="xp-block xp-block--visit section">
        <div className="section__inner xp-split">
          <VisitForm />
          <aside className="xp-side" data-reveal>
            <p className="xp-form__eyebrow">Where</p>
            <h2 className="xp-side__title">
              <BrandText text={centre.name} />
            </h2>
            <p className="xp-centre__host">{centre.host}</p>
            <address className="xp-centre__address">{centre.address}</address>
            <p className="xp-centre__hours">
              {centre.hours} <span className="xp-confirm">To confirm</span>
            </p>
          </aside>
        </div>
        <div className="section__inner">
          <ContactMap label={centre.mapLabel} src={centre.mapSrc} />
        </div>
      </section>

      <section className="xp-close section" aria-labelledby="xp-close-title">
        <div className="xp-close__glow" aria-hidden="true" />
        <div className="section__inner">
          <h2 id="xp-close-title" className="xp-close__title" data-split>
            {beforeAfter.title}
          </h2>
          <p className="xp-close__lead" data-split="fade" data-delay="0.15">
            {beforeAfter.lead}
          </p>
          <ul className="xp-pairs">
            {beforeAfter.pairs.map((pair) => (
              <li key={pair.before} className="xp-pair">
                <span className="xp-pair__before">{pair.before}</span>
                <span className="xp-pair__arrow" aria-label="becomes" />
                <span className="xp-pair__after">{pair.after}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
