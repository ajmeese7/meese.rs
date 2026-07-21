// D1 access for the newsletter. Every query is parameterized (no string
// interpolation) so subscriber input can't reach the SQL text.
import type { ConfirmResult, D1Database, SentPost, Subscriber } from "./types";

export function findByEmail(db: D1Database, email: string): Promise<Subscriber | null> {
  return db.prepare("SELECT * FROM subscribers WHERE email = ?").bind(email).first<Subscriber>();
}

export async function insertPending(
  db: D1Database,
  row: { email: string; confirmToken: string; unsubscribeToken: string; now: string },
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO subscribers (email, status, confirm_token, unsubscribe_token, created_at, confirm_sent_at) VALUES (?, 'pending', ?, ?, ?, ?)",
    )
    .bind(row.email, row.confirmToken, row.unsubscribeToken, row.now, row.now)
    .run();
}

// Re-arm a returning (unsubscribed) address with a fresh confirm token, back to
// pending until they click through again.
export async function resetToPending(
  db: D1Database,
  row: { email: string; confirmToken: string; now: string },
): Promise<void> {
  await db
    .prepare(
      "UPDATE subscribers SET status = 'pending', confirm_token = ?, confirmed_at = NULL, created_at = ?, confirm_sent_at = ? WHERE email = ?",
    )
    .bind(row.confirmToken, row.now, row.now, row.email)
    .run();
}

// Stamp a resent confirmation so the cooldown can throttle the next one.
export async function markConfirmSent(
  db: D1Database,
  email: string,
  now: string,
): Promise<void> {
  await db
    .prepare("UPDATE subscribers SET confirm_sent_at = ? WHERE email = ?")
    .bind(now, email)
    .run();
}

export async function confirmByToken(
  db: D1Database,
  token: string,
  now: string,
): Promise<ConfirmResult> {
  const sub = await db
    .prepare("SELECT * FROM subscribers WHERE confirm_token = ?")
    .bind(token)
    .first<Subscriber>();
  if (!sub) return "invalid";
  // Confirm tokens don't expire, so an old email would otherwise re-subscribe
  // someone who has since opted out. Withdrawing consent stays withdrawn until
  // they submit the form again.
  if (sub.status === "unsubscribed") return "unsubscribed";
  if (sub.status === "confirmed") return "ok"; // idempotent, they double-clicked
  await db
    .prepare("UPDATE subscribers SET status = 'confirmed', confirmed_at = ? WHERE id = ?")
    .bind(now, sub.id)
    .run();
  return "ok";
}

// True when the token matched. Unsubscribing twice is a no-op, not an error.
export async function unsubscribeByToken(db: D1Database, token: string): Promise<boolean> {
  const sub = await db
    .prepare("SELECT * FROM subscribers WHERE unsubscribe_token = ?")
    .bind(token)
    .first<Subscriber>();
  if (!sub) return false;
  if (sub.status === "unsubscribed") return true;
  await db
    .prepare("UPDATE subscribers SET status = 'unsubscribed' WHERE id = ?")
    .bind(sub.id)
    .run();
  return true;
}

export async function listConfirmed(db: D1Database): Promise<Subscriber[]> {
  const { results } = await db
    .prepare("SELECT * FROM subscribers WHERE status = 'confirmed' ORDER BY id")
    .all<Subscriber>();
  return results;
}

export async function getSentPosts(db: D1Database): Promise<Map<string, SentPost>> {
  const { results } = await db.prepare("SELECT * FROM sent_posts").all<SentPost>();
  return new Map(results.map((row) => [row.guid, row]));
}

// First cron run only: mark the back catalog delivered without emailing it.
export async function seedSentPosts(
  db: D1Database,
  guids: readonly string[],
  now: string,
): Promise<void> {
  if (guids.length === 0) return;
  const insert = db.prepare(
    "INSERT OR IGNORE INTO sent_posts (guid, sent_at, completed_at, attempts) VALUES (?, ?, ?, 0)",
  );
  await db.batch(guids.map((guid) => insert.bind(guid, now, now)));
}

// Claim a post for this tick and return its attempt count (1 on the first try).
export async function beginAttempt(
  db: D1Database,
  guid: string,
  now: string,
): Promise<number> {
  const row = await db
    .prepare(
      "INSERT INTO sent_posts (guid, sent_at, attempts) VALUES (?, ?, 1) ON CONFLICT(guid) DO UPDATE SET attempts = attempts + 1 RETURNING attempts",
    )
    .bind(guid, now)
    .first<{ attempts: number }>();
  return row?.attempts ?? 1;
}

export async function completeSentPost(
  db: D1Database,
  guid: string,
  now: string,
): Promise<void> {
  await db
    .prepare("UPDATE sent_posts SET completed_at = ? WHERE guid = ?")
    .bind(now, guid)
    .run();
}

export async function getDeliveredIds(db: D1Database, guid: string): Promise<Set<number>> {
  const { results } = await db
    .prepare("SELECT subscriber_id FROM deliveries WHERE guid = ?")
    .bind(guid)
    .all<{ subscriber_id: number }>();
  return new Set(results.map((r) => r.subscriber_id));
}

export async function recordDeliveries(
  db: D1Database,
  guid: string,
  subscriberIds: readonly number[],
  now: string,
): Promise<void> {
  if (subscriberIds.length === 0) return;
  const insert = db.prepare(
    "INSERT OR IGNORE INTO deliveries (guid, subscriber_id, delivered_at) VALUES (?, ?, ?)",
  );
  await db.batch(subscriberIds.map((id) => insert.bind(guid, id, now)));
}
