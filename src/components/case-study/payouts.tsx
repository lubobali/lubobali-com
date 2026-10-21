// The automation, drawn (Phase 4 C5, mystery pages): processor reports flow
// into one engine and come out as many payouts. The idea only: no names,
// no numbers, no screens. Dots travel the lines (hidden for reduced motion).
// Styles: story.css .cs-pay.
const REPORTS = [50, 122, 194]; // top of each report sheet
const PAYOUTS = [46, 98, 150, 202, 254]; // centre of each payout
const ENGINE = { x: 190, y: 95, w: 110, h: 110 };

const inPath = (y: number) => `M104,${y + 30} C150,${y + 30} 150,150 ${ENGINE.x},150`;
const outPath = (y: number) => `M${ENGINE.x + ENGINE.w},150 C350,150 350,${y} 400,${y}`;

export function PayoutsArt() {
  return (
    <figure className="cs-screen flex flex-col gap-3">
      <div className="cs-screen-frame cs-ring cs-pay rounded-2xl p-4 sm:p-6">
        <svg
          viewBox="0 0 470 300"
          role="img"
          aria-label="Monthly processor reports flow into one automatic engine, which pays out every split"
          className="mx-auto block h-auto w-full"
        >
          {REPORTS.map((y) => (
            <g key={`r${y}`}>
              <path d={inPath(y)} className="cs-pay-line" fill="none" />
              <rect x="40" y={y} width="64" height="60" rx="6" className="cs-pay-sheet" />
              {[14, 26, 38, 50].map((d) => (
                <line key={d} x1="50" x2={d === 50 ? 78 : 94} y1={y + d - 4} y2={y + d - 4} className="cs-pay-row" />
              ))}
            </g>
          ))}
          {PAYOUTS.map((y) => (
            <g key={`p${y}`}>
              <path d={outPath(y)} className="cs-pay-line" fill="none" />
              <circle cx="414" cy={y} r="14" className="cs-ring-node" />
              <text x="414" y={y + 5} textAnchor="middle" className="cs-pay-coin">
                $
              </text>
            </g>
          ))}
          <rect {...{ x: ENGINE.x, y: ENGINE.y, width: ENGINE.w, height: ENGINE.h }} rx="22" className="cs-pay-engine" />
          <circle cx={ENGINE.x + ENGINE.w / 2} cy="138" r="18" className="cs-pay-core" />
          <text x={ENGINE.x + ENGINE.w / 2} y="184" textAnchor="middle" className="cs-pay-label">
            automatic
          </text>
          <text x="72" y="282" textAnchor="middle" className="cs-pay-caption">
            Reports
          </text>
          <text x="414" y="292" textAnchor="middle" className="cs-pay-caption">
            Payouts
          </text>
          {REPORTS.map((y, i) => (
            <circle key={`di${y}`} r="3.5" className="cs-ring-light">
              <animateMotion dur="2.4s" begin={`${i * 0.8}s`} repeatCount="indefinite" path={inPath(y)} />
            </circle>
          ))}
          {PAYOUTS.map((y, i) => (
            <circle key={`do${y}`} r="3.5" className="cs-ring-light">
              <animateMotion dur="2.4s" begin={`${0.4 + i * 0.48}s`} repeatCount="indefinite" path={outPath(y)} />
            </circle>
          ))}
        </svg>
      </div>
      <figcaption className="cs-screen-caption text-xs tracking-wide">The idea, drawn. The real build stays private.</figcaption>
    </figure>
  );
}
