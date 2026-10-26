import { alsoInTheSuite, audiences, type Audience } from "../data/audiences";
import { BrandText } from "./BrandText";
import { Link } from "./Link";
import "./audienceMap.css";

type AudienceMapProps = {
  /**
   * "overview" (Home): the four audiences as panels side by side, each with a
   * picture of its products at work and its products as links. "detailed"
   * (Product Suite): one row per audience, each product with its tagline,
   * description and a way to it.
   */
  variant: "overview" | "detailed";
};

/**
 * Who ChakraVue AI is built for and which products serve each of them, from
 * the single mapping in shared/data/audiences.ts.
 */
export function AudienceMap({ variant }: AudienceMapProps) {
  const detailed = variant === "detailed";

  return (
    <section className={`aud aud--${variant} section`} aria-labelledby={`aud-title-${variant}`}>
      <div className="section__inner">
        <header className="aud__head">
          <p className="section-label" data-scramble>
            {detailed ? "By role" : "Who we serve"}
          </p>
          <h2 id={`aud-title-${variant}`} className="aud__title" data-split>
            Technology Built for Every Role in Surgery
          </h2>
          <p className="aud__lead" data-split="fade" data-delay="0.1">
            <BrandText
              text={
                detailed
                  ? "Find your role, then the products built for it."
                  : "From surgical intelligence and immersive training to clinical workflows and medical device integration, ChakraVue AI connects the people and technology shaping the future of surgery."
              }
            />
          </p>
        </header>

        <ol className="aud__list">
          {audiences.map((audience, i) =>
            detailed ? <DetailedGroup key={audience.id} audience={audience} index={i} /> : <Panel key={audience.id} audience={audience} index={i} />,
          )}
        </ol>

        {detailed && (
          <p className="aud__also" data-reveal>
            <span className="aud__also-label">Also in the suite</span>
            {alsoInTheSuite.map((entry, i) => (
              <span key={entry.name}>
                {i > 0 && <span aria-hidden="true"> · </span>}
                <Link href={entry.href}>
                  <BrandText text={entry.name} />
                </Link>
              </span>
            ))}
          </p>
        )}
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

/** Product Suite: one row per audience, each product as a described card. */
function DetailedGroup({ audience, index }: { audience: Audience; index: number }) {
  return (
    <li className="aud__group" data-reveal>
      <div className="aud__who">
        <span className="aud__index">{number(index)}</span>
        <h3 className="aud__label">{audience.label}</h3>
        <p className="aud__need">{audience.need}</p>
      </div>

      <ul className="aud__items">
        {audience.items.map((item) => (
          <li key={item.key}>
            <Link href={item.href} className="aud__item" data-spotlight>
              <span className="aud__thumb">
                <img src={item.image} alt={item.imageAlt} loading="lazy" decoding="async" />
              </span>
              <span className="aud__body">
                <span className="aud__name">
                  <BrandText text={item.name} />
                </span>
                <span className="aud__tagline">{item.tagline}</span>
                <span className="aud__desc">{item.description}</span>
                <span className="aud__action">
                  {item.action}
                  <span aria-hidden="true">{item.href.startsWith("/product-suite#") ? "↓" : "→"}</span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}
