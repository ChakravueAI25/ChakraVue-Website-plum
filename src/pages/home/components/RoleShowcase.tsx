import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { finePointer, reduceMotion } from "../../../motion/env";
import { BrandText } from "../../../shared/components/BrandText";
import { Link } from "../../../shared/components/Link";
import { roles } from "../../../shared/data/audiences";
import { platforms } from "../../product-suite/platforms";
import "./roles.css";

/** Phones stack the products and change role only when asked (a changing height would move the page). */
const compact = typeof window !== "undefined" && window.matchMedia("(max-width: 700px)").matches;

/**
 * "Who are you here as?" (Home; redesigned 2026-10-30 as a product
 * discovery block): a compact introduction, the three roles as selectable
 * cards in one row, then the products for the chosen role in an even grid
 * that fits however many there are (one, two or three), then the software
 * platforms and the link to the whole suite.
 *
 * The roles and their products are `roles` in shared/data/audiences.ts.
 * Every role's products share one grid cell, so on wider screens changing
 * role never moves the page; the old set fades out and the new one rises a
 * few pixels in. The roles play by themselves there: the active card's bar
 * fills, and when it ends the next role comes in, so the bar is the only
 * timer. Picking a role restarts it. Pointing at the cards or the products,
 * keyboard focus inside, the pause button, the section being off screen or
 * the tab being hidden all pause it. On phones and under reduced motion
 * nothing changes by itself.
 */
export function RoleShowcase() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  // Bumped on every manual pick, so the bar starts again from empty.
  const [run, setRun] = useState(0);
  const [held, setHeld] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const count = roles.length;
  const autoplay = !reduceMotion && !compact;

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(section);
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const hover = finePointer ? { onPointerEnter: () => setHovered(true), onPointerLeave: () => setHovered(false) } : {};
  const playing = autoplay && !held && !hovered && !focused && inView && !hidden;

  const choose = (index: number) => {
    setActive(index);
    setRun((n) => n + 1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const dir = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    event.preventDefault();
    const next = (active + dir + count) % count;
    choose(next);
    ref.current?.querySelectorAll<HTMLElement>(".role__tab")[next]?.focus();
  };

  return (
    <section
      ref={ref}
      id="who-are-you-here-as"
      className="role section"
      aria-labelledby="role-title"
      onFocus={(event) => {
        // Keyboard focus only: a tap on a role shouldn't stop the roles playing.
        if ((event.target as HTMLElement).matches(":focus-visible")) setFocused(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      {/* A soft plum light that swells as each role comes in. */}
      <span key={`glow-${active}-${run}`} className="role__glow" aria-hidden="true" />

      <div className="section__inner">
        <header className="role__head">
          <div>
            <p className="role__eyebrow" data-reveal>
              Built around you
            </p>
            <h2 id="role-title" className="hsec-title role__title" data-split>
              Who are you here as?
            </h2>
          </div>
          <div className="role__aside">
            <p className="role__intro" data-reveal>
              Discover the intelligence, tools and technology designed around your role in advancing healthcare.
            </p>
            {autoplay && (
              <button
                type="button"
                className="role__pause"
                onClick={() => setHeld((h) => !h)}
                aria-label={held ? "Play the roles" : "Pause the roles"}
              >
                {held ? (
                  <svg aria-hidden="true" viewBox="0 0 24 24" width="11" height="11">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg aria-hidden="true" viewBox="0 0 24 24" width="11" height="11">
                    <rect x="6" y="5" width="4" height="14" />
                    <rect x="14" y="5" width="4" height="14" />
                  </svg>
                )}
                <span aria-hidden="true">{held ? "Play" : "Pause"}</span>
              </button>
            )}
          </div>
        </header>

        <div className="role__explore" {...hover}>
          <div className="role__control">
            <div className="role__tabs" role="tablist" aria-label="Who are you?" onKeyDown={onKeyDown}>
              {roles.map((r, i) => {
                const on = i === active;
                return (
                  <button
                    key={r.id}
                    id={`role-tab-${r.id}`}
                    type="button"
                    role="tab"
                    className={`role__tab${on ? " is-active" : ""}`}
                    aria-selected={on}
                    aria-controls={`role-panel-${r.id}`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => choose(i)}
                  >
                    <span className="role__tab-top">
                      <span className="role__tab-index">{String(i + 1).padStart(2, "0")}</span>
                      {/* Hollow when idle, filled when chosen: the state reads without colour. */}
                      <span className="role__mark" aria-hidden="true" />
                    </span>
                    <span className="role__tab-label">{r.label}</span>
                    <span className="role__tab-line">{r.line}</span>
                    <span className="role__tab-meta">
                      {r.products.length} {r.products.length === 1 ? "product" : "products"}
                    </span>
                    <span className="role__bar" aria-hidden="true">
                      {on && (
                        <span
                          key={run}
                          className={`role__fill${autoplay ? "" : " is-still"}`}
                          style={autoplay ? { animationPlayState: playing ? "running" : "paused" } : undefined}
                          onAnimationEnd={autoplay ? () => setActive((active + 1) % count) : undefined}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Phones show the chosen role's line here instead of inside the cards. */}
            <div className="role__lead" data-motion="own">
              {roles.map((r, i) => (
                <p key={r.id} className={`role__lead-line${i === active ? " is-active" : ""}`} aria-hidden="true">
                  {r.line}
                </p>
              ))}
            </div>

          </div>

          <div className="role__stage" data-motion="own">
            {roles.map((r, i) => (
              <div
                key={r.id}
                id={`role-panel-${r.id}`}
                role="tabpanel"
                aria-labelledby={`role-tab-${r.id}`}
                className={`role__products${i === active ? " is-active" : ""}`}
                data-count={Math.min(r.products.length, 3)}
                aria-hidden={i !== active}
                inert={i !== active}
              >
                {r.products.length === 0 ? (
                  <div className="role__empty">
                    <p>Products for {r.label.toLowerCase()} are on their way.</p>
                    <Link href="/contact-us" className="hsec-link">
                      Tell us what you need <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                ) : (
                  r.products.map((p) => (
                    <Link key={p.key} href={p.href} className="role__product" data-spotlight>
                      <span className="role__media">
                        <img
                          src={p.image}
                          alt={p.imageAlt}
                          loading="lazy"
                          decoding="async"
                          style={{ objectPosition: p.coverPosition } as CSSProperties}
                        />
                      </span>
                      <span className="role__product-body">
                        <span className="role__product-tag">{p.tagline}</span>
                        <span className="role__product-name">
                          <BrandText text={p.name} />
                          {p.status && <span className="role__status">{p.status}</span>}
                        </span>
                        <span className="role__product-line">{p.summary}</span>
                        <span className="role__product-cta">
                          {p.href.startsWith("/product-suite") ? "Explore product" : p.action}
                          <span aria-hidden="true">→</span>
                        </span>
                      </span>
                    </Link>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>

        {/* The other product category, then the whole suite. */}
        <div className="role__foot">
          <p className="role__more" data-reveal>
            <span className="role__more-label">Software platforms</span>
            {platforms.map((platform) => (
              <Link key={platform.id} href="/product-suite#platforms" className="role__chip">
                <BrandText text={platform.title} />
              </Link>
            ))}
          </p>
          <Link href="/product-suite" className="hsec-link role__all">
            View all products <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
