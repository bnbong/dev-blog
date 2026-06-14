import React from "react";

/**
 * Centered page container. List/landing pages use the default 72rem; detail
 * pages pass a wider `max` so long-form content isn't crowded by huge side
 * margins on large screens.
 */
export function Container({
  children,
  max = "72rem",
  style,
}: {
  children: React.ReactNode;
  max?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className="page-container" style={{ width: "100%", maxWidth: max, margin: "0 auto", ...style }}>
      {children}
    </div>
  );
}
