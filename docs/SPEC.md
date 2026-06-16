# `meese.rs` Implementation Specification

## 1. Project Summary

`meese.rs` is a public, static-first writing site.

It is the canonical home for long-form and short-form technical writing: tactical guides, dev logs, short notes, labs, references, and occasional essays. The site should feel like a latest-writing-first system index rather than a conventional personal blog.

The product should emphasize:

* excellent long-form readability
* mixed-length writing in one main feed
* short notes in the same stream as longer posts
* topic-driven navigation
* static search
* backlinks between related posts
* a sleek, branded concept graph
* low maintenance after launch
* public repository compatibility
* no server runtime unless absolutely necessary

The production domain is:

```txt
meese.rs
```

## 1.5 Known Gaps

The site is built and runs. Three things the rest of this spec describes are not fully in place yet:

* **Search filters:** only the type filter exists. Topic and tag filters are not built (§23).
* **No test harness:** content integrity is covered by `scripts/validate-content.ts` and `astro check`; there are no unit tests (§38).
* **CSP:** not enabled yet, pending a Cloudflare preview pass; Google Fonts is the one external origin to account for (§31).

Everything else in this document describes the shipped system.

## 2. Non-Goals

Do not build or prioritize:

* SSH-based site access
* terminal-first UX
* browser terminal UI
* admin CMS
* comments
* discussion links
* database-backed runtime search
* dynamic user accounts
* per-post “View MDX” links by default
* analytics proxying or crawler-control overengineering
* blockchain functionality
* Medium synchronization
* anything that requires ongoing server maintenance for the core reading experience

## 3. Audience

Primary audience:

* engineers
* AI/devtool people
* technical builders

Secondary audience:

* cybersecurity-adjacent practitioners
* product-minded technical people
* people evaluating the author’s technical judgment through proof-of-work writing

The site should communicate that the author builds real systems, understands tradeoffs, and can explain implementation details clearly.

## 4. Editorial Positioning

The tone should feel like:

```txt
field notes from a builder
```

The site should not feel like:

* a polished magazine
* a generic portfolio
* a corporate documentation portal
* a terminal gimmick
* a social feed
* an academic archive

The writing can range from quick notes to full tactical guides, but the total system should feel intentional and navigable.

## 5. Visual Direction

The site should have a unique branded feel while maintaining usability and readability.

Desired feel:

```txt
dark technical
futuristic but restrained
system-index oriented
sleek
readable
distinctive
```

The visual identity is a **custom cybersecurity UX design kit**: precise, technical, polished, and distinctive without sacrificing the reading experience. It is the source of truth for anything visual. It lives in `design-system/` (tokens, components, the website UI kit, and brand assets; see `design-system/project/README.md`) and is ported into `src/styles/` as the semantic token layer (`src/styles/tokens/*.css`) plus a static-CSS port of the UI-kit components (`src/styles/base.css`, `components.css`, `graph.css`).

The system is dark, technical, and restrained over a graphite blueprint-grid foundation. Components reference semantic CSS variables (`--text-body`, `--surface-card`, `--accent`, `--border-default`, the categorical `--hue-*` set), never raw palette values.

The accent is the one moving part:

* It is themeable at runtime via `data-theme` on `<html>`, with a nine-option dark switcher in the header (violet, acid green, lime, mint, cyan, blue, magenta, pink, coral). The default is `neon-violet`.
* The choice is persisted in `localStorage` and re-applied pre-paint by an inline script in `BaseLayout` to avoid an accent flash.
* The palette is dark only; there is no light mode.

Do not reinvent or fork the visual system. Extend it from the existing tokens and components.

## 6. Architecture

Use a static-first architecture.

Recommended stack:

```txt
Astro 6
MDX (@astrojs/mdx)
Astro Content Collections (glob loader)
Pagefind
@astrojs/sitemap
@astrojs/rss
Cloudflare Pages (wrangler static-assets)
TypeScript
pnpm
```

Core principles:

* no required runtime server
* no database for v0
* no CMS for v0
* content lives in the repo as MDX files
* generated pages are static HTML
* search is generated statically from built HTML
* backlinks and graph data are generated at build time
* deployment happens from the public repository

## 7. Repository Visibility

The repository will be public.

Implications:

* never commit secrets
* do not rely on private environment variables for the core site
* keep draft/private writing out of the repository unless intentionally public
* assume source content can be inspected
* do not include private notes, TODOs, credentials, tokens, or unpublished sensitive material in MDX comments

## 8. Hosting

Production host:

```txt
Cloudflare Pages
```

Production domain:

```txt
meese.rs
```

The site should deploy from the public repo.

### Human input required

The human owner must configure:

* domain registration / DNS
* Cloudflare account/project
* repository connection
* production branch
* Cloudflare Pages build settings
* any Cloudflare bot/security settings in the dashboard

Suggested build settings:

```txt
Framework preset: Astro
Build command: pnpm build
Output directory: dist
Node version: 24 (pinned via .node-version)
Production branch: master
```

Deployment also carries a `wrangler.jsonc` with a static-assets config so the Cloudflare deploy resolves `dist/` without going through the dashboard onboarding flow.

## 9. Package Manager

Package manager: **pnpm**, pinned to `pnpm@11.2.2` via the `packageManager` field in `package.json`. Per-project pnpm config (overrides, allowed build scripts) lives in `pnpm-workspace.yaml`, since pnpm 11 ignores the `package.json` "pnpm" field.

## 10. File Structure

