// "LB" key logo (same mark as LuBot) for the dark site.
// The original has a black key that disappears on navy, so this makes a
// dark-background version: greys (key, B, the L's bevel) are inverted to
// silver, the white inside the B becomes see-through. The blue L is kept.
//   in:  assets/brand/lb-logo-original.png (not served)
//   out: public/brand/lb-logo.webp (96 px tall = 48 px at 2x, header)
//        public/brand/lb-logo-lg.webp (240 px tall, "Built with" wheel middle;
//        own file, loaded lazily: a bigger header logo slowed phone LCP)
// Output is committed; re-run only when the logo changes:
//   node scripts/brand/logo.mjs
import sharp from "sharp";

const HEIGHT = 96;
const { data, info } = await sharp("assets/brand/lb-logo-original.png")
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
  if (a === 0 || Math.max(r, g, b) - Math.min(r, g, b) >= 28) continue; // blue L
  const v = (r + g + b) / 3;
  if (v > 244) {
    data[i + 3] = 0; // white inside the B
    continue;
  }
  const silver = Math.round(110 + (255 - v) * 0.52);
  data[i] = silver;
  data[i + 1] = silver;
  data[i + 2] = Math.min(255, silver + 8);
}

for (const [file, height] of [
  ["public/brand/lb-logo.webp", HEIGHT],
  ["public/brand/lb-logo-lg.webp", 240],
]) {
  await sharp(data, { raw: info })
    .trim()
    .resize({ height })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(file);
  const meta = await sharp(file).metadata();
  console.log(`logo: ${file} ${meta.width}x${meta.height}`);
}
