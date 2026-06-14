import React from "react";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";
type Size = "sm" | "md";

export interface TagProps {
  children?: React.ReactNode;
  tone?: Tone;
  size?: Size;
  interactive?: boolean;
  active?: boolean;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

/**
 * bnbong Tag — pill for topics / tech labels (e.g. "Python", "FastAPI").
 * Tones: neutral, brand, success, warning, danger, info.
 * Set `interactive` to render a real, keyboard-focusable `<button>` (used for
 * blog/projects filters); otherwise renders a presentational `<span>`.
 */
export function Tag({
  children,
  tone = "neutral",
  size = "md",
  interactive = false,
  active = false,
  style,
  ...rest
}: TagProps) {
  const tones: Record<Tone, { bg: string; fg: string; bd: string }> = {
    neutral: { bg: "var(--surface-sunken)", fg: "var(--text-muted)", bd: "var(--border-subtle)" },
    brand: { bg: "var(--color-brand-soft)", fg: "var(--color-brand-ink)", bd: "var(--gold-200)" },
    success: { bg: "var(--color-success-soft)", fg: "var(--color-success)", bd: "transparent" },
    warning: { bg: "var(--color-warning-soft)", fg: "var(--color-warning)", bd: "transparent" },
    danger: { bg: "var(--color-danger-soft)", fg: "var(--color-danger)", bd: "transparent" },
    info: { bg: "var(--color-info-soft)", fg: "var(--color-info)", bd: "transparent" },
  };
  const sizes: Record<Size, React.CSSProperties> = {
    sm: { fontSize: "var(--text-2xs)", padding: "2px var(--space-2)" },
    md: { fontSize: "var(--text-xs)", padding: "4px var(--space-3)" },
  };
  const t = active ? tones.brand : tones[tone];

  const styles: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "var(--space-1)",
    fontFamily: "var(--font-mono)",
    fontSize: sizes[size].fontSize,
    fontWeight: 500,
    letterSpacing: "var(--tracking-snug)",
    padding: sizes[size].padding,
    background: t.bg,
    color: t.fg,
    border: `var(--border-width) solid ${t.bd}`,
    borderRadius: "var(--radius-pill)",
    cursor: interactive ? "pointer" : "default",
    userSelect: "none",
    transition: "background var(--duration-fast) var(--ease-standard)",
    whiteSpace: "nowrap",
    ...style,
  };

  if (interactive) {
    return (
      <button type="button" aria-pressed={active} style={{ appearance: "none", ...styles }} {...rest}>
        {children}
      </button>
    );
  }
  return (
    <span style={styles} {...rest}>
      {children}
    </span>
  );
}
