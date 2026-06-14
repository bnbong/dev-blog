import React from "react";
import { ProjectCard, ProjectCardData } from "./ProjectCard";

export interface ProjectGridItem extends ProjectCardData {
  slug: string;
}

export function ProjectGrid({ projects }: { projects: ProjectGridItem[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))", gap: "1rem" }}>
      {projects.map((p) => (
        <ProjectCard key={p.slug} project={p} href={`/projects/${p.slug}`} />
      ))}
    </div>
  );
}
