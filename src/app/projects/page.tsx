import type { Metadata } from "next";
import { FinalCta } from "@/components/home/final-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { type ShelfEntry, ShelfBrowser } from "@/components/shelf/shelf-browser";
import { ProjectCard, StoryCard, StoryTiles } from "@/components/shelf/shelf-cards";
import { Stack } from "@/components/shelf/stack";
import { publishedCaseStudies } from "@/lib/case-studies";
import { projects } from "@/lib/projects";
import { topOptions } from "@/lib/projects/shelf";
import { shelfGraph } from "@/lib/schema";
import { shelfTry } from "@/lib/search/site-index";
import { site } from "@/lib/site";

// /projects, "the shelf" (Phase 5 P5.4): every project in one place, in the
// 3 chapters (Analytics → Pipelines → AI agents), the 3 stories on top,
// one search box and 2 filters. All cards are in the raw HTML (people
// without JS, Google, AI agents); the browser only picks which to show.

const TITLE = "Projects: analytics, data pipelines and AI agents";
const DESCRIPTION = "Every system Lubo Bali built end to end: dashboards, data pipelines and AI agents. Search by your problem, industry or tool.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: "./",
    siteName: site.name,
    locale: site.locale,
    title: `${TITLE} — ${site.name}`,
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name}, ${site.jobTitle}` }],
  },
};

export default function ProjectsPage() {
  const stories = publishedCaseStudies();
  const entries: ShelfEntry[] = [
    ...stories.map((c) => ({ id: `work/${c.slug}`, industries: [], tech: [] })),
    ...projects.map((p) => ({ id: `projects/${p.slug}`, chapter: p.chapter, industries: p.industries, tech: p.tech })),
  ];
  const cards = Object.fromEntries([
    ...stories.map((c) => [`work/${c.slug}`, <StoryCard key={c.slug} c={c} />]),
    ...projects.map((p) => [`projects/${p.slug}`, <ProjectCard key={p.slug} p={p} />]),
  ]);
  const all = Number.POSITIVE_INFINITY;
  const options = { industry: topOptions(entries, "industry", all), tech: topOptions(entries, "tech", all) };
  const total = projects.length + stories.length;

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={shelfGraph(projects, stories)} />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 lg:py-16">
        <ShelfBrowser
          intro={
            <header className="flex flex-col gap-4">
              <h1 className="text-4xl font-semibold text-balance sm:text-5xl">
                {total} systems, <span className="shelf-h1-soft">built end to end.</span>
              </h1>
              <p className="max-w-xl text-lg text-balance text-muted-foreground">
                From the dashboard to the data pipeline to the AI agent on top. Search by your problem, or pick your industry.
              </p>
            </header>
          }
          stack={<Stack />}
          stories={<StoryTiles stories={stories} />}
          entries={entries}
          cards={cards}
          options={options}
          tryWords={shelfTry}
        />
      </div>
      <FinalCta />
    </main>
  );
}
