"use client";

import React from "react";
import Link from "next/link";
import { Tag } from "./Tag";
import { Badge } from "./Badge";

export interface PostCardData {
  title: string;
  excerpt?: string;
  date?: string;
  readingTime?: string;
  tags?: string[];
  isNew?: boolean;
  thumbnail?: string;
}

export interface PostCardProps {
  post?: PostCardData;
  layout?: "row" | "tile";
  /** When set, the whole card is a link to this route (keyboard + open-in-new-tab). */
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  style?: React.CSSProperties;
}

/**
 * bnbong PostCard — blog post preview row/tile.
 * layout: "row" (list) | "tile" (grid)
 */
export function PostCard({ post = { title: "" }, layout = "row", href, onClick, style, ...rest }: PostCardProps) {
  const { title, excerpt, date, readingTime, tags = [], isNew, thumbnail } = post;
  const isTile = layout === "tile";
  const interactive = !!href || !!onClick;
  const article = (
    <article
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isTile ? 0 : "var(--space-3)",
        padding: isTile ? 0 : "var(--space-5) 0",
        background: isTile ? "var(--surface-card)" : "transparent",
        border: isTile ? "var(--border-width) solid var(--border-subtle)" : "none",
        borderBottom: "var(--border-width) solid var(--border-subtle)",
        borderRadius: isTile ? "var(--radius-lg)" : 0,
        overflow: isTile ? "hidden" : undefined,
        boxShadow: isTile ? "var(--shadow-sm)" : "none",
        cursor: interactive ? "pointer" : "default",
        transition:
          "transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out), border-color var(--duration-fast) var(--ease-standard)",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!interactive) return;
        if (isTile) {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "var(--shadow-lg)";
        }
        const h = e.currentTarget.querySelector("[data-title]") as HTMLElement | null;
        if (h) h.style.color = "var(--color-brand-ink)";
      }}
      onMouseLeave={(e) => {
        if (!interactive) return;
        if (isTile) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        }
        const h = e.currentTarget.querySelector("[data-title]") as HTMLElement | null;
        if (h) h.style.color = "var(--text-strong)";
      }}
      {...rest}
    >
      {isTile && thumbnail && (
        <img
          src={thumbnail}
          alt=""
          loading="lazy"
          draggable={false}
          style={{
            display: "block",
            width: "100%",
            aspectRatio: "16 / 9",
            objectFit: "cover",
            background: "var(--surface-sunken)",
            borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          flexDirection: isTile ? "column" : "row",
          alignItems: isTile ? "stretch" : "flex-start",
          gap: "var(--space-4)",
          padding: isTile ? "var(--space-5)" : 0,
          minWidth: 0,
        }}
      >
        {!isTile && thumbnail && (
          <img
            src={thumbnail}
            alt=""
            loading="lazy"
            draggable={false}
            style={{
              flexShrink: 0,
              order: 1,
              width: 108,
              height: 81,
              objectFit: "cover",
              background: "var(--surface-sunken)",
              borderRadius: "var(--radius-md)",
              border: "var(--border-width) solid var(--border-subtle)",
            }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-3)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--text-subtle)",
            }}
          >
            <time>{date}</time>
            {readingTime && (
              <>
                <span style={{ opacity: 0.5 }}>·</span>
                <span>{readingTime}</span>
              </>
            )}
            {isNew && <Badge tone="brand" style={{ marginLeft: "auto" }}>New</Badge>}
          </div>
          <h3
            data-title
            style={{
              fontSize: isTile ? "var(--text-lg)" : "var(--text-xl)",
              fontWeight: 700,
              color: "var(--text-strong)",
              lineHeight: "var(--leading-snug)",
              transition: "color var(--duration-fast) var(--ease-standard)",
            }}
          >
            {title}
          </h3>
          {excerpt && (
            <p
              style={{
                margin: 0,
                color: "var(--text-muted)",
                fontSize: "var(--text-base)",
                lineHeight: "var(--leading-normal)",
                textWrap: "pretty",
              }}
            >
              {excerpt}
            </p>
          )}
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginTop: "var(--space-1)" }}>
              {tags.map((t) => (
                <Tag key={t} tone="neutral" size="sm">
                  {t}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} aria-label={title} style={{ display: "block", color: "inherit", textDecoration: "none" }}>
        {article}
      </Link>
    );
  }
  return article;
}
