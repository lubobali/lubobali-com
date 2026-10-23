// "Does Lubo fit your project?" (Phase 6, P6.6): reads a pasted job post or
// a short question and lists each need it names, with the real work that
// proves it. Pure and dependency-free (types only), so Node runs the tests on
// it directly; it runs in the visitor's browser, nothing is sent anywhere.
//
// Rules (Lubo 2026-10-24):
// - a need is "yes" (✓) only when real work proves it, with links: a claim
//   a CEO can't check would cost more than a miss;
// - otherwise it is "new": a new tool for the same job, said positively,
//   with the closest real work (copy.ts), never "can't" or "not qualified";
// - no percentage score; years of experience are not judged.
import type { FitKind, FitTerm } from "./terms";

/** One piece of work that can prove a skill. */
export type FitSource = {
  kind: "story" | "job" | "project" | "page";
  id: string;
  title: string;
  href: string;
  tags: readonly string[]; // tech + industries, as the data writes them
  chapter?: string;
  job?: string; // a story that is also a resume job proves "job:<id>"
};

export type FitProof = { kind: FitSource["kind"]; id: string; title: string; href: string };

export type FitNeed = {
  id: string;
  label: string;
  /** What to show: the visitor's own word for a group label ("Elasticsearch",
   * not "Pinecone / Weaviate / Milvus"), else the label. */
  shown: string;
  kind: FitKind;
  status: "yes" | "new";
  /** How a "new" need is said (terms.ts `miss`, by kind when not set). */
  miss: "tool" | "industry" | "adjacent" | "talk";
  proof: FitProof[];
  closest: { id: string; label: string; proof: FitProof[] }[];
};

export type FitTopic = "rate" | "availability" | "location";

export type FitResult = { needs: FitNeed[]; found: number; total: number; topics: FitTopic[] };

const MAX_TEXT = 20_000; // characters; a longer paste is cut, never slow

// Lines every job post has that are not skills. Masked before matching, so
// "health insurance" never reads as healthcare experience.
const NOISE = [
  "health insurance", "medical insurance", "dental insurance", "vision insurance", "life insurance",
  "disability insurance", "insurance coverage", "medical dental", "dental and vision", "health benefits",
  "health savings", "wellness", "stock option", "employee stock", "401 k", "401k", "paid time off",
  "parental leave", "equal opportunity", "employee benefits", "background check", "sales pipeline",
  "intellectual property", "health and safety",
  // Benefits, pay and legal lines (review 2026-10-24: a nurse post read 4/4).
  "medical dental and vision insurance", "dental and vision insurance", "medical vision and dental", "medical and dental", "medical vision", "medical benefit", "medical leave",
  "life and disability", "commuter benefit", "free lunch", "pet insurance", "student loan",
  "accredited university", "federal state", "federal law", "federal holiday", "bank holiday", "food bank",
  "financial wellness", "stock based", "in stock", "talent pipeline", "reporting to", "bi weekly",
  "climate of inclusion", "upward mobility", "career mobility", "neuro linguistic programming",
  "resume as a pdf", "pdf resume", "individual development plan", "social security",
  // People called agents, not AI agents.
  "real estate agent", "insurance agent", "support agent", "customer service agent", "call center agent",
  "sales agent", "travel agent", "user agent", "free agent", "leasing agent", "listing agent", "booking agent",
  "agent of change",
];

// Weak words (terms.ts `weak`) count only when the text is about tech.
const TECH_CONTEXT = [
  "ai", "artificial intelligence", "llm", "genai", "gpt", "machine learning", "ml", "rag", "mcp", "python",
  "sql", "software", "backend", "cloud", "aws", "developer", "engineer", "engineering", "kubernetes",
  "docker", "database", "automation", "automate", "agentic", "typescript", "javascript", "data pipeline",
];

const TOPICS: { topic: FitTopic; re: RegExp }[] = [
  { topic: "rate", re: /\b(hourly|your rates?|day rate|how much|charge|salary|fees?|cost to hire|your price)\b/i },
  { topic: "availability", re: /\b(available|availability|start date|when can you start|full[- ]time|part[- ]time)\b/i },
  { topic: "location", re: /\b(relocat\w*|on[- ]?site|in[- ]office|time ?zone)\b/i },
];

const KIND_ORDER: Record<FitProof["kind"], number> = { story: 0, job: 1, page: 2, project: 3 };

// Like the site search (search/engine.ts): lower case, no accents or
// punctuation, plurals folded. Kept here so this file has no
// runtime imports (Node loads it in the tests).
const normalize = (s: string) =>
  s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
// Plurals folded: "dashboards" = "dashboard", "harnesses" / "matches" /
// "boxes" lose their "es", "libraries" = "library".
const stem = (w: string) =>
  w.length <= 3 || !w.endsWith("s") || w.endsWith("ss")
    ? w
    : /(?:ss|x|ch|sh)es$/.test(w)
      ? w.slice(0, -2)
      : /[^aeiou]ies$/.test(w)
        ? `${w.slice(0, -3)}y`
        : w.slice(0, -1);
const key = (s: string) => normalize(s).split(" ").filter(Boolean).map(stem).join(" ");

