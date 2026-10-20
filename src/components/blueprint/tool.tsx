"use client";

import { useEffect, useRef, useState } from "react";
import { BookCall } from "@/components/book-call";
import { BlueprintCard } from "./card";
import { type Answer, askFollowups, makeBlueprint, type Question, saveBlueprint, savedBlueprint, ToolError, visitorId } from "./client";
import { Drawing } from "./drawing";
import { Questions } from "./questions";
import { type Draft, StartForm } from "./start-form";
import type { Blueprint } from "./types";

// The AI Project Blueprint tool (Phase 3b B5.1): story -> up to 3 questions
// -> waiting moment -> their blueprint. One per visitor: their browser
// keeps it, so they see it again later instead of the form. Every refusal
// shows the API's plain message and Book a call. Styles: tool.css.

type State =
  | { kind: "start"; notice?: string }
  | { kind: "reading" }
  | { kind: "questions"; questions: Question[]; ticket: string }
  | { kind: "drawing" }
  | { kind: "done"; bp: Blueprint; returning: boolean }
  | { kind: "error"; code: string; message: string };

const RESTARTABLE = new Set(["start_again", "try_again", "too_fast", "offline", "bad_input", "too_big"]);

export function BlueprintTool() {
  const [state, setState] = useState<State>({ kind: "start" });
  const [draft, setDraft] = useState<Draft>({ story: "", data_location: null, team_size: null });
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showSaved, setShowSaved] = useState(false);
  const opened = useRef(0);
  const trap = useRef<HTMLInputElement>(null);
  const questionsHeading = useRef<HTMLHeadingElement>(null);
  const result = useRef<HTMLDivElement>(null);

  useEffect(() => {
    opened.current = Date.now();
    const bp = savedBlueprint();
    // Restoring a saved blueprint from this browser after the first paint.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (bp) setState({ kind: "done", bp, returning: true });
  }, []);

  useEffect(() => {
    if (state.kind === "questions") questionsHeading.current?.focus();
    if (state.kind === "done" && !state.returning) {
      result.current?.focus();
      result.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state]);

  function common() {
    return {
      visitor_id: visitorId(),
      story: draft.story.trim(),
      data_location: draft.data_location!,
      team_size: draft.team_size!,
      website: trap.current?.value ?? "",
      elapsed_ms: Date.now() - opened.current,
    };
  }

  function fail(e: unknown) {
    const err = e instanceof ToolError ? e : new ToolError("try_again", "Something went wrong. Please try again.");
    const saved = savedBlueprint();
    if ((err.code === "already_have" || err.code === "ip_week") && saved) {
      setState({ kind: "done", bp: saved, returning: true });
    } else {
      setState({ kind: "error", code: err.code, message: err.message });
    }
  }

  async function start() {
    setState({ kind: "reading" });
    try {
      const r = await askFollowups(common());
      if (!r.story_ok || !r.ticket) {
        setState({
          kind: "start",
          notice: "That doesn't look like a business problem yet. Tell me about your work: what you do today and what slows you down.",
        });
      } else if (r.questions.length === 0) {
        await draw(r.ticket, []);
      } else {
        setAnswers({});
        setState({ kind: "questions", questions: r.questions, ticket: r.ticket });
      }
    } catch (e) {
      fail(e);
    }
  }

  async function draw(ticket: string, followups: Answer[]) {
    setState({ kind: "drawing" });
    try {
      const bp = await makeBlueprint({ ...common(), ticket, followups });
      saveBlueprint(bp);
      setState({ kind: "done", bp, returning: false });
    } catch (e) {
      fail(e);
    }
  }

  if (state.kind === "done" && state.returning && !showSaved) {
    // Returning visitor: a small line, not the whole card (Lubo 2026-10-20).
    return (
      <div className="award-card bpt bpt-saved rounded-3xl">
        <p className="bpt-ready">You already have your blueprint</p>
        <p className="bpt-saved-name">{state.bp.draft.app_name}</p>
        <button type="button" className="bpt-go" onClick={() => setShowSaved(true)}>
          Show my blueprint <span aria-hidden="true">→</span>
        </button>
      </div>
    );
  }

  if (state.kind === "done") {
    return (
      <div ref={result} tabIndex={-1} className="bpt-result" aria-label="Your AI blueprint">
        <p className="bpt-ready" role="status">
          {state.returning ? "Your blueprint, saved in this browser" : "Your blueprint is ready"}
        </p>
        <BlueprintCard bp={state.bp} />
      </div>
    );
  }

  return (
    <div className="award-card bpt rounded-3xl" aria-busy={state.kind === "reading" || state.kind === "drawing"}>
      {state.kind === "start" && (
        <>
          {state.notice && (
            <p className="bpt-notice" role="alert">
              {state.notice}
            </p>
          )}
          <StartForm draft={draft} onChange={setDraft} onSubmit={start} trapRef={trap} />
        </>
      )}
      {state.kind === "reading" && <Drawing mode="reading" />}
      {state.kind === "questions" && (
        <Questions
          questions={state.questions}
          answers={answers}
          onAnswer={(i, v) => setAnswers((a) => ({ ...a, [i]: v }))}
          headingRef={questionsHeading}
          onDone={(skip) =>
            draw(
              state.ticket,
              skip
                ? []
                : state.questions
                    .map((q, i) => ({ question: q.question, answer: (answers[i] ?? "").trim() }))
                    .filter((a) => a.answer),
            )
          }
        />
      )}
      {state.kind === "drawing" && <Drawing mode="drawing" />}
      {state.kind === "error" && (
        <div className="bpt-error" role="alert">
          <p>{state.message}</p>
          <div className="bpt-actions">
            {RESTARTABLE.has(state.code) && (
              <button type="button" className="bpt-skip" onClick={() => setState({ kind: "start" })}>
                Back to my story
              </button>
            )}
            <BookCall size="lg" />
          </div>
        </div>
      )}
    </div>
  );
}
