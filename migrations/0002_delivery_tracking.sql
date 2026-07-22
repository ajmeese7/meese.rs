-- Per-subscriber delivery tracking, so a partially failed send can be retried
-- without double-emailing anyone, plus a confirmation-resend throttle.

-- Last confirmation email sent, used to rate-limit resends per address.
ALTER TABLE subscribers ADD COLUMN confirm_sent_at TEXT;

-- A sent_posts row with a NULL completed_at still owes somebody an email and is
-- retried on the next tick; attempts bounds that retry loop.
ALTER TABLE sent_posts ADD COLUMN completed_at TEXT;
ALTER TABLE sent_posts ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0;

-- Everything recorded before this migration was sent under the old
-- presence-means-delivered rule, so mark it complete. Without this, every
-- existing row looks like it still owes an email and the next cron run mails the
-- whole archive to every subscriber.
UPDATE sent_posts SET completed_at = sent_at WHERE completed_at IS NULL;

-- One row per (post, subscriber) actually delivered. This is what makes a retry
-- safe: a resend only targets subscribers with no row here.
CREATE TABLE deliveries (
  guid          TEXT NOT NULL,
  subscriber_id INTEGER NOT NULL,
  delivered_at  TEXT NOT NULL,
  PRIMARY KEY (guid, subscriber_id)
);
