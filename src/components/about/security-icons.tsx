import "./about.css";
import type { SecurityIcon } from "@/lib/about";

// Line icons for the /about Security list (Phase 6). Inline SVG: 0
// requests, drawn on a 24 grid, currentColor. Decorative: the title next to
// each one says the same.
const PATHS: Record<SecurityIcon, string> = {
  lock: "M7 11V8a5 5 0 0 1 10 0v3 M5 11h14v10H5z M12 15v2",
  cloud: "M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 9.5 4.25 4.25 0 0 0 7 18z",
  brain: "M12 5a3 3 0 0 0-5.6 1.5A3 3 0 0 0 4.5 12a3 3 0 0 0 2 5.3A3 3 0 0 0 12 19 M12 5a3 3 0 0 1 5.6 1.5A3 3 0 0 1 19.5 12a3 3 0 0 1-2 5.3A3 3 0 0 1 12 19 M12 5v14 M3 3l18 18",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z M12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  shield: "M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z M8.5 12l2.5 2.5 4.5-5",
  equal: "M5 9h14 M5 15h14",
  log: "M8 6h12 M8 12h12 M8 18h12 M4 6h.01 M4 12h.01 M4 18h.01",
  badge: "M12 2l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 20l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2z M8.8 11l2.2 2.2 4.2-4.2",
};

export function SecurityIconMark({ icon }: { icon: SecurityIcon }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[icon]} />
    </svg>
  );
}
