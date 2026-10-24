import type { MetadataRoute } from "next";
import { loadLive } from "@/lib/building/load";
import { publishedCaseStudies } from "@/lib/case-studies";
import { projects } from "@/lib/projects";
import { absoluteUrl } from "@/lib/site";

// Every indexable page, no trailing slash. scripts/check-seo.mjs fails the
// build if this list and the built pages ever disagree.
// No lastModified: a build date on every page would be wrong, and Google
// ignores lastmod it can't trust. Only /building has one: it really changes
// every morning (live.json). With sample data it is noindex, so not listed.
export const dynamic = "force-static";

const pages = [
  "/",
  "/about",
  "/blueprint",
  "/projects",
  "/resume",
  ...publishedCaseStudies().map((c) => `/work/${c.slug}`),
  ...projects.map((p) => `/projects/${p.slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const live = loadLive();
  const building = live.sample ? [] : [{ url: absoluteUrl("/building"), lastModified: live.generatedAt }];
  return [...pages.map((path) => ({ url: absoluteUrl(path) })), ...building];
}
