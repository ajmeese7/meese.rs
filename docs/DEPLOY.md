# Deploying meese.rs

The site is a static build (Astro, `output: static`) served by **Cloudflare Pages**, built from the public GitHub repo on every push. There is no server runtime, no database, and no secrets, so deployment is just "build the repo and serve `dist/`".

This document is the operational how-to. For the original intent see `SPEC.md` §8 and §40.

## TL;DR

```txt
Host:              Cloudflare Pages (Git-connected, builds in Cloudflare's CI)
Framework preset:  Astro
Build command:     pnpm build
Output directory:  dist
Production branch:  master
Node version:      22   (pinned via .node-version)
pnpm version:      11.2.2 (pinned via "packageManager" in package.json)
Custom domain:     meese.rs
```

Once connected, every push to `master` publishes production and every other branch / PR gets a preview URL. No manual step.

## One-time setup (repo owner)

This is the part the SPEC marks as "human input required". It is done once in the Cloudflare dashboard.

1. Cloudflare dashboard, **Workers & Pages**, **Create**, **Pages**, **Connect to Git**.
2. Authorize GitHub and pick this repository.
3. Set the build configuration:

   | Setting | Value |
   |---|---|
   | Production branch | `master` |
   | Framework preset | `Astro` |
   | Build command | `pnpm build` |
   | Build output directory | `dist` |
   | Root directory | `/` (repo root) |

4. Leave environment variables empty. The toolchain is pinned in-repo (see below), so the build is reproducible without dashboard config. There are no app secrets to set.
5. Save and deploy. The first build runs the full pipeline and publishes to a `*.pages.dev` URL.

> The SPEC (§40) originally named the production branch `main`. This repo's default branch is `master`, so set the production branch to `master` (or rename the branch and update this doc). They must match or Cloudflare will treat production pushes as previews.

## Toolchain pinning (why the build is reproducible)

Cloudflare's build image ships its own default Node and pnpm, and a mismatch breaks this project quietly: the lockfile is `lockfileVersion 9.0`, and `pnpm-workspace.yaml` carries `allowBuilds` (lets esbuild/sharp run their native build scripts) and `overrides` (the patched `yaml`), both of which only exist on pnpm 10.4+. An older bundled pnpm would ignore them and either fail the install or ship an unpatched dependency.

Two committed files remove that risk, so no dashboard env vars are needed:

- `package.json` -> `"packageManager": "pnpm@11.2.2"` pins pnpm (Cloudflare honors it via Corepack).
- `.node-version` -> `22` pins Node (matches CI).

If you ever need to override from the dashboard instead, the equivalent build environment variables are `NODE_VERSION=22` and `PNPM_VERSION=11.2.2`.

## What the build actually runs

`pnpm build` is a four-step pipeline (see `package.json`):

```txt
pnpm validate:content   # frontmatter + cross-reference integrity (fails the build on bad data)
pnpm generate:graph     # writes public/graph.json from the posts
astro build             # static render to dist/
pagefind --site dist    # builds the search index into dist/pagefind/
```

If any step exits non-zero the deploy fails and the previous version stays live. Drafts (`draft: true`) are excluded from the production build, feeds, sitemap, search, and graph.

## Custom domain (meese.rs)

In the Pages project, **Custom domains**, **Set up a custom domain**, enter `meese.rs`.

- If the domain's DNS is already managed by Cloudflare, the record is created automatically (apex domains use CNAME flattening, so the apex works directly, no `www` needed).
- If DNS is elsewhere, add the CNAME Cloudflare shows you at your DNS provider.
- The TLS certificate is issued by Cloudflare automatically. `site` in `astro.config.mjs` is already `https://meese.rs`, which is what canonical URLs, the sitemap, and feeds use.

## Headers and caching

`public/_headers` is copied to the deploy root and read by Cloudflare Pages automatically. It currently sets baseline security headers (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`) and long-cache rules for the immutable `/_astro/*` assets and the `/pagefind/*` index.

A Content-Security-Policy is intentionally not enabled yet; the file documents the prerequisites and a starting policy to test in a Cloudflare **preview** deployment before promoting it to production. See `SPEC.md` §31.

## Preview deployments

Cloudflare Pages builds every non-production branch and every pull request and posts a unique preview URL (and a PR comment, if the GitHub app has permission). Use a preview to validate anything risky (a CSP change, a dependency bump) against the real CDN before it touches `master`. GitHub Actions CI (`.github/workflows/ci.yml`) is a separate gate that validates content, type-checks, builds, and asserts the Pagefind index on every push and PR; Cloudflare does not run it, so keep both green.

## Verify a build locally first

The Pagefind index only exists after a real build, so `pnpm dev` cannot serve search. To preview exactly what Cloudflare will serve:

```bash
pnpm build
pnpm preview
```

Then exercise search, the graph, and a few posts at the printed local URL.

## Rollback

In the Pages project, **Deployments**, open a previous successful deployment and **Rollback to this deployment**. Production swaps back instantly with no rebuild. Then fix forward on `master`.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Install fails with `ERR_PNPM_IGNORED_BUILDS` | An old pnpm ignored `allowBuilds`. Confirm pnpm 11 is in use (the `packageManager` pin). |
| `yaml` shows up in an audit on the deploy | Same pnpm-version cause; the `overrides` in `pnpm-workspace.yaml` need pnpm 10.4+. |
| Search returns nothing in production | The `pagefind` step did not run or `dist/pagefind/` was not published. Check the build log for the Pagefind step and that the output directory is `dist`. |
| Build fails in `validate:content` | A post has a bad/duplicate slug, missing title/description, invalid type/date, or a dangling `related`/`supersededBy` reference. The log names the offending file. |
| `/sitemap.xml` 404s | There is no `sitemap.xml`; the generated files are `sitemap-index.xml` + `sitemap-0.xml`, and `robots.txt` already points crawlers at the index. |
| Canonical URLs / feed point at the wrong host | Update `site` in `astro.config.mjs`. |
