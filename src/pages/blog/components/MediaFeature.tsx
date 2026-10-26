import { BrandText } from "../../../shared/components/BrandText";
import { featuredMedia } from "../../../shared/data/content";
import { mediaAppearance as media } from "../data";

/**
 * ChakraVue AI in the media: the AI Impact Summit 2026, with the channels
 * it was featured on and photographs from the stall. The homepage's
 * "We got featured in" strip links here (/blog#media).
 */
export function MediaFeature() {
  return (
    <section id="media" className="media section" aria-labelledby="media-title">
      <div className="section__inner media__inner">
        <div className="media__copy" data-reveal>
          <p className="media__eyebrow">{media.eyebrow}</p>
          <p className="media__meta">
            <span>{media.event}</span>
            <span>{media.place}</span>
            <span>{media.dates}</span>
          </p>
          <h2 id="media-title" className="media__title">
            <BrandText text={media.title} />
          </h2>
          <p className="media__text">
            <BrandText text={media.summary} />
          </p>

          <p className="media__label">Shown live</p>
          <ul className="media__shown">
            {media.shown.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p className="media__label">Featured on</p>
          <ul className="media__channels">
            {featuredMedia.map((logo) => (
              <li key={logo.name} className={`media__channel media__channel--${logo.tile}`}>
                <img src={logo.src} alt={logo.name} loading="lazy" decoding="async" />
              </li>
            ))}
          </ul>
          <p className="media__text">
            <BrandText text={media.coverage} />
          </p>
          <p className="media__text media__text--quiet">
            <BrandText text={media.outcome} />
          </p>
        </div>

        <div className="media__photos">
          {media.photos.map((photo, i) => (
            <figure key={photo.src} className={`media__photo media__photo--${i + 1}`} data-reveal>
              <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
