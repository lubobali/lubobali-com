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
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const { loadNotes } = await import("../../src/lib/notes/load.ts");
// Tests never see the real public/ folder (the real note has real audio there).
const load = (dir) => loadNotes(dir, join(dir, "no-public"));

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
    (dir) => load(dir),
  );
  assert.deepEqual(notes.map((n) => n.slug), ["shipped-or-hype", "older-one"]);
});

test("one bad note fails the whole build, naming the file and every problem", () => {
  const bad = raw({ ...FRONT, date: "2026-10-26", hero: { value: "9x", label: "faster" } }, `${BODY}\n\n[x](javascript:1)`);
  assert.throws(
    () => withDir({ [FILE]: raw(), "2026-10-26-bad.md": bad }, (dir) => load(dir)),
    (err) => /2026-10-26-bad\.md/.test(err.message) && /hero\.source/.test(err.message) && /link/.test(err.message),
  );
});

test("two notes can't share a slug", () => {
  assert.throws(
    () => withDir({ [FILE]: raw(), "2026-10-26-shipped-or-hype.md": raw({ ...FRONT, date: "2026-10-26" }) }, (d) => load(d)),
    /slug/,
  );
});

// ---- visual blocks (P9.5 v2): ```stats / flow / cards / claims / timeline / bars / callout ----
const fence = (type, yaml) => `\n\n\`\`\`${type}\n${yaml}\n\`\`\`\n`;
const htmlOf = (body) => parseNote(FILE, raw(FRONT, `${BODY}${body}`));

test("a stats block renders tiles, values escaped", () => {
  const { note, errors } = htmlOf(fence("stats", '- { value: "12", label: "feeds" }\n- { value: "<b>83</b>", label: "tests" }'));
  assert.deepEqual(errors, []);
  assert.match(note.html, /class="nb-stats"/);
  assert.ok(note.html.includes("&lt;b&gt;83&lt;/b&gt;") && !note.html.includes("<b>83</b>"));
});

test("flow, cards, timeline and callout render", () => {
  const body =
    fence("flow", '- { label: "12 feeds", detail: "RSS + APIs" }\n- { label: "Email", detail: "Sunday" }') +
    fence("cards", '- { title: "Links", text: "Python adds them." }\n- { title: "Quotes", text: "Must be in the transcript." }') +
    fence("timeline", '- { time: "20:50", title: "Bug", text: "Fixed." }') +
    fence("callout", '{ title: "The rule", text: "The model never writes a link." }');
  const { note, errors } = htmlOf(body);
  assert.deepEqual(errors, []);
  for (const cls of ["nb-flow", "nb-cards", "nb-timeline", "nb-callout"]) assert.match(note.html, new RegExp(`class="${cls}`));
});

test("bars are drawn to scale from the numbers given", () => {
  const yaml = 'title: "Cost per call"\nunit: "$"\nrows:\n  - { label: "a", value: 0.1 }\n  - { label: "b", value: 0.05 }';
  const { note, errors } = htmlOf(fence("bars", yaml));
  assert.deepEqual(errors, []);
  assert.match(note.html, /--w:100%/);
  assert.match(note.html, /--w:50%/);
  assert.ok(has(htmlOf(fence("bars", 'title: "x"\nrows:\n  - { label: "a", value: "lots" }')).errors, "bars"));
});

test("claims use only the four real labels", () => {
  const ok = '- { label: "UNVERIFIED", claim: "AGI is here.", quote: "I do think that we have achieved AGI.", verdict: "No source tests it." }';
  const { note, errors } = htmlOf(fence("claims", ok));
  assert.deepEqual(errors, []);
  assert.match(note.html, /nb-pill--unverified/);
  assert.ok(has(htmlOf(fence("claims", ok.replace("UNVERIFIED", "TRUE"))).errors, "claims"));
});

test("a broken block fails the build with its name", () => {
  assert.ok(has(htmlOf(fence("stats", "- [unclosed")).errors, "stats"));
  assert.ok(has(htmlOf(fence("stats", '- { value: "1" }')).errors, "stats"));
  assert.ok(has(htmlOf(fence("cards", "[]")).errors, "cards"));
});

