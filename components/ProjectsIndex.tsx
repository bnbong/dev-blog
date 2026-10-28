"use client";

import React, { useState } from "react";
import { ProjectCard, ProjectCardData } from "./ProjectCard";

export interface ProjectListItem extends ProjectCardData {
  slug: string;
  /** Open-source maintenance or contribution (drives the "Open Source" filter). */
  oss: boolean;
}

type FilterId = "all" | "active" | "oss" | "archived";

const FILTERS: { id: FilterId; label: string; match: (p: ProjectListItem) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "active", label: "Active", match: (p) => p.status === "active" || p.status === "wip" },
  { id: "oss", label: "Open Source", match: (p) => p.oss },
  { id: "archived", label: "Archived", match: (p) => p.status === "archived" },
];

/**
 * /projects: header (rail + "Projects" with a cobalt count + segmented filter)
 * and the card grid. Card numbers ("No.NN") follow the unfiltered list order.
 */
export function ProjectsIndex({ projects }: { projects: ProjectListItem[] }) {
  const [filter, setFilter] = useState<FilterId>("all");

  const active = FILTERS.find((f) => f.id === filter) ?? FILTERS[0];
  const indexed = projects.map((p, index) => ({ p, index }));
  const visible = indexed.filter(({ p }) => active.match(p));

  const years = projects.map((p) => p.year).filter((y): y is number => typeof y === "number" && y > 0);
  const span = years.length ? `${Math.min(...years)} — ${Math.max(...years)}` : "";

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
          <b style={{ display: "block", color: "var(--text-strong)", fontWeight: 500, marginBottom: 6 }}>P</b>
          {span}
        </div>
        <div
          style={{
            flex: "1 1 560px",
            minWidth: 0,
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
              fontSize: "clamp(56px, 9vw, 120px)",
              lineHeight: 0.86,
              letterSpacing: "-0.06em",
              color: "var(--text-strong)",
              margin: 0,
            }}
          >
            Projects
            <sup
              style={{
                fontSize: "0.3em",
                letterSpacing: "-0.02em",
                color: "var(--color-brand)",
                verticalAlign: "top",
                marginLeft: 6,
              }}
            >
              {projects.length}
            </sup>
          </h1>
          <div
            role="group"
            aria-label="프로젝트 필터"
            style={{ display: "flex", flexWrap: "wrap", border: "1px solid var(--border-strong)", fontFamily: "var(--font-mono)", fontSize: 13 }}
          >
            {FILTERS.map((f) => {
              const count = projects.filter(f.match).length;
              const on = f.id === filter;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f.id)}
                  className={on ? "projects-filter projects-filter--active" : "projects-filter"}
                >
                  {f.label} {on ? count : <span style={{ color: "var(--text-subtle)" }}>{count}</span>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section
        style={{
          padding: "48px 0 96px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))",
          gap: "48px 24px",
        }}
      >
        {visible.map(({ p, index }) => (
          <ProjectCard key={p.slug} project={p} index={index} href={`/projects/${p.slug}`} showText />
        ))}
      </section>
    </>
  );
}
