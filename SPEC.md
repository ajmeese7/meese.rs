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

The visual identity should lean toward a **custom cybersecurity UX design kit**: precise, technical, polished, and distinctive without sacrificing the reading experience.

The coding agent must not invent the final brand system. Placeholder styling is acceptable during implementation, but final colors, typography, spacing, gradients, borders, iconography, and interaction states require human approval.

### Human input required

The human owner must provide one of the following before final visual implementation:

* screenshots of the intended cybersecurity UX design kit
* CSS variables from an existing design implementation
* a Figma/design reference
* links to an existing repo/page using the desired custom visual system
* a written style guide
* explicit approval to create a new custom visual system from scratch

Until then, use neutral placeholder tokens and clearly mark them as placeholders.

Example placeholder tokens:

```css
:root {
  --color-bg: #080b10;
  --color-surface: #101620;
  --color-surface-elevated: #151d2a;
  --color-text: #e8eef8;
  --color-text-muted: #9aa8ba;
  --color-border: #263244;
  --color-accent: #7cc7ff;
  --color-accent-secondary: #b18cff;
  --color-danger: #ff6b6b;
  --color-warning: #ffc857;
}
```

These are placeholders only. Replace them when the final custom visual direction is provided or approved.

## 6. Architecture

Use a static-first architecture.

Recommended stack:

```txt
Astro
MDX
Astro Content Collections
Pagefind
Cloudflare Pages
TypeScript
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
Build command: npm run build
Output directory: dist
Node version: current LTS
```

## 9. Package Manager

Preferred package manager:

```txt
pnpm
```

If the existing environment does not use `pnpm`, use `npm` instead.

### Initial setup command

```bash
pnpm create astro@latest meese.rs
cd meese.rs
pnpm astro add mdx
pnpm add pagefind
```

If using npm:

```bash
npm create astro@latest meese.rs
cd meese.rs
npx astro add mdx
npm install pagefind
```

## 10. Suggested File Structure

```txt
meese.rs/
├── AGENTS.md
├── README.md
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── AGENTS.md
│   ├── llms.txt
│   ├── robots.txt
│   ├── _headers
│   ├── favicon.svg
│   └── graph.json
├── scripts/
│   ├── generate-graph.ts
│   ├── generate-backlinks.ts
│   └── validate-content.ts
├── src/
│   ├── content.config.ts
│   ├── content/
│   │   └── posts/
│   │       ├── example-guide.mdx
│   │       ├── example-note.mdx
│   │       └── example-devlog.mdx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── SiteHeader.astro
│   │   │   ├── SiteFooter.astro
│   │   │   └── BaseHead.astro
│   │   ├── posts/
│   │   │   ├── PostCard.astro
│   │   │   ├── NoteCard.astro
│   │   │   ├── PostMeta.astro
│   │   │   ├── TableOfContents.astro
│   │   │   ├── RelatedPosts.astro
│   │   │   ├── Backlinks.astro
│   │   │   └── UpdateNotice.astro
│   │   ├── graph/
│   │   │   └── GraphViewer.astro
│   │   ├── search/
│   │   │   └── SearchUI.astro
│   │   └── mdx/
│   │       ├── Callout.astro
│   │       ├── Aside.astro
│   │       ├── DemoFrame.astro
│   │       ├── Figure.astro
│   │       └── CodeCaption.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── PostLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── latest.astro
│   │   ├── guides.astro
│   │   ├── notes.astro
│   │   ├── topics/
│   │   │   ├── index.astro
│   │   │   └── [topic].astro
│   │   ├── graph.astro
│   │   ├── search.astro
│   │   ├── posts/
│   │   │   └── [slug].astro
│   │   ├── feed.xml.ts
│   │   ├── feed.json.ts
│   │   └── sitemap.xml.ts
│   ├── styles/
│   │   ├── global.css
│   │   ├── tokens.css
│   │   ├── typography.css
│   │   └── graph.css
│   └── utils/
│       ├── posts.ts
│       ├── dates.ts
│       ├── topics.ts
│       ├── graph.ts
│       └── seo.ts
└── tests/
    └── content-schema.test.ts
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

/topics
  Topic index.

/topics/[topic]
  Archive page for one topic.

/graph
  Sleek branded concept graph.

/search
  Static Pagefind search UI.

/posts/[slug]
  Canonical post pages.

/feed.xml
  RSS feed.

/feed.json
  JSON feed.

/sitemap.xml
  Sitemap.

/robots.txt
  Crawler instructions.

/llms.txt
  AI-readable site navigation file.

/AGENTS.md
  Public agent/navigation guidance.
```

Use `/posts/[slug]` rather than root-level post slugs to avoid future route collisions.

