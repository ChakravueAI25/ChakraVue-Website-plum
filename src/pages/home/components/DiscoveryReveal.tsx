import "./discovery.css";

/**
 * The discovery, from the blueprint redesign's logo reveal: the old
 * blueprint, burnt through, hangs over the scene; as the section arrives the
 * sheet opens out past the edges of the screen and the boy is there at the
 * glowing intelligence underneath it, then the words follow. It plays once
 * (Replay plays it again). Without motion the scene is simply open.
 */
export function DiscoveryReveal() {
  return (
    <section className="discovery section" aria-labelledby="discovery-title">
      <img
        className="discovery__scene"
        src="/images/campaign/connected-care.webp"
        alt="An ophthalmology slit lamp linked to iris imaging and connected clinical records in a modern examination room."
        loading="lazy"
        decoding="async"
      />
      <div className="discovery__shade" aria-hidden="true" />
      <div className="section__inner discovery__copy">
        <p className="section-label">WHAT WE DO</p>
        <h2 id="discovery-title" className="discovery__title">
          We connect clinicians, data and devices.
        </h2>
        <p className="discovery__lead">From the instrument to the record, in one connected line of sight.</p>
        <img className="discovery__mascot" src="/images/campaign/grow/toddler-still.webp" alt="Chakravue AI's curly-haired mascot in his colorful vehicle-print shirt." loading="lazy" decoding="async" />
        <div className="discovery__cards">
          <article><h3>CLINICIANS</h3><p>Guidance in theatre and findings at the slit lamp, in real time.</p></article>
          <article><h3>DATA</h3><p>Imaging, device output and clinical notes in one timeline.</p></article>
          <article><h3>DEVICES</h3><p>The equipment you already own, feeding patient records.</p></article>
        </div>
      </div>
    </section>
  );
}
