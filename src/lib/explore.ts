import { caseStudies, storyPath } from "@/lib/case-studies";
import { ceoQuestions } from "@/lib/ceo-questions";
import { createSearch } from "@/lib/search/engine";
import { synonyms } from "@/lib/search/synonyms";
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
// Lubo 2026-10-22: "All projects" first and easy to spot; the cards must
// not all look the same. So: "All projects" alone as one big card (no
// section frame), stories with their number, the rest as quiet rows.
export const exploreGroups = [
  { id: "featured", label: "All projects" },
  { id: "stories", label: "Stories" },
  { id: "projects", label: "Projects" }, // whole-site search only (P5.5)
  { id: "start", label: "Get to know me" }, // not "About me": the About page card has that name
  { id: "pages", label: "On this site" },
] as const;

export type ExploreItem = {
  group: (typeof exploreGroups)[number]["id"];
  title: string;
  subtitle: string;
  href?: string; // none until the page is built
  keywords: readonly string[]; // shown as "matched: ..." when a word hits
  text: string; // searched too, never shown
  number?: { value: string; label: string }; // a story's headline number
  // Pages (Lubo 2026-10-24: "every page a different colour so it's easy to
  // spot"): each row gets its own tone (explore.css [data-tone]).
  tone?: "amber" | "violet" | "sky" | "green" | "teal" | "ice" | "brand" | "lime" | "rose";
  // Phase 7: a live card. Its dot and subtitle come from the daily data
  // (header -> Explore props), the subtitle below is the plain fallback.
  live?: boolean;
};

const projects: ExploreItem[] = work.map((w) => {
  const cs = caseStudies.find((c) => c.slug === w.id);
  return {
    group: "stories",
    title: w.name,
    subtitle: cs ? cs.title : w.summary,
    href: storyPath(w.id) ?? `/#${w.id}`,
    number: cs?.numbers?.[0],
    keywords: [...(cs?.tags ?? []), ...w.stack],
    text: [w.summary, ...w.highlights, cs?.problem ?? ""].join(" "),
  };
});

const pages: ExploreItem[] = [
  {
    group: "pages",
    tone: "amber",
    title: "Free AI blueprint",
    subtitle: "Describe a problem, get a first plan in a minute",
    href: "/blueprint",
    keywords: ["blueprint", "AI plan", "free", "automation", "idea"],
    text: "plan timeline risks workflow business problem",
  },
  {
    group: "pages",
    tone: "ice",
    title: "How it works",
    subtitle: "Steps, terms, what happens after the call",
    href: "/#how-it-works",
    keywords: ["process", "price", "terms", "steps"],
    text: "how work together payment timeline",
  },
  {
    group: "pages",
    tone: "teal",
    title: "Built with",
    subtitle: "The tools behind the work",
    href: "/#stack",
    keywords: ["stack", "tools", "tech", "technologies"],
    text: "python aws postgres react claude",
  },
  {
    group: "pages",
    tone: "brand",
    title: "Contact",
    subtitle: "Book a call or write an email",
    href: "/#contact",
    keywords: ["call", "hire", "email", "contact", "book", "meeting"],
    text: `talk project price availability ${site.email}`,
  },
  // Phase 5 + 6 pages: listed so the whole site shows, linked once built.
  {
    group: "featured",
    title: "All projects",
    subtitle: "Every system I built, end to end. Search by your problem, industry or tool.",
    href: "/projects",
    keywords: ["projects", "portfolio", "GitHub", "SQL", "Tableau", "R"],
    text: "data engineering analytics dashboards pipelines AI agents",
  },
  // P6.8 (Lubo: "make it visible and openable from Explore"): first in
  // "Get to know me", every question searchable ("data safe", "cost"...).
  {
    group: "start",
    tone: "violet",
    title: "Questions CEOs ask me",
    subtitle: "Straight answers: cost, data safety, AI bills, who owns the code",
    href: "/#questions",
    keywords: ["questions", "FAQ", "price", "cost", "data safety", "AI bills", "trust"],
    text: ceoQuestions.map((q) => q.q).join(" "),
  },
  // Phase 7 (Lubo 2026-10-24: "put it in Get to know me", with a live sign).
  {
    group: "start",
    tone: "lime",
    live: true,
    title: "Building now",
    subtitle: "What I'm shipping this week, proven by real numbers",
    href: "/building",
    keywords: ["building", "now", "active", "current projects", "working on", "tests", "TDD", "CI", "uptime", "commits"],
    text: "live activity what are you working on right now this week shipped updates automated tests test-first CI runs LuBot uptime milestones",
  },
  // Phase 9: the weekly notes (each note is also in the whole-site search).
  {
    group: "start",
    tone: "rose",
    title: "Notes",
    subtitle: "One build a week with the newest AI: real numbers, what broke, the code",
    href: "/notes",
    keywords: ["notes", "blog", "articles", "weekly", "AI news", "build log", "RSS", "listen", "audio"],
    text: "what I learned this week newest AI tested hands-on experiments write-ups podcast claims checked",
  },
  {
    group: "start",
    tone: "sky",
    title: "About me",
    subtitle: "How I think, how I keep your data safe, and who I am",
    href: "/about",
    keywords: ["about", "story", "bio", "security", "data privacy", "encryption"],
    text: "background experience basketball Bulgarian US citizen business first encrypted your cloud never trains AI",
  },
  {
    group: "start",
    tone: "green",
    title: "Resume",
    subtitle: "Paste your job post: see what I've already proven. PDF too.",
    href: "/resume",
    keywords: ["resume", "CV", "experience", "skills", "PDF", "job post", "fit"],
    text: "jobs work history",
  },
];

export const exploreItems: readonly ExploreItem[] = [...projects, ...pages];

// Suggestions shown before anything is typed (each hits a real item).
export const exploreTry = ["stock", "fraud", "payments", "Python", "MCP", "automation"] as const;

export type ExploreHit = { item: ExploreItem; matched: string[] };

// The site search engine (src/lib/search/engine.ts): CEO words, typos,
// filler words. Only full matches for now; the "closest projects" and
// "not built yet" screens come with Phase 5 P5.5.
const engine = createSearch(
  exploreItems.map((item, i) => ({
    id: String(i),
    title: item.title,
    keywords: item.keywords,
    text: `${item.subtitle} ${item.text}`,
  })),
  synonyms,
);

export function searchExplore(query: string): ExploreHit[] {
  const { hits, close } = engine(query);
  if (close) return [];
  return hits.map((h) => ({ item: exploreItems[Number(h.id)], matched: h.matched }));
}
