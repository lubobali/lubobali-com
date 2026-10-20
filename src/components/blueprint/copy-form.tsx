"use client";

import { useState } from "react";
import type { Blueprint } from "./types";

// "Email me the PDF" under the visitor's OWN blueprint (Phase 3b B7, Lubo:
// the only way to keep the file is to give an email). The blueprint itself
// is never gated. Honest line about follow-up (Lubo: nothing that tricks
// them). The server sends the PDF to them and the lead to Lubo; nothing
// is stored. Styles: tool.css (.bpt-copy).
type State = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; to: string } | { kind: "error"; message: string };

export function CopyForm({ bp }: { bp: Blueprint }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/blueprint/copy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ blueprint: bp, email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setState({ kind: "sent", to: email.trim() });
      else setState({ kind: "error", message: data.message ?? "Something went wrong. Please try again." });
    } catch {
      setState({ kind: "error", message: "We couldn't reach the server. Please try again." });
    }
  }

  if (state.kind === "sent") {
    return (
      <p className="bpt-copy-done" role="status">
        Sent to <strong>{state.to}</strong>. Check your inbox (and the spam folder, just in case).
      </p>
    );
  }

  return (
    <form className="bpt-copy" onSubmit={send}>
      <label className="bpt-copy-label" htmlFor="bpt-copy-email">
        Want to keep it? Get it as a PDF.
      </label>
      <div className="bpt-copy-row">
        <input
          id="bpt-copy-email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          placeholder="you@company.com"
          className="bpt-own"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="bpt-go" disabled={state.kind === "sending"}>
          {state.kind === "sending" ? "Sending…" : "Email me the PDF"}
        </button>
      </div>
      {state.kind === "error" && (
        <p className="bpt-copy-error" role="alert">
          {state.message}
        </p>
      )}
      <p className="bpt-small">I&apos;ll send your PDF and may follow up once, personally. No newsletter.</p>
    </form>
  );
}
