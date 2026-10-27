// One weekly note (Phase 9, P9.4): a Markdown file in content/notes/ named
// YYYY-MM-DD-slug.md, with YAML front matter. parseNote() checks every rule
// and returns ALL problems at once; load.ts turns any problem into a failed
// build, so a note without sources, with a bad link or a server detail can
// never reach visitors. Pure: no "@/" imports, so Node tests run it directly.
//
// Safety: raw HTML in the Markdown is printed as text (html: false). Links
// may only be https, site-relative or #anchors; images only our own files.

import MarkdownIt from "markdown-it";
import { parse as parseYaml } from "yaml";

export const CLUSTERS = ["agents", "rag", "mcp", "data-pipelines", "ai-cost"] as const;
export type Cluster = (typeof CLUSTERS)[number];

export type Source = { title: string; url: string };
export type Hero = { value: string; label: string; source: string };

export type Note = {
  slug: string;
  file: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  updated?: string;
  week: number; // ISO week of `date`
  cluster: Cluster;
  stack: string[];
  tldr: string;
  hero: Hero;
  repo: string;
  sources: Source[];
  html: string;
  words: number;
  readMinutes: number;
};

const REQUIRED = ["title", "description", "date", "cluster", "stack", "tldr", "hero", "repo", "sources"];
const OPTIONAL = ["updated"];
const FILE_RE = /^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HTTPS_RE = /^https:\/\/[^\s]+$/;
const REPO_RE = /^https:\/\/github\.com\/lubobali\/[A-Za-z0-9._-]+$/;
const IMAGE_RE = /^\/notes\/[a-z0-9/-]+\.(webp|avif|png|jpg|jpeg|svg)$/;
const LINK_OK = (href: string) => HTTPS_RE.test(href) || /^\/(?!\/)/.test(href) || href.startsWith("#");
const LIMITS = { title: [10, 70], description: [50, 160], tldr: [80, 400] } as const;
const WORDS = { min: 300, max: 1500 };
const WORDS_PER_MINUTE = 230;
const MAX_SLUG = 60;
const MAX_STACK = 8;