test("block text counts as words and goes through the privacy guard", () => {
  const before = parseNote(FILE, raw()).note.words;
  assert.ok(htmlOf(fence("callout", '{ title: "One two", text: "three four five" }')).note.words === before + 5);
  assert.ok(has(htmlOf(fence("callout", '{ title: "x", text: "ssh to 10.1.2.3" }')).errors, "privacy"));
});

test("a normal code block is still code", () => {
  const { note } = htmlOf(fence("python", "x = 1"));
  assert.match(note.html, /<pre><code class="language-python">x = 1/);
});

// ---- Listen (P9.5/P9.8): the narration is built from the note itself ----
test("narration: title, then the short version, then each section; no code, no URLs", () => {
  const body = `## Why\n\nI read [the docs](https://example.com/x) every week.\n\n\`\`\`python\nsecret = 1\n\`\`\`\n\n${BODY}`;
  const { note } = parseNote(FILE, raw(FRONT, body));
  assert.ok(note.narration.startsWith(`${FRONT.title}.`));
  assert.ok(note.narration.includes("In short: I built a weekly AI news email"));
  assert.ok(note.narration.includes("Why.") && note.narration.includes("I read the docs every week."));
  assert.ok(!note.narration.includes("https://") && !note.narration.includes("secret = 1"));
});

test("narration speaks the blocks and says money the way people do", () => {
  const body = `${BODY}${fence("stats", '- { value: "12", label: "feeds read" }\n- { value: "$0.24", label: "per run" }')}${fence(
    "bars",
    'title: "Cost"\nunit: "$"\nrows:\n  - { label: "Episode 1 → claims", value: 0.096 }',
  )}${fence("claims", '- { label: "UNVERIFIED", claim: "AGI is here.", verdict: "No source tests it." }')}`;
  const { note, errors } = parseNote(FILE, raw(FRONT, body));
  assert.deepEqual(errors, []);
  assert.ok(note.narration.includes("12 feeds read."));
  assert.ok(note.narration.includes("24 cents per run."));
  assert.ok(note.narration.includes("Episode 1 to claims: 9.6 cents."));
  assert.ok(note.narration.includes("Unverified: AGI is here. What the evidence says: No source tests it."));
});

test("the narration hash changes when the words change", () => {
  const a = parseNote(FILE, raw()).note.narrationHash;
  const b = parseNote(FILE, raw(FRONT, `${BODY}\n\nOne more line.`)).note.narrationHash;
  assert.match(a, /^[a-f0-9]{16}$/);
  assert.notEqual(a, b);
});

test("audio must match the words: a stale or missing file fails the build", () => {
  const note = parseNote(FILE, raw()).note;
  const withAudio = (manifest, mp3 = true) =>
    withDir({ [FILE]: raw() }, (dir) => {
      const pub = mkdtempSync(join(tmpdir(), "pub-"));
      try {
        if (mp3) {
          mkdirSync(join(pub, "notes", note.slug), { recursive: true });
          writeFileSync(join(pub, "notes", note.slug, "listen.mp3"), "x");
        }
        writeFileSync(join(dir, "audio.json"), JSON.stringify(manifest));
        return loadNotes(dir, pub);
      } finally {
        rmSync(pub, { recursive: true, force: true });
      }
    });
  const good = { [note.slug]: { hash: note.narrationHash, seconds: 190 } };
  assert.deepEqual(withAudio(good)[0].audio, { src: `/notes/${note.slug}/listen.mp3`, seconds: 190 });
  assert.throws(() => withAudio({ [note.slug]: { hash: "0000000000000000", seconds: 190 } }), /audio is out of date/);
  assert.throws(() => withAudio(good, false), /listen\.mp3 is missing/);
  assert.equal(withDir({ [FILE]: raw() }, (dir) => load(dir))[0].audio, undefined); // no audio = no pill
});

// ---- RSS (P9.6): /notes/feed.xml, built from the notes, never from the clock ----
const { buildFeed } = await import("../../src/lib/notes/feed.ts");
const { noteGraph, notesGraph } = await import("../../src/lib/schema.ts");

const noteWith = (over = {}) => ({ ...parseNote(FILE, raw()).note, ...over });