```txt
meese.rs/
├── AGENTS.md
├── README.md
├── astro.config.mjs
├── wrangler.jsonc
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── .node-version
├── design-system/               approved visual system (handoff bundle)
├── docs/
│   ├── SPEC.md                   this document
│   └── CONTENT.md                writer reference: type/status/verdict/topic-tag
├── public/
│   ├── AGENTS.md
│   ├── llms.txt
│   ├── robots.txt
│   ├── _headers
│   ├── favicon.svg
│   ├── logomark.svg
│   └── graph.json               generated snapshot (also built live for /graph)
├── scripts/
│   ├── validate-content.ts
│   ├── generate-graph.ts
│   └── lib/
│       └── frontmatter.ts        shared MDX frontmatter loader (build-time)
├── src/
│   ├── content.config.ts
│   ├── assets/                   optimized images (author photo, etc.)
│   ├── content/
│   │   └── posts/                *.mdx, one file per entry (11 at last count)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── SiteHeader.astro   wordmark, nav, theme switcher, ⌘K trigger
│   │   │   ├── SiteFooter.astro
│   │   │   ├── BaseHead.astro
│   │   │   ├── BackLink.astro     follows the reader's navigation source
│   │   │   ├── Icon.astro         inline Lucide SVGs
│   │   │   ├── AuthorByline.astro  name + avatar, links to /about (§20)
│   │   │   └── SectionLabel.astro
│   │   ├── posts/
│   │   │   ├── PostCard.astro
│   │   │   ├── NoteCard.astro     compact variant
│   │   │   ├── ReviewCard.astro
│   │   │   ├── FeedList.astro     renders the right card per type
│   │   │   ├── Badge.astro        type + status badges
│   │   │   ├── Tag.astro
│   │   │   ├── Stars.astro        review score
│   │   │   ├── Reticle.astro      featured-card framing
│   │   │   └── PagefindMeta.astro per-page search metadata
│   │   ├── graph/
│   │   │   └── GraphViewer.astro
│   │   ├── search/
│   │   │   ├── SearchUI.astro     ⌘K overlay shell
│   │   │   └── SearchPanel.astro  shared panel (overlay + /search page)
│   │   └── mdx/
│   │       ├── Callout.astro
│   │       ├── Aside.astro
│   │       ├── DemoFrame.astro
│   │       ├── Figure.astro
│   │       └── CodeCaption.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── PostLayout.astro
│   │   └── ReviewLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── latest.astro
│   │   ├── guides.astro
│   │   ├── notes.astro
│   │   ├── reviews/
│   │   │   └── index.astro
│   │   ├── topics/
│   │   │   ├── index.astro
│   │   │   └── [topic].astro
│   │   ├── about.astro
│   │   ├── graph.astro
│   │   ├── search.astro
│   │   ├── posts/
│   │   │   └── [slug].astro
│   │   ├── feed.xml.ts
│   │   └── feed.json.ts
│   ├── scripts/
│   │   └── search.ts             client-side Pagefind wiring
│   ├── styles/
│   │   ├── global.css            entry point (imports the rest)
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── graph.css
│   │   └── tokens/
│   │       ├── colors.css
│   │       ├── effects.css
│   │       ├── fonts.css
│   │       ├── spacing.css
│   │       └── typography.css
│   └── utils/
│       ├── posts.ts
│       ├── dates.ts
│       ├── topics.ts
│       ├── backlinks.ts
│       ├── graph.ts
│       └── seo.ts
└── (no tests/ directory, see §38)
```

## 11. Routes

Required routes:

```txt
/
  Latest-writing-first system index.

/latest
  Mixed chronological feed of all public entries.

/guides
  Tactical guides only.

/notes
  Short notes only.

/reviews
  Software/library review index, with aggregate score and a score/recency sort.

/topics
  Topic index.

/topics/[topic]
  Archive page for one topic.

/graph
  Sleek branded concept graph.

/search
  Static Pagefind search UI.

/about
  Author + site credibility hub (who writes this, what the site is). See §13.5.

/posts/[slug]
  Canonical post pages.

/feed.xml
  RSS feed.

/feed.json
  JSON feed.

/sitemap-index.xml
  Sitemap (generated by @astrojs/sitemap; see §33).

/robots.txt
  Crawler instructions.

/llms.txt
  AI-readable site navigation file.

/AGENTS.md
  Public agent/navigation guidance.
```

Use `/posts/[slug]` rather than root-level post slugs to avoid future route collisions.

## 12. Main Navigation

The header nav is split into two intent groups rather than a flat list of content types.

**Read group** (left, primary), where the writing and discovery surfaces live:

```txt
Latest
Guides
Notes
Reviews
Topics
Graph
```

**Site group** (trailing the read group, set off by a thin `.nav-divider`), for pages *about* the site and its author rather than entries in it:

```txt
About
```

About is the first member of the site group; it is also where any future site-meta page (Now, Uses, Colophon) would go without crowding the content nav. The divider keeps the two groups visually distinct. The site group lives inside the same `<nav>` as the read group (not out in the right-side chrome) so it stays in the mobile disclosure drawer; on mobile the vertical divider becomes a horizontal rule between the two groups.

Rationale: the nav was previously "one link per content type," which left no honest home for a page like About. Grouping by intent (things to *read* vs. pages *about the site*) keeps the content nav clean while giving About first-class visibility, per owner direction.

Search is **not** a top-nav link. It is a ⌘K overlay reachable from a header button (and a search tile on the homepage), with `/search` as the no-JS fallback page. The header also carries the theme switcher (§5). The wordmark links home.

Do not add nav links for features that do not exist yet.

### Deferred: feed consolidation

A larger reframe was considered and deferred: folding Latest/Guides/Notes into a single `Writing` destination with on-page type filters, shrinking the read group to Writing / Reviews / Topics / Graph. It conflicts with the per-type index routes (§11) and the deliberate Reviews separation (§18), so it is out of scope for the About change and is captured as a v1 option in §46.

## 13. Homepage Requirements

