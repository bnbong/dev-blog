"use client";

import React from "react";
import { Avatar } from "./Avatar";

export interface AuthorBylineProps {
  name?: string;
  intro?: string;
  src?: string;
  initials?: string;
  size?: number;
  onHome?: () => void;
  style?: React.CSSProperties;
}

/**
 * bnbong AuthorByline — profile icon + nickname + one-line intro.
 * The avatar and nickname are a single clickable target (→ home).
 */
export function AuthorByline({
  name = "bnbong",
  intro,
  src,
  initials = "bb",
  size = 44,
  onHome,
  style,
  ...rest
}: AuthorBylineProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", ...style }} {...rest}>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onHome && onHome();
        }}
        aria-label={`${name} — back to home`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space-3)",
          textDecoration: "none",
          borderRadius: "var(--radius-pill)",
          transition: "opacity var(--duration-fast) var(--ease-standard)",
        }}
        onMouseEnter={(e) => {
          const n = e.currentTarget.querySelector("[data-name]") as HTMLElement | null;
          if (n) n.style.color = "var(--color-brand-ink)";
        }}
        onMouseLeave={(e) => {
          const n = e.currentTarget.querySelector("[data-name]") as HTMLElement | null;
          if (n) n.style.color = "var(--text-strong)";
        }}
      >
        <Avatar src={src} initials={initials} size={size} ring={false} />
        <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span
            data-name
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "var(--text-base)",
              color: "var(--text-strong)",
              transition: "color var(--duration-fast) var(--ease-standard)",
              lineHeight: 1.2,
            }}
          >
            {name}
          </span>
          {intro && (
            <span
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--text-muted)",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {intro}
            </span>
          )}
        </span>
      </a>
    </div>
  );
}
