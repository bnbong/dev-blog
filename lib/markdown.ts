import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import sanitizeHtml from "sanitize-html";
import { renderLinkCard, type LinkPreview } from "./link-preview";

marked.setOptions({ gfm: true, breaks: false });

// Build-time syntax highlighting (highlight.js → `<span class="hljs-…">` tokens,
// coloured by the .hljs CSS theme). Synchronous, so renderMarkdown stays sync;
// no client-side JS ships.
marked.use(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang) {
      try {
        if (lang && hljs.getLanguage(lang)) return hljs.highlight(code, { language: lang }).value;
        if (!lang) return hljs.highlightAuto(code).value;
      } catch {
        /* fall through to escaped plain text */
      }
      return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },
  }),
);

const ADMONITION_TITLES: Record<string, string> = {
  note: "Note",
  abstract: "Abstract",
  info: "Info",
  tip: "Tip",
  success: "Success",
  question: "Question",
  warning: "Warning",
  failure: "Failure",
  danger: "Danger",
  bug: "Bug",
  example: "Example",
  quote: "Quote",
};
const ADMONITION_TYPES = new Set(Object.keys(ADMONITION_TITLES));

/** A line that is exactly an autolink `<https://…>` becomes a social card. */
const LINK_CARD_LINE = /^[ \t]*<(https?:\/\/[^>\s]+)>[ \t]*$/;
/** Opening of a pymdownx-style block: `/// type` or `/// type | args`. */
const BLOCK_OPEN = /^\/\/\/\s+([\w-]+)\s*(?:\|\s*(.*?))?\s*$/;

export interface RenderOptions {
  /** Public URL prefix for co-located images, e.g. "/blog/<slug>". */
  assetBase?: string;
  /** Resolve a legacy `*.md` link to a real route; return input unchanged to keep it. */
  resolveLink?: (href: string) => string;
  /** OG previews for `<url>` autolink social cards (keyed by URL). */
  linkPreviews?: Map<string, LinkPreview | null>;
}

