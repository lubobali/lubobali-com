// Projects (Phase 5): the shape of one project + the check every project
// passes when the site builds. One small file per project lives next to
// this one; adding a project = one file + one picture (Lubo: 100+ later).
// No imports, so Node runs the tests on this file directly.

// The 3 chapters, in the order Lubo grew (Lubo 2026-10-22). Fixed lists:
// a typo can never invent a new chapter or filter.
export const CHAPTERS = {
  analytics: "Analytics & dashboards",
  pipelines: "Data pipelines",
  ai: "AI agents",
} as const;
export type Chapter = keyof typeof CHAPTERS;

export const INDUSTRIES = [
  "Any business",
  "Customer support",
  "Data quality",
  "Education",
  "Finance",
  "Food",
  "Government",
  "Health",
  "HR",
  "Industry",
  "Jobs",
  "Logistics",
  "Marketing",
  "Payments",
  "Productivity",
  "Retail",
  "Sports",
  "Transport",
  "Weather",
  "Web",
] as const;
export type Industry = (typeof INDUSTRIES)[number];

// The one picture on the page: a real screen, a chart of the real result
// drawn in code (Framer pictures were mostly stock photos, never reused),
// or the flow of the build drawn in code (repos without screenshots).
export type ProjectPicture =
  | { kind: "screen"; image: string; alt: string; caption: string }
  | {
      kind: "chart";
      title: string;
      unit: string;
      bars: readonly { label: string; value: number; note?: string }[];
      caption: string;
    }
  | { kind: "flow"; steps: readonly { label: string; detail: string }[]; caption: string };

export type ProjectLink = {
  kind: "github" | "live" | "video" | "dashboard" | "article";
  url: string;
  label?: string; // default per kind ("See the code on GitHub" ...)
};

// What an AI agent is made of (Jensen Huang, GTC Berlin 2026: model,
// harness, sandbox, knowledge, tools). Every AI-agent page shows what each
// part is in that project: CEOs learn how to judge an agent, engineers see
// Lubo knows the parts (plans docs/phase-5-projects.md, "The message").
export const ANATOMY = {
  model: "Model",
  harness: "Harness",
  guardrails: "Guardrails",
  knowledge: "Knowledge",
  tools: "Tools",
} as const;
export type Anatomy = Record<keyof typeof ANATOMY, string>;

export type Project = {
  slug: string; // /projects/<slug>
  name: string;
  chapter: Chapter;
  industries: readonly Industry[];
  oneLine: string; // under the title, plain words
  description: string; // Google + share preview, 50–160 characters
  number: { value: string; label: string }; // the one real number, big
  // The 4 questions (the same as the Blueprint): plain words, short.
  problem: string;
  built: string;
  why: string; // tech & why
  result: string;
  tech: readonly string[];
  picture: ProjectPicture;
  links: readonly ProjectLink[];
  source?: { label: string; url: string }; // public data credit
  honesty?: string; // e.g. "Generated test data: no real customers"
  // 2–3 phrases a CEO might type; the build proves each one finds this page.
  searches: readonly string[];
  anatomy?: Anatomy; // required for chapter "ai"
  // "See the real app": the real screen, shown large lower on the page,
  // when the top picture is drawn in code (small app text stays readable).
  screen?: { image: string; alt: string; caption: string };
  // "Safe by design" (GTC: "hope isn't security"): only real guardrails,
  // said in one line ("private, encrypted database; no SSH ..."). Never a claim.
  safe?: string;
};

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const blank = (s: unknown) => typeof s !== "string" || s.trim() === "";

/** Problems with one project ([] = fine). The build fails on any. */
export function checkProject(p: Project): string[] {
  const out: string[] = [];
  if (!SLUG.test(p.slug)) out.push(`slug "${p.slug}" must be lower-case-with-dashes`);
  for (const f of ["name", "oneLine", "problem", "built", "why", "result"] as const) {
    if (blank(p[f])) out.push(`${f} is empty`);
  }
  if (!(p.chapter in CHAPTERS)) out.push(`chapter "${p.chapter}" is not one of ${Object.keys(CHAPTERS).join(", ")}`);
  if (p.industries.length === 0) out.push("industries is empty");
  for (const i of p.industries) {
    if (!(INDUSTRIES as readonly string[]).includes(i)) out.push(`industry "${i}" is not in INDUSTRIES`);
  }
  const d = p.description.length;
  if (d < 50 || d > 160) out.push(`description is ${d} characters (50–160)`);
  if (blank(p.number.value) || blank(p.number.label)) out.push("number needs a value and a label");
  if (p.tech.length === 0) out.push("tech is empty");
  if (p.searches.length < 2 || p.searches.length > 3) out.push(`searches: give 2 or 3 (has ${p.searches.length})`);
  for (const l of [...p.links, ...(p.source ? [p.source] : [])]) {
    if (!l.url.startsWith("https://")) out.push(`link ${l.url} must be https`);
  }
  const pic = p.picture;
  if (pic.kind === "screen" && (blank(pic.alt) || blank(pic.image))) out.push("picture: a screen needs an image and alt text");
  if (pic.kind === "chart" && pic.bars.length < 2) out.push("picture: a chart needs 2+ bars");
  if (pic.kind === "flow" && pic.steps.length < 3) out.push("picture: a flow needs 3+ steps");
  if (blank(pic.caption)) out.push("picture: caption is empty");
  if (p.chapter === "ai" && !p.anatomy) out.push("anatomy is required for an AI agent (model, harness, guardrails, knowledge, tools)");
  if (p.anatomy) {
    for (const k of Object.keys(ANATOMY) as (keyof Anatomy)[]) {
      if (blank(p.anatomy[k])) out.push(`anatomy: ${k} is empty`);
    }
  }
  if (p.safe !== undefined && blank(p.safe)) out.push("safe: say how it is safe, or leave it out");
  if (p.screen && (blank(p.screen.image) || blank(p.screen.alt))) out.push("screen: needs an image and alt text");
  if (p.screen && pic.kind === "screen") out.push("screen: the main picture is already a screen");
  return out;
}

/** "Proof you can check": built from the project's real links, never typed. */
export function proofItems(p: Project): string[] {
  const has = (k: ProjectLink["kind"]) => p.links.some((l) => l.kind === k);
  return [
    has("live") && "Live demo",
    has("dashboard") && "Live dashboard",
    has("github") && "Code on GitHub",
    has("video") && "Video walkthrough",
    p.source && "Public data",
    p.honesty && "Generated test data, said so",
  ].filter((x): x is string => Boolean(x));
}
