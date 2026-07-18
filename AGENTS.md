# AGENTS.md, meese.rs

Guidance for coding agents working in this public repository.

## What this is

- Production domain: **meese.rs**
- A static-first technical writing site. **Astro + MDX + Pagefind**, deployed to
  **Cloudflare Workers** (static assets, plus a stateless `/relay` PostHog proxy
  in `worker/index.ts`, see `docs/ANALYTICS.md`). No database, no CMS.
- Full product spec: `docs/SPEC.md`. The approved visual system (tokens,
  components, UI kit, brand assets) lives in `design-system/`, read its
  `project/README.md` before touching anything visual.

## Project structure

```
src/
  content.config.ts     content collection schema (posts, incl. reviews)
  content/posts/*.mdx    the writing, one MDX file per entry
  components/            layout/, posts/, mdx/, graph/, search/
  layouts/               BaseLayout, PostLayout, ReviewLayout
  pages/                 routes (see docs/SPEC.md §11)
  styles/                tokens + base lifted from design-system, plus the
                         static-CSS port of the UI-kit components
  utils/                 posts, dates, topics, backlinks, graph, seo
  scripts/ (client)      search.ts (Pagefind)
scripts/                 validate-content.ts, generate-graph.ts (build-time)
worker/                  index.ts, the /relay PostHog ingest proxy
public/                  robots.txt, llms.txt, AGENTS.md, _headers, assets
```

## Commands

```
pnpm dev               # local dev (drafts visible)
pnpm build             # astro build + pagefind index → dist/
pnpm preview           # serve the built site
pnpm check             # astro check (types)
pnpm validate:content  # frontmatter / relation integrity
pnpm generate:graph    # write public/graph.json snapshot (also served dynamically)
```

## Conventions

- Sentence case for titles and headings. ALL CAPS + mono only for system labels
  (`[ GUIDE ]`, `// WARNING`). No emoji anywhere.
- Body is never monospace; mono is for metadata, code, and chrome.
- Reference semantic CSS variables (`--text-body`, `--surface-card`, `--accent`,
  `--border-default`), never raw palette values. The accent is themeable via
  `data-theme`; default is `neon-violet`.
- Reading pages must work with zero client JS; the only JS they ship is
  progressive enhancement (TOC highlight, analytics beacon + read tracking).
  Search and graph may use more.
- Drafts (`draft: true`) are excluded from the production build entirely.
  Unlisted posts (`unlisted: true`) build to a live, shareable URL but stay out
  of every feed, listing, topic, search index, graph, and the sitemap, and ship
  with `noindex`. See `docs/CONTENT.md` §5 for the full visibility ladder.

## Do not

- Add comments, discussion links, or per-post "View MDX" links by default.
- Add a CMS, admin panel, database, or server runtime without explicit approval.
- Add terminal-first UX as a primary feature.
- Reinvent the visual system, it is approved and lives in `design-system/`.
- Commit secrets. This repository is public.