/** Collect URLs that appear as standalone `<https://…>` autolinks (→ social cards). */
export function findLinkCardUrls(md: string): string[] {
  const urls: string[] = [];
  for (const line of md.replace(/\r\n?/g, "\n").split("\n")) {
    const m = line.match(LINK_CARD_LINE);
    if (m) urls.push(m[1]);
  }
  return urls;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Resolve a co-located (relative) asset path to its public mirror URL, and
 * drop anything with a non-image-safe scheme (javascript:, vbscript:, …).
 * `cover.png` under content/blog/<slug>/ → `/blog/<slug>/cover.png`.
 */
function resolveSrc(src: string, base: string): string {
  const trimmed = src.trim();
  if (/^(?!https?:|\/|\.|#|data:image\/)[a-z][a-z0-9+.-]*:/i.test(trimmed)) return ""; // unsafe scheme
  if (!base || /^([a-z]+:|\/\/|\/|#)/i.test(trimmed)) return trimmed;
  return `${base}/${trimmed.replace(/^\.\//, "")}`;
}

function cleanInline(line: string, opts: RenderOptions): string {
  const { assetBase = "", resolveLink } = opts;
  let out = line
    // Markdown images → <img> so they render inside MkDocs `md_in_html`
    // containers (<figure markdown>) that marked passes through verbatim.
    .replace(
      /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
      (_m, alt, src, title) => {
        const resolved = resolveSrc(src, assetBase);
        if (!resolved) return "";
        return `<img src="${escapeHtml(resolved)}" alt="${escapeHtml(alt)}"${title ? ` title="${escapeHtml(title)}"` : ""} loading="lazy">`;
      },
    )
    // rewrite relative src on hand-authored raw <img> tags too
    .replace(/(<img\b[^>]*?\bsrc=")([^"]+)(")/gi, (_m, pre, src, post) => `${pre}${escapeHtml(resolveSrc(src, assetBase))}${post}`)
    // strip the now-redundant `markdown` attribute from md_in_html wrappers
    .replace(/(<(?:figure|div|p|span)[^>]*?)\s+markdown(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi, "$1")
    // `:material-foo:` / `:fontawesome-...:` icon shortcodes
    .replace(/:[a-z0-9]+(?:[-_][a-z0-9]+)+:/g, "")
    // `{ .class #id key=val }` attr-lists
    .replace(/\{\s*[.#][^}]*\}/g, "")
    .replace(/\{\s*:[^}]*\}/g, "");

  if (resolveLink) {
    // Legacy markdown links to other posts/projects: [text](something.md#anchor)
    out = out.replace(
      /\]\(([^)\s]+\.md(?:#[^)\s]*)?)(\s+"[^"]*")?\)/g,
      (_m, href, title = "") => `](${resolveLink(href)}${title})`,
    );
    // …and raw <a href="something.md">
    out = out.replace(
      /(<a\b[^>]*?\bhref=")([^"]+\.md(?:#[^"]*)?)(")/gi,
      (_m, pre, href, post) => `${pre}${resolveLink(href)}${post}`,
    );
  }

  return out.trimEnd();
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "ul", "ol", "li", "blockquote",
    "code", "pre", "hr", "br", "div", "span", "strong", "em", "b", "i", "s", "del",
    "ins", "sup", "sub", "mark", "kbd", "abbr",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td",
    "img", "figure", "figcaption", "details", "summary",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "loading", "width", "height"],
    th: ["align", "colspan", "rowspan"],
    td: ["align", "colspan", "rowspan"],
    "*": ["class", "id"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowProtocolRelative: false,
  // Open external links safely.
  transformTags: {
    a: (tagName, attribs) => {
      if (attribs.href && /^https?:\/\//i.test(attribs.href)) {
        attribs.target = "_blank";
        attribs.rel = "noopener noreferrer";
      }
      return { tagName, attribs };
    },
  },
};

/** Render a `/// type | args … ///` block (pymdownx Blocks subset). */
function renderBlock(type: string, args: string, body: string, opts: RenderOptions): string {
  const inner = renderMarkdown(body, opts);
  if (type === "caption" || type === "figure-caption") {
    return `<div class="md-caption">${inner}</div>`;
  }
  if (type === "details" || type === "collapse") {
    const summary = escapeHtml(args || "Details");
    return `<details class="md-details"><summary>${summary}</summary>${inner}</details>`;
  }
  if (ADMONITION_TYPES.has(type)) {
    const title = escapeHtml(args || ADMONITION_TITLES[type]);
    return `<div class="admonition ${escapeHtml(type)}"><p class="admonition-title">${title}</p>${inner}</div>`;
  }
  // Unknown block type: keep the content, drop the wrapper semantics.
  return `<div class="md-block">${inner}</div>`;
}

/**
 * Convert an MkDocs Markdown document into sanitized HTML.
 * Handles the subset of pymdownx/material syntax used in the legacy blog:
 * admonitions (`!!!`/`???`), Blocks (`/// caption`, `/// note`, `/// details`),
 * `<url>` social-card autolinks, `<!-- more -->`, icon shortcodes, attr-lists,
 * co-located image paths and legacy cross-links. Output is run through an
 * allowlist sanitizer before it is injected into the page.
 */
export function renderMarkdown(input: string, opts: RenderOptions = {}): string {
  const src = input.replace(/\r\n?/g, "\n").replace(/<!--\s*more\s*-->/g, "");
  const lines = src.split("\n");
  const out: string[] = [];
  let inFence = false;
  let fenceMarker = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const fenceMatch = line.match(/^(\s*)(```+|~~~+)/);

    if (inFence) {
      out.push(line);
      if (fenceMatch && fenceMatch[2][0] === fenceMarker[0]) {
        inFence = false;
        fenceMarker = "";
      }
      i++;
      continue;
    }
    if (fenceMatch) {
      inFence = true;
      fenceMarker = fenceMatch[2];
      out.push(line);
      i++;
      continue;
    }

    const adm = line.match(/^(!!!|\?\?\?\+?)\s+([\w-]+)(?:\s+"([^"]*)")?\s*$/);
    if (adm) {
      const type = adm[2].toLowerCase();
      const title = adm[3] != null ? adm[3] : ADMONITION_TITLES[type] || adm[2];
      i++;
      const body: string[] = [];
      while (i < lines.length && (lines[i].trim() === "" || /^(\s{4}|\t)/.test(lines[i]))) {
        body.push(lines[i].replace(/^(\s{4}|\t)/, ""));
        i++;
      }
      const inner = renderMarkdown(body.join("\n").trim(), opts);
      out.push(`<div class="admonition ${escapeHtml(type)}">`);
      if (title) out.push(`<p class="admonition-title">${escapeHtml(title)}</p>`);
      out.push(inner);
      out.push(`</div>`);
      out.push("");
      continue;
    }

    // Standalone autolink `<https://…>` → social card.
    const cardMatch = line.match(LINK_CARD_LINE);
    if (cardMatch) {
      const url = cardMatch[1];
      const preview = opts.linkPreviews?.get(url) ?? null;
      out.push("");
      out.push(renderLinkCard(url, preview));
      out.push("");
      i++;
      continue;
    }

    // pymdownx-style block: `/// type | args` … `///`
    const block = line.match(BLOCK_OPEN);
    if (block) {
      const type = block[1].toLowerCase();
      const args = (block[2] ?? "").trim();
      i++;
      const body: string[] = [];
      while (i < lines.length && lines[i].trim() !== "///") {
        body.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume closing ///
      out.push(renderBlock(type, args, body.join("\n").trim(), opts));
      out.push("");
      continue;
    }

    out.push(cleanInline(line, opts));
    i++;
  }

  return sanitizeHtml(marked.parse(out.join("\n")) as string, SANITIZE_OPTIONS);
}

/** Plain-text length for reading-time estimates (strips markdown noise). */
export function plainTextLength(md: string): number {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/[#>*_~`-]/g, "")
    .replace(/\s+/g, "")
    .length;
}
