import React from "react";
import Link from "next/link";
import { getAllPosts, getAllProjects } from "@/lib/content";
import { profile, skillGroups, education, work, certifications, languages, awards } from "@/lib/site";
import { ProjectGrid, ProjectGridItem } from "@/components/ProjectGrid";
import { Container } from "@/components/Container";

const FEATURED_COUNT = 6;
const LATEST_POST_COUNT = 5;

const sectionStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 24,
  padding: "64px 0",
  borderBottom: "1px solid var(--border-subtle)",
};

const railStyle: React.CSSProperties = {
  flex: "0 0 160px",
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  color: "var(--text-muted)",
};

const contentStyle: React.CSSProperties = { flex: "1 1 560px", minWidth: 0 };

const captionStyle: React.CSSProperties = {
  margin: "0 0 12px",
  fontFamily: "var(--font-mono)",
  fontSize: 12,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--text-subtle)",
};

const dateStyle: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-subtle)" };

const dtStyle: React.CSSProperties = { color: "var(--text-subtle)" };
const ddStyle: React.CSSProperties = { margin: 0, color: "var(--text-strong)" };

/** Full-width "… 보기 →" row (top + bottom strong rule). */
const moreRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 0",
  borderTop: "1px solid var(--border-strong)",
  borderBottom: "1px solid var(--border-strong)",
  fontFamily: "var(--font-display)",
  fontSize: 20,
  fontWeight: 700,
  letterSpacing: "-0.02em",
  color: "var(--text-strong)",
  textDecoration: "none",
};

function Rail({ no, label, sub }: { no: string; label: string; sub?: string }) {
  return (
    <div style={railStyle}>
      <b style={{ display: "block", color: "var(--text-strong)", fontWeight: 500, marginBottom: 6 }}>{no}</b>
      {label}
      {sub && (
        <>
          <br />
          {sub}
        </>
      )}
    </div>
  );
}

interface CareerRow {
  org: string;
  role?: string;
  period: string;
  notes: string[];
}

