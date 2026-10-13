// WCAG 2.x contrast for our colour tokens. No dependencies.
// OKLCH -> sRGB math: Björn Ottosson, https://bottosson.github.io/posts/oklab/

const GAMUT_EPS = 0.0005;

const encode = (c) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
const decode = (c) =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

/** oklch(L 0-1, C, H degrees) -> { rgb: sRGB 0-1 (clamped), inGamut } */
export function oklchToRgb(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const inGamut = lin.every((c) => c >= -GAMUT_EPS && c <= 1 + GAMUT_EPS);
  const rgb = lin.map((c) => encode(Math.min(1, Math.max(0, c))));
  return { rgb, inGamut };
}

export function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => c / 255);
}

/** Parses `oklch(L C H)` (L as 0-1 or %). Other syntaxes throw on purpose. */
export function parseColor(value) {
  const m = value
    .trim()
    .match(/^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*\)$/);
  if (!m) throw new Error(`unsupported colour: ${value}`);
  const L = Number(m[1]) / (m[2] ? 100 : 1);
  return oklchToRgb(L, Number(m[3]), Number(m[4]));
}

const luminance = ([r, g, b]) =>
  0.2126 * decode(r) + 0.7152 * decode(g) + 0.0722 * decode(b);

export function contrastRatio(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Colour tokens (`--name: oklch(...)`) from the first `:root { }` block. */
export function readTokens(css) {
  const root = css.match(/:root\s*\{([^}]*)\}/);
  if (!root) throw new Error("no :root block found");
  const tokens = {};
  for (const [, name, value] of root[1].matchAll(
    /--([\w-]+)\s*:\s*(oklch\([^)]*\))\s*;/g,
  )) {
    tokens[name] = value;
  }
  return tokens;
}
