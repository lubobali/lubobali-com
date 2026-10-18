import { site } from "@/lib/site";

const PROFILES = [
  { name: "LinkedIn", url: site.sameAs[0] },
  { name: "GitHub", url: site.sameAs[1] },
  { name: "X", url: site.sameAs[2] },
];

// Footer: who, availability, email (as visible text, so it can be copied
// even where mailto: does nothing), own profiles (rel="me").
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="flex flex-col gap-2">
          <p className="font-semibold">{site.name}</p>
          <p className="text-sm text-muted-foreground">{site.jobTitle}</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <span aria-hidden="true" className="size-2 rounded-full bg-success" />
            {site.availability}
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-muted-foreground">Email</p>
          <a href={`mailto:${site.email}`} className="text-link underline-offset-4 hover:underline">
            {site.email}
          </a>
        </div>
        <ul className="flex gap-5 text-sm" aria-label="Profiles">
          {PROFILES.map((p) => (
            <li key={p.name}>
              <a
                href={p.url}
                target="_blank"
                rel="me noopener"
                className="text-link underline-offset-4 hover:underline"
              >
                {p.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} {site.name} · {site.product.legalName}
        {/* For the "Built with" logos (H8). */}
        <span className="mt-1 block">
          Logos are trademarks of their owners, shown only to name the tools used. No endorsement implied.
        </span>
      </p>
    </footer>
  );
}
