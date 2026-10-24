import { building } from "@/lib/building/copy";

// The "Building now" sign (Phase 7, Lubo: "a sign that means it's live, like a
// pulsing dot"). Honest: it pulses green only if Lubo shipped in the last 2
// days (isActive in lib/building/format.ts), else it is a still grey dot.
// Same ping as the availability dot (.now-dot); reduced motion = still.
export function LiveDot({ active, className = "" }: { active: boolean; className?: string }) {
  return (
    <>
      <span aria-hidden="true" className={`${active ? "now-dot" : "quiet-dot"} ${className}`} />
      <span className="sr-only">{active ? building.hero.active : building.hero.quiet}</span>
    </>
  );
}
