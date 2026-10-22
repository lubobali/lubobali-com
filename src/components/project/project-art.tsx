import { Screen } from "@/components/case-study/screen";
import type { ProjectPicture } from "@/lib/projects/model";

// The one picture of a project page (Phase 5 P5.3). Charts and flows are
// drawn in code from the project's real numbers: sharp on every screen, no
// image request, readable by screen readers and bots as plain text.
// Styles: project.css (.pj-*). Motion only grows/flows when the visitor
// allows motion; at rest everything is complete.
export function ProjectArt({ picture, priority }: { picture: ProjectPicture; priority: boolean }) {
  if (picture.kind === "screen") {
    return (
      <Screen
        shot={{ name: picture.image, alt: picture.alt, caption: picture.caption }}
        priority={priority}
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
    );
  }
  return (
    <figure className="pj-art flex flex-col gap-5 rounded-3xl p-6 sm:p-8">
      {picture.kind === "chart" ? <Chart picture={picture} /> : <Flow picture={picture} />}
      <figcaption className="text-xs tracking-wide text-muted-foreground">{picture.caption}</figcaption>
    </figure>
  );
}

type ChartPicture = Extract<ProjectPicture, { kind: "chart" }>;
type FlowPicture = Extract<ProjectPicture, { kind: "flow" }>;

// Bars start at zero (honest scale); the biggest value is the full width
// and carries the chapter tone.
function Chart({ picture }: { picture: ChartPicture }) {
  const max = Math.max(...picture.bars.map((b) => b.value));
  return (
    <>
      <p className="text-lg font-semibold text-balance">{picture.title}</p>
      <ol className="flex flex-col gap-4">
        {picture.bars.map((b) => (
          <li key={b.label} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 sm:grid-cols-[8rem_1fr_auto]">
            <span className="text-sm text-muted-foreground">
              {b.label}
              {b.note && <span className="block text-xs opacity-80">{b.note}</span>}
            </span>
            <span className="pj-track h-3 rounded-full" aria-hidden="true">
              <span
                className="pj-bar block h-full rounded-full"
                data-top={b.value === max || undefined}
                style={{ width: `${(b.value / max) * 100}%` }}
              />
            </span>
            <span className="text-lg font-semibold tabular-nums">
              {b.value}
              {picture.unit}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

// The build as a strip of steps; a soft light runs along the line.
function Flow({ picture }: { picture: FlowPicture }) {
  return (
    <ol className="pj-flow flex flex-col gap-3 sm:gap-4">
      {picture.steps.map((s, i) => (
        <li key={s.label} className="pj-step flex items-center gap-4 rounded-2xl px-4 py-3">
          <span className="pj-step-n grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold tabular-nums">
            {i + 1}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="font-semibold">{s.label}</span>
            <span className="text-sm text-muted-foreground">{s.detail}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

// "See the real app": the real screen, large, when the top picture is drawn
// in code. Lazy: it is below the first screen.
export function RealScreen({ shot }: { shot?: { image: string; alt: string; caption: string } }) {
  if (!shot) return null;
  return (
    <section aria-labelledby="real-app" className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <h2 id="real-app" className="text-2xl font-semibold sm:text-3xl">
        See the real app
      </h2>
      <Screen shot={{ name: shot.image, alt: shot.alt, caption: shot.caption }} sizes="(min-width: 1024px) 56rem, 100vw" />
    </section>
  );
}
