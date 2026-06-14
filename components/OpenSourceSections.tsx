import React from "react";
import Link from "next/link";
import { openSource } from "@/lib/site";

interface OSItem {
  name: string;
  slug: string;
  upstream: string;
  desc: string;
  contributions: string[];
}

function OSCard({ item }: { item: OSItem }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
        padding: "var(--space-5)",
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", color: "var(--text-strong)" }}>
        {item.name}
      </h3>
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "1rem", lineHeight: 1.6, textWrap: "pretty" }}>{item.desc}</p>
      <ul style={{ margin: 0, paddingLeft: "1.1rem", color: "var(--text-body)", fontSize: "0.9375rem", lineHeight: 1.6, display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {item.contributions.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: "1rem", marginTop: "auto", paddingTop: "var(--space-2)", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.875rem" }}>
        <Link href={`/projects/${item.slug}`} style={{ color: "var(--text-link)" }}>
          자세히 보기 →
        </Link>
        <a href={item.upstream} target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)" }}>
          Upstream ↗
        </a>
      </div>
    </div>
  );
}

/** Open Source maintained + contributions, rendered as a section on the Projects page. */
export function OpenSourceSections() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.75rem", letterSpacing: "-0.02em", color: "var(--text-strong)", margin: "0 0 0.5rem" }}>
          Open Source
        </h2>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "1.125rem", lineHeight: 1.7, maxWidth: "48rem", textWrap: "pretty" }}>
          {openSource.intro}
        </p>
      </div>

      <div>
        <p style={{ margin: "0 0 1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-subtle)" }}>
          직접 운영/유지하는 OSS
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: "1rem" }}>
          {openSource.maintained.map((item) => (
            <OSCard key={item.slug} item={item} />
          ))}
        </div>
      </div>

      <div>
        <p style={{ margin: "0 0 1rem", fontFamily: "var(--font-mono)", fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-subtle)" }}>
          외부 저장소 기여
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px, 100%), 1fr))", gap: "1rem" }}>
          {openSource.contributions.map((item) => (
            <OSCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
