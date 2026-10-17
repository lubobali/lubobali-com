import { Hero } from "@/components/home/hero";
import { JsonLd } from "@/components/seo/json-ld";
import { homeGraph } from "@/lib/schema";

// Home page (Phase 3). Sections are added one step at a time
// (plans repo docs/phase-3-homepage.md). All text is real HTML, so search
// and AI bots (no JavaScript) read it — scripts/check-seo.mjs checks this.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={homeGraph()} />
      <Hero />
    </main>
  );
}
