import { useEffect, useState } from "react";
import { reduceMotion } from "../../motion/env";
import { usePageMotion } from "../../motion/useMotion";
import { ChapterMark } from "../../shared/components/ChapterMark";
import { Header } from "../../shared/components/Header";
import { BrandStrip } from "./components/BrandStrip";
import { CampaignClose } from "./components/CampaignClose";
import { CoreIdea } from "./components/CoreIdea";
import { DiscoveryReveal } from "./components/DiscoveryReveal";
import { EmrConnect } from "./components/EmrConnect";
import { Hero } from "./components/Hero";
import { InsightBand } from "./components/InsightBand";
import { IntroBridge } from "./components/IntroBridge";
import { JourneyStrip } from "./components/JourneyStrip";
import { IntegratedDevices } from "./components/IntegratedDevices";
import { LatestPosts } from "./components/LatestPosts";
import { AnalogToIntelligent } from "./components/AnalogToIntelligent";
import { RoleShowcase } from "./components/RoleShowcase";
import { RealTheatres } from "./components/RealTheatres";
import { SurgicalTools } from "./components/SurgicalTools";
import { TeamTeaser } from "./components/TeamTeaser";
import { ValueCards } from "./components/ValueCards";
import { WhoWeAre } from "./components/WhoWeAre";
import "./home.css";

/**
 * The homepage, structured as a company site and read top to bottom as one
 * story: who we are (the hero over the "Analogue to AI" campaign film, who
 * has featured us, what we believe, the glowing banner and early-bird
 * offer, then who we are and the principles we work by), what we do (how
 * practice is changing, what we connect, the core idea, how it works), the
 * products (by role, the integrated devices, the ChakraVue System, the
 * surgical tools), the proof (real theatres, our journey), the people (the
 * team, the latest writing), and the campaign's closing frame with a demo
 * or a collaboration, then the contact footer.
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
      {/* The homepage flow (README "Home", 2026-10-30): introduction, who
          we are, what we do, the products, in practice, the team, then a
          demo or a collaboration. The kid's story runs alongside in six
          chapters (story.ts); its markers sit between sections, so the
          sections carry no story code. */}
      {/* Introduction */}
      <ChapterMark id="dream" />
      <Hero onIntroDone={() => setNavIn(true)} />
      <BrandStrip />
      <InsightBand />
      <IntroBridge />
      <WhoWeAre />
      {/* What we do: the capabilities, before any single product */}
      <ChapterMark id="beginning" />
      <AnalogToIntelligent />
      <ChapterMark id="discovery" />
      <DiscoveryReveal />
      <ChapterMark id="transformation" />
      <CoreIdea />
      <ValueCards />
      {/* The products: by role, then each family */}
      <RoleShowcase />
      <IntegratedDevices />
      <EmrConnect />
      <ChapterMark id="journey" />
      <SurgicalTools />
      {/* In practice, and the people behind it */}
      <RealTheatres />
      <JourneyStrip />
      <TeamTeaser />
      <LatestPosts />
      {/* Action */}
      <ChapterMark id="aspiration" />
      <CampaignClose />
    </main>
  );
}
