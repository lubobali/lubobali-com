"use client";

import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { blueprintHref } from "@/lib/blueprint-href";
import { cn } from "@/lib/utils";

// Plain <a>, not Next's <Link>: Link skips the scroll when the URL is
// already "/#blueprint" (Lubo, Phase 3b: "it does nothing"). The href is in
// the static HTML of every page (usePathname runs at build time too).
export function BlueprintLink() {
  return (
    <a
      href={blueprintHref(usePathname())}
      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "header-blueprint px-2.5 min-[420px]:px-3 sm:px-4")}
    >
      <span className="sm:hidden">Blueprint</span>
      <span className="hidden sm:inline">Free AI blueprint</span>
    </a>
  );
}
