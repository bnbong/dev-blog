import React from "react";
import Link from "next/link";

export type ProjectStatus = "active" | "archived" | "wip";

export interface ProjectCardData {
  slug?: string;
  name: string;
  description?: string;
  stack?: string[];
  status?: ProjectStatus;
  period?: string;
  year?: number;
  thumbnail?: string;
  /** Unused by the Swiss card; kept so existing callers still type-check. */
  stars?: number;
}

export interface ProjectCardProps {
  project: ProjectCardData;
  /** 0-based position; rendered as "No.01". */
  index?: number;
  href: string;
  /**
   * Projects-page variant: larger cover type + a title line above the
   * description. The About grid leaves it off (cover name + description only).
   */
  showText?: boolean;
}

/** Mirrors DEFAULT_THUMBNAIL in lib/content.ts (not imported: that module reads the filesystem). */
const DEFAULT_THUMBNAIL = "/assets/new_profile.png";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "● Active",
  wip: "● WIP",
  archived: "Archived",
};

/** "Overlock (오버로크)" → "Overlock" */
export function shortProjectName(name: string): string {
  const short = name.replace(/\s*[(（][^)）]*[)）]\s*/g, " ").trim();
  return short || name;
}

/**
 * Swiss project tile: 4:3 cover (No. + status on top, short name at the bottom)
 * with a cobalt fill on hover (.project-cover in base.css), then a mono meta
 * row (period ↔ first two stack items) and the description.
 * A real thumbnail is laid under the cover; the default site image is ignored.
 */
export function ProjectCard({ project, index, href, showText = false }: ProjectCardProps) {
  const { name, description, stack = [], status, period, year, thumbnail } = project;
  const short = shortProjectName(name);
  const no = index != null ? `No.${String(index + 1).padStart(2, "0")}` : "";
  const statusLabel = status ? STATUS_LABEL[status] : "";
  const when = period || (year ? String(year) : "");
  const stackShort = stack.slice(0, 2).join(" · ");
  const image = thumbnail && thumbnail !== DEFAULT_THUMBNAIL ? thumbnail : undefined;

  return (
    <Link
      href={href}
      className="project-card"
      aria-label={name}
      style={{ display: "flex", flexDirection: "column", textDecoration: "none", color: "var(--text-strong)" }}
    >
      <div
        className={image ? "project-cover project-cover--image" : "project-cover"}
        style={{ padding: showText ? 20 : 18 }}
      >
        {image && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="project-cover__img" src={image} alt="" loading="lazy" draggable={false} />
            <span className="project-cover__shade" aria-hidden />
          </>
        )}
        <span
          className="project-cover__row"
          style={{ fontFamily: "var(--font-mono)", fontSize: 12, display: "flex", justifyContent: "space-between", gap: 12 }}
        >
          <span>{no}</span>
          <span>{statusLabel}</span>
        </span>
        <span
          className="project-cover__name"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: showText ? "clamp(32px, 3.4vw, 46px)" : "clamp(30px, 3.2vw, 42px)",
            lineHeight: 0.92,
            letterSpacing: "-0.045em",
            textWrap: showText ? "balance" : undefined,
            overflowWrap: "anywhere",
          }}
        >
          {short}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--text-muted)",
          padding: "14px 0 10px",
          borderBottom: "1px solid var(--border-subtle)",
          marginBottom: showText ? 12 : 10,
        }}
      >
        <span>{when}</span>
        <span style={{ textAlign: "right" }}>{stackShort}</span>
      </div>

      {showText && (
        <h3
          style={{
            margin: "0 0 6px",
            fontFamily: "var(--font-display)",
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
            color: "var(--text-strong)",
            overflowWrap: "anywhere",
          }}
        >
          {name}
        </h3>
      )}
      {description && (
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "var(--text-muted)", textWrap: "pretty" }}>
          {description}
        </p>
      )}
    </Link>
  );
}
