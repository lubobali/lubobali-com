import { DataRain } from "@/components/ambient/data-rain";
import { AskLubo } from "@/components/ask-lubo";
import { BlueprintSection } from "@/components/home/blueprint-section";
import { BuiltWith } from "@/components/home/built-with";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { ProofStrip } from "@/components/home/proof-strip";
import { SeeItWork } from "@/components/home/see-it-work";
import { SelectedWork } from "@/components/home/selected-work";
import { Services } from "@/components/home/services";
import { Testimonials } from "@/components/home/testimonials";
import { JsonLd } from "@/components/seo/json-ld";
import { homeGraph } from "@/lib/schema";

// Home page (Phase 3). Sections are added one step at a time
// (plans repo docs/phase-3-homepage.md). All text is real HTML, so search
// and AI bots (no JavaScript) read it — scripts/check-seo.mjs checks this.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={homeGraph()} />
      {/* Blend group (isolate + navy) for the hero photo, and one rain that
          flows from the top down behind the LuBot loop, then fades out. */}
      <div className="relative isolate flex flex-col bg-background">
        <DataRain className="rain-flow" />
        <Hero />
        <SeeItWork />
      </div>
      <ProofStrip />
      {/* Second rain (same tiles, cached): shows around the cards, never on
          them (cards are opaque), dim behind headings, full in the margins. */}
      <div className="relative isolate flex flex-col">
        <DataRain className="rain-around" />
        <Services />
        <BlueprintSection />
        <SelectedWork />
        <Testimonials />
        <BuiltWith />
        <HowItWorks />
        {/* "Questions CEOs ask me" (Phase 6 P6.8), right before the finish line. */}
        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <AskLubo />
        </div>
        <FinalCta />
      </div>
    </main>
  );
}
