import { getVideo } from "@/lib/videos";
import { AutoplayLoop } from "./autoplay-loop";

// Right below the hero (Phase 3 H4, layout = Lubo's option 1): the LuBot
// demo loop, and later Lubo's own intro video next to it (H9b). Until the
// intro exists the loop sits alone, centred — no empty box.
const CAPTION =
  "LuBot answering a real question about website traffic: chart, reasoning and raw SQL in seconds.";

export function SeeItWork() {
  const loop = getVideo("lubot-demo-loop");
  return (
    <section aria-labelledby="see-it-work" className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-16 sm:px-6 lg:py-20">
      <h2 id="see-it-work" className="sr-only">
        LuBot in action
      </h2>
      <figure className="relative mx-auto flex max-w-xl flex-col gap-4">
        {/* Soft navy around the loop + caption: no rain over it (Lubo, H5);
            the rain moves left and right of it. Content below is
            `relative`, so it paints on top of this. */}
        <div aria-hidden="true" className="rain-clear absolute -inset-x-16 -inset-y-12 bg-background" />
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_70px_-24px_color-mix(in_oklch,var(--brand)_45%,transparent)]">
          <AutoplayLoop video={loop} label="Screen recording of LuBot answering a question about website visitors" />
        </div>
        <figcaption className="relative text-center text-sm text-muted-foreground">{CAPTION}</figcaption>
      </figure>
    </section>
  );
}
