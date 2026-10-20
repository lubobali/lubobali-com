import type { Blueprint } from "./types";

// Talks to the Blueprint API (same domain, /api/blueprint/..., CSP
// connect-src 'self'). Also keeps the visitor's ID and their blueprint in
// their own browser (localStorage), so a returning visitor sees their
// blueprint again instead of the form. Storage can be blocked (private
// mode): every access is wrapped and the tool still works.

export type DataLocation = "spreadsheets" | "database" | "crm_or_saas" | "documents" | "not_sure";
export type TeamSize = "1-10" | "11-50" | "51-200" | "200+";
export type Question = { step: string; question: string; options: string[] };
export type Answer = { question: string; answer: string };
export type Start = { story: string; data_location: DataLocation; team_size: TeamSize };

/** A refusal from the API: a code + a plain message (or a network failure). */
export class ToolError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

const ID_KEY = "lb-blueprint-visitor";
const BP_KEY = "lb-blueprint";

function store(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function visitorId(): string {
  const s = store();
  try {
    const known = s?.getItem(ID_KEY);
    if (known) return known;
    const id = crypto.randomUUID();
    s?.setItem(ID_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function savedBlueprint(): Blueprint | null {
  try {
    const raw = store()?.getItem(BP_KEY);
    return raw ? (JSON.parse(raw) as Blueprint) : null;
  } catch {
    return null;
  }
}

export function saveBlueprint(bp: Blueprint): void {
  try {
    store()?.setItem(BP_KEY, JSON.stringify(bp));
  } catch {
    // Not saved: they still see it now.
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/blueprint/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ToolError("offline", "We couldn't reach the server. Please check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ToolError(
      data.code ?? "try_again",
      data.message ?? "Something went wrong on our side. Please try again in a minute, or book a free call.",
    );
  }
  return data as T;
}

type Common = Start & { visitor_id: string; website: string; elapsed_ms: number };

export function askFollowups(c: Common) {
  return post<{ story_ok: boolean; questions: Question[]; ticket: string | null }>("followups", c);
}

export function makeBlueprint(c: Common & { ticket: string; followups: Answer[] }) {
  return post<Blueprint>("generate", c);
}
