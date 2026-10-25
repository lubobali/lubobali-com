"use client";

import "./blueprint-flow.css";
import "./blueprint.css";
import "./copy.css";
import "./examples.css";
import "./tool.css";

import Link from "next/link";
import type { DataLocation, TeamSize } from "./client";

// Step 1: the visitor's story + 2 taps (Phase 3b B5.1). A real <form> with
// labels and radio groups (keyboard + screen readers), styled as pills.
// The hidden "website" field is a bot trap: people never see or fill it.

export const MIN_STORY = 20;
export const MAX_STORY = 1200;

const PLACES: { value: DataLocation; label: string }[] = [
  { value: "spreadsheets", label: "Spreadsheets" },
  { value: "database", label: "A database" },
  { value: "crm_or_saas", label: "Inside apps (CRM, Shopify…)" },
  { value: "documents", label: "Documents & PDFs" },
  { value: "not_sure", label: "Not sure" },
];
const TEAMS: TeamSize[] = ["1-10", "11-50", "51-200", "200+"];

export type Draft = { story: string; data_location: DataLocation | null; team_size: TeamSize | null };

export function StartForm({
  draft,
  onChange,
  onSubmit,
  trapRef,
}: {
  draft: Draft;
  onChange: (d: Draft) => void;
  onSubmit: () => void;
  trapRef: React.RefObject<HTMLInputElement | null>;
}) {
  const length = draft.story.trim().length;
  const ready = length >= MIN_STORY && length <= MAX_STORY && draft.data_location && draft.team_size;
  return (
    <form
      className="bpt-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) onSubmit();
      }}
    >
      <label className="bpt-field">
        <span className="bpt-q">Your problem, in your own words</span>
        <span className="bpt-hint">2–3 sentences: how it works today, what is slow or painful, what you want instead.</span>
        <textarea
          className="bpt-story"
          data-track-box="blueprint story"
          rows={5}
          maxLength={MAX_STORY}
          required
          placeholder="e.g. We have 40 trucks. Every Monday our office manager copies fuel and route data from 3 spreadsheets into one report for the owner…"
          value={draft.story}
          onChange={(e) => onChange({ ...draft, story: e.target.value })}
        />
        <span className="bpt-count" aria-live="polite">
          {length < MIN_STORY ? `${MIN_STORY - length} more characters` : `${length} / ${MAX_STORY}`}
        </span>
      </label>

      <fieldset className="bpt-field">
        <legend className="bpt-q">Where does your data live today?</legend>
        <div className="bpt-pills">
          {PLACES.map((p) => (
            <label key={p.value} className="bpt-pill">
              <input
                type="radio"
                name="data_location"
                value={p.value}
                checked={draft.data_location === p.value}
                onChange={() => onChange({ ...draft, data_location: p.value })}
              />
              <span>{p.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="bpt-field">
        <legend className="bpt-q">How many people on your team?</legend>
        <div className="bpt-pills">
          {TEAMS.map((t) => (
            <label key={t} className="bpt-pill">
              <input
                type="radio"
                name="team_size"
                value={t}
                checked={draft.team_size === t}
                onChange={() => onChange({ ...draft, team_size: t })}
              />
              <span>{t.replace("-", "–")}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Bot trap: hidden from people and screen readers. */}
      <input ref={trapRef} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="bpt-trap" />

      <p className="bpt-privacy">
        Please describe it in general terms: no customer data or passwords. What you type is saved without your name,
        so I can learn what people need. Emails and phone numbers are removed.{" "}
        <Link href="/blueprint#your-data" className="underline underline-offset-4">
          How I handle your data <span aria-hidden="true">→</span>
        </Link>
      </p>
      <div className="bpt-actions">
        <button type="submit" className="bpt-go" disabled={!ready}>
          Continue <span aria-hidden="true">→</span>
        </button>
        <span className="bpt-small">Free · about 1 minute · one blueprint per visitor</span>
      </div>
    </form>
  );
}
