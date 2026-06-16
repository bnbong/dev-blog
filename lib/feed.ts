import { getPostSummaries } from "./content";
import { profile, siteUrl } from "./site";

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** "2026.05.12" → comparable "2026-05-12". */
function key(date: string): string {
  return date.replace(/[.\-/]/g, "-");
}

/** "2026.05.12" → RFC-822 date for RSS pubDate. */
function toRfc822(date: string): string {
  const [y, m, d] = date.split(/[.\-/]/).map(Number);
  return new Date(Date.UTC(y || 1970, (m || 1) - 1, d || 1)).toUTCString();
}

/**
 * Build the RSS 2.0 feed. Like the legacy `feed_rss_updated.xml`, items are
 * ordered and dated by their **last-updated** date (`updated ?? date`), so an
 * edited post resurfaces as a recent entry.
 */
export function buildFeedXml(): string {
  const base = siteUrl;
  const posts = getPostSummaries()
    .map((p) => ({ ...p, effective: p.updated ?? p.date }))
    .sort((a, b) => key(b.effective).localeCompare(key(a.effective)));

  const lastBuild = posts.length ? toRfc822(posts[0].effective) : new Date(0).toUTCString();

  const items = posts
    .map((p) => {
      const link = `${base}/blog/${p.slug}/`;
      const categories = [...new Set([p.category, ...p.tags].filter(Boolean))]
        .map((c) => `      <category>${xmlEscape(c)}</category>`)
        .join("\n");
      return `    <item>
      <title>${xmlEscape(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${toRfc822(p.effective)}</pubDate>
      <description>${xmlEscape(p.excerpt)}</description>
${categories}
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(profile.name)} — dev blog</title>
    <link>${base}/blog/</link>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${xmlEscape(profile.intro)}</description>
    <language>ko</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}
