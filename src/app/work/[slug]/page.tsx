import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ForEngineers, HardProblems } from "@/components/case-study/build";
import { Hook } from "@/components/case-study/hook";
import { Contest, Roadmap } from "@/components/case-study/results";
import { BeforeAfter, Challenges, Day, Facts, Ideas, Quote, Stats, UseCases } from "@/components/case-study/sections";
import { Queue, Shapes } from "@/components/case-study/story";
import { FinalCta } from "@/components/home/final-cta";
import { caseStudies, findCaseStudy } from "@/lib/case-studies";
import { site } from "@/lib/site";

// /work/<slug> (Phase 4 C2): one engine for every case study, in Lubo's
// order: hook -> before/after -> use cases -> hard problems (or, for client
// work, the ideas) -> role/stack -> for engineers -> the same finish line
// as the home page. Unpublished = noindex (out of the sitemap, never linked).
export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cs = findCaseStudy((await params).slug);
  if (!cs) return {};
  const title = `${cs.name}: ${cs.title}`;
  return {
    title,
    description: cs.description,
    robots: cs.published ? undefined : { index: false, follow: false },
    // A page that sets openGraph replaces the whole object: repeat images.
    openGraph: {
      type: "article",
      url: "./",
      siteName: site.name,
      locale: site.locale,
      title: `${title} — ${site.name}`,
      description: cs.description,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name}, ${site.jobTitle}` }],
    },
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const cs = findCaseStudy((await params).slug);
  if (!cs) notFound();
  return (
    <main className="flex flex-1 flex-col">
      <article className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 py-12 sm:px-6 lg:py-16">
        <Hook cs={cs} />
        <BeforeAfter cs={cs} />
        <Queue cs={cs} />
        <Shapes cs={cs} />
        <Contest cs={cs} />
        <Day cs={cs} />
        <UseCases cs={cs} />
        <Stats cs={cs} />
        <HardProblems cs={cs} />
        <Roadmap cs={cs} />
        <Challenges cs={cs} />
        <Ideas cs={cs} />
        <Quote cs={cs} />
        <Facts cs={cs} />
        <ForEngineers cs={cs} />
        {/* id="blueprint": the header's "Free AI blueprint" button jumps here. */}
        <p id="blueprint" className="scroll-mt-24 text-center text-lg text-muted-foreground">
          Want a plan like this for your business?{" "}
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
