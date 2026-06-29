"use client";

import { useEffect } from "react";

/**
 * Renders `<pre class="mermaid">` blocks (emitted by the markdown renderer for
 * ```mermaid fences) into SVG on the client. Mermaid is a browser-only library,
 * so it is dynamically imported — the heavy bundle is fetched only on pages that
 * actually contain a diagram, and only after mount.
 */
export function Mermaid() {
  useEffect(() => {
    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>(".prose pre.mermaid:not([data-processed])"),
    );
    if (nodes.length === 0) return;

    let cancelled = false;
    (async () => {
      const mermaid = (await import("mermaid")).default;
      if (cancelled) return;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "neutral",
        fontFamily: "inherit",
      });
      try {
        await mermaid.run({ nodes });
      } catch (err) {
        console.error("mermaid render failed", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
