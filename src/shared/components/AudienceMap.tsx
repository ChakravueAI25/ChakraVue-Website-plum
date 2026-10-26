import { audiences, type Audience } from "../data/audiences";
import { BrandText } from "./BrandText";
import { Link } from "./Link";
import "./audienceMap.css";

/**
 * Who ChakraVue AI is built for and which products serve each of them (Home),
 * from the single mapping in shared/data/audiences.ts: the four audiences as
 * panels side by side, each with a picture of its products at work and its
 * products as links. The Try Demo page has its own audience picker.
 */
export function AudienceMap() {
  return (
    <section className="aud aud--overview section" aria-labelledby="aud-title-overview">
      <div className="section__inner">
        <header className="aud__head">
          <p className="section-label" data-scramble>
            Who we serve
          </p>
          <h2 id="aud-title-overview" className="aud__title" data-split>
            Technology Built for Every Role in Surgery
          </h2>
          <p className="aud__lead" data-split="fade" data-delay="0.1">
            <BrandText text="From surgical intelligence and immersive training to clinical workflows and medical device integration, ChakraVue AI connects the people and technology shaping the future of surgery." />
          </p>
        </header>

        <ol className="aud__list">
          {audiences.map((audience, i) => (
            <Panel key={audience.id} audience={audience} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}

const number = (i: number) => String(i + 1).padStart(2, "0");

/**
 * Home: one panel per audience. Its picture shows its first product at work;
 * pointing at (or tabbing to) another product's row shows that one instead.
 * The panels share rows (subgrid), so labels and product lists line up
 * across the four however their text wraps.
 */
function Panel({ audience, index }: { audience: Audience; index: number }) {
  return (
    <li className="aud-panel" data-reveal data-spotlight>
      <div className="aud-panel__art" aria-hidden="true">
        {audience.items.map((item) => (
          <img key={item.key} src={item.cover} alt="" loading="lazy" decoding="async" style={item.coverPosition ? { objectPosition: item.coverPosition } : undefined} />
        ))}
        <span className="aud-panel__index">{number(index)}</span>
        <span className="aud-panel__count">
          {audience.items.length} {audience.items.length === 1 ? "offering" : "offerings"}
        </span>
      </div>

      <div className="aud-panel__who">
        <h3 className="aud__label">{audience.label}</h3>
        <p className="aud__need">{audience.need}</p>
      </div>

      <ul className="aud-panel__items">
        {audience.items.map((item) => (
          <li key={item.key}>
            <Link href={item.href} className="aud-panel__row">
              <span className="aud-panel__name">
                <BrandText text={item.name} />
              </span>
              <span className="aud-panel__hint">{item.hint}</span>
              <span className="aud-panel__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}
