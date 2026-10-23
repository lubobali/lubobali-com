// The fit box's data (Phase 6, P6.6): every piece of work that can prove a
// skill, built from the site's own data, so a new project proves its tech
// the day it's added. The matcher (match.ts) and the words (terms.ts) have
// no imports; this file joins them to the data.
import { publishedCaseStudies } from "@/lib/case-studies";
import { projects } from "@/lib/projects";
import { resume } from "@/lib/resume";
import type { FitSource } from "./match";

// Resume jobs: the ones with a story page prove through the story.
const JOBS: Record<string, { id: string; story?: string }> = {
  HelloPayments: { id: "hellopayments", story: "hellopayments" },
  "LuBot.ai": { id: "lubot", story: "lubot" },
  "RE/MAX": { id: "remax" },
  "2828 Arthington Condominium Association": { id: "condo" },
};

const stackTags = (stack: string) => stack.split(/,\s*|\s*\|\s*/).filter(Boolean);

function buildSources(): FitSource[] {
  const jobs = resume.jobs.map((j) => ({ job: j, ...JOBS[j.company] }));
  const stories: FitSource[] = publishedCaseStudies().map((c) => {
    const job = jobs.find((j) => j.story === c.slug);
    return {
      kind: "story",
      id: c.slug,
      job: job?.id,
      title: c.name,
      href: `/work/${c.slug}`,
      tags: [...c.shelf.tech, ...c.shelf.industries, ...(job ? stackTags(job.job.stack) : [])],
    };
  });
  const plainJobs: FitSource[] = jobs
    .filter((j) => !j.story)
    .map((j) => ({ kind: "job", id: j.id, title: `${j.job.company}, ${j.job.title}`, href: "/resume#experience", tags: stackTags(j.job.stack) }));
  const work: FitSource[] = projects.map((p) => ({
    kind: "project",
    id: p.slug,
    title: p.name,
    href: `/projects/${p.slug}`,
    tags: [...p.tech, ...p.industries],
    chapter: p.chapter,
  }));
  const pages: FitSource[] = [{ kind: "page", id: "/about#security", title: "How I keep your data safe", href: "/about#security", tags: [] }];
  return [...stories, ...plainJobs, ...pages, ...work];
}

export const fitSources: readonly FitSource[] = buildSources();
