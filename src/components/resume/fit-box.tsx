"use client";

import "./resume.css";

import { type CSSProperties, type FormEvent, useEffect, useRef, useState } from "react";
import { fitCopy } from "@/lib/fit/copy";
import { type FitProof, type FitResult, type FitSource, matchFit } from "@/lib/fit/match";
import { FIT_TERMS } from "@/lib/fit/terms";
import { resumePage } from "@/lib/resume-page";

// "Does Lubo fit your project?" (Phase 6, P6.7): the box at the top of
// /resume. Matching runs here in the browser (lib/fit/match.ts); nothing
// typed is sent or saved, and typed text never goes into the URL (review
// 2026-10-24: a URL lands in history and logs). Only Lubo's own "Try"
// words and the skill bars use ?fit=..., so a link can open with an answer.
// The proof list (sources) comes from the server HTML.

const SHARE_MAX = 120; // characters read from ?fit=
const STAGGER_MAX = 12; // rows that arrive one by one; the rest arrive together
const PROOF_SHOWN = 3;
// "Kubernetes" from "Kubernetes", "Azure" from "Azure"; long labels keep
// their first part ("Running models yourself (vLLM, GPUs)" -> "Running models yourself").
const shortName = (label: string) => label.replace(/\s*\(.*\)$/, "");

function ProofLinks({ proof }: { proof: readonly FitProof[] }) {
  const more = proof.length - PROOF_SHOWN;
  return (
    <span className="fit-proof">
      {proof.slice(0, PROOF_SHOWN).map((p) => (
        <a key={`${p.kind}:${p.id}`} href={p.href} className="fit-chip">
          {p.title}
        </a>
      ))}
      {more > 0 && <span className="fit-more">+{more} more</span>}
    </span>
  );
}

function Ring({ found, total }: { found: number; total: number }) {
  const c = 2 * Math.PI * 26;
  const share = total ? found / total : 0;
  return (
    <svg className="fit-ring" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="26" className="fit-ring-track" />
      <circle cx="32" cy="32" r="26" className="fit-ring-fill" strokeDasharray={`${share * c} ${c}`} transform="rotate(-90 32 32)" />
      <text x="32" y="36" textAnchor="middle" className="fit-ring-text">
        {found}/{total}
      </text>
    </svg>
  );
}

// Nothing proven yet: no "0/1" (reads like failing). A half-full sky ring
// with the same mark as the rows: same kind of work, a different tool.
function SameWorkRing() {
  const c = 2 * Math.PI * 26;
  return (
    <svg className="fit-ring fit-ring--new" viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="26" className="fit-ring-track" />
      <circle cx="32" cy="32" r="26" className="fit-ring-fill" strokeDasharray={`${c / 2} ${c}`} transform="rotate(-90 32 32)" />
      <circle cx="32" cy="32" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M32 23a9 9 0 0 1 0 18z" fill="currentColor" />
    </svg>
  );
}

