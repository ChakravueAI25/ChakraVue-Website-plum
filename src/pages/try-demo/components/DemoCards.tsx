import { BrandText } from "../../../shared/components/BrandText";
import { Link } from "../../../shared/components/Link";
import { audiences, DEMO_POINTS } from "../../../shared/data/audiences";
import type { DemoChoice } from "../demo";

const points = DEMO_POINTS.toLocaleString("en-US");

/**
 * "Choose Your Demo": one card per product, laid out like a pricing page's
 * plans so they compare at a glance, each with its own declared allocation
 * and its own "Try Demo". A role filter keeps them in step with the picker
 * above: the chosen role's products are highlighted, the rest step back.
 */
export function DemoCards({
  selected,
  onFilter,
  onTry,
}: {
  selected: string | null;
  onFilter: (id: string | null) => void;
  onTry: (choice: DemoChoice) => void;
}) {
  const current = audiences.find((audience) => audience.id === selected);
  const cards = audiences.flatMap((audience) => audience.items.map((item) => ({ item, audience })));

  return (
    <section id="demos" className="demo-plans section" aria-labelledby="demos-title">
      <div className="section__inner">
        <header className="demo-head">
          <p className="section-label" data-scramble>
            Step 2
          </p>
          <h2 id="demos-title" className="demo-head__title" data-split>
            Choose Your Demo
          </h2>
          <p className="demo-head__lead" data-split="fade" data-delay="0.1">
            Explore the tools built for your role. Every listed product comes with a declared demo allocation of {points} points.
          </p>
        </header>

        <div className="demo-filter" role="group" aria-label="Show products for">
          <button type="button" className="demo-filter__chip" aria-pressed={!selected} onClick={() => onFilter(null)}>
            All products
          </button>
          {audiences.map((audience) => (
            <button
              key={audience.id}
              type="button"
              className="demo-filter__chip"
              aria-pressed={selected === audience.id}
              onClick={() => onFilter(audience.id)}
            >
              {audience.label}
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          {current
            ? `Highlighting ${current.items.length} ${current.items.length === 1 ? "product" : "products"} for ${current.label}.`
            : "Showing all products."}
        </p>

        <ul className="demo-plans__list">
          {cards.map(({ item, audience }) => {
            const state = !selected ? "" : audience.id === selected ? " is-match" : " is-dim";
            const inSuite = item.href.startsWith("/product-suite#");
            return (
              // The dimming sits on the <li>, the reveal on the wrapper, so the
              // reveal's inline opacity never overrides it. Each card spans
              // the list's six rows (subgrid: band, name, allocation, button,
              // description, link), so the allocations and buttons
              // line up across the cards however their names wrap.
              <li key={item.key} className={`demo-card${state}`}>
                <div className="demo-card__reveal" data-reveal>
                  <article className="demo-card__inner" aria-labelledby={`demo-${item.key}`} data-spotlight>
                    <p className="demo-card__band">For {audience.label}</p>

                    <div className="demo-card__head">
                      <h3 id={`demo-${item.key}`} className="demo-card__name">
                        <BrandText text={item.name} />
                      </h3>
                      <p className="demo-card__tagline">{item.tagline}</p>
                    </div>

                    <div className="demo-card__points">
                      <p>
                        <strong>{points}</strong>
                        <span>Demo points</span>
                      </p>
                      <p className="demo-card__note">Declared allocation for this product</p>
                    </div>

                    <div className="demo-card__cta">
                      <button
                        type="button"
                        className="demo-btn demo-btn--primary demo-card__try"
                        aria-haspopup="dialog"
                        aria-label={`Try Demo: ${item.name}`}
                        onClick={() => onTry({ item, audience })}
                      >
                        Try Demo <span aria-hidden="true">→</span>
                      </button>
                    </div>

                    <p className="demo-card__desc">
                      <BrandText text={item.description} />
                    </p>

                    <div className="demo-card__foot">
                      {inSuite && (
                        <Link href={item.href} className="demo-card__more">
                          See it in the Product Suite
                        </Link>
                      )}
                    </div>
                  </article>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