## 12. Main Navigation

Use this main nav:

```txt
Latest
Guides
Notes
Topics
Graph
Search
```

Do not add nav links for features that do not exist yet.

## 13. Homepage Requirements

The homepage should feel like a system index, but lead with latest writing.

Recommended homepage order:

```txt
1. compact hero / site identity
2. latest writing
3. featured guides
4. active topics
5. recent notes
6. graph entry
7. search entry
```

The homepage must not be a generic marketing landing page.

### Hero copy placeholder

```txt
meese.rs

Practical writing on software, AI/devtools, implementation work, and systems-building.
```

### Human input required

The human owner should approve or rewrite the homepage hero copy before launch.

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
```

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
title: string
description: string
date: date
type: guide | note | devlog | essay | lab | reference
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
```

Recommended TypeScript/Zod structure:

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/posts',
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    type: z.enum(['guide', 'note', 'devlog', 'essay', 'lab', 'reference']),
    topics: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    summary: z.string().optional(),
    featured: z.boolean().default(false),
    pinned: z.boolean().default(false),
    series: z.string().optional(),
    related: z
      .array(
        z.object({
          slug: z.string(),
          reason: z.string(),
        })
      )
      .default([]),
    supersedes: z.array(z.string()).default([]),
    supersededBy: z.string().optional(),
    canonicalUrl: z.string().url().optional(),
    externalUrl: z.string().url().optional(),
    hideFromFeed: z.boolean().default(false),
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

## 18. Feed Behavior

The main feed must include all public content types unless `hideFromFeed: true`.

Sort order:

```txt
pinned first
then newest date first
```

If `updated` exists, display it on the card and post page, but do not use `updated` for default feed sorting unless the owner later requests it.

Notes should appear inline in the main feed, but with a more compact card style.

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

Note cards should be compact.

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
* expose `/search`
* search by full text
* show result title, excerpt, type, date, and topics
* support filters for:

  * type
  * topic
  * tag

Pages should include Pagefind metadata attributes where needed.

Example page metadata attributes:

```html
<meta data-pagefind-meta="type" content="guide" />
<meta data-pagefind-meta="topics" content="astro,mdx,static-sites" />
<meta data-pagefind-meta="tags" content="pagefind,cloudflare-pages" />
```

Build script should generate the Pagefind index after Astro build.

Suggested package scripts:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && pagefind --site dist",
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

Backlinks should be generated at build time.

Sources of backlinks:

```txt
manual frontmatter related links
internal Markdown/MDX links
supersedes/supersededBy fields
shared topics
shared tags
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

The graph should be easy to find from the top nav.

The graph is a discovery feature, not the homepage.

### Graph node types

```txt
post
guide
note
devlog
essay
lab
reference
topic
tag
```

### Graph edge types

```txt
topic
tag
related
mentions
supersedes
superseded_by
```

### Example `graph.json`

```json
{
  "nodes": [
    {
      "id": "expo-sdk-56-real-device",
      "type": "guide",
      "title": "Getting an Expo SDK 56 App Running on a Real Device",
      "url": "/posts/expo-sdk-56-real-device"
    },
    {
      "id": "expo",
      "type": "topic",
      "title": "Expo",
      "url": "/topics/expo"
    }
  ],
  "edges": [
    {
      "source": "expo-sdk-56-real-device",
      "target": "expo",
      "type": "topic"
    }
  ]
}
```

### Human input required

The human owner must approve the graph’s visual style after an initial prototype.

The first graph implementation can be simple, but it should not look like an unstyled default visualization.

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
/sitemap.xml
/feed.xml
/feed.json
/graph.json
```

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

- /latest — mixed chronological writing feed
- /guides — tactical guides
- /notes — short notes
- /topics — topic index
- /graph — visual content graph
- /search — site search

## Machine-readable resources

- /sitemap.xml
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

