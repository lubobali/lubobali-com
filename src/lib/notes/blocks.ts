// Visual blocks inside a note (Phase 9 P9.5): a fenced block whose language
// is a block name, with YAML inside, becomes a designed part of the page:
//
//   ```stats                 ```bars
//   - { value: "12", ... }   title: "Cost per call"
//   ```                      rows: [{ label: "...", value: 0.096 }]
//
// Same rules as the rest of a note: the build fails on a broken block, all
// text is escaped (plain text only, no links), numbers are drawn to scale
// in code. Pure: no "@/" imports, so Node tests run it directly.
import { parse as parseYaml } from "yaml";
import { sayTerms } from "./terms";

export const BLOCK_TYPES = ["stats", "flow", "cards", "timeline", "callout", "bars", "claims"] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];
export const isBlock = (info: string): info is BlockType => (BLOCK_TYPES as readonly string[]).includes(info);

export const CLAIM_LABELS = ["BACKED BY A SOURCE", "PARTLY BACKED", "SOURCES SAY OTHERWISE", "UNVERIFIED"] as const;

// speech = how the block is read out loud in the Listen audio (plain sentences).
export type BlockResult = { html: string; texts: string[]; errors: string[]; speech: string[] };

type Row = Record<string, unknown>;
type Field = { key: string; optional?: boolean; number?: boolean; list?: boolean };

/** Say it the way people do: "$0.096" -> "9.6 cents", "$3" -> "3 dollars", "→" -> "to".
 *  Ends with a period, so the voice pauses. */
export function spoken(text: string): string {
  const s = sayTerms(text)
    .replace(/\$(\d+(?:\.\d+)?)/g, (_, n: string) => spokenMoney(Number(n)))
    .replace(/\s*→\s*/g, " to ")
    .replace(/\s+/g, " ")
    .trim();
  return !s || /[.!?:]$/.test(s) ? s : `${s}.`;
}
export function spokenMoney(v: number): string {
  if (v < 1) return `${Math.round(v * 1000) / 10} cents`;
  return `${Number.isInteger(v) ? v : v.toFixed(2)} dollars`;
}
const SAY_LABEL: Record<string, string> = {
  "BACKED BY A SOURCE": "Backed by a source",
  "PARTLY BACKED": "Partly backed",
  "SOURCES SAY OTHERWISE": "Sources say otherwise",
  UNVERIFIED: "Unverified",
};

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pad = (n: number): string => String(n).padStart(2, "0");
const asText = (v: unknown): string => (typeof v === "number" ? String(v) : typeof v === "string" ? v.trim() : "");

// Check one row against its fields; collect the text for the word count + privacy guard.
function row(type: string, r: unknown, fields: Field[], i: number, out: BlockResult): Row | null {
  if (!r || typeof r !== "object" || Array.isArray(r)) {
    out.errors.push(`${type}: item ${i + 1} must be { key: value } pairs`);
    return null;
  }
  const obj = r as Row;
  const known = fields.map((f) => f.key);
  for (const k of Object.keys(obj)) if (!known.includes(k)) out.errors.push(`${type}: item ${i + 1} has unknown field "${k}"`);
  for (const f of fields) {
    const v = obj[f.key];
    if (v === undefined) {
      if (!f.optional) out.errors.push(`${type}: item ${i + 1} needs "${f.key}"`);
    } else if (f.list) {
      continue; // checked by its own list()
    } else if (f.number) {
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0) out.errors.push(`${type}: "${f.key}" must be a number ≥ 0`);
    } else if (!asText(v)) out.errors.push(`${type}: "${f.key}" must be text`);
    else out.texts.push(asText(v));
  }
  return obj;
}

function list(type: string, data: unknown, fields: Field[], min: number, max: number, out: BlockResult): Row[] {
  if (!Array.isArray(data) || data.length < min || data.length > max) {
    out.errors.push(`${type}: needs a list of ${min}–${max} items`);
    return [];
  }
  return data.map((r, i) => row(type, r, fields, i, out)).filter((r): r is Row => r !== null);
}

const t = (r: Row, k: string): string => esc(asText(r[k]));

function money(value: number, unit: string): string {
  if (unit === "$") return `$${value.toFixed(value < 1 ? 3 : 2)}`;
  return unit ? `${value} ${esc(unit)}` : String(value);
}

