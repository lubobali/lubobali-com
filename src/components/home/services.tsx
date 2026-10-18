import { services } from "@/lib/services";

// What I do (Phase 3 H6): 3 service cards that feel like awards (Lubo):
// platinum-edged card + a glowing emblem, and a proof link to check.
// Same list as the JSON-LD offers (src/lib/services.ts). Emblems are
// inline SVG (0 requests), decorative only. Styles: globals.css .award-*.

type Award = (typeof services)[number]["award"];

// 24x24 line icons, drawn with currentColor (platinum).
const EMBLEMS: Record<Award, React.ReactNode> = {
  // An artifact: a cut crystal.
  crystal: (
    <>
      <path d="M6 3h12l4 6-10 12L2 9z" />
      <path d="M2 9h20M12 21 8 9l4-6 4 6z" />
    </>
  ),
  // A medal on a ribbon, star in the middle.
  medal: (
    <>
      <path d="M7.5 2 11 9M16.5 2 13 9" />
      <circle cx="12" cy="15" r="6" />
      <path d="m12 12 .9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2-1.45-1.4 2-.3z" />
    </>
  ),
  // A trophy cup.
  trophy: (
    <>
      <path d="M7 3h10v6a5 5 0 0 1-10 0z" />
      <path d="M17 5h3v1.5A3.5 3.5 0 0 1 16.6 10M7 5H4v1.5A3.5 3.5 0 0 0 7.4 10" />
      <path d="M12 14v4M8 21h8M9 18h6" />
    </>
  ),
};

export function Services() {
  return (
    <section aria-labelledby="what-i-do" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
      <h2 id="what-i-do" className="text-3xl font-semibold text-balance sm:text-4xl">
        What I do
      </h2>
      <ul className="mt-10 grid gap-6 lg:grid-cols-3">
        {services.map((s) => (
          <li key={s.name} className="award-card flex flex-col gap-3 rounded-2xl p-6 sm:p-7">
            <span aria-hidden="true" className="award-emblem mb-5">
              <svg
                viewBox="0 0 24 24"
                width="36"
                height="36"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {EMBLEMS[s.award]}
              </svg>
            </span>
            <h3 className="text-xl font-semibold">{s.name}</h3>
            <p className="text-muted-foreground">{s.description}</p>
            <p className="mt-auto border-t border-border pt-4 text-sm">
              <span className="font-semibold tracking-wide text-award uppercase">Proof </span>
              <a href={s.proofUrl} className="text-link underline-offset-4 hover:underline">
                {s.proof}
              </a>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
