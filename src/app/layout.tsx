import type { Metadata } from "next";
import localFont from "next/font/local";
import { site } from "@/lib/site";
import "./globals.css";

// Self-hosted fonts: no Google fetch at build time or in the browser.
// Files, licenses and sources: src/app/fonts/README.md
const interTight = localFont({
  src: "./fonts/InterTight-latin-wght.woff2",
  weight: "100 900",
  variable: "--font-inter-tight",
  display: "swap",
});

// Preloaded on purpose (P9 measured): without preload, mono text inside a
// paragraph swaps late, re-wraps the line (CLS) and delays LCP — and the
// home page got no faster (LCP 2068 vs 2070 ms).
const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-latin-wght.woff2",
  weight: "100 800",
  variable: "--font-jetbrains-mono",
  display: "swap",
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
        {children}
      </body>
    </html>
  );
}
