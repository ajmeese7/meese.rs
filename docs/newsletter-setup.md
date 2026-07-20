# Newsletter setup

Self-owned email newsletter, no third-party subscription platform. Readers subscribe through a first-party form; a Cloudflare Worker stores them in D1 with double opt-in and sends mail through Resend; an hourly cron notifies confirmed subscribers when a new post appears in `feed.json`. Cost is $0 within the free tiers (D1, Workers, Cron Triggers, Resend).

## Pieces

- `src/components/layout/NewsletterSignup.astro`, the form + progressive-enhancement script, rendered at the end of `PostLayout`.
- `worker/newsletter/`, the module: `handlers.ts` (subscribe/confirm/unsubscribe), `send.ts` (cron digest), `db.ts` (D1), `email.ts` (Resend + templates), `pages.ts` (landing pages), `validation.ts` (pure helpers).
- `worker/newsletter.test.ts`, unit tests for the pure helpers (`pnpm exec tsx --test worker/newsletter.test.ts`).
- `worker/schema.sql`, the D1 schema.
- `wrangler.jsonc`, D1 binding, hourly cron, `/newsletter/*` routes, and `SITE_URL` / `NEWSLETTER_FROM` vars.

## Routes

- `POST /newsletter/subscribe`, form target. Stores a `pending` row, sends a confirmation email. Returns JSON `{ state }` to fetch callers, an HTML page to no-JS posts.
- `GET /newsletter/confirm?token=`, from the confirmation email. Flips the row to `confirmed`.
- `GET|POST /newsletter/unsubscribe?token=`, from every post email (POST is the RFC 8058 one-click path). Flips the row to `unsubscribed`.

## One-time setup

### 1. Create the D1 database

```
npx wrangler d1 create meese-rs-newsletter
```

This is interactive. The `d1_databases` block is already in `wrangler.jsonc` with binding `DB` (which the code reads as `env.DB`), so answer its prompts to avoid a conflicting duplicate:

- "Would you like Wrangler to add it on your behalf?" answer **No**. We manage the block by hand; letting Wrangler add its own creates a second entry with the wrong binding name.
- "For local dev, do you want to connect to the remote resource instead of a local resource?" answer **No**. Local dev should use a local copy so tests never touch production data.

Then copy the returned `database_id` into the existing `DB` block in `wrangler.jsonc` (the committed value is already set to the created database; update it only if you recreate the DB). If you accidentally let Wrangler add its own block, delete it and keep only the `DB` one. Apply the schema to both remote and local. Wrangler defaults to local, so the remote apply needs an explicit `--remote`:

```
npx wrangler d1 execute meese-rs-newsletter --remote --file worker/schema.sql
npx wrangler d1 execute meese-rs-newsletter --local --file worker/schema.sql
```

### 2. Set up Resend

Create a Resend account, then under Domains add and verify `mail.meese.rs` (Resend gives you the SPF, DKIM, and DMARC records; add them in Cloudflare DNS). The `NEWSLETTER_FROM` var in `wrangler.jsonc` must use an address on that verified domain.

Then create the API key under API Keys. The Worker only calls `POST /emails`, so choose:

- Permission: **Sending access** (not Full access). This key can only send email, not read or manage your account, so a leak can't do much.
- Domain: restrict it to **mail.meese.rs**. The domain restriction option only appears when Sending access is selected.

Copy the key once (Resend shows it a single time) and set it as a Worker secret (from the repo root):

```
npx wrangler secret put RESEND_API_KEY
```

For local development, put it in `.dev.vars` (gitignored) instead:

```
RESEND_API_KEY=your-resend-key
SITE_URL=http://localhost:8788
```

Without a key the Worker logs and skips every send, so the whole flow can be exercised offline.

### 3. First cron run seeds the back catalog

The first time the cron runs against an empty `sent_posts` table, it records every current post as "sent" and emails nothing. This is deliberate: switching the newsletter on never blasts the archive. Only posts that appear after that first run trigger emails.

## Local testing

Everything runs against a local D1 copy, no Cloudflare account needed. Without `RESEND_API_KEY` in `.dev.vars`, sends are logged and skipped, so the whole flow works offline.

One-time, apply the schema to the local database:

```
npx wrangler d1 execute meese-rs-newsletter --local --file worker/schema.sql
```

Then start the dev server. This is a long-running server, not a command that returns: it holds the terminal showing `Ready on http://localhost:8788` until you press `x` to quit. Leave it running and do everything below in a second terminal.

```
npx wrangler dev --port 8788 --test-scheduled
```

In the second terminal (dev server still running), subscribe. It returns `{"state":"ok"}` and writes a `pending` row:

```
curl -X POST http://localhost:8788/newsletter/subscribe -H "X-Requested-With: fetch" --data "email=you@example.com"
```

Now the store query shows that row (it was empty before only because nobody had subscribed yet). Copy the `confirm_token` from the output:

```
npx wrangler d1 execute meese-rs-newsletter --local --command "SELECT email, status, confirm_token FROM subscribers"
```

Confirm the subscription with that token (status flips to `confirmed`):

```
curl "http://localhost:8788/newsletter/confirm?token=PASTE_CONFIRM_TOKEN"
```

Fire the cron by hand (`--test-scheduled` exposes `/__scheduled`). The first run seeds every existing post as sent and emails nothing; to simulate a new post, delete one row from `sent_posts` and run it again:

```
curl http://localhost:8788/__scheduled
npx wrangler d1 execute meese-rs-newsletter --local --command "DELETE FROM sent_posts WHERE guid IN (SELECT guid FROM sent_posts LIMIT 1)"
curl http://localhost:8788/__scheduled
```

Watch the `wrangler dev` terminal for the send log lines (`-> N/M delivered`, or `RESEND_API_KEY unset, skipped` without a key).

## Limits and hardening

- Resend's free tier caps sends (currently ~3,000/month, ~100/day). One post to a sub-100 list is well inside that; past ~100 subscribers, batch across the daily limit or move to a paid Resend tier. The cron records a post as sent even if some recipients fail, so a hard cap won't loop the list; failures are logged for follow-up.
- Bot protection is a honeypot field (a filled `website` field returns a no-op success). Add Cloudflare Turnstile to the form (see the `turnstile-spin` skill) before a real launch if signup spam appears.
- Deliverability: send only from the verified `mail.meese.rs` subdomain so the root domain's reputation is isolated. Warm up gradually.

## Deploy

The repo deploys through Cloudflare Workers Builds on merge to `master`, and the hourly cron starts ticking as soon as it deploys. So before merging, make sure all of these are in place, or the first cron run errors:

1. The remote D1 schema is applied (`wrangler d1 execute meese-rs-newsletter --remote --file worker/schema.sql`). Without the tables, the cron hits a missing-table error every hour.
2. The `RESEND_API_KEY` secret is set (`wrangler secret put RESEND_API_KEY`, or the Cloudflare dashboard under the Worker's Settings). Without it, subscribe and the cron run but every send is skipped.
3. The `mail.meese.rs` DNS records (SPF/DKIM/DMARC) are verified in Resend, so mail actually delivers.

The `database_id` is already committed in `wrangler.jsonc`, so the binding itself needs no dashboard step.
