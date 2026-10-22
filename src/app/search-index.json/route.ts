import { siteDocs } from "@/lib/search/site-index";

// /search-index.json: the site search data (src/lib/search/site-index.ts),
// a static file made at build time. Fetched by the browser on first use.
export const dynamic = "force-static";

export function GET() {
  return Response.json({ docs: siteDocs });
}
