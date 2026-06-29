import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import markedFootnote from "marked-footnote";
import hljs from "highlight.js";
import katex from "katex";
import sanitizeHtml from "sanitize-html";
import { renderLinkCard, type LinkPreview } from "./link-preview";
import { LINK_CARD_LINE } from "./link-cards.mjs";

marked.setOptions({ gfm: true, breaks: false });

// `[^id]` references + `[^id]: …` definitions → a numbered footnotes section
// with back-references (rendered at build time, no client JS).
marked.use(markedFootnote());

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

/** Opening of a pymdownx-style block: `/// type` or `/// type | args`. */
const BLOCK_OPEN = /^\/\/\/\s+([\w-]+)\s*(?:\|\s*(.*?))?\s*$/;
/** `**bold**` (content not whitespace-bounded; single `*` allowed inside). */
const STRONG = /\*\*(?=\S)((?:[^*]|\*(?!\*))*?)(?<=\S)\*\*/g;
/** Inline LaTeX `$ … $` (edges non-space, no `$`/newline inside — skips `$5`/`$VAR`). */
const INLINE_MATH = /\$(?=\S)([^$\n]+?)(?<=\S)\$/g;
/** Single-line display math `$$ … $$`. */
const DISPLAY_MATH_INLINE = /^\$\$([\s\S]+?)\$\$$/;

/**
 * Render LaTeX to static HTML+MathML at build time (no client JS). KaTeX output
 * is trusted (generated from the source, content escaped) so it bypasses the
 * sanitizer via a placeholder that is substituted back after sanitization.
 */
function renderMath(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      strict: "ignore",
      output: "htmlAndMathml",
    });
  } catch {
    return escapeHtml(`${displayMode ? "$$" : "$"}${tex}${displayMode ? "$$" : "$"}`);
  }
}

/** Stash rendered math and return a sanitize-surviving placeholder (PUA delimiters). */
function stashMath(math: string[], html: string): string {
  math.push(html);
  return `${math.length - 1}`;
}

/** Re-insert stashed KaTeX HTML after the sanitizer has run. */
function restoreMath(html: string, math: string[]): string {
  return html.replace(/(\d+)/g, (_m, i) => math[Number(i)] ?? "");
}

