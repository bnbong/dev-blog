// Non-network CI guard: verify every `<url>` social-card autolink in content/
// has an entry in the committed data/link-previews.json. Catches the "forgot to
// run prefetch:links / forgot to commit data/" case before it silently
// downgrades cards to the minimal fallback in production.
//
//   npm run check:links
import fs from "node:fs";
import path from "node:path";
import { findLinkCardUrls } from "../lib/link-cards.mjs";

const ROOT = process.cwd();
const DATA = path.join(ROOT, "data", "link-previews.json");

function collect() {
  const urls = new Set();
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (name.endsWith(".md")) for (const u of findLinkCardUrls(fs.readFileSync(p, "utf8"))) urls.add(u);
    }
  };
  walk(path.join(ROOT, "content", "blog"));
  walk(path.join(ROOT, "content", "projects"));
  return [...urls];
}

const urls = collect();

let data;
try {
  data = JSON.parse(fs.readFileSync(DATA, "utf8"));
} catch {
  console.error(
    `✗ data/link-previews.json is missing or invalid, but content has ${urls.length} <url> card(s).\n` +
      `  Run \`npm run prefetch:links\` and commit data/link-previews.json.`,
  );
  process.exit(1);
}

const missing = urls.filter((u) => !(u in data));
if (missing.length) {
  console.error(`✗ ${missing.length} <url> card(s) have no preview in data/link-previews.json:`);
  for (const u of missing) console.error(`  - ${u}`);
  console.error(`  Run \`npm run prefetch:links\` and commit data/link-previews.json.`);
  process.exit(1);
}

console.log(`✓ all ${urls.length} <url> card(s) have committed previews`);
