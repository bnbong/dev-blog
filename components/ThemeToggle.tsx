"use client";

import React, { useSyncExternalStore } from "react";
import { getTheme, setTheme, subscribeTheme, type Theme } from "@/lib/theme";

/**
 * Header theme toggle. Shows the CURRENT theme ("Light"/"Dark"); the circle
 * icon is filled in dark mode. Styling lives in base.css (.theme-toggle) so
 * the hover inversion doesn't need JS.
 */
const getServerSnapshot = (): Theme => "light";

export function ThemeToggle() {
  // Server render can't know the theme ("light"); on the client the snapshot is
  // <html data-theme>, already set by THEME_INIT_SCRIPT before hydration.
  const theme: Theme = useSyncExternalStore(subscribeTheme, getTheme, getServerSnapshot);

  const dark = theme === "dark";

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      <span
        aria-hidden
        style={{
          width: 10,
          height: 10,
          border: "1.5px solid currentColor",
          borderRadius: "50%",
          background: dark ? "currentColor" : "transparent",
          display: "block",
          boxSizing: "border-box",
        }}
      />
      <span className="theme-toggle__label">{dark ? "Dark" : "Light"}</span>
    </button>
  );
}