function CareerGroup({ caption, rows }: { caption: string; rows: CareerRow[] }) {
  return (
    <div>
      <p style={captionStyle}>{caption}</p>
      {rows.map((r) => (
        <div
          key={r.org + r.period}
          style={{ display: "flex", flexWrap: "wrap", gap: "6px 24px", padding: "18px 0", borderTop: "1px solid var(--border-strong)" }}
        >
          <span style={{ flex: "0 0 180px", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)", paddingTop: 3 }}>
            {r.period}
          </span>
          <div style={{ flex: "1 1 220px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-strong)" }}>
              {r.org}
            </div>
            {r.role && <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 2 }}>{r.role}</div>}
          </div>
          <div style={{ flex: "2 1 300px", fontSize: 14.5, lineHeight: 1.65, color: "var(--text-body)", textWrap: "pretty" }}>
            {r.notes.map((n) => (
              <p key={n} style={{ margin: 0 }}>
                {n}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** "정보처리기사 (2026.09)" → { name: "정보처리기사", date: "2026.09" } */
function splitTrailingDate(s: string): { name: string; date?: string } {
  const m = s.match(/^(.*?)\s*\(([^()]*)\)\s*$/);
  return m ? { name: m[1], date: m[2] } : { name: s };
}

/** Same-title awards collapse into one line: "창업우수상 2024.11 · 2023.11". */
function groupAwards(list: { title: string; date: string }[]): { name: string; date: string }[] {
  const out: { name: string; date: string }[] = [];
  for (const a of list) {
    const hit = out.find((o) => o.name === a.title);
    if (hit) hit.date += ` · ${a.date}`;
    else out.push({ name: a.title, date: a.date });
  }
  return out;
}

function ListColumn({ caption, items }: { caption: string; items: { name: string; date?: string }[] }) {
  return (
    <div style={{ flex: "1 1 240px" }}>
      <p style={{ ...captionStyle, marginBottom: 10 }}>{caption}</p>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6, fontSize: 14.5, color: "var(--text-strong)" }}>
        {items.map((it) => (
          <li key={it.name + (it.date ?? "")}>
            {it.name} {it.date && <span style={dateStyle}>{it.date}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One row per skill group: label | items joined with " · ". */
function StackGroup({ groups }: { groups: { label: string; items: string[] }[] }) {
  return (
    <div>
      <p style={captionStyle}>Stack</p>
      {groups.map((g, i) => (
        <div
          key={g.label}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 24px",
            padding: "12px 0",
            borderTop: `1px solid var(${i === 0 ? "--border-strong" : "--border-subtle"})`,
          }}
        >
          <span style={{ flex: "0 0 180px", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)" }}>{g.label}</span>
          <span
            style={{
              flex: "1 1 300px",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              lineHeight: 1.8,
              color: g.label === "Learning" ? "var(--text-subtle)" : "var(--text-strong)",
            }}
          >
            {g.items.join(" · ")}
          </span>
        </div>
      ))}
    </div>
  );
}

export default async function AboutPage() {
  const allPosts = await getAllPosts();
  const latestPosts = allPosts.slice(0, LATEST_POST_COUNT);

  // Keep each project's position in the full list so "No.NN" matches /projects.
  const allProjects = (await getAllProjects()).map((p, index) => ({ p, index }));
  const featuredPicked = allProjects.filter(({ p }) => p.featured).slice(0, FEATURED_COUNT);
  const featuredPool =
    featuredPicked.length < FEATURED_COUNT
      ? [...featuredPicked, ...allProjects.filter((e) => !featuredPicked.includes(e)).slice(0, FEATURED_COUNT - featuredPicked.length)]
      : featuredPicked;
  const featured: ProjectGridItem[] = featuredPool
    .sort((a, b) => a.index - b.index)
    .map(({ p, index }) => ({
      slug: p.slug,
      name: p.name,
      description: p.description,
      stack: p.stack,
      status: p.status,
      period: p.period,
      year: p.year,
      thumbnail: p.thumbnail,
      index,
    }));

  const certItems = [...certifications, ...languages].map(splitTrailingDate);
  const awardItems = groupAwards(awards);

  const links = [
    { label: "GitHub", href: profile.github },
    { label: "Email", href: `mailto:${profile.email}` },
    { label: "LinkedIn", href: profile.linkedin },
    { label: "Resume", href: profile.resume },
  ];

  return (
    <Container>
      {/* 00 — Index */}
      <section style={sectionStyle}>
        <Rail no="00" label="Index" />
        <div style={contentStyle}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(64px, 11vw, 148px)",
              lineHeight: 0.86,
              letterSpacing: "-0.06em",
              color: "var(--text-strong)",
              margin: "0 0 48px",
            }}
          >
            {profile.name}
            <br />
            JunHyeok
            <br />
            Lee<span style={{ color: "var(--color-brand)" }}>.</span>
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px 48px", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 380px" }}>
              <p
                style={{
                  margin: "0 0 14px",
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(20px, 2vw, 24px)",
                  lineHeight: 1.45,
                  letterSpacing: "-0.02em",
                  fontWeight: 600,
                  color: "var(--text-strong)",
                  textWrap: "pretty",
                }}
              >
                {profile.headline}.
              </p>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.75, color: "var(--text-muted)", textWrap: "pretty" }}>{profile.bio}</p>
            </div>
            <dl
              style={{
                flex: "0 1 300px",
                margin: 0,
                display: "grid",
                gridTemplateColumns: "88px 1fr",
                gap: "8px 16px",
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              <dt style={dtStyle}>Role</dt>
              <dd style={ddStyle}>{profile.role}</dd>
              <dt style={dtStyle}>Now</dt>
              <dd style={ddStyle}>{profile.now}</dd>
              <dt style={dtStyle}>Based</dt>
              <dd style={ddStyle}>{profile.location}</dd>
              <dt style={dtStyle}>Links</dt>
              <dd style={{ margin: 0, display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                {links.map((l) => (
                  <a key={l.label} href={l.href} className="about-link">
                    {l.label} ↗
                  </a>
                ))}
              </dd>
            </dl>
          </div>
        </div>
      </section>

      {/* 01 — Career */}
      <section style={sectionStyle}>
        <Rail no="01" label="Career" />
        <div style={{ ...contentStyle, display: "flex", flexDirection: "column", gap: 40 }}>
          <CareerGroup caption="Experience" rows={work} />
          <CareerGroup caption="Education" rows={education} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24, paddingTop: 20, borderTop: "1px solid var(--border-subtle)" }}>
            <ListColumn caption="Certifications" items={certItems} />
            <ListColumn caption="Awards" items={awardItems} />
          </div>
          <StackGroup groups={skillGroups} />
        </div>
      </section>

      {/* 02 — Projects */}
      <section style={sectionStyle}>
        <Rail no="02" label="Projects" sub={`${allProjects.length} total`} />
        <div style={contentStyle}>
          <ProjectGrid projects={featured} />
          <Link href="/projects" className="about-more" style={{ ...moreRowStyle, marginTop: 40 }}>
            전체 프로젝트 {allProjects.length}개 보기<span>→</span>
          </Link>
        </div>
      </section>

      {/* 03 — Writing */}
      <section style={{ ...sectionStyle, borderBottom: "none" }}>
        <Rail no="03" label="Writing" sub={`${allPosts.length} posts`} />
        <div style={contentStyle}>
          {latestPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="about-post-row"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 24px",
                alignItems: "baseline",
                padding: "22px 0",
                borderTop: "1px solid var(--border-subtle)",
                textDecoration: "none",
              }}
            >
              <span style={{ flex: "0 0 120px", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)" }}>{post.date}</span>
              <span
                style={{
                  flex: "1 1 320px",
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.35,
                  textWrap: "pretty",
                }}
              >
                {post.title}
              </span>
              <span style={{ flex: "0 0 100px", textAlign: "right", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-brand-ink)" }}>
                {post.category}
              </span>
            </Link>
          ))}
          <Link href="/blog" className="about-more" style={moreRowStyle}>
            모든 글 보기<span>→</span>
          </Link>
        </div>
      </section>
    </Container>
  );
}
