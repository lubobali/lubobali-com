"use client";

import "./blueprint-flow.css";
import "./blueprint.css";
import "./copy.css";
import "./examples.css";
import "./tool.css";

import { useEffect, useRef, useState } from "react";
import { BlueprintCard } from "./card";
import { EXAMPLE_META, type ExampleKey } from "./examples/meta";
import { LOAD_EXAMPLE } from "./examples/lazy";
import { BlueprintTool } from "./tool";
import type { Blueprint } from "./types";

// Home page layout (Lubo 2026-10-20): one row of 6 example chips (icon +
// text) ABOVE the form. A chip opens that example in place of the form,
// with Close + "Make my own blueprint"; the form keeps what was typed
// (hidden, not removed). Each example's data loads on its first click,
// so the page stays as light as before. Styles: examples.css (.bpx-row).
export function BlueprintWithExamples() {
  const [open, setOpen] = useState<ExampleKey | null>(null);
  const [bp, setBp] = useState<Blueprint | null>(null);
  const bar = useRef<HTMLParagraphElement>(null);
  const form = useRef<HTMLDivElement>(null);
  const meta = EXAMPLE_META.find((m) => m.key === open);

  useEffect(() => {
    if (open) bar.current?.focus();
  }, [open]);

  function choose(key: ExampleKey) {
    setOpen(key);
    setBp(null);
    LOAD_EXAMPLE[key]()
      .then(setBp)
      .catch(() => setOpen(null));
  }

  function close() {
    setOpen(null);
    // Back to the form, ready to type.
    requestAnimationFrame(() => form.current?.querySelector<HTMLElement>("textarea, h3, button")?.focus());
  }

  return (
    <div className="bpx-home">
      <div className="bpx-row" role="group" aria-label="See an example blueprint">
        <span className="bpx-row-label">See an example:</span>
        {EXAMPLE_META.map((m) => (
          <button
            key={m.key}
            type="button"
            className="bpx-tab"
            aria-pressed={open === m.key}
            data-on={open === m.key || undefined}
            onClick={() => (open === m.key ? close() : choose(m.key))}
          >
            <span aria-hidden="true">{m.icon}</span> {m.label}
          </button>
        ))}
      </div>

      {open && meta && (
        <div className="bpx-open">
          <div className="bpx-open-bar">
            <p ref={bar} tabIndex={-1} className="bpx-open-title">
              <span className="bpx-row-label">Example:</span> <span aria-hidden="true">{meta.icon}</span> {meta.label}
            </p>
            <div className="bpx-open-actions">
              <button type="button" className="bpt-skip" onClick={close}>
                Close
              </button>
              <button type="button" className="bpt-go" onClick={close}>
                Make my own blueprint <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
          {bp ? (
            <BlueprintCard bp={bp} example />
          ) : (
            <p className="bpt-small" role="status">
              Loading the example…
            </p>
          )}
        </div>
      )}

      <div ref={form} hidden={open !== null}>
        <BlueprintTool />
      </div>
    </div>
  );
}
