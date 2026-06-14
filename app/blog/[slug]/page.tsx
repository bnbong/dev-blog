import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/content";
import { profile } from "@/lib/site";
import { Tag } from "@/components/Tag";
import { PostSidebar } from "@/components/PostSidebar";
import { Giscus } from "@/components/Giscus";
import { Container } from "@/components/Container";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  return { title: post ? `${post.title} — bnbong` : "Post — bnbong", description: post?.excerpt };
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const hasUpdate = post.updated && post.updated !== post.date;

  return (
    <Container max="86rem">
    <article>
      <Link
        href="/blog"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          color: "var(--text-muted)",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "0.875rem",
          textDecoration: "none",
          marginBottom: "1.75rem",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
        Back to blog
      </Link>

      <div style={{ display: "flex", gap: "3.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
        <PostSidebar
          name={profile.name}
          handle={profile.handle}
          role={profile.role}
          intro={post.intro ?? profile.intro}
          initials={profile.initials}
        />

        <div style={{ flex: "99 1 30rem", minWidth: 0 }}>
          <header style={{ marginBottom: "2rem", paddingBottom: "1.75rem", borderBottom: "1px solid var(--border-subtle)" }}>
            {post.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
                {post.tags.map((tag) => (
                  <Tag key={tag} tone="brand">
                    {tag}
                  </Tag>
                ))}
              </div>
            )}
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "2.75rem", lineHeight: 1.1, letterSpacing: "-0.02em", color: "var(--text-strong)", margin: "0 0 1.25rem", textWrap: "balance" }}>
              {post.title}
            </h1>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "1rem", fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--text-subtle)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                </svg>
                {post.category}
              </span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4.5" width="18" height="17" rx="2" />
                  <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
                </svg>
                <span style={{ opacity: 0.7 }}>Posted</span> {post.date}
              </span>
              {hasUpdate && (
                <>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                    <span style={{ opacity: 0.7 }}>Updated</span> {post.updated}
                  </span>
                </>
              )}
              <span style={{ opacity: 0.4 }}>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                {post.readingTime}
              </span>
            </div>
          </header>

          <div className="prose" style={{ maxWidth: "none" }} dangerouslySetInnerHTML={{ __html: post.html }} />

          <Giscus />
        </div>
      </div>
    </article>
    </Container>
  );
}
