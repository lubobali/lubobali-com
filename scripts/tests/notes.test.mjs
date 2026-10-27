// Notes content contract (Phase 9, P9.4). A note is one Markdown file in
// content/notes/YYYY-MM-DD-slug.md with front matter. Anything that breaks
// the rules (no source for the big number, a javascript: link, a server
// path...) FAILS the build: a bad note can never reach visitors.
import "../lib/ts-paths.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";

const { parseNote, isoWeek, CLUSTERS } = await import("../../src/lib/notes/note.ts");

const FILE = "2026-11-02-shipped-or-hype.md";
const BODY = [
  "## What's new",
  "",
  ...Array.from({ length: 40 }, (_, i) => `Sentence ${i} about the build, with real words and no fluff at all here.`),
  "",
  "See the [release notes](https://example.com/release) and [my build page](/building).",
].join("\n");

const FRONT = {
  title: "Shipped or hype? An AI news radar that can't make up links",
  description: "I built a weekly AI news email where every line has a source. Here is how, what broke, and what it costs.",
  date: "2026-11-02",
  cluster: "agents",
  stack: ["Python", "OpenRouter", "Postgres"],
  tldr: "I built a weekly AI news email where Python attaches every link, so the model can't invent one. It costs about $0.25 a week.",
  hero: { value: "$0.25", label: "per week to run", source: "https://github.com/lubobali/shipped-or-hype-ai#cost" },
  repo: "https://github.com/lubobali/shipped-or-hype-ai",
  sources: [{ title: "OpenRouter pricing", url: "https://openrouter.ai/pricing" }],
};

const yamlOf = (obj) => JSON.stringify(obj, null, 2); // JSON is valid YAML
const raw = (front = FRONT, body = BODY) => `---\n${yamlOf(front)}\n---\n\n${body}\n`;
const without = (key) => Object.fromEntries(Object.entries(FRONT).filter(([k]) => k !== key));
const errorsOf = (front, body, file = FILE) => parseNote(file, raw(front, body)).errors;
const has = (errors, word) => errors.some((e) => e.includes(word));

