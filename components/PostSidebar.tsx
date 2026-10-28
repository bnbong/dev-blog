"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { TocEntry } from "@/lib/markdown";

export interface PostSidebarProps {
  /** Display date (e.g. "2026.09.15"). */
  date: string;
  /** Last-updated date; only passed when it differs from `date`. */
  updated?: string;
  /** e.g. "8 min read". */
  readingTime: string;
  tags: string[];
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

const dt: React.CSSProperties = { color: "var(--text-subtle)" };
const dd: React.CSSProperties = { margin: 0, color: "var(--text-strong)" };

/**
 * Sticky left rail for the blog post detail page: author block (→ About),
 * Posted / Read / Tags meta, then the "On this page" TOC.
 */
export function PostSidebar({ date, updated, readingTime, tags, toc = [] }: PostSidebarProps) {
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
        flex: "0 0 220px",
        position: "sticky",
        top: 96,
        alignSelf: "flex-start",
        display: "flex",
        flexDirection: "column",
        gap: 28,
        // Bound the sticky rail to the viewport so a long TOC scrolls internally.
        maxHeight: "calc(100vh - 120px)",
      }}
    >
      <Link
        href="/"
        className="post-author"
        style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "var(--text-strong)" }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 44,
            height: 44,
            background: "var(--color-brand)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 17,
            letterSpacing: "-0.06em",
            flexShrink: 0,
          }}
        >
          bb
        </span>
        <span>
          <span style={{ display: "block", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>
            이준혁
          </span>
          <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-subtle)" }}>
            @bnbong · 프로필 홈 →
          </span>
        </span>
      </Link>

      <dl
        style={{
          margin: 0,
          display: "grid",
          gridTemplateColumns: "72px 1fr",
          gap: "10px 12px",
          fontFamily: "var(--font-mono)",
          fontSize: 12.5,
          paddingTop: 20,
          borderTop: "1px solid var(--border-strong)",
        }}
      >
        <dt style={dt}>Posted</dt>
        <dd style={dd}>{date}</dd>
        {updated && (
          <>
            <dt style={dt}>Updated</dt>
            <dd style={dd}>{updated}</dd>
          </>
        )}
        <dt style={dt}>Read</dt>
        <dd style={dd}>{readingTime}</dd>
        {tags.length > 0 && (
          <>
            <dt style={dt}>Tags</dt>
            <dd style={{ ...dd, lineHeight: 1.6 }}>{tags.map((t) => `#${t}`).join("  ")}</dd>
          </>
        )}
      </dl>

      {toc.length > 0 && (
        <nav
          aria-label="목차"
          className="post-toc"
          style={{
            paddingTop: 20,
            borderTop: "1px solid var(--border-subtle)",
            fontFamily: "var(--font-mono)",
            fontSize: 12.5,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            // Fill the leftover height in the viewport-bounded aside and scroll
            // internally so the last items stay reachable regardless of length.
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
          }}
        >
          <span style={{ color: "var(--text-subtle)", marginBottom: 2 }}>On this page</span>
          {toc.map((item) => {
            const isActive = active === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => onTocClick(e, item.id)}
                className={isActive ? "post-toc__link is-active" : "post-toc__link"}
                aria-current={isActive ? "location" : undefined}
                style={{
                  paddingLeft: item.depth >= 3 ? 14 : 0,
                  lineHeight: 1.45,
                  textDecoration: "none",
                }}
              >
                {isActive ? `■ ${item.text}` : item.text}
              </a>
            );
          })}
        </nav>
      )}
    </aside>
  );
}
