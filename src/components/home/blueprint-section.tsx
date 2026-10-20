import { BlueprintWithExamples } from "@/components/blueprint/with-examples";

// Get your free AI blueprint (Phase 3b, the WOW moment), right after "What
// I do": first what Lubo does, then the visitor tries it on their own
// problem. Lubo's layout: a row of 6 example chips above the form; a chip
// opens that example in place of the form. All 6 examples are also on
// /blueprint as plain HTML (search + AI assistants).
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
        <BlueprintWithExamples />
      </div>
    </section>
  );
}
