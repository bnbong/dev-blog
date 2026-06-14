"use client";

import React from "react";
import Link from "next/link";
import { Tag } from "./Tag";
import { Badge } from "./Badge";

export type ProjectStatus = "active" | "archived" | "wip";

export interface ProjectCardData {
  name: string;
  description?: string;
  stack?: string[];
  stars?: number;
  status?: ProjectStatus;
  year?: number;
}

export interface ProjectCardProps {
  project?: ProjectCardData;
  /** When set, the whole card is a link to this route (keyboard + open-in-new-tab). */
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  style?: React.CSSProperties;
}

/**
 * bnbong ProjectCard — project tile that opens a project write-up.
 * status: "active" | "archived" | "wip"
 */
export function ProjectCard({ project = { name: "" }, href, onClick, style, ...rest }: ProjectCardProps) {
  const { name, description, stack = [], stars, status, year } = project;
  const statusTone = ({ active: "success", wip: "warning", archived: "neutral" } as const)[status ?? "active"] || "neutral";
  const statusLabel = status ? ({ active: "Active", wip: "WIP", archived: "Archived" } as const)[status] : undefined;
  const interactive = !!href || !!onClick;

  const article = (
    <article
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        padding: "var(--space-5)",
        background: "var(--surface-card)",
        border: "var(--border-width) solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        height: "100%",
        cursor: interactive ? "pointer" : "default",
        transition:
          "transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out), border-color var(--duration-fast) var(--ease-standard)",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!interactive) return;
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "var(--shadow-lg)";
        e.currentTarget.style.borderColor = "var(--border-brand)";
      }}
      onMouseLeave={(e) => {
        if (!interactive) return;
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        e.currentTarget.style.borderColor = "var(--border-subtle)";
      }}
      {...rest}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <span style={{ display: "inline-flex", color: "var(--color-brand-strong)" }} aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
        </span>
        <h3
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: 700,
            color: "var(--text-strong)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "var(--tracking-snug)",
          }}
        >
          {name}
        </h3>
        {statusLabel && (
          <Badge tone={statusTone} dot style={{ marginLeft: "auto" }}>
            {statusLabel}
          </Badge>
        )}
      </div>
      {description && (
        <p
          style={{
            margin: 0,
            color: "var(--text-muted)",
            fontSize: "var(--text-base)",
            lineHeight: "var(--leading-normal)",
            textWrap: "pretty",
            flex: 1,
          }}
        >
          {description}
        </p>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
        {stack.map((s) => (
          <Tag key={s} tone="brand" size="sm">
            {s}
          </Tag>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          marginTop: "var(--space-1)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: "var(--text-subtle)",
        }}
      >
        {stars != null && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="m12 2 2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" />
            </svg>
            {stars}
          </span>
        )}
        {year && <span>{year}</span>}
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} aria-label={name} style={{ display: "block", height: "100%", color: "inherit", textDecoration: "none" }}>
        {article}
      </Link>
    );
  }
  return article;
}
