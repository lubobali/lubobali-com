import Link from "next/link";

// The spot the header's "Free AI blueprint" button (#blueprint) jumps to on
// pages without the tool itself. Every page needs one: scripts/check-seo.mjs
// fails the build otherwise (Lubo 2026-10-22: "does not work from other
// pages"). `lead` = this page's own question.
export function BlueprintSpot({ lead }: { lead: string }) {
  return (
    <p id="blueprint" className="scroll-mt-24 text-center text-lg text-muted-foreground">
      {lead}{" "}
      <Link href="/blueprint" prefetch={false} className="font-medium text-link underline underline-offset-4">
        Get your free AI blueprint
      </Link>{" "}
      in about a minute.
    </p>
  );
}
