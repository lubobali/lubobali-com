// Data for /building (Phase 7). A private daily job on the server writes
// live.json from real sources (git, CI, uptime); this file is the site's
// side of that contract. live.schema.json is the one source of truth: the
// job validates against it before writing, and checkLive() validates again
// before the page is built, using the same schema, so the two can't drift.

export type LiveData = {
  version: 1;
  sample: boolean; // true = the fake fixture; never deployed (P7.9)
  generatedAt: string; // UTC, "2026-10-24T10:00:00Z"
  lastShipped: string; // "YYYY-MM-DD", Chicago time
  year: { start: string; days: number[]; total: number; activeDays: number; longestStreak: number; projects: number };
  building: { name: string; kind: "public" | "client"; what: string; weekUpdates: number; weeks: number[] }[];
  tests: { total: number; allGreen: boolean; projects: { name: string; count: number }[] };
  ci: { since: string; runs: number; green: number; stopped: number; last30: { runs: number; passed: number }; last60: ("ok" | "fail")[] };
  uptime: { pct: number; checkEverySeconds: number; days: { date: string; pct: number }[] } | null;
  milestones: { date: string; project: string; text: string }[];
  codeMix: { label: string; pct: number }[];
  tools: { name: string; isNew: boolean }[];
};

type Schema = {
  $ref?: string;
  $defs?: Record<string, Schema>;
  type?: string;
  const?: unknown;
  enum?: unknown[];
  oneOf?: Schema[];
  required?: string[];
  properties?: Record<string, Schema>;
  additionalProperties?: boolean;
  items?: Schema;
  minItems?: number;
  maxItems?: number;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
};

const typeOf = (v: unknown): string =>
  v === null ? "null" : Array.isArray(v) ? "array" : Number.isInteger(v) ? "integer" : typeof v;

// The small part of JSON Schema that live.schema.json uses. Returns every
// problem as "path: what's wrong" (empty = valid). No library: the site
// stays dependency-free and this runs at build time only.
export function checkLive(root: Schema, data: unknown): string[] {
  const errors: string[] = [];
  const check = (node: Schema, v: unknown, path: string): void => {
    const s = node.$ref ? root.$defs![node.$ref.split("/").at(-1)!] : node;
    const at = path || "(root)";
    if (s.oneOf) {
      if (!s.oneOf.some((alt) => checkLive({ ...root, ...alt }, v).length === 0)) errors.push(`${at}: matches no allowed shape`);
      return;
    }
    if ("const" in s && v !== s.const) errors.push(`${at}: must be ${JSON.stringify(s.const)}`);
    if (s.enum && !s.enum.includes(v)) errors.push(`${at}: must be one of ${s.enum.join(", ")}`);
    const t = typeOf(v);
    if (s.type && !(t === s.type || (s.type === "number" && t === "integer"))) {
      errors.push(`${at}: must be ${s.type}, got ${t}`);
      return;
    }
    if (typeof v === "number") {
      if (s.minimum !== undefined && v < s.minimum) errors.push(`${at}: below ${s.minimum}`);
      if (s.maximum !== undefined && v > s.maximum) errors.push(`${at}: above ${s.maximum}`);
    }
    if (typeof v === "string") {
      if (s.minLength !== undefined && v.length < s.minLength) errors.push(`${at}: too short`);
      if (s.maxLength !== undefined && v.length > s.maxLength) errors.push(`${at}: longer than ${s.maxLength}`);
      if (s.pattern && !new RegExp(s.pattern).test(v)) errors.push(`${at}: wrong format`);
    }
    if (Array.isArray(v)) {
      if (s.minItems !== undefined && v.length < s.minItems) errors.push(`${at}: fewer than ${s.minItems} items`);
      if (s.maxItems !== undefined && v.length > s.maxItems) errors.push(`${at}: more than ${s.maxItems} items`);
      if (s.items) v.forEach((item, i) => check(s.items!, item, `${path}.${i}`));
    }
    if (t === "object" && s.properties) {
      const obj = v as Record<string, unknown>;
      for (const key of s.required ?? []) if (!(key in obj)) errors.push(`${path ? `${path}.` : ""}${key}: missing`);
      for (const [key, value] of Object.entries(obj)) {
        const sub = s.properties[key];
        const p = path ? `${path}.${key}` : key;
        if (sub) check(sub, value, p);
        else if (s.additionalProperties === false) errors.push(`${p}: not allowed`);
      }
    }
  };
  check(root, data, "");
  return errors;
}