const RENDER: Record<BlockType, (data: unknown, out: BlockResult) => string> = {
  stats(data, out) {
    const rows = list("stats", data, [{ key: "value" }, { key: "label" }], 2, 6, out);
    for (const r of rows) out.speech.push(spoken(`${asText(r.value)} ${asText(r.label)}`));
    return `<ul class="nb-stats">${rows
      .map((r) => `<li class="nb-stat"><span class="nb-stat-value">${t(r, "value")}</span><span class="nb-stat-label">${t(r, "label")}</span></li>`)
      .join("")}</ul>`;
  },
  flow(data, out) {
    const rows = list("flow", data, [{ key: "label" }, { key: "detail", optional: true }], 2, 7, out);
    rows.forEach((r, i) => out.speech.push(spoken(`Step ${i + 1}: ${asText(r.label)}${r.detail ? `, ${asText(r.detail)}` : ""}`)));
    return `<ol class="nb-flow">${rows
      .map(
        (r, i) =>
          `<li class="nb-flow-step"><span class="nb-flow-n">${pad(i + 1)}</span><span class="nb-flow-label">${t(r, "label")}</span>${
            r.detail ? `<span class="nb-flow-detail">${t(r, "detail")}</span>` : ""
          }</li>`,
      )
      .join("")}</ol>`;
  },
  cards(data, out) {
    const rows = list("cards", data, [{ key: "title" }, { key: "text" }], 2, 6, out);
    for (const r of rows) out.speech.push(`${spoken(asText(r.title))} ${spoken(asText(r.text))}`);
    return `<ul class="nb-cards">${rows
      .map(
        (r, i) =>
          `<li class="nb-card"><span class="nb-card-n">${pad(i + 1)}</span><p class="nb-card-title">${t(r, "title")}</p><p class="nb-card-text">${t(r, "text")}</p></li>`,
      )
      .join("")}</ul>`;
  },
  timeline(data, out) {
    const rows = list("timeline", data, [{ key: "time" }, { key: "title" }, { key: "text" }], 1, 6, out);
    for (const r of rows) out.speech.push(`${spoken(`${asText(r.time)}: ${asText(r.title)}`)} ${spoken(asText(r.text))}`);
    return `<ol class="nb-timeline">${rows
      .map(
        (r) =>
          `<li class="nb-tl-item"><span class="nb-tl-time">${t(r, "time")}</span><p class="nb-tl-title">${t(r, "title")}</p><p class="nb-tl-text">${t(r, "text")}</p></li>`,
      )
      .join("")}</ol>`;
  },
  callout(data, out) {
    const r = row("callout", data, [{ key: "title" }, { key: "text" }], 0, out);
    if (r) out.speech.push(`${spoken(`${asText(r.title)}:`)} ${spoken(asText(r.text))}`);
    return r ? `<aside class="nb-callout"><p class="nb-callout-title">${t(r, "title")}</p><p class="nb-callout-text">${t(r, "text")}</p></aside>` : "";
  },
  bars(data, out) {
    const head = row("bars", data, [{ key: "title" }, { key: "unit", optional: true }, { key: "note", optional: true }, { key: "rows", list: true }], 0, out);
    if (!head) return "";
    const rows = list("bars", head.rows, [{ key: "label" }, { key: "value", number: true }], 1, 10, out);
    const values = rows.map((r) => (typeof r.value === "number" ? r.value : 0));
    const max = Math.max(...values, 0);
    const unit = asText(head.unit);
    // Width in %, computed here (never by hand or by a model).
    const width = (v: number) => (max > 0 ? Math.round((v / max) * 1000) / 10 : 0);
    out.speech.push(spoken(asText(head.title)));
    rows.forEach((r, i) =>
      out.speech.push(spoken(`${asText(r.label)}: ${unit === "$" ? spokenMoney(values[i]) : `${values[i]} ${unit}`.trim()}`)),
    );
    if (head.note) out.speech.push(spoken(asText(head.note)));
    return `<figure class="nb-bars"><figcaption class="nb-bars-title">${t(head, "title")}</figcaption><ul class="nb-bars-list">${rows
      .map(
        (r, i) =>
          `<li class="nb-bar-row"><span class="nb-bar-label">${t(r, "label")}</span><span class="nb-bar-track"><span class="nb-bar" style="--w:${width(values[i])}%"></span></span><span class="nb-bar-value">${money(values[i], unit)}</span></li>`,
      )
      .join("")}</ul>${head.note ? `<p class="nb-bars-note">${t(head, "note")}</p>` : ""}</figure>`;
  },
  claims(data, out) {
    const rows = list("claims", data, [{ key: "label" }, { key: "claim" }, { key: "quote", optional: true }, { key: "verdict" }], 1, 4, out);
    for (const r of rows)
      if (!CLAIM_LABELS.includes(asText(r.label) as (typeof CLAIM_LABELS)[number]))
        out.errors.push(`claims: label must be one of ${CLAIM_LABELS.join(", ")}`);
    for (const r of rows)
      out.speech.push(
        [
          `${SAY_LABEL[asText(r.label)] ?? asText(r.label)}: ${spoken(asText(r.claim))}`,
          r.quote ? `The quote: ${spoken(asText(r.quote))}` : "",
          `What the evidence says: ${spoken(asText(r.verdict))}`,
        ]
          .filter(Boolean)
          .join(" "),
      );
    const pill = (label: string) => label.toLowerCase().replace(/[^a-z]+/g, "-");
    return `<div class="nb-claims"><p class="nb-claims-head">From a real AI Radar email</p>${rows
      .map(
        (r) =>
          `<div class="nb-claim"><span class="nb-pill nb-pill--${pill(asText(r.label))}">${t(r, "label")}</span><p class="nb-claim-text">“${t(r, "claim")}”</p>${
            r.quote ? `<p class="nb-claim-quote">Quote: “${t(r, "quote")}”</p>` : ""
          }<p class="nb-claim-verdict"><span>What the evidence says:</span> ${t(r, "verdict")}</p></div>`,
      )
      .join("")}</div>`;
  },
};

export function renderBlock(type: BlockType, yaml: string): BlockResult {
  const out: BlockResult = { html: "", texts: [], errors: [], speech: [] };
  let data: unknown;
  try {
    data = parseYaml(yaml, { uniqueKeys: true, schema: "core" });
  } catch (err) {
    out.errors.push(`${type}: YAML ${String((err as Error).message).split("\n")[0]}`);
    return out;
  }
  out.html = RENDER[type](data, out);
  return out;
}
