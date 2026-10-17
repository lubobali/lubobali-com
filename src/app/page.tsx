import { DataRain } from "@/components/ambient/data-rain";
import { Hero } from "@/components/home/hero";
import { ProofStrip } from "@/components/home/proof-strip";
import { SeeItWork } from "@/components/home/see-it-work";
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
    </main>
  );
}
