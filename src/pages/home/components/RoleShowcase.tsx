import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { finePointer, reduceMotion } from "../../../motion/env";
import { BrandText } from "../../../shared/components/BrandText";
import { Link } from "../../../shared/components/Link";
import { roles } from "../../../shared/data/audiences";
import { platforms } from "../../product-suite/platforms";
import "./roles.css";

/**
 * "Who are you here as?" (Home, where the product showcase was; owner's
 * brief, 2026-10-29): the visitor's role on the left, the products made for
 * it on the right. Every role is rendered in the same grid cell, so changing
 * role never moves the page; CSS dissolves the old one out (fade, a little
 * blur and drift) and the new one in, its products staggered.
 *
 * It plays by itself: the active tab's bar fills, and when its animation
 * ends the next role comes in, so the bar is the only timer. Picking a role
 * restarts the bar. Pointing at the products or the controls (not the whole
 * section, which fills the screen), keyboard focus inside it, the
 * pause button, the
 * section being off screen or the tab being hidden all pause the bar.
 * Under reduced motion the bar doesn't run, so nothing changes by itself,
 * and the roles swap without the dissolve.
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
  const playing = !reduceMotion && !held && !hovered && !focused && inView && !hidden;

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
        // Keyboard focus only: a tap on a tab shouldn't stop the roles playing.
        if ((event.target as HTMLElement).matches(":focus-visible")) setFocused(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      {/* A soft plum light that swells as each role comes in. */}
      <span key={`glow-${active}-${run}`} className="role__glow" aria-hidden="true" />

      <div className="section__inner role__inner">
        <div className="role__side">
          <p className="role__eyebrow" data-reveal>
            Built around you
          </p>
          <h2 id="role-title" className="role__title" data-split>
            Who are you here as?
          </h2>

          <div className="role__who" data-motion="own">
            {roles.map((r, i) => (
              <div key={r.id} className={`role__state${i === active ? " is-active" : ""}`} aria-hidden={i !== active} inert={i !== active}>
                <p className="role__question">{r.question}</p>
                <p className="role__line">{r.line}</p>
              </div>
            ))}
          </div>

          <p className="role__count" aria-hidden="true">
            <span>{String(active + 1).padStart(2, "0")}</span> / {String(count).padStart(2, "0")}
          </p>

          <div className="role__controls" {...hover}>
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
                    <span className="role__tab-index">{String(i + 1).padStart(2, "0")}</span>
                    {r.label}
                    <span className="role__bar" aria-hidden="true">
                      {on && (
                        <span
                          key={run}
                          className="role__fill"
                          style={{ animationPlayState: playing ? "running" : "paused" }}
                          onAnimationEnd={() => setActive((active + 1) % count)}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            {!reduceMotion && (
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
              </button>
            )}
          </div>

          <Link href="/product-suite" className="hsec-link role__all">
            View all products <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="role__stage" data-motion="own" {...hover}>
          {roles.map((r, i) => (
            <div
              key={r.id}
              id={`role-panel-${r.id}`}
              role="tabpanel"
              aria-labelledby={`role-tab-${r.id}`}
              className={`role__state role__products${i === active ? " is-active" : ""}`}
              data-count={r.products.length}
              aria-hidden={i !== active}
              inert={i !== active}
            >
              {r.products.map((p, j) => (
                <Link key={p.key} href={p.href} className="role__product" style={{ "--i": j } as CSSProperties} data-spotlight>
                  <img src={p.image} alt={p.imageAlt} loading="lazy" decoding="async" style={{ objectPosition: p.coverPosition }} />
                  <span className="role__product-body">
                    <span className="role__product-name">
                      <BrandText text={p.name} />
                      {p.status && <span className="role__status">{p.status}</span>}
                    </span>
                    <span className="role__product-line">{p.summary}</span>
                    <span className="role__product-cta">
                      {p.href.startsWith("/product-suite") ? `Explore ${p.name}` : p.action}
                      <span aria-hidden="true">→</span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* The other product category: the software platforms, each on the Product Suite page. */}
      <div className="section__inner">
        <p className="role__more" data-reveal>
          <span className="role__more-label">Software platforms</span>
          {platforms.map((platform) => (
            <Link key={platform.id} href="/product-suite#platforms" className="role__chip">
              <BrandText text={platform.title} />
            </Link>
          ))}
        </p>
      </div>
    </section>
  );
}