Sitemap: https://meese.rs/sitemap.xml
```

If later the owner wants stricter bot rules, adjust after launch.

Do not spend significant implementation time on crawler-control logic during v0.

## 31. Cloudflare Pages `_headers`

Create `/public/_headers`.

Initial strict static-site headers:

```txt
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  X-Frame-Options: DENY
```

Add CSP after confirming all scripts, fonts, images, and graph dependencies.

Possible CSP starting point:

```txt
/*
  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data: https:; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'
```

### Human input required

The human owner or coding agent must test CSP in production preview before enabling a strict final policy.

If Pagefind, graph libraries, fonts, images, or analytics require additional directives, update the CSP accordingly.

## 32. Feeds

Generate both:

```txt
/feed.xml
/feed.json
```

Feed requirements:

* include all non-draft posts unless `hideFromFeed: true`
* include notes
* include guides
* include dev logs
* include essays/labs/references
* sort by `date`, newest first
* include title, description, canonical URL, date, and type

## 33. Sitemap

Generate:

```txt
/sitemap.xml
```

Include:

* homepage
* latest page
* guide index
* notes index
* topic index
* topic pages
* graph
* search
* all public posts

Exclude:

* drafts
* hidden posts
* dev-only pages

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

Add a validation script to catch:

```txt
missing required frontmatter
invalid type
invalid date
duplicate slug
related slug does not exist
supersededBy slug does not exist
supersedes slug does not exist
empty title
empty description
draft accidentally included in production output
```

Command:

```bash
pnpm validate:content
```

This should run in CI before build.

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

Suggested GitHub Actions flow:

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm validate:content
      - run: pnpm astro check
      - run: pnpm build
```

Adjust Node/pnpm versions if needed.

## 40. Deployment Requirements

Deploy from the public repository to Cloudflare Pages.

Production branch:

```txt
main
```

Preview deployments should be enabled for pull requests if available.

### Human input required

The human owner must connect the repository to Cloudflare Pages and configure the `meese.rs` domain.

## 41. Launch Checklist

Before launch:

```txt
[ ] Astro project created
[ ] MDX enabled
[ ] content collection schema implemented
[ ] sample guide created
[ ] sample note created
[ ] sample devlog created
[ ] homepage implemented
[ ] latest feed implemented
[ ] guides page implemented
[ ] notes page implemented
[ ] topics index implemented
[ ] topic detail pages implemented
[ ] post layout implemented
[ ] post cards implemented
[ ] note card compact style implemented
[ ] update/correction/deprecated banners implemented
[ ] related posts implemented
[ ] backlinks implemented
[ ] Pagefind search implemented
[ ] graph.json generated
[ ] /graph implemented
[ ] RSS feed generated
[ ] JSON feed generated
[ ] sitemap generated
[ ] robots.txt added
[ ] llms.txt added
[ ] AGENTS.md added
[ ] _headers added
[ ] CI passes
[ ] Cloudflare Pages deploy works
[ ] production domain points to Cloudflare Pages
[ ] mobile layout tested
[ ] accessibility basics checked
[ ] graph page has fallback text
[ ] no draft posts in production
```

## 42. Human Input Checklist

The coding agent must ask for or wait on human input for:

```txt
[ ] final cybersecurity UX design kit references or approval to create a custom visual system
[ ] final homepage hero copy
[ ] initial canonical topic list
[ ] first real posts to migrate/add
[ ] final favicon/logo direction
[ ] graph visual style approval
[ ] Cloudflare account/project setup
[ ] DNS/domain setup
[ ] CSP production testing
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
Graph page renders from graph.json.
Graph page is linked in top nav.
```

### Milestone 6: Feeds, Metadata, Security Files

```txt
Generate feed.xml.
Generate feed.json.
Generate sitemap.xml.
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
- The site is publicly deployed at meese.rs.
- The homepage is a latest-writing-first system index.
- Guides, notes, and dev logs can be authored in MDX.
- Short notes appear in the main feed.
- Posts are statically rendered.
- Search works without a backend.
- Topics work.
- Backlinks work.
- The graph is available at /graph.
- Root public files exist.
- No comments, CMS, database, SSH, or terminal-first features exist.
- The repository is public and safe to inspect.
```

## 45. Guidance for Coding Agent

Follow these rules:

```txt
1. Keep the core site static.
2. Do not introduce a server runtime without explicit approval.
3. Do not add comments or discussion features.
4. Do not build an admin panel.
5. Do not add terminal UX as a primary feature.
6. Do not expose per-post raw MDX links by default.
7. Do not invent the final custom visual system.
8. Use placeholder design tokens until real visual references are provided or creation of a new custom system is explicitly approved.
9. Keep the homepage focused on latest writing first.
10. Keep notes in the main feed.
11. Prioritize readability over visual novelty.
12. Keep the graph sleek, branded, and discoverable, but do not make it the homepage.
13. Implement build-time validation for content relationships.
14. Treat the repo as public at all times.
```

## 46. Open Questions

These should be resolved during implementation, not before scaffolding:

```txt
1. What exact cybersecurity UX design kit references should be used, or should a new custom visual system be created?
2. What should the final homepage hero copy say?
3. What are the initial canonical topics?
4. What existing posts should be migrated first?
5. What favicon/logo mark should represent meese.rs?
6. What graph visualization library should be used?
7. Should the graph support filtering by post type/topic in v0 or v1?
8. Should the site support light mode at launch or after launch?
```

Do not allow these open questions to block v0 scaffolding.
