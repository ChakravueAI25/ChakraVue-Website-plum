import { useEffect, useState } from "react";
import { reduceMotion } from "../../motion/env";
import { usePageMotion } from "../../motion/useMotion";
import { AudienceMap } from "../../shared/components/AudienceMap";
import { ChapterMark } from "../../shared/components/ChapterMark";
import { Header } from "../../shared/components/Header";
import { BrandStrip } from "./components/BrandStrip";
import { CampaignClose } from "./components/CampaignClose";
import { CoreIdea } from "./components/CoreIdea";
import { DiscoveryReveal } from "./components/DiscoveryReveal";
import { Hero } from "./components/Hero";
import { InsightBand } from "./components/InsightBand";
import { LatestPosts } from "./components/LatestPosts";
import { ProblemReels } from "./components/ProblemReels";
import { ProductShowcase } from "./components/ProductShowcase";
import { RealTheatres } from "./components/RealTheatres";
import { TeamTeaser } from "./components/TeamTeaser";
import { ValueCards } from "./components/ValueCards";
import "./home.css";

/**
 * The homepage, structured as a company site: what we do (the hero, over
 * the "Analogue to AI" campaign film), who has featured us, what we
 * believe, the products, the idea, how it works, the team, the latest
 * writing, and the campaign's closing frame with the next steps, then the
 * contact footer.
 */
export function HomePage() {
  // As before, the nav only appears once the headline has landed.
  const [navIn, setNavIn] = useState(reduceMotion);
  usePageMotion();

  // Safety net: never leave the nav hidden if the intro can't run.
  useEffect(() => {
    if (navIn) return;
    const timer = window.setTimeout(() => setNavIn(true), 6000);
    return () => window.clearTimeout(timer);
  }, [navIn]);

  return (
    <main className="site-shell home">
      <Header visible={navIn} />
      {/* The kid's story runs down the page in six chapters (story.ts); the
          markers sit between sections, so the sections stay as they are. */}
      <ChapterMark id="dream" />
      <Hero onIntroDone={() => setNavIn(true)} />
      <BrandStrip />
      <InsightBand />
      <ChapterMark id="beginning" />
      <ProblemReels />
      <ChapterMark id="discovery" />
      <DiscoveryReveal />
      <ChapterMark id="transformation" />
      <ProductShowcase />
      <AudienceMap />
      <CoreIdea />
      <ValueCards />
      <ChapterMark id="journey" />
      <RealTheatres />
      <TeamTeaser />
      <LatestPosts />
      <ChapterMark id="aspiration" />
      <CampaignClose />
    </main>
  );
}
