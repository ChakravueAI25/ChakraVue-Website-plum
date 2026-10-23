import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { whenRevealed } from "../../motion/gate";
import { gsap } from "../../motion/gsap";
import { scrollToTarget } from "../../motion/lenis";
import { reduceMotion } from "../../motion/env";
import { usePageMotion } from "../../motion/useMotion";
import { BrandText } from "../../shared/components/BrandText";
import { Header } from "../../shared/components/Header";
import { JoinChakraVue } from "../../shared/components/JoinChakraVue";
import { Link } from "../../shared/components/Link";
import { BoxStory } from "./components/BoxStory";
import { audiences, box, hero, safety } from "./data";
import "./hospital-system.css";

/**
 * The hospital system ChakraVue AI runs in a hospital today, told by
 * audience. Conventional and unpinned: hero, four audience tabs, the
 * safety band, what's coming with the Box (opening with the Box story),
 * then Join ChakraVue AI. All copy lives in data.ts.
 */
export function HospitalSystemPage() {
  usePageMotion();

  // A fresh page load on /hospital-system#box (or #join) lands on it.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || !document.querySelector(hash)) return;
    return whenRevealed(() => window.setTimeout(() => scrollToTarget(hash, true), 60));
  }, []);

  return (
    <main className="site-shell hospital-page">
      <Header />

      <section className="hs-hero section" aria-labelledby="hs-title">
        <div className="hs-hero__glow" aria-hidden="true" />
        <div className="section__inner">
          <p className="section-label" data-scramble>
            {hero.label}
          </p>
          <p className="hs-badge" data-reveal>
            <span className="hs-badge__dot" aria-hidden="true" />
            {hero.badge}
          </p>
          <h1 id="hs-title" className="hs-hero__title" data-split>
            {hero.title}
          </h1>
          <div className="hs-hero__actions" data-reveal>
            <Link href={hero.primary.href} className="hs-btn hs-btn--primary" data-magnetic="0.2">
              <BrandText text={hero.primary.label} />
              <span aria-hidden="true">→</span>
            </Link>
            <Link href={hero.secondary.href} className="hs-btn hs-btn--ghost">
              {hero.secondary.label}
            </Link>
          </div>
        </div>
      </section>

      <AudienceTabs />

      <section className="hs-safety section" aria-labelledby="hs-safety-title">
        <div className="section__inner">
          <header className="hs-head">
            <h2 id="hs-safety-title" className="hs-title" data-split>
              {safety.title}
            </h2>
            <p className="hs-lead" data-split="fade" data-delay="0.15">
              {safety.lead}
            </p>
          </header>
          <ul className="hs-safety__grid">
            {safety.cards.map((card, i) => (
              <li key={card.title} className="hs-safety__card" data-reveal data-spotlight>
                <span className="hs-safety__index">{String(i + 1).padStart(2, "0")}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="box" className="hs-box section" aria-labelledby="hs-box-title">
        <div className="section__inner">
          <header className="hs-head">
            <p className="section-label" data-scramble>
              <BrandText text={box.label} />
            </p>
            <h2 id="hs-box-title" className="hs-title" data-split>
              <BrandText text={box.title} />
            </h2>
            <p className="hs-lead" data-split="fade" data-delay="0.15">
              {box.lead}
            </p>
          </header>
          <BoxStory />
          <ul className="hs-box__grid">
            {box.cards.map((card) => (
              <li key={card.title} className="hs-card" data-reveal data-spotlight>
                <span className="hs-status">{box.status}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <JoinChakraVue variant="page" id="join" />
    </main>
  );
}

/** Hospital · Doctors · Patients · Devices: a proper tablist (arrow keys move between tabs). */
function AudienceTabs() {
  const [active, setActive] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const first = useRef(true);
  const audience = audiences[active];

  // The new tab's cards rise in, one after another.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduceMotion || !panelRef.current) return;
    const tween = gsap.from(panelRef.current.querySelectorAll(".hs-card, .hs-more"), {
      autoAlpha: 0,
      y: 18,
      duration: 0.6,
      stagger: 0.05,
      ease: "cv.out",
      clearProps: "transform,opacity,visibility",
    });
    return () => {
      tween.progress(1).kill();
    };
  }, [active]);

  const onKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    const jump = event.key === "Home" ? 0 : event.key === "End" ? audiences.length - 1 : null;
    if (!step && jump === null) return;
    event.preventDefault();
    const next = jump ?? (active + step + audiences.length) % audiences.length;
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section className="hs-audience section" aria-labelledby="hs-audience-title">
      <div className="section__inner">
        <header className="hs-head">
          <h2 id="hs-audience-title" className="hs-title" data-split>
            What it does, and for whom.
          </h2>
        </header>

        <div className="hs-tabs" role="tablist" aria-label="Who it's for" data-reveal>
          {audiences.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`hs-tab-${item.id}`}
              aria-selected={i === active}
              aria-controls={`hs-panel-${item.id}`}
              tabIndex={i === active ? 0 : -1}
              className={`hs-tab${i === active ? " is-active" : ""}`}
              onClick={() => setActive(i)}
              onKeyDown={onKey}
            >
              <span className="hs-tab__index">{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div ref={panelRef} key={audience.id} id={`hs-panel-${audience.id}`} role="tabpanel" aria-labelledby={`hs-tab-${audience.id}`} className="hs-panel">
          <p className="hs-panel__intro">{audience.intro}</p>
          <ul className="hs-cards">
            {audience.cards.map((card) => (
              <li key={card.title} className="hs-card" data-spotlight>
                <h3>{card.title}</h3>
                <p>
                  <BrandText text={card.body} />
                </p>
              </li>
            ))}
          </ul>
          {audience.more.length > 0 && (
            <details className="hs-more">
              <summary>See everything</summary>
              <ul>
                {audience.more.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    </section>
  );
}
