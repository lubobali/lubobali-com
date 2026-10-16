import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Production robots.txt: open to search engines and AI assistants
// (Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot,
// Claude-User, PerplexityBot, ...) — being found by them is the goal.
// Staging never serves this file: nginx answers /robots.txt there with
// "Disallow: /" (+ the noindex header on every response).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
