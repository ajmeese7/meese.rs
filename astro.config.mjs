// @ts-check
import { readdirSync, readFileSync } from "node:fs";
import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// Production domain. Cloudflare Pages serves the static `dist/` output.
const SITE = "https://meese.rs";

// Unlisted posts build to a live, shareable URL but must stay out of the public
// sitemap. Scan post frontmatter for `unlisted: true` and collect their paths
// so the sitemap filter can drop them (the pages themselves still get noindex).
const POSTS_DIR = "./src/content/posts";
const unlistedPaths = readdirSync(POSTS_DIR)
  .filter((f) => /\.mdx?$/.test(f))
  .filter((f) => {
    const fm = readFileSync(`${POSTS_DIR}/${f}`, "utf8").split(/^---$/m)[1] ?? "";
    return /^unlisted:\s*true\b/m.test(fm);
  })
  .map((f) => `/posts/${f.replace(/\.mdx?$/, "")}/`);

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
