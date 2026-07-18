# Analytics

PostHog Cloud US, proxied through the site's own domain so adblock filter lists (which most of this site's audience runs) don't eat the events. Added July 2026; spec context in `SPEC.md` §47.

## How it works

```txt
browser ── /relay/static/array.js ──► Worker ── us-assets.i.posthog.com (SDK, edge-cached)
browser ── /relay/e, /relay/flags ──► Worker ── us.i.posthog.com        (events)
browser ── everything else ─────────► static assets, exactly as before
```

- `worker/index.ts` is the proxy. `wrangler.jsonc` points `main` at it, binds the static assets as `ASSETS`, and routes only `/relay/*` worker-first; requests that match an asset are served straight from the edge and never invoke the Worker, so the reading path is unchanged.
- The proxy only forwards the endpoints posthog-js actually uses (`/e`, `/i/v0/e`, `/flags`, `/decide`, `/array`, GET-only `/static`), caps bodies at 1MB, forwards an allowlist of headers rather than everything, and strips `Set-Cookie` both ways. It is not a general relay to PostHog's API.
- The path is `/relay`, deliberately not "posthog" or "ingest", to stay off path-heuristic filter lists.
- `src/components/layout/Analytics.astro` (in `BaseLayout` head) loads the SDK through the proxy. It is gated on `location.hostname === "meese.rs"`, so localhost, `wrangler dev`, and any preview deploy send nothing.
- `src/components/posts/ReadTracker.astro` (in `PostLayout` and `ReviewLayout`) fires one `article_read` event per pageload once the reader hits 60% scroll depth AND 30 seconds on the page. That is the real "reads" metric; pageviews are just arrivals.

## What is captured

| Event | Source | Notes |
|---|---|---|
| `$pageview` | posthog-js default | referrer, UTM, geo, device included |
| `$pageleave` | `capture_pageleave: true` | includes max scroll depth per page |
| `$web_vitals` | `capture_performance.web_vitals` | LCP/CLS/INP/FCP field data |
| `article_read` | `ReadTracker.astro` | 60% depth + 30s dwell, `read_seconds` property |

Deliberately off: autocapture, session recording, surveys, `identify` (everything stays anonymous, `person_profiles: "identified_only"` with no identify calls means no person profiles are ever created).

## Scroll depth (continuous, per pageview)

posthog-js records how far each visitor scrolled on every pageview, no extra code needed (verified working with this exact config, `autocapture: false` included). The data rides on the NEXT event after a page is read, usually `$pageleave`, as `$prev_pageview_*` properties keyed by `$prev_pageview_pathname`:

| Property | Meaning |
|---|---|
| `$prev_pageview_max_scroll_percentage` | furthest scroll position reached, 0-1 |
| `$prev_pageview_max_content_percentage` | furthest content viewed, 0-1 (viewport-adjusted, closest to "how much they read") |
| `$prev_pageview_last_scroll_percentage` / `$prev_pageview_last_content_percentage` | position when leaving |

Average read depth per post, in [SQL insights](https://us.posthog.com/project/431419/sql):

```sql
SELECT
    properties.$prev_pageview_pathname AS page,
    avg(toFloat(properties.$prev_pageview_max_content_percentage)) * 100 AS avg_read_pct,
    count() AS views
FROM events
WHERE event IN ('$pageview', '$pageleave')
    AND properties.$host = 'meese.rs'
    AND properties.$prev_pageview_max_content_percentage IS NOT NULL
    AND timestamp > now() - INTERVAL 30 DAY
GROUP BY page
ORDER BY views DESC
```

This complements rather than replaces `article_read`: the scroll properties give the continuous distribution (average/median depth per post), `article_read` gives a clean binary conversion rate (depth AND dwell), which is easier to trend and to compare across posts.

## Testing gotcha: headless browsers

posthog-js silently drops ALL events in headless browsers (bot filtering on the user agent, `HeadlessChrome` matches the blocklist). `posthog.init` succeeds, `capture()` just no-ops with no console output whatsoever. Any automated browser test of analytics must set `opt_out_useragent_filter: true` in the init config, and a `before_send` hook that returns `null` keeps test events out of the project entirely. Cost of learning this: one long debugging session.

## Shared PostHog project

The token in `Analytics.astro` is the site's public write-only ingest key. The PostHog project currently receives data from more than one source, so meese.rs data is distinguished by `$host = "meese.rs"` and every insight/dashboard for the site must filter on that host. If a dedicated project ever exists (paid feature), swap the token in `Analytics.astro`; historical data stays behind in the old project.

## Deploying

The Worker + assets deploy together; nothing about the deploy flow changes:

```powershell
pnpm build
pnpm exec wrangler deploy
```

First deploy after this change uploads the Worker script alongside the assets. Rolling back is redeploying from master.

## Local smoke test

```powershell
pnpm build
pnpm exec wrangler dev
# in a second terminal:
curl.exe -sI http://localhost:8787/                              # site serves (200, from assets)
curl.exe -sI http://localhost:8787/relay/static/array.js         # SDK proxies (200, javascript)
curl.exe -s -X POST http://localhost:8787/relay/e/ -d "data=x"   # event path forwards (PostHog 4xx, not a Worker error)
```

The beacon itself won't initialize on localhost because of the hostname gate; that is intentional.

## Verifying live data

After deploying, open [Web analytics](https://us.posthog.com/project/431419/web) and filter Host = meese.rs, or ask Claude (the PostHog MCP is wired up) things like "pageviews and article_read counts by path for the last 7 days on meese.rs".

## CSP note

No CSP ships yet (see `public/_headers`). When one does: `/relay` is same-origin, so `script-src 'self'` and `connect-src 'self'` already cover the SDK and event traffic; only the inline loader in `Analytics.astro` needs a hash, same as the theme script.
