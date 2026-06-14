"use client";

import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export interface ButtonProps {
  children?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLElement>;
  target?: string;
  rel?: string;
}

/**
 * bnbong Button — warm gold primary action.
 * Variants: primary (gold), secondary (outline), ghost, danger.
 * Sizes: sm, md, lg. Optionally renders as <a> via `href`.
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  type = "button",
  style,
  ...rest
}: ButtonProps) {
  const sizes: Record<Size, React.CSSProperties> = {
    sm: { padding: "0 var(--space-3)", height: "32px", fontSize: "var(--text-sm)", gap: "var(--space-2)" },
    md: { padding: "0 var(--space-5)", height: "42px", fontSize: "var(--text-base)", gap: "var(--space-2)" },
    lg: { padding: "0 var(--space-6)", height: "52px", fontSize: "var(--text-md)", gap: "var(--space-3)" },
  };

  const variants: Record<Variant, React.CSSProperties> = {
    primary: {
      background: "var(--color-brand)",
      color: "var(--text-on-brand)",
      border: "var(--border-width) solid transparent",
      boxShadow: "var(--shadow-sm)",
    },
    secondary: {
      background: "var(--surface-raised)",
      color: "var(--text-strong)",
      border: "var(--border-width) solid var(--border-default)",
      boxShadow: "var(--shadow-xs)",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-body)",
      border: "var(--border-width) solid transparent",
    },
    danger: {
      background: "var(--color-danger)",
      color: "#fff",
      border: "var(--border-width) solid transparent",
      boxShadow: "var(--shadow-sm)",
    },
  };

  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: sizes[size].gap,
    height: sizes[size].height,
    padding: sizes[size].padding,
    width: fullWidth ? "100%" : "auto",
    fontFamily: "var(--font-display)",
    fontSize: sizes[size].fontSize,
    fontWeight: 600,
    letterSpacing: "var(--tracking-snug)",
    lineHeight: 1,
    borderRadius: "var(--radius-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition:
      "transform var(--duration-fast) var(--ease-standard), filter var(--duration-fast) var(--ease-standard), background var(--duration-fast) var(--ease-standard)",
    textDecoration: "none",
    whiteSpace: "nowrap",
    ...variants[variant],
    ...style,
  };

  const Tag: any = href ? "a" : "button";
  const interactive = !disabled;

  return (
    <Tag
      href={href}
      type={href ? undefined : type}
      disabled={href ? undefined : disabled}
      style={base}
      onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
        if (interactive) e.currentTarget.style.filter = "brightness(0.95)";
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
        if (interactive) {
          e.currentTarget.style.filter = "none";
          e.currentTarget.style.transform = "none";
        }
      }}
      onMouseDown={(e: React.MouseEvent<HTMLElement>) => {
        if (interactive) e.currentTarget.style.transform = "scale(0.97)";
      }}
      onMouseUp={(e: React.MouseEvent<HTMLElement>) => {
        if (interactive) e.currentTarget.style.transform = "none";
      }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </Tag>
  );
}
