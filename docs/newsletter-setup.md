# Newsletter setup

Self-owned email newsletter, no third-party subscription platform. Readers subscribe through a first-party form; a Cloudflare Worker stores them in D1 with double opt-in and sends mail through Resend; an hourly cron notifies confirmed subscribers when a new post appears in `feed.json`. Cost is $0 within the free tiers (D1, Workers, Cron Triggers, Resend).

## Pieces

- `src/components/layout/NewsletterSignup.astro`, the form + progressive-enhancement script, rendered at the end of `PostLayout`.
- `worker/newsletter/`, the module: `handlers.ts` (subscribe/confirm/unsubscribe), `send.ts` (cron digest), `db.ts` (D1), `email.ts` (Resend + templates), `pages.ts` (landing pages), `validation.ts` (pure helpers).
- `worker/newsletter/*.test.ts`, the tests. They run inside workerd against real bindings (real D1, real rate limiter) via `@cloudflare/vitest-pool-workers`, so they exercise the runtime production uses. `pnpm test`.
- `test/resend-stub.ts`, a real local HTTP server standing in for Resend and for `feed.json` during tests, plus `test/env.ts` for schema setup and an env that can't reach the live API.
- `worker/schema.sql`, the D1 schema.
- `wrangler.jsonc`, D1 binding, subscribe rate limiter, hourly cron, `/newsletter/*` routes, and `SITE_URL` / `NEWSLETTER_FROM` vars.

## Routes

- `POST /newsletter/subscribe`, form target. Stores a `pending` row, sends a confirmation email. Returns JSON `{ state }` to fetch callers; a no-JS submit gets a 303 back to the originating post carrying `?subscribe=<state>`, which the form's own script renders inline.
- `GET|POST /newsletter/confirm?token=`, from the confirmation email. GET renders a one-button form, POST flips the row to `confirmed`.
- `GET|POST /newsletter/unsubscribe?token=`, from every post email. GET renders a one-button form, POST flips the row to `unsubscribed`. The RFC 8058 one-click header points here and already POSTs, so mail clients act directly.

The GET/POST split on the last two is deliberate. Mail security scanners (Outlook Safe Links, Proofpoint, Barracuda) prefetch every link in an inbound message, so anything that mutates state on GET fires without the reader clicking. That means silently unsubscribed readers, and confirmations recorded against consent nobody gave.

## One-time setup

### 1. Create the D1 database

```
npx wrangler d1 create meese-rs-newsletter
```

This is interactive. The `d1_databases` block is already in `wrangler.jsonc` with binding `DB` (which the code reads as `env.DB`), so answer its prompts to avoid a conflicting duplicate:

- "Would you like Wrangler to add it on your behalf?" answer **No**. We manage the block by hand; letting Wrangler add its own creates a second entry with the wrong binding name.
- "For local dev, do you want to connect to the remote resource instead of a local resource?" answer **No**. Local dev should use a local copy so tests never touch production data.

Then copy the returned `database_id` into the existing `DB` block in `wrangler.jsonc` (the committed value is already set to the created database; update it only if you recreate the DB). If you accidentally let Wrangler add its own block, delete it and keep only the `DB` one.

Apply the schema. Local uses `--file` directly:

```
npx wrangler d1 execute meese-rs-newsletter --local --file worker/schema.sql
```

Remote is trickier. `--remote --file` hits a known wrangler bug: D1's import endpoint rejects the OAuth login token with `Authentication error [code: 10000]`, even for a super-admin token. Use `--command` instead, which goes through the normal query endpoint your token already works with. The `grep` strips the SQL comment lines, which wrangler would otherwise parse as CLI flags:

```
npx wrangler d1 execute meese-rs-newsletter --remote --command "$(grep -v '^[[:space:]]*--' worker/schema.sql)"
```

If you would rather keep `--file`: create a Cloudflare API token (dashboard, "Edit Cloudflare Workers" template, which includes D1), then run the `--remote --file` command with `CLOUDFLARE_API_TOKEN` set in the environment. Token auth does not hit the import bug.

#### Migrating an existing database

`CREATE TABLE IF NOT EXISTS` does nothing to a table that already exists, so a database created before the delivery-tracking change needs the columns added by hand. Run this once, against local and remote:

```
npx wrangler d1 execute meese-rs-newsletter --local --command "ALTER TABLE subscribers ADD COLUMN confirm_sent_at TEXT; ALTER TABLE sent_posts ADD COLUMN completed_at TEXT; ALTER TABLE sent_posts ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0; UPDATE sent_posts SET completed_at = sent_at WHERE completed_at IS NULL; CREATE TABLE IF NOT EXISTS deliveries (guid TEXT NOT NULL, subscriber_id INTEGER NOT NULL, delivered_at TEXT NOT NULL, PRIMARY KEY (guid, subscriber_id));"
```

The `UPDATE` matters: it marks everything already sent as complete. Without it, every post in the table looks like it still owes an email and the next cron run mails the whole archive to everyone.

If the database has no rows worth keeping, dropping the tables and re-running `schema.sql` is simpler than migrating.

### 2. Set up Resend

Create a Resend account, then under Domains add and verify `mail.meese.rs` (Resend gives you the SPF, DKIM, and DMARC records; add them in Cloudflare DNS). The `NEWSLETTER_FROM` var in `wrangler.jsonc` must use an address on that verified domain.

