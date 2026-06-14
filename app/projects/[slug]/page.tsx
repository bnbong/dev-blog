import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProjects, getProject } from "@/lib/content";
import { Badge } from "@/components/Badge";
import { Tag } from "@/components/Tag";
import { RepoCard } from "@/components/RepoCard";
import { Container } from "@/components/Container";

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  return { title: project ? `${project.name} — bnbong` : "Project — bnbong", description: project?.description };
}

const STATUS_TONE = { active: "success", wip: "warning", archived: "neutral" } as const;
const STATUS_LABEL = { active: "Active", wip: "WIP", archived: "Archived" } as const;

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <Container max="68rem">
      <Link
        href="/projects"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          color: "var(--text-muted)",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "0.875rem",
          textDecoration: "none",
          marginBottom: "1.75rem",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
        Back to projects
      </Link>

      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <h1 style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "2.5rem", letterSpacing: "-0.03em", color: "var(--text-strong)", margin: 0 }}>
            {project.name}
          </h1>
          {project.status && (
            <Badge tone={STATUS_TONE[project.status]} dot>
              {STATUS_LABEL[project.status]}
            </Badge>
          )}
        </div>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "1.125rem", lineHeight: 1.7 }}>{project.description}</p>
      </div>

      <div style={{ marginBottom: "2.5rem" }}>
        <RepoCard
          repo={{
            owner: project.owner,
            name: project.name,
            description: project.description,
            language: project.language,
            languageColor: project.languageColor,
            stars: project.stars,
            forks: project.forks,
            stack: project.stack,
            url: project.url,
          }}
        />
      </div>

      <div className="prose" style={{ maxWidth: "none" }} dangerouslySetInnerHTML={{ __html: project.html }} />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border-subtle)" }}>
        {project.stack.map((s) => (
          <Tag key={s} tone="neutral" size="sm">
            {s}
          </Tag>
        ))}
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-subtle)" }}>
          {project.year}
        </span>
      </div>
    </Container>
  );
}
