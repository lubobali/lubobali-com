import { caseStudies } from "@/lib/case-studies";
import { site } from "@/lib/site";
import { work } from "@/lib/work";

// Explore (Phase 4 C6, Lubo: "search all of my projects by keyword"): one
// small index built from the same lists as the pages, so it never drifts.
// A project links to its story once the story is published, before that to
// its card on the home page. Phase 5 adds the 30+ projects here.

// Groups, in the order the panel shows them. "start" holds the Phase 5/6
// pages: listed now (Lubo: show the whole site), linked once built; the
// site launches only after they exist, so no "soon" labels.
// Order and tones: Lubo 2026-10-21 (start on top, then stories, then pages).
export const exploreGroups = [
  { id: "start", label: "Start here" },
  { id: "stories", label: "Stories" },
  { id: "pages", label: "On this site" },
] as const;

export type ExploreItem = {
  group: (typeof exploreGroups)[number]["id"];
  title: string;
  subtitle: string;
  href?: string; // none until the page is built
  keywords: readonly string[]; // shown as "matched: ..." when a word hits
  text: string; // searched too, never shown
};

const projects: ExploreItem[] = work.map((w) => {
  const cs = caseStudies.find((c) => c.slug === w.id);
  const story = cs?.published;
  return {
    group: "stories",
    title: w.name,
    subtitle: cs ? cs.title : w.summary,
    href: story ? `/work/${w.id}` : `/#${w.id}`,
    keywords: [...(cs?.tags ?? []), ...w.stack],
    text: [w.summary, ...w.highlights, cs?.problem ?? ""].join(" "),
  };
});

const pages: ExploreItem[] = [
  {
    group: "pages",
    title: "Free AI blueprint",
    subtitle: "Describe a problem, get a first plan in a minute",
    href: "/blueprint",
    keywords: ["blueprint", "AI plan", "free", "automation", "idea"],
    text: "plan timeline risks workflow business problem",
  },
  {
    group: "pages",
    title: "How it works",
    subtitle: "Steps, terms, what happens after the call",
    href: "/#how-it-works",
    keywords: ["process", "price", "terms", "steps"],
    text: "how work together payment timeline",
  },
  {
    group: "pages",
    title: "Built with",
    subtitle: "The tools behind the work",
    href: "/#stack",
    keywords: ["stack", "tools", "tech", "technologies"],
    text: "python aws postgres react claude",
  },
  {
    group: "pages",
    title: "Contact",
    subtitle: "Book a call or write an email",
    href: "/#contact",
    keywords: ["call", "hire", "email", "contact", "book", "meeting"],
    text: `talk project price availability ${site.email}`,
  },
  // Phase 5 + 6 pages: listed so the whole site shows, linked once built.
  {
    group: "start",
    title: "All projects",
    subtitle: "30+ projects, searchable by tech",
    keywords: ["projects", "portfolio", "GitHub", "SQL", "Tableau", "R"],
    text: "data engineering analytics dashboards",
  },
  {
    group: "start",
    title: "About me",
    subtitle: "Who I was, who I am, where I'm going",
    keywords: ["about", "story", "bio"],
    text: "background experience",
  },
  {
    group: "start",
    title: "Resume",
    subtitle: "Experience and skills, with a PDF",
    keywords: ["resume", "CV", "experience", "skills", "PDF"],
    text: "jobs work history",
  },
];

export const exploreItems: readonly ExploreItem[] = [...projects, ...pages];

// Suggestions shown before anything is typed (each hits a real item).
export const exploreTry = ["stock", "fraud", "payments", "Python", "MCP", "automation"] as const;

export type ExploreHit = { item: ExploreItem; matched: string[] };

// Every typed word must hit (AND). A word in the title or a keyword counts
// more than one only in the text. Pure and tiny: 30+ items search in well
// under a millisecond, so no library and no server.
export function searchExplore(query: string, items: readonly ExploreItem[] = exploreItems): ExploreHit[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return items.map((item) => ({ item, matched: [] }));
  const hits: (ExploreHit & { score: number })[] = [];
  for (const item of items) {
    let score = 0;
    const matched: string[] = [];
    const ok = words.every((w) => {
      const key = item.keywords.find((k) => k.toLowerCase().includes(w));
      if (item.title.toLowerCase().includes(w)) score += 5;
      if (key) {
        score += 3;
        if (!matched.includes(key)) matched.push(key);
        return true;
      }
      if (item.title.toLowerCase().includes(w)) return true;
      if (`${item.subtitle} ${item.text}`.toLowerCase().includes(w)) {
        score += 1;
        if (!matched.includes(w)) matched.push(w);
        return true;
      }
      return false;
    });
    if (ok) hits.push({ item, matched, score });
  }
  return hits.sort((a, b) => b.score - a.score).map(({ item, matched }) => ({ item, matched }));
}
