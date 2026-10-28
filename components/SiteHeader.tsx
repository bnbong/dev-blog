"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export interface SiteHeaderProps {
  postCount: number;
  projectCount: number;
}

/**
 * Sticky 64px Swiss header: logo square + wordmark · mono tabs · theme toggle.
 * The active tab's 2px cobalt underline sits flush on the header's bottom rule.
 * Detail routes keep their parent tab active (/blog/... → Blog).
 */
export function SiteHeader({ postCount, projectCount }: SiteHeaderProps) {
  const pathname = usePathname() || "/";

  const activeTab = pathname.startsWith("/blog")
    ? "blog"
    : pathname.startsWith("/projects")
      ? "projects"
      : "about";

  const tabItems: { id: string; label: string; href: string; count?: number }[] = [
    { id: "about", label: "About", href: "/" },
    { id: "blog", label: "Blog", href: "/blog", count: postCount },
    { id: "projects", label: "Projects", href: "/projects", count: projectCount },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "var(--surface-page)",
        borderBottom: "1px solid var(--border-strong)",
      }}
    >
      <div
        className="site-header__inner"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 clamp(20px, 4vw, 48px)",
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        <Link
          href="/"
          className="site-header__logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "var(--text-strong)",
            flex: "1 1 0",
            minWidth: "max-content",
          }}
        >
          <span aria-hidden style={{ width: 14, height: 14, background: "var(--color-brand)", display: "block" }} />
          <span
            className="site-header__wordmark"
            style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, letterSpacing: "-0.05em" }}
          >
            bnbong
          </span>
        </Link>

        <nav className="site-header__nav" style={{ display: "flex", gap: "clamp(16px, 3vw, 32px)", height: 64 }}>
          {tabItems.map((t) => {
            const active = t.id === activeTab;
            return (
              <Link
                key={t.id}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={active ? "site-tab site-tab--active" : "site-tab"}
              >
                {t.label}
                {t.count != null && (
                  <sup className="site-tab__count" style={active ? { fontSize: 10, opacity: 0.8 } : { fontSize: 10, color: "var(--text-subtle)" }}>
                    {t.count}
                  </sup>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="site-header__actions" style={{ flex: "1 1 0", display: "flex", justifyContent: "flex-end" }}>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
