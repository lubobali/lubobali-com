import Link from "next/link";

// A line at the end of project and story pages that sends the visitor to
// the AI Blueprint tool. `lead` = the page's own question. (The header
// button goes to the tool itself: BlueprintLink.)
export function BlueprintSpot({ lead }: { lead: string }) {
  return (
    <p className="text-center text-lg text-muted-foreground">
      {lead}{" "}
      <Link href="/blueprint" prefetch={false} className="font-medium text-link underline underline-offset-4">
        Get your free AI blueprint
      </Link>{" "}
      in about a minute.
    </p>
  );
}
