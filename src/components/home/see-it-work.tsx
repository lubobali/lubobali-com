import { intro } from "@/lib/intro";
import { getVideo } from "@/lib/videos";
import { AutoplayLoop } from "./autoplay-loop";
import { IntroPlayer } from "./intro-player";

// Right below the hero (Phase 3 H4, layout = Lubo's option 1): Lubo's own
// intro video on the left (H9b, click to play, Lubo 2026-10-19) and the
// LuBot demo loop on the right. Phone: stacked, intro first. The intro is
// a bit wider (16:9 next to the 4:3 loop) so both are about the same height.
const CAPTION =
  "LuBot answering a real question about website traffic: chart, reasoning and raw SQL in seconds.";

const frame =
  "relative overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_70px_-24px_color-mix(in_oklch,var(--brand)_45%,transparent)]";

export function SeeItWork() {
  const loop = getVideo("lubot-demo-loop");
  const video = getVideo("lubo-intro");
  return (
    <section aria-labelledby="see-it-work" className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-16 sm:px-6 lg:py-20">
      <h2 id="see-it-work" className="sr-only">
        Meet Lubo, and LuBot in action
      </h2>
      <div className="relative grid items-start gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-8">
        {/* Soft navy around both videos + captions: no rain over them (Lubo,
            H5); the rain moves left and right. Content below is `relative`,
            so it paints on top of this. */}
        <div aria-hidden="true" className="rain-clear absolute -inset-x-16 -inset-y-12 bg-background" />
        <figure className="relative flex min-w-0 flex-col gap-4">
          <div className={frame}>
            <IntroPlayer video={video} label={`Video: ${intro.name}`} duration={intro.durationLabel} />
          </div>
          <figcaption className="text-center text-sm text-muted-foreground">
            Why most AI projects fail, and how I fix it.
          </figcaption>
          <details className="rounded-xl border border-border/70 px-4 py-3 text-sm">
            <summary className="cursor-pointer font-medium text-link">Read the transcript</summary>
            <div className="mt-3 flex flex-col gap-3 text-muted-foreground">
              {intro.transcript.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </details>
        </figure>
        <figure className="relative flex min-w-0 flex-col gap-4">
          <div className={frame}>
            <AutoplayLoop video={loop} label="Screen recording of LuBot answering a question about website visitors" />
          </div>
          <figcaption className="text-center text-sm text-muted-foreground">{CAPTION}</figcaption>
        </figure>
      </div>
    </section>
  );
}
