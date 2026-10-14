// "Data rain": columns of real-looking code/data fragments rising from
// bottom to top (Matrix style, read top to bottom).
// Server component: the SVG pattern is generated once at build time and
// used as a background image, so the characters are NOT page text
// (search + AI bots never read them). Animation is CSS (globals.css,
// .ambient-rain), transform only; static with OS "reduce motion".

// Must match --glow-rain in globals.css (CI checks text contrast on it).
const RAIN_RGB = "107,147,247"; // --brand-light #6b93f7
const RAIN_MAX_ALPHA = 0.22;

// What an AI data platform "sees" behind the screen: queries, vectors,
// model I/O, routing. Realistic but generic — no real table names, keys,
// users or hosts. Each stream reads one fragment top to bottom.
const SNIPPETS = [
  "SELECT tenant_id, count(*) FROM events GROUP BY 1;",
  "WHERE ts >= now() - interval '7 days'",
  "embedding = model.encode(chunk)",
  "[0.0213, -0.4471, 0.1187, 0.9032, -0.0558]",
  "ORDER BY embedding <=> $1 LIMIT 5",
  "cos_sim(q, k) = 0.912",
  '{"intent": "analytics", "tier": 2}',
  '{"role": "assistant", "content": "..."}',
  "tokens=1847 latency=212ms cache=hit",
  "async def route(query: str) -> Intent:",
  "if confidence > 0.85: return answer",
  "df.groupby('page').agg(views=('id', 'count'))",
  "CREATE INDEX ON chunks USING hnsw",
  "INSERT INTO daily_stats VALUES ($1, $2, $3)",
  "rows=12480 partitions=8 ok",
  "parquet -> s3://lake/events/dt=2026-10-14/",
  "temperature=0.2 max_tokens=500",
  "p95=184ms errors=0 uptime=99.98%",
];
const CHAR = 18; // vertical step per character, px

const escapeXml = (ch: string) =>
  ch === "&" ? "&amp;" : ch === "<" ? "&lt;" : ch === ">" ? "&gt;" : ch;
const COL = 22; // column width, px

// Small deterministic PRNG: the same pattern on every build.
function prng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function rainSvg(seed: number, cols: number, height: number, fontSize: number) {
  const rand = prng(seed);
  const parts: string[] = [];
  for (let c = 0; c < cols; c++) {
    if (rand() < 0.35) continue; // gaps between streams
    const snippet = SNIPPETS[Math.floor(rand() * SNIPPETS.length)];
    const start = Math.floor(rand() * snippet.length * 0.5);
    const text = snippet.slice(start, start + 10 + Math.floor(rand() * 18));
    const head = Math.floor(rand() * (height / CHAR));
    for (let i = 0; i < text.length; i++) {
      if (text[i] === " ") continue; // spaces stay as gaps in the stream
      // Head (top, leading the climb) brightest, tail below fades out.
      const alpha = (RAIN_MAX_ALPHA * (1 - i / text.length)).toFixed(3);
      const y = (((head + i) * CHAR) % height) + CHAR;
      parts.push(
        `<text x="${c * COL + COL / 2}" y="${y}" fill-opacity="${alpha}">${escapeXml(text[i])}</text>`,
      );
    }
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${cols * COL}" height="${height}">` +
    `<g fill="rgb(${RAIN_RGB})" font-family="ui-monospace,Menlo,Consolas,monospace" font-size="${fontSize}" text-anchor="middle">` +
    parts.join("") +
    `</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// Three layers = depth: far (small, slow, dim) to near (bigger, faster).
const layers = [
  { seed: 7, cols: 24, height: 720, font: 11, className: "ambient-rain-far" },
  { seed: 21, cols: 18, height: 900, font: 13, className: "ambient-rain-mid" },
  { seed: 42, cols: 12, height: 1080, font: 15, className: "ambient-rain-near" },
];

export function DataRain() {
  return (
    <div aria-hidden className="ambient ambient-rain">
      {layers.map((l) => (
        <div
          key={l.className}
          className={`ambient-rain-layer ${l.className}`}
          style={{
            backgroundImage: rainSvg(l.seed, l.cols, l.height, l.font),
            backgroundSize: `${l.cols * COL}px ${l.height}px`,
            height: `calc(100% + ${l.height}px)`,
            ["--rain-shift" as string]: `-${l.height}px`,
          }}
        />
      ))}
    </div>
  );
}
