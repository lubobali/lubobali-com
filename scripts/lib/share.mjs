// What each project's share card shows, and a hash of it (P5.7). Used by
// scripts/brand/share-images.mjs (renders the cards) and by
// scripts/tests/share.test.mjs (fails when a card is missing or stale).
// Project files only import types, so Node loads them directly.
import { createHash } from "node:crypto";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const NOT_PROJECTS = new Set(["index.ts", "model.ts", "shelf.ts"]);

/** Every project object in src/lib/projects (one per file). */
export async function loadProjects(repo) {
  const dir = join(repo, "src/lib/projects");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".ts") && !NOT_PROJECTS.has(f)).sort();
  const out = [];
  for (const f of files) {
    const mod = await import(pathToFileURL(join(dir, f)).href);
    out.push(...Object.values(mod).filter((v) => v && typeof v === "object" && "slug" in v));
  }
  return out;
}

const CHAPTER_LABEL = { ai: "AI agents", pipelines: "Data pipelines", analytics: "Analytics & dashboards" };

/** The words and numbers on one share card. */
// The big number is left out when the hook already says it (no repeats:
// "The same agents, 12,000× cheaper" needs no second "12,000×").
export function shareCard(p) {
  const hook = "title" in p.picture && p.picture.title ? p.picture.title : p.oneLine;
  const repeated = hook.includes(p.number.value);
  return {
    slug: p.slug,
    chapter: p.chapter,
    kicker: CHAPTER_LABEL[p.chapter],
    name: p.name,
    hook,
    value: repeated ? "" : p.number.value,
    label: repeated ? "" : p.number.label,
  };
}

/** The /resume card (resumeShare in src/lib/resume.ts): no big number,
 * a short line under the hook instead. */
export function resumeCard(share) {
  return { slug: "resume", chapter: "resume", kicker: share.kicker, name: share.name, hook: share.hook, value: "", label: "", sub: share.sub };
}

/** Changes whenever anything on the card changes (then re-render). */
export const cardHash = (card) => createHash("sha256").update(JSON.stringify(card)).digest("hex").slice(0, 16);

/** The /building card (building.share in src/lib/building/copy.ts), like
 * the /resume one: words only, so it never shows a stale number. */
export function buildingCard(share) {
  return { slug: "building", chapter: "building", kicker: share.kicker, name: share.name, hook: share.hook, value: "", label: "", sub: share.sub };
}
