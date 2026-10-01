import { useRef } from "react";
import { finePointer } from "../../motion/env";
import { gsap } from "../../motion/gsap";
import { useMotion, usePageMotion } from "../../motion/useMotion";
import { Header } from "../../shared/components/Header";
import { Link } from "../../shared/components/Link";
import { ChatVisual, FeaVisual } from "./components/ServiceVisuals";
import { DraftingSheet } from "./components/DraftingSheet";
import { principles, services, type Service } from "./data";
import "./services.css";

/**
 * Hero: an engineering drawing sheet that drafts itself in, stroke by
 * stroke, with a drafting crosshair and coordinates following the pointer.
 */
function ServicesHero() {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    const lines = root.querySelectorAll<SVGElement>(".draft [data-draw]");
    gsap
      .timeline({ delay: 0.2 })
      .fromTo(lines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, stagger: 0.035, ease: "power2.inOut" })
      .from(root.querySelectorAll(".draft__hatch, .draft__arrow, .draft text"), { autoAlpha: 0, duration: 0.8, stagger: 0.01, ease: "none" }, 0.9)
      .from(root.querySelectorAll(".svc-hero__index a"), { autoAlpha: 0, y: 24, duration: 0.9, stagger: 0.08, ease: "cv.out" }, 0.8);
    gsap.to(root.querySelector(".svc-hero__copy"), {
      yPercent: -18,
      autoAlpha: 0,
      ease: "none",
      scrollTrigger: { trigger: root, start: "top top", end: "bottom 35%", scrub: true },
    });
    gsap.to(root.querySelector(".draft"), {
      yPercent: 8,
      ease: "none",
      scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
    });

    if (!finePointer) return;
    const cross = root.querySelector<HTMLElement>(".svc-hero__cross");
    const readout = root.querySelector<HTMLElement>(".svc-hero__readout");
    if (!cross || !readout) return;
    const x = gsap.quickTo(cross, "--x", { duration: 0.35, ease: "power3.out" });
    const y = gsap.quickTo(cross, "--y", { duration: 0.35, ease: "power3.out" });
    const onMove = (event: PointerEvent) => {
      const box = root.getBoundingClientRect();
      const px = event.clientX - box.left;
      const py = event.clientY - box.top;
      x(px);
      y(py);
      readout.textContent = `X ${(px / box.width).toFixed(3)}   Y ${(py / box.height).toFixed(3)}`;
    };
    const onEnter = () => gsap.to(cross, { autoAlpha: 1, duration: 0.4 });
    const onLeave = () => gsap.to(cross, { autoAlpha: 0, duration: 0.4 });
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
    };
  });

  return (
    <section ref={ref} className="svc-hero" aria-labelledby="svc-hero-title">
      <DraftingSheet />
      <div className="svc-hero__shade" aria-hidden="true" />
      <div className="svc-hero__cross" aria-hidden="true">
        <span className="svc-hero__readout" />
      </div>
      <div className="section__inner svc-hero__copy">
        <p className="section-label" data-scramble>
          Services
        </p>
        <h1 id="svc-hero-title" className="svc-hero__title" data-split>
          Research, Intelligence, and Technology Working Toward Better Health.
        </h1>
        <p className="svc-hero__lead" data-split="fade" data-delay="0.3">
          Biomechanical simulation and digital care programmes: specialist services from the team that builds ChakraVue AI.
        </p>
      </div>
      <nav className="svc-hero__index section__inner" aria-label="Services">
        {services.map((s) => (
          <Link key={s.id} href={`/services#${s.id}`}>
            <span>{s.index}</span>
            {s.title}
            <i aria-hidden="true">→</i>
          </Link>
        ))}
      </nav>
    </section>
  );
}

function Visual({ service }: { service: Service }) {
  if (service.visual === "fea") return <FeaVisual />;
  return <ChatVisual />;
}

/** One service: the copy on one side, its live diagram on the other. */
function ServiceChapter({ service, reverse }: { service: Service; reverse: boolean }) {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    // The diagram's frame opens as it arrives, then drifts against the scroll.
    const stage = root.querySelector(".svc__stage");
    gsap.fromTo(
      stage,
      { clipPath: "inset(12% 12% 12% 12% round 28px)", autoAlpha: 0.2 },
      { clipPath: "inset(0% 0% 0% 0% round 28px)", autoAlpha: 1, duration: 1.6, ease: "cv.inOut", scrollTrigger: { trigger: root, start: "top 72%", once: true } },
    );
    gsap.fromTo(stage, { y: 50 }, { y: -50, ease: "none", scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(root.querySelectorAll(".svc__list li, .svc__case, .svc__flow li"), {
      autoAlpha: 0,
      y: 18,
      duration: 0.7,
      stagger: 0.05,
      ease: "cv.out",
      scrollTrigger: { trigger: root.querySelector(".svc__detail"), start: "top 82%", once: true },
    });
  });

  return (
    <section ref={ref} id={service.id} className={`svc svc--${service.visual}${reverse ? " svc--reverse" : ""}`} aria-labelledby={`${service.id}-title`}>
      <span className="svc__glow" aria-hidden="true" />
      <div className="section__inner svc__grid">
        <div className="svc__copy">
          <p className="svc__meta">
            <b>{service.index}</b> / {String(services.length).padStart(2, "0")}
            <span className="svc__tag">{service.tag}</span>
          </p>
          <h2 id={`${service.id}-title`} className="svc__title" data-split>
            {service.title}
          </h2>
          <p className="svc__lead" data-split="fade" data-delay="0.15">
            {service.lead}
          </p>
          <div className="svc__detail">
            {service.groups.map((group) => (
              <div key={group.heading} className="svc__group">
                <h3>{group.heading}</h3>
                <ul className="svc__list">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="svc__stage">
          <Visual service={service} />
        </div>
      </div>

      {service.cases && (
        <div className="section__inner svc__cases">
          {service.cases.map((c, i) => (
            <article key={c.title} className="svc__case" data-spotlight>
              <p className="svc__case-index">Case study {String(i + 1).padStart(2, "0")}</p>
              <h3>{c.title}</h3>
              <p className="svc__case-sub">{c.subtitle}</p>
              <ul>
                {c.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className="svc__case-outcome">
                <b>Outcome</b>
                {c.outcome}
              </p>
              <p className="svc__case-for">
                <b>Ideal for</b>
                {c.audience}
              </p>
            </article>
          ))}
        </div>
      )}

      {service.flow && (
        <ol className="section__inner svc__flow" aria-label={`${service.title} workflow`}>
          {service.flow.map((step, i) => (
            <li key={step}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {step}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Principles() {
  return (
    <section className="svc-why" aria-labelledby="svc-why-title">
      <div className="section__inner">
        <header className="svc-why__head">
          <p className="section-label" data-scramble>
            Why work with us
          </p>
          <h2 id="svc-why-title" className="svc-why__title" data-split>
            A method you can put in front of a design review.
          </h2>
        </header>
        <ul className="svc-why__grid">
          {principles.map((p, i) => (
            <li key={p.title} data-reveal data-delay={String(i * 0.08)} data-spotlight>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>
        <div className="svc-why__cta" data-reveal>
          <p>
            <b>Have a project in mind?</b> Tell us about your requirements.
          </p>
          <Link href="/contact-us" className="svc-why__btn" data-magnetic="0.25">
            Contact us <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ServicesPage() {
  usePageMotion();

  return (
    <main className="site-shell services-page">
      <Header />
      <ServicesHero />
      {services.map((service, i) => (
        <ServiceChapter key={service.id} service={service} reverse={i % 2 === 1} />
      ))}
      <Principles />
    </main>
  );
}
