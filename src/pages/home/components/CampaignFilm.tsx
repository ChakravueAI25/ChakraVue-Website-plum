import { useEffect, useRef, useState } from "react";
import { reduceMotion } from "../../../motion/env";
import { whenRevealed } from "../../../motion/gate";
import { BrandText } from "../../../shared/components/BrandText";
import { Link } from "../../../shared/components/Link";
import "./campaign.css";

const FILM = "/images/campaign/analogue-to-ai.mp4";
const POSTER = "/images/campaign/analogue-to-ai-poster.jpg";

/**
 * The "Analogue to AI" campaign, right under the hero: the boy walks across
 * an old engineering blueprint, strikes a match, and the paper burns open
 * onto the intelligence underneath. The film only loads and plays while it
 * is on screen (never during the intro); under reduced motion it waits on
 * its poster until someone presses play.
 */
export function CampaignFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  // Someone pressed pause: scrolling back into view doesn't override them.
  const held = useRef(reduceMotion);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let observer: IntersectionObserver | undefined;
    const off = whenRevealed(() => {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !held.current) video.play().catch(() => {});
          else if (!entry.isIntersecting) video.pause();
        },
        { threshold: 0.35 },
      );
      observer.observe(video);
    });
    return () => {
      off();
      observer?.disconnect();
    };
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      held.current = false;
      video.play().catch(() => {});
    } else {
      held.current = true;
      video.pause();
    }
  };

  return (
    <section className="campaign-film section" aria-labelledby="campaign-film-title">
      <div className="section__inner campaign-film__inner">
        <div className="campaign-film__copy">
          <p className="section-label" data-scramble>
            Analogue to AI
          </p>
          <h2 id="campaign-film-title" className="campaign-film__title" data-split>
            Your equipment has served you well. <em>Now give it an engine.</em>
          </h2>
          <p className="campaign-film__lead" data-split="fade" data-delay="0.15">
            <BrandText text="AI on the devices your hospital already owns. ChakraVue AI levels the field for every hospital, large or small." />
          </p>
          <Link href="/product-suite" className="campaign-film__link" data-reveal>
            See what it adds
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <figure className="campaign-film__frame" data-reveal>
          <video
            ref={videoRef}
            className="campaign-film__video"
            src={FILM}
            poster={POSTER}
            muted
            loop
            playsInline
            preload="none"
            aria-describedby="campaign-film-desc"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
          <figcaption id="campaign-film-desc" className="sr-only">
            A short film without sound: a boy walks across an old engineering blueprint, strikes a match, and the burning paper opens onto
            glowing AI circuitry underneath.
          </figcaption>
          <button
            type="button"
            className="campaign-film__toggle"
            onClick={toggle}
            aria-label={playing ? "Pause the film" : "Play the film"}
            data-magnetic="0.2"
          >
            {playing ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14">
                <rect x="6" y="5" width="4" height="14" />
                <rect x="14" y="5" width="4" height="14" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </figure>
      </div>
    </section>
  );
}
