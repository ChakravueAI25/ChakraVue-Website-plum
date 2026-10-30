import { useRef, type CSSProperties } from "react";
import { ScrollTrigger } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import { Link } from "../../../shared/components/Link";
import "./discovery.css";

/* The three things ChakraVue AI connects. Each line paraphrases the product
   that does it; each links to the section on this page that shows it. */
const pillars = [
  {
    name: "Clinicians",
    line: "Guidance in theatre and findings at the slit lamp, in real time.",
    href: "#who-are-you-here-as",
  },
  {
    name: "Data",
    line: "Imaging, device output and clinical notes in one timeline.",
    href: "#emr",
  },
  {
    name: "Devices",
    line: "The equipment you already own, feeding patient records.",
    href: "#integrated-devices",
  },
];

/**
 * The discovery, from the blueprint redesign's logo reveal: the old
 * blueprint, burnt through, hangs over the scene; as the section arrives the
 * sheet opens out past the edges of the screen and the boy is there at the
 * glowing intelligence underneath it. Then the tagline follows, and the
 * three things it names (clinicians, data, devices) light up one after
 * another, the line between them filling as they join. It plays once
 * (Replay plays it again). Without motion the scene is simply open.
 */
export function DiscoveryReveal() {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    root.classList.add("is-armed");
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: "top 55%",
      once: true,
      onEnter: () => root.classList.remove("is-armed"),
    });
    return () => {
      trigger.kill();
      root.classList.remove("is-armed", "is-resetting");
    };
  });

  const replay = () => {
    const root = ref.current;
    if (!root) return;
    // Close the sheet at once, then burn it open again.
    root.classList.add("is-resetting", "is-armed");
    void root.offsetWidth;
    root.classList.remove("is-resetting");
    window.setTimeout(() => root.classList.remove("is-armed"), 120);
  };

  return (
    <section ref={ref} className="discovery section" aria-labelledby="discovery-title">
      <img
        className="discovery__scene"
        src="/images/campaign/circuit-reveal.jpg"
        alt="The boy from the film, delighted, beside the burnt-open blueprint and the glowing AI circuitry beneath it."
        loading="lazy"
        decoding="async"
      />
      <img className="discovery__sheet" src="/images/campaign/burn-hole.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" />
      <div className="discovery__shade" aria-hidden="true" />

      <div className="section__inner discovery__copy">
        <p className="section-label">What we do</p>
        <h2 id="discovery-title" className="discovery__title">
          We <em>connect</em> clinicians, data and devices.
        </h2>
        <p className="discovery__lead">From the instrument to the record, in one connected line of sight.</p>

        <ol className="discovery__links">
          {pillars.map((p, i) => (
            <li key={p.name} className="discovery__pillar" style={{ "--i": i } as CSSProperties}>
              <Link href={p.href} className="discovery__node">
                <span className="discovery__dot" aria-hidden="true" />
                <span className="discovery__name">{p.name}</span>
                <span className="discovery__line">{p.line}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <button type="button" className="discovery__replay" onClick={replay}>
        Replay
      </button>
    </section>
  );
}
