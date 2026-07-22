# Newsletter setup

Self-owned email newsletter, no third-party subscription platform. Readers subscribe through a first-party form; a Cloudflare Worker stores them in D1 with double opt-in and sends mail through Resend; an hourly cron notifies confirmed subscribers when a new post appears in `feed.json`. Cost is $0 within the free tiers (D1, Workers, Cron Triggers, Resend).

## Pieces

- `src/components/layout/NewsletterSignup.astro`, the form + progressive-enhancement script, rendered at the end of `PostLayout`.
- `worker/newsletter/`, the module: `handlers.ts` (subscribe/confirm/unsubscribe), `send.ts` (cron digest), `db.ts` (D1), `email.ts` (Resend + templates), `pages.ts` (landing pages), `validation.ts` (pure helpers).
- `worker/newsletter/*.test.ts`, the tests. They run inside workerd against real bindings (real D1, real rate limiter) via `@cloudflare/vitest-pool-workers`, so they exercise the runtime production uses. `pnpm test`.
- `test/resend-stub.ts`, a real local HTTP server standing in for Resend and for `feed.json` during tests, plus `test/env.ts`, which rebuilds the database from `migrations/` and supplies an env that can't reach the live API.
- `migrations/`, the D1 schema as an ordered migration chain, applied with `wrangler d1 migrations apply`. The tests build their database from these same files, so a migration that doesn't produce a working schema fails the suite.
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

Apply the schema. It lives in `migrations/` as an ordered chain, and wrangler records what it has already run in each database's `d1_migrations` table, so both of these are safe to re-run and will do nothing when there is nothing owed:

```
npx wrangler d1 migrations apply meese-rs-newsletter --local
```

```
npx wrangler d1 migrations apply meese-rs-newsletter --remote
```

These are two separate databases. Applying to one never touches the other.

`npx wrangler d1 migrations list meese-rs-newsletter --remote` shows what is outstanding without applying anything, and is the fastest way to answer "is production current?".

#### Adding a migration

Never edit an applied migration; wrangler will not re-run it, so the change would land in the files and never in any database. Add a new one:

```
npx wrangler d1 migrations create meese-rs-newsletter describe-the-change
```

Write exact DDL, not `CREATE TABLE IF NOT EXISTS`. The tracking table already guarantees a migration runs once, so `IF NOT EXISTS` buys nothing and costs the loud failure you want when a database isn't in the state the migration assumes. That guard is precisely what hid the outage described below.

If a migration adds a column that existing rows need populated, backfill it in the same file. `0002_delivery_tracking.sql` is the worked example: without its `UPDATE`, every previously sent post looks like it still owes an email and the next cron run mails the whole archive to everyone.

Then run the local apply and `pnpm test`. The tests rebuild their database from `migrations/`, so a migration that produces a broken schema fails the suite rather than production.

#### Why this is a migration chain and not a schema file

This used to be a single `worker/schema.sql` applied with `d1 execute --file`, and it shipped a production outage on 2026-07-22. Every statement in it was `CREATE TABLE IF NOT EXISTS`, so re-applying it to a database that already existed changed nothing, added no columns, and still printed `5 commands executed successfully`. The remote database sat on the pre-delivery-tracking schema for about 21 hours while `POST /newsletter/subscribe` returned a generic `500 {"state":"error"}` to every visitor, failing on `no column named confirm_sent_at`. Nothing caught it: the apply reported success, the tests built their own database from the same file and passed, and the Worker had no persisted logs.

`d1_migrations` removes the guesswork. `migrations list` answers what production has actually run, instead of asking someone to remember.

Two things worth knowing about the old path, since they still apply to `d1 execute`:

- `--remote --file` hits a wrangler bug where D1's import endpoint rejects the OAuth login token with `Authentication error [code: 10000]`, even for a super-admin token. `d1 execute --remote --command` and `d1 migrations list --remote` both work on the same OAuth login, so the bug is specific to the import endpoint that `--file` uses rather than to the credential. Whether `migrations apply --remote` clears it on an OAuth login is untested here, since the databases were already current when migrations were introduced. If you need `d1 execute --remote --file`, create a Cloudflare API token (dashboard, "Edit Cloudflare Workers" template, which includes D1) and set `CLOUDFLARE_API_TOKEN`; token auth does not hit the bug.
- A database created before migrations existed needs baselining rather than applying: create the tracking table and record the already-applied files, so wrangler does not try to re-run them over live tables.

