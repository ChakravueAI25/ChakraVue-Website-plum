import { BrandText } from "../../../shared/components/BrandText";
import { audiences, DEMO_POINTS } from "../../../shared/data/audiences";
import { goTo } from "../demo";

const productCount = audiences.reduce((sum, audience) => sum + audience.items.length, 0);

/** The page's opening: the promise, one way in, and the page at a glance. */
export function DemoHero() {
  return (
    <section className="demo-hero section" aria-labelledby="demo-hero-title">
      <div className="demo-hero__bg" aria-hidden="true" />
      <div className="section__inner demo-hero__inner">
        <p className="section-label" data-scramble>
          Try Demo
        </p>
        <h1 id="demo-hero-title" className="demo-hero__title" data-split="chars" data-delay="0.15">
          Experience the Future of Surgery.
        </h1>
        <p className="demo-hero__lead" data-split="fade" data-delay="0.5">
          <BrandText text="Explore ChakraVue AI's surgical technology ecosystem. Choose the solution that fits your role, discover its capabilities, and request a guided demo." />
        </p>
        <div className="demo-hero__actions" data-reveal>
          <button type="button" className="demo-btn demo-btn--primary" data-magnetic="0.2" onClick={() => goTo("roles")}>
            Explore Demos <span aria-hidden="true">↓</span>
          </button>
        </div>
        <dl className="demo-hero__facts" data-reveal>
          <div>
            <dt>Demos</dt>
            <dd>{productCount}</dd>
          </div>
          <div>
            <dt>Roles</dt>
            <dd>{audiences.length}</dd>
          </div>
          <div>
            <dt>Demo points per product</dt>
            <dd>{DEMO_POINTS.toLocaleString("en-US")}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
