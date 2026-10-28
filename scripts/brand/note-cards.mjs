// Renders each note's share card (Phase 9 P9.7, concept C):
// public/notes/<slug>/card.jpg (1200x630) + content/notes/cards.json (a
// hash of what each card shows; a test fails when one goes stale).
// Run scripts/brand/note-cards.sh (Playwright image, repo mounted at /w).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const repo = process.argv[2] ?? "/w";
const mod = (p) => import(pathToFileURL(join(repo, p)).href);
const { loadNotes } = await mod("src/lib/notes/load.ts");
const { noteCard, noteCardHash } = await mod("src/lib/notes/card.ts");
const { fingerprint } = await mod("src/lib/notes/fingerprint.ts");
const { site } = await mod("src/lib/site.ts");

const notes = loadNotes(join(repo, "content/notes"), join(repo, "public"));
const manifestFile = join(repo, "content/notes/cards.json");
const manifest = JSON.parse(await readFile(manifestFile, "utf8").catch(() => "{}"));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(`file://${join(repo, "scripts/brand/note-card.html")}`);
await page.evaluate(() => document.fonts.ready);

for (const [i, n] of notes.entries()) {
  const card = noteCard(n, notes.length - i);
  const print = fingerprint(card.seed, { id: "card", cx: 920, cy: 360, scale: 1.15, hue: card.hue, dots: card.dots });
  await page.evaluate(
    ({ card, print, sub }) => {
      document.documentElement.style.setProperty("--hue", card.hue);
      document.getElementById("print").innerHTML = print;
      const slot = (k, v) => (document.querySelector(`[data-slot="${k}"]`).textContent = v);
      for (const k of ["number", "week", "cluster", "date", "listen", "title", "value"]) slot(k, card[k]);
      slot("sub", sub);
      document.querySelector(".title").classList.toggle("long", card.title.length > 60);
    },
    { card, print, sub: `${card.label} · ${site.name} · lubobali.com/notes` },
  );
  await page.evaluate(() => document.fonts.ready);
  await mkdir(join(repo, "public/notes", n.slug), { recursive: true });
  await page.screenshot({ path: join(repo, "public/notes", n.slug, "card.jpg"), type: "jpeg", quality: 88 });
  manifest[n.slug] = noteCardHash(card);
  console.log(`card: public/notes/${n.slug}/card.jpg`);
}
await browser.close();
const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
await writeFile(manifestFile, `${JSON.stringify(sorted, null, 2)}\n`);
