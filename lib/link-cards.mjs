// Single source of truth for the `<url>` social-card autolink syntax, shared by
// the renderer (lib/markdown.ts), the prefetch script and the CI check script —
// so the trigger pattern can never drift between them.

/** A line that is exactly an autolink `<https://…>` becomes a social card. */
export const LINK_CARD_LINE = /^[ \t]*<(https?:\/\/[^>\s]+)>[ \t]*$/;

/** Collect URLs that appear as standalone `<https://…>` autolinks (→ social cards). */
export function findLinkCardUrls(md) {
  const urls = [];
  for (const line of md.replace(/\r\n?/g, "\n").split("\n")) {
    const m = line.match(LINK_CARD_LINE);
    if (m) urls.push(m[1]);
  }
  return urls;
}

/** Deployed site origin (no trailing slash). Mirrors `siteUrl` in lib/site.ts —
 *  duplicated here because this module is also loaded by the plain-ESM tools. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://bnbong.com").replace(/\/$/, "");

/**
 * Path of `url` when it points at this site itself, else null. Host comparison
 * ignores `www.` and case; query/hash are dropped. Internal links never need a
 * network fetch — their card is synthesized from local frontmatter (lib/content.ts).
 */
export function internalPath(url, siteUrl = SITE_URL) {
  try {
    const host = (u) => new URL(u).hostname.replace(/^www\./i, "").toLowerCase();
    if (host(url) !== host(siteUrl)) return null;
    return new URL(url).pathname;
  } catch {
    return null;
  }
}

/** True when `url` points at this site itself (→ skip prefetch / CI check). */
export function isInternalUrl(url, siteUrl = SITE_URL) {
  return internalPath(url, siteUrl) !== null;
}