export function FitBox(props: {
  sources: readonly FitSource[];
  systems: number;
  industries: string;
  availability: string;
  bookUrl: string;
}) {
  const { sources, bookUrl } = props;
  const [text, setText] = useState("");
  const [result, setResult] = useState<FitResult | null>(null);
  const summaryRef = useRef<HTMLParagraphElement>(null);

  // Never let one odd input break the page: a failed match shows nothing.
  const run = (v: string): FitResult | null => {
    try {
      return matchFit(v, FIT_TERMS, sources);
    } catch {
      return null;
    }
  };
  const check = (value: string, share: boolean) => {
    const v = value.trim();
    if (!v) return;
    setResult(run(v));
    const url = new URL(window.location.href);
    if (share) url.searchParams.set("fit", v);
    else url.searchParams.delete("fit");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  };

  // A shared link (/resume?fit=...) opens with its answer.
  useEffect(() => {
    const shared = new URLSearchParams(window.location.search).get("fit")?.slice(0, SHARE_MAX);
    if (!shared) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setText(shared);
    setResult(run(shared));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources]);

  // New answer: move focus to it, so keyboards and screen readers land there.
  useEffect(() => {
    if (result) summaryRef.current?.focus({ preventScroll: false });
  }, [result]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    check(text, false);
  };
  const tryWith = (value: string, share = true) => {
    setText(value);
    check(value, share);
  };

  return (
    <div className="fit-box edge-card rounded-[2rem] p-5 sm:p-8">
      <form onSubmit={submit} className="flex flex-col gap-3">
        <label htmlFor="fit-text" className="font-semibold">
          Your project or job post
        </label>
        <textarea
          id="fit-text"
          className="fit-text"
          data-track-box="fit box"
          rows={4}
          maxLength={20_000}
          placeholder={fitCopy.placeholder}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setResult(null); // an old answer never sits under new text
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              check(text, false);
            }
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="submit" className="fit-go" disabled={!text.trim()}>
            {fitCopy.button}
          </button>
          <span className="text-sm text-muted-foreground">{resumePage.tryLabel}</span>
          {resumePage.tries.map((t) => (
            <button key={t} type="button" className="fit-try" onClick={() => tryWith(t)}>
              {t}
            </button>
          ))}
          <button type="button" className="fit-try" onClick={() => tryWith(resumePage.sample, false)}>
            {resumePage.sampleLabel}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">{fitCopy.privacy}</p>
      </form>

      {result && (
        <div className="fit-result" key={JSON.stringify(result.needs.map((n) => n.id))}>
          <div className="fit-head">
            {result.found > 0 ? <Ring found={result.found} total={result.total} /> : result.total > 0 && <SameWorkRing />}
            <div className="flex flex-col gap-1">
              {/* Focus moves here (no role="status": it would be read twice). */}
              <p ref={summaryRef} tabIndex={-1} className="fit-summary">
                {fitCopy.summary(
                  result.found,
                  result.total,
                  result.needs.filter((n) => n.status === "new").map((n) => ({ name: shortName(n.shown), miss: n.miss })),
                  result.topics.length,
                )}
              </p>
              {result.total > 0 && <p className="text-sm text-muted-foreground">{fitCopy.breadth(props.systems, props.industries)}</p>}
            </div>
          </div>
          {result.total > 0 && (
          <ul className="fit-list">
            {result.needs.map((n, i) => (
              <li key={n.id} className="fit-need" data-status={n.status} style={{ "--i": Math.min(i, STAGGER_MAX) } as CSSProperties}>
                <span className="fit-mark" aria-hidden="true">
                  {n.status === "yes" ? (
                    "✓"
                  ) : (
                    // Half full: a new tool, the same kind of work already done.
                    <svg viewBox="0 0 16 16" width="14" height="14">
                      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" />
                    </svg>
                  )}
                </span>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <span className="fit-label">
                    {n.shown}
                    <span className="sr-only">{n.status === "yes" ? ": proven" : `: ${fitCopy.miss[n.miss]}`}</span>
                  </span>
                  {n.status === "yes" ? (
                    <span className="fit-line">
                      <span className="text-muted-foreground">{fitCopy.proven}</span> <ProofLinks proof={n.proof} />
                    </span>
                  ) : (
                    <>
                      <span className="fit-line text-muted-foreground">{fitCopy.miss[n.miss]}</span>
                      {n.closest.length > 0 && (
                        <span className="fit-line">
                          <span className="text-muted-foreground">{fitCopy.closest[n.miss]}</span>{" "}
                          <span className="fit-proof">
                            {n.closest.map((c) => (
                              <a key={c.id} href={c.proof[0].href} className="fit-chip">
                                {shortName(c.label)}
                              </a>
                            ))}
                          </span>
                        </span>
                      )}
                      <a href={bookUrl} target="_blank" rel="noopener" className="fit-ask">
                        {fitCopy.ask(n.miss, shortName(n.shown))} →<span className="sr-only"> (opens Calendly in a new tab)</span>
                      </a>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
          )}
          {result.topics.length > 0 && (
            <ul className="fit-topics">
              {result.topics.map((t) => (
                <li key={t}>{t === "availability" ? fitCopy.topics.availability(props.availability) : fitCopy.topics[t]}</li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground">{fitCopy.limits}</p>
        </div>
      )}
    </div>
  );
}