The homepage should feel like a system index, but lead with latest writing.

A two-column system index that leads with identity and latest writing. There are no separate "featured guides" or "recent notes" strips: those types flow through the unified writing feed. Reviews get their own slot because they sit off the main writing feed (§18).

```txt
identity band
  1. site identity (// system index label, headline, blurb)
  2. index-status panel (entries / topics / last-write counters, reticle framing)

main column
  3. latest review (one card, only if a review exists)
  4. latest writing (the unified feed, reviews excluded)

sidebar
  5. active topics (top 6, colored dots + counts)
  6. graph entry (teaser canvas linking to /graph)
  7. search entry (tile that opens the ⌘K overlay)
```

The homepage must not be a generic marketing landing page.

### Hero copy (shipped placeholder)

The design-approved placeholder currently in `src/pages/index.astro`:

```txt
// system index
Practical writing on software, AI/devtools, and systems-building.

Tactical guides, dev logs, short notes, labs, and references, long and short in
one feed. Built things, learned the tradeoffs, wrote them down.
```

### Human input required

The human owner should approve or rewrite the homepage hero copy before launch. It is marked as a placeholder in the page source.

## 13.5 About Page

Route: `/about` (static page, `src/pages/about.astro`).

Purpose: a single credibility hub that answers *who writes this site*, *what the site is*, and *why a reader should trust the judgment in it*. It is the destination for the post author byline (§20) and the nav "site" group (§12).

It is **not** a résumé and **not** a marketing landing page. Per owner direction, credibility rests on two things: **proof-of-work writing** (the index itself is the evidence; the page points back into it) and **a clear explanation of what the site is** (§3, §4). Career history and an exhaustive project list are deliberately out of scope.

### Layout

A system-index profile, built from the existing identity-band and reticle vocabulary (§5, §13), not a new visual language:

```txt
identity card (reticle-framed)
  - author photo (real asset, see below; not the logomark)
  - name: Aaron Meese
  - one-line descriptor (// about label, e.g. "builder · writes meese.rs")
  - link row (see Links)

bio prose
  - readable body type (not monospace, §21), ~72ch column
  - who Aaron is (brief), what meese.rs is, why it exists, what to expect
  - points back into the index: /latest, /reviews, /topics as proof-of-work

index stats (optional, reticle panel)
  - mirrors the homepage index-status (entries / topics / writing since)
  - reinforces the proof-of-work framing with live build-time counts
```

The author photo is a real asset the owner provides. Run it through image optimization (`astro:assets` `<Image>`) with descriptive alt text (§35). Suggested path: `src/assets/aaron-meese.{jpg,webp}`, falling back to `public/` only if optimization is skipped.

### Links

The hub surfaces these external profiles (owner-confirmed):

```txt
GitHub      https://github.com/ajmeese7
Portfolio   https://meese.dev
LinkedIn    https://www.linkedin.com/in/aaronmeese/
X           https://x.com/ajmeese7
Email       aaron@meese.dev   (mailto:)
```

Render as a labeled link row/list with the matching `Icon.astro` (Lucide) glyph per link. Apply `rel="me"` on the identity links (GitHub, LinkedIn, X, portfolio) to support profile verification. External links open in a new tab (`target="_blank"` + `rel="noopener noreferrer"`) so the reader keeps the blog tab; the email `mailto:` stays in-tab.

### Bio copy

The prose bio ships as an **owner-authored placeholder**, marked in the page source like the homepage hero (§13). Final copy is written in Aaron's voice (the `aaron-author-voice` workflow) before launch. Do not ship invented biographical claims; placeholder copy stays generic until the owner finalizes it.

### SEO

Standard public-page metadata (§34) applies. Add `Person` JSON-LD (`name`, `url`, `sameAs`: the link set above) so the page doubles as a structured identity record. The Open Graph image can reuse the author photo. Include `/about` in the sitemap (§33).

### Human input required

* Final bio copy (voice pass; placeholder ships first).
* Author photo asset (owner provides; optimized, with alt text).
* Confirm the link set and any handle changes before launch.

## 14. Content Types

Use one unified content collection with a `type` field.

Allowed post types:

```txt
guide
note
devlog
essay
lab
reference
review
```

`review` is a first-class type: software/library reviews are a major use case and carry their own structured frontmatter, layout, and index. The full writer-facing reference for all seven types (icon, hue, update policy) and the other label systems is `docs/CONTENT.md`.

Definitions:

```txt
guide
  Tactical, practical “how to do X” content.
  Should be updated in place when facts/tooling change.

note
  Short observation or 2-minute read.
  Appears in the main feed.

devlog
  Historical build/update log.
  Preserved as a record of what happened.

essay
  Longer argument, opinion, or synthesis.

lab
  Experiment, benchmark, reproduction, investigation, or technical test.

reference
  Durable explainer or glossary-style page.

review
  Software/library review. Carries a structured `review:` block (score,
  verdict, criteria, pros/cons, links); prose verdict in the MDX body.
  Has its own layout (ReviewLayout), card (ReviewCard), and /reviews index.
```

## 15. Content Update Policy

Default rules:

```txt
Guides:
  update in place when facts, tooling, or recommendations change.

Notes:
  leave mostly historical unless correcting errors.

Dev logs:
  preserve historically unless factual cleanup is needed.

Essays:
  preserve original argument; add update notes if needed.

Labs:
  preserve original result; publish a new run if materially different.

References:
  update in place.

Reviews:
  update the score/verdict if the subject changes materially; record the revision.
```

Visible status labels are not required by default.

Only show special banners when relevant:

```txt
Updated
Corrected
Deprecated
Superseded by
```

Do not show confidence labels like `stable`, `experimental`, or `field-tested` by default.

