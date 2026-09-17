import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { renderMarkdown, plainTextLength, tableOfContents, injectHeadingIds, resolveSrc, type TocEntry } from "./markdown";
import { getLinkPreviews, type LinkPreview } from "./link-preview";
import { findLinkCardUrls, internalPath } from "./link-cards.mjs";
import { siteUrl } from "./site";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

export type ProjectStatus = "active" | "wip" | "archived";

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  updated?: string;
  readingTime: string;
  tags: string[];
  intro?: string;
  isNew?: boolean;
  /** Card thumbnail URL — always set (falls back to DEFAULT_THUMBNAIL). */
  thumbnail: string;
  html: string;
  toc: TocEntry[];
}

export interface Project {
  slug: string;
  name: string;
  owner: string;
  url: string;
  description: string;
  stack: string[];
  language: string;
  languageColor: string;
  stars?: number;
  forks?: number;
  status: ProjectStatus;
  year: number;
  featured: boolean;
  period?: string;
  role?: string;
  /** Card thumbnail URL — always set (falls back to DEFAULT_THUMBNAIL). */
  thumbnail: string;
  html: string;
}

/** Card image used when a post/project has neither an explicit nor an inline image. */
export const DEFAULT_THUMBNAIL = "/assets/new_profile.png";

/** All Markdown/HTML image sources in body order: `![alt](src)` and `<img src="…">`. */
function* imageSources(markdown: string): Generator<string> {
  // Fenced code blocks are samples, not illustrations — skip them.
  const body = markdown.replace(/^```[\s\S]*?^```/gm, "");
  const re = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)|<img\b[^>]*?\bsrc="([^"]+)"/gi;
  for (let m = re.exec(body); m; m = re.exec(body)) yield m[1] ?? m[2];
}

/**
 * Pick a card thumbnail: explicit frontmatter (`thumbnail`, or legacy `cover`/`image`)
 * → first image in the body → the default profile picture. Relative paths resolve
 * against `assetBase` the same way body images do.
 */
export function resolveThumbnail(
  data: Record<string, unknown>,
  content: string,
  assetBase: string,
): string {
  const explicit = data.thumbnail ?? data.cover ?? data.image;
  if (explicit) {
    const v = String(explicit).trim();
    if (v) return /^(https?:\/\/|\/)/i.test(v) ? v : `${assetBase}/${v.replace(/^\.\//, "")}`;
  }
  for (const src of imageSources(content)) {
    if (/^data:/i.test(src.trim())) continue; // inline blobs make poor card art
    const resolved = resolveSrc(src, assetBase);
    if (resolved) return resolved;
  }
  return DEFAULT_THUMBNAIL;
}

/** "2026.05.12" → comparable "2026-05-12". */
function sortKey(date: string): string {
  return date.replace(/[./]/g, "-");
}

/** Normalize a frontmatter date (JS Date from YAML, or "2026.05.12" string) to "YYYY.MM.DD". */
function fmtDate(v: unknown): string {
  if (!v) return "";
  if (v instanceof Date) {
    const y = v.getUTCFullYear();
    const m = String(v.getUTCMonth() + 1).padStart(2, "0");
    const d = String(v.getUTCDate()).padStart(2, "0");
    return `${y}.${m}.${d}`;
  }
  return String(v).replace(/-/g, ".");
}

function estimateReadingTime(markdown: string): string {
  // ~500 Korean characters / minute (mkdocs used 300 wpm; CJK runs denser).
  const minutes = Math.max(1, Math.round(plainTextLength(markdown) / 500));
  return `${minutes} min read`;
}

/**
 * Read every post in a content area. Supports two layouts:
 *   - co-located folder:  <dir>/<slug>/index.md   (+ images alongside)
 *   - flat file:          <dir>/<slug>.md          (legacy / no images)
 */
