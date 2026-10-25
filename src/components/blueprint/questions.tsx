"use client";

import "./blueprint-flow.css";
import "./blueprint.css";
import "./copy.css";
import "./examples.css";
import "./tool.css";

import type { Question } from "./client";

// Step 2: the follow-up questions, like on a call (Phase 3b B5.1). Each one
// has tap answers plus "your own words". All optional: "Skip" draws the
// blueprint from the story alone.

export function Questions({
  questions,
  answers,
  onAnswer,
  onDone,
  headingRef,
}: {
  questions: Question[];
  answers: Record<number, string>;
  onAnswer: (index: number, value: string) => void;
  onDone: (skip: boolean) => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <form
      className="bpt-form"
      onSubmit={(e) => {
        e.preventDefault();
        onDone(false);
      }}
    >
      <div>
        <h3 ref={headingRef} tabIndex={-1} className="bpt-title">
          A few quick questions
        </h3>
        <p className="bpt-hint">Like on a call. Tap an answer or write your own.</p>
      </div>
      <ol className="bpt-chat">
        {questions.map((q, i) => (
          <li key={q.question} className="bpt-bubble" style={{ "--i": i } as React.CSSProperties}>
            <fieldset>
              <legend className="bpt-q">{q.question}</legend>
              {q.options.length > 0 && (
                <div className="bpt-pills">
                  {q.options.map((o) => (
                    <label key={o} className="bpt-pill">
                      <input
                        type="radio"
                        name={`q${i}`}
                        value={o}
                        checked={answers[i] === o}
                        onChange={() => onAnswer(i, o)}
                      />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              )}
              <input
                type="text"
                className="bpt-own"
                data-track-box="blueprint answer"
                maxLength={300}
                placeholder="Or in your own words…"
                aria-label={`Your own answer: ${q.question}`}
                value={q.options.includes(answers[i] ?? "") ? "" : (answers[i] ?? "")}
                onChange={(e) => onAnswer(i, e.target.value)}
              />
            </fieldset>
          </li>
        ))}
      </ol>
      <div className="bpt-actions">
        <button type="submit" className="bpt-go">
          Draw my blueprint <span aria-hidden="true">→</span>
        </button>
        <button type="button" className="bpt-skip" onClick={() => onDone(true)}>
          Skip the questions
        </button>
      </div>
    </form>
  );
}
