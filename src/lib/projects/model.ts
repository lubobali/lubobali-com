// Projects (Phase 5): the shape of one project + the check every project
// passes when the site builds. One small file per project lives next to
// this one; adding a project = one file + one picture (Lubo: 100+ later).
// No imports, so Node runs the tests on this file directly.

// The 3 chapters, in the order every page shows them: AI agents first
// (Lubo 2026-10-22: "this is hot right now"), then Data pipelines, then
// Analytics & dashboards. Fixed lists: a typo can never invent a new
// chapter or filter.
export const CHAPTERS = {
  ai: "AI agents",
  pipelines: "Data pipelines",
  analytics: "Analytics & dashboards",
} as const;
export const CHAPTER_ORDER = Object.keys(CHAPTERS) as (keyof typeof CHAPTERS)[];
export type Chapter = keyof typeof CHAPTERS;

export const INDUSTRIES = [
  "Any business",
  "Customer support",
  "Data quality",
  "Education",
  "Facilities",
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
  | { kind: "flow"; steps: readonly { label: string; detail: string }[]; caption: string }
  // The brand-card kit (P5.6, Lubo: "a unique chart for every project"):
  // safety layers an item passes through, top to bottom, then where it lands.
  | { kind: "gates"; title: string; gates: readonly { label: string; detail: string; turnsAway?: boolean }[]; outcomes: readonly string[]; caption: string }
  // The same work before vs after, as two bars made of the same stages
  // (totals are the sums, never typed).
  | { kind: "race"; title: string; unit: string; stages: readonly { label: string; before: number; after: number }[]; caption: string }
  // One share (0–100%) per ring, side by side.
  | { kind: "rings"; title: string; rings: readonly { label: string; value: number }[]; caption: string }
  // Agents passing the work around a circle; the checker sends it back.
  | {
      kind: "loop";
      title: string;
      agents: readonly { label: string; detail: string }[];
      back: string;
      center: { value: string; label: string };
      caption: string;
    }
  // Many in at the top, few worth it out at the bottom.
  | { kind: "funnel"; title: string; stages: readonly { label: string; detail: string }[]; caption: string }
  // Live items with their clocks, flowing on into a history.
  | {
      kind: "stream";
      title: string;
      items: readonly { label: string; age: string; state: "fresh" | "ageing" | "late" }[];
      into: { label: string; detail: string };
      caption: string;
    }
  // A few big numbers, plus a ring (one share) or small bars.
  | {
      kind: "kpis";
      title: string;
      tiles: readonly { value: string; label: string }[];
      ring?: { value: number; label: string };
      bars?: { title: string; prefix?: string; items: readonly { label: string; value: number }[] };
      caption: string;
    }
  // One dot per `per` items, by group; lit groups glow.
  | { kind: "dots"; title: string; per: number; groups: readonly { label: string; count: number; lit?: boolean }[]; caption: string }
  // Batch 2 (P5.6). Big before → after lines (cost, tokens, tools).
  | { kind: "drops"; title: string; rows: readonly { label: string; before: string; after: string; cut: string }[]; caption: string }
  // Counted things before vs after, drawn as dots.
  | { kind: "tally"; title: string; unit: string; rows: readonly { label: string; before: number; after: number }[]; caption: string }
  // Raw rows split into clean + held back (must add up), then the result.
  | {
      kind: "medallion";
      title: string;
      raw: { label: string; count: number };
      clean: { label: string; count: number };
      held: { label: string; count: number; detail: string };
      gold: { label: string; detail: string };
      caption: string;
    }
  // A week of scheduled work, day by day.
  | { kind: "week"; title: string; days: readonly { day: string; posts: readonly string[] }[]; note: string; caption: string }
  // An agent's tools: what it reads, what it writes, around one store.
  | { kind: "toolbox"; title: string; read: readonly string[]; write: readonly string[]; center: string; caption: string }
  // A question that takes one of two roads to the same answer.
  | {
      kind: "fork";
      title: string;
      question: string;
      left: { label: string; detail: string };
      right: { label: string; detail: string };
      end: { label: string; detail: string };
      caption: string;
    }
  // Groups of named items (e.g. stocks by sector) plus a few stats.
  | {
      kind: "sectors";
      title: string;
      groups: readonly { name: string; items: readonly string[] }[];
      stats: readonly { value: string; label: string }[];
      caption: string;
    }
  // Batch 3 (P5.6). Questions and what was found, with a match score.
  | { kind: "matches"; title: string; rows: readonly { question: string; found: string; score: number }[]; caption: string }
  // One question, the tools called, the answer (highlights must be in it).
  | { kind: "chat"; title: string; question: string; calls: readonly string[]; answer: string; highlights: readonly string[]; caption: string }
  // Steps on one time bar (e.g. seconds to a result).
  | { kind: "timeline"; title: string; unit: string; steps: readonly { label: string; value: number }[]; caption: string }
  // A grid of partitions; a query reads only the lit row.
  | { kind: "grid"; title: string; rows: readonly string[]; cols: readonly string[]; lit: string; caption: string }
  // Data quality rules as written, each one a check.
  | { kind: "rules"; title: string; rules: readonly string[]; caption: string }
  // Events split into sessions by an inactivity gap (illustration).
  | { kind: "sessions"; title: string; gap: string; sessions: readonly number[]; caption: string }
  // Batch 4 (P5.6). Two numbers side by side; the winner lit.
  | {
      kind: "versus";
      title: string;
      left: { value: string; label: string };
      right: { value: string; label: string };
      winner: "left" | "right";
      caption: string;
    }
  // What was planned vs what was delivered, on one scale.
  | {
      kind: "gap";
      title: string;
      unit: string;
      planned: { label: string; value: number };
      actual: { label: string; value: number };
      note: string;
      caption: string;
    }
  // A scale with the sweet spot marked.
  | { kind: "range"; title: string; unit: string; min: number; max: number; low: number; high: number; label: string; caption: string }
  // What people assumed vs what the data showed.
  | { kind: "myths"; title: string; rows: readonly { assumed: string; found: string }[]; caption: string }
  // The same rows in two systems; the share that silently went missing.
  | {
      kind: "reconcile";
      title: string;
      left: { label: string; note: string };
      right: { label: string; note: string };
      missingShare: number;
      caption: string;
    };

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
  honesty?: string; // what is not real or not running, said plainly ("Generated test data: ...", "No longer running: ...")
  // 2–3 phrases a CEO might type; the build proves each one finds this page.
  searches: readonly string[];
  anatomy?: Anatomy; // required for chapter "ai"
  // "See the real app": the real screen, shown large lower on the page,
  // when the top picture is drawn in code (small app text stays readable).
  screen?: { image: string; alt: string; caption: string; title?: string }; // title: default "See the real app"
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
  if (pic.kind === "gates" && pic.gates.length < 3) out.push("picture: gates needs 3+ gates");
  if (pic.kind === "gates" && pic.outcomes.length < 2) out.push("picture: gates needs 2+ outcomes");
  if (pic.kind === "race" && pic.stages.length < 2) out.push("picture: a race needs 2+ stages");
  if (pic.kind === "race") {
    for (const st of pic.stages) if (st.after > st.before) out.push(`picture: race stage "${st.label}" got slower: check the data`);
  }
  if (pic.kind === "rings" && pic.rings.length < 2) out.push("picture: rings needs 2+ rings");
  if (pic.kind === "rings" && pic.rings.some((r) => r.value < 0 || r.value > 100)) out.push("picture: each ring is a share between 0 and 100");
  if (pic.kind === "loop" && pic.agents.length < 3) out.push("picture: a loop needs 3+ agents");
  if (pic.kind === "funnel" && pic.stages.length < 3) out.push("picture: a funnel needs 3+ stages");
  if (pic.kind === "stream" && pic.items.length < 2) out.push("picture: a stream needs 2+ items");
  if (pic.kind === "kpis" && (pic.tiles.length < 2 || pic.tiles.length > 4)) out.push("picture: kpis needs 2 to 4 tiles");
  if (pic.kind === "kpis" && pic.ring && (pic.ring.value < 0 || pic.ring.value > 100)) out.push("picture: the ring is a share between 0 and 100");
  if (pic.kind === "dots") {
    const dots = pic.groups.reduce((n, g) => n + Math.round(g.count / pic.per), 0);
    if (pic.groups.length < 2) out.push("picture: dots needs 2+ groups");
    if (pic.per < 1 || dots > 400) out.push(`picture: too many dots (${dots}): raise "per" so the page stays light`);
  }
  if (pic.kind === "reconcile" && (pic.missingShare < 0 || pic.missingShare > 1)) out.push("picture: missingShare is between 0 and 1");
  if (pic.kind === "drops" && pic.rows.length < 2) out.push("picture: drops needs 2+ rows");
  if (pic.kind === "tally") {
    if (pic.rows.length < 2) out.push("picture: tally needs 2+ rows");
    for (const r of pic.rows) if (r.after > r.before) out.push(`picture: tally "${r.label}" grew: check the data`);
    if (pic.rows.some((r) => r.before > 40)) out.push("picture: tally draws one dot each: keep rows under 40 dots");
  }
  if (pic.kind === "medallion" && pic.clean.count + pic.held.count !== pic.raw.count) {
    out.push(`picture: medallion ${pic.clean.label} + ${pic.held.label} must add up to ${pic.raw.label} (nothing lost)`);
  }
  if (pic.kind === "week" && pic.days.length !== 7) out.push("picture: a week needs 7 days");
  if (pic.kind === "toolbox" && (pic.read.length === 0 || pic.write.length === 0)) out.push("picture: a toolbox needs read and write tools");
  if (pic.kind === "sectors" && pic.groups.length < 2) out.push("picture: sectors needs 2+ groups");
  if (pic.kind === "matches") {
    if (pic.rows.length < 2) out.push("picture: matches needs 2+ rows");
    if (pic.rows.some((r) => r.score < 0 || r.score > 1)) out.push("picture: a match score is between 0 and 1");
  }
  if (pic.kind === "chat") {
    if (pic.calls.length === 0) out.push("picture: a chat needs at least one tool call");
    for (const h of pic.highlights) if (!pic.answer.includes(h)) out.push(`picture: highlight "${h}" is not in the answer`);
  }
  if (pic.kind === "timeline" && pic.steps.length < 2) out.push("picture: a timeline needs 2+ steps");
  if (pic.kind === "grid" && !pic.rows.includes(pic.lit)) out.push(`picture: lit row "${pic.lit}" is not one of the rows`);
  if (pic.kind === "rules" && pic.rules.length < 2) out.push("picture: rules needs 2+ rules");
  if (pic.kind === "sessions" && pic.sessions.length < 2) out.push("picture: sessions needs 2+ sessions");
  if (pic.kind === "gap" && (pic.planned.value <= 0 || pic.actual.value <= 0)) out.push("picture: gap values must be above zero");
  if (pic.kind === "range" && !(pic.min <= pic.low && pic.low < pic.high && pic.high <= pic.max)) out.push("picture: the range's sweet spot must sit inside its scale");
  if (pic.kind === "myths" && pic.rows.length < 2) out.push("picture: myths needs 2+ rows");
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

/** Two neighbours in one chapter with the same picture kind (Lubo: every
 * project easy to remember at first look). The build fails on any. */
export function kindClashes(list: readonly Pick<Project, "slug" | "chapter" | "picture">[]): string[] {
  const out: string[] = [];
  const last = new Map<string, Pick<Project, "slug" | "picture">>();
  for (const p of list) {
    const prev = last.get(p.chapter);
    if (prev && prev.picture.kind === p.picture.kind) out.push(`${prev.slug} and ${p.slug} both use "${p.picture.kind}": pick another picture`);
    last.set(p.chapter, p);
  }
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
    p.honesty && "Limits said openly",
  ].filter((x): x is string => Boolean(x));
}
