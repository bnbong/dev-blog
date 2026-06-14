"use client";

import React from "react";

type Variant = "raised" | "outline" | "flat";

export interface CardProps {
  children?: React.ReactNode;
  variant?: Variant;
  interactive?: boolean;
  padding?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

/**
 * bnbong Card — warm surface container.
 * Variants: raised (shadow), outline (border), flat.
 * Set `interactive` for hover-lift on clickable cards.
 */
export function Card({
  children,
  variant = "raised",
  interactive = false,
  padding = "var(--space-5)",
  style,
  ...rest
}: CardProps) {
  const variants: Record<Variant, React.CSSProperties> = {
    raised: { background: "var(--surface-card)", border: "var(--border-width) solid var(--border-subtle)", boxShadow: "var(--shadow-md)" },
    outline: { background: "var(--surface-card)", border: "var(--border-width) solid var(--border-default)", boxShadow: "none" },
    flat: { background: "var(--surface-sunken)", border: "var(--border-width) solid transparent", boxShadow: "none" },
  };
  return (
    <div
      style={{
        borderRadius: "var(--radius-lg)",
        padding,
        transition: "transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out)",
        cursor: interactive ? "pointer" : "default",
        ...variants[variant],
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!interactive) return;
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "var(--shadow-lg)";
      }}
      onMouseLeave={(e) => {
        if (!interactive) return;
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = variants[variant].boxShadow as string;
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