/** Work that proves a term, from its proof keys (see terms.ts). */
export function proveTerm(term: FitTerm, sources: readonly FitSource[]): FitProof[] {
  const hits = new Map<string, FitSource>();
  for (const k of term.proof) {
    const at = k.indexOf(":");
    const type = k.slice(0, at);
    const value = k.slice(at + 1);
    for (const s of sources) {
      const ok =
        type === "tech" || type === "industry"
          ? s.tags.some((t) => key(t) === key(value))
          : type === "chapter"
            ? s.chapter === value
            : (s.kind === type && s.id === value) || (type === "job" && s.job === value);
      if (ok) hits.set(`${s.kind}:${s.id}`, s); // two jobs can share a link (review: RE/MAX was lost)
    }
  }
  return [...hits.values()]
    .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind])
    .map(({ kind, id, title, href }) => ({ kind, id, title, href }));
}

type Found = { term: FitTerm; at: number; word: string };

/** Every term the text names, in the order the text names them. */
export function findTerms(text: string, terms: readonly FitTerm[]): Found[] {
  const raw = text.slice(0, MAX_TEXT);
  let hay = ` ${key(raw)} `;
  // Masks keep the length, so positions (the order needs are shown in) stay true.
  const mask = (p: string) => p.replace(/[^ ]/g, "_");
  // Longest first: "wellness" must not eat the "financial wellness" line.
  for (const n of NOISE.map(key).sort((a, b) => b.length - a.length)) hay = hay.split(` ${n} `).join(` ${mask(n)} `);
  const tech = TECH_CONTEXT.some((w) => hay.includes(` ${key(w)} `));

  // Longest phrase first, and a matched phrase is masked, so "power bi"
  // doesn't also count as "bi" and "vector store" not as "store".
  const isShort = key(raw).split(" ").filter(Boolean).length <= 4;
  const phrases = terms
    .flatMap((term) =>
      [...term.aliases, ...(tech ? (term.weak ?? []) : []), ...(isShort ? (term.short ?? []) : [])].map((a) => ({ term, phrase: key(a) })),
    )
    .filter((p) => p.phrase)
    .sort((a, b) => b.phrase.length - a.phrase.length);
  const first = new Map<string, { at: number; word: string }>();
  const len = hay.length || 1;
  const keep = (id: string, at: number, word: string) => {
    const seen = first.get(id);
    if (!seen || at < seen.at) first.set(id, { at, word });
  };
  for (const { term, phrase } of phrases) {
    const needle = ` ${phrase} `;
    let i = hay.indexOf(needle);
    while (i !== -1) {
      keep(term.id, i / len, phrase);
      hay = hay.slice(0, i + 1) + mask(phrase) + hay.slice(i + 1 + phrase.length);
      i = hay.indexOf(needle);
    }
  }
  // Tool names that are also English words: the pattern's group 1 is the
  // word, the rest is context (no lookbehind, see terms.ts).
  for (const term of terms) {
    for (const pattern of term.exact ?? []) {
      const m = new RegExp(pattern).exec(raw);
      if (m?.[1]) keep(term.id, (m.index + m[0].length - m[1].length) / (raw.length || 1), m[1]);
    }
  }
  const byId = new Map(terms.map((t) => [t.id, t]));
  return [...first.entries()].sort((a, b) => a[1].at - b[1].at).map(([id, f]) => ({ term: byId.get(id)!, at: f.at, word: f.word }));
}

// The visitor's own word, with its own capitals ("elasticsearch" typed ->
// "elasticsearch"; "Elasticsearch" -> "Elasticsearch"), found back in the raw text.
function asTyped(raw: string, word: string): string {
  const pattern = word
    .split(" ")
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter(Boolean)
    .join("[^A-Za-z0-9]+");
  const m = pattern ? new RegExp(pattern, "i").exec(raw) : null;
  const found = m ? m[0] : word;
  return found.charAt(0).toUpperCase() + found.slice(1);
}

const missOf = (t: FitTerm): FitNeed["miss"] => t.miss ?? (t.kind === "industry" ? "industry" : t.kind === "practice" ? "talk" : "tool");

/** The answer for a pasted job post or a question. */
export function matchFit(text: string, terms: readonly FitTerm[], sources: readonly FitSource[]): FitResult {
  const byId = new Map(terms.map((t) => [t.id, t]));
  const raw = text.slice(0, MAX_TEXT);
  const needs: FitNeed[] = findTerms(text, terms).map(({ term, word }) => {
    const proof = proveTerm(term, sources);
    const closest = proof.length
      ? []
      : (term.closest ?? [])
          .map((id) => byId.get(id))
          .filter((t): t is FitTerm => Boolean(t))
          .map((t) => ({ id: t.id, label: t.label, proof: proveTerm(t, sources) }))
          .filter((c) => c.proof.length);
    const shown = term.label.includes(" / ") ? asTyped(raw, word) : term.label;
    return { id: term.id, label: term.label, shown, kind: term.kind, status: proof.length ? "yes" : "new", miss: missOf(term), proof, closest };
  });
  return {
    needs,
    found: needs.filter((n) => n.status === "yes").length,
    total: needs.length,
    topics: TOPICS.filter((t) => t.re.test(raw)).map((t) => t.topic),
  };
}
