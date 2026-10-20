import type { Metadata } from "next";
import { ExampleTabs } from "@/components/blueprint/example-tabs";
import { BlueprintTool } from "@/components/blueprint/tool";
import { YourData } from "@/components/blueprint/your-data";
import { site } from "@/lib/site";

// /blueprint (Phase 3b B6): the AI Project Blueprint on its own page, the
// link Lubo shares (LinkedIn). The tool first, then 6 example blueprints
// behind industry tabs (all in raw HTML for search + AI assistants), then
// what happens to the visitor's data (B9.5, linked from the form).
const title = "Free AI Project Blueprint";
const description =
  "Describe your business problem and get a free first plan in about a minute: how it works today, with AI, the risks and a timeline.";

export const metadata: Metadata = {
  title,
  description,
  // A page that sets openGraph replaces the whole object: repeat images.
  openGraph: {
    type: "website",
    url: "./",
    siteName: site.name,
    locale: site.locale,
    title: `${title} — ${site.name}`,
    description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name}, ${site.jobTitle}` }],
  },
};

export default function BlueprintPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-12 sm:px-6 lg:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-award uppercase">By {site.name}</p>
        <h1 className="mt-3 text-4xl font-semibold text-balance sm:text-5xl">Get your free AI blueprint</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Tell me your problem the way you would on a call. In about a minute you get a first plan: how your work
          runs today, what it looks like with AI, who is involved, the risks and a timeline. Free, one per visitor.
        </p>
      </div>
      <div id="blueprint" className="mt-10 scroll-mt-20">
        <BlueprintTool />
      </div>
      <section aria-labelledby="examples-title" className="mt-20">
        <h2 id="examples-title" className="text-3xl font-semibold text-balance sm:text-4xl">
          See what you&apos;d get
        </h2>
        <p className="mt-3 mb-8 max-w-3xl text-muted-foreground">
          6 example blueprints made by the tool. Each one starts from a typical story for that industry, never from a
          real client.
        </p>
        <ExampleTabs />
      </section>
      <YourData />
    </main>
  );
}
