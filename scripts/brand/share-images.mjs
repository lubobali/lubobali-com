// Renders one share card per project (P5.7): public/share/<slug>.jpg,
// plus public/share/resume.jpg for /resume (P6.9)
// (1200x630, what LinkedIn and X show for a shared project link) and
// public/share/manifest.json (a hash of what each card shows, checked by
// scripts/tests/share.test.mjs so a card can never go stale). Output is
// committed; re-run when a project's name, hook or number changes.
// Playwright is not a project dependency, so run it in the Playwright image,
// from the repo root (Node 24 there loads the project .ts files directly):
//   docker run --rm --init -v "$PWD":/w -w /tmp mcr.microsoft.com/playwright:v1.64.0-noble \
//     bash -c 'npm i --silent playwright@1.64.0 && cp /w/scripts/brand/share-images.mjs /w/scripts/lib/share.mjs . \
//       && sed -i "s#../lib/share.mjs#./share.mjs#" share-images.mjs && node share-images.mjs /w'
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";
import { cardHash, loadProjects, resumeCard, shareCard } from "../lib/share.mjs";

const repo = process.argv[2] ?? process.cwd();
const outDir = join(repo, "public/share");

// /resume: the fit box's ring, 80% full, with its check mark.
const RING = 2 * Math.PI * 120;
const RESUME_MOTIF =
  `<circle cx="230" cy="190" r="120" stroke="currentColor" stroke-width="10" opacity="0.25"/>` +
  `<circle cx="230" cy="190" r="120" stroke="currentColor" stroke-width="10" stroke-linecap="round" stroke-dasharray="${RING * 0.8} ${RING}" transform="rotate(-90 230 190)" opacity="0.8"/>` +
  `<circle cx="230" cy="190" r="170" stroke="currentColor" opacity="0.18"/>` +
  `<path d="M180 192 l34 34 l68 -72" stroke="currentColor" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>`;

// The faint motif of each world, the same shapes as brand-card.tsx.
const trail = Array.from({ length: 16 }, (_, i) => ({ x: 40 + i * 16, y: 390 - i * 11, r: 1.5 + i * 0.45 }));
const MOTIF = {
  ai:
    trail.map((d) => `<circle cx="${d.x}" cy="${d.y}" r="${d.r}" fill="currentColor" opacity="${0.15 + d.r / 20}"/>`).join("") +
    '<circle cx="318" cy="200" r="24" fill="currentColor" opacity="0.5"/><circle cx="318" cy="200" r="38" stroke="currentColor" opacity="0.35"/>',
  pipelines:
    [60, 100, 140, 180]
      .map((rx, i) => `<ellipse cx="300" cy="120" rx="${rx}" ry="${rx * 0.38}" stroke="currentColor" opacity="${0.42 - i * 0.07}" transform="rotate(-22 300 120)"/>`)
      .join("") + '<circle cx="300" cy="120" r="9" fill="currentColor" opacity="0.6"/>',
  analytics:
    [50, 95, 140, 185].map((r, i) => `<circle cx="330" cy="110" r="${r}" stroke="currentColor" opacity="${0.42 - i * 0.07}"/>`).join("") +
    '<circle cx="330" cy="110" r="5" fill="currentColor" opacity="0.7"/>',
};

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(`file://${join(repo, "scripts/brand/share.html")}`);
await page.evaluate(() => document.fonts.ready);

const { resumeShare } = await import(pathToFileURL(join(repo, "src/lib/resume.ts")).href);
const cards = [...(await loadProjects(repo)).map((p) => [shareCard(p), MOTIF[p.chapter]]), [resumeCard(resumeShare), RESUME_MOTIF]];

const manifest = {};
for (const [card, motif] of cards) {
  await page.evaluate(
    ({ card, motif }) => {
      document.body.dataset.world = card.chapter;
      for (const key of ["kicker", "hook", "value", "label", "name", "sub"]) {
        document.querySelector(`[data-slot="${key}"]`).textContent = card[key] ?? "";
      }
      document.querySelector('[data-slot="motif"]').innerHTML = motif;
    },
    { card, motif },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(outDir, `${card.slug}.jpg`), type: "jpeg", quality: 86 });
  manifest[card.slug] = cardHash(card);
  console.log(`share: ${card.slug}`);
}
await writeFile(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
await browser.close();
console.log(`share: ${Object.keys(manifest).length} cards`);
