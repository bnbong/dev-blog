import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProjects, getProject } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import { shortProjectName } from "@/components/ProjectCard";
import { Container } from "@/components/Container";
import { Mermaid } from "@/components/Mermaid";

export async function generateStaticParams() {
  return (await getAllProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  const title = project ? `${project.name} — bnbong` : "Project — bnbong";
  if (!project) return { title };
  const images = [{ url: /^https?:\/\//i.test(project.thumbnail) ? project.thumbnail : `${siteUrl}${project.thumbnail}` }];
  return {
    title,
    description: project.description,
    openGraph: {
      title: project.name,
      description: project.description,
      url: `${siteUrl}/projects/${slug}/`,
      siteName: SITE_NAME,
      type: "website",
      images,
    },
    twitter: { card: "summary_large_image", title: project.name, description: project.description, images },
  };
}

const SITE_NAME = new URL(siteUrl).hostname.replace(/^www\./i, "");

const STATUS_LABEL = { active: "● Active", wip: "● WIP", archived: "Archived" } as const;

/** Mirrors DEFAULT_THUMBNAIL in lib/content.ts: the site-wide fallback is not a key visual. */
const DEFAULT_THUMBNAIL = "/assets/new_profile.png";

const metaLabel: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  color: "var(--text-subtle)",
  marginBottom: 6,
};
const metaValue: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-mono)",
  fontSize: 14,
  color: "var(--text-strong)",
  overflowWrap: "anywhere",
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projects = await getAllProjects();
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  if (!project) notFound();

  const no = String(index + 1).padStart(2, "0");
  const short = shortProjectName(project.name);
  const statusLabel = STATUS_LABEL[project.status] ?? "";
  const period = project.period || (project.year ? String(project.year) : "—");
  const image = project.thumbnail && project.thumbnail !== DEFAULT_THUMBNAIL ? project.thumbnail : undefined;
  const repoLabel = project.url.replace(/^https?:\/\//i, "").replace(/\/$/, "");

  return (
    <Container>
      <div style={{ padding: "40px 0 0" }}>
        <Link href="/projects" className="projects-back">
          ← Projects
        </Link>
      </div>

      <header style={{ display: "flex", flexWrap: "wrap", gap: 24, padding: "40px 0 48px" }}>
        <div style={{ flex: "0 0 220px", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)" }}>
          <b style={{ display: "block", color: "var(--text-strong)", fontWeight: 500, marginBottom: 6 }}>No.{no}</b>
          {statusLabel}
        </div>
        <div style={{ flex: "1 1 560px", minWidth: 0 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(48px, 8vw, 112px)",
              lineHeight: 0.88,
              letterSpacing: "-0.06em",
              color: "var(--text-strong)",
              margin: "0 0 28px",
              textWrap: "balance",
              overflowWrap: "anywhere",
            }}
          >
            {short}
            <span style={{ color: "var(--color-brand)" }}>.</span>
          </h1>
          {project.description && (
            <p style={{ margin: 0, fontSize: 20, lineHeight: 1.6, color: "var(--text-muted)", textWrap: "pretty" }}>
              {project.description}
            </p>
          )}
        </div>
      </header>

      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          margin: 0,
          borderTop: "1px solid var(--border-strong)",
          borderBottom: "1px solid var(--border-strong)",
        }}
      >
        <div style={{ padding: "18px 20px 18px 0" }}>
          <dt style={metaLabel}>Period</dt>
          <dd style={metaValue}>{period}</dd>
        </div>
        <div style={{ padding: "18px 20px 18px 0" }}>
          <dt style={metaLabel}>Status</dt>
          <dd style={metaValue}>{statusLabel || "—"}</dd>
        </div>
        <div style={{ padding: "18px 20px 18px 0" }}>
          <dt style={metaLabel}>Stack</dt>
          <dd style={metaValue}>{project.stack.length ? project.stack.join(", ") : "—"}</dd>
        </div>
        <div style={{ padding: "18px 0" }}>
          <dt style={metaLabel}>Repository</dt>
          <dd style={metaValue}>
            {project.url ? (
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="projects-repo-link">
                {repoLabel} ↗
              </a>
            ) : (
              "—"
            )}
          </dd>
        </div>
      </dl>

      {image ? (
        <div
          style={{
            margin: "48px 0",
            aspectRatio: "21 / 9",
            border: "1px solid var(--border-strong)",
            background: "var(--surface-sunken)",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt={`${project.name} key visual`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        </div>
      ) : (
        <div
          aria-hidden
          style={{
            margin: "48px 0",
            aspectRatio: "21 / 9",
            background: "var(--color-brand)",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "clamp(20px, 3vw, 36px)",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span>bnbong / {project.slug}</span>
            <span>Key visual</span>
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(40px, 7vw, 96px)",
              lineHeight: 0.88,
              letterSpacing: "-0.06em",
              overflowWrap: "anywhere",
            }}
          >
            {short}
          </span>
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, paddingBottom: 96 }}>
        <div style={{ flex: "0 0 220px", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)" }}>Overview</div>
        <article style={{ flex: "1 1 560px", minWidth: 0 }}>
          <div className="prose prose--project" dangerouslySetInnerHTML={{ __html: project.html }} />
          {project.html.includes('class="mermaid"') && <Mermaid />}
        </article>
      </div>
    </Container>
  );
}
