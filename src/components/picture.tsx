import { readFileSync } from "node:fs";
import { join } from "node:path";

// Built by scripts/build-images.mjs before `next build` (not committed).
type Source = { src: string; width: number };
type ImageEntry = {
  width: number;
  height: number;
  sources: { avif: Source[]; webp: Source[] };
};
type Manifest = Record<string, ImageEntry>;

let manifest: Manifest | undefined;
function getManifest(): Manifest {
  manifest ??= JSON.parse(
    readFileSync(join(process.cwd(), "src/generated/images.json"), "utf8"),
  ) as Manifest;
  return manifest;
}

const srcSet = (sources: Source[]) =>
  sources.map((s) => `${s.src} ${s.width}w`).join(", ");

/**
 * Responsive photo: AVIF, then WebP, in several widths; the browser picks
 * the smallest file that fits. width/height are set, so no layout shift.
 * - `sizes`: how wide the photo is shown, e.g. "(min-width: 768px) 50vw, 100vw".
 * - `priority`: only for the main photo of the first screen (LCP): loads
 *   eagerly with high priority. Everything else loads lazily.
 */
export function Picture({
  name,
  alt,
  sizes,
  priority = false,
  className,
}: {
  name: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const image = getManifest()[name];
  if (!image) throw new Error(`Picture: unknown image "${name}"`);
  const fallback =
    image.sources.webp.find((s) => s.width >= 960) ?? image.sources.webp.at(-1)!;

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(image.sources.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image.sources.webp)} sizes={sizes} />
      {/* Plain <img>: static export has no next/image optimizer; files
          come from our own build-time pipeline. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fallback.src}
        alt={alt}
        width={image.width}
        height={image.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
