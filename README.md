# meese.rs

The canonical home for one builder's long- and short-form technical writing:
tactical guides, dev logs, short notes, labs, references, essays, and
software/library reviews, all in one latest-first feed. It reads like a
**system index of a builder's work**, not a conventional blog.

Static-first by design: no server runtime, no database, no CMS. Content is MDX
in the repo; everything else (search index, backlinks, concept graph) is
computed at build time.

## Stack

- **Astro 6** + **MDX** (content collections)
- **Pagefind** for static, build-time search
- **Cloudflare Pages** for hosting (`meese.rs`)
- **TypeScript**

The visual system, tokens, components, the website UI kit, and brand assets , 
is the approved "custom cybersecurity UX kit" in [`design-system/`](./design-system).
It is dark, technical, restrained, with a single themeable neon accent (default
neon-violet) over a graphite blueprint-grid foundation. Reading pages ship zero
client JavaScript; search and the concept graph are progressively enhanced.

## Develop

```bash
pnpm install
pnpm dev               # local dev (drafts visible)
pnpm build             # validate + graph.json + astro build + pagefind index
pnpm preview           # serve the production build (search works here)
pnpm check             # astro check (types)
pnpm validate:content  # frontmatter + cross-reference integrity
```

> Search only returns results against a production build (`pnpm build` then
> `pnpm preview`), since the Pagefind index is generated post-build.

## Write

Add an MDX file under `src/content/posts/`. Frontmatter schema lives in
`src/content.config.ts`; see the existing posts for examples (a guide, note,
devlog, essay, lab, reference, and three reviews). Set `draft: true` to keep a
post out of the production build, feeds, sitemap, search, and graph.

[`docs/CONTENT.md`](./docs/CONTENT.md) is the writer reference for what every
label means: the four label systems (type, status, verdict, topics/tags), which
frontmatter field drives each, and how they differ.

## Structure

```
src/
  content.config.ts      content schema (posts, incl. structured reviews)
  content/posts/*.mdx     the writing
  components/             layout/ posts/ mdx/ graph/ search/
  layouts/                BaseLayout · PostLayout · ReviewLayout
  pages/                  routes, see docs/SPEC.md §11
  styles/                 design-system tokens + base + component port
  utils/                  posts · dates · topics · backlinks · graph · seo
  scripts/search.ts       client search (Pagefind)
scripts/                  validate-content.ts · generate-graph.ts (build-time)
public/                   robots.txt · llms.txt · AGENTS.md · _headers · assets
design-system/            the approved Claude Design handoff bundle
docs/SPEC.md              the product specification (source of truth)
docs/CONTENT.md           writer reference: types, statuses, verdicts, topics/tags
docs/DEPLOY.md            Cloudflare Pages deploy guide (setup, domain, rollback)
```

## Deploy

Cloudflare Pages, framework preset **Astro**, build command `pnpm build`, output
`dist`, production branch `master`. The owner connects the repo and configures
the `meese.rs` domain. Full step-by-step (dashboard setup, custom domain,
toolchain pinning, rollback, troubleshooting) is in
[`docs/DEPLOY.md`](./docs/DEPLOY.md).

For agents working in this repo, read [`AGENTS.md`](./AGENTS.md).
