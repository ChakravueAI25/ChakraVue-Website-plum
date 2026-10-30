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
import { JourneyStrip } from "./components/JourneyStrip";
import { IntegratedDevices } from "./components/IntegratedDevices";
import { LatestPosts } from "./components/LatestPosts";
import { AnalogToIntelligent } from "./components/AnalogToIntelligent";
import { RoleShowcase } from "./components/RoleShowcase";
import { RealTheatres } from "./components/RealTheatres";
import { SurgicalTools } from "./components/SurgicalTools";
import { TeamTeaser } from "./components/TeamTeaser";
import { ValueCards } from "./components/ValueCards";
import { WhyChakraVue } from "./components/WhyChakraVue";
import "./home.css";

/**
 * The homepage, structured as a company site: what we do (the hero, over
 * the "Analogue to AI" campaign film), who has featured us, what we
 * believe, who you are here as (and the products for you), analog to
 * intelligent, how it works, the
 * integrated devices, the ChakraVue System at the centre, the surgical
 * tools, why ChakraVue AI, the team, the latest writing, and the campaign's
 * closing frame with a demo or a collaboration, then the contact footer.
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
      {/* The owner's homepage flow (README "Home"): what we offer, how it
          works, who it serves, why us, then a demo or a collaboration. The
          kid's story runs alongside in six chapters (story.ts); its markers
          sit between sections, so the sections carry no story code. */}
      <ChapterMark id="dream" />
      <Hero onIntroDone={() => setNavIn(true)} />
      <BrandStrip />
      <JourneyStrip />
      <InsightBand />
      <RoleShowcase />
      <ChapterMark id="beginning" />
      <AnalogToIntelligent />
      <ChapterMark id="discovery" />
      <DiscoveryReveal />
      <ChapterMark id="transformation" />
      <CoreIdea />
      <ValueCards />
      <IntegratedDevices />
      <EmrConnect />
      <ChapterMark id="journey" />
      <SurgicalTools />
      <RealTheatres />
      <WhyChakraVue />
      <TeamTeaser />
      <LatestPosts />
      <ChapterMark id="aspiration" />
      <CampaignClose />
    </main>
  );
}
