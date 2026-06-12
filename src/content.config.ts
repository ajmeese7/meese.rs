import { defineCollection } from "astro:content";
import { z } from "astro:schema";
import { glob } from "astro/loaders";

// Post types. `review` is a first-class type on meese.rs (software/library
// reviews are a major use case) in addition to the SPEC's base set.
export const POST_TYPES = [
  "guide",
  "note",
  "devlog",
  "essay",
  "lab",
  "reference",
  "review",
] as const;

// Structured review record, present only on `type: review` entries. The
// prose verdict body lives in the MDX content; scores/criteria are frontmatter
// so cards, the reviews index, and the score band can render without parsing.
const reviewSchema = z.object({
  subject: z.string(),
  version: z.string().optional(),
  score: z.number().min(0).max(5),
  verdict: z.enum(["recommended", "caveats", "watch", "skip"]),
  verdictLabel: z.string(),
  tagline: z.string().optional(),
  links: z
    .array(z.object({ label: z.string(), href: z.string().url() }))
    .default([]),
  meta: z.array(z.object({ key: z.string(), value: z.string() })).default([]),
  criteria: z
    .array(
      z.object({
        name: z.string(),
        score: z.number().min(0).max(5),
        note: z.string(),
      }),
    )
    .default([]),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  bottomLine: z.string().optional(),
});

const posts = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/posts",
  }),
  schema: z
    .object({
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
      hideFromFeed: z.boolean().default(false),
      review: reviewSchema.optional(),
    })
    // A review entry must carry its structured record.
    .refine((d) => d.type !== "review" || d.review !== undefined, {
      message: "Posts with type 'review' must include a `review:` block.",
      path: ["review"],
    }),
});

export const collections = { posts };
