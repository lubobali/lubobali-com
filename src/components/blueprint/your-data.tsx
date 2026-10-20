// "Your data" on /blueprint (Phase 3b B9.5). Every line matches the code:
// store.py (blueprint 90 days only on Book a call, browser code 365 days,
// IP code ~7 days), nginx logs rotate after 14 days, llm.py sends
// data_collection "deny". Change the code, change this text. The home
// page only links here (Lubo: the full text is too much for the home).
const LINES: [string, string][] = [
  [
    "Your story",
    "goes to the AI only to write your blueprint, and only to AI providers that don't keep it or train on it. I don't store it.",
  ],
  [
    "Your blueprint",
    "stays in your own browser, so you can see it again. It's saved on my server only if you click “Book a call”, for 90 days, so I can read it before we talk.",
  ],
  [
    "If you ask for the PDF,",
    "it goes to you and to my inbox. Your email isn't stored in the tool or added to any list.",
  ],
  [
    "To stop abuse,",
    "I keep a scrambled code of your browser for 12 months and of your IP for about a week. My server logs keep IP addresses for 14 days. No cookies, no ads, no tracking.",
  ],
];

export function YourData() {
  return (
    <section id="your-data" aria-labelledby="your-data-title" className="mt-20 max-w-3xl scroll-mt-20">
      <h2 id="your-data-title" className="text-2xl font-semibold text-balance">
        What happens to your data
      </h2>
      <ul className="mt-4 flex flex-col gap-3 text-muted-foreground">
        {LINES.map(([lead, rest]) => (
          <li key={lead}>
            <strong className="font-semibold text-foreground">{lead}</strong> {rest}
          </li>
        ))}
        <li>
          <strong className="font-semibold text-foreground">Questions, or want something deleted?</strong> Email{" "}
          <a href="mailto:data@lubobali.com" className="underline underline-offset-4">
            data@lubobali.com
          </a>
          .
        </li>
      </ul>
    </section>
  );
}
