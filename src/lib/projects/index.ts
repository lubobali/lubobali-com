import { createSearch } from "@/lib/search/engine";
import { synonyms } from "@/lib/search/synonyms";
import { diabetesReadmissions } from "./diabetes-readmissions";
import { mergeAI } from "./mergeai";
import { CHAPTERS, type Chapter, checkProject, type Project } from "./model";
import { sqlServerToPostgres } from "./sql-server-to-postgres";

// Every project, by chapter, each chapter in the order CEOs like most
// (plans docs/phase-5-project-list.md). New project = one file + a line here.
export const projects: readonly Project[] = [diabetesReadmissions, sqlServerToPostgres, mergeAI];

// What search reads for a project (also used by Explore in P5.5).
export const projectSearchDoc = (p: Project) => ({
  id: p.slug,
  title: p.name,
  keywords: [...p.industries, ...p.tech, CHAPTERS[p.chapter]],
  text: [p.oneLine, p.problem, p.built, p.why, p.result, ...Object.values(p.anatomy ?? {}), p.safe ?? ""].join(" "),
});

// Runs once, when the site builds: any broken project, duplicate slug or a
// CEO phrase that doesn't find its own project fails the build (and CI).
function verify(list: readonly Project[]) {
  const problems: string[] = [];
  const slugs = new Set<string>();
  for (const p of list) {
    if (slugs.has(p.slug)) problems.push(`${p.slug}: slug used twice`);
    slugs.add(p.slug);
    problems.push(...checkProject(p).map((m) => `${p.slug}: ${m}`));
  }
  const search = createSearch(list.map(projectSearchDoc), synonyms);
  for (const p of list) {
    for (const q of p.searches) {
      const { hits, close } = search(q);
      if (close || !hits.some((h) => h.id === p.slug)) problems.push(`${p.slug}: search "${q}" does not find it`);
    }
  }
  if (problems.length) throw new Error(`Project data problems:\n- ${problems.join("\n- ")}`);
}
verify(projects);

export const findProject = (slug: string) => projects.find((p) => p.slug === slug);
export const projectsIn = (chapter: Chapter) => projects.filter((p) => p.chapter === chapter);

// "Similar projects": most shared industries + tech first, then the same
// chapter; never itself. Pure, so the page stays static.
export function similarProjects(p: Project, count = 3): Project[] {
  const shared = (q: Project) =>
    q.industries.filter((i) => p.industries.includes(i)).length * 2 +
    q.tech.filter((t) => p.tech.includes(t)).length +
    (q.chapter === p.chapter ? 1 : 0);
  return projects
    .filter((q) => q.slug !== p.slug)
    .map((q) => ({ q, score: shared(q) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ q }) => q);
}