## 16. Content Schema

Define a posts collection in `src/content.config.ts`.

Required frontmatter fields:

```yaml
title: string          # non-empty
description: string     # non-empty
date: date
type: guide | note | devlog | essay | lab | reference | review
topics: string[]
tags: string[]
draft: boolean
```

Optional frontmatter fields:

```yaml
updated: date
summary: string
featured: boolean
pinned: boolean
series: string
related:
  - slug: string
    reason: string
supersedes:
  - string
supersededBy: string
canonicalUrl: string
externalUrl: string
hideFromFeed: boolean
unlisted: boolean       # live, shareable URL but hidden from listings + sitemap, noindex
review:                 # required when type: review (see below)
  subject: string
  version: string
  score: number         # 0..5
  verdict: recommended | caveats | watch | skip
  verdictLabel: string  # free text actually shown, e.g. "One to watch"
  tagline: string
  links:
    - { label: string, href: url }
  meta:
    - { key: string, value: string }
  criteria:
    - { name: string, score: number, note: string }
  pros: string[]
  cons: string[]
  bottomLine: string
```

The shipped schema (`src/content.config.ts`, abbreviated). Title/description are non-empty, and a `.refine()` makes the `review` block mandatory on review entries:

```ts
import { defineCollection } from 'astro:content';
import { z } from 'astro:schema';
import { glob } from 'astro/loaders';

export const POST_TYPES = [
  'guide', 'note', 'devlog', 'essay', 'lab', 'reference', 'review',
] as const;

const reviewSchema = z.object({
  subject: z.string(),
  version: z.string().optional(),
  score: z.number().min(0).max(5),
  verdict: z.enum(['recommended', 'caveats', 'watch', 'skip']),
  verdictLabel: z.string(),
  tagline: z.string().optional(),
  links: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),
  meta: z.array(z.object({ key: z.string(), value: z.string() })).default([]),
  criteria: z
    .array(z.object({ name: z.string(), score: z.number().min(0).max(5), note: z.string() }))
    .default([]),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  bottomLine: z.string().optional(),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
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
      related: z.array(z.object({ slug: z.string(), reason: z.string() })).default([]),
      supersedes: z.array(z.string()).default([]),
      supersededBy: z.string().optional(),
      canonicalUrl: z.string().url().optional(),
      externalUrl: z.string().url().optional(),
      hideFromFeed: z.boolean().default(false),
      unlisted: z.boolean().default(false),
      review: reviewSchema.optional(),
    })
    .refine((d) => d.type !== 'review' || d.review !== undefined, {
      message: "Posts with type 'review' must include a `review:` block.",
      path: ['review'],
    }),
});

export const collections = { posts };
```

## 17. Example Post Frontmatter

### Guide

```yaml
---
title: "Getting an Expo SDK 56 App Running on a Real Device"
description: "Modernizing an old app to the newest SDK turns up a few gotchas the docs never connect for you."
date: 2026-06-08
updated: 2026-06-11
type: guide
topics:
  - react-native
  - expo
  - mobile-development
tags:
  - expo-sdk
  - android
  - eas
draft: false
featured: true
related:
  - slug: ai-assisted-upgrade-workflows
    reason: "Related modernization workflow pattern."
---
```

### Note

```yaml
---
title: "Expo Go version mismatch is still a bad failure mode"
description: "A short note on why SDK/runtime mismatch errors remain more confusing than they need to be."
date: 2026-06-09
type: note
topics:
  - react-native
  - expo
tags:
  - expo-go
  - developer-experience
draft: false
---
```

### Dev Log

```yaml
---
title: "Building the first version of meese.rs"
description: "Initial architecture choices and tradeoffs for a static MDX writing system."
date: 2026-06-11
type: devlog
topics:
  - static-sites
  - astro
  - publishing
tags:
  - mdx
  - pagefind
  - cloudflare-pages
draft: false
---
```

### Review

```yaml
---
title: "Claude Code, four months in"
description: "The agentic CLI that actually stuck. Where it earns its keep and where it doesn't."
date: 2026-06-10
type: review
topics:
  - ai-devtools
  - agents
tags:
  - claude-code
  - cli
draft: false
review:
  subject: "Claude Code"
  version: "4.6"
  score: 4.6
  verdict: recommended
  verdictLabel: "Recommended"
  tagline: "The agentic CLI that actually stuck."
  criteria:
    - { name: "Autonomy", score: 4.5, note: "Handles multi-step work with little babysitting." }
    - { name: "Ergonomics", score: 4.7, note: "Terminal-native, fits existing workflows." }
  pros:
    - "Strong multi-file edits"
    - "Good at staying on task"
  cons:
    - "Occasionally over-eager"
  bottomLine: "The first agent CLI I reach for by default."
---
```

See `src/content/posts/review-*.mdx` for the complete, working review examples (Claude Code, Bun, Paseo).

## 18. Feed Behavior

The main feed includes all public content types unless `hideFromFeed: true`, **with one deliberate exception**: reviews. Reviews are excluded from the homepage "latest writing" column and have their own `/reviews` index (so the writing feed stays writing, and reviews get the score/verdict treatment they need). Reviews *do* still appear in `/latest`, the RSS/JSON feeds, the sitemap, and the graph. The split is enforced in `src/utils/posts.ts`: `getWriting()` (feed minus reviews) drives the homepage; `getFeedPosts()` (everything but `hideFromFeed`) drives `/latest` and the feeds.

Sort order:

```txt
pinned first
then newest date first
```

If `updated` exists, display it on the card and post page, but do not use `updated` for default feed sorting unless the owner later requests it.

Notes appear inline in the main feed, with a more compact card style. The `/reviews` index additionally offers a client-side newest / highest-rated sort toggle.

