import { buildFeedXml } from "@/lib/feed";

// Back-compat alias for the legacy MkDocs feed path (bnbong.github.io/feed_rss_updated.xml).
// Lets the existing blog-post-workflow keep its path and only change the domain.
export const dynamic = "force-static";

export function GET() {
  return new Response(buildFeedXml(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
