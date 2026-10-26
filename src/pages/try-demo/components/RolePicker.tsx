import { BrandText } from "../../../shared/components/BrandText";
import { audiences } from "../../../shared/data/audiences";

/**
 * "Who Are You?": the four audiences as cards. Choosing one highlights its
 * products and takes you down to them.
 */
export function RolePicker({ selected, onPick }: { selected: string | null; onPick: (id: string) => void }) {
  return (
    <section id="roles" className="demo-roles section" aria-labelledby="roles-title">
      <div className="section__inner">
        <header className="demo-head">
          <p className="section-label" data-scramble>
            Step 1
          </p>
          <h2 id="roles-title" className="demo-head__title" data-split>
            Who Are You?
          </h2>
          <p className="demo-head__lead" data-split="fade" data-delay="0.1">
            <BrandText text="Choose your role to discover the ChakraVue AI solutions designed for you." />
          </p>
        </header>

        <ul className="demo-roles__list">
          {audiences.map((audience, i) => {
            const first = audience.items[0];
            const on = selected === audience.id;
            return (
              <li key={audience.id} data-reveal>
                <button
                  type="button"
                  className={`role-card${on ? " is-selected" : ""}`}
                  aria-pressed={on}
                  aria-describedby={`role-${audience.id}-need`}
                  onClick={() => onPick(audience.id)}
                  data-spotlight
                >
                  <span className="role-card__art" aria-hidden="true">
                    <img
                      src={first.cover}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      style={first.coverPosition ? { objectPosition: first.coverPosition } : undefined}
                    />
                    <span className="role-card__index">{String(i + 1).padStart(2, "0")}</span>
                  </span>
                  <span className="role-card__body">
                    <span className="role-card__title">{audience.label}</span>
                    <span id={`role-${audience.id}-need`} className="role-card__need">
                      {audience.need}
                    </span>
                    <span className="role-card__tags">
                      {audience.items.map((item) => (
                        <span key={item.key} className="role-card__tag">
                          <BrandText text={item.name} />
                        </span>
                      ))}
                    </span>
                    <span className="role-card__go">
                      {on ? "Selected" : `See ${audience.items.length === 1 ? "its demo" : `its ${audience.items.length} demos`}`}
                      <span aria-hidden="true">↓</span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
