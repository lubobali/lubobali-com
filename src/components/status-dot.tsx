import { site } from "@/lib/site";

// Availability dot, one rule for the whole site (Lubo, H11): green = free
// now, amber = next free slot later (like a traffic light). Flip
// site.availableNow and every dot follows. Always next to text that says
// the same, so colour is never the only signal.
export function StatusDot({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`${site.availableNow ? "now-dot" : "soon-dot"} ${className}`} />;
}
