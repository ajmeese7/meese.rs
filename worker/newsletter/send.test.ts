import { env } from "cloudflare:workers";
import { beforeAll, beforeEach, expect, test } from "vitest";

import { applySchema, resetTables, stub, testEnv } from "../../test/env";
import * as db from "./db";
import { runNewPostDigest } from "./send";
import type { FeedItem } from "./types";

beforeAll(applySchema);
beforeEach(async () => {
  await resetTables();
  await stub.reset();
});

const NOW = "2026-07-21T12:00:00.000Z";

// Feed order is newest-first, matching src/pages/feed.json.ts.
const post = (id: string): FeedItem => ({
  id: `https://meese.rs/posts/${id}/`,
  url: `https://meese.rs/posts/${id}/`,
  title: `Post ${id}`,
  summary: `About ${id}`,
});

async function addConfirmed(...emails: string[]): Promise<void> {
  for (const email of emails) {
    const slug = email.split("@")[0];
    await db.insertPending(env.DB, {
      email,
      confirmToken: `c-${slug}`,
      unsubscribeToken: `u-${slug}`,
      now: NOW,
    });
    await db.confirmByToken(env.DB, `c-${slug}`, NOW);
  }
}

test("the first run seeds the back catalog without emailing anyone", async () => {
  await addConfirmed("a@example.com");
  await stub.setFeed([post("one"), post("two")]);

  await runNewPostDigest(testEnv());

  expect(await stub.sent()).toHaveLength(0);
  const known = await db.getSentPosts(env.DB);
  expect(known.size).toBe(2);
  expect([...known.values()].every((p) => p.completed_at !== null)).toBe(true);
});

test("a post published after the seed run is emailed to every confirmed subscriber", async () => {
  await addConfirmed("a@example.com", "b@example.com");
  await stub.setFeed([post("one")]);
  await runNewPostDigest(testEnv()); // seed

  await stub.setFeed([post("two"), post("one")]);
  await runNewPostDigest(testEnv());

  const sent = await stub.sent();
  expect(sent.map((m) => m.to).sort()).toEqual(["a@example.com", "b@example.com"]);
  expect(sent[0].subject).toBe("Post two");
  // Each recipient gets their own unsubscribe token.
  expect(sent.find((m) => m.to === "a@example.com")?.html).toContain("u-a");
  expect(sent.find((m) => m.to === "b@example.com")?.html).toContain("u-b");
});

test("pending and unsubscribed addresses are never emailed", async () => {
  await addConfirmed("yes@example.com");
  await db.insertPending(env.DB, {
    email: "pending@example.com",
    confirmToken: "c-p",
    unsubscribeToken: "u-p",
    now: NOW,
  });
  await addConfirmed("gone@example.com");
  await db.unsubscribeByToken(env.DB, "u-gone");

  await stub.setFeed([post("one")]);
  await runNewPostDigest(testEnv());
  await stub.setFeed([post("two"), post("one")]);
  await runNewPostDigest(testEnv());

  expect((await stub.sent()).map((m) => m.to)).toEqual(["yes@example.com"]);
});

test("a second run sends nothing new", async () => {
  await addConfirmed("a@example.com");
  await stub.setFeed([post("one")]);
  await runNewPostDigest(testEnv());
  await stub.setFeed([post("two"), post("one")]);
  await runNewPostDigest(testEnv());
  expect(await stub.sent()).toHaveLength(1);

  await runNewPostDigest(testEnv());
  expect(await stub.sent()).toHaveLength(1);
});

test("a backlog of posts arrives in publication order, oldest first", async () => {
  await addConfirmed("a@example.com");
  await stub.setFeed([post("one")]);
  await runNewPostDigest(testEnv());

  await stub.setFeed([post("four"), post("three"), post("two"), post("one")]);
  await runNewPostDigest(testEnv());

  expect((await stub.sent()).map((m) => m.subject)).toEqual(["Post two", "Post three", "Post four"]);
});

test("a failed send is retried on the next tick and never double-delivers", async () => {
  await addConfirmed("a@example.com", "b@example.com");
  await stub.setFeed([post("one")]);
  await runNewPostDigest(testEnv()); // seed
  await stub.setFeed([post("two"), post("one")]);

  await stub.failNextSends(1);
  await runNewPostDigest(testEnv());
  expect(await stub.sent()).toHaveLength(0);

  // Still owed, so it stays queued rather than being written off as sent.
  const guid = post("two").id;
  expect((await db.getSentPosts(env.DB)).get(guid)?.completed_at).toBeNull();

  await runNewPostDigest(testEnv());
  const sent = await stub.sent();
  expect(sent.map((m) => m.to).sort()).toEqual(["a@example.com", "b@example.com"]);
  expect((await db.getSentPosts(env.DB)).get(guid)?.completed_at).not.toBeNull();

  // And it stays done.
  await runNewPostDigest(testEnv());
  expect(await stub.sent()).toHaveLength(2);
});

test("a post is abandoned after the attempt cap instead of retrying forever", async () => {
  await addConfirmed("a@example.com");
  await stub.setFeed([post("one")]);
  await runNewPostDigest(testEnv()); // seed
  await stub.setFeed([post("two"), post("one")]);

  await stub.failNextSends(10);
  for (let i = 0; i < 3; i++) await runNewPostDigest(testEnv());

  const guid = post("two").id;
  const record = (await db.getSentPosts(env.DB)).get(guid);
  expect(record?.attempts).toBe(3);
  expect(record?.completed_at).not.toBeNull();

  // Even with sending healthy again, an abandoned post is not resurrected.
  await runNewPostDigest(testEnv());
  expect(await stub.sent()).toHaveLength(0);
});

test("a subscriber added mid-retry is picked up, already-delivered ones are not resent", async () => {
  await addConfirmed("a@example.com");
  await stub.setFeed([post("one")]);
  await runNewPostDigest(testEnv()); // seed
  await stub.setFeed([post("two"), post("one")]);

  await runNewPostDigest(testEnv());
  expect((await stub.sent()).map((m) => m.to)).toEqual(["a@example.com"]);

  // The post is complete, so a later subscriber does not get the back catalog.
  await addConfirmed("b@example.com");
  await runNewPostDigest(testEnv());
  expect((await stub.sent()).map((m) => m.to)).toEqual(["a@example.com"]);
});

test("an unreachable feed is a no-op, not a partial send", async () => {
  await addConfirmed("a@example.com");
  await stub.setFeed([post("one")]);
  await runNewPostDigest(testEnv()); // seed

  // Point at a path the stub has no route for.
  await runNewPostDigest(testEnv({ SITE_URL: `${testEnv().SITE_URL}/nope` }));
  expect(await stub.sent()).toHaveLength(0);
  expect((await db.getSentPosts(env.DB)).size).toBe(1);
});

test("a digest with no confirmed subscribers still closes the post out", async () => {
  await stub.setFeed([post("one")]);
  await runNewPostDigest(testEnv()); // seed
  await stub.setFeed([post("two"), post("one")]);

  await runNewPostDigest(testEnv());
  expect(await stub.sent()).toHaveLength(0);
  expect((await db.getSentPosts(env.DB)).get(post("two").id)?.completed_at).not.toBeNull();
});
