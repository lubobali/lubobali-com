// Share cards (P5.7): every project has its own 1200x630 card, and the card
// is never stale. The manifest stores a hash of what each card shows; if a
// project's name, hook or number changes, this test fails until the cards
// are re-rendered (scripts/brand/share-images.mjs).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { cardHash, loadProjects, shareCard } from "../lib/share.mjs";

const repo = new URL("../../", import.meta.url).pathname;

test("every project has a share card that matches what it shows today", async () => {
  const manifest = existsSync(`${repo}public/share/manifest.json`) ? JSON.parse(readFileSync(`${repo}public/share/manifest.json`, "utf8")) : {};
  const problems = [];
  for (const p of await loadProjects(repo)) {
    const card = shareCard(p);
    if (!existsSync(`${repo}public/share/${p.slug}.jpg`)) problems.push(`${p.slug}: no card (run scripts/brand/share-images.mjs)`);
    else if (manifest[p.slug] !== cardHash(card)) problems.push(`${p.slug}: card is stale (run scripts/brand/share-images.mjs)`);
  }
  assert.deepEqual(problems, []);
});

test("shareCard uses the picture's hook, falling back to the one-line summary", () => {
  const base = { slug: "x", chapter: "ai", name: "X", oneLine: "one line", number: { value: "1", label: "l" } };
  assert.equal(shareCard({ ...base, picture: { kind: "gates", title: "The hook" } }).hook, "The hook");
  assert.equal(shareCard({ ...base, picture: { kind: "flow", steps: [] } }).hook, "one line");
  assert.notEqual(cardHash(shareCard({ ...base, picture: { kind: "flow" } })), cardHash(shareCard({ ...base, name: "Y", picture: { kind: "flow" } })));
});

test("the big number is left out when the hook already says it (no repeats)", () => {
  const base = { slug: "x", chapter: "ai", name: "X", oneLine: "o", number: { value: "12,000×", label: "cheaper" } };
  assert.equal(shareCard({ ...base, picture: { kind: "drops", title: "The same agents, 12,000× cheaper" } }).value, "");
  assert.equal(shareCard({ ...base, picture: { kind: "drops", title: "Cheaper agents" } }).value, "12,000×");
});
