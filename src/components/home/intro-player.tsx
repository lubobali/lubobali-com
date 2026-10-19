"use client";

import { useRef, useState } from "react";
import type { VideoEntry } from "@/lib/videos";

// Lubo's intro (H9b): click to play, with sound. Nothing downloads before
// the click (preload="none"; only the poster loads). Then native controls
// appear and the English captions are on. Styles: globals.css
// .intro-play.
export function IntroPlayer({ video, label, duration }: { video: VideoEntry; label: string; duration: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function play() {
    const v = ref.current;
    if (!v) return;
    setStarted(true);
    v.play().catch(() => {});
  }

  return (
    <div className="relative">
      <video
        ref={ref}
        src={video.src}
        poster={video.poster}
        width={video.width}
        height={video.height}
        controls={started}
        playsInline
        preload="none"
        aria-label={label}
        className="block h-auto w-full"
      >
        {/* Added on click, so the captions file is not one more request at page load. */}
        {started && video.captions && (
          <track kind="captions" src={video.captions} srcLang="en" label="English" default />
        )}
      </video>
      {!started && (
        <button type="button" onClick={play} className="intro-play group">
          <span aria-hidden="true" className="intro-play-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5" />
            </svg>
          </span>
          <span className="intro-play-label">
            Watch my intro <span className="text-muted-foreground">· {duration}</span>
          </span>
        </button>
      )}
    </div>
  );
}
