import { StatusDot } from "@/components/status-dot";
import { now, steps, terms } from "@/lib/process";
import { site } from "@/lib/site";

// How it works + Now (Phase 3 H9): answers "is hiring a freelancer safe?"
// right before the visitor decides to book. 4 numbered steps (a real
// sequence, so an <ol>), each with a platinum emblem and a one-line promise
// at the bottom; fair terms; a live "Now" + next free slot. The steps read
// as a journey (Lubo): lightest blue at step 1 -> darkest at step 4, plus a
// progress bar 25 -> 100%. Data: src/lib/process.ts. Styles: .step-* etc.

type Icon = (typeof steps)[number]["icon"];

// 24x24 line icons, drawn with currentColor (platinum).
const ICONS: Record<Icon, React.ReactNode> = {
  // A phone handset: the free call.
  call: <path d="M6.6 3.5h2.6l1.6 4-2 1.3a11 11 0 0 0 5.4 5.4l1.3-2 4 1.6v2.6a2 2 0 0 1-2.2 2A16 16 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" />,
  // A page with lines and a signature: contract + scope.
  contract: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M8.5 12h7M8.5 15.5h4M8.5 18.6c1-1.2 1.8-1.2 2.4 0s1.4 1.2 2.4 0" />
    </>
  ),
  // A calendar with a check: every 2 weeks.
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4M9 15l2 2 4-4" />
    </>
  ),
  // A key (like the one in the LB logo): handover, it's yours.
  key: (
    <>
      <circle cx="8" cy="15.5" r="4.5" />
      <path d="m11.3 12.3 8.2-8.3M16.5 7l2.5 2.5M14 9.5l2 2" />
    </>
  ),
};

const check = (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mt-0.5 shrink-0 text-award"
  >
    <path d="m5 12 5 5L20 7" />
  </svg>
);

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="relative mx-auto w-full max-w-6xl scroll-mt-20 px-4 pt-8 pb-8 sm:px-6 lg:pt-12 lg:pb-12"
    >
      <h2 id="how-title" className="text-3xl font-semibold text-balance sm:text-4xl">
        How it works
      </h2>
      <ol className="step-list mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.title} className="step-card sky-card flex flex-col gap-3 rounded-2xl p-6">
            <span aria-hidden="true" className="award-emblem step-emblem mb-2">
              <svg
                viewBox="0 0 24 24"
                width="30"
                height="30"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {ICONS[s.icon]}
              </svg>
            </span>
            <p className="text-xs font-semibold tracking-wide text-award uppercase">Step {i + 1}</p>
            {/* 2 lines kept on desktop, so all 4 texts start on one line. */}
            <h3 className="text-lg font-semibold text-balance lg:min-h-[2lh]">{s.title}</h3>
            <p className="sky-card-text">{s.text}</p>
            <span aria-hidden="true" className="step-progress mt-auto">
              <span style={{ ["--p" as string]: `${((i + 1) / steps.length) * 100}%` }} />
            </span>
            <p className="flex gap-2 pt-1 text-sm font-medium">
              {check}
              {s.note}
            </p>
          </li>
        ))}
      </ol>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="sky-card rounded-2xl p-6">
          <h3 className="text-sm font-semibold tracking-wide text-award uppercase">Fair terms, both ways</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {terms.map((t) => (
              <li key={t} className="flex gap-3">
                {check}
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="sky-card flex flex-col justify-center gap-5 rounded-2xl p-6">
          <p className="flex items-start gap-3">
            <span aria-hidden="true" className="now-dot mt-2" />
            <span>
              <span className="text-sm font-semibold tracking-wide text-award uppercase">Now </span>
              {now}
            </span>
          </p>
          <p className="flex items-start gap-3 border-t border-award/20 pt-5">
            <StatusDot className="mt-2" />
            <span>
              <span className="text-sm font-semibold tracking-wide text-award uppercase">{site.availableNow ? "Available " : "Next project "}</span>
              {site.availableNow ? "for new AI projects now" : `from ${site.availableFrom}`}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
