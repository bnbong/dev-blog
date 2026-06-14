import { syncContentAssets, watchContentAssets } from "./tools/content-assets.mjs";

// Mirror co-located post images (content/**) into public/** before Next reads
// the file system. Runs for both `next dev` and `next build`; in dev we also
// watch content/ so images dropped next to a post appear without a restart.
syncContentAssets();
if (process.env.NODE_ENV !== "production") watchContentAssets();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static HTML export — deployable on GitHub Pages, Vercel, or any static host.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
