import type { CSSProperties } from "react";
import { Link } from "../../../shared/components/Link";
import { leaders, teamMembers } from "../../about-us/data";
import { BrandText } from "../../../shared/components/BrandText";

/** The people behind the company: the founding team, then the wider team. */
export function TeamTeaser() {
  return (
    <section className="hteam section" aria-labelledby="hteam-title">
      <div className="section__inner">
        <header className="hsec-head">
          <div>
            <h2 className="section-label" data-scramble>
              Our Team
            </h2>
            <h3 id="hteam-title" className="hsec-title" data-split>
              The people building trust for the next era of AI.
            </h3>
          </div>
          <Link href="/about-us" className="hsec-link" data-reveal>
            Meet the team <span aria-hidden="true">→</span>
          </Link>
        </header>

        <ul className="hteam__leaders">
          {leaders.map((leader) => (
            <li key={leader.name} className="hteam__card" data-reveal data-spotlight>
              <div className="hteam__photo">
                <img
                  src={leader.photo}
                  alt={leader.name}
                  loading="lazy"
                  style={
                    {
                      objectPosition: leader.photoPosition ?? "50% 50%",
                      transformOrigin: leader.photoPosition ?? "50% 50%",
                      "--zoom": leader.photoZoom ?? 1,
                    } as CSSProperties
                  }
                />
              </div>
              <p className="hteam__name">{leader.name}</p>
              <p className="hteam__role">
                <BrandText text={leader.role} />
              </p>
            </li>
          ))}
        </ul>

        <div className="hteam__crew" data-reveal>
          <ul aria-label="The wider team">
            {teamMembers.map((member) => (
              <li key={member.name}>
                <img src={member.photo} alt={`${member.name}, ${member.role}`} title={`${member.name} · ${member.role}`} loading="lazy" />
              </li>
            ))}
          </ul>
          <p>Engineers, designers and strategists working alongside the founding team.</p>
        </div>
      </div>
    </section>
  );
}
