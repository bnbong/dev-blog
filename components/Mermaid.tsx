"use client";

import { useEffect } from "react";
import { getTheme, subscribeTheme, type Theme } from "@/lib/theme";

/**
 * Renders `<pre class="mermaid">` blocks (emitted by the markdown renderer for
 * ```mermaid fences) into SVG on the client. Mermaid is a browser-only library,
 * so it is dynamically imported — the heavy bundle is fetched only on pages that
 * actually contain a diagram, and only after mount.
 *
 * Diagrams are themed with the site's ink/cobalt tokens and re-rendered from
 * their original source (kept in `data-source`) whenever the site theme flips.
 */

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function themeVariables(theme: Theme) {
  const strong = cssVar("--text-strong");
  const card = cssVar("--surface-card");
  return {
    darkMode: theme === "dark",
    fontFamily: '"Geist Mono", "SFMono-Regular", Menlo, monospace',
    background: card,
    primaryColor: cssVar("--color-brand-tint"),
    primaryBorderColor: cssVar("--color-brand"),
    primaryTextColor: strong,
    secondaryColor: cssVar("--surface-sunken"),
    secondaryBorderColor: cssVar("--border-strong"),
    secondaryTextColor: strong,
    tertiaryColor: card,
    tertiaryBorderColor: cssVar("--border-subtle"),
    tertiaryTextColor: strong,
    lineColor: cssVar("--text-subtle"),
    textColor: strong,
    mainBkg: cssVar("--color-brand-tint"),
    nodeBorder: cssVar("--color-brand"),
    clusterBkg: cssVar("--surface-sunken"),
    clusterBorder: cssVar("--border-subtle"),
    edgeLabelBackground: card,
    noteBkgColor: cssVar("--surface-sunken"),
    noteBorderColor: cssVar("--border-subtle"),
    noteTextColor: strong,
    actorBkg: cssVar("--color-brand-tint"),
    actorBorder: cssVar("--color-brand"),
    actorTextColor: strong,
    signalColor: strong,
    signalTextColor: strong,
  };
}

/** Restore the raw source and mark the block so the `:not([data-processed])` hide rule stops applying. */
function markFailed(nodes: HTMLElement[]) {
  for (const el of nodes) {
    el.textContent = el.dataset.source ?? "";
    el.setAttribute("data-processed", "error");
  }
}

export function Mermaid() {
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".prose pre.mermaid:not([data-processed])"),
    );
    if (nodes.length === 0) return;

    // Keep the raw diagram source before mermaid replaces it with an SVG.
    for (const el of nodes) {
      if (el.dataset.source == null) el.dataset.source = el.textContent ?? "";
    }

    let cancelled = false;
    let queue: Promise<void> = Promise.resolve();

    const render = (theme: Theme) => {
      queue = queue
        .then(async () => {
          let mermaid: typeof import("mermaid").default;
          try {
            mermaid = (await import("mermaid")).default;
          } catch (err) {
            // Chunk failed to load: show the raw source instead of a hidden block.
            console.error("mermaid load failed", err);
            if (!cancelled) markFailed(nodes);
            return;
          }
          if (cancelled) return;
          for (const el of nodes) {
            el.removeAttribute("data-processed");
            el.textContent = el.dataset.source ?? "";
          }
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            theme: "base",
            themeVariables: themeVariables(theme),
            fontFamily: '"Geist Mono", "SFMono-Regular", Menlo, monospace',
          });
          try {
            await mermaid.run({ nodes });
          } catch (err) {
            console.error("mermaid render failed", err);
          }
          // Any node mermaid didn't mark (parse error etc.) falls back to its source.
          markFailed(nodes.filter((el) => !el.hasAttribute("data-processed")));
        })
        .catch((err) => {
          // Never leave the queue rejected — later theme flips must still run.
          console.error("mermaid render failed", err);
        });
    };

    render(getTheme());
    const unsubscribe = subscribeTheme(render);

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return null;
}
