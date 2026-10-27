"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { notesCopy as copy } from "@/lib/notes/copy";

// Listen (Phase 9, Lubo: "so people can listen, not read"). A pill under the
// note title starts the audio; a slim player bar then sticks to the bottom so
// the visitor can scroll, or lock the phone, and keep listening. Lubo's own
// voice, made by AI, and it says so. No autoplay, nothing loads until they
// press play (preload="none"). Without JavaScript: the browser's own player.
// The bar is portaled to <body>: inside the title block (which has a
// backdrop-filter) "position: fixed" would stick to the block, not the screen.

const RATES = [1, 1.25, 1.5];
const clock = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function PlayIcon({ playing }: { playing: boolean }) {
  return playing ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-4 translate-x-px fill-current"
    >
      <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
    </svg>
  );
}

export function Listen({
  src,
  seconds,
  title,
  voice = copy.listen.voice,
}: {
  src: string;
  seconds: number;
  title: string;
  voice?: string;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [rate, setRate] = useState(1);
  const duration = seconds;

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const on = () => setPlaying(true);
    const off = () => setPlaying(false);
    const tick = () => setTime(a.currentTime);
    a.addEventListener("play", on);
    a.addEventListener("pause", off);
    a.addEventListener("ended", off);
    a.addEventListener("timeupdate", tick);
    // One voice at a time: when another player starts, this one stops and hides.
    const other = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== src) {
        a.pause();
        setOpen(false);
      }
    };
    window.addEventListener("listen:play", other);
    return () => {
      window.removeEventListener("listen:play", other);
      a.removeEventListener("play", on);
      a.removeEventListener("pause", off);
      a.removeEventListener("ended", off);
      a.removeEventListener("timeupdate", tick);
    };
  }, [src]);

  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    setOpen(true);
    if (a.paused) {
      if ("mediaSession" in navigator)
        navigator.mediaSession.metadata = new MediaMetadata({
          title,
          artist: "Lubo Bali",
          album: "Notes",
        });
      window.dispatchEvent(new CustomEvent("listen:play", { detail: src }));
      void a.play().catch(() => setPlaying(false));
    } else a.pause();
  };
  const seek = (v: number) => {
    if (audio.current) audio.current.currentTime = v;
    setTime(v);
  };
  const nextRate = () => {
    const r = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    if (audio.current) audio.current.playbackRate = r;
    setRate(r);
  };
  const close = () => {
    audio.current?.pause();
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className="listen-pill"
        data-playing={playing || undefined}
      >
        <span className="listen-pill-play">
          <PlayIcon playing={playing} />
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="font-semibold text-foreground">
            {playing ? copy.listen.pause : copy.listen.play} · {clock(duration)}
          </span>
          <span className="text-xs text-muted-foreground">
            {voice}
          </span>
        </span>
        <span aria-hidden="true" className="listen-eq">
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>
      <audio ref={audio} src={src} preload="none" />
      <noscript>
        {/* No JavaScript: the browser's own player, same file. */}
        <audio controls preload="none" src={src} className="mt-2 w-full" />
      </noscript>

      {open &&
        createPortal(
          <div
            role="region"
            aria-label={copy.listen.player}
            className="listen-bar"
          >
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? copy.listen.pause : copy.listen.play}
              className="listen-pill-play shrink-0"
            >
              <PlayIcon playing={playing} />
            </button>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="truncate text-sm font-medium text-foreground">
                {title}
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={1}
                  value={Math.min(time, duration)}
                  onChange={(e) => seek(Number(e.target.value))}
                  aria-label={copy.listen.seek}
                  aria-valuetext={`${clock(time)} of ${clock(duration)}`}
                  className="listen-range min-w-0 flex-1"
                  style={
                    {
                      "--p": `${(Math.min(time, duration) / duration) * 100}%`,
                    } as React.CSSProperties
                  }
                />
                <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                  {clock(time)} / {clock(duration)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={nextRate}
              aria-label={copy.listen.speed(rate)}
              className="listen-chip shrink-0"
            >
              {rate}×
            </button>
            <button
              type="button"
              onClick={close}
              aria-label={copy.listen.close}
              className="listen-chip shrink-0"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
