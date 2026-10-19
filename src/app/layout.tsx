import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";
import "./globals.css";

// Self-hosted fonts: no Google fetch at build time or in the browser.
// Files, licenses and sources: src/app/fonts/README.md
// Trimmed to weights 400–600 + Latin (H12, 45 → 26 KB): it is the hero
// text font = the phone LCP. A new weight or script: see fonts/README.md.
const interTight = localFont({
  src: "./fonts/InterTight-latin-wght400-600.woff2",
  weight: "400 600",
  variable: "--font-inter-tight",
  display: "swap",
});

// Not preloaded (Phase 3 H12). P9 preloaded it because the Phase 2 home
// page had mono text inside a paragraph (late swap = CLS). The real home
// page has no mono text at all (no font-mono, no <code>), and the preload
// made every phone download 40 KB of it before the hero text (the LCP)
// could paint. Pages that use it (styleguide) still load it on demand.
const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-latin-wght.woff2",
  weight: "100 800",
  variable: "--font-jetbrains-mono",
  display: "swap",
  preload: false,
});

// Site-wide defaults; pages override title/description. Relative URLs
// resolve against the production origin (staging is noindex + Disallow).
// "./" = the page's own path, so every page gets its own canonical.
// Note: a page that sets `openGraph` replaces this whole object (shallow
// merge), so it must repeat `images` too. scripts/check-seo.mjs catches it.
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.jobTitle}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    url: "./",
    siteName: site.name,
    locale: site.locale,
    title: `${site.name} — ${site.jobTitle}`,
    description: site.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: `${site.name}, ${site.jobTitle}` }],
  },
  twitter: { card: "summary_large_image", creator: "@Lubo_Bali" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${interTight.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Without JavaScript, Reveal content would stay invisible. */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        <SiteHeader />
        {/* Skip-link target on every page (pages own their <main>). */}
        <div id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
