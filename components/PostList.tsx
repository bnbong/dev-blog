import React from "react";
import { PostCard, PostCardData } from "./PostCard";

export interface PostListItem extends PostCardData {
  slug: string;
}

export function PostList({ posts }: { posts: PostListItem[] }) {
  return (
    <div>
      {posts.map((p) => (
        <PostCard key={p.slug} post={p} layout="row" href={`/blog/${p.slug}`} />
      ))}
    </div>
  );
}
