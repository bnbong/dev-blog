// Prefetch Open Graph metadata for every standalone `<url>` autolink in content/
// and write it to data/link-previews.json (committed). This is the ONLY place that
// touches the network — the site build reads the committed JSON, so static export
// does zero network I/O (fast, deterministic, no per-page timeouts).
//
//   npm run prefetch:links            # fetch only URLs not already cached
//   npm run prefetch:links -- --force # refetch everything
import fs from "node:fs";
import path from "node:path";
import { decode } from "html-entities";
import { findLinkCardUrls } from "../lib/link-cards.mjs";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data", "link-previews.json");
const TIMEOUT_MS = 8000;
const CONCURRENCY = 8;
const FORCE = process.argv.includes("--force");

function findUrls() {
  const urls = new Set();
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      const st = fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (name.endsWith(".md")) {
        for (const u of findLinkCardUrls(fs.readFileSync(p, "utf8"))) urls.add(u);
      }
    }
  };
  walk(path.join(ROOT, "content", "blog"));
  walk(path.join(ROOT, "content", "projects"));
  return [...urls];
}

/** Full HTML-entity decode (named + decimal + hex) via html-entities. Runs up to
 *  two passes to also clear double-encoded source text (e.g. `&amp;gt;` → `>`). */
function decodeEntities(s) {
  let out = s;
  for (let i = 0; i < 2; i++) {
    const next = decode(out);
    if (next === out) break;
    out = next;
  }
  return out.trim();
}
function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
function parseMeta(html) {
  const out = {};
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = {};
    for (const m of tag.matchAll(/([a-zA-Z:_-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
      attrs[m[1].toLowerCase()] = m[3] ?? m[4] ?? "";
    }
    const key = (attrs.property || attrs.name || "").toLowerCase();
    if (key && attrs.content != null && !(key in out)) out[key] = attrs.content;
  }
  return out;
}

async function fetchPreview(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
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

async function main() {
  const urls = findUrls();
  let existing = {};
  try {
    existing = JSON.parse(fs.readFileSync(OUT, "utf8"));
  } catch {
    /* first run */
  }
  const todo = FORCE ? urls : urls.filter((u) => !(u in existing));
  console.log(`found ${urls.length} card URLs · fetching ${todo.length}${FORCE ? " (force)" : " new"}`);

  const merged = { ...existing };
  let ok = 0;
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    const batch = todo.slice(i, i + CONCURRENCY);
    const settled = await Promise.all(batch.map(async (u) => [u, await fetchPreview(u)]));
    for (const [u, data] of settled) {
      merged[u] = data;
      if (data) ok++;
    }
    process.stdout.write(`\r  ${Math.min(i + CONCURRENCY, todo.length)}/${todo.length}`);
  }
  // Drop entries whose URL no longer appears in content; keep stable key order.
  const present = new Set(urls);
  const sorted = {};
  for (const k of Object.keys(merged).filter((k) => present.has(k)).sort()) sorted[k] = merged[k];

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`\nwrote ${OUT} · ${Object.keys(sorted).length} entries (${ok} freshly resolved)`);
}

main();
