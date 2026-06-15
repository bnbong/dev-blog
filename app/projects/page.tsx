import React from "react";
import { getAllProjects } from "@/lib/content";
import { ProjectsIndex } from "@/components/ProjectsIndex";
import { OpenSourceSections } from "@/components/OpenSourceSections";
import { Container } from "@/components/Container";

export const metadata = { title: "Projects — bnbong" };

export default async function ProjectsPage() {
  const projects = (await getAllProjects()).map((p) => ({
    slug: p.slug,
    name: p.name,
    description: p.description,
    stack: p.stack,
    stars: p.stars,
    status: p.status,
    year: p.year,
  }));

  return (
    <Container>
      <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
        <ProjectsIndex projects={projects} />
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "3rem" }}>
          <OpenSourceSections />
        </div>
      </div>
    </Container>
  );
}