// Privacy guard (same rules as /building): nothing that shows the server.
// Client names are checked in CI from a private list (P9.6), never written here.
const PRIVATE: [RegExp, string][] = [
  [/(^|[^\w.])\/(srv|etc|root|home|opt|var)\//, "a server path"],
  [/\b(?:\d{1,3}\.){3}\d{1,3}\b/, "an IP address"],
  [/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, "an email address"],
  [/(^|[\s(`'"])\.env\b/, "an .env file"],
  [/\blocalhost\b/i, "localhost"],
];

const md = new MarkdownIt({ html: false, linkify: false, typographer: false });
md.validateLink = () => true; // let every link through to OUR check, which fails the build

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** ISO-8601 week number of a YYYY-MM-DD day. */
export function isoWeek(day: string): number {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7)); // the Thursday of that week names the year
  const jan1 = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - jan1) / 86_400_000 + 1) / 7);
}

const isDay = (v: unknown): v is string =>
  typeof v === "string" && DATE_RE.test(v) && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v);

const isText = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0;

function splitFrontMatter(raw: string): { front: string; body: string } | null {
  const text = raw.replace(/\r\n/g, "\n");
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) return null;
  return { front: text.slice(4, end), body: text.slice(end + 5) };
}

function checkPrivate(where: string, text: string, errors: string[]): void {
  for (const [re, what] of PRIVATE) if (re.test(text)) errors.push(`privacy: ${where} contains ${what}`);
}

function checkFront(f: Record<string, unknown>, fileDate: string | undefined, errors: string[]): void {
  for (const key of REQUIRED) if (!(key in f)) errors.push(`${key}: missing`);
  for (const key of Object.keys(f))
    if (!REQUIRED.includes(key) && !OPTIONAL.includes(key)) errors.push(`${key}: unknown field (typo?)`);

  for (const [key, [min, max]] of Object.entries(LIMITS)) {
    if (!(key in f)) continue;
    const v = f[key];
    if (!isText(v) || v.length < min || v.length > max) errors.push(`${key}: must be text, ${min}–${max} characters`);
  }
  if ("date" in f) {
    if (!isDay(f.date)) errors.push("date: must be YYYY-MM-DD");
    else if (fileDate && f.date !== fileDate) errors.push(`date: ${f.date} does not match the file name (${fileDate})`);
  }
  if ("updated" in f && (!isDay(f.updated) || (isDay(f.date) && f.updated < f.date)))
    errors.push("updated: must be YYYY-MM-DD, on or after date");
  if ("cluster" in f && !CLUSTERS.includes(f.cluster as Cluster))
    errors.push(`cluster: must be one of ${CLUSTERS.join(", ")}`);
  if ("stack" in f) {
    const s = f.stack;
    if (!Array.isArray(s) || s.length < 1 || s.length > MAX_STACK || !s.every(isText))
      errors.push(`stack: 1–${MAX_STACK} names`);
  }
  if ("repo" in f && !(typeof f.repo === "string" && REPO_RE.test(f.repo)))
    errors.push("repo: must be https://github.com/lubobali/<repo>");
  if ("hero" in f) {
    const h = f.hero as Record<string, unknown> | null;
    if (!h || typeof h !== "object") errors.push("hero: must have value, label and source");
    else {
      if (!isText(h.value) || !isText(h.label)) errors.push("hero: value and label are required");
      if (!(typeof h.source === "string" && HTTPS_RE.test(h.source)))
        errors.push("hero.source: the big number needs an https link to its proof (commit, CI run, file)");
    }
  }
  if ("sources" in f) {
    const list = f.sources;
    if (!Array.isArray(list) || list.length === 0) errors.push("sources: at least one");
    else {
      const seen = new Set<string>();
      list.forEach((s, i) => {
        const src = (s ?? {}) as Record<string, unknown>;
        if (!isText(src.title)) errors.push(`sources[${i}]: title is required`);
        if (!(typeof src.url === "string" && HTTPS_RE.test(src.url))) errors.push(`sources[${i}]: url must be https`);
        else if (seen.has(src.url)) errors.push(`sources[${i}]: duplicate url`);
        else seen.add(src.url);
      });
    }
  }
}

type BodyResult = { html: string; words: number };

function checkBody(body: string, errors: string[]): BodyResult {
  const tokens = md.parse(body, {});
  const ids = new Map<string, number>();
  let words = 0;
  const countWords = (text: string) => (words += text.split(/\s+/).filter(Boolean).length);

  tokens.forEach((t, i) => {
    if (t.type === "heading_open") {
      if (t.tag === "h1") errors.push("h1: the note title is the only h1; start sections at ##");
      const base = slugify(tokens[i + 1]?.content ?? "") || "section";
      const n = (ids.get(base) ?? 0) + 1;
      ids.set(base, n);
      t.attrSet("id", n === 1 ? base : `${base}-${n}`);
    }
    if (t.type === "fence" || t.type === "code_block") checkPrivate("a code block", t.content, errors);
    for (const c of t.children ?? []) {
      if (c.type === "text" || c.type === "code_inline") {
        countWords(c.content);
        checkPrivate("the text", c.content, errors);
      }
      if (c.type === "link_open") {
        const href = String(c.attrGet("href") ?? "");
        if (!LINK_OK(href)) errors.push(`link: "${href}" (only https, /site-paths or #anchors)`);
      }
      if (c.type === "image") {
        const src = String(c.attrGet("src") ?? "");
        if (!IMAGE_RE.test(src)) errors.push(`image: "${src}" (only our own files under /notes/)`);
        if (!c.content.trim()) errors.push(`image: "${src}" needs alt text`);
      }
    }
  });
  if (words < WORDS.min || words > WORDS.max) errors.push(`words: ${words} (keep it ${WORDS.min}–${WORDS.max})`);
  return { html: md.renderer.render(tokens, md.options, {}), words };
}

export function parseNote(file: string, raw: string): { note: Note | null; errors: string[] } {
  const errors: string[] = [];
  const name = FILE_RE.exec(file);
  if (!name || name[2].length > MAX_SLUG) errors.push(`file name: "${file}" must be YYYY-MM-DD-slug.md (a-z, 0-9, -)`);

  const parts = splitFrontMatter(raw);
  if (!parts) return { note: null, errors: [...errors, "front matter: the file must start with a --- block"] };
  let front: unknown;
  try {
    front = parseYaml(parts.front, { uniqueKeys: true, schema: "core" });
  } catch (err) {
    return { note: null, errors: [...errors, `front matter: ${String((err as Error).message).split("\n")[0]}`] };
  }
  if (!front || typeof front !== "object" || Array.isArray(front))
    return { note: null, errors: [...errors, "front matter: must be key: value pairs"] };
  const f = front as Record<string, unknown>;

  checkFront(f, name?.[1], errors);
  for (const key of ["title", "description", "tldr"]) if (isText(f[key])) checkPrivate(key, f[key], errors);
  const hero = (f.hero ?? {}) as Partial<Hero>;
  checkPrivate("hero", `${hero.value ?? ""} ${hero.label ?? ""}`, errors);

  const { html, words } = checkBody(parts.body, errors);
  const note: Note = {
    slug: name?.[2] ?? "",
    file,
    title: String(f.title ?? ""),
    description: String(f.description ?? ""),
    date: String(f.date ?? ""),
    ...(isDay(f.updated) ? { updated: f.updated } : {}),
    week: isDay(f.date) ? isoWeek(f.date) : 0,
    cluster: f.cluster as Cluster,
    stack: Array.isArray(f.stack) ? f.stack.map(String) : [],
    tldr: String(f.tldr ?? ""),
    hero: hero as Hero,
    repo: String(f.repo ?? ""),
    sources: Array.isArray(f.sources) ? (f.sources as Source[]) : [],
    html,
    words,
    readMinutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
  };
  return { note, errors };
}
