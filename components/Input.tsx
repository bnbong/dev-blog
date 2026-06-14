"use client";

import React from "react";

type Size = "sm" | "md" | "lg";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "style"> {
  label?: string;
  iconLeft?: React.ReactNode;
  hint?: string;
  invalid?: boolean;
  size?: Size;
  style?: React.CSSProperties;
}

/**
 * bnbong Input — text field with optional leading icon & label.
 * Use for search (blog/projects filter) and forms.
 */
export function Input({ label, iconLeft, hint, invalid = false, size = "md", style, id, ...rest }: InputProps) {
  const sizes: Record<Size, React.CSSProperties> = {
    sm: { height: "34px", fontSize: "var(--text-sm)" },
    md: { height: "42px", fontSize: "var(--text-base)" },
    lg: { height: "50px", fontSize: "var(--text-md)" },
  };
  const inputId = id || (label ? `in-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", ...style }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--text-strong)",
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          height: sizes[size].height,
          padding: "0 var(--space-4)",
          background: "var(--surface-raised)",
          border: `var(--border-width) solid ${invalid ? "var(--color-danger)" : "var(--border-default)"}`,
          borderRadius: "var(--radius-md)",
          transition:
            "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
        }}
        onFocusCapture={(e) => {
          e.currentTarget.style.borderColor = "var(--border-focus)";
          e.currentTarget.style.boxShadow = "var(--ring-brand)";
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.borderColor = invalid ? "var(--color-danger)" : "var(--border-default)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {iconLeft && <span style={{ color: "var(--text-subtle)", display: "inline-flex" }}>{iconLeft}</span>}
        <input
          id={inputId}
          style={{
            flex: 1,
            appearance: "none",
            background: "none",
            border: "none",
            outline: "none",
            fontFamily: "var(--font-body)",
            fontSize: sizes[size].fontSize,
            color: "var(--text-strong)",
            minWidth: 0,
          }}
          {...rest}
        />
      </div>
      {hint && (
        <span style={{ fontSize: "var(--text-xs)", color: invalid ? "var(--color-danger)" : "var(--text-subtle)" }}>
          {hint}
        </span>
      )}
    </div>
  );
}
