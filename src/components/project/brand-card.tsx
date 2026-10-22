import type { ReactNode } from "react";
import { CHAPTERS, type Chapter } from "@/lib/projects/model";

// The brand card (P5.6, Lubo 2026-10-22: "luxury cards … scream my brand
// with my logo and my name", like his Publisher cards: /srv/lubot-publisher
// src/cards.py `_frame`). One colour "world" per chapter, picked from
// colour research (plans docs/phase-5-projects.md): AI agents = amber
// (comet), Data pipelines = violet (galaxy), Analytics = teal (orbits).
// Deep glow + grain + vignette + a faint motif, an accent rail, a
// letter-spaced kicker, the LB logo, the "LUBO BALI" signature and a
// folio footer. Styles: brand-card.css (.bc-*).

export function BrandCard({
  chapter,
  folio,
  title,
  caption,
  children,
}: {
  chapter: Chapter;
  folio: number;
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure data-world={chapter} className={`bc relative isolate flex flex-col gap-6 overflow-hidden rounded-3xl`}>
      <span aria-hidden="true" className="bc-rail" />
      <Motif chapter={chapter} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <p className="bc-kicker">{CHAPTERS[chapter]}</p>
          <span aria-hidden="true" className="bc-rule" />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/lb-logo.webp" alt="" width={91} height={96} decoding="async" className="bc-logo" />
      </div>
      <p className="bc-title relative">{title}</p>
      <div className="relative">{children}</div>
      <div className="relative flex flex-col gap-4">
        <p className="bc-sign">
          <span aria-hidden="true" className="bc-dash" />
          Lubo Bali <span className="bc-site">· lubobali.com</span>
        </p>
        <figcaption className="bc-foot">
          <span className="whitespace-nowrap">No. {String(folio).padStart(2, "0")}</span>
          <span className="flex items-center gap-2 text-right">
            <span aria-hidden="true" className="bc-dot" />
            {caption}
          </span>
        </figcaption>
      </div>
    </figure>
  );
}

// The faint motif behind each world (Publisher: comet, galaxy, orbits).
function Motif({ chapter }: { chapter: Chapter }) {
  const common = { "aria-hidden": true, className: "bc-motif", viewBox: "0 0 400 400", fill: "none" } as const;
  if (chapter === "ai") {
    // A comet: a trail of growing dots ending in a glowing head.
    // Its head sits below the logo, never on it.
    const trail = Array.from({ length: 16 }, (_, i) => ({ x: 40 + i * 16, y: 390 - i * 11, r: 1.5 + i * 0.45 }));
    return (
      <svg {...common}>
        {trail.map((d) => (
          <circle key={d.x} cx={d.x} cy={d.y} r={d.r} fill="currentColor" opacity={0.15 + d.r / 20} />
        ))}
        <circle cx="318" cy="200" r="24" fill="currentColor" opacity="0.5" />
        <circle cx="318" cy="200" r="38" stroke="currentColor" opacity="0.35" />
      </svg>
    );
  }
  if (chapter === "pipelines") {
    // A galaxy: tilted ellipses around a bright core.
    return (
      <svg {...common}>
        {[60, 100, 140, 180].map((rx, i) => (
          <ellipse key={rx} cx="300" cy="120" rx={rx} ry={rx * 0.38} stroke="currentColor" opacity={0.42 - i * 0.07} transform="rotate(-22 300 120)" />
        ))}
        <circle cx="300" cy="120" r="9" fill="currentColor" opacity="0.6" />
      </svg>
    );
  }
  // Orbits: rings around a point, off to the right.
  return (
    <svg {...common}>
      {[50, 95, 140, 185].map((r, i) => (
        <circle key={r} cx="330" cy="110" r={r} stroke="currentColor" opacity={0.42 - i * 0.07} />
      ))}
      <circle cx="330" cy="110" r="5" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
