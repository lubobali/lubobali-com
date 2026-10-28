// Share a live note (Phase 9 P9.9, option A): one PENDING LinkedIn draft in
// the publisher (text + the note's card), and the X thread printed to paste.
// Nothing posts by itself: Lubo approves the draft in the publisher dashboard.
//
//   node scripts/notes-share.mjs <slug> --dry                    # print only
//   PUBLISHER_API=<base url> node scripts/notes-share.mjs <slug>  # make the draft
//
// Safe to re-run: a note that already has a draft is skipped. Refuses a note
// that isn't live on lubobali.com yet (the link would 404).
import "./lib/ts-paths.mjs";
import { readFile } from "node:fs/promises";

const { loadNotes } = await import("../src/lib/notes/load.ts");
const { shareTexts } = await import("../src/lib/notes/share.ts");

const CATEGORY = "lubobali-notes";
const [slug, ...flags] = process.argv.slice(2);
const dry = flags.includes("--dry");
if (!slug) throw new Error("usage: notes-share.mjs <slug> [--dry]");

const note = loadNotes().find((n) => n.slug === slug);
if (!note) throw new Error(`no note "${slug}" in content/notes`);
const s = shareTexts(note);
const card = `public/notes/${slug}/card.jpg`;

console.log(`--- LinkedIn draft (pending) ---\n${s.linkedin.text}\n\n#${s.linkedin.hashtags.join(" #")}\n+ image ${card}`);
console.log(`\n--- X thread (paste by hand) ---\n${s.x.map((t, i) => `[${i + 1}/${s.x.length}] ${t}`).join("\n\n")}`);
if (dry) process.exit(0);

const live = await fetch(s.url, { method: "HEAD", redirect: "manual" });
if (live.status !== 200) throw new Error(`${s.url} is not live (HTTP ${live.status}): publish the note first`);

const api = process.env.PUBLISHER_API;
if (!api) throw new Error("PUBLISHER_API is not set");
const call = async (path, init) => {
  const res = await fetch(`${api}${path}`, init);
  if (!res.ok) throw new Error(`publisher ${init?.method ?? "GET"} ${path}: HTTP ${res.status}`);
  return res.json();
};

const existing = (await call(`/api/posts?category=${CATEGORY}`)).find((p) => p.source_url === s.url);
if (existing) {
  console.log(`\nAlready drafted: post #${existing.id} (${existing.status}). Nothing to do.`);
  process.exit(0);
}
const post = await call("/api/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ topic_category: CATEGORY, topic_title: note.title, post_text: s.linkedin.text, source_url: s.url, hashtags: s.linkedin.hashtags }),
});
const form = new FormData();
form.append("file", new Blob([await readFile(card)], { type: "image/jpeg" }), "card.jpg");
await call(`/api/posts/${post.id}/images`, { method: "POST", body: form });
console.log(`\nDraft #${post.id} is waiting in the publisher dashboard (pending). Approve it there.`);
