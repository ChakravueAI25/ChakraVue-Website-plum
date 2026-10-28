/**
 * A small band under the hero: where the products already run in clinical
 * use (owner's wording, 2026-10-28). Add sites here as they go live.
 */
export function InUseBanner() {
  return (
    <aside className="ps-inuse" aria-label="In clinical use">
      <p className="ps-inuse__pill" data-reveal>
        <span className="ps-inuse__live" aria-hidden="true" />
        <span className="ps-inuse__label">In clinical use</span>
        <span className="ps-inuse__text">
          Already running successfully at <strong>Spark Eye and Dental Care</strong>, Musheerabad
        </span>
      </p>
    </aside>
  );
}
