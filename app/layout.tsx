import type { Metadata } from "next";
import "@/styles/globals.css";
import "katex/dist/katex.min.css";
import { getAllPosts, getAllProjects } from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Analytics } from "@/components/Analytics";
import { siteUrl } from "@/lib/site";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "bnbong — dev blog",
  description: "이준혁 개발 블로그 - 백엔드를 만들고, 배운 것을 기록합니다.",
  icons: { icon: "/assets/favicon.svg" },
  alternates: {
    types: { "application/rss+xml": "/feed.xml" },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const postCount = (await getAllPosts()).length;
  const projectCount = (await getAllProjects()).length;

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Set data-theme before first paint (saved choice, else OS preference). */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <SiteHeader postCount={postCount} projectCount={projectCount} />
          <main
            style={{
              flex: 1,
              width: "100%",
              maxWidth: 1280,
              margin: "0 auto",
              padding: "0 clamp(20px, 4vw, 48px)",
            }}
          >
            {children}
          </main>
          <SiteFooter />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
