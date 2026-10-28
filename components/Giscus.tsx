"use client";

import React, { useEffect, useRef } from "react";
import { giscus } from "@/lib/site";
import { getTheme, subscribeTheme, type Theme } from "@/lib/theme";

/**
 * giscus comments. When `giscus.enabled` is true and the IDs are set in
 * lib/site.ts, this injects the official giscus <script>. Otherwise it shows
 * a placeholder so the section always renders.
 *
 * The giscus theme follows the site theme: the initial `data-theme` matches
 * <html data-theme>, and later toggles are pushed into the iframe via
 * postMessage. A configured `giscus.themeUrl` (custom CSS) always wins.
 */
const GISCUS_ORIGIN = "https://giscus.app";

function giscusTheme(theme: Theme): string {
  if (giscus.themeUrl) return giscus.themeUrl;
  return theme === "dark" ? "dark" : giscus.theme;
}

export function Giscus() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!giscus.enabled || !giscus.repoId || !giscus.categoryId) return;
    const el = ref.current;
    if (!el) return;

    if (!el.querySelector("script")) {
      const script = document.createElement("script");
      script.src = "https://giscus.app/client.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.setAttribute("data-repo", giscus.repo);
      script.setAttribute("data-repo-id", giscus.repoId);
      script.setAttribute("data-category", giscus.category);
      script.setAttribute("data-category-id", giscus.categoryId);
      script.setAttribute("data-mapping", giscus.mapping);
      script.setAttribute("data-strict", giscus.strict);
      script.setAttribute("data-reactions-enabled", giscus.reactionsEnabled);
      script.setAttribute("data-emit-metadata", "0");
      script.setAttribute("data-input-position", giscus.inputPosition);
      script.setAttribute("data-theme", giscusTheme(getTheme()));
      script.setAttribute("data-lang", giscus.lang);
      el.appendChild(script);
    }

    const postTheme = (theme: Theme) => {
      const iframe = el.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
      iframe?.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: giscusTheme(theme) } } },
        GISCUS_ORIGIN,
      );
    };

    // A toggle before the iframe exists is dropped by postTheme. giscus posts a
    // message once its frame is up, so re-send the current theme on the first one.
    let synced = false;
    const onMessage = (e: MessageEvent) => {
      if (synced || e.origin !== GISCUS_ORIGIN) return;
      synced = true;
      postTheme(getTheme());
    };
    window.addEventListener("message", onMessage);
    const unsubscribe = subscribeTheme(postTheme);

    return () => {
      window.removeEventListener("message", onMessage);
      unsubscribe();
    };
  }, []);

  const live = giscus.enabled && giscus.repoId && giscus.categoryId;

  return (
    <section style={{ marginTop: 80, paddingTop: 24, borderTop: "1px solid var(--border-strong)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: "-0.02em",
            color: "var(--text-strong)",
            margin: 0,
          }}
        >
          Comments
        </h2>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-subtle)" }}>
          giscus · {giscus.repo}
        </span>
      </div>

      {live ? (
        <div ref={ref} className="giscus" />
      ) : (
        <div
          style={{
            border: "1px solid var(--border-subtle)",
            background: "var(--surface-sunken)",
            padding: "40px 20px",
            textAlign: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          GitHub 계정으로 로그인하여 댓글을 남길 수 있습니다.
        </div>
      )}
    </section>
  );
}
