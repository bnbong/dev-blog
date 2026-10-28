import React from "react";
import { getAllProjects } from "@/lib/content";
import { ossProjectSlugs } from "@/lib/site";
import { ProjectsIndex } from "@/components/ProjectsIndex";
import { Container } from "@/components/Container";

export const metadata = { title: "Projects — bnbong" };

/** Projects shown under the "Open Source" filter (lib/site.ts). */
const OSS_SLUGS = new Set<string>(ossProjectSlugs);

export default async function ProjectsPage() {
  const projects = (await getAllProjects()).map((p) => ({
    slug: p.slug,
    name: p.name,
    description: p.description,
    stack: p.stack,
    status: p.status,
    period: p.period,
    year: p.year,
    thumbnail: p.thumbnail,
    oss: OSS_SLUGS.has(p.slug),
  }));

  return (
    <Container>
      <ProjectsIndex projects={projects} />
    </Container>
  );
}
