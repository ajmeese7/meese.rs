import { defineCollection } from "astro:content";
import { z } from "astro:schema";
import { glob } from "astro/loaders";

// Post types, the SPEC's base set.
export const POST_TYPES = [
  "guide",
  "note",
  "devlog",
  "essay",
  "lab",
  "reference",
] as const;

const posts = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/posts",
  }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    type: z.enum(POST_TYPES),
    topics: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    summary: z.string().optional(),
    featured: z.boolean().default(false),
    pinned: z.boolean().default(false),
    series: z.string().optional(),
    related: z
      .array(z.object({ slug: z.string(), reason: z.string() }))
      .default([]),
    supersedes: z.array(z.string()).default([]),
    supersededBy: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    externalUrl: z.string().url().optional(),
    // The GitHub repository the entry is about, when there is one. Renders
    // as a chip on the page and rides along in /index.json, where meese.dev
    // uses it to tie a post to the project it came out of. Shape is checked
    // by `pnpm validate:content`; nothing here hits the network.
    repo: z.string().url().optional(),
    hideFromFeed: z.boolean().default(false),
    // Unlisted: builds a live, shareable page but appears in no listing,
    // feed, topic, search index, graph, or sitemap, and is marked noindex.
    // Sits between `draft` (never built in prod) and a normal published post.
    unlisted: z.boolean().default(false),
  }),
});

export const collections = { posts };
