import type { Work } from "@/lib/work";

// Moving pictures on the Selected work cards (Lubo, H7): a candle chart for
// LuBot (stock mode), a card paying out splits for HelloPayments, a washing
// machine spinning a money ring for GraphGuard. Inline SVG = 0 requests,
// decorative only. Colours come from the card (`color` = its tone), motion
// from globals.css .art-* (transform/opacity/dash only, off for reduced motion).

// [open, close, high, low] in SVG y (smaller = higher price): an uptrend.
const CANDLES = [
  [108, 98, 92, 114],
  [98, 104, 95, 108],
  [104, 92, 86, 106],
  [92, 84, 80, 96],
  [84, 90, 80, 94],
  [90, 78, 74, 92],
  [78, 82, 72, 86],
  [82, 68, 64, 84],
  [68, 60, 56, 72],
  [60, 66, 56, 70],
  [66, 52, 48, 68],
  [52, 44, 40, 56],
  [44, 32, 26, 46],
] as const;
const STEP = 28;
const X0 = 30;
const trend = CANDLES.map(([o, c], i) => `${X0 + i * STEP},${(o + c) / 2}`).join(" L");

function Candles() {
  return (
    <>
      <defs>
        <linearGradient id="art-candles-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="art-grid">
        <path d="M12 30H388M12 70H388M12 110H388" />
      </g>
      <path d={`M${trend} L${X0 + 12 * STEP},130 L${X0},130 Z`} fill="url(#art-candles-area)" />
      <path className="art-draw" d={`M${trend}`} pathLength={1} fill="none" stroke="currentColor" strokeWidth="1.5" />
      {CANDLES.map(([o, c, h, l], i) => {
        const x = X0 + i * STEP;
        const up = c < o;
        const last = i === CANDLES.length - 1;
        return (
          <g key={x} className={`${up ? "art-up" : "art-down"}${last ? " art-pulse" : ""}`}>
            <path d={`M${x} ${h}V${l}`} strokeWidth="1.5" />
            <rect x={x - 5} y={Math.min(o, c)} width="10" height={Math.abs(o - c)} rx="1.5" />
          </g>
        );
      })}
      <circle className="art-ping" cx={X0 + 12 * STEP} cy="26" r="4" fill="currentColor" />
    </>
  );
}

// Card on the left, money flowing out to 3 splits (the residual engine).
function Payments() {
  const splits = [34, 70, 106];
  return (
    <>
      <g className="art-metal">
        <rect x="52" y="30" width="122" height="80" rx="10" />
        <rect x="68" y="52" width="22" height="16" rx="3" />
        <path d="M68 92h18M94 92h18M120 92h18M146 92h12" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g className="art-waves" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M144 50a8 8 0 0 1 0 12" />
        <path d="M150 45a15 15 0 0 1 0 22" />
        <path d="M156 40a22 22 0 0 1 0 32" />
      </g>
      {splits.map((y) => (
        <g key={y}>
          <path className="art-flow" d={`M178 70C250 70 246 ${y} 312 ${y}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <g className="art-coin">
            <circle cx="332" cy={y} r="14" />
            <circle cx="332" cy={y} r="8.5" />
          </g>
        </g>
      ))}
    </>
  );
}

// A washing machine; in the drum a ring of accounts spins (money going
// round in circles), one flagged account pulses. Bubbles rise beside it.
function Laundry() {
  const ring = [0, 72, 144, 216, 288].map((deg) => {
    const r = (deg * Math.PI) / 180;
    return [200 + 18 * Math.cos(r), 82 + 18 * Math.sin(r)] as const;
  });
  return (
    <>
      <g className="art-metal">
        <rect x="148" y="8" width="104" height="124" rx="12" />
        <path d="M148 34H252" />
        <circle cx="234" cy="21" r="6" />
      </g>
      <circle className="art-alert" cx="164" cy="21" r="3" fill="currentColor" />
      <circle cx="176" cy="21" r="3" className="art-dim" />
      <circle cx="200" cy="82" r="38" className="art-door" />
      <circle cx="200" cy="82" r="30" className="art-glass" />
      <g className="art-spin" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d={`M${ring.map(([x, y]) => `${x} ${y}`).join(" L")} Z`} />
        {ring.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === 0 ? 4 : 3} fill="currentColor" className={i === 0 ? "art-flag" : undefined} />
        ))}
      </g>
      <g className="art-bubbles" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="112" cy="110" r="5" />
        <circle cx="124" cy="124" r="3" />
        <circle cx="290" cy="116" r="4" />
        <circle cx="278" cy="126" r="2.5" />
        <circle cx="100" cy="128" r="2.5" />
        <circle cx="300" cy="130" r="3" />
      </g>
    </>
  );
}

const ART = { candles: Candles, payments: Payments, laundry: Laundry } satisfies Record<Work["art"], () => React.ReactNode>;

export function WorkArt({ art }: { art: Work["art"] }) {
  const Art = ART[art];
  return (
    <div aria-hidden="true" className="work-art">
      <svg viewBox="0 0 400 140" className="h-full w-full">
        <Art />
      </svg>
    </div>
  );
}
