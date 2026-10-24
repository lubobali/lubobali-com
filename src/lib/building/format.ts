// Pure helpers for /building (Phase 7). No "@/" imports, so Node tests run
// this file directly. All dates are Chicago days: the job counts work that
// way, and the page says "CT" next to the time.

const TZ = "America/Chicago";
const ACTIVE_DAYS = 2; // the live dot pulses if the last ship is this recent

const chicagoDay = (iso: string): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

const daysBetween = (a: string, b: string): number => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

const shortDate = (day: string): string =>
  new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" }).format(new Date(`${day}T00:00:00Z`));

/** "Updated Oct 24, 5:00 AM CT" */
export function updatedLabel(generatedAt: string): string {
  const d = new Date(generatedAt);
  const date = new Intl.DateTimeFormat("en-US", { timeZone: TZ, month: "short", day: "numeric" }).format(d);
  const time = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" }).format(d);
  return `Updated ${date}, ${time} CT`;
}

/** "Shipped today" / "Shipped yesterday" / "Last shipped Oct 20" */
export function shippedLabel(lastShipped: string, generatedAt: string): string {
  const gap = daysBetween(lastShipped, chicagoDay(generatedAt));
  if (gap <= 0) return "Shipped today";
  if (gap === 1) return "Shipped yesterday";
  return `Last shipped ${shortDate(lastShipped)}`;
}

export const isActive = (lastShipped: string, generatedAt: string): boolean =>
  daysBetween(lastShipped, chicagoDay(generatedAt)) <= ACTIVE_DAYS;

export type HeatCell = { date: string; count: number } | null;

/** Year map: columns of Monday..Sunday, padded with nulls at both ends. */
export function heatWeeks(start: string, days: readonly number[]) {
  const first = new Date(`${start}T00:00:00Z`);
  const lead = (first.getUTCDay() + 6) % 7; // Monday = 0
  const cells: HeatCell[] = [...Array(lead).fill(null)];
  days.forEach((count, i) => {
    const d = new Date(first.getTime() + i * 86_400_000);
    cells.push({ date: d.toISOString().slice(0, 10), count });
  });
  while (cells.length % 7) cells.push(null);
  const weeks: HeatCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const months: { week: number; label: string }[] = [];
  weeks.forEach((week, w) => {
    const firstOfMonth = week.find((c) => c && c.date.endsWith("-01"));
    if (firstOfMonth) months.push({ week: w, label: shortDate(firstOfMonth.date).split(" ")[0] });
    else if (w === 0 && week.some(Boolean)) months.push({ week: 0, label: shortDate(week.find(Boolean)!.date).split(" ")[0] });
  });
  return { weeks, months };
}

/** 0 = no work; 1..4 = quarters of the busy days, so one huge day can't wash out the rest. */
export function heatLevels(days: readonly number[]): (count: number) => number {
  const busy = days.filter((n) => n > 0).toSorted((a, b) => a - b);
  const at = (q: number) => busy[Math.min(busy.length - 1, Math.floor(q * (busy.length - 1)))] ?? 0;
  const [q1, q2, q3] = [at(0.25), at(0.5), at(0.75)];
  return (count) => (count <= 0 ? 0 : count <= q1 ? 1 : count <= q2 ? 2 : count <= q3 ? 3 : 4);
}
