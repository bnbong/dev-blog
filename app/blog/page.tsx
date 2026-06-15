import React from "react";
import { getAllPosts } from "@/lib/content";
import { BlogIndex } from "@/components/BlogIndex";
import { Container } from "@/components/Container";

export const metadata = { title: "Blog — bnbong" };

export default async function BlogPage() {
  const posts = (await getAllPosts()).map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    date: p.date,
    readingTime: p.readingTime,
    tags: p.tags,
    isNew: p.isNew,
  }));

  return (
    <Container>
      <BlogIndex posts={posts} />
    </Container>
  );
}