Then create the API key under API Keys. The Worker only calls `POST /emails` and `POST /emails/batch`, so choose:

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

The first time the cron runs against an empty `sent_posts` table, it records every current post as delivered and emails nothing. This is deliberate: switching the newsletter on never blasts the archive. Only posts that appear after that first run trigger emails.

## How delivery works

The cron diffs `feed.json` against `sent_posts` and mails whatever is owed. Three pieces make that safe to retry:

- **Batch sends.** Recipients go out through Resend's `POST /emails/batch`, up to 100 per request. A per-recipient loop burns one Worker subrequest per subscriber and pushes at [Resend's 10-requests-per-second-per-team limit](https://resend.com/docs/api-reference/rate-limit), which returns 429s.
- **Per-recipient delivery rows.** Every successful send writes a `deliveries` row. A retry only targets subscribers without one, so a partial failure can be re-run without anyone getting the same post twice.
- **An attempt cap.** A post whose recipients still aren't all delivered is retried on the next hourly tick, up to three attempts, then abandoned with a logged error. Without the cap a permanently failing post would be retried forever; without the retry, a transient blip would silently cost those subscribers the post entirely.

A post is only marked `completed_at` once every confirmed subscriber has a delivery row (or it hit the cap). Subscribers who confirm later do not receive completed posts, which is the same "no back catalog" rule as the seed run.

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

Confirm the subscription with that token. It must be a POST; a GET only renders the confirmation button, because link scanners follow GETs:

```
curl -X POST "http://localhost:8788/newsletter/confirm?token=PASTE_CONFIRM_TOKEN"
```

Fire the cron by hand (`--test-scheduled` exposes `/__scheduled`). The first run seeds every existing post as delivered and emails nothing; to simulate a new post, delete one row from `sent_posts` and run it again:

```
curl http://localhost:8788/__scheduled
npx wrangler d1 execute meese-rs-newsletter --local --command "DELETE FROM sent_posts WHERE guid IN (SELECT guid FROM sent_posts LIMIT 1)"
curl http://localhost:8788/__scheduled
```

Watch the `wrangler dev` terminal for the send log lines (`-> N delivered`, or `RESEND_API_KEY unset, skipped` without a key).

Note that without a key every send "fails", so a post burns its three attempts across three `/__scheduled` calls and is then abandoned. That is the retry path working, not a bug.

The automated suite covers all of this without a dev server, against real D1 and a local Resend stand-in:

```
pnpm test
```

## Limits and hardening

- Resend's free tier caps sends (currently ~3,000/month, ~100/day). One post to a sub-100 list is well inside that; past ~100 subscribers, move to a paid Resend tier. Hitting the cap mid-post is a failed batch, so it retries on the next tick and is abandoned after three, with the shortfall logged.
- Abuse protection on subscribe is two layers, because it is an unauthenticated endpoint that makes us send mail. A per-IP rate limiter (`SUBSCRIBE_LIMIT` in `wrangler.jsonc`, 5 per minute) blunts a flood, and a five-minute per-address cooldown on confirmation resends stops someone aiming repeat submits at a third party's inbox from rotating IPs. A filled `website` honeypot field returns a no-op success. If real spam still gets through, add Cloudflare Turnstile to the form (see the `turnstile-spin` skill).
- The rate limiter is per-Cloudflare-location and eventually consistent by design, so treat its limit as approximate. It exists to blunt abuse, not to meter anything.
- Deliverability: send only from the verified `mail.meese.rs` subdomain so the root domain's reputation is isolated. Warm up gradually.
- Sender logo avatar (BIMI) is set up on the free path, so Yahoo/AOL and Fastmail show the logomark instead of a letter tile. Gmail and Apple Mail both require a paid VMC/CMC certificate ($650+/year) and keep showing the generic avatar; Proton Mail does not implement BIMI at all and shows the site favicon instead. See `bimi.md`.

## Troubleshooting

- **Gmail hides a test email's body behind a "..." toggle.** Gmail threads messages by subject and collapses content identical to something already in the thread, so sending yourself the same post email more than once shows a "Show trimmed content" (`...`) button instead of the full body. It is Gmail deduping within a conversation, not a template bug. Real subscribers get one unique-subject email per post (and `sent_posts` blocks re-sending the same post), so they never hit it. To confirm during testing, resend with any tweaked subject line and it renders in full.

## Deploy

The repo deploys through Cloudflare Workers Builds on merge to `master`, and the hourly cron starts ticking as soon as it deploys. So before merging, make sure all of these are in place, or the first cron run errors:

1. The remote D1 schema is applied (use the `--remote --command` form from step 1; `--remote --file` hits the import auth bug). Without the tables, the cron hits a missing-table error every hour. If the remote database was created before the delivery-tracking change, run the migration in "Migrating an existing database" instead, including its `UPDATE`, or the next cron run mails the whole archive to every subscriber.
2. The `RESEND_API_KEY` secret is set (`wrangler secret put RESEND_API_KEY`, or the Cloudflare dashboard under the Worker's Settings). Without it, subscribe and the cron run but every send is skipped.
3. The `mail.meese.rs` DNS records (SPF/DKIM/DMARC) are verified in Resend, so mail actually delivers.

The `database_id` is already committed in `wrangler.jsonc`, so the binding itself needs no dashboard step.
