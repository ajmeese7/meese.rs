# meese.rs

The canonical home for one builder's long- and short-form technical writing:
tactical guides, dev logs, short notes, labs, references, and essays, all in
one latest-first feed. It reads like a
**system index of a builder's work**, not a conventional blog.

Static-first by design: no CMS, and every page is prerendered. Content is MDX in
the repo; the search index, backlinks, and concept graph are all computed at
build time.

The one exception is a small Cloudflare Worker sitting in front of the static
assets. It handles the two things that genuinely cannot be static: the
first-party analytics relay (`/relay/*`) and the newsletter (`/newsletter/*`,
backed by D1 and an hourly cron). Everything else is served as a file.

## Stack

- **Astro 6** + **MDX** (content collections)
- **Pagefind** for static, build-time search
- **Cloudflare Workers** for hosting (`meese.rs`), static assets fronted by
  `worker/index.ts`
- **Cloudflare D1** for newsletter subscribers, **Cron Triggers** for the
  new-post digest, **Resend** for delivery
- **TypeScript**, with worker tests running in workerd via Vitest

The design system in [`src/styles/`](./src/styles) is the approved "custom
cybersecurity UX kit": tokens, base layer, and component styles. It is dark,
technical, restrained, with a
single themeable neon accent (default neon-violet) over a graphite
blueprint-grid foundation. Client JavaScript is kept small and optional:
search, the concept graph, and the newsletter form all work as progressive
enhancement over a server-rendered baseline.

## Develop

```bash
pnpm install
pnpm dev               # local dev (drafts visible)
pnpm build             # validate + graph.json + astro build + pagefind index
pnpm preview           # serve the production build (search works here)
pnpm check             # astro check (types)
pnpm test              # worker tests, in workerd against real bindings
pnpm validate:content  # frontmatter + cross-reference integrity

npx wrangler dev       # the Worker (/relay, /newsletter); run pnpm build first
```

> Search only returns results against a production build (`pnpm build` then
> `pnpm preview`), since the Pagefind index is generated post-build.

## Write

Add an MDX file under `src/content/posts/`. Frontmatter schema lives in
`src/content.config.ts`, and the existing posts cover every supported type. Set
`draft: true` to keep a post out of the production build, feeds, sitemap,
search, and graph.

[`docs/CONTENT.md`](./docs/CONTENT.md) is the writer reference for what every
label means: the three label systems (type, status, topics/tags), which
frontmatter field drives each, and how they differ.

## Structure

```
src/
  content.config.ts       content schema
  content/posts/*.mdx     the writing
  components/             layout/ posts/ mdx/ graph/ search/
  layouts/                BaseLayout · PostLayout
  pages/                  routes, see docs/SPEC.md §11
  styles/                 design system: tokens + base + components
  utils/                  posts · dates · topics · backlinks · graph · seo
  scripts/search.ts       client search (Pagefind)
worker/
  index.ts                asset serving + /relay + /newsletter routing, cron entry
  newsletter/             handlers · send · db · email · pages · validation (+ tests)
migrations/               D1 migration chain (wrangler d1 migrations apply)
test/                     workerd test harness: env, Resend stand-in
scripts/                  build-time generation + validation (graph, icons, content, BIMI)
public/                   robots.txt · llms.txt · AGENTS.md · _headers · icons · assets
docs/
  SPEC.md                 the product specification (source of truth)
  CONTENT.md              writer reference: types, statuses, topics/tags
  ANALYTICS.md            first-party analytics via the /relay proxy
  newsletter-setup.md     D1 + Resend + cron setup, local testing, deploy checklist
  bimi.md                 sender logo: the SVG Tiny PS asset and the DNS record
wrangler.jsonc            worker config: assets, D1, rate limiter, cron, vars
```

## Deploy

Cloudflare Workers Builds, connected to this repo and deploying automatically on
merge to `master`. `pnpm build` produces `dist/`, which is uploaded as the
worker's static assets; `worker/index.ts` runs in front of them and the hourly
cron starts ticking as soon as it deploys.

Newsletter deploys have prerequisites (remote D1 schema, `RESEND_API_KEY`), so
check the deploy section of [`docs/newsletter-setup.md`](./docs/newsletter-setup.md)
before merging changes to it.

For agents working in this repo, read [`AGENTS.md`](./AGENTS.md).
