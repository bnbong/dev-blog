import React from "react";
import { profile } from "@/lib/site";

export function SiteFooter() {
  const links = [
    { label: "GitHub", href: profile.github },
    { label: "LinkedIn", href: profile.linkedin },
    { label: "Email", href: `mailto:${profile.email}` },
    { label: "RSS", href: profile.rss },
  ];

  return (
    <footer style={{ borderTop: "1px solid var(--border-strong)" }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "40px clamp(20px, 4vw, 48px) 48px",
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(48px, 8vw, 96px)",
            lineHeight: 0.85,
            letterSpacing: "-0.06em",
            color: "var(--text-strong)",
          }}
        >
          bnbong<span style={{ color: "var(--color-brand)" }}>.</span>
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 20px", fontFamily: "var(--font-mono)", fontSize: 13 }}>
          {links.map((l) => (
            <a key={l.label} href={l.href} className="footer-link">
              {l.label}
            </a>
          ))}
          <span style={{ color: "var(--text-subtle)" }}>© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
