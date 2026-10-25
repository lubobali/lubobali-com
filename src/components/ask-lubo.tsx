import { Picture } from "@/components/picture";
import { ceoQuestions } from "@/lib/ceo-questions";
import { site } from "@/lib/site";

// "Questions CEOs ask me" as a chat with Lubo (Phase 6, P6.8; look agreed
// with Lubo 2026-10-24): all 11 questions always visible as pills; tap one
// and it rises as the CEO's own bubble (violet), then Lubo's written answer
// rises up from the depth (sky), with his photo and the proof. No AI: his
// approved words (lib/ceo-questions.ts). No JavaScript either: radio inputs
// + CSS (ui/ask-lubo.css), so it costs home no extra file, works without
// JS, and every answer is in the HTML for Google and AI assistants.
// Used on home and /about.

export function AskLubo({ id = "questions" }: { id?: string }) {
  const titleId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={titleId} className="ask edge-card scroll-mt-20 rounded-[2rem] px-5 py-10 sm:px-10 sm:py-12">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold tracking-wide text-award uppercase">Ask me</p>
        <h2 id={titleId} className="text-3xl font-semibold text-balance sm:text-4xl">
          Questions CEOs ask me
        </h2>
      </div>
      <fieldset className="ask-chat">
        <legend className="sr-only">Pick a question to see my answer</legend>
        {ceoQuestions.map((q, i) => (
          <input key={q.id} type="radio" name={`${id}-q`} id={`${id}-${q.id}`} className="ask-radio" defaultChecked={i === 0} />
        ))}
        <div className="ask-pills">
          {ceoQuestions.map((q) => (
            <label key={q.id} htmlFor={`${id}-${q.id}`} className="ask-pill">
              {q.q}
            </label>
          ))}
        </div>
        <div className="ask-panels">
          {ceoQuestions.map((q) => (
            <div key={q.id} className="ask-panel">
              <p className="ask-bubble ask-bubble--q">{q.q}</p>
              <div className="ask-reply">
                <span className="ask-avatar">
                  <Picture name="lubo-bali-avatar" alt="" sizes="44px" className="size-11 rounded-full" />
                </span>
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="ask-typing" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                  <p className="ask-bubble ask-bubble--a">
                    <span className="sr-only">Lubo: </span>
                    {q.a}
                  </p>
                  {q.proof && (
                    <a href={q.proof.href} className="ask-proof">
                      ✓ Proof: {q.proof.label} →
                    </a>
                  )}
                  {q.book && (
                    <a href={site.bookCall.url} target="_blank" rel="noopener" data-track={site.bookCall.label} className="ask-proof">
                      {site.bookCall.label} →<span className="sr-only"> (opens Calendly in a new tab)</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </fieldset>
      <p className="text-xs text-muted-foreground">My own answers, written by me.</p>
    </section>
  );
}
