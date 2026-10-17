"use client";

import { useEffect, useRef } from "react";
import type { VideoEntry } from "@/lib/videos";

// Short muted demo loop. Nothing downloads until it is on screen
// (preload="none" + play() from an IntersectionObserver), it pauses when
// scrolled away, and with OS "reduce motion" it never plays: the poster
// stays. No controls on purpose (Lubo, Phase 3 H4), like the data rain.
export function AutoplayLoop({ video, label }: { video: VideoEntry; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !reduce.matches) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.4 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={video.src}
      poster={video.poster}
      width={video.width}
      height={video.height}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      className="block h-auto w-full"
    />
  );
}
