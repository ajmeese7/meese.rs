-- D1 schema for the self-owned newsletter.
--   local:  npx wrangler d1 execute meese-rs-newsletter --local --file worker/schema.sql
--   remote: see docs/newsletter-setup.md. The --remote --file import path hits a
--           wrangler OAuth auth bug (10000); use the --command form documented there.
-- Already applied an earlier version of this file? See "Migrating an existing
-- database" in docs/newsletter-setup.md; CREATE TABLE IF NOT EXISTS won't add
-- columns to a table that already exists.

CREATE TABLE IF NOT EXISTS subscribers (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  email             TEXT NOT NULL UNIQUE,
  status            TEXT NOT NULL DEFAULT 'pending', -- pending | confirmed | unsubscribed
  confirm_token     TEXT NOT NULL,
  unsubscribe_token TEXT NOT NULL,
  created_at        TEXT NOT NULL,
  confirmed_at      TEXT,
  confirm_sent_at   TEXT -- last confirmation email, throttles resends
);

CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers (status);
CREATE INDEX IF NOT EXISTS idx_subscribers_confirm ON subscribers (confirm_token);
CREATE INDEX IF NOT EXISTS idx_subscribers_unsub ON subscribers (unsubscribe_token);

-- Posts the digest has picked up, keyed by feed item id (GUID). A row with a
-- NULL completed_at still owes somebody an email and is retried on the next tick.
CREATE TABLE IF NOT EXISTS sent_posts (
  guid         TEXT PRIMARY KEY,
  sent_at      TEXT NOT NULL,
  completed_at TEXT,
  attempts     INTEGER NOT NULL DEFAULT 0
);

-- One row per (post, subscriber) actually delivered. This is what makes a retry
-- safe: a resend only targets subscribers with no row here, so a partial batch
-- failure can be retried without double-emailing anyone.
CREATE TABLE IF NOT EXISTS deliveries (
  guid          TEXT NOT NULL,
  subscriber_id INTEGER NOT NULL,
  delivered_at  TEXT NOT NULL,
  PRIMARY KEY (guid, subscriber_id)
);
