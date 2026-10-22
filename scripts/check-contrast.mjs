// Fails (exit 1) if any colour pair in src/app/globals.css is below its
// contrast minimum, or any token is outside the sRGB gamut.
// WCAG 2.2: text 4.5:1, UI parts 3:1. We ask 7:1 (AAA) for main text,
// because thin text on dark backgrounds needs more than the minimum.
// Usage: node scripts/check-contrast.mjs
import { readFileSync } from "node:fs";
import {
  composite,
  contrastRatio,
  parseColor,
  readTokens,
} from "./lib/contrast.mjs";

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
  ["link", "background", TEXT], // blue text and links
  ["link", "card", TEXT],
  ["link", "muted", TEXT],
  ["primary-foreground", "primary", TEXT], // text on the blue button
  ["destructive", "background", TEXT],
  ["ring", "background", UI],
  ["ring", "card", UI],
  ["input", "background", UI],
  ["success", "background", UI], // "available" status dot
  ["award", "card", TEXT], // service cards: "Proof" label + emblem
  // Chapter colours (P5.6): chip text + big numbers on the page, the shelf
  // cards (journey-1 = their lightest face) and Explore.
  ...["chapter-ai", "chapter-pipelines", "chapter-analytics"].flatMap((t) => [
    [t, "background", TEXT],
    [t, "card", TEXT],
    [t, "journey-1", TEXT],
  ]),
  ["tone-violet", "card", UI], // work cards: check marks + pictures
  ["sky", "card", TEXT], // /projects Filters panel: "Industry" title + jump link
  ["tone-violet", "card", TEXT], // /projects Filters panel: "Tech" title + jump link
  // /about Security pill: red text on the vault card (journey-3 -> -5).
  ...["journey-3", "journey-4", "journey-5"].map((bg) => ["alert", bg, TEXT]),
  ["tone-ice", "card", UI],
  ["foreground", "card-blue", MAIN], // blue card faces (services + work)
  ["muted-foreground", "card-blue", TEXT],
  ["link", "card-blue", TEXT],
  ["award", "card-blue", TEXT],
  ["tone-violet", "card-blue", UI],
  ["tone-ice", "card-blue", UI],
  ["success", "card-blue", UI], // "Now" status dot (H9)
  ["foreground", "card-sky-top", MAIN], // How it works cards, light top
  ["foreground", "journey-1", MAIN], // step journey, lightest colour
  ["card-text-soft", "journey-1", TEXT],
  ["award", "journey-1", TEXT],
  ["card-text-soft", "card-sky-top", TEXT],
  ["award", "card-sky-top", TEXT],
  ["success", "card-sky-top", UI],
  ["soon", "card-sky-top", UI], // "Next project" amber dot (H9)
  ["soon", "card-blue", UI],
  ["soon", "background", UI], // amber dots in the hero + footer (H11)
  ["soon", "card", UI],
  ["sky", "card-blue", TEXT], // final CTA heading line 2 (H11)
  ["foreground", "card-finale-top", MAIN], // final CTA, lit top centre
  ["muted-foreground", "card-finale-top", TEXT],
  // No link up there: the email link sits in the bottom row, where the
  // lit top has faded out to card-blue (checked above).
  ["award", "card-finale-top", TEXT],
  ["sky", "card-finale-top", TEXT],
  ["soon", "card-finale-top", UI],
];

// See-through glow tokens (`--glow-*`, ambient backgrounds): text on top
// must still pass when the glow is laid over the page background.
// GLOW_STACKS lists glows that can overlap (worst case: all at full strength).
const GLOW_TEXT = [
  ["foreground", MAIN],
  ["muted-foreground", TEXT],
  ["link", TEXT],
];
const GLOW_STACKS = [
  ["glow-brand", "glow-soft"],
  ["glow-brand", "glow-rain"], // home hero: headline glow + rain behind text
];

const cssPath = new URL("../src/app/globals.css", import.meta.url);
const tokens = readTokens(readFileSync(cssPath, "utf8"));
const colours = {};
let failed = 0;

const report = (ok, ratio, min, label) => {
  if (!ok) failed++;
  console.log(
    `${ok ? "ok  " : "FAIL"}  ${ratio.toFixed(2).padStart(5)}:1 (min ${min})  ${label}`,
  );
};

for (const [name, value] of Object.entries(tokens)) {
  colours[name] = parseColor(value);
  if (!colours[name].inGamut) {
    console.log(`FAIL  --${name} ${value} is outside sRGB`);
    failed++;
  }
  if (colours[name].alpha < 1 && !name.startsWith("glow-")) {
    console.log(`FAIL  --${name} is see-through; only --glow-* may be`);
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
  report(ratio >= min, ratio, min, `${fg} on ${bg}`);
}

const glows = Object.keys(colours).filter((n) => n.startsWith("glow-"));
const layers = [...glows.map((g) => [g]), ...GLOW_STACKS];
for (const stack of layers) {
  const missing = stack.find((g) => !colours[g]);
  if (missing) {
    console.log(`FAIL  missing token --${missing}`);
    failed++;
    continue;
  }
  const lit = stack.reduce(
    (under, g) => composite(colours[g], under),
    colours.background.rgb,
  );
  for (const [fg, min] of GLOW_TEXT) {
    const ratio = contrastRatio(colours[fg].rgb, lit);
    report(ratio >= min, ratio, min, `${fg} on background + ${stack.join(" + ")}`);
  }
}

console.log(
  failed ? `contrast: ${failed} problem(s)` : "contrast: all pairs pass",
);
process.exit(failed ? 1 : 0);
