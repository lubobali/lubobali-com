// /building wiring (Phase 7, P7.8): the page is reachable from Explore
// ("Get to know me", Lubo 2026-10-24), the footer, the home hero and
// llms.txt, and every link shows the same live line.
import "../lib/ts-paths.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";

const { exploreItems, searchExplore } = await import("../../src/lib/explore.ts");

const start = exploreItems.filter((i) => i.group === "start");
const card = exploreItems.find((i) => i.href === "/building");

test("Explore: 'Building now' is 2nd in Get to know me, after the CEO questions", () => {
  assert.ok(card, "no /building card");
  assert.equal(card.title, "Building now");
  assert.equal(card.group, "start");
  assert.deepEqual(
    start.map((i) => i.title),
    // Phase 9: Notes right after Building now (both say what Lubo is doing now).
    ["Questions CEOs ask me", "Building now", "Notes", "About me", "Resume"],
  );
});

test("Explore: the card is live (dot + daily line) and has its own colour", () => {
  assert.equal(card.live, true);
  const others = exploreItems.filter((i) => i.tone && i !== card).map((i) => i.tone);
  assert.ok(card.tone && !others.includes(card.tone), `tone ${card.tone} is already used`);
});

for (const q of ["building", "active", "what are you working on", "tests", "TDD", "CI", "uptime", "current projects"]) {
  test(`Explore search "${q}" finds Building now`, () => {
    assert.ok(searchExplore(q).some((h) => h.item.href === "/building"), q);
  });
}

test("llms.txt points AI assistants to /building", async () => {
  const { GET } = await import("../../src/app/llms.txt/route.ts");
  const text = await GET().text();
  assert.match(text, /## Building now/);
  assert.match(text, /https:\/\/lubobali\.com\/building/);
});

// Lubo 2026-10-24: every page in Explore its own colour, so it's easy to spot.
test("Explore: no two page cards share a colour", () => {
  const tones = exploreItems.filter((i) => i.tone).map((i) => i.tone);
  assert.deepEqual(tones.filter((t, i) => tones.indexOf(t) !== i), []);
});
