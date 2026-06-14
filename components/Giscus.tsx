"use client";

import React, { useEffect, useRef } from "react";
import { giscus } from "@/lib/site";

/**
 * giscus comments. When `giscus.enabled` is true and the IDs are set in
 * lib/site.ts, this injects the official giscus <script>. Otherwise it shows
 * the styled placeholder from the design so the section always renders.
 */
export function Giscus() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!giscus.enabled || !giscus.repoId || !giscus.categoryId) return;
    const el = ref.current;
    if (!el || el.querySelector("script")) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", giscus.repo);
    script.setAttribute("data-repo-id", giscus.repoId);
    script.setAttribute("data-category", giscus.category);
    script.setAttribute("data-category-id", giscus.categoryId);
    script.setAttribute("data-mapping", giscus.mapping);
    script.setAttribute("data-reactions-enabled", giscus.reactionsEnabled);
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", giscus.inputPosition);
    // A custom theme URL (when configured) takes precedence over the named theme.
    script.setAttribute("data-theme", giscus.themeUrl || giscus.theme);
    script.setAttribute("data-lang", giscus.lang);
    el.appendChild(script);
  }, []);

  const live = giscus.enabled && giscus.repoId && giscus.categoryId;

  return (
    <section style={{ marginTop: "var(--space-9)", paddingTop: "var(--space-7)", borderTop: "1px solid var(--border-subtle)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-strong)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" />
        </svg>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "var(--text-lg)", color: "var(--text-strong)", margin: 0 }}>
          Comments
        </h2>
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--text-subtle)" }}>
          powered by giscus
        </span>
      </div>

      {live ? (
        <div ref={ref} className="giscus" />
      ) : (
        <div
          style={{
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-lg)",
            background: "var(--surface-sunken)",
            padding: "var(--space-8) var(--space-5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-3)",
            textAlign: "center",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--text-subtle)">
            <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.35 4.81-4.58 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
          </svg>
          <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "var(--text-base)" }}>
            GitHub 계정으로 로그인하여 댓글을 남길 수 있습니다.
          </p>
          <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)", color: "var(--text-subtle)" }}>
            giscus가 GitHub Discussions에 연결되어 이 영역에 렌더링됩니다.
          </p>
        </div>
      )}
    </section>
  );
}