function readDir(dir: string): { slug: string; raw: string }[] {
  if (!fs.existsSync(dir)) return [];
  const out: { slug: string; raw: string }[] = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isFile() && name.endsWith(".md")) {
      out.push({ slug: name.replace(/\.md$/, ""), raw: fs.readFileSync(full, "utf8") });
    } else if (stat.isDirectory()) {
      const index = path.join(full, "index.md");
      if (fs.existsSync(index)) out.push({ slug: name, raw: fs.readFileSync(index, "utf8") });
    }
  }
  return out;
}

/** Cheap slug listing (no file reads) — for the cross-link resolver. */
function listSlugs(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const slugs: string[] = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isFile() && name.endsWith(".md")) slugs.push(name.replace(/\.md$/, ""));
    else if (stat.isDirectory() && fs.existsSync(path.join(full, "index.md"))) slugs.push(name);
  }
  return slugs;
}

let _linkResolver: ((href: string) => string) | null = null;

/**
 * Rewrite legacy MkDocs `*.md` cross-links to real static routes:
 *   qr-phishing-detector.md      → /projects/qr-phishing-detector/
 *   20260526.md                  → /blog/20260526-computer-network-4/  (date → folder slug)
 *   ../blog/index.md             → /blog/
 *   ../open-source/index.md      → /projects/   (Open Source merged into Projects)
 * Unknown targets are returned unchanged.
 */
function getLinkResolver(): (href: string) => string {
  if (_linkResolver) return _linkResolver;
  const projectSlugs = new Set(listSlugs(PROJECTS_DIR));
  const blogSlugs = listSlugs(BLOG_DIR);
  const blogSet = new Set(blogSlugs);
  const blogByDate = new Map<string, string>();
  for (const s of blogSlugs) {
    const m = s.match(/^(\d{8})/);
    if (m && !blogByDate.has(m[1])) blogByDate.set(m[1], s);
  }

  _linkResolver = (href: string): string => {
    const hashIdx = href.indexOf("#");
    const pathPart = hashIdx === -1 ? href : href.slice(0, hashIdx);
    const anchor = hashIdx === -1 ? "" : href.slice(hashIdx);
    if (!/\.md$/i.test(pathPart)) return href;
    const segs = pathPart.split("/").filter(Boolean);
    const base = (segs[segs.length - 1] || "").replace(/\.md$/i, "");
    const lower = pathPart.toLowerCase();

    let route: string | null = null;
    if (base === "index") {
      if (lower.includes("project")) route = "/projects/";
      else if (lower.includes("open-source") || lower.includes("opensource")) route = "/projects/";
      else if (lower.includes("blog")) route = "/blog/";
      else route = "/";
    } else if (projectSlugs.has(base)) route = `/projects/${base}/`;
    else if (blogByDate.has(base)) route = `/blog/${blogByDate.get(base)}/`;
    else if (blogSet.has(base)) route = `/blog/${base}/`;

    return route ? route + anchor : href;
  };
  return _linkResolver;
}

/** Pull created/updated out of either `date: "2026.05.12"` or `date: {created, updated}`. */
function extractDates(data: Record<string, unknown>): { created: string; updated?: string } {
  const d = data.date as unknown;
  if (d && typeof d === "object" && !(d instanceof Date)) {
    const obj = d as { created?: unknown; updated?: unknown };
    return { created: fmtDate(obj.created), updated: obj.updated ? fmtDate(obj.updated) : undefined };
  }
  return { created: fmtDate(d), updated: data.updated ? fmtDate(data.updated) : undefined };
}

/** Post fields without the rendered body — for lists and the RSS feed. */
export type PostSummary = Omit<Post, "html" | "toc">;

