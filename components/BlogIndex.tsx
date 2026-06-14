"use client";

import React, { useMemo, useState } from "react";
import { PostCard } from "./PostCard";
import { Tag } from "./Tag";
import { Input } from "./Input";
import type { PostListItem } from "./PostList";

/** Tags used at least this many times are shown by default; the rest collapse behind "더보기". */
const PRIMARY_MIN_COUNT = 2;

export function BlogIndex({ posts }: { posts: PostListItem[] }) {
  const [query, setQuery] = useState("");
  const [blogTag, setBlogTag] = useState("All");
  const [showAllTags, setShowAllTags] = useState(false);

  // tag → post count, sorted by frequency then alphabetically
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    posts.forEach((p) => (p.tags ?? []).forEach((t) => { c[t] = (c[t] || 0) + 1; }));
    return c;
  }, [posts]);

  const sortedTags = useMemo(
    () => Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b)),
    [counts],
  );

  const primary = sortedTags.filter((t) => counts[t] >= PRIMARY_MIN_COUNT);
  const secondary = sortedTags.filter((t) => counts[t] < PRIMARY_MIN_COUNT);

  // Visible set: primary always; secondary only when expanded — but always keep
  // the currently-selected tag visible even if it lives in the collapsed tail.
  const visibleTags = showAllTags
    ? sortedTags
    : [...primary, ...(blogTag !== "All" && secondary.includes(blogTag) ? [blogTag] : [])];

  const q = query.trim().toLowerCase();
  const filteredPosts = posts.filter((p) => {
    const okTag = blogTag === "All" || (p.tags ?? []).includes(blogTag);
    const okQ = !q || p.title.toLowerCase().includes(q) || (p.excerpt ?? "").toLowerCase().includes(q);
    return okTag && okQ;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "3rem", letterSpacing: "-0.02em", color: "var(--text-strong)", margin: "0 0 0.5rem" }}>
          Blog
        </h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "1.125rem" }}>
          기술 블로그 포스팅 모음집 입니다.
        </p>
      </div>

      <div style={{ maxWidth: "26rem" }}>
        <Input placeholder="Search posts…" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
        <Tag interactive active={blogTag === "All"} onClick={() => setBlogTag("All")}>
          All
        </Tag>
        {visibleTags.map((t) => (
          <Tag key={t} interactive active={blogTag === t} onClick={() => setBlogTag(t)}>
            {t}
            <span style={{ opacity: 0.5, marginLeft: 4 }}>{counts[t]}</span>
          </Tag>
        ))}
        {secondary.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAllTags((v) => !v)}
            style={{
              appearance: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 6px",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: "0.8125rem",
              color: "var(--text-link)",
            }}
          >
            {showAllTags ? "접기 ↑" : `더보기 +${secondary.length}`}
          </button>
        )}
      </div>

      <div>
        {filteredPosts.length > 0 ? (
          <div>
            {filteredPosts.map((p) => (
              <PostCard key={p.slug} post={p} layout="row" href={`/blog/${p.slug}`} />
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--text-subtle)", padding: "2.5rem 0", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}>
            No posts match “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}
