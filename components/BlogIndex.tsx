"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

/** Mirrors DEFAULT_THUMBNAIL in lib/content.ts (not imported: that module is server-only). */
const DEFAULT_THUMBNAIL = "/assets/new_profile.png";
const ALL = "All";

export interface PostListItem {
  slug: string;
  title: string;
  excerpt?: string;
  category?: string;
  date?: string;
  readingTime?: string;
  tags?: string[];
  isNew?: boolean;
  thumbnail?: string;
}

/** Sync `?category=..&q=..` into the URL without a navigation (static export friendly). */
function writeQuery(category: string, query: string) {
  const params = new URLSearchParams(window.location.search);
  if (category && category !== ALL) params.set("category", category);
  else params.delete("category");
  if (query) params.set("q", query);
  else params.delete("q");
  const qs = params.toString();
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`);
}

export function BlogIndex({ posts }: { posts: PostListItem[] }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState(ALL);

  // Restore filter state from the URL once on mount (no useSearchParams → no Suspense needed).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("category");
    const q = params.get("q");
    // Unknown categories (stale/hand-edited links) fall back to "All".
    if (c && posts.some((p) => p.category === c)) setCat(c);
    else if (c) writeQuery(ALL, q ?? "");
    if (q) setQuery(q);
  }, [posts]);

  // Categories in order of first appearance (posts are newest-first), "All" on top.
  const filters = useMemo(() => {
    const order: string[] = [];
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      const c = p.category;
      if (!c) return;
      if (!(c in counts)) order.push(c);
      counts[c] = (counts[c] || 0) + 1;
    });
    return [{ label: ALL, count: posts.length }, ...order.map((label) => ({ label, count: counts[label] }))];
  }, [posts]);

  const q = query.trim().toLowerCase();
  const filteredPosts = posts.filter((p) => {
    const okCat = cat === ALL || p.category === cat;
    const okQ = !q || `${p.title} ${p.excerpt ?? ""} ${(p.tags ?? []).join(" ")}`.toLowerCase().includes(q);
    return okCat && okQ;
  });

  const selectCat = (c: string) => () => {
    setCat(c);
    writeQuery(c, query);
  };

  const onQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    writeQuery(cat, e.target.value);
  };

  return (
    <>
      <section
        style={{
          padding: "64px 0 32px",
          borderBottom: "1px solid var(--border-strong)",
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          alignItems: "flex-end",
        }}
      >
        <div style={{ flex: "0 0 160px", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)" }}>
          <b style={{ display: "block", color: "var(--text-strong)", fontWeight: 500, marginBottom: 6 }}>B</b>
          {posts.length} posts
        </div>
        <div
          style={{
            flex: "1 1 560px",
            display: "flex",
            flexWrap: "wrap",
            gap: 24,
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(56px,9vw,120px)",
              lineHeight: 0.86,
              letterSpacing: "-0.06em",
              color: "var(--text-strong)",
              margin: 0,
            }}
          >
            Writing<span style={{ color: "var(--color-brand)" }}>.</span>
          </h1>
          <label
            style={{
              flex: "0 1 320px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderBottom: "1px solid var(--border-strong)",
              padding: "8px 0",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--text-subtle)",
            }}
          >
            검색
            <input
              type="text"
              value={query}
              onChange={onQuery}
              placeholder="제목, 내용, 태그"
              style={{
                flex: 1,
                minWidth: 0,
                border: 0,
                outline: 0,
                background: "transparent",
                font: "inherit",
                color: "var(--text-strong)",
                padding: 0,
              }}
            />
          </label>
        </div>
      </section>

      <section style={{ display: "flex", flexWrap: "wrap", gap: 24, padding: "32px 0 80px" }}>
        <nav
          aria-label="카테고리"
          className="blog-rail"
          style={{
            flex: "0 0 160px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            fontFamily: "var(--font-mono)",
            fontSize: 13,
          }}
        >
          {filters.map((f) => {
            const active = cat === f.label;
            return (
              <button
                key={f.label}
                type="button"
                onClick={selectCat(f.label)}
                aria-pressed={active}
                className={active ? "blog-filter blog-filter--active" : "blog-filter"}
              >
                <span>{active ? `■ ${f.label}` : f.label}</span>
                <span className="blog-filter__count">{f.count}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ flex: "1 1 560px", minWidth: 0 }}>
          {filteredPosts.map((p) => {
            const hasImage = !!p.thumbnail && p.thumbnail !== DEFAULT_THUMBNAIL;
            return (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-row">
                <span style={{ flex: "1 1 200px", minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {hasImage ? (
                    <span className="blog-thumb blog-thumb--image">
                      {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimizer */}
                      <img src={p.thumbnail} alt="" loading="lazy" />
                    </span>
                  ) : (
                    <span className="blog-thumb blog-thumb--fallback">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, opacity: 0.7 }}>{p.date}</span>
                      <span
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 800,
                          fontSize: 26,
                          lineHeight: 0.9,
                          letterSpacing: "-0.05em",
                        }}
                      >
                        {p.category}
                      </span>
                    </span>
                  )}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--text-subtle)",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ color: "var(--color-brand-ink)" }}>{p.category}</span>
                    {p.readingTime}
                  </span>
                </span>
                <span style={{ flex: "999 1 280px", minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)" }}>{p.date}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: "-0.025em",
                      lineHeight: 1.3,
                      textWrap: "pretty",
                    }}
                  >
                    {p.title}
                  </span>
                  {p.excerpt && (
                    <span style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-muted)", textWrap: "pretty" }}>
                      {p.excerpt}
                    </span>
                  )}
                  {p.tags && p.tags.length > 0 && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-subtle)", whiteSpace: "pre-wrap" }}>
                      {p.tags.map((t) => `#${t}`).join("  ")}
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
          {filteredPosts.length === 0 && (
            <p
              style={{
                margin: 0,
                padding: "48px 0",
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                color: "var(--text-subtle)",
              }}
            >
              “{query}”에 해당하는 글이 없습니다.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
