// D1 access for the newsletter. Every query is parameterized (no string
// interpolation) so subscriber input can't reach the SQL text.
import type { D1Database, Subscriber } from "./types";

export function findByEmail(db: D1Database, email: string): Promise<Subscriber | null> {
  return db.prepare("SELECT * FROM subscribers WHERE email = ?").bind(email).first<Subscriber>();
}

export async function insertPending(
  db: D1Database,
  row: { email: string; confirmToken: string; unsubscribeToken: string; now: string },
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO subscribers (email, status, confirm_token, unsubscribe_token, created_at) VALUES (?, 'pending', ?, ?, ?)",
    )
    .bind(row.email, row.confirmToken, row.unsubscribeToken, row.now)
    .run();
}

// Re-arm a returning (unsubscribed) or still-pending address with a fresh
// confirm token, back to pending until they click through again.
export async function resetToPending(
  db: D1Database,
  row: { email: string; confirmToken: string; now: string },
): Promise<void> {
  await db
    .prepare(
      "UPDATE subscribers SET status = 'pending', confirm_token = ?, confirmed_at = NULL, created_at = ? WHERE email = ?",
    )
    .bind(row.confirmToken, row.now, row.email)
    .run();
}

export async function confirmByToken(
  db: D1Database,
  token: string,
  now: string,
): Promise<Subscriber | null> {
  const sub = await db
    .prepare("SELECT * FROM subscribers WHERE confirm_token = ?")
    .bind(token)
    .first<Subscriber>();
  if (!sub) return null;
  await db
    .prepare("UPDATE subscribers SET status = 'confirmed', confirmed_at = ? WHERE id = ?")
    .bind(now, sub.id)
    .run();
  return sub;
}

export async function unsubscribeByToken(
  db: D1Database,
  token: string,
): Promise<Subscriber | null> {
  const sub = await db
    .prepare("SELECT * FROM subscribers WHERE unsubscribe_token = ?")
    .bind(token)
    .first<Subscriber>();
  if (!sub) return null;
  await db
    .prepare("UPDATE subscribers SET status = 'unsubscribed' WHERE id = ?")
    .bind(sub.id)
    .run();
  return sub;
}

export async function listConfirmed(db: D1Database): Promise<Subscriber[]> {
  const { results } = await db
    .prepare("SELECT * FROM subscribers WHERE status = 'confirmed'")
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
