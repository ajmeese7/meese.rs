// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// Production domain. Cloudflare Pages serves the static `dist/` output.
const SITE = "https://meese.rs";

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
