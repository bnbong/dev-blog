import type { Metadata } from "next";
import "@/styles/globals.css";
import "katex/dist/katex.min.css";
import { getAllPosts, getAllProjects } from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Analytics } from "@/components/Analytics";

export const metadata: Metadata = {
  title: "bnbong — dev blog",
  description: "백엔드를 만들고, 배운 것을 기록합니다. FastAPI·Kubernetes·분산 시스템에 대한 글과 프로젝트.",
  icons: { icon: "/assets/logo-mark.svg" },
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const postCount = (await getAllPosts()).length;
  const projectCount = (await getAllProjects()).length;

  return (
    <html lang="ko">
      <body>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <SiteHeader postCount={postCount} projectCount={projectCount} />
          <main style={{ flex: 1, width: "100%" }}>{children}</main>
          <SiteFooter />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
