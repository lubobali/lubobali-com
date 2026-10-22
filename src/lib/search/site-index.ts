import { publishedCaseStudies } from "@/lib/case-studies";
import { projects, projectSearchDoc } from "@/lib/projects";
import { createSearch, type SearchDoc } from "./engine";
import { synonyms } from "./synonyms";

// What the site search reads (Phase 5): the stories + every project, built
// from the same data as the pages so it never drifts. The id is the page
// path ("work/lubot", "projects/mergeai"). Served as /search-index.json and
// loaded only when a visitor first touches a search box, so pages stay
// small at 100+ projects. Explore moves to it in P5.5.
export const siteDocs: readonly SearchDoc[] = [
  ...publishedCaseStudies().map((c) => ({
    id: `work/${c.slug}`,
    title: c.name,
    keywords: c.tags,
    text: [c.title, c.problem, c.promise].join(" "),
  })),
  ...projects.map((p) => ({ ...projectSearchDoc(p), id: `projects/${p.slug}` })),
];

// "Try" words on /projects: problems in a CEO's words (Lubo 2026-10-22).
// One shows only once it really finds something, so the list fills itself
// as projects arrive and a click never ends on "nothing".
const TRY = [
  "customers leaving",
  "fraud",
  "hospital",
  "payments",
  "slow manual reports",
  "bad data",
  "cut costs",
  "forecast demand",
  "job market",
  "database migration",
  "AI agents",
];
const search = createSearch(siteDocs, synonyms);
export const shelfTry = TRY.filter((w) => {
  const { hits, close } = search(w);
  return !close && hits.length > 0;
}).slice(0, 6);