```
npx wrangler d1 execute meese-rs-newsletter --remote --command "CREATE TABLE IF NOT EXISTS d1_migrations(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL); INSERT OR IGNORE INTO d1_migrations (name) VALUES ('0001_initial_schema.sql');"
```

Both databases were baselined through `0002_delivery_tracking.sql` on 2026-07-22, so this is here for a future database, not for these.

#### Verify, don't trust the exit code

`migrations list` reports what wrangler believes. To check what the database actually contains:

```
npx wrangler d1 execute meese-rs-newsletter --remote --command "SELECT name FROM pragma_table_info('subscribers') UNION ALL SELECT name FROM pragma_table_info('sent_posts') UNION ALL SELECT name FROM sqlite_master WHERE type='table';"
```

`subscribers` must include `confirm_sent_at`, `sent_posts` must include `completed_at` and `attempts`, and `deliveries` must be listed as a table.

Then exercise the real endpoint, which is the one thing that proves the whole path:

```
curl -sS -X POST https://meese.rs/newsletter/subscribe -H "content-type: application/json" -H "x-requested-with: fetch" -d "{\"email\":\"you@example.com\"}"
```

`{"state":"ok"}` means it works. `{"state":"error"}` is the generic 500 the handler returns for any exception; `npx wrangler tail` while re-running it shows the real cause.

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

