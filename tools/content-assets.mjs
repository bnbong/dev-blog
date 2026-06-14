// Mirror co-located post images from content/ into public/ so the static
// export can serve them. content/ is the source of truth; public/blog and
// public/projects are generated (and git-ignored).
//
//   content/blog/<slug>/cover.png      ->  public/blog/<slug>/cover.png
//   content/projects/<slug>/demo.png   ->  public/projects/<slug>/demo.png
//
// Markdown files are skipped (they're read at build time, never served).
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PAIRS = [
  { src: path.join(ROOT, "content", "blog"), dest: path.join(ROOT, "public", "blog") },
  { src: path.join(ROOT, "content", "projects"), dest: path.join(ROOT, "public", "projects") },
];
const IS_MD = /\.mdx?$/i;

function copyTree(srcRoot, destRoot, rel = "") {
  const absSrc = path.join(srcRoot, rel);
  if (!fs.existsSync(absSrc)) return;
  for (const name of fs.readdirSync(absSrc)) {
    const r = path.join(rel, name);
    const a = path.join(srcRoot, r);
    if (fs.statSync(a).isDirectory()) {
      copyTree(srcRoot, destRoot, r);
    } else if (!IS_MD.test(name)) {
      const d = path.join(destRoot, r);
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(a, d);
    }
  }
}

export function syncContentAssets() {
  for (const { src, dest } of PAIRS) {
    // Clean rebuild so deleted/renamed images don't linger in public/.
    fs.rmSync(dest, { recursive: true, force: true });
    copyTree(src, dest);
  }
}

let watching = false;
export function watchContentAssets() {
  if (watching) return;
  watching = true;
  let timer = null;
  const resync = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        syncContentAssets();
      } catch (err) {
        console.error("[content-assets] sync failed:", err);
      }
    }, 150);
  };
  for (const { src } of PAIRS) {
    if (fs.existsSync(src)) fs.watch(src, { recursive: true }, resync);
  }
  console.log("[content-assets] watching content/ — images sync to public/ on change");
}

// CLI: `node tools/content-assets.mjs [--watch]`
if (import.meta.url === `file://${process.argv[1]}`) {
  syncContentAssets();
  if (process.argv.includes("--watch")) watchContentAssets();
  else console.log("[content-assets] synced");
}
