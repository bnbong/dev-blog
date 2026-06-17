"use client";

import React from "react";
import Link from "next/link";
import { Avatar } from "./Avatar";

export interface PostSidebarProps {
  name: string;
  handle: string;
  role: string;
  intro: string;
  initials: string;
  /** Profile image URL (shared with the About page). Falls back to initials. */
  avatar?: string;
}

/**
 * Left profile rail for the blog post detail page.
 * Avatar, nickname and the "프로필 홈" link all navigate back home.
 */
export function PostSidebar({ name, handle, role, intro, initials, avatar }: PostSidebarProps) {
  return (
    <aside
      style={{
        flex: "1 1 12rem",
        maxWidth: "15rem",
        minWidth: "11rem",
        position: "sticky",
        top: "6rem",
        alignSelf: "flex-start",
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
    </aside>
  );
}
