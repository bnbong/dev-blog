"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  items?: TabItem[];
  value?: string;
  onChange?: (id: string) => void;
  style?: React.CSSProperties;
}

/**
 * bnbong Tabs — underline tab bar for the site's primary nav
 * (About / Blog / Projects). Controlled via `value` + `onChange`.
 */
export function Tabs({ items = [], value, onChange, style, ...rest }: TabsProps) {
  return (
    <div
      role="tablist"
      style={{
        display: "flex",
        gap: "var(--space-6)",
        borderBottom: "var(--border-width) solid var(--border-subtle)",
        ...style,
      }}
      {...rest}
    >
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange && onChange(it.id)}
            style={{
              position: "relative",
              appearance: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0 0 var(--space-3)",
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-md)",
              fontWeight: active ? 700 : 500,
              letterSpacing: "var(--tracking-snug)",
              color: active ? "var(--text-strong)" : "var(--text-muted)",
              transition: "color var(--duration-fast) var(--ease-standard)",
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.color = "var(--text-strong)";
            }}
            onMouseLeave={(e) => {
              if (!active) e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            {it.label}
            {it.count != null && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  color: active ? "var(--color-brand-ink)" : "var(--text-subtle)",
                  background: active ? "var(--color-brand-soft)" : "var(--surface-sunken)",
                  padding: "1px 7px",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                {it.count}
              </span>
            )}
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: -1,
                height: 3,
                borderRadius: "3px 3px 0 0",
                background: "var(--color-brand)",
                transform: active ? "scaleX(1)" : "scaleX(0)",
                transformOrigin: "left",
                transition: "transform var(--duration-normal) var(--ease-out)",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
