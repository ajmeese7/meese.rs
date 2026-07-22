// The scheduled digest: on a cron tick, find posts in the feed we haven't fully
// delivered yet and email them to confirmed subscribers.
import * as db from "./db";
import { BATCH_MAX, postEmail, sendBatch } from "./email";
import type { FeedItem, NewsletterEnv, Subscriber } from "./types";
import { chunk, selectQueue, siteUrl } from "./validation";

// A post with recipients still outstanding after this many ticks is abandoned,
// so one permanently broken item can't be retried hourly forever.
const MAX_ATTEMPTS = 3;

export async function runNewPostDigest(env: NewsletterEnv): Promise<void> {
  const site = siteUrl(env);
  const items = await fetchFeedItems(site);

  const now = new Date().toISOString();
  const known = await db.getSentPosts(env.DB);

  // First run (no history): record every current post as delivered WITHOUT
  // emailing, so switching the newsletter on never blasts the back catalog.
  if (known.size === 0) {
    await db.seedSentPosts(
      env.DB,
      items.map((item) => item.id),
      now,
    );
    console.log(`newsletter: seeded ${items.length} existing post(s), no emails sent`);
    return;
  }

  // Every path below logs exactly once before returning. A tick that finds
  // nothing to do is the common case, and without a line for it a cron that
  // stopped firing is indistinguishable from one that ran and owed nothing.
  // Counts only: subscriber addresses never go to the log store.
  const queue = selectQueue(items, known, MAX_ATTEMPTS);
  if (queue.length === 0) {
    console.log(`newsletter: ${items.length} post(s) in feed, nothing owed`);
    return;
  }

  const subscribers = await db.listConfirmed(env.DB);
  console.log(
    `newsletter: ${queue.length} post(s) owed to ${subscribers.length} confirmed subscriber(s)`,
  );
  for (const item of queue) {
    await deliverPost(env, site, item, subscribers, now);
  }
}

// Throws rather than returning empty on failure. An unreadable feed is not "no
// posts are owed", it is "we have no idea what is owed", and the two must not
// look alike: swallowing it here returns normally, which marks the cron run
// successful and hides the outage behind a green tick.
async function fetchFeedItems(site: string): Promise<FeedItem[]> {
  const res = await fetch(`${site}/feed.json`, { headers: { accept: "application/feed+json" } });
  if (!res.ok) throw new Error(`feed fetch failed ${res.status}`);
  const feed = (await res.json()) as { items?: FeedItem[] };
  return feed.items ?? [];
}

async function deliverPost(
  env: NewsletterEnv,
  site: string,
  item: FeedItem,
  subscribers: readonly Subscriber[],
  now: string,
): Promise<void> {
  const attempts = await db.beginAttempt(env.DB, item.id, now);
  // Anyone delivered on a previous attempt is skipped, so a retry never sends
  // the same post to the same person twice.
  const delivered = await db.getDeliveredIds(env.DB, item.id);
  const pending = subscribers.filter((sub) => !delivered.has(sub.id));

  let sent = 0;
  let failed = 0;
  for (const group of chunk(pending, BATCH_MAX)) {
    const messages = group.map((sub) => ({
      to: sub.email,
      ...postEmail(item, `${site}/newsletter/unsubscribe?token=${sub.unsubscribe_token}`),
    }));
    if (await sendBatch(env, messages)) {
      await db.recordDeliveries(
        env.DB,
        item.id,
        group.map((sub) => sub.id),
        now,
      );
      sent += group.length;
    } else {
      failed += group.length;
    }
  }

  if (failed === 0) {
    await db.completeSentPost(env.DB, item.id, now);
    console.log(`newsletter: "${item.title}" -> ${sent} delivered`);
    return;
  }
  if (attempts >= MAX_ATTEMPTS) {
    await db.completeSentPost(env.DB, item.id, now);
    console.error(
      `newsletter: "${item.title}" abandoned after ${attempts} attempts, ${failed} subscriber(s) never received it`,
    );
    return;
  }
  console.warn(
    `newsletter: "${item.title}" -> ${sent} delivered, ${failed} failed, retrying next tick (attempt ${attempts}/${MAX_ATTEMPTS})`,
  );
}
