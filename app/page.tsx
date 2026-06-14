import React from "react";
import Link from "next/link";
import { getAllPosts, getAllProjects } from "@/lib/content";
import { profile, skillGroups, education, work, certifications, awards, activities, featuredProjectSlugs } from "@/lib/site";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Tag } from "@/components/Tag";
import { PostList } from "@/components/PostList";
import { ProjectGrid } from "@/components/ProjectGrid";
import { Container } from "@/components/Container";

const eyebrowStyle: React.CSSProperties = {
  margin: "0 0 1rem",
  fontFamily: "var(--font-mono)",
  fontSize: "0.75rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--text-subtle)",
};

const h2Style: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  fontSize: "2.25rem",
  letterSpacing: "-0.02em",
  color: "var(--text-strong)",
  margin: 0,
};

function Timeline({ items }: { items: { org: string; role?: string; period: string; notes: string[] }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {items.map((it) => (
        <div key={it.org + it.period} style={{ borderLeft: "2px solid var(--border-default)", paddingLeft: "1.25rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "0.5rem 0.75rem" }}>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.0625rem", color: "var(--text-strong)" }}>
              {it.org}
            </span>
            {it.role && <span style={{ color: "var(--color-brand-ink)", fontSize: "0.9375rem" }}>{it.role}</span>}
            <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-subtle)" }}>
              {it.period}
            </span>
          </div>
          {it.notes.length > 0 && (
            <ul style={{ margin: "0.5rem 0 0", paddingLeft: "1.1rem", color: "var(--text-muted)", fontSize: "0.9375rem", lineHeight: 1.6 }}>
              {it.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AboutPage() {
  const latestPosts = getAllPosts()
    .slice(0, 3)
    .map((p) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt, date: p.date, readingTime: p.readingTime, tags: p.tags, isNew: p.isNew }));

  const allProjects = getAllProjects();
  const featured = featuredProjectSlugs
    .map((slug) => allProjects.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({ slug: p.slug, name: p.name, description: p.description, stack: p.stack, stars: p.stars, status: p.status, year: p.year }));

  return (
    <Container>
      <div style={{ display: "flex", flexDirection: "column", gap: "5rem" }}>
        {/* intro */}
        <section style={{ display: "flex", gap: "2.5rem", alignItems: "flex-start", flexWrap: "wrap" }}>
          <Avatar src={profile.avatar} alt={profile.name} initials={profile.initials} size={104} />
          <div style={{ flex: 1, minWidth: "min(280px, 100%)" }}>
            <p style={{ margin: "0 0 0.5rem", fontFamily: "var(--font-mono)", fontSize: "0.875rem", color: "var(--color-brand-ink)", letterSpacing: "-0.01em" }}>
              {profile.handle} · {profile.role}
            </p>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "3rem", lineHeight: 1.08, letterSpacing: "-0.02em", color: "var(--text-strong)", margin: "0 0 0.75rem" }}>
              {profile.name} <span style={{ color: "var(--text-subtle)", fontWeight: 500 }}>· {profile.nameEn}</span>
            </h1>
            <p style={{ margin: "0 0 1rem", fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 600, color: "var(--color-brand-strong)", letterSpacing: "-0.01em", textWrap: "balance" }}>
              {profile.headline}
            </p>
            <p style={{ margin: "0 0 1.5rem", fontSize: "1.125rem", color: "var(--text-muted)", lineHeight: 1.72, maxWidth: "44rem", textWrap: "pretty" }}>
              {profile.bio}
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
              <Button variant="primary" href={profile.github}>GitHub</Button>
              <Button variant="secondary" href={`mailto:${profile.email}`}>Contact</Button>
              <Button variant="ghost" href={profile.resume}>Resume PDF</Button>
              <Button variant="ghost" href={profile.portfolio}>Portfolio PDF</Button>
            </div>
          </div>
        </section>

        {/* stack (categorized) */}
        <section>
          <p style={eyebrowStyle}>Stack</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {skillGroups.map((group) => (
              <div key={group.label} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                <span style={{ flex: "0 0 11rem", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9375rem", color: "var(--text-strong)" }}>
                  {group.label}
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", flex: 1 }}>
                  {group.items.map((s) => (
                    <Tag key={s} tone="brand">{s}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* education + work */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "2.5rem 3rem" }}>
          <div>
            <h2 style={{ ...h2Style, fontSize: "1.75rem", marginBottom: "1.5rem" }}>Education</h2>
            <Timeline items={education} />
          </div>
          <div>
            <h2 style={{ ...h2Style, fontSize: "1.75rem", marginBottom: "1.5rem" }}>Work</h2>
            <Timeline items={work} />
          </div>
        </section>

        {/* featured projects */}
        {featured.length > 0 && (
          <section>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1rem" }}>
              <h2 style={h2Style}>Featured projects</h2>
              <Link href="/projects" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.875rem", color: "var(--text-link)" }}>
                All projects →
              </Link>
            </div>
            <ProjectGrid projects={featured} />
          </section>
        )}

        {/* latest writing */}
        <section>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 style={h2Style}>Latest writing</h2>
            <Link href="/blog" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.875rem", color: "var(--text-link)" }}>
              All posts →
            </Link>
          </div>
          <PostList posts={latestPosts} />
        </section>

        {/* certifications · awards · activities */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: "2.5rem 3rem" }}>
          <div>
            <p style={eyebrowStyle}>Certifications</p>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--text-muted)", fontSize: "0.9375rem", lineHeight: 1.7 }}>
              {certifications.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div>
            <p style={eyebrowStyle}>Awards</p>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--text-muted)", fontSize: "0.9375rem", lineHeight: 1.7 }}>
              {awards.map((a) => (
                <li key={a.title + a.date}>
                  {a.title} <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8125rem", color: "var(--text-subtle)" }}>· {a.date}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p style={eyebrowStyle}>Activities</p>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--text-muted)", fontSize: "0.9375rem", lineHeight: 1.7 }}>
              {activities.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* contact */}
        <section>
          <p style={eyebrowStyle}>Contact</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {[
              { label: "Email", href: `mailto:${profile.email}` },
              { label: "GitHub", href: profile.github },
              { label: "LinkedIn", href: profile.linkedin },
              { label: "Naver Blog", href: profile.naverBlog },
              { label: "Instagram", href: profile.instagram },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  color: "var(--text-strong)",
                  textDecoration: "none",
                  padding: "0.5rem 1rem",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--surface-raised)",
                }}
              >
                {c.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </Container>
  );
}