export interface RenderOptions {
  /** Public URL prefix for co-located images, e.g. "/blog/<slug>". */
  assetBase?: string;
  /** Resolve a legacy `*.md` link to a real route; return input unchanged to keep it. */
  resolveLink?: (href: string) => string;
  /** OG previews for `<url>` autolink social cards (keyed by URL). */
  linkPreviews?: Map<string, LinkPreview | null>;
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

function cleanInline(line: string, opts: RenderOptions, math: string[]): string {
  const { assetBase = "", resolveLink } = opts;

  // Protect inline code spans so none of the transforms below touch their text.
  const codeSpans: string[] = [];
  let out = line.replace(/`[^`\n]*`/g, (m) => {
    codeSpans.push(m);
    return `\u0000${codeSpans.length - 1}\u0000`;
  });

  // Inline LaTeX `$ … $` → KaTeX placeholder. Done before the transforms below so
  // braces inside math (e.g. `$\sqrt{N}$`) aren't eaten by the attr-list strippers.
  // Code spans are already protected, so `$` inside backticks is left untouched.
  out = out.replace(INLINE_MATH, (_m, tex) => stashMath(math, renderMath(tex, false)));

  out = out
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

  // Bold: convert **...** to <strong> ourselves - marked (strict CommonMark) cannot
  // close ** between punctuation and a CJK letter (e.g. `...6)**ipnida`).
  out = out.replace(STRONG, (_m, inner) => `<strong>${inner}</strong>`);

  // restore protected inline code spans
  out = out.replace(/\u0000(\d+)\u0000/g, (_m, i) => codeSpans[Number(i)]);

  return out.trimEnd();
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "ul", "ol", "li", "blockquote",
    "code", "pre", "hr", "br", "div", "span", "strong", "em", "b", "i", "s", "del",
    "ins", "sup", "sub", "mark", "kbd", "abbr",
    "table", "thead", "tbody", "tfoot", "tr", "th", "td",
    "img", "figure", "figcaption", "details", "summary", "section",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel", "aria-label", "data-footnote-ref", "data-footnote-backref"],
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
function renderBlock(type: string, args: string, body: string, opts: RenderOptions, math: string[]): string {
  const inner = renderDoc(body, opts, math);
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
  const math: string[] = [];
  const html = renderDoc(input, opts, math);
  // KaTeX HTML is trusted (generated, content-escaped) → re-insert after sanitizing.
  return restoreMath(html, math);
}

function renderDoc(input: string, opts: RenderOptions, math: string[]): string {
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
      // ```mermaid → emit a <pre class="mermaid"> the client renderer picks up.
      const lang = line.slice(fenceMatch[0].length).trim().split(/\s+/)[0].toLowerCase();
      if (lang === "mermaid") {
        const marker = fenceMatch[2];
        i++;
        const body: string[] = [];
        while (i < lines.length && !lines[i].match(new RegExp(`^\\s*${marker[0]}{${marker.length},}\\s*$`))) {
          body.push(lines[i]);
          i++;
        }
        if (i < lines.length) i++; // consume the closing fence
        out.push("");
        out.push(`<pre class="mermaid">${escapeHtml(body.join("\n"))}</pre>`);
        out.push("");
        continue;
      }
      inFence = true;
      fenceMarker = fenceMatch[2];
      out.push(line);
      i++;
      continue;
    }

    // Display math: `$$ … $$` (single line, or a block spanning lines).
    if (line.trimStart().startsWith("$$")) {
      const single = line.trim().match(DISPLAY_MATH_INLINE);
      if (single) {
        out.push("");
        out.push(stashMath(math, renderMath(single[1].trim(), true)));
        out.push("");
        i++;
        continue;
      }
      const after = line.trim().slice(2);
      i++;
      const body: string[] = after ? [after] : [];
      while (i < lines.length && !lines[i].includes("$$")) {
        body.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume the closing `$$`
      out.push("");
      out.push(stashMath(math, renderMath(body.join("\n").trim(), true)));
      out.push("");
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
      const inner = renderDoc(body.join("\n").trim(), opts, math);
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
      out.push(renderBlock(type, args, body.join("\n").trim(), opts, math));
      out.push("");
      continue;
    }

    out.push(cleanInline(line, opts, math));
    i++;
  }

  return sanitizeHtml(marked.parse(out.join("\n")) as string, SANITIZE_OPTIONS);
}

export interface TocEntry {
  depth: number;
  text: string;
  id: string;
}

/** Strip inline markdown/LaTeX from a heading so the TOC shows clean text. */
function cleanHeadingText(raw: string): string {
  return raw
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\$([^$]+)\$/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[#*_~`]/g, "")
    .trim();
}

/** GitHub-style anchor slug (keeps Unicode letters, so Korean headings work). */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Extract the heading outline from raw Markdown (skipping fenced code), with a
 * stable, de-duplicated anchor slug per heading. Returns every level so the
 * order lines up 1:1 with the rendered HTML headings for id injection.
 */
export function tableOfContents(input: string): TocEntry[] {
  const lines = input.replace(/\r\n?/g, "\n").split("\n");
  const headings: TocEntry[] = [];
  const seen = new Map<string, number>();
  let inFence = false;
  let fenceMarker = "";

  for (const line of lines) {
    const fence = line.match(/^(\s*)(```+|~~~+)/);
    if (inFence) {
      if (fence && fence[2][0] === fenceMarker[0]) inFence = false;
      continue;
    }
    if (fence) {
      inFence = true;
      fenceMarker = fence[2];
      continue;
    }
    const h = line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!h) continue;
    const text = cleanHeadingText(h[2]);
    if (!text) continue;
    const base = slugify(text) || "section";
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    headings.push({ depth: h[1].length, text, id: n ? `${base}-${n}` : base });
  }
  return headings;
}

/** Add `id` attributes to rendered HTML headings, in document order. */
export function injectHeadingIds(html: string, headings: TocEntry[]): string {
  let k = 0;
  return html.replace(/<(h[1-6])\b([^>]*)>/gi, (m, tag, attrs) => {
    const entry = headings[k++];
    if (!entry || /\bid=/i.test(attrs)) return m;
    return `<${tag}${attrs} id="${entry.id}">`;
  });
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
