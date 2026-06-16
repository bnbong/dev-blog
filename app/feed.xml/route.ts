import { buildFeedXml } from "@/lib/feed";

// Statically generated at build time → out/feed.xml (works with output: "export").
export const dynamic = "force-static";

export function GET() {
  return new Response(buildFeedXml(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
