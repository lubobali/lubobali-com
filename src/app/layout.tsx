import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted fonts: no Google fetch at build time or in the browser.
// Files, licenses and sources: src/app/fonts/README.md
const interTight = localFont({
  src: "./fonts/InterTight-latin-wght.woff2",
  weight: "100 900",
  variable: "--font-inter-tight",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-latin-wght.woff2",
  weight: "100 800",
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lubo Bali — AI & Data Platform Engineer",
  description:
    "Senior AI & Data Platform Engineer. Solo-built LuBot.ai. Featured by Neon (Databricks).",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
