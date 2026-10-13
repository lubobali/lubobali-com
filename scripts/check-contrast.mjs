// Fails (exit 1) if any colour pair in src/app/globals.css is below its
// contrast minimum, or any token is outside the sRGB gamut.
// WCAG 2.2: text 4.5:1, UI parts 3:1. We ask 7:1 (AAA) for main text,
// because thin text on dark backgrounds needs more than the minimum.
// Usage: node scripts/check-contrast.mjs
import { readFileSync } from "node:fs";
import { contrastRatio, parseColor, readTokens } from "./lib/contrast.mjs";

const MAIN = 7; // main text
const TEXT = 4.5; // all other text
const UI = 3; // focus ring, input borders

// [foreground token, background token, minimum]
const PAIRS = [
  ["foreground", "background", MAIN],
  ["foreground", "card", MAIN],
  ["card-foreground", "card", MAIN],
  ["popover-foreground", "popover", MAIN],
  ["secondary-foreground", "secondary", TEXT],
  ["accent-foreground", "accent", TEXT],
  ["muted-foreground", "background", TEXT],
  ["muted-foreground", "card", TEXT],
  ["muted-foreground", "muted", TEXT],
  ["primary", "background", TEXT], // accent-coloured text / links
  ["primary", "card", TEXT],
  ["primary-foreground", "primary", TEXT], // text on the accent button
  ["destructive", "background", TEXT],
  ["ring", "background", UI],
  ["ring", "card", UI],
  ["input", "background", UI],
];

const cssPath = new URL("../src/app/globals.css", import.meta.url);
const tokens = readTokens(readFileSync(cssPath, "utf8"));
const colours = {};
let failed = 0;

for (const [name, value] of Object.entries(tokens)) {
  colours[name] = parseColor(value);
  if (!colours[name].inGamut) {
    console.log(`FAIL  --${name} ${value} is outside sRGB`);
    failed++;
  }
}

for (const [fg, bg, min] of PAIRS) {
  if (!colours[fg] || !colours[bg]) {
    console.log(`FAIL  missing token --${colours[fg] ? bg : fg}`);
    failed++;
    continue;
  }
  const ratio = contrastRatio(colours[fg].rgb, colours[bg].rgb);
  const ok = ratio >= min;
  if (!ok) failed++;
  console.log(
    `${ok ? "ok  " : "FAIL"}  ${ratio.toFixed(2).padStart(5)}:1 (min ${min})  ${fg} on ${bg}`,
  );
}

console.log(
  failed ? `contrast: ${failed} problem(s)` : "contrast: all pairs pass",
);
process.exit(failed ? 1 : 0);
