// The scheduled digest: on a cron tick, find posts in the feed we haven't
// emailed yet and notify confirmed subscribers.
import * as db from "./db";
import { postEmail, sendEmail } from "./email";
import type { FeedItem, NewsletterEnv } from "./types";
import { selectNewItems, siteUrl } from "./validation";

export async function runNewPostDigest(env: NewsletterEnv): Promise<void> {
  const site = siteUrl(env);

  const res = await fetch(`${site}/feed.json`, { headers: { accept: "application/feed+json" } });
  if (!res.ok) {
    console.error(`newsletter: feed fetch failed ${res.status}`);
    return;
  }
  const feed = (await res.json()) as { items?: FeedItem[] };
  const items = feed.items ?? [];
  const now = new Date().toISOString();

  const alreadySent = await db.getSentGuids(env.DB);

  // First run (no history): record every current post as sent WITHOUT emailing,
  // so switching the newsletter on never blasts the back catalog.
  if (alreadySent.size === 0) {
    for (const item of items) await db.recordSent(env.DB, item.id, now);
    console.log(`newsletter: seeded ${items.length} existing post(s), no emails sent`);
    return;
  }

  // Oldest first, so a multi-post gap arrives in publication order.
  const fresh = selectNewItems(items, alreadySent).reverse();
  if (fresh.length === 0) return;

  const subscribers = await db.listConfirmed(env.DB);
  for (const item of fresh) {
    let delivered = 0;
    for (const sub of subscribers) {
      const message = postEmail(item, `${site}/newsletter/unsubscribe?token=${sub.unsubscribe_token}`);
      if (await sendEmail(env, { to: sub.email, ...message })) delivered++;
    }
    // Record regardless of per-recipient failures so a flaky send can't loop the
    // whole list forever; failures are logged in sendEmail for follow-up.
    await db.recordSent(env.DB, item.id, now);
    console.log(`newsletter: "${item.title}" -> ${delivered}/${subscribers.length} delivered`);
  }
}
