import React from "react";

/**
 * Centered page column. The side padding (clamp(20px,4vw,48px)) lives on the
 * root <main>, so this only caps the width (1280px by default) and adds no
 * vertical padding — pages set their own section rhythm. `max` is kept for
 * callers that want a narrower column.
 */
export function Container({
  children,
  max = "1280px",
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