test("feed: one item per note, absolute links, RFC-822 dates, text escaped", () => {
  const n = noteWith({ title: "A & B <tested>", audio: { src: "/notes/shipped-or-hype/listen.mp3", seconds: 236 } });
  const xml = buildFeed([n], { "shipped-or-hype": 1891676 });
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<rss version="2.0"/);
  assert.ok(xml.includes("<title>A &amp; B &lt;tested&gt;</title>"));
  assert.ok(xml.includes("<link>https://lubobali.com/notes/shipped-or-hype</link>"));
  assert.ok(xml.includes('<guid isPermaLink="true">https://lubobali.com/notes/shipped-or-hype</guid>'));
  assert.ok(xml.includes("<pubDate>Mon, 02 Nov 2026 12:00:00 GMT</pubDate>"));
  assert.ok(xml.includes('<enclosure url="https://lubobali.com/notes/shipped-or-hype/listen.mp3" length="1891676" type="audio/mpeg"/>'));
  assert.ok(xml.includes('<atom:link href="https://lubobali.com/notes/feed.xml" rel="self" type="application/rss+xml"/>'));
});

test("feed: the same notes give the same file (no build time inside)", () => {
  const n = noteWith();
  assert.equal(buildFeed([n], {}), buildFeed([n], {}));
  assert.ok(buildFeed([n], {}).includes("<lastBuildDate>Mon, 02 Nov 2026 12:00:00 GMT</lastBuildDate>"));
  assert.ok(!buildFeed([n], {}).includes("<enclosure")); // no audio, no enclosure
});

test("JSON-LD: a note is a BlogPosting by Lubo, with breadcrumbs, sources and its audio", () => {
  const n = noteWith({ audio: { src: "/notes/shipped-or-hype/listen.mp3", seconds: 236 } });
  const graph = noteGraph(n)["@graph"];
  const post = graph.find((g) => g["@type"] === "BlogPosting");
  assert.equal(post.headline, n.title);
  assert.equal(post.datePublished, "2026-11-02");
  assert.equal(post.mainEntityOfPage, "https://lubobali.com/notes/shipped-or-hype");
  assert.deepEqual(post.author, { "@id": "https://lubobali.com/#person" });
  assert.deepEqual(post.citation, n.sources.map((s) => s.url));
  assert.equal(post.audio.duration, "PT3M56S");
  assert.equal(post.audio.contentUrl, "https://lubobali.com/notes/shipped-or-hype/listen.mp3");
  assert.ok(graph.some((g) => g["@type"] === "BreadcrumbList"));
});

test("JSON-LD: /notes is a Blog listing every note", () => {
  const n = noteWith();
  const blog = notesGraph([n])["@graph"].find((g) => g["@type"] === "Blog");
  assert.equal(blog.blogPost.length, 1);
  assert.equal(blog.blogPost[0].url, "https://lubobali.com/notes/shipped-or-hype");
});

// ---- Cover cards (P9.7, Lubo picked C: spec sheet + the note's own fingerprint) ----
const { fingerprint, CLUSTER_HUE } = await import("../../src/lib/notes/fingerprint.ts");
const { noteCard, noteCardHash } = await import("../../src/lib/notes/card.ts");

const fpOpts = { id: "t", cx: 300, cy: 210, scale: 1, hue: "#38bdf8", dots: 3 };

test("fingerprint: same note = same drawing, another note = another drawing", () => {
  const a = fingerprint("shipped-or-hype|2026-10-27", fpOpts);
  assert.equal(a, fingerprint("shipped-or-hype|2026-10-27", fpOpts));
  assert.notEqual(a, fingerprint("another-note|2026-11-03", fpOpts));
  assert.ok(!/NaN|undefined|Infinity/.test(a));
});

test("fingerprint: ids are prefixed (two on one page never clash), dots = the number's digits", () => {
  const a = fingerprint("x|2026-10-27", { ...fpOpts, id: "cover" });
  assert.ok(a.includes('id="cover-grad"') && a.includes('url(#cover-grad)'));
  assert.equal((a.match(/<circle /g) ?? []).length, 3 * 2); // dot + halo per digit
});

test("fingerprint: small enough to draw inline on the page", () => {
  assert.ok(fingerprint("shipped-or-hype|2026-10-27", fpOpts).length < 20_000);
});

