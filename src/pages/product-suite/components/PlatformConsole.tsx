import { useLayoutEffect, useRef } from "react";
import { reduceMotion } from "../../../motion/env";
import { gsap, ScrollTrigger } from "../../../motion/gsap";
import { Link } from "../../../shared/components/Link";
import { platforms, type App, type Platform } from "../platforms";
import "./platforms.css";
import { BrandText } from "../../../shared/components/BrandText";

/** A line drawing for each platform; every path draws itself on arrival. */
function Glyph({ kind }: { kind: NonNullable<Platform["glyph"]> | App["glyph"] }) {
  const p = { pathLength: 1, className: "plat-glyph__line" };
  return (
    <svg className="plat-glyph" viewBox="0 0 120 120" aria-hidden="true">
      {kind === "patient" && (
        <>
          <rect {...p} x="38" y="8" width="44" height="104" rx="8" />
          <path {...p} d="M46 46 C 54 34 66 34 74 46 C 66 58 54 58 46 46 Z" className="plat-glyph__line plat-glyph__line--hot" />
          <circle {...p} cx="60" cy="46" r="5" className="plat-glyph__line plat-glyph__line--hot" />
          <rect {...p} x="48" y="72" width="24" height="10" rx="5" />
          <path {...p} d="M60 72 V82 M52 98 h16" />
        </>
      )}
      {kind === "doctor" && (
        <>
          <path {...p} d="M30 14 V40 C 30 58 58 58 58 40 V14" />
          <path {...p} d="M44 56 V70 C 44 92 78 92 78 70 V62" />
          <circle {...p} cx="78" cy="54" r="8" className="plat-glyph__line plat-glyph__line--hot" />
          <rect {...p} x="72" y="88" width="36" height="24" rx="4" className="plat-glyph__line plat-glyph__line--hot" />
          <path {...p} d="M108 94 L116 90 V110 L108 106" />
        </>
      )}
      {kind === "bundle" && (
        <>
          <rect {...p} x="12" y="22" width="36" height="76" rx="7" />
          <rect {...p} x="72" y="22" width="36" height="76" rx="7" />
          <circle {...p} cx="30" cy="48" r="7" className="plat-glyph__line plat-glyph__line--hot" />
          <path {...p} d="M80 50 C 84 42 96 42 100 50 C 96 58 84 58 80 50 Z" className="plat-glyph__line plat-glyph__line--hot" />
          <path {...p} d="M22 72 h16 M82 72 h16 M22 82 h10 M82 82 h10" />
          <path {...p} d="M48 60 C 56 50 64 70 72 60" className="plat-glyph__line plat-glyph__line--hot" />
        </>
      )}
      {kind === "wellness" && (
        <>
          <path {...p} d="M60 98 C 22 72 16 38 38 30 C 48 26 56 32 60 40 C 64 32 72 26 82 30 C 104 38 98 72 60 98 Z" />
          <path {...p} d="M12 62 H40 L46 48 L54 76 L60 62 H108" className="plat-glyph__line plat-glyph__line--hot" />
        </>
      )}
    </svg>
  );
}

/**
 * The software suite, shown like the hardware above it: one platform after
 * another, the copy on the left and its screen on the right. As each screen
 * comes into view its line drawing traces itself in and its features rise;
 * pointing at a screen runs a scan line down it. A bundle (the Doctor
 * Patient App) shows each of its apps on its own inside the one screen.
 */
export function PlatformConsole() {
  const ref = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || reduceMotion) return;
    const triggers = [...root.querySelectorAll<HTMLElement>(".soft")].map((row) => {
      const tl = gsap
        .timeline({ paused: true })
        .fromTo(row.querySelectorAll(".plat-glyph__line"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, stagger: 0.04, ease: "power2.inOut" }, 0)
        .fromTo(
          row.querySelectorAll(".plat-screen__features li, .plat-screen__flow li"),
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.04, ease: "cv.out" },
          0.15,
        );
      return ScrollTrigger.create({ trigger: row, start: "top 75%", once: true, onEnter: () => tl.play() });
    });
    return () => triggers.forEach((t) => t.kill());
  }, []);

  const scan = (row: HTMLElement) => {
    if (reduceMotion) return;
    gsap.fromTo(row.querySelector(".plat-screen__scan"), { yPercent: -100, autoAlpha: 1 }, { yPercent: 900, duration: 0.9, ease: "power2.inOut", overwrite: true });
  };

  return (
    <section ref={ref} id="platforms" className="plat section" aria-labelledby="plat-title">
      <div className="section__inner">
        <header className="plat__head">
          <p className="section-label" data-scramble>
            Software platforms
          </p>
          <h2 id="plat-title" className="plat__title" data-split>
            Our software suite.
          </h2>
          <p className="plat__lead" data-split="fade" data-delay="0.15">
            Planning, care and wellness platforms that ChakraVue AI has built alongside its devices.
          </p>
        </header>

        {platforms.map((platform) => (
          <article key={platform.id} id={platform.id} className="soft" aria-labelledby={`${platform.id}-title`}>
            <div className="spec__info">
              <p className="spec__count">
                Software <b>{platform.index}</b> / {platforms[platforms.length - 1].index}
              </p>
              <h3 id={`${platform.id}-title`} className="spec__title">
                <BrandText text={platform.title} />
              </h3>
              <p className="spec__tagline">
                <BrandText text={platform.category} />
              </p>
              <dl className="spec__grid">
                <div className="spec__cell spec__cell--wide">
                  <dt>Overview</dt>
                  <dd>{platform.summary}</dd>
                </div>
                {platform.note && (
                  <div className="spec__cell spec__cell--wide">
                    <dt>Use</dt>
                    <dd>{platform.note}</dd>
                  </div>
                )}
              </dl>
              <Link className="spec__cta" href={platform.id === "implant-planning" ? "/contact-us?interest=Dental%20Solutions" : "/contact-us"} data-magnetic="0.25">
                Talk to us <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="plat-screen" onPointerEnter={(event) => scan(event.currentTarget)}>
              <div className="plat-screen__bar" aria-hidden="true">
                <i />
                <i />
                <i />
                <span>chakravue://{platform.id}</span>
              </div>
              <span className="plat-screen__scan" aria-hidden="true" />
              <div className="plat-screen__content">
                {platform.glyph && (
                  <div className="plat-screen__art">
                    <Glyph kind={platform.glyph} />
                  </div>
                )}

                {platform.features.length > 0 && (
                  <ul className="plat-screen__features">
                    {platform.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                )}

                {platform.apps && (
                  <div className="plat-apps">
                    {platform.apps.map((app) => (
                      <article key={app.title} className="plat-app">
                        <div className="plat-app__head">
                          <Glyph kind={app.glyph} />
                          <h4 className="plat-app__title">
                            <BrandText text={app.title} />
                          </h4>
                        </div>
                        <p className="plat-app__summary">{app.summary}</p>
                        <ul className="plat-screen__features plat-app__features">
                          {app.features.map((f) => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                )}

                {platform.flow && (
                  <ol className="plat-screen__flow" aria-label="Workflow">
                    {platform.flow.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