The cron diffs `feed.json` against `sent_posts` and mails whatever is owed. Because the queue is the feed, a post reaches subscribers only when `draft`, `unlisted`, and `hideFromFeed` are all false; `hideFromFeed: true` publishes a post without emailing anyone. See [CONTENT.md](./CONTENT.md#5-visibility) for the full visibility ladder.

Three pieces make the send safe to retry:

- **Batch sends.** Recipients go out through Resend's `POST /emails/batch`, up to 100 per request. A per-recipient loop burns one Worker subrequest per subscriber and pushes at [Resend's 10-requests-per-second-per-team limit](https://resend.com/docs/api-reference/rate-limit), which returns 429s.
- **Per-recipient delivery rows.** Every successful send writes a `deliveries` row. A retry only targets subscribers without one, so a partial failure can be re-run without anyone getting the same post twice.
- **An attempt cap.** A post whose recipients still aren't all delivered is retried on the next hourly tick, up to three attempts, then abandoned with a logged error. Without the cap a permanently failing post would be retried forever; without the retry, a transient blip would silently cost those subscribers the post entirely.

A post is only marked `completed_at` once every confirmed subscriber has a delivery row (or it hit the cap). Subscribers who confirm later do not receive completed posts, which is the same "no back catalog" rule as the seed run.

## Local testing

Everything runs against a local D1 copy, no Cloudflare account needed. Without `RESEND_API_KEY` in `.dev.vars`, sends are logged and skipped, so the whole flow works offline.

Bring the local database up to date (safe to re-run; it applies only what is outstanding):

```
npx wrangler d1 migrations apply meese-rs-newsletter --local
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

- **The cron reports success every hour and the tables stay empty.** Check the logs for `newsletter: feed fetch failed 522`. `meese.rs` is a Worker [Custom Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), which makes this Worker the origin for the zone, and [a `fetch()` to the Worker's own hostname returns 522](https://developers.cloudflare.com/support/troubleshooting/http-status-codes/cloudflare-5xx-errors/error-522/) unless the `global_fetch_strictly_public` compatibility flag is set in `wrangler.jsonc`. The digest reads `https://meese.rs/feed.json`, so without the flag it fails on every tick from the day it ships. Loading the feed in a browser proves nothing: the request has to originate outside the zone to reproduce, which is exactly what a Worker subrequest does not do by default. Do not remove that flag.
- **Gmail hides a test email's body behind a "..." toggle.** Gmail threads messages by subject and collapses content identical to something already in the thread, so sending yourself the same post email more than once shows a "Show trimmed content" (`...`) button instead of the full body. It is Gmail deduping within a conversation, not a template bug. Real subscribers get one unique-subject email per post (and `sent_posts` blocks re-sending the same post), so they never hit it. To confirm during testing, resend with any tweaked subject line and it renders in full.

## Deploy

The repo deploys through Cloudflare Workers Builds on merge to `master`, and the hourly cron starts ticking as soon as it deploys. So before merging, make sure all of these are in place, or the first cron run errors:

1. The remote database is current. The deploy command applies migrations itself (see "Migrating automatically on deploy" below), so this is normally automatic, but that path has not yet run against a pending migration. Until it has, confirm with `npx wrangler d1 migrations list meese-rs-newsletter --remote` after the deploy rather than assuming. A missing table or column does not degrade gracefully; the cron errors every hour and subscribe 500s on every submission.
2. The `RESEND_API_KEY` secret is set (`wrangler secret put RESEND_API_KEY`, or the Cloudflare dashboard under the Worker's Settings). Without it, subscribe and the cron run but every send is skipped.
3. The `mail.meese.rs` DNS records (SPF/DKIM/DMARC) are verified in Resend, so mail actually delivers.

The `database_id` is already committed in `wrangler.jsonc`, so the binding itself needs no dashboard step.

After the deploy lands, wait for the next tick and confirm it did something, rather than trusting that it ran. A cron invocation recorded as `ok` only means the handler returned; it does not mean the digest read anything. Every outcome now writes a line, so the Workers Logs history should carry one of `newsletter: seeded N existing post(s)`, `newsletter: N post(s) in feed, nothing owed`, or a delivery count. Silence for an hour that the cron reports as successful means the run failed before it got that far. Cross-check against the database:

```bash
npx wrangler d1 execute meese-rs-newsletter --remote --command "SELECT COUNT(*) FROM sent_posts"
```

### Migrating automatically on deploy

Workers Builds runs the migration as part of the deploy. Getting there needed care, because the obvious version fails silently.

The token Workers Builds generates for itself covers Account Settings (read), Workers Scripts (edit), Workers KV (edit), Workers R2 (edit), and Workers Routes (edit). [It has no D1 permission](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/), `wrangler d1 migrations apply` requires D1:Edit, and [the command fails silently on permission errors](https://github.com/cloudflare/workers-sdk/issues/5077). A bare `migrations apply` in the deploy command therefore reproduces exactly the failure this whole setup exists to prevent: a step that reports success, changes nothing, and lets the code deploy against a stale database.

The configuration is in the dashboard, under **Workers & Pages > `meese-rs` > Settings > Build**. Note that the separate `Settings > Variables & Secrets` tab is for runtime environment variables and is the wrong place for this; the build needs it at build time.

1. An API token scoped to **D1:Edit** on this account only. Nothing else, because the token is applied to the two D1 commands rather than to the whole deploy command.
2. Stored under **Build Variables and Secrets** as a secret named `D1_MIGRATION_TOKEN`. Deliberately not named `CLOUDFLARE_API_TOKEN`: that name would override the credentials Workers Builds issues itself, so `wrangler deploy` would then need Workers Scripts and Workers Routes permissions too.
3. A deploy command that re-checks the result instead of trusting the exit code, so a silently skipped migration blocks the deploy rather than shipping past it:

```
CLOUDFLARE_API_TOKEN=$D1_MIGRATION_TOKEN npx wrangler d1 migrations apply meese-rs-newsletter --remote && CLOUDFLARE_API_TOKEN=$D1_MIGRATION_TOKEN npx wrangler d1 migrations list meese-rs-newsletter --remote 2>&1 | grep -q "No migrations to apply" && npx wrangler deploy
```

The token's D1 write access is confirmed: exported into the environment with `read -rs` (never inline, where it would land in shell history and `ps`), it creates and drops a scratch table against the remote database. What that leaves untested is only the assembled path, since the deploy command has not yet met a pending migration. After the first deploy that carries one, run `npx wrangler d1 migrations list meese-rs-newsletter --remote` and confirm the migration landed rather than reading the green build as proof. A failed apply is caught by the `grep` and blocks the deploy, which is the designed behavior but presents as an unexplained build failure.

One rule this introduces: migrations run *before* the new code goes live, so the currently deployed Worker briefly runs against the new schema. Additive changes (new tables, new nullable columns) are safe. Dropping or renaming anything the live code still reads breaks production for the length of the deploy, so removals need two deploys: ship the code that stops using the column, then migrate it away.