test("every topic has its own fingerprint colour", () => {
  assert.deepEqual(Object.keys(CLUSTER_HUE).sort(), [...CLUSTERS].sort());
  assert.equal(new Set(Object.values(CLUSTER_HUE)).size, CLUSTERS.length);
});

test("card data: what the share card shows, from the note; the hash changes when it does", () => {
  const n = noteWith({ audio: { src: "/notes/shipped-or-hype/listen.mp3", seconds: 236 } });
  const card = noteCard(n, 1);
  assert.equal(card.number, "Note 01");
  assert.equal(card.week, "Week 45");
  assert.equal(card.listen, "▶ Listen 3:56");
  assert.equal(card.value, FRONT.hero.value);
  assert.equal(card.dots, 3);
  assert.notEqual(noteCardHash(card), noteCardHash(noteCard({ ...n, title: "Another title here" }, 1)));
  assert.equal(noteCard({ ...n, audio: undefined }, 1).listen, "");
});

test("every real note has a share card that matches what it shows today", () => {
  const notes = loadNotes();
  const manifest = existsSync("content/notes/cards.json") ? JSON.parse(readFileSync("content/notes/cards.json", "utf8")) : {};
  const problems = [];
  notes.forEach((n, i) => {
    const card = noteCard(n, notes.length - i);
    if (!existsSync(`public/notes/${n.slug}/card.jpg`)) problems.push(`${n.slug}: no card (run scripts/brand/note-cards.sh)`);
    else if (manifest[n.slug] !== noteCardHash(card)) problems.push(`${n.slug}: card is stale (run scripts/brand/note-cards.sh)`);
  });
  assert.deepEqual(problems, []);
});

// ---- Pronunciation (P9.8): words the voice says wrong get a spoken spelling ----
const { sayTerms } = await import("../../src/lib/notes/terms.ts");

test("terms: whole words only, any case kept out of the page text", () => {
  const terms = { URLs: "U R Ls", "S-1": "S one" };
  assert.equal(sayTerms("Python deletes URLs and the S-1 filing.", terms), "Python deletes U R Ls and the S one filing.");
  assert.equal(sayTerms("CURLs stay", terms), "CURLs stay");
});

test("terms only change the narration, never the page", () => {
  const n = parseNote(FILE, raw(FRONT, `${BODY}\n\nIt strips URLs.`)).note;
  assert.ok(n.html.includes("URLs"));
});

// ---- Sharing (P9.9, option A): a pending LinkedIn draft + an X thread to paste ----
const { shareTexts, tweetLength } = await import("../../src/lib/notes/share.ts");

test("share: LinkedIn text has the hook, the number, the link and the code; under the limit", () => {
  const n = noteWith({ audio: { src: "/notes/shipped-or-hype/listen.mp3", seconds: 256 } });
  const s = shareTexts(n);
  assert.ok(s.linkedin.text.startsWith(n.title));
  assert.ok(s.linkedin.text.includes(`${n.hero.value} ${n.hero.label}`));
  assert.ok(s.linkedin.text.includes("https://lubobali.com/notes/shipped-or-hype"));
  assert.ok(s.linkedin.text.includes(n.repo));
  assert.ok(s.linkedin.text.includes("listen"));
  assert.ok(s.linkedin.text.length <= 3000);
  assert.ok(s.linkedin.hashtags.length >= 2 && s.linkedin.hashtags.every((h) => /^[A-Za-z0-9]+$/.test(h)));
});

test("share: no audio, no listen line", () => {
  assert.ok(!shareTexts(noteWith({ audio: undefined })).linkedin.text.includes("listen"));
});

test("share: every tweet fits X (a link counts 23), the last one has the link", () => {
  const long = noteWith({ tldr: "x ".repeat(190).trim() });
  for (const n of [noteWith(), long]) {
    const t = shareTexts(n).x;
    assert.ok(t.length >= 2 && t.length <= 4);
    assert.ok(t.every((tw) => tweetLength(tw) <= 280), t.map(tweetLength).join(","));
    assert.ok(t.at(-1).includes("https://lubobali.com/notes/shipped-or-hype"));
  }
  assert.equal(tweetLength("see https://example.com/a/very/long/path/that/is/long ok"), "see ".length + 23 + " ok".length);
});
