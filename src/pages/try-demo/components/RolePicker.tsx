import { BrandText } from "../../../shared/components/BrandText";
import { audiences } from "../../../shared/data/audiences";

/**
 * "Who Are You?": the four audiences as cards. Choosing one highlights its
 * products and takes you down to them.
 */
/** A line icon for each audience: stethoscope, graduation cap, hospital, microscope. */
function RoleIcon({ id }: { id: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" width="28" height="28">
      {id === "doctors" && (
        <g {...p}>
          <path d="M6 3v5a4 4 0 0 0 8 0V3" />
          <path d="M10 12v2a5 5 0 0 0 10 0v-2" />
          <circle cx="20" cy="10" r="2" />
        </g>
      )}
      {id === "trainees" && (
        <g {...p}>
          <path d="M2 9l10-5 10 5-10 5z" />
          <path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
          <path d="M22 9v6" />
        </g>
      )}
      {id === "institutions" && (
        <g {...p}>
          <path d="M4 21V7l8-4 8 4v14" />
          <path d="M2 21h20" />
          <path d="M12 8v5M9.5 10.5h5" />
          <path d="M9 21v-4h6v4" />
        </g>
      )}
      {id === "oems" && (
        <g {...p}>
          <path d="M9 3h4l-1 7H10z" />
          <path d="M11 10v4" />
          <path d="M7 14h8a3 3 0 0 1 3 3v1H6v-1" />
          <path d="M4 21h16" />
          <path d="M15 6a6 6 0 0 1 4 6" />
        </g>
      )}
    </svg>
  );
}

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
                  <span className="role-card__top" aria-hidden="true">
                    <span className="role-card__icon">
                      <RoleIcon id={audience.id} />
                    </span>
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
