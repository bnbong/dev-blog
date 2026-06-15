import fs from "node:fs";
import path from "node:path";

export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
}

const CACHE_FILE = path.join(process.cwd(), ".cache", "link-previews.json");
const FETCH_TIMEOUT_MS = 8000;
const CONCURRENCY = 8;

let memCache: Record<string, LinkPreview | null> | null = null;

function loadCache(): Record<string, LinkPreview | null> {
  if (memCache) return memCache;
  try {
    memCache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  } catch {
    memCache = {};
  }
  return memCache!;
}

function saveCache() {
  try {
    fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(memCache, null, 2));
  } catch {
    /* cache is best-effort */
  }
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", "#x27": "'" };
function decodeEntities(s: string): string {
  return s
    .replace(/&(amp|lt|gt|quot|apos|#39|#x27);/g, (_m, e) => ENTITIES[e] ?? _m)
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
    .trim();
}

/** Parse all <meta> tags into a {property|name → content} map (attr-order agnostic). */
function parseMeta(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs: Record<string, string> = {};
    for (const m of tag.matchAll(/([a-zA-Z:_-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
      attrs[m[1].toLowerCase()] = m[3] ?? m[4] ?? "";
    }
    const key = (attrs.property || attrs.name || "").toLowerCase();
    if (key && attrs.content != null && !(key in out)) out[key] = attrs.content;
  }
  return out;
}

async function fetchPreview(url: string): Promise<LinkPreview | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; bnbong-dev-blog link-preview/1.0)" },
    });
    if (!res.ok) return null;
    if (!(res.headers.get("content-type") || "").includes("text/html")) return null;
    const html = (await res.text()).slice(0, 500_000);
    const meta = parseMeta(html);
    const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
    const domain = domainOf(url);

    const title = decodeEntities(meta["og:title"] || meta["twitter:title"] || titleTag || domain);
    const description = decodeEntities(meta["og:description"] || meta["twitter:description"] || meta["description"] || "");
    let image = meta["og:image"] || meta["twitter:image"] || meta["twitter:image:src"] || "";
    if (image) {
      try {
        image = new URL(image, url).toString();
      } catch {
        image = "";
      }
    }
    const siteName = decodeEntities(meta["og:site_name"] || domain);
    return { url, title: title || domain, description, image, siteName };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve OG previews for a set of URLs. Results are cached to .cache/ (and in
 * memory) so repeat renders/builds don't refetch. Unreachable URLs resolve to
 * null and the renderer falls back to a minimal card.
 */
export async function getLinkPreviews(urls: string[]): Promise<Map<string, LinkPreview | null>> {
  const cache = loadCache();
  const result = new Map<string, LinkPreview | null>();
  const todo: string[] = [];
  for (const url of new Set(urls)) {
    if (url in cache) result.set(url, cache[url]);
    else todo.push(url);
  }
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    const batch = todo.slice(i, i + CONCURRENCY);
    const settled = await Promise.all(batch.map(async (u) => [u, await fetchPreview(u)] as const));
    for (const [u, data] of settled) {
      cache[u] = data;
      result.set(u, data);
    }
  }
  if (todo.length) saveCache();
  return result;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Render a social-card anchor for a URL. Always renders (rich if OG data exists,
 *  otherwise a minimal favicon + domain card). Wrapped in a div so marked keeps it
 *  as a block. Output is allowlist-safe for the sanitizer. */
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
