import React from "react";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";

export interface BadgeProps {
  children?: React.ReactNode;
  tone?: Tone;
  dot?: boolean;
  style?: React.CSSProperties;
}

/**
 * bnbong Badge — small status/count indicator.
 * tones mirror Tag; `dot` shows a leading status dot.
 */
export function Badge({ children, tone = "neutral", dot = false, style, ...rest }: BadgeProps) {
  const tones: Record<Tone, { bg: string; fg: string }> = {
    neutral: { bg: "var(--surface-sunken)", fg: "var(--text-muted)" },
    brand: { bg: "var(--color-brand)", fg: "var(--text-on-brand)" },
    success: { bg: "var(--color-success)", fg: "#fff" },
    warning: { bg: "var(--color-warning)", fg: "var(--warm-950)" },
    danger: { bg: "var(--color-danger)", fg: "#fff" },
    info: { bg: "var(--color-info)", fg: "#fff" },
  };
  const t = tones[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-1)",
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-2xs)",
        fontWeight: 700,
        letterSpacing: "var(--tracking-wide)",
        textTransform: "uppercase",
        padding: "2px var(--space-2)",
        minWidth: "18px",
        height: "18px",
        justifyContent: "center",
        background: t.bg,
        color: t.fg,
        borderRadius: "var(--radius-sm)",
        ...style,
      }}
      {...rest}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", opacity: 0.9 }} />}
      {children}
    </span>
  );
}
