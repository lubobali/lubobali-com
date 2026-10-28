"use client";

import { useEffect, useRef } from "react";
import { fingerprint } from "@/lib/notes/fingerprint";

// The note's fingerprint behind the title block (P9.7, concept C), drawn in
// the browser AFTER the page shows. Inline from the server it doubled in the
// HTML (markup + React payload, 16 -> 23 KB) and pushed the TL;DR (the LCP)
// past 2.5 s on Lighthouse's slow phone. Now only seed, colour and dot count
// travel; same drawing as the share card. Decorative: no JS = no drawing.
export function NotePrint({ seed, hue, dots }: { seed: string; hue: string; dots: number }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = fingerprint(seed, { id: "cover", cx: 320, cy: 240, scale: 1.3, hue, dots, rings: 18, points: 30 });
  }, [seed, hue, dots]);
  return <svg ref={ref} aria-hidden="true" focusable="false" viewBox="0 0 640 480" className="note-print" />;
}
