"use client";

import { useState } from "react";

// Copy button next to the email (H11). The address stays plain text and a
// mailto link, so it still works without JavaScript or where copy is
// blocked; the button only adds a shortcut. "Copied" is announced politely.
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard refused: the visible address can still be selected.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-md border border-award/30 px-2.5 py-1 text-xs font-medium text-award transition-colors hover:border-award/60 focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      <span className="sr-only"> email address</span>
    </button>
  );
}
