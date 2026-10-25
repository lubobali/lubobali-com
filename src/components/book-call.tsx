import { buttonVariants } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

// The one call to action (Phase 3 D3): free 30-min intro call on Calendly.
// Used in the header, the middle of the page and the bottom; the AI
// Blueprint tool (Phase 3b) will reuse it. A plain link, so it works
// without JavaScript and bots see where it goes.
// `compact`: shorter text on phones, where the header has little room.
export function BookCall({
  size = "xl",
  compact = false,
  className,
}: {
  size?: "lg" | "xl";
  compact?: boolean;
  className?: string;
}) {
  const { label, url } = site.bookCall;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener"
      // Phase 8: one clean name for every Book a call click (the tracker
      // reads data-track first; the text holds both the phone + desktop
      // labels and the screen-reader note).
      data-track={label}
      className={cn(buttonVariants({ size }), className)}
    >
      {compact ? (
        <>
          <span className="sm:hidden">Book a call</span>
          <span className="hidden sm:inline">{label}</span>
        </>
      ) : (
        label
      )}
      <span className="sr-only"> (opens Calendly in a new tab)</span>
    </a>
  );
}
