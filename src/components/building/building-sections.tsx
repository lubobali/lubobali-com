import "./building.css";
import { DataRain } from "@/components/ambient/data-rain";
import { LiveDot } from "@/components/live-dot";
import { building as copy } from "@/lib/building/copy";
import { heatLevels, heatWeeks, isActive, shippedLabel, updatedLabel } from "@/lib/building/format";
import type { LiveData } from "@/lib/building/live";

// /building sections (Phase 7). Every number comes from live.json (the daily
// job, see lib/building/load.ts); words from lib/building/copy.ts. Same look
// as /about: data rain + glow on top, beam cards lighter -> darker down the
// page. Pure server HTML + CSS: no client JavaScript on this page.

const eyebrow = "text-sm font-semibold tracking-wide text-award uppercase";
const fmt = (n: number) => n.toLocaleString("en-US");
const PHONE_WEEKS = 20; // the year map shows the last 20 weeks on phones
const monthDay = (day: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" }).format(new Date(`${day}T00:00:00Z`));

export function SampleBanner() {
  return (
    <p role="status" className="building-sample">
      {copy.sample}
    </p>
  );
}

export function BuildingHero({ data }: { data: LiveData }) {
  return (
    <section aria-labelledby="building-title" className="relative overflow-hidden">
      <DataRain />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-80 -left-80 size-[60rem] rounded-full bg-[radial-gradient(closest-side,var(--glow-brand),transparent)]"
      />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pt-12 pb-10 sm:px-6 lg:pt-20 lg:pb-14">
        <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-sm text-muted-foreground">
          <LiveDot active={isActive(data.lastShipped, data.generatedAt)} />
          {shippedLabel(data.lastShipped, data.generatedAt)}
        </p>
        <h1 id="building-title" className="max-w-4xl text-hero font-semibold text-balance">
          {copy.hero.headline}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">{copy.hero.sub}</p>
        <p className="text-sm text-muted-foreground tabular-nums">{updatedLabel(data.generatedAt)}</p>
      </div>
    </section>
  );
}

export function YearMap({ data }: { data: LiveData }) {
  const y = data.year;
  const { weeks, months } = heatWeeks(y.start, y.days);
  const level = heatLevels(y.days);
  const firstShown = weeks.length - PHONE_WEEKS; // older weeks hide on phones
  const label = months.reduce<Record<number, string>>((acc, m) => ({ ...acc, [m.week]: m.label }), {});
  return (
    <section aria-labelledby="building-year" className="building-year edge-card flex flex-col gap-8 rounded-[2rem] p-6 sm:p-9">
      <div className="flex flex-col gap-3">
        <p className={eyebrow}>{copy.year.eyebrow}</p>
        <h2 id="building-year" className="text-3xl font-semibold text-balance sm:text-4xl">
          {copy.year.heading(fmt(y.total))}
        </h2>
      </div>
      <div
        className="building-heat"
        style={{ "--weeks": weeks.length, "--weeks-phone": Math.min(weeks.length, PHONE_WEEKS) } as React.CSSProperties}
        role="img"
        aria-label={`${fmt(y.total)} updates on ${fmt(y.activeDays)} days since ${monthDay(y.start)}. Longest streak: ${fmt(y.longestStreak)} days in a row.`}
      >
        {weeks.map((week, w) => {
          const old = w < firstShown ? "old" : undefined;
          const phoneLabel = w === firstShown && !label[w] ? week.find(Boolean) : null;
          return [
            <span key={`m${w}`} className="building-heat-month" data-old={old}>
              {phoneLabel ? <span className="phone-only">{monthDay(phoneLabel.date).split(" ")[0]}</span> : (label[w] ?? "")}
            </span>,
            ...week.map((cell, d) => (
              <i
                key={`${w}-${d}`}
                data-old={old}
                data-l={cell ? level(cell.count) : undefined}
                className={cell ? undefined : "pad"}
                title={cell ? `${monthDay(cell.date)}: ${fmt(cell.count)} update${cell.count === 1 ? "" : "s"}` : undefined}
              />
            )),
          ];
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        <p className="max-w-xl">{copy.year.note}</p>
        <p aria-hidden="true" className="building-legend">
          {copy.year.legend[0]}
          {[0, 1, 2, 3, 4].map((l) => (
            <i key={l} data-l={l} />
          ))}
          {copy.year.legend[1]}
        </p>
      </div>
      <dl className="building-stats grid grid-cols-3 gap-4 border-t border-white/10 pt-6 sm:gap-6">
        {[
          [y.activeDays, copy.year.stats.active],
          [y.longestStreak, copy.year.stats.streak],
          [y.projects, copy.year.stats.projects],
        ].map(([value, text]) => (
          <div key={text} className="flex flex-col gap-1">
            <dt className="order-2 text-sm text-muted-foreground sm:text-base">{text}</dt>
            <dd className="building-figure order-1 tabular-nums">{fmt(value as number)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function BuildingNow({ data }: { data: LiveData }) {
  if (!data.building.length) return null;
  return (
    <section aria-labelledby="building-now" className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className={eyebrow}>{copy.now.eyebrow}</p>
        <h2 id="building-now" className="text-3xl font-semibold text-balance sm:text-4xl">
          {copy.now.heading(data.building.length)}
        </h2>
      </div>
      <ul className={`grid gap-5 ${data.building.length === 2 ? "lg:grid-cols-2" : ""}`}>
        {data.building.map((b, i) => {
          const top = Math.max(1, ...b.weeks);
          return (
            <li key={b.name} className={`building-now-card edge-card flex flex-col gap-5 rounded-3xl p-6 sm:p-8 ${i ? "is-second" : ""}`}>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`building-chip ${b.kind === "client" ? "is-client" : "is-public"}`}>{copy.now.kinds[b.kind]}</span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-semibold">{b.name}</h3>
                <p className="text-muted-foreground">{b.what}</p>
              </div>
              <div className="mt-auto flex flex-wrap items-end justify-between gap-6">
                <p className="flex items-baseline gap-2">
                  <span className="building-figure tabular-nums">{fmt(b.weekUpdates)}</span>
                  <span className="text-muted-foreground">{copy.now.week}</span>
                </p>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="building-bars" role="img" aria-label={`${copy.now.bars}: ${b.weeks.map(fmt).join(", ")} updates`}>
                    {b.weeks.map((n, w) => (
                      <i key={w} style={{ "--h": `${Math.max(6, (n / top) * 100)}%` } as React.CSSProperties} data-on={n > 0 ? "" : undefined} />
                    ))}
                  </span>
                  <span className="text-xs text-muted-foreground">{copy.now.bars}</span>
                </div>
              </div>
              {b.kind === "client" && <p className="building-client text-sm">{copy.now.client}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function BuildingTrust({ data }: { data: LiveData }) {
  const t = copy.trust;
  const top = Math.max(1, ...data.tests.projects.map((p) => p.count));
  const since = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long" }).format(new Date(`${data.ci.since}T00:00:00Z`));
  const up = data.uptime;
  return (
    <section aria-labelledby="building-trust" className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className={eyebrow}>{t.eyebrow}</p>
        <h2 id="building-trust" className="text-3xl font-semibold text-balance sm:text-4xl">
          {t.heading}
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground">{t.lede}</p>
      </div>

      <div className="building-tests edge-card flex flex-col gap-8 rounded-[2rem] p-6 sm:p-9">
        <p className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span className="building-hero-figure tabular-nums">{fmt(data.tests.total)}</span>
          <span className="text-lg text-[var(--card-text-soft)]">{t.tests}</span>
          {data.tests.allGreen && <span className="building-chip is-green">{t.allGreen}</span>}
        </p>
        <ul className="flex flex-col gap-2.5" aria-label="Tests per project">
          {data.tests.projects.map((p) => (
            <li key={p.name} className="building-testbar">
              <span className="truncate">{p.name}</span>
              <span className="building-testbar-track">
                <i style={{ "--w": `${(p.count / top) * 100}%` } as React.CSSProperties} />
              </span>
              <b className="tabular-nums">{fmt(p.count)}</b>
            </li>
          ))}
        </ul>
        <dl className="grid gap-6 border-t border-white/10 pt-6 md:grid-cols-3">
          {[
            [fmt(data.ci.runs), t.runs(since)],
            [fmt(data.ci.stopped), t.stopped],
            [t.faster.value, t.faster.label],
          ].map(([value, text]) => (
            <div key={text} className="flex flex-col gap-1">
              <dt className="order-2 text-sm text-muted-foreground">{text}</dt>
              <dd className="order-1 text-2xl font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-muted-foreground">{t.counted}</p>
      </div>

      <p className="building-story">
        <small>{t.story.label}</small>
        <span>{t.story.text}</span>
      </p>

      <ol className="building-loop" aria-label="How I build, in 4 steps">
        {t.loop.map((s) => (
          <li key={s.title}>
            <b>{s.title}</b>
            <span>{s.text}</span>
          </li>
        ))}
      </ol>
      <p className="building-why">
        <b>{t.why.lead}</b> {t.why.text}
      </p>

      <div className={`grid gap-5 ${up ? "lg:grid-cols-2" : ""}`}>
        <div className="building-panel edge-card flex flex-col gap-5 rounded-3xl p-6 sm:p-8">
          <h3 className="text-lg font-semibold">{t.checks.title}</h3>
          <p className="flex items-baseline gap-3">
            <span className="building-figure tabular-nums">{fmt(data.ci.last30.passed)}</span>
            <span className="text-muted-foreground">{t.checks.unit(fmt(data.ci.last30.runs))}</span>
          </p>
          <span
            className="building-strip"
            role="img"
            aria-label={`Last ${data.ci.last60.length} runs: ${data.ci.last60.filter((r) => r === "ok").length} green, ${data.ci.last60.filter((r) => r === "fail").length} red`}
          >
            {data.ci.last60.map((r, i) => (
              <i key={i} data-fail={r === "fail" ? "" : undefined} />
            ))}
          </span>
          <p className="text-sm text-muted-foreground">{t.checks.note}</p>
        </div>
        {up && (
          <div className="building-panel edge-card flex flex-col gap-5 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="building-chip is-green">{t.uptime.chip}</span>
              <h3 className="text-lg font-semibold">{t.uptime.title}</h3>
            </div>
            <p className="flex items-baseline gap-3">
              <span className="building-figure tabular-nums">{up.pct.toFixed(2)}%</span>
              <span className="text-muted-foreground">{t.uptime.unit(up.days.length)}</span>
            </p>
            <span className="building-uptime" role="img" aria-label={up.days.map((d) => `${monthDay(d.date)} ${d.pct}%`).join(", ")}>
              {up.days.map((d) => (
                <i key={d.date} data-s={d.pct >= 99.9 ? "full" : d.pct >= 99 ? "dip" : "down"} title={`${monthDay(d.date)}: ${d.pct}%`} />
              ))}
            </span>
            <p className="text-sm text-muted-foreground">{t.uptime.note(up.checkEverySeconds)}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function ShippedLately({ data }: { data: LiveData }) {
  if (!data.milestones.length) return null;
  return (
    <section aria-labelledby="building-shipped" className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className={eyebrow}>{copy.shipped.eyebrow}</p>
        <h2 id="building-shipped" className="text-3xl font-semibold text-balance sm:text-4xl">
          {copy.shipped.heading}
        </h2>
      </div>
      <ol className="building-timeline">
        {data.milestones.map((m) => (
          <li key={`${m.date}${m.project}${m.text}`}>
            <time dateTime={m.date} className="tabular-nums">
              {monthDay(m.date)}
            </time>
            <span className="building-timeline-project">{m.project}</span>
            <span>{m.text}</span>
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted-foreground">{copy.shipped.note}</p>
    </section>
  );
}

const MIX_TONE: Record<string, string> = {
  Python: "var(--brand)",
  "TypeScript & React": "var(--sky)",
  CSS: "var(--award)",
  SQL: "var(--success)",
  Other: "var(--muted-foreground)",
};

export function BuiltWith({ data }: { data: LiveData }) {
  return (
    <section aria-labelledby="building-tools" className="building-tools edge-card flex flex-col gap-8 rounded-[2rem] p-6 sm:p-9">
      <div className="flex flex-col gap-3">
        <p className={eyebrow}>{copy.tools.eyebrow}</p>
        <h2 id="building-tools" className="text-3xl font-semibold text-balance sm:text-4xl">
          {copy.tools.heading}
        </h2>
        <p className="max-w-2xl text-lg text-muted-foreground">{copy.tools.lede}</p>
      </div>
      {data.codeMix.length > 0 && (
        <div className="flex flex-col gap-4">
          <span className="building-mix" role="img" aria-label={data.codeMix.map((m) => `${m.label} ${m.pct}%`).join(", ")}>
            {data.codeMix.map((m) => (
              <i key={m.label} style={{ "--w": `${m.pct}%`, "--c": MIX_TONE[m.label] ?? MIX_TONE.Other } as React.CSSProperties} />
            ))}
          </span>
          <p aria-hidden="true" className="building-mix-legend">
            {data.codeMix.map((m) => (
              <span key={m.label} style={{ "--c": MIX_TONE[m.label] ?? MIX_TONE.Other } as React.CSSProperties}>
                {m.label} <b className="tabular-nums">{m.pct}%</b>
              </span>
            ))}
          </p>
        </div>
      )}
      <ul className="building-tool-chips">
        {data.tools.map((tool) => (
          <li key={tool.name}>
            {tool.name}
            {tool.isNew && <b>{copy.tools.isNew}</b>}
          </li>
        ))}
      </ul>
      <p className="border-t border-white/10 pt-6 text-sm text-muted-foreground">{copy.footer}</p>
    </section>
  );
}
