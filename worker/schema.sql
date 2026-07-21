-- D1 schema for the self-owned newsletter.
--   local:  npx wrangler d1 execute meese-rs-newsletter --local --file worker/schema.sql
--   remote: see docs/newsletter-setup.md. The --remote --file import path hits a
--           wrangler OAuth auth bug (10000); use the --command form documented there.

CREATE TABLE IF NOT EXISTS subscribers (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  email             TEXT NOT NULL UNIQUE,
  status            TEXT NOT NULL DEFAULT 'pending', -- pending | confirmed | unsubscribed
  confirm_token     TEXT NOT NULL,
  unsubscribe_token TEXT NOT NULL,
  created_at        TEXT NOT NULL,
  confirmed_at      TEXT
);

CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers (status);
CREATE INDEX IF NOT EXISTS idx_subscribers_confirm ON subscribers (confirm_token);
CREATE INDEX IF NOT EXISTS idx_subscribers_unsub ON subscribers (unsubscribe_token);

-- Posts already emailed, keyed by feed item id (GUID). Presence means "notified".
CREATE TABLE IF NOT EXISTS sent_posts (
  guid    TEXT PRIMARY KEY,
  sent_at TEXT NOT NULL
);
