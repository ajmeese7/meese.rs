-- Initial newsletter schema: double opt-in subscribers and the posts already emailed.
--
-- Migrations are exact DDL, not `IF NOT EXISTS`. Wrangler records each applied
-- file in the `d1_migrations` table and never re-runs it, so guarding against
-- re-execution here would only hide a database that isn't in the state this file
-- claims. Failing loudly on a mismatch is the point.

CREATE TABLE subscribers (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  email             TEXT NOT NULL UNIQUE,
  status            TEXT NOT NULL DEFAULT 'pending', -- pending | confirmed | unsubscribed
  confirm_token     TEXT NOT NULL,
  unsubscribe_token TEXT NOT NULL,
  created_at        TEXT NOT NULL,
  confirmed_at      TEXT
);

CREATE INDEX idx_subscribers_status ON subscribers (status);
CREATE INDEX idx_subscribers_confirm ON subscribers (confirm_token);
CREATE INDEX idx_subscribers_unsub ON subscribers (unsubscribe_token);

-- Posts already emailed, keyed by feed item id (GUID). Presence means "notified".
CREATE TABLE sent_posts (
  guid    TEXT PRIMARY KEY,
  sent_at TEXT NOT NULL
);
