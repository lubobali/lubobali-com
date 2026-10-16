// Renders the brand images with headless Chrome and our own fonts:
//   public/og.png           social share image, 1200x630
//   src/app/icon.png        512x512 (rounded), browsers + Google results
//   src/app/apple-icon.png  180x180 (square; iOS rounds it)
//   src/app/favicon.ico     16/32/48 PNGs in one .ico
// Output is committed; re-run only when the design changes. Playwright is
// not a project dependency — run in the Playwright image, from the repo root:
//   docker run --rm -v "$PWD":/w -w /tmp mcr.microsoft.com/playwright:v1.64.0-noble \
//     bash -c 'npm i --silent playwright@1.64.0 && cp /w/scripts/brand/render.mjs . && node render.mjs /w'
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";

const repo = process.argv[2] ?? process.cwd();
const page = (file) => `file://${join(repo, "scripts/brand", file)}`;
const browser = await chromium.launch();

async function shot(file, size, out, vars = "") {
  const p = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
  await p.goto(page(file));
  if (vars) await p.addStyleTag({ content: `:root{${vars}}` });
  await p.evaluate(() => document.fonts.ready);
  const buf = await p.screenshot({ omitBackground: true, type: "png" });
  await p.close();
  if (out) await writeFile(join(repo, out), buf);
  return buf;
}

const icon = (px, radius, out) =>
  shot("icon.html", { width: px, height: px }, out, `--size:${px}px;--radius:${radius}`);

await shot("og.html", { width: 1200, height: 630 }, "public/og.png");
await icon(512, "22%", "src/app/icon.png");
await icon(180, "0", "src/app/apple-icon.png");

// .ico = 6-byte header + 16-byte entry per image + PNG data (PNG-in-ICO,
// supported by every current browser).
const sizes = [16, 32, 48];
const pngs = [];
for (const s of sizes) pngs.push(await icon(s, "22%"));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + 16 * i;
  header.writeUInt8(s, e); // width
  header.writeUInt8(s, e + 1); // height
  header.writeUInt16LE(1, e + 4); // colour planes
  header.writeUInt16LE(32, e + 6); // bits per pixel
  header.writeUInt32LE(pngs[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
await writeFile(join(repo, "src/app/favicon.ico"), Buffer.concat([header, ...pngs]));

await browser.close();
console.log("brand: og.png, icon.png, apple-icon.png, favicon.ico");
