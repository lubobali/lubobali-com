import { JsonLd } from "@/components/seo/json-ld";
import { homeGraph } from "@/lib/schema";
import { site } from "@/lib/site";

// Placeholder until the real home page (Phase 3). Name and job title are
// real text, so search and AI bots (no JavaScript) can read them —
// scripts/check-seo.mjs checks this.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col py-24 items-center justify-center gap-4 px-6 text-center">
      <JsonLd data={homeGraph()} />
      <p className="font-mono text-sm text-link">New site in progress</p>
      <h1 className="text-display font-semibold tracking-tight">{site.name}</h1>
      <p className="text-xl text-muted-foreground">{site.jobTitle}</p>
    </main>
  );
}
