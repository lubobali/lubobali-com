import { BlueprintCard } from "@/components/blueprint/card";
import { EXAMPLE } from "@/components/blueprint/example";
import { BlueprintTool } from "@/components/blueprint/tool";

// Get your free AI blueprint (Phase 3b, the WOW moment), right after "What
// I do": first what Lubo does, then the visitor tries it on their own
// problem. The tool (client island) comes first; a real example sits
// behind "See a real example" as plain HTML (no JavaScript, bots read
// it). Words = draft, final copy with Lubo.
export function BlueprintSection() {
  return (
    <section
      id="blueprint"
      aria-labelledby="blueprint-title"
      className="relative mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20"
    >
      <div className="max-w-3xl">
        <h2 id="blueprint-title" className="text-3xl font-semibold text-balance sm:text-4xl">
          Get your free AI blueprint
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Tell me your problem the way you would on a call. In about a minute you get a first plan: how your work
          runs today, what it looks like with AI, the risks and a timeline.
        </p>
      </div>
      <div className="mt-10">
        <BlueprintTool />
      </div>
      <details className="bp-example">
        <summary>See a real example: a trucking company</summary>
        <BlueprintCard bp={EXAMPLE} example />
      </details>
    </section>
  );
}
