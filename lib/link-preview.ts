import fs from "node:fs";
import path from "node:path";

export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
}

// OG metadata is fetched offline by `npm run prefetch:links` (tools/prefetch-link-previews.mjs)
// and committed here. The site build only READS it → static export does zero network I/O,
// avoiding per-page export timeouts on CI (Cloudflare). Missing entries fall back to a
// minimal favicon + domain card.
const DATA_FILE = path.join(process.cwd(), "data", "link-previews.json");

let cache: Record<string, LinkPreview | null> | null = null;

function load(): Record<string, LinkPreview | null> {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    cache = {};
    console.warn(
      "[link-preview] data/link-previews.json missing or invalid — <url> cards will use the minimal fallback. " +
        "Run `npm run prefetch:links` and commit it.",
    );
  }
  return cache!;
}

/** All committed previews as a Map (keyed by URL). */
export function getLinkPreviews(): Map<string, LinkPreview | null> {
  return new Map(Object.entries(load()));
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Render a social-card anchor for a URL. Rich if OG data exists, else a minimal
 *  favicon + domain card. Wrapped in a div so marked keeps it as a block.
 *  Output is allowlist-safe for the sanitizer. */
export function renderLinkCard(url: string, preview: LinkPreview | null): string {
  const domain = domainOf(url);
  const favicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  const title = preview?.title || domain;
  let desc = preview?.description || "";
  if (desc.length > 160) desc = desc.slice(0, 157) + "…";
  const site = preview?.siteName || domain;
  const media = preview?.image
    ? `<div class="link-card__media"><img src="${esc(preview.image)}" alt="" loading="lazy"></div>`
    : "";
  const descHtml = desc ? `<div class="link-card__desc">${esc(desc)}</div>` : "";
  return (
    `<div class="link-card-wrap">` +
    `<a class="link-card" href="${esc(url)}" target="_blank" rel="noopener noreferrer">` +
    media +
    `<div class="link-card__body">` +
    `<div class="link-card__title">${esc(title)}</div>` +
    descHtml +
    `<div class="link-card__meta"><img class="link-card__favicon" src="${esc(favicon)}" alt="" width="16" height="16" loading="lazy"><span>${esc(site)}</span></div>` +
    `</div></a></div>`
  );
}
