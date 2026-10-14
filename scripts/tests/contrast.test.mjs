// Tests for scripts/lib/contrast.mjs (WCAG contrast + OKLCH parsing).
// Usage: node --test scripts/tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  composite,
  contrastRatio,
  hexToRgb,
  oklchToRgb,
  parseColor,
  readTokens,
} from "../lib/contrast.mjs";

const close = (a, b, eps = 0.01) =>
  assert.ok(Math.abs(a - b) <= eps, `${a} not within ${eps} of ${b}`);

test("white on black is 21:1, same colour is 1:1", () => {
  close(contrastRatio(hexToRgb("#ffffff"), hexToRgb("#000000")), 21);
  close(contrastRatio(hexToRgb("#000000"), hexToRgb("#ffffff")), 21);
  close(contrastRatio(hexToRgb("#777777"), hexToRgb("#777777")), 1);
});

test("known WCAG value: #777 on white is 4.48:1 (fails 4.5)", () => {
  close(contrastRatio(hexToRgb("#777777"), hexToRgb("#ffffff")), 4.48);
});

test("oklch converts to the right sRGB colour", () => {
  const white = oklchToRgb(1, 0, 0);
  white.rgb.forEach((c) => close(c, 1, 0.001));
  oklchToRgb(0, 0, 0).rgb.forEach((c) => close(c, 0, 0.001));
  // Pure red is oklch(62.8% 0.2577 29.23).
  const red = oklchToRgb(0.62796, 0.25768, 29.2339);
  close(red.rgb[0], 1, 0.002);
  close(red.rgb[1], 0, 0.002);
  close(red.rgb[2], 0, 0.002);
});

test("oklch outside sRGB is flagged, not silently clamped", () => {
  assert.equal(oklchToRgb(0.7, 0.4, 150).inGamut, false);
  assert.equal(oklchToRgb(0.5, 0.05, 60).inGamut, true);
});

test("parseColor reads the oklch() syntax we use, incl. percent", () => {
  const a = parseColor("oklch(0.7 0.1 45)");
  const b = parseColor("oklch(70% 0.1 45)");
  a.rgb.forEach((c, i) => close(c, b.rgb[i], 1e-9));
  assert.throws(() => parseColor("rgb(1 2 3)"), /unsupported colour/);
});

test("parseColor reads an alpha (oklch(L C H / a)); opaque colours get 1", () => {
  const glow = parseColor("oklch(0.7 0.1 45 / 0.12)");
  const solid = parseColor("oklch(0.7 0.1 45)");
  assert.equal(glow.alpha, 0.12);
  assert.equal(solid.alpha, 1);
  glow.rgb.forEach((c, i) => close(c, solid.rgb[i], 1e-9));
});

test("composite lays a see-through colour over an opaque one", () => {
  const black = [0, 0, 0];
  const halfWhite = { rgb: [1, 1, 1], alpha: 0.5 };
  composite(halfWhite, black).forEach((c) => close(c, 0.5, 1e-9));
  composite({ rgb: [1, 0, 0], alpha: 1 }, black).forEach((c, i) =>
    close(c, [1, 0, 0][i], 1e-9),
  );
});

test("readTokens takes --name: oklch(...) from the :root block only", () => {
  const css = `
    :root {
      --background: oklch(0.2 0.01 70);
      --foreground: oklch(0.95 0.01 85);
      --radius: 0.75rem;
    }
    @theme inline { --color-background: var(--background); }
  `;
  const t = readTokens(css);
  assert.deepEqual(Object.keys(t).sort(), ["background", "foreground"]);
  assert.equal(t.background, "oklch(0.2 0.01 70)");
});
