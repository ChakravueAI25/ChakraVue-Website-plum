import { useRef } from "react";
import { gsap } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import type { TeamMember } from "../data";
import { teamMembers } from "../data";

export function TeamGrid() {
  const ref = useRef<HTMLElement>(null);

  // The short amber rule draws out from the centre under the label.
  useMotion(ref, (root) => {
    gsap.fromTo(
      root.querySelector(".team__heading"),
      { "--rule": 0 },
      { "--rule": 1, duration: 1.2, delay: 0.3, scrollTrigger: { trigger: root.querySelector(".team__intro"), start: "top 85%", once: true } },
    );
  });

  return (
    <section ref={ref} className="team section">
      <div className="section__inner">
        <header className="team__intro">
          <h2 className="section-label" data-scramble>
            Our Team
          </h2>
          <h3 className="team__heading" data-split data-delay="0.2">
            The people building trust for the next era of AI.
          </h3>
        </header>

        <ul className="team__grid">
          {teamMembers.map((member) => (
            <TeamMemberCard key={member.name} {...member} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function TeamMemberCard({ name, role, photo }: TeamMember) {
  return (
    <li className="team-member" data-reveal="pop">
      <div className="team-member__photo">
        <img src={photo} alt={name} loading="lazy" />
      </div>
      <h4 className="team-member__name">{name}</h4>
      <p className="team-member__role">{role}</p>
    </li>
  );
}