test("a good note parses with no errors and gets its derived fields", () => {
  const { note, errors } = parseNote(FILE, raw());
  assert.deepEqual(errors, []);
  assert.equal(note.slug, "shipped-or-hype");
  assert.equal(note.week, 45); // ISO week of 2026-11-02
  assert.ok(note.words > 300 && note.readMinutes >= 2);
  assert.match(note.html, /<h2 id="whats-new">What’s new<\/h2>|<h2 id="whats-new">What's new<\/h2>/);
});

test("ISO week numbers, including the year edges", () => {
  const cases = { "2026-01-01": 1, "2026-11-02": 45, "2026-12-28": 53, "2027-01-01": 53, "2027-01-04": 1, "2024-12-30": 1 };
  for (const [day, week] of Object.entries(cases)) assert.equal(isoWeek(day), week, day);
});

test("file name must be YYYY-MM-DD-slug.md and match the date", () => {
  assert.ok(has(errorsOf(FRONT, BODY, "shipped.md"), "file name"));
  assert.ok(has(errorsOf(FRONT, BODY, "2026-11-02-Bad_Slug.md"), "file name"));
  assert.ok(has(errorsOf({ ...FRONT, date: "2026-11-03" }, BODY), "date"));
});

for (const key of ["title", "description", "date", "cluster", "stack", "tldr", "hero", "repo", "sources"]) {
  test(`missing ${key} fails`, () => {
    assert.ok(has(errorsOf(without(key)), key));
  });
}

test("an unknown front matter field fails (catches typos)", () => {
  assert.ok(has(errorsOf({ ...FRONT, sorces: [] }), "sorces"));
});

test("the big number needs a source link", () => {
  assert.ok(has(errorsOf({ ...FRONT, hero: { value: "$0.25", label: "per week" } }), "hero.source"));
  assert.ok(has(errorsOf({ ...FRONT, hero: { ...FRONT.hero, source: "trust me" } }), "hero.source"));
});

test("every source needs a title and an https link, no duplicates", () => {
  assert.ok(has(errorsOf({ ...FRONT, sources: [] }), "sources"));
  assert.ok(has(errorsOf({ ...FRONT, sources: [{ title: "x", url: "http://insecure.example" }] }), "https"));
  assert.ok(has(errorsOf({ ...FRONT, sources: [{ url: "https://a.example" }] }), "title"));
  const dup = { title: "a", url: "https://a.example" };
  assert.ok(has(errorsOf({ ...FRONT, sources: [dup, dup] }), "duplicate"));
});

test("cluster must be one of the five", () => {
  assert.deepEqual(CLUSTERS, ["agents", "rag", "mcp", "data-pipelines", "ai-cost"]);
  assert.ok(has(errorsOf({ ...FRONT, cluster: "biohacking" }), "cluster"));
});

test("repo must be one of Lubo's GitHub repos", () => {
  assert.ok(has(errorsOf({ ...FRONT, repo: "https://gitlab.com/x/y" }), "repo"));
});

test("lengths: title for search, description for the snippet, short tl;dr", () => {
  assert.ok(has(errorsOf({ ...FRONT, title: "x".repeat(71) }), "title"));
  assert.ok(has(errorsOf({ ...FRONT, description: "too short" }), "description"));
  assert.ok(has(errorsOf({ ...FRONT, tldr: "x".repeat(401) }), "tldr"));
  assert.ok(has(errorsOf({ ...FRONT, stack: [] }), "stack"));
});

test("updated must not be before the date", () => {
  assert.deepEqual(errorsOf({ ...FRONT, updated: "2026-11-09" }), []);
  assert.ok(has(errorsOf({ ...FRONT, updated: "2026-11-01" }), "updated"));
});

test("raw HTML in a note is printed as text, never run", () => {
  const { note, errors } = parseNote(FILE, raw(FRONT, `${BODY}\n\n<script>alert(1)</script>`));
  assert.deepEqual(errors, []);
  assert.ok(!note.html.includes("<script>"));
  assert.ok(note.html.includes("&lt;script&gt;"));
});

test("links: only https, site-relative or #anchors", () => {
  for (const bad of ["javascript:alert(1)", "http://insecure.example", "mailto:a@b.co", "ftp://x.example/f"]) {
    assert.ok(has(errorsOf(FRONT, `${BODY}\n\n[x](${bad})`), "link"), bad);
  }
  assert.deepEqual(errorsOf(FRONT, `${BODY}\n\n[a](#cost) [b](/projects/x)`), []);
});

test("images: only our own files", () => {
  assert.ok(has(errorsOf(FRONT, `${BODY}\n\n![chart](https://cdn.example/x.png)`), "image"));
  assert.deepEqual(errorsOf(FRONT, `${BODY}\n\n![Cost per week chart](/notes/shipped-or-hype/cost.webp)`), []);
  assert.ok(has(errorsOf(FRONT, `${BODY}\n\n![](/notes/x.webp)`), "alt"));
});

test("the page title is the only h1", () => {
  assert.ok(has(errorsOf(FRONT, `# Another title\n\n${BODY}`), "h1"));
});

test("length: 300 to 1500 words", () => {
  assert.ok(has(errorsOf(FRONT, "## Short\n\nToo short."), "words"));
});

test("privacy guard: no server paths, IPs or email addresses", () => {
  for (const leak of ["see /srv/app/x", "edit /etc/nginx/x", "on 10.1.2.3 now", "mail me@example.com", "the .env file"]) {
    assert.ok(has(errorsOf(FRONT, `${BODY}\n\n${leak}`), "privacy"), leak);
  }
  assert.ok(has(errorsOf({ ...FRONT, tldr: `${FRONT.tldr} Box at 10.1.2.3.` }), "privacy"));
});

test("broken YAML is a clear error, not a crash", () => {
  const { errors } = parseNote(FILE, "---\ntitle: [unclosed\n---\n\nbody");
  assert.ok(has(errors, "front matter"));
  assert.ok(has(parseNote(FILE, "no front matter at all").errors, "front matter"));
});

// ---- loader: every note in content/notes, any problem fails the build ----
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const { loadNotes } = await import("../../src/lib/notes/load.ts");

const withDir = (files, fn) => {
  const dir = mkdtempSync(join(tmpdir(), "notes-"));
  try {
    for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

test("no notes folder yet = no notes (the page can still build)", () => {
  assert.deepEqual(loadNotes(join(tmpdir(), "does-not-exist-notes")), []);
});

test("notes come newest first; other files are ignored", () => {
  const older = raw({ ...FRONT, date: "2026-10-26" });
  const notes = withDir(
    { [FILE]: raw(), "2026-10-26-older-one.md": older, "README.txt": "not a note" },
    (dir) => loadNotes(dir),
  );
  assert.deepEqual(notes.map((n) => n.slug), ["shipped-or-hype", "older-one"]);
});

test("one bad note fails the whole build, naming the file and every problem", () => {
  const bad = raw({ ...FRONT, date: "2026-10-26", hero: { value: "9x", label: "faster" } }, `${BODY}\n\n[x](javascript:1)`);
  assert.throws(
    () => withDir({ [FILE]: raw(), "2026-10-26-bad.md": bad }, (dir) => loadNotes(dir)),
    (err) => /2026-10-26-bad\.md/.test(err.message) && /hero\.source/.test(err.message) && /link/.test(err.message),
  );
});

test("two notes can't share a slug", () => {
  assert.throws(
    () => withDir({ [FILE]: raw(), "2026-10-26-shipped-or-hype.md": raw({ ...FRONT, date: "2026-10-26" }) }, (d) => loadNotes(d)),
    /slug/,
  );
});
