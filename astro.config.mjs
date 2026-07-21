// @ts-check
import { readdirSync, readFileSync } from "node:fs";
import { defineConfig, fontProviders } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// Production domain. Cloudflare Pages serves the static `dist/` output.
const SITE = "https://meese.rs";

// One pass over post frontmatter feeds two build-time filters below.
const POSTS_DIR = "./src/content/posts";
const postFiles = readdirSync(POSTS_DIR).filter((f) => /\.mdx?$/.test(f));
/** @param {string} f Post filename. */
const frontmatter = (f) =>
  readFileSync(`${POSTS_DIR}/${f}`, "utf8").split(/^---$/m)[1] ?? "";
/** @param {string} f Post filename. */
const slugOf = (f) => f.replace(/\.mdx?$/, "");

// Unlisted posts build to a live, shareable URL but must stay out of the public
// sitemap, so the sitemap filter drops their paths (pages still get noindex).
const unlistedPaths = postFiles
  .filter((f) => /^unlisted:\s*true\b/m.test(frontmatter(f)))
  .map((f) => `/posts/${slugOf(f)}/`);

// Drafts aren't built in production (see src/utils/posts.ts), so any published
// post whose prose links to one would emit a dead /posts/<slug> anchor. Collect
// draft slugs in prod so the rehype pass below unwraps those links to plain
// text. Empty in dev, where drafts do build and the links resolve.
const draftSlugs = new Set(
  process.env.NODE_ENV === "production"
    ? postFiles
        .filter((f) => /^draft:\s*true\b/m.test(frontmatter(f)))
        .map(slugOf)
    : [],
);

/**
 * Minimal shape of the HAST nodes this pass touches. ponytail: a local typedef
 * keeps the file dependency-free; @types/hast isn't a direct dep and pnpm won't
 * reliably resolve it transitively. Widen only if this plugin grows.
 *
 * @typedef {object} HastNode
 * @property {string} type
 * @property {string} [tagName]
 * @property {Record<string, unknown>} [properties]
 * @property {HastNode[]} [children]
 */

/**
 * Rehype plugin: unwrap <a href="/posts/<slug>"> anchors that point at a draft,
 * leaving the link text in place. ponytail: handles bare /posts/<slug> links
 * (optional trailing slash); add #fragment/?query parsing if those ever link to
 * drafts. Exported so astro.config.test.mjs can exercise the walk directly.
 *
 * @param {Set<string>} slugs
 */
export function rehypeStripDraftLinks(slugs) {
  /**
   * @param {HastNode} node
   * @returns {node is HastNode & { children: HastNode[] }}
   */
  const isDraftLink = (node) => {
    if (node.type !== "element" || node.tagName !== "a") return false;
    const href = node.properties?.href;
    const m = typeof href === "string" && href.match(/^\/posts\/([a-z0-9-]+)\/?$/i);
    return Boolean(m && slugs.has(m[1]));
  };
  /** @param {HastNode} node */
  const walk = (node) => {
    if (!node.children) return;
    node.children = node.children.flatMap((child) => {
      if (isDraftLink(child)) return child.children;
      walk(child);
      return [child];
    });
  };
  return walk;
}

export default defineConfig({
  site: SITE,
  // Self-hosted webfonts (Astro Fonts API). Downloads + subsets at build time
  // into dist/_astro/fonts/ so they ship from our own origin instead of the
  // render-blocking Google Fonts CDN chain (doc -> css -> fonts.googleapis ->
  // fonts.gstatic). These cssVariables are the single source of truth for the
  // families; typography.css no longer declares --font-*.
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Space Grotesk",
      cssVariable: "--font-display",
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      fallbacks: ["ui-sans-serif", "system-ui", "sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "IBM Plex Sans",
      cssVariable: "--font-body",
      weights: [400, 500, 600],
      styles: ["normal", "italic"],
      fallbacks: ["ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      weights: [400, 500, 600],
      styles: ["normal"],
      fallbacks: ["ui-monospace", "SF Mono", "Cascadia Code", "Menlo", "monospace"],
    },
  ],
  // Plugins live on the processor, not on `mdx({...})`: passing them to the
  // integration is deprecated and slated for removal in the next Astro major.
  // `extendMarkdownConfig` defaults to true, so MDX inherits this pipeline.
  markdown: {
    processor: unified({ rehypePlugins: [[rehypeStripDraftLinks, draftSlugs]] }),
  },
  // Drafts are excluded from the build via the content query layer (see
  // src/utils/posts.ts); sitemap mirrors that by filtering dev-only routes and
  // any unlisted posts.
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes("/search") &&
        !page.includes("/graph") &&
        !unlistedPaths.some((p) => page.includes(p)),
    }),
  ],
  build: {
    // Clean URLs (/posts/foo not /posts/foo.html) for canonical links.
    format: "directory",
  },
});
