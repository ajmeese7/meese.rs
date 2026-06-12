// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// Production domain. Cloudflare Pages serves the static `dist/` output.
const SITE = "https://meese.rs";

export default defineConfig({
  site: SITE,
  // Drafts are excluded from the build via the content query layer (see
  // src/utils/posts.ts); sitemap mirrors that by filtering dev-only routes.
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes("/search") && !page.includes("/graph"),
    }),
  ],
  build: {
    // Clean URLs (/posts/foo not /posts/foo.html) for canonical links.
    format: "directory",
  },
});