## 19. Post Card Requirements

Every post card should show:

```txt
title
description or summary
type
date
updated date if present
topics
reading time if practical
```

Guide/devlog/essay/lab/reference cards can be larger.

Note cards should be compact. `FeedList` picks the card per type: `NoteCard` for notes, `ReviewCard` for reviews, `PostCard` for the rest. Featured entries get reticle-tick framing.

## 20. Post Page Requirements

Each post page should include:

```txt
title
description
type
date
updated date if present
topics
tags
table of contents for longer posts
main content
related posts
backlinks
correction/update/deprecation banner when relevant
```

Implementation notes:

* Two layouts. `PostLayout` for the six writing types; `ReviewLayout` for reviews (it renders the score band, criteria table, pros/cons, verdict panel, and links above/around the prose). `/posts/[slug]` picks the layout by `type`.
* The table of contents is built from `h2` headings only, shown only when there is more than one, with scroll-spy highlighting via an `IntersectionObserver`. No separate `TableOfContents` component; it is inlined in `PostLayout`.
* Status banner precedence is superseded, then updated (deprecated/corrected are manual/editorial). See `docs/CONTENT.md` §2.
* Backlinks render in three buckets: related, mentioned by, same topic (§25).
* Posts with `externalUrl` set get no local page at all; they link straight out from cards and feeds.
* An author byline (name + small avatar/logomark) links to `/about`, putting credibility at the point of reading (§13.5). It renders on both `PostLayout` and `ReviewLayout`. Keep it understated; it is a byline, not a bio.

Do not include comments.

Do not include discussion links.

Do not include per-post “View MDX” links by default.

## 21. Typography Requirements

The site should prioritize readability.

Requirements:

* readable line length
* clear heading hierarchy
* strong code block styling
* mobile-first article layout
* high contrast text
* accessible focus states
* visible link styling
* tables that work on mobile
* image/figure captions
* callout components for warnings/notes/context

Suggested content width:

```css
--content-width: 72ch;
--wide-content-width: 1120px;
```

Body copy should not be pure monospace.

Use monospace for:

* metadata
* code
* small system-index UI elements
* search/prompt-inspired components

## 22. MDX Components

Implement initial MDX components:

```txt
Callout
Aside
DemoFrame
Figure
CodeCaption
```

### Callout

Usage:

```mdx
<Callout type="warning" title="Watch for SDK/runtime mismatch">
Expo Go may not support the newest SDK immediately depending on release timing.
</Callout>
```

Allowed types:

```txt
note
warning
danger
tip
context
```

### Aside

Usage:

```mdx
<Aside>
This is secondary context that should not interrupt the main reading flow.
</Aside>
```

### DemoFrame

Usage:

```mdx
<DemoFrame title="Search behavior demo">
  <SomeInteractiveComponent />
</DemoFrame>
```

### Figure

Usage:

```mdx
<Figure src="/images/example.png" alt="..." caption="..." />
```

### CodeCaption

Usage:

```mdx
<CodeCaption title="Install dependencies" />
```

## 23. Search

Use Pagefind.

Requirements:

* index static generated HTML
* expose `/search` (plus a ⌘K overlay; both share `SearchPanel`)
* search by full text
* show result title, excerpt, type, date, and topics
* filters: **type only**. The panel shows one row of type chips (all seven types). Topic and tag filters are **not** built. The per-page metadata to support them is already emitted (below), so adding them later is UI work, not a re-index.

Pages emit Pagefind metadata via the `PagefindMeta` component, and the post body is marked `data-pagefind-body`. Example metadata attributes:

```html
<meta data-pagefind-meta="type" content="guide" />
<meta data-pagefind-meta="topics" content="astro,mdx,static-sites" />
<meta data-pagefind-meta="tags" content="pagefind,cloudflare-pages" />
```

The build generates the Pagefind index after the Astro build. The shipped scripts also fold content validation and the graph snapshot into `build`, so a single `pnpm build` does the whole pipeline (and CI just runs it):

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "pnpm validate:content && pnpm generate:graph && astro build && pagefind --site dist",
    "preview": "astro preview",
    "check": "astro check",
    "validate:content": "tsx scripts/validate-content.ts",
    "generate:graph": "tsx scripts/generate-graph.ts"
  }
}
```

## 24. Topics

Topics are higher-level categories.

Examples:

```txt
ai-devtools
local-llms
react-native
expo
static-sites
cloudflare
security
developer-experience
product
```

Tags are lower-level labels.

Example:

```txt
expo-go
eas
pagefind
mdx
astro-content-collections
cursor
claude-code
```

Topic pages should include:

```txt
topic title
short description if available
latest posts in topic
related topics if available
graph link
```

### Human input required

The human owner should provide the initial canonical topic list before launch.

If none is provided, the coding agent may infer topics from initial posts, but should keep them simple and avoid overfitting.

## 25. Backlinks

Backlinks are computed in `src/utils/backlinks.ts` as `PostLayout` renders each page. Astro builds these pages statically, so the result is build-time static HTML with no separate script or JSON artifact. Shared tags are deliberately not a source: too noisy, and topics already cover the "related subject" case.

Sources of backlinks:

```txt
manual frontmatter related links
internal /posts/<slug> links in the body
supersedes/supersededBy fields
shared topics (capped, ranked by overlap)
```

Post pages should show:

```txt
Related
Mentioned by
Same topic
```

Keep the backlink UI useful, not exhaustive.

For v0:

* show manually related posts first
* show direct internal-link backlinks second
* optionally show “more in this topic” third

Do not create AI-inferred backlinks in v0.

## 26. Graph

Expose a sleek branded graph at:

```txt
/graph
```

Also emit machine-readable graph data at:

```txt
/graph.json
```

The graph is reachable from the top nav and from a homepage teaser. It is a discovery feature, not the homepage.

### Implementation

No graph library. `GraphViewer.astro` renders the graph server-side as a styled SVG, so it works as a static diagram with no JS; a small vanilla-JS island layers hover-to-trace-edges, click-to-select, and a detail panel. The graph data (nodes, edges, deterministic layout) is built by `src/utils/graph.ts#buildGraph`, shared by both the live `/graph` page and the `generate-graph.ts` snapshot, so they never drift.

