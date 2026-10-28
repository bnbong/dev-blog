/**
 * Site theme (light | dark), applied as <html data-theme="...">.
 *
 * The initial value is set before first paint by THEME_INIT_SCRIPT (inlined in
 * app/layout.tsx): a saved choice in localStorage wins, otherwise the OS
 * `prefers-color-scheme`. Client components read/write it through these
 * helpers; every change dispatches a `themechange` CustomEvent on window so
 * Mermaid/Giscus can re-theme themselves.
 */

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";
export const THEME_EVENT = "themechange";

/** Runs in <head> before hydration; keep it tiny and dependency-free. */
export const THEME_INIT_SCRIPT = `(function(){var t=null;try{t=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}try{if(t!=="light"&&t!=="dark"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}}catch(e){t="light"}document.documentElement.dataset.theme=t})();`;

export function getTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // storage unavailable (private mode etc.) — theme still applies for this page
  }
  window.dispatchEvent(new CustomEvent<Theme>(THEME_EVENT, { detail: theme }));
}

/** Subscribe to theme changes; returns an unsubscribe function. */
export function subscribeTheme(cb: (theme: Theme) => void): () => void {
  const handler = (e: Event) => {
    const t = (e as CustomEvent<Theme>).detail;
    cb(t === "dark" ? "dark" : "light");
  };
  window.addEventListener(THEME_EVENT, handler);
  return () => window.removeEventListener(THEME_EVENT, handler);
}
