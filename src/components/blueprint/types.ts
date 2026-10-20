// The blueprint the backend returns (blueprint-api/blueprint/service.py
// build_blueprint). The AI wrote the words in `draft`; every number
// (readiness, timeline, time_saved) was computed by code.

export type Power = "decides" | "approves" | "does" | "uses" | "informed";

export type Blueprint = {
  version: 1;
  created: string;
  pattern: { id: string; title: string; promise: string };
  draft: {
    why: { problem: string; goal: string };
    old_flow: { label: string; tool: string; minutes: number | null; per: string | null; pain: boolean }[];
    players: { role: string; does: string; power: Power; money_share: string | null }[];
    users: { who: string; why: string };
    new_flow: { label: string }[];
    app_name: string;
    pattern: string;
    data_issues: string[];
    risks: { title: string; severity: "watch" | "fix_first" }[];
    questions_for_call: string[];
  };
  readiness: { score: number; reasons: string[] };
  timeline: { label: string; weeks_min: number; weeks_max: number; rounds: { label: string; weeks: number }[] };
  time_saved: { before_minutes: number; after_minutes: number; after_is_estimate: true } | null;
  locked: string[];
  signature?: string;
  // Short code for Calendly (utm_content), only on a visitor's own,
  // signed blueprint (B5.3). The example has none.
  code?: string;
};