/** Frontmatter → post metadata (no Markdown rendering, no link-preview fetch). */
function parsePostMeta(slug: string, data: Record<string, unknown>, content: string) {
  const thumbnail = resolveThumbnail(data, content, `/blog/${slug}`);
  const { created, updated } = extractDates(data);
  const category =
    (data.category as string) ?? (Array.isArray(data.categories) ? String(data.categories[0]) : "Writing");
  return {
    slug,
    title: String(data.title ?? slug),
    excerpt: String(data.excerpt ?? data.description ?? ""),
    category,
    date: created,
    updated: updated && updated !== created ? updated : undefined,
    readingTime: data.readingTime ? String(data.readingTime) : estimateReadingTime(content),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    intro: data.intro ? String(data.intro) : undefined,
    thumbnail,
    isNewExplicit: typeof data.isNew === "boolean" ? (data.isNew as boolean) : undefined,
  };
}

/** Sort newest-first by created date and flag posts within 60 days of the newest as "New". */
function sortAndFlagNew<T extends { date: string; isNewExplicit?: boolean }>(
  list: T[],
): Array<Omit<T, "isNewExplicit"> & { isNew: boolean }> {
  const sorted = [...list].sort((a, b) => sortKey(b.date).localeCompare(sortKey(a.date)));
  const newest = sorted.length ? new Date(sortKey(sorted[0].date)).getTime() : 0;
  const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;
  return sorted.map(({ isNewExplicit, ...rest }) => ({
    ...rest,
    isNew: isNewExplicit ?? newest - new Date(sortKey(rest.date)).getTime() <= SIXTY_DAYS,
  })) as Array<Omit<T, "isNewExplicit"> & { isNew: boolean }>;
}

let _internalPreviews: Map<string, LinkPreview> | null = null;

/**
 * Social cards for links that point back at this site. They are NOT prefetched
 * (tools/prefetch-link-previews.mjs skips same-origin URLs) — the card is built
 * from the target's own frontmatter, so it always carries the real title,
 * excerpt and thumbnail without a network round-trip or a recursive render.
 * Keyed by the exact URL as it appears in the Markdown; built once per build.
 */
function getInternalPreviews(): Map<string, LinkPreview> {
  if (_internalPreviews) return _internalPreviews;
  const map = new Map<string, LinkPreview>();
  const siteName = new URL(siteUrl).hostname.replace(/^www\./i, "");

  // Frontmatter only — no Markdown rendering (cost + recursion).
  const blog = new Map<string, { title: string; description: string; image: string }>();
  for (const { slug, raw } of readDir(BLOG_DIR)) {
    const { data, content } = matter(raw);
    const meta = parsePostMeta(slug, data, content);
    blog.set(slug, { title: meta.title, description: meta.excerpt, image: meta.thumbnail });
  }
  const projects = new Map<string, { title: string; description: string; image: string }>();
  for (const { slug, raw } of readDir(PROJECTS_DIR)) {
    const { data, content } = matter(raw);
    projects.set(slug, {
      title: String(data.name ?? data.title ?? slug),
      description: String(data.description ?? ""),
      image: resolveThumbnail(data, content, `/projects/${slug}`),
    });
  }

  for (const { raw } of [...readDir(BLOG_DIR), ...readDir(PROJECTS_DIR)]) {
    for (const url of findLinkCardUrls(raw)) {
      const pathname = internalPath(url, siteUrl);
      if (!pathname) continue;
      const m = pathname.match(/^\/(blog|projects)\/([^/]+)\/?$/);
      if (!m) continue;
      const item = (m[1] === "blog" ? blog : projects).get(m[2]);
      if (!item) continue; // unknown slug → fall back to the cached JSON / minimal card
      map.set(url, {
        url,
        title: item.title,
        description: item.description,
        image: /^https?:\/\//i.test(item.image) ? item.image : `${siteUrl}${item.image}`,
        siteName,
      });
    }
  }
  _internalPreviews = map;
  return map;
}

/** Cached JSON previews with internal (same-origin) cards layered on top. */
function getPreviewMap(): Map<string, LinkPreview | null> {
  const merged = getLinkPreviews();
  for (const [url, preview] of getInternalPreviews()) merged.set(url, preview);
  return merged;
}

