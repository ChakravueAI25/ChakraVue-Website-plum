import { BrandText } from "../../../shared/components/BrandText";
import { salemVisit as visit } from "../data";

/** The Salem visit: the dental implant planner at Vinayaka Mission's Research Foundation. */
export function SalemVisit() {
  return (
    <section id="salem" className="media media--salem section" aria-labelledby="salem-title">
      <div className="section__inner media__inner">
        <div className="media__copy" data-reveal>
          <p className="media__eyebrow">{visit.eyebrow}</p>
          <p className="media__meta">
            <span>{visit.event}</span>
            <span>{visit.place}</span>
          </p>
          <h2 id="salem-title" className="media__title">
            {visit.title}
          </h2>
          <p className="media__text">
            <BrandText text={visit.summary} />
          </p>

          <p className="media__label">Shown</p>
          <ul className="media__shown">
            {visit.shown.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="media__text media__text--quiet">{visit.note}</p>
        </div>

        <div className="media__photos media__photos--two">
          {visit.photos.map((photo) => (
            <figure key={photo.src} className="media__photo" data-reveal>
              <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
