"use client";

import React, { useState } from "react";
import { ProjectCard, ProjectCardData } from "./ProjectCard";
import { Tag } from "./Tag";

export interface ProjectListItem extends ProjectCardData {
  slug: string;
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "wip", label: "WIP" },
  { id: "archived", label: "Archived" },
];

export function ProjectsIndex({ projects }: { projects: ProjectListItem[] }) {
  const [projectFilter, setProjectFilter] = useState("all");

  const filteredProjects = projects.filter((p) => projectFilter === "all" || p.status === projectFilter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "3rem", letterSpacing: "-0.02em", color: "var(--text-strong)", margin: "0 0 0.5rem" }}>
          Projects
        </h1>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "1.125rem", lineHeight: 1.7, textWrap: "pretty" }}>
          진행했던 프로젝트들. 각 카드는 제가 작성한 프로젝트 소개 글로 연결됩니다.
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {FILTERS.map((f) => (
          <Tag key={f.id} interactive active={projectFilter === f.id} onClick={() => setProjectFilter(f.id)}>
            {f.label}
          </Tag>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))", gap: "1rem" }}>
        {filteredProjects.map((p) => (
          <ProjectCard key={p.slug} project={p} href={`/projects/${p.slug}`} />
        ))}
      </div>
    </div>
  );
}
