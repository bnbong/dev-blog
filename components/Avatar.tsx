import React from "react";

export interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: number;
  ring?: boolean;
  style?: React.CSSProperties;
}

/**
 * bnbong Avatar — round profile image with gold ring.
 * Falls back to initials when no `src`.
 */
export function Avatar({ src, alt = "", initials = "b", size = 48, ring = true, style, ...rest }: AvatarProps) {
  const ringStyle: React.CSSProperties = ring
    ? { boxShadow: "0 0 0 2px var(--surface-page), 0 0 0 4px var(--color-brand)" }
    : {};
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        background: "var(--gold-100)",
        color: "var(--color-brand-ink)",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: size * 0.4,
        ...ringStyle,
        ...style,
      }}
      {...rest}
    >
      {src ? (
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials
      )}
    </span>
  );
}
