import type { VideoEntry } from "@/lib/videos";

// Video poster as a lazy <img> behind the <video> (Phase 3 H12). A
// `poster` attribute always downloads at page load, even far below the
// first screen; on a phone that put 48 KB in front of the hero text (the
// LCP). The video has no poster and no frame before it plays, so it is
// transparent and this image shows through; once it plays, it covers it.
// Native lazy loading: works without JavaScript. Decorative (alt=""): the
// <video> carries the label.
export function LazyPoster({ video }: { video: VideoEntry }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={video.poster}
      alt=""
      width={video.width}
      height={video.height}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
