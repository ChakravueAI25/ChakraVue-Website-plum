import "./theatres.css";

const IMG = "/images/campaign/theatres";

/** Real photographs from the blueprint redesign; marks, serials and on-screen readouts painted out. */
const photos = [
  {
    src: `${IMG}/surgeon.webp`,
    alt: "A surgeon operating at the microscope, the Surgical Assistant recording the view.",
    title: "Surgical Assistant",
    detail: "at the microscope, in theatre",
    position: "60% 40%",
  },
  {
    src: `${IMG}/slit-lamp.webp`,
    alt: "A clinician beside the slit lamp, its analysis on the screen in front of him.",
    title: "Slit Lamp Module",
    detail: "on the clinician's own slit lamp",
    position: "62% 50%",
  },
  {
    src: `${IMG}/summit.webp`,
    alt: "A ChakraVue AI founder interviewed at the company's stand at the AI Impact Summit.",
    title: "AI Impact Summit",
    detail: "New Delhi, 2026",
    position: "26% 60%",
  },
  {
    src: `${IMG}/training.webp`,
    alt: "Clinicians at a hands-on training session, one wearing a headset.",
    title: "Hands-on sessions",
    detail: "with surgeons and trainees",
    position: "48% 60%",
  },
];

/**
 * The journey: the kid's new abilities at work in the real world. The
 * photographs, not renders, of the products in theatres and clinics, from the
 * blueprint redesign.
 */
export function RealTheatres() {
  return (
    <section className="theatres section" aria-labelledby="theatres-title">
      <div className="section__inner">
        <header className="hsec-head">
          <div>
            <p className="section-label" data-scramble>
              Not a render
            </p>
            <h2 id="theatres-title" className="hsec-title" data-split>
              In real theatres, with real surgeons.
            </h2>
          </div>
        </header>

        <ul className="theatres__grid">
          {photos.map((photo) => (
            <li key={photo.src} data-reveal>
              <figure className="theatre">
                <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" style={{ objectPosition: photo.position }} />
                <figcaption>
                  <strong>{photo.title}</strong> · {photo.detail}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
