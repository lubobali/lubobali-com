import { fallbackSource, getImage, type ImageSource } from "@/lib/images";

const srcSet = (sources: ImageSource[]) =>
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
  const image = getImage(name);
  const fallback = fallbackSource(image);

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(image.sources.avif)} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(image.sources.webp)} sizes={sizes} />
      {/* Plain <img> inside <picture> (allowed by the Next lint rule):
          static export has no next/image optimizer; files come from our
          own build-time pipeline. */}
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
