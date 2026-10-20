"use client";

import { useEffect, useState } from "react";

// The waiting moment (Phase 3b B5.1): the AI takes ~8 s for questions and
// 20-35 s for a blueprint, so the wait should feel like work, not lag.
// Lines change every few seconds; a calm line fills toward 90% and the
// real answer finishes it. Announced politely to screen readers.

const LINES = {
  reading: ["Reading your story…", "Thinking about your business…", "Finding what's missing…"],
  drawing: [
    "Reading your story…",
    "Mapping how it works today…",
    "Finding who is involved…",
    "Drawing your new flow…",
    "Checking the risks…",
    "Writing my questions for our call…",
    "Almost there…",
  ],
};

export function Drawing({ mode }: { mode: "reading" | "drawing" }) {
  const lines = LINES[mode];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => Math.min(n + 1, lines.length - 1)), mode === "drawing" ? 4500 : 3000);
    return () => clearInterval(t);
  }, [lines.length, mode]);
  return (
    <div className="bpt-drawing" data-mode={mode}>
      <div className="bpt-orb" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="bpt-drawing-line" aria-live="polite">
        {lines[i]}
      </p>
      <div className="bpt-progress" aria-hidden="true">
        <span />
      </div>
      <p className="bpt-small">{mode === "drawing" ? "This takes about half a minute." : "A few seconds."}</p>
    </div>
  );
}
