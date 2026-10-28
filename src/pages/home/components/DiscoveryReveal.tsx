import { useRef } from "react";
import { ScrollTrigger } from "../../../motion/gsap";
import { useMotion } from "../../../motion/useMotion";
import "./discovery.css";

/**
 * The discovery, from the blueprint redesign's logo reveal: the old
 * blueprint, burnt through, hangs over the scene; as the section arrives the
 * sheet opens out past the edges of the screen and the boy is there at the
 * glowing intelligence underneath it, then the words follow. It plays once
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
        <p className="section-label">The spark</p>
        <h2 id="discovery-title" className="discovery__title">
          Not to burn the past.
        </h2>
        <p className="discovery__lead">To see what was underneath it all along.</p>
        <p className="discovery__bridge">
          Four new powers for the tools doctors already use
          <span aria-hidden="true">↓</span>
        </p>
      </div>

      <button type="button" className="discovery__replay" onClick={replay}>
        Replay
      </button>
    </section>
  );
}
