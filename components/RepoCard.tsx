"use client";

import React from "react";
import { Tag } from "./Tag";

export interface RepoCardData {
  owner?: string;
  name?: string;
  description?: string;
  language?: string;
  languageColor?: string;
  stars?: number;
  forks?: number;
  url?: string;
  stack?: string[];
}

export interface RepoCardProps {
  repo?: RepoCardData;
  style?: React.CSSProperties;
}

/**
 * bnbong RepoCard — large GitHub "social card" linking to a repository.
 * Used at the top of a project detail page.
 */
export function RepoCard({ repo = {}, style, ...rest }: RepoCardProps) {
  const {
    owner = "bnbong",
    name,
    description,
    language,
    languageColor = "var(--color-brand)",
    stars,
    forks,
    url = "#",
    stack = [],
  } = repo;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      style={{
        display: "block",
        textDecoration: "none",
        background: "var(--surface-card)",
        border: "var(--border-width) solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        boxShadow: "var(--shadow-md)",
        transition:
          "transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out), border-color var(--duration-fast) var(--ease-standard)",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "var(--shadow-lg)";
        e.currentTarget.style.borderColor = "var(--border-brand)";
        const cta = e.currentTarget.querySelector("[data-cta]") as HTMLElement | null;
        if (cta) cta.style.gap = "var(--space-3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.borderColor = "var(--border-default)";
        const cta = e.currentTarget.querySelector("[data-cta]") as HTMLElement | null;
        if (cta) cta.style.gap = "var(--space-2)";
      }}
      {...rest}
    >
      {/* top band — gold wash with repo identity */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          padding: "var(--space-5) var(--space-6)",
          background: "linear-gradient(180deg, var(--color-brand-tint), transparent)",
          borderBottom: "var(--border-width) solid var(--border-subtle)",
        }}
      >
        <span style={{ display: "inline-flex", color: "var(--text-strong)" }} aria-hidden>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.84c.85 0 1.71.12 2.51.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.35 4.81-4.58 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
          </svg>
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-md)",
            color: "var(--text-muted)",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {owner}
          <span style={{ opacity: 0.5 }}> / </span>
          <span style={{ color: "var(--text-strong)", fontWeight: 700 }}>{name}</span>
        </span>
        <span
          data-cta
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-2)",
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-sm)",
            fontWeight: 600,
            color: "var(--color-brand-ink)",
            transition: "gap var(--duration-fast) var(--ease-standard)",
            whiteSpace: "nowrap",
          }}
        >
          View on GitHub
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6" />
            <path d="M10 14 21 3" />
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          </svg>
        </span>
      </div>

      {/* body */}
      <div style={{ padding: "var(--space-5) var(--space-6) var(--space-6)" }}>
        {description && (
          <p
            style={{
              margin: "0 0 var(--space-5)",
              color: "var(--text-body)",
              fontSize: "var(--text-md)",
              lineHeight: "var(--leading-normal)",
              textWrap: "pretty",
            }}
          >
            {description}
          </p>
        )}

        {stack.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
            {stack.map((s) => (
              <Tag key={s} tone="brand" size="sm">
                {s}
              </Tag>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-5)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-sm)",
            color: "var(--text-muted)",
          }}
        >
          {language && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: languageColor }} />
              {language}
            </span>
          )}
          {stars != null && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="m12 2 2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7z" />
              </svg>
              {stars}
            </span>
          )}
          {forks != null && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="6" cy="6" r="2.5" />
                <circle cx="18" cy="6" r="2.5" />
                <circle cx="12" cy="19" r="2.5" />
                <path d="M6 8.5V11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8.5M12 13v3.5" />
              </svg>
              {forks}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
