import React from "react";
import { profile } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--border-subtle)" }}>
      <div
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "2.5rem 2rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--text-subtle)" }}>
          © 2026 bnbong · built with Markdown &amp; coffee
        </span>
        <a href={profile.github} style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "0.875rem", color: "var(--text-muted)" }}>
          GitHub
        </a>
      </div>
    </footer>
  );
}
