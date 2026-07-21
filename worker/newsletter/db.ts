// D1 access for the newsletter. Every query is parameterized (no string
// interpolation) so subscriber input can't reach the SQL text.
import type { ConfirmResult, D1Database, Subscriber } from "./types";

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

export async function getSentGuids(db: D1Database): Promise<Set<string>> {
  const { results } = await db.prepare("SELECT guid FROM sent_posts").all<{ guid: string }>();
  return new Set(results.map((r) => r.guid));
}

export async function recordSent(db: D1Database, guid: string, now: string): Promise<void> {
  await db
    .prepare("INSERT OR IGNORE INTO sent_posts (guid, sent_at) VALUES (?, ?)")
    .bind(guid, now)
    .run();
}
