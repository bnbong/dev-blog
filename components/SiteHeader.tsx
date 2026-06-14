"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Tabs } from "./Tabs";

export interface SiteHeaderProps {
  postCount: number;
  projectCount: number;
}

const ROUTE_BY_TAB: Record<string, string> = {
  about: "/",
  blog: "/blog",
  projects: "/projects",
};

export function SiteHeader({ postCount, projectCount }: SiteHeaderProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";

  const activeTab = pathname.startsWith("/blog")
    ? "blog"
    : pathname.startsWith("/projects")
      ? "projects"
      : "about";

  const tabItems = [
    { id: "about", label: "About" },
    { id: "blog", label: "Blog", count: postCount },
    { id: "projects", label: "Projects", count: projectCount },
  ];

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "color-mix(in srgb, var(--surface-page) 88%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        className="site-header__inner"
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          height: "4.5rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/logo-mark.svg" width={34} height={34} alt="bnbong" />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.375rem",
              color: "var(--text-strong)",
              letterSpacing: "-0.02em",
            }}
          >
            bnbong
          </span>
        </Link>
        <nav className="site-header__nav" style={{ alignSelf: "flex-end", display: "flex" }}>
          <Tabs
            items={tabItems}
            value={activeTab}
            onChange={(id) => router.push(ROUTE_BY_TAB[id] ?? "/")}
          />
        </nav>
      </div>
    </header>
  );
}
