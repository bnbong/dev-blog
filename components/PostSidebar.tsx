"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "./Avatar";
import type { TocEntry } from "@/lib/markdown";

export interface PostSidebarProps {
  name: string;
  handle: string;
  role: string;
  intro: string;
  initials: string;
  /** Profile image URL (shared with the About page). Falls back to initials. */
  avatar?: string;
  /** Heading outline (h2/h3) for the on-this-page table of contents. */
  toc?: TocEntry[];
}

/** Highlights the heading currently scrolled into the top of the viewport. */
function useActiveHeading(toc: TocEntry[]): string {
  const [active, setActive] = useState("");

  useEffect(() => {
    if (toc.length === 0) return;
    const els = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      // Treat a heading as "active" once it enters the top ~30% of the viewport
      // (offset for the sticky site header).
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  return active;
}

/**
 * Left profile rail for the blog post detail page.
 * Avatar, nickname and the "프로필 홈" link all navigate back home.
 */
export function PostSidebar({ name, handle, role, intro, initials, avatar, toc = [] }: PostSidebarProps) {
  const active = useActiveHeading(toc);

  const onTocClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <aside
      className="post-sidebar"
      style={{
        flex: "1 1 12rem",
        maxWidth: "15rem",
        minWidth: "11rem",
        position: "sticky",
        top: "6rem",
        alignSelf: "flex-start",
        // Bound the sticky rail to the viewport so a long TOC scrolls internally
        // (the nav below grows into the leftover space and scrolls on its own).
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100vh - 7rem)",
      }}
    >
      <Link
        href="/"
        style={{ display: "inline-flex", flexDirection: "column", gap: "0.875rem", textDecoration: "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.78")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        <Avatar src={avatar} alt={name} initials={initials} size={72} />
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.125rem", color: "var(--text-strong)", lineHeight: 1.2 }}>
            {name}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--color-brand-ink)", marginTop: "0.125rem" }}>
            {handle}
          </div>
        </div>
      </Link>
      <p style={{ margin: "0.875rem 0 0", fontSize: "0.9375rem", color: "var(--text-muted)", lineHeight: 1.62, textWrap: "pretty" }}>
        {intro}
      </p>
      <div style={{ height: "1px", background: "var(--border-subtle)", margin: "1.25rem 0" }} />
      <p style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-subtle)", letterSpacing: "-0.01em" }}>
        {role}
      </p>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          marginTop: "1rem",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "0.8125rem",
          color: "var(--text-muted)",
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-strong)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5 12 3l9 6.5" />
          <path d="M5 9v11h14V9" />
        </svg>
        프로필 홈
      </Link>

      {toc.length > 0 && (
        <nav
          aria-label="목차"
          className="post-toc"
          style={{
            marginTop: "1.5rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid var(--border-subtle)",
            // Fill the leftover height in the viewport-bounded aside and scroll
            // internally so the last items stay reachable regardless of length.
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
          }}
        >
          <p style={{ margin: "0 0 0.625rem", fontFamily: "var(--font-mono)", fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--text-subtle)" }}>
            On this page
          </p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.125rem" }}>
            {toc.map((item) => {
              const isActive = active === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={(e) => onTocClick(e, item.id)}
                    style={{
                      display: "block",
                      padding: "0.25rem 0",
                      paddingLeft: item.depth === 3 ? "0.875rem" : "0",
                      borderLeft: "2px solid",
                      borderLeftColor: isActive ? "var(--color-brand)" : "transparent",
                      marginLeft: "-0.0625rem",
                      paddingInlineStart: item.depth === 3 ? "1rem" : "0.625rem",
                      fontFamily: "var(--font-display)",
                      fontSize: item.depth === 3 ? "0.8125rem" : "0.85rem",
                      fontWeight: isActive ? 600 : 400,
                      lineHeight: 1.4,
                      color: isActive ? "var(--color-brand-ink)" : "var(--text-muted)",
                      textDecoration: "none",
                      transition: "color 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "var(--text-strong)"; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "var(--text-muted)"; }}
                  >
                    {item.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </aside>
  );
}
