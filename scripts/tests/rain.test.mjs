// node --test scripts/tests/rain.test.mjs
import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeXml, LAYERS, RAIN_MAX_ALPHA, rainSvg } from "../lib/rain.mjs";

test("rainSvg is deterministic (same file, same cache URL, every build)", () => {
  for (const layer of LAYERS) assert.equal(rainSvg(layer), rainSvg(layer));
});

test("rainSvg: tile size matches the layer, has glyphs, no scripts", () => {
  const svg = rainSvg(LAYERS[0]);
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="528" height="720">/);
  assert.ok((svg.match(/<text /g) ?? []).length > 50);
  assert.doesNotMatch(svg, /<script|on\w+=|href=/i);
});

test("rainSvg: no glyph brighter than the contrast-checked maximum", () => {
  for (const layer of LAYERS) {
    const alphas = [...rainSvg(layer).matchAll(/fill-opacity="([\d.]+)"/g)].map((m) => Number(m[1]));
    assert.ok(alphas.length > 0);
    assert.ok(Math.max(...alphas) <= RAIN_MAX_ALPHA, layer.name);
  }
});

test("escapeXml: snippet characters that would break the SVG are escaped", () => {
  assert.deepEqual(["&", "<", ">", '"', "'", "a"].map(escapeXml), ["&amp;", "&lt;", "&gt;", "&quot;", "&apos;", "a"]);
  for (const layer of LAYERS) assert.doesNotMatch(rainSvg(layer), />[<>&"']<\/text>/);
});

test("rain behind text stays at the contrast-checked strength", () => {
  // RAIN_MAX_ALPHA x --rain-text-dim must not exceed --glow-rain's alpha,
  // the level check-contrast.mjs tests all text against.
  const css = readFileSync(new URL("../../src/app/globals.css", import.meta.url), "utf8");
  const glow = Number(css.match(/--glow-rain: oklch\([^/]+\/ ([\d.]+)\)/)[1]);
  const dim = Number(css.match(/--rain-text-dim: ([\d.]+);/)[1]);
  assert.ok(RAIN_MAX_ALPHA * dim <= glow + 1e-9, `${RAIN_MAX_ALPHA} x ${dim} > ${glow}`);
});
