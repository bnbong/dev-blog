import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({ gfm: true, breaks: false });

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

export interface RenderOptions {
  /** Public URL prefix for co-located images, e.g. "/blog/<slug>". */
  assetBase?: string;
  /** Resolve a legacy `*.md` link to a real route; return input unchanged to keep it. */
  resolveLink?: (href: string) => string;
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

/**
 * Convert an MkDocs Markdown document into sanitized HTML.
 * Handles the subset of pymdownx/material syntax used in the legacy blog:
 * admonitions, collapsible admonitions, `<!-- more -->`, icon shortcodes,
 * attr-lists, co-located image paths and legacy cross-links. Output is run
 * through an allowlist sanitizer before it is injected into the page.
 */
export function renderMarkdown(input: string, opts: RenderOptions = {}): string {
  const src = input.replace(/<!--\s*more\s*-->/g, "");
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
