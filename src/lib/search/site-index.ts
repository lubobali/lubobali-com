import { exploreItems } from "@/lib/explore";
import { projects, projectSearchDoc } from "@/lib/projects";
import { createSearch, type SearchDoc } from "./engine";
import { synonyms } from "./synonyms";

// The whole-site search (Phase 5 P5.5): everything Explore lists (All
// projects, stories, About, site pages) + every project, built from the
// same data as the pages so it never drifts. Served as /search-index.json
// and loaded only when a visitor first opens Explore or touches a search
// box, so pages stay small at 100+ projects. Each entry carries what a
// result tile needs. The id is the link without its first "/".
export type SiteGroup = "featured" | "stories" | "projects" | "start" | "pages";
export type SiteEntry = SearchDoc & {
  group: SiteGroup;
  subtitle: string;
  href?: string; // none until the page is built
  number?: { value: string; label: string };
};

const idOf = (href: string | undefined, title: string) => (href ? href.replace(/^\//, "") : `soon:${title}`);

export const siteDocs: readonly SiteEntry[] = [
  ...exploreItems.map((it) => ({
    id: idOf(it.href, it.title),
    title: it.title,
    keywords: it.keywords,
    text: `${it.subtitle} ${it.text}`,
    group: it.group,
    subtitle: it.subtitle,
    href: it.href,
    number: it.number,
  })),
  ...projects.map((p) => ({
    ...projectSearchDoc(p),
    id: `projects/${p.slug}`,
    group: "projects" as const,
    subtitle: p.oneLine,
    href: `/projects/${p.slug}`,
    number: p.number,
  })),
];

// Runs when the site builds: a duplicate id, or a project whose CEO
// phrases no longer find it among ALL the site's pages, fails the build.
const search = createSearch(siteDocs, synonyms);
function verify() {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const d of siteDocs) {
    if (ids.has(d.id)) problems.push(`"${d.id}" is in the site index twice`);
    ids.add(d.id);
  }
  for (const p of projects) {
    for (const q of p.searches) {
      const { hits, close } = search(q);
      if (close || !hits.some((h) => h.id === `projects/${p.slug}`)) problems.push(`${p.slug}: "${q}" does not find it in the whole-site search`);
    }
  }
  if (problems.length) throw new Error(`Site search problems:\n- ${problems.join("\n- ")}`);
}
verify();

// "Try" words on /projects: problems in a CEO's words (Lubo 2026-10-22).
// One shows only once it really finds a story or project, so the list
// fills itself as projects arrive and a click never ends on "nothing".
const SHELF: readonly SiteGroup[] = ["stories", "projects"];
const shelfSearch = createSearch(
  siteDocs.filter((d) => SHELF.includes(d.group)),
  synonyms,
);
const TRY = [
  "employees leaving",
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
export const shelfTry = TRY.filter((w) => {
  const { hits, close } = shelfSearch(w);
  return !close && hits.length > 0;
}).slice(0, 6);
