import "./blueprint-flow.css";
import "./blueprint.css";
import "./copy.css";
import "./examples.css";
import "./tool.css";
import { BookCall } from "@/components/book-call";
import { BookWithCode } from "./book-with-code";
import { CopyForm } from "./copy-form";
import type { Blueprint } from "./types";

// The "how" stays for the call (Lubo, D2): the visitor sees that a full
// technical plan exists and what is in it, never the content. Blurred
// lines are decoration only (aria-hidden); the list is real text.
export function Locked({ bp }: { bp: Blueprint }) {
  return (
    <section className="bp-locked" aria-labelledby="bp-locked">
      <div className="bp-locked-head">
        <LockIcon />
        <h4 id="bp-locked" className="bp-locked-title">
          Your full technical plan
        </h4>
      </div>
      <ul className="bp-locked-list">
        {bp.locked.map((item) => (
          <li key={item}>
            <span>{item}</span>
            <span className="bp-blur" aria-hidden="true" />
          </li>
        ))}
      </ul>
      <p className="bp-locked-text">We go through it together on a free 30-min call.</p>
      {bp.code ? (
        <>
          <BookWithCode bp={{ ...bp, code: bp.code }} className="finale-button" />
          <p className="bp-code">
            Your blueprint code: <strong>{bp.code}</strong>. I&apos;ll have your blueprint open on our call.
          </p>
          <CopyForm bp={bp} />
        </>
      ) : (
        <BookCall className="finale-button" />
      )}
    </section>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" strokeLinecap="round" />
    </svg>
  );
}