Layout is deterministic (seeded by a hash of each id): topics sit on an inner ring, posts orbit the centroid of their topics. That keeps `graph.json` reproducible across builds.

### Graph node types

Two node families: **topic** nodes and **post** nodes (a post's node `type` is its content type, e.g. `guide`/`note`/`review`). No tag nodes.

```txt
topic
guide | note | devlog | essay | lab | reference | review   (one per post)
```

Topic node ids are namespaced `topic:<slug>` to avoid colliding with a post slug.

### Graph edge types

```txt
topic          post -> topic membership
related        manual related links
mentions       internal body links
supersedes
superseded_by
```

The `tag` edge type is defined in the types but not emitted (no tag nodes exist to connect).

### Example `graph.json`

The shipped artifact also carries layout coordinates (`x`, `y` normalized 0..1), a node radius `r`, and a resolved `color`, so a consumer can render it without recomputing the layout:

```json
{
  "nodes": [
    {
      "id": "expo-sdk-56-real-device",
      "type": "guide",
      "title": "Getting an Expo SDK 56 App Running on a Real Device",
      "url": "/posts/expo-sdk-56-real-device/",
      "color": "#6FA8D6",
      "x": 0.61,
      "y": 0.42,
      "r": 9
    },
    {
      "id": "topic:expo",
      "type": "topic",
      "title": "expo",
      "url": "/topics/expo/",
      "color": "#9A7CFF",
      "x": 0.5,
      "y": 0.2,
      "r": 15
    }
  ],
  "edges": [
    { "source": "expo-sdk-56-real-device", "target": "topic:expo", "type": "topic" }
  ]
}
```

### Human input required

The branded graph style (blueprint grid, reticle frame, legend, accent-on-focus) is implemented; owner sign-off on the final look is the one remaining step.

## 27. Root-Level Public Files

Include:

```txt
/public/robots.txt
/public/llms.txt
/public/AGENTS.md
/public/_headers
```

Also generate:

```txt
/sitemap-index.xml   (+ /sitemap-0.xml, via @astrojs/sitemap)
/feed.xml
/feed.json
/graph.json
```

`/AGENTS.md` and `/llms.txt` are served from `public/` as static files (the public `AGENTS.md` is distinct from the repo-root one; see §28).

## 28. `AGENTS.md`

There should be two AGENTS files:

```txt
/AGENTS.md
/public/AGENTS.md
```

### Root repo `AGENTS.md`

Purpose:

* guide coding agents working in the public repository
* explain project structure
* explain development commands
* define coding conventions
* prevent irrelevant feature creep

Must include:

```txt
Production domain: meese.rs
Static-first architecture
Astro + MDX + Pagefind
No comments
No CMS
No server runtime unless explicitly approved
No terminal-first UX
No discussion links
No per-post View MDX links by default
Do not invent the final custom visual system
```

### Public `/AGENTS.md`

Purpose:

* help local AI/dev assistants navigate the published site
* explain canonical sections
* point to feeds, sitemap, graph, and search
* state that bulk scraping/training use is not intended

Keep this file concise.

## 29. `llms.txt`

Create `/public/llms.txt`.

Purpose:

* provide AI-readable site overview
* list key sections
* explain canonical paths
* point to sitemap/feed/graph

Suggested content:

```txt
# meese.rs

> Canonical technical writing index for software, AI/devtool work, implementation notes, and systems-building.

## Sections

- /latest, mixed chronological writing feed
- /guides, tactical guides
- /notes, short notes
- /reviews, software & library reviews
- /topics, topic index
- /graph, visual content graph
- /search, site search

## Machine-readable resources

- /sitemap-index.xml
- /feed.xml
- /feed.json
- /graph.json

## Usage

This site is intended for human reading, normal search indexing, and local assistant use for navigating, summarizing, or citing specific public pages. Bulk scraping for model training or automated mirroring is not intended.
```

Do not overbuild this feature.

## 30. `robots.txt`

Create `/public/robots.txt`.

Simple v0:

```txt
User-agent: *
Allow: /

Sitemap: https://meese.rs/sitemap-index.xml
```

If later the owner wants stricter bot rules, adjust after launch.

Do not spend significant implementation time on crawler-control logic during v0.

## 31. Cloudflare Pages `_headers`

`/public/_headers`, a security baseline plus cache-control for the immutable build assets and the search index:

```txt
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  X-Frame-Options: DENY

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/pagefind/*
  Cache-Control: public, max-age=86400
```

CSP is **not enabled yet**. Before it can ship, the policy has to account for three things the build relies on: the inline pre-paint theme-apply script in `<head>` (needs a hash or `'unsafe-inline'`), the Google Fonts CDN (`fonts.googleapis.com` + `fonts.gstatic.com`, until fonts are self-hosted), and the Pagefind index fetched by search (`connect-src`). A workable target once fonts are self-hosted and the inline script is hashed:

```txt
/*
  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'
```

### Human input required

Test CSP in a Cloudflare production preview before enabling a strict final policy. Icons are inline SVG (no icon-font request); fonts are the one external dependency to resolve.

## 32. Feeds

Generate both:

```txt
/feed.xml
/feed.json
```

`feed.xml` uses `@astrojs/rss`; `feed.json` is a hand-built JSON Feed route. Both pull from `getFeedPosts()`.

Feed requirements:

* include all non-draft posts unless `hideFromFeed: true`
* include notes, guides, dev logs, essays/labs/references, **and reviews**
* sort by `date`, newest first
* include title, description, canonical URL (or `externalUrl`), date, and type
* type and topics are emitted as feed categories

## 33. Sitemap

Generated by `@astrojs/sitemap`, served as `/sitemap-index.xml` (which points at `/sitemap-0.xml`).

Include:

* homepage
* latest page
* guide / notes / reviews indexes
* about page
* topic index
* topic pages
* all public posts

Exclude:

* drafts and hidden posts (they never become routes; see §37)
* `/search` and `/graph` (the `astro.config.mjs` filter drops them: JS-driven discovery surfaces with no standalone indexable content)

## 34. SEO Requirements

Every public page should include:

```txt
title
description
canonical URL
Open Graph title
Open Graph description
Open Graph URL
Open Graph type
Twitter card metadata
```

Post pages should also include:

```txt
published date
updated date if present
article tags/topics where appropriate
```

The site should not require JavaScript for basic reading.

Search and graph can require JavaScript.

## 35. Accessibility Requirements

Required:

* semantic HTML
* keyboard-accessible nav
* visible focus states
* skip link
* sufficient color contrast
* descriptive alt text for meaningful images
* no text encoded only in images
* no hover-only interactions
* graph page should provide a non-graph fallback list or explanation

For the graph page, include a textual fallback such as:

```txt
This graph shows relationships between posts, notes, topics, and tags. Use the Topics page or Search page for a non-visual navigation path.
```

## 36. Performance Requirements

Target:

* static HTML for core pages
* minimal client-side JavaScript
* no heavy graph code loaded outside `/graph`
* no search code loaded outside `/search` unless needed
* image optimization where practical
* no unnecessary third-party scripts

Performance priority order:

```txt
reading pages
homepage
feeds/sitemap
search
graph
```

The graph can be heavier than normal pages, but should not affect the rest of the site.

## 37. Draft Handling

Draft posts should use:

```yaml
draft: true
```

Drafts must not be included in:

```txt
production build pages
feeds
sitemap
search index
graph
topic pages
latest feed
```

Implementation can allow drafts in local development.

## 38. Content Validation

`scripts/validate-content.ts` (over a shared frontmatter loader, `scripts/lib/frontmatter.ts`) catches the cross-file and content mistakes the per-file Zod schema cannot see, and exits non-zero on any:

```txt
missing/empty title
missing/empty description
missing type / invalid type
missing date / invalid date
invalid updated date
duplicate slug
related slug does not exist
supersedes slug does not exist
supersededBy slug does not exist
```

It also reports the draft count (drafts are excluded from the production build by the query layer, §37, so this is informational, not a failure).

Command:

```bash
pnpm validate:content
```

This runs in CI and at the head of `pnpm build`.

> **Gap:** there is no test harness (no Vitest, no `tests/`). Content integrity is covered by this validation script plus `astro check`; there are no unit tests. Wiring up a test runner is the first thing to do if one is wanted.

## 39. CI Requirements

Use GitHub Actions or equivalent.

Minimum CI steps:

```txt
install dependencies
validate content
typecheck / astro check
build site
verify Pagefind index was generated
```

Shipped workflow (`.github/workflows/ci.yml`). Actions are pinned to current majors, pnpm is resolved from the `packageManager` pin (no hard-coded version), Node is 24, and the primary branch is `master`:

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - master
      - main

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: pnpm/action-setup@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm validate:content
      - run: pnpm check
      - run: pnpm build
      - name: Verify Pagefind index was generated
        run: test -f dist/pagefind/pagefind.js
```

`pnpm build` already runs `validate:content` and `generate:graph` internally; the explicit `validate:content` step just fails faster with a clearer message before the full build.

## 40. Deployment Requirements

Deploy from the public repository to Cloudflare Pages.

Production branch:

```txt
master
```

A `wrangler.jsonc` with a static-assets config is committed so the Cloudflare deploy resolves `dist/` directly instead of dropping into the dashboard onboarding flow. Preview deployments should be enabled for pull requests if available.

### Human input required

The human owner must connect the repository to Cloudflare Pages and configure the `meese.rs` domain.

## 41. Launch Checklist

Before launch (status as of 2026-06):

```txt
[x] Astro project created
[x] MDX enabled
[x] content collection schema implemented (incl. review block)
[x] sample guide / note / devlog created (11 sample posts, all types + 3 reviews)
[x] homepage implemented
[x] latest feed implemented
[x] guides page implemented
[x] notes page implemented
[x] reviews page implemented
[x] topics index implemented
[x] topic detail pages implemented
[~] about page implemented                   (built; placeholder bio + owner photo pending)
[x] post layout implemented (PostLayout + ReviewLayout)
[x] post cards implemented
[x] note card compact style implemented
[x] update/superseded banners implemented (corrected/deprecated are manual)
[x] related posts implemented
[x] backlinks implemented
[x] Pagefind search implemented (type filter only; topic/tag deferred)
[x] graph.json generated
[x] /graph implemented (custom SVG, no library)
[x] theme switcher implemented (9 dark accents)
[x] RSS feed generated
[x] JSON feed generated
[x] sitemap generated (@astrojs/sitemap -> /sitemap-index.xml)
[x] robots.txt added
[x] llms.txt added
[x] AGENTS.md added (root + public)
[x] _headers added (CSP still deferred)
[x] CI passes
[ ] Cloudflare Pages deploy works            (owner)
[ ] production domain points to Cloudflare Pages   (owner)
[~] mobile layout tested                     (built mobile-first; needs a device pass)
[x] accessibility basics checked (skip link, focus states, graph fallback)
[x] graph page has fallback text
[x] no draft posts in production
```

## 42. Human Input Checklist

The coding agent must ask for or wait on human input for:

```txt
[x] cybersecurity UX design kit / custom visual system   (delivered + approved, design-system/)
[ ] final homepage hero copy                             (placeholder shipped, owner to confirm)
[ ] about page bio copy + author photo                   (placeholder/voice pass + owner photo; §13.5)
[~] initial canonical topic list                         (inferred from posts; owner to finalize)
[ ] first real posts to migrate/add                      (11 sample posts seed the build)
[x] favicon/logo direction                               (logomark.svg + favicon.svg in place)
[~] graph visual style approval                          (style built; owner sign-off pending)
[ ] Cloudflare account/project setup                     (owner)
[ ] DNS/domain setup                                     (owner)
[ ] CSP production testing                               (owner/agent; see §31)
```

The coding agent should not block the initial scaffold on these items. Use placeholders where possible and mark them clearly.

## 43. Initial Implementation Plan

### Milestone 1: Scaffold

```txt
Create Astro project.
Add MDX integration.
Add base layout.
Add global styles.
Add placeholder design tokens.
Add content collection schema.
Add sample posts.
```

Acceptance criteria:

```txt
pnpm dev works.
Sample posts render.
No runtime server required.
```

### Milestone 2: Core Pages

```txt
Implement homepage.
Implement latest page.
Implement guides page.
Implement notes page.
Implement post route.
Implement topic pages.
```

Acceptance criteria:

```txt
All core routes render statically.
Drafts are excluded.
Notes appear in the main feed.
```

### Milestone 3: Reading Experience

```txt
Implement post layout.
Implement post cards.
Implement compact note cards.
Implement table of contents.
Implement MDX callouts.
Implement update/correction banners.
```

Acceptance criteria:

```txt
Long posts are readable.
Short notes look intentionally compact.
Mobile layout works.
```

### Milestone 4: Search

```txt
Add Pagefind.
Generate index after build.
Implement /search UI.
Add filters for type/topic/tag.
```

Acceptance criteria:

```txt
Search works after production build.
Results show metadata.
Filters work.
```

### Milestone 5: Backlinks and Graph

```txt
Generate backlink data.
Show related posts/backlinks on post pages.
Generate graph.json.
Implement branded /graph page.
```

Acceptance criteria:

```txt
Manual related links work.
Internal backlinks work.
Graph page renders (live build via buildGraph; graph.json is a parallel snapshot).
Graph page is linked in top nav.
```

### Milestone 6: Feeds, Metadata, Security Files

```txt
Generate feed.xml.
Generate feed.json.
Generate the sitemap (@astrojs/sitemap -> /sitemap-index.xml).
Add robots.txt.
Add llms.txt.
Add public AGENTS.md.
Add _headers.
```

Acceptance criteria:

```txt
Feeds validate.
Sitemap includes public pages.
Security headers appear in deployed preview.
```

### Milestone 7: Deploy

```txt
Connect repo to Cloudflare Pages.
Configure build.
Configure domain.
Test production deployment.
```

Acceptance criteria:

```txt
https://meese.rs loads.
Core routes load.
Posts are readable.
Search works.
Graph works.
Feeds and sitemap work.
```

## 44. Definition of Done for v0

`meese.rs` v0 is done when:

```txt
- The site is publicly deployed at meese.rs.          (owner: connect CF Pages + domain)
- The homepage is a latest-writing-first system index.   done
- Guides, notes, dev logs, essays, labs, references, and reviews author in MDX.  done
- Short notes appear in the main feed.                   done
- Posts are statically rendered.                         done
- Search works without a backend (type filter; topic/tag deferred).  done w/ caveat
- Topics work.                                           done
- Backlinks work.                                        done
- The graph is available at /graph.                      done
- Root public files exist.                               done
- No comments, CMS, database, SSH, or terminal-first features exist.  held
- The repository is public and safe to inspect.          held
```

Everything except the deploy line is built. Deploy is the one owner-side step (connect the repo to Cloudflare Pages and point the domain). The one functional shortfall against this list is topic/tag search filters (§23).

## 45. Guidance for Coding Agent

Follow these rules:

```txt
1. Keep the core site static.
2. Do not introduce a server runtime without explicit approval.
3. Do not add comments or discussion features.
4. Do not build an admin panel.
5. Do not add terminal UX as a primary feature.
6. Do not expose per-post raw MDX links by default.
7. Do not reinvent or fork the custom visual system; extend it from `design-system/` and `src/styles/tokens/`.
8. Reference the design system's semantic tokens, never raw palette values.
9. Keep the homepage focused on latest writing first.
10. Keep notes in the main feed.
11. Prioritize readability over visual novelty.
12. Keep the graph sleek, branded, and discoverable, but do not make it the homepage.
13. Implement build-time validation for content relationships.
14. Treat the repo as public at all times.
```

## 46. Open Questions

Still owner-side. Placeholders are in place, so none of these block anything:

```txt
- Final homepage hero copy (a design-approved placeholder ships now; §13).
- Canonical topic list (inferred from posts, with a curated hue map in
  src/utils/topics.ts; §24).
- Which existing posts to migrate first (11 sample posts seed the build today).
- Final favicon/logo mark (a logomark.svg + favicon.svg are in place).
- About page bio copy and author photo (placeholder ships; §13.5).
```

Possible v1 work, not in scope now: topic/tag search filters (§23), graph filtering by type/topic, self-hosting fonts so a strict CSP can ship (§31), and the nav feed-consolidation reframe (collapse Latest/Guides/Notes into one `Writing` destination with on-page type filters; §12).
