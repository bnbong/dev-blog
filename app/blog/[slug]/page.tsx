import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import { PostSidebar } from "@/components/PostSidebar";
import { Giscus } from "@/components/Giscus";
import { Container } from "@/components/Container";
import { Mermaid } from "@/components/Mermaid";

export async function generateStaticParams() {
  return (await getAllPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  const title = post ? `${post.title} — bnbong` : "Post — bnbong";
  if (!post) return { title };
  // Absolute OG image so social cards (and this site's own internal link cards) resolve it.
  const images = [{ url: /^https?:\/\//i.test(post.thumbnail) ? post.thumbnail : `${siteUrl}${post.thumbnail}` }];
  return {
    title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${siteUrl}/blog/${slug}/`,
      siteName: SITE_NAME,
      type: "article",
      publishedTime: isoDate(post.date),
      modifiedTime: isoDate(post.updated ?? post.date),
      images,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt, images },
  };
}

const SITE_NAME = new URL(siteUrl).hostname.replace(/^www\./i, "");

/** "2026.09.15" → "2026-09-15" (ISO date for OG timestamps). */
function isoDate(d: string): string | undefined {
  const m = d?.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : undefined;
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const updated = post.updated && post.updated !== post.date ? post.updated : undefined;

  return (
    <Container>
      <div style={{ padding: "40px 0 0" }}>
        <Link href="/blog" className="post-back" style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}>
          ← Writing
        </Link>
      </div>

      <header style={{ display: "flex", flexWrap: "wrap", gap: 24, padding: "40px 0 48px", borderBottom: "1px solid var(--border-strong)" }}>
        <div style={{ flex: "0 0 220px", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-brand-ink)" }}>{post.category}</div>
        <div style={{ flex: "1 1 560px", minWidth: 0 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(36px,5vw,64px)",
              lineHeight: 1.04,
              letterSpacing: "-0.045em",
              color: "var(--text-strong)",
              margin: post.excerpt ? "0 0 24px" : 0,
              textWrap: "balance",
            }}
          >
            {post.title}
          </h1>
          {post.excerpt && (
            <p style={{ margin: 0, fontSize: 19, lineHeight: 1.65, color: "var(--text-muted)", textWrap: "pretty" }}>{post.excerpt}</p>
          )}
        </div>
      </header>

      <div className="post-layout" style={{ display: "flex", flexWrap: "wrap", gap: 24, padding: "48px 0 96px" }}>
        <PostSidebar date={post.date} updated={updated} readingTime={post.readingTime} tags={post.tags} toc={post.toc} />

        <article style={{ flex: "1 1 560px", minWidth: 0 }}>
          <div className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
          {post.html.includes('class="mermaid"') && <Mermaid />}

          <Giscus />
        </article>
      </div>
    </Container>
  );
}
