// Fail the build if a private name is anywhere a visitor or a crawler can
// read it (Phase 9 P9.6): every text file in the build (pages, feed,
// llms.txt, search index, sitemap) and the note sources.
//   NOTES_PRIVATE_TERMS="name one,name two" node scripts/check-private.mjs out content --require
// The list is a Forgejo CI secret (Lubo sets it; never in the repo, never
// printed). --require: no list = fail, so the guard can't be silently off.
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { findPrivate, parseTerms } from "./lib/private.mjs";

const TEXT = new Set([".html", ".txt", ".xml", ".json", ".md", ".js", ".css", ".webmanifest"]);
const args = process.argv.slice(2);
const require = args.includes("--require");
const dirs = args.filter((a) => !a.startsWith("--"));

const raw = process.env.NOTES_PRIVATE_TERMS ?? "";
if (!raw.trim()) {
  if (require) {
    console.log("FAIL  private-name guard: NOTES_PRIVATE_TERMS is not set (Forgejo repo secret)");
    process.exit(1);
  }
  console.log("private: skipped (no NOTES_PRIVATE_TERMS here)");
  process.exit(0);
}
const terms = parseTerms(raw);

const problems = [];
let scanned = 0;
for (const dir of dirs) {
  for (const f of await readdir(dir, { recursive: true }).catch(() => [])) {
    if (!TEXT.has(extname(f))) continue;
    const text = await readFile(join(dir, f), "utf8").catch(() => null);
    if (text === null) continue;
    scanned++;
    for (const n of findPrivate(text, terms)) problems.push(`${join(dir, f)}: private term #${n}`);
  }
}
if (problems.length) {
  problems.forEach((p) => console.log(`FAIL  ${p}`));
  console.log(`private: ${problems.length} problem(s)`);
  process.exit(1);
}
console.log(`private: ok (${terms.length} terms, ${scanned} files)`);
