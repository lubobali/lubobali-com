import { Picture } from "@/components/picture";
import { type Testimonial, testimonials } from "@/lib/testimonials";

// What people say (Phase 3 H10), right after Selected work: the quote is
// about LuBot, so it sits next to the proof. Award-card edge (slow beam),
// big platinum quote mark, round photo with a platinum ring. Real
// <blockquote> text, so search + AI bots read it. Nothing at all when the
// list is empty. Data + permission rule: src/lib/testimonials.ts.
export function Testimonials() {
  if (testimonials.length === 0) return null;
  const many = testimonials.length > 1;
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-title"
      className="relative mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-20"
    >
      <h2 id="testimonials-title" className="text-3xl font-semibold text-balance sm:text-4xl">
        What people say
      </h2>
      <ul className={`mt-10 grid gap-6 ${many ? "lg:grid-cols-2" : "mx-auto max-w-4xl"}`}>
        {testimonials.map((t) => (
          <li key={t.name} className="award-card quote-card rounded-2xl">
            <QuoteCard t={t} many={many} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// One quote (also used on case studies, e.g. /work/hellopayments).
export function QuoteCard({ t, many = false }: { t: Testimonial; many?: boolean }) {
  return (
    <figure className={`flex h-full flex-col gap-6 p-7 sm:p-10 ${many ? "" : "items-center text-center lg:px-16 lg:py-14"}`}>
      <svg aria-hidden="true" viewBox="0 0 48 36" width="48" height="36" className="quote-mark">
        <path d="M0 36V22C0 9.6 6.4 2.2 19.2 0l2 5.2C14 7.2 10.4 11.4 10 18h9.6v18zm26.4 0V22c0-12.4 6.4-19.8 19.2-22l2 5.2c-7.2 2-10.8 6.2-11.2 12.8H46v18z" />
      </svg>
      <blockquote className={`relative font-medium text-balance ${many ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl lg:text-4xl"}`}>
        {/* The big mark above is the opening quote, so no extra marks. */}
        <p>{t.quote}</p>
      </blockquote>
      <figcaption className={`relative mt-auto flex items-center gap-4 border-t border-award/20 pt-6 ${many ? "" : "w-full justify-center text-left"}`}>
        {t.photo && (
          <span className="quote-photo">
            <Picture name={t.photo} alt="" sizes="64px" />
          </span>
        )}
        <span className="flex flex-col">
          {t.url ? (
            <a
              href={t.url}
              target="_blank"
              rel="noopener"
              className="font-semibold underline-offset-4 hover:underline"
            >
              {t.name}
              <span className="sr-only"> on LinkedIn (opens in a new tab)</span>
            </a>
          ) : (
            <span className="font-semibold">{t.name}</span>
          )}
          <span className="text-sm text-muted-foreground">
            {`${t.role}, `}
            {t.org.url ? (
              <a
                href={t.org.url}
                target="_blank"
                rel="noopener"
                className="text-link underline-offset-4 hover:underline"
              >
                {t.org.name}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              t.org.name
            )}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
