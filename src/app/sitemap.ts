import type { MetadataRoute } from "next";
import { publishedCaseStudies } from "@/lib/case-studies";
import { projects } from "@/lib/projects";
import { absoluteUrl } from "@/lib/site";

// Every indexable page, no trailing slash. scripts/check-seo.mjs fails the
// build if this list and the built pages ever disagree.
// No lastModified: a build date on every page would be wrong, and Google
// ignores lastmod it can't trust.
export const dynamic = "force-static";

const pages = [
  "/",
  "/blueprint",
  ...publishedCaseStudies().map((c) => `/work/${c.slug}`),
  ...projects.map((p) => `/projects/${p.slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((path) => ({ url: absoluteUrl(path) }));
}
