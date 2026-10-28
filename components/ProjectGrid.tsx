import React from "react";
import { ProjectCard, ProjectCardData } from "./ProjectCard";

export interface ProjectGridItem extends ProjectCardData {
  slug: string;
  /** 0-based position in the full project list (for "No.NN"); defaults to grid order. */
  index?: number;
}

/** About-page project grid (260px min tracks, 40px row / 24px column gap). */
export function ProjectGrid({ projects, showText = false }: { projects: ProjectGridItem[]; showText?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: "40px 24px" }}>
      {projects.map((p, i) => (
        <ProjectCard key={p.slug} project={p} index={p.index ?? i} href={`/projects/${p.slug}`} showText={showText} />
      ))}
    </div>
  );
}
