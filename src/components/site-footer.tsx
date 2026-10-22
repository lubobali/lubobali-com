import { StatusDot } from "@/components/status-dot";
import { publishedCaseStudies } from "@/lib/case-studies";
import { site } from "@/lib/site";

// Footer (Phase 3 H11, Lubo: "premium"): a glow line instead of a flat
// border; LB logo + who + availability; page links; profile icons
// (rel="me"); email as visible text (it can be copied even where mailto:
// does nothing); legal lines. Icons are inline SVG (0 requests): GitHub + X
// from Simple Icons 16.35.0 (CC0), LinkedIn drawn as its "in" mark (not in
// Simple Icons). The LB logo is the header file (already loaded).

const PROFILES = [
  {
    name: "LinkedIn",
    url: site.sameAs[0],
    path: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13M7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0",
  },
  {
    name: "GitHub",
    url: site.sameAs[1],
    path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  },
  {
    name: "X",
    url: site.sameAs[2],
    path: "M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z",
  },
];

// Home sections (ids in src/components/home/*). "/#id" works from any page.
const LINKS = [
  { label: "All projects", href: "/projects" },
  { label: "Work", href: "/#work" },
  { label: "Built with", href: "/#stack" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Contact", href: "/#contact" },
];

const heading = "text-xs font-semibold tracking-wide text-award uppercase";

export function SiteFooter() {
  return (
    <footer className="site-footer relative mt-auto">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-14 pb-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr_auto]">
        <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
          <p className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/lb-logo.webp" alt="" width={46} height={48} className="h-12 w-auto" />
            <span className="flex flex-col">
              <span className="text-lg font-semibold">{site.name}</span>
              <span className="text-sm text-muted-foreground">{site.jobTitle}</span>
            </span>
          </p>
          <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <StatusDot />
            {site.availability}
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-3">
          <p className={heading}>Explore</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm lg:grid-cols-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Stories" className="flex flex-col gap-3">
          <p className={heading}>Stories</p>
          <ul className="flex flex-col gap-2 text-sm">
            {publishedCaseStudies().map((c) => (
              <li key={c.slug}>
                <a href={`/work/${c.slug}`} className="text-muted-foreground transition-colors hover:text-foreground">
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-3">
          <p className={heading}>Profiles</p>
          <ul className="flex gap-3">
            {PROFILES.map((p) => (
              <li key={p.name}>
                <a href={p.url} target="_blank" rel="me noopener" className="footer-icon">
                  <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path fillRule="evenodd" d={p.path} />
                  </svg>
                  <span className="sr-only">{`${site.name} on ${p.name} (opens in a new tab)`}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name} · {site.product.legalName}
          </p>
          <a href={`mailto:${site.email}`} className="text-link underline-offset-4 hover:underline">
            {site.email}
          </a>
        </div>
        {/* For the "Built with" logos (H8). */}
        <p className="mt-2 text-xs text-muted-foreground">
          Logos are trademarks of their owners, shown only to name the tools used. No endorsement implied.
        </p>
      </div>
    </footer>
  );
}