export async function getAllPosts(): Promise<Post[]> {
  const entries = readDir(BLOG_DIR);
  const previews = getPreviewMap();
  const resolveLink = getLinkResolver();

  const posts = entries.map(({ slug, raw }) => {
    const { data, content } = matter(raw);
    const headings = tableOfContents(content);
    const html = injectHeadingIds(
      renderMarkdown(content, { assetBase: `/blog/${slug}`, resolveLink, linkPreviews: previews }),
      headings,
    );
    return {
      ...parsePostMeta(slug, data, content),
      html,
      // Only h2/h3 in the sidebar TOC (h1 duplicates the post title).
      toc: headings.filter((h) => h.depth >= 2 && h.depth <= 3),
    };
  });

  return sortAndFlagNew(posts) as Post[];
}

/** Lightweight metadata-only list (no Markdown render, no network) for the RSS feed. */
export function getPostSummaries(): PostSummary[] {
  const items = readDir(BLOG_DIR).map(({ slug, raw }) => {
    const { data, content } = matter(raw);
    return parsePostMeta(slug, data, content);
  });
  return sortAndFlagNew(items) as PostSummary[];
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await getAllPosts()).find((p) => p.slug === slug);
}

const STACK_STOPLIST = new Set([
  "personal", "team", "oss", "coursework", "featured", "project", "study",
]);

function deriveStatus(period: string, data: Record<string, unknown>): ProjectStatus {
  if (data.status) return data.status as ProjectStatus;
  if (/진행중|ing|운영|유지|maintain|active/i.test(period)) return "active";
  if (/예정|wip|진행\s*예정|중/i.test(period)) return "wip";
  return "archived";
}

function firstGithubUrl(body: string): string {
  const m = body.match(/https?:\/\/github\.com\/[\w.-]+\/[\w.-]+/);
  return m ? m[0].replace(/[.,)]+$/, "") : "";
}

export async function getAllProjects(): Promise<Project[]> {
  const entries = readDir(PROJECTS_DIR);
  const previews = getPreviewMap();
  const resolveLink = getLinkResolver();

  const projects = entries.map(({ slug, raw }) => {
    const { data, content } = matter(raw);
    const period = data.period ? String(data.period) : "";
    const url = String(data.url ?? data.repo ?? firstGithubUrl(content) ?? "");
    const ownerMatch = url.match(/github\.com\/([\w.-]+)/);
    const yearMatch = (period || String(data.year ?? "")).match(/(20\d{2})/);
    const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
    const stack = (Array.isArray(data.stack) ? data.stack.map(String) : tags)
      .filter((t) => !STACK_STOPLIST.has(t.toLowerCase()))
      .slice(0, 6);
    return {
      slug,
      name: String(data.name ?? data.title ?? slug),
      owner: ownerMatch ? ownerMatch[1] : "bnbong",
      url,
      description: String(data.description ?? ""),
      stack,
      language: String(data.language ?? ""),
      languageColor: String(data.languageColor ?? "var(--color-brand)"),
      stars: data.stars != null ? Number(data.stars) : undefined,
      forks: data.forks != null ? Number(data.forks) : undefined,
      status: deriveStatus(period, data),
      year: yearMatch ? Number(yearMatch[1]) : Number(data.year ?? 0),
      featured: Boolean(data.featured),
      period: period || undefined,
      role: data.role ? String(data.role) : undefined,
      thumbnail: resolveThumbnail(data, content, `/projects/${slug}`),
      html: renderMarkdown(content, { assetBase: `/projects/${slug}`, resolveLink, linkPreviews: previews }),
    } satisfies Project;
  });

  // Status first (WIP → Active → Archived), then featured, recent year, name.
  const statusRank: Record<ProjectStatus, number> = { wip: 0, active: 1, archived: 2 };
  return projects.sort(
    (a, b) =>
      statusRank[a.status] - statusRank[b.status] ||
      Number(b.featured) - Number(a.featured) ||
      b.year - a.year ||
      a.name.localeCompare(b.name),
  );
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getAllProjects()).find((p) => p.slug === slug);
}
