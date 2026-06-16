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
