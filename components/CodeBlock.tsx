import React from "react";

export interface CodeBlockProps {
  children?: React.ReactNode;
  filename?: string;
  language?: string;
  showDots?: boolean;
  style?: React.CSSProperties;
}

/**
 * bnbong CodeBlock — dark terminal-style fenced code with an optional
 * title bar (filename + language) and traffic-light dots.
 * Pass code as children (string). Decorative only — no real highlighting.
 */
export function CodeBlock({ children, filename, language = "", showDots = true, style, ...rest }: CodeBlockProps) {
  const hasBar = filename || showDots || language;
  return (
    <div
      style={{
        background: "var(--surface-code)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: "var(--shadow-md)",
        border: "var(--border-width) solid rgba(225,185,120,0.14)",
        ...style,
      }}
      {...rest}
    >
      {hasBar && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            padding: "var(--space-3) var(--space-4)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(0,0,0,0.25)",
          }}
        >
          {showDots && (
            <span style={{ display: "inline-flex", gap: 6 }}>
              {["#E1B978", "#D2A256", "#9A6E2C"].map((c) => (
                <span key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
              ))}
            </span>
          )}
          {filename && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--warm-300)" }}>
              {filename}
            </span>
          )}
          {language && (
            <span
              style={{
                marginLeft: "auto",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-2xs)",
                letterSpacing: "var(--tracking-wide)",
                textTransform: "uppercase",
                color: "var(--gold-400)",
              }}
            >
              {language}
            </span>
          )}
        </div>
      )}
      <pre
        style={{
          margin: 0,
          padding: "var(--space-5)",
          overflowX: "auto",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-sm)",
          lineHeight: "var(--leading-normal)",
          color: "var(--warm-100)",
        }}
      >
        <code>{children}</code>
      </pre>
    </div>
  );
}
