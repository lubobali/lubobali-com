"use client";

import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Blueprint } from "./types";

// Book a call under the visitor's OWN blueprint (Phase 3b B5.3): Calendly
// opens at once with the blueprint's code (utm_content), and the signed
// blueprint is saved in the background (sendBeacon: survives the page
// opening Calendly, no popup blocker, no wait). Lubo sees the code in the
// booking and reads the blueprint with scripts/blueprint-show.sh. Saved
// only on this click (90 days), never before.
export function BookWithCode({ bp, className }: { bp: Blueprint & { code: string }; className?: string }) {
  const query = new URLSearchParams({ utm_source: "lubobali.com", utm_medium: "blueprint", utm_content: bp.code });
  function save() {
    try {
      const body = new Blob([JSON.stringify({ blueprint: bp })], { type: "application/json" });
      if (!navigator.sendBeacon("/api/blueprint/book", body)) throw new Error("beacon refused");
    } catch {
      // Fallback: a normal request that outlives the click.
      void fetch("/api/blueprint/book", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ blueprint: bp }),
        keepalive: true,
      }).catch(() => {});
    }
  }
  return (
    <a
      href={`${site.bookCall.url}?${query}`}
      target="_blank"
      rel="noopener"
      onClick={save}
      className={cn(buttonVariants({ size: "xl" }), className)}
    >
      {site.bookCall.label}
      <span className="sr-only"> (opens Calendly in a new tab)</span>
    </a>
  );
}
