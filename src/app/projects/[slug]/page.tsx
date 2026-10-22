import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FinalCta } from "@/components/home/final-cta";
import { ProjectAnswers, ProjectHero, ProjectSource, SimilarProjects } from "@/components/project/project-parts";
import { RealScreen } from "@/components/project/project-art";
import { AgentAnatomy, SafeMark } from "@/components/project/project-trust";
import { JsonLd } from "@/components/seo/json-ld";
import { findProject, projects, similarProjects } from "@/lib/projects";
import type { Project } from "@/lib/projects/model";
import { projectGraph } from "@/lib/schema";
import { site } from "@/lib/site";

// /projects/<slug> (Phase 5 P5.3): one screen per project, the same 4
// questions as the Blueprint (problem, what I built, tech & why, result),
// then similar projects and the same finish line as the home page.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

// Title in the words people search: "Diabetes readmissions: SQL analytics project".
const KIND = { analytics: "analytics project", pipelines: "data pipeline", ai: "AI agent" } as const;
const pageTitle = (p: Project) => `${p.name}: ${p.tech[0]} ${KIND[p.chapter]}`;
const shareImage = (p: Project) => ({
  url: `/share/${p.slug}.jpg`,
  width: 1200,
  height: 630,
  alt: `${p.name}, by ${site.name}: ${"title" in p.picture && p.picture.title ? p.picture.title : p.oneLine}`,
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = findProject((await params).slug);
  if (!p) return {};
  return {
    title: pageTitle(p),
    description: p.description,
    // A page that sets openGraph replaces the whole object: repeat images.
    // Its own share card (P5.7): public/share/<slug>.jpg, rendered by
    // scripts/brand/share-images.mjs (a test fails if it is missing or stale).
    openGraph: {
      type: "article",
      url: "./",
      siteName: site.name,
      locale: site.locale,
      title: `${pageTitle(p)} — ${site.name}`,
      description: p.description,
      images: [shareImage(p)],
    },
    twitter: { card: "summary_large_image", creator: "@Lubo_Bali", images: [shareImage(p)] },
  };
}

export default async function ProjectPage({ params }: Props) {
  const p = findProject((await params).slug);
  if (!p) notFound();
  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={projectGraph(p)} />
      <article data-chapter={p.chapter} className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 lg:py-16">
        <ProjectHero p={p} />
        <ProjectAnswers p={p} />
        <RealScreen shot={p.screen} />
        <AgentAnatomy p={p} />
        <SafeMark p={p} />
        <ProjectSource p={p} />
        <SimilarProjects list={similarProjects(p)} />
        {/* id="blueprint": the header's "Free AI blueprint" button jumps here. */}
        <p id="blueprint" className="scroll-mt-24 text-center text-lg text-muted-foreground">
          Have a problem like this?{" "}
          <Link href="/blueprint" className="font-medium text-link underline underline-offset-4">
            Get your free AI blueprint
          </Link>{" "}
          in about a minute.
        </p>
      </article>
      <FinalCta />
    </main>
  );
}
