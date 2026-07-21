import { env } from "cloudflare:workers";
import { beforeAll, beforeEach, expect, test } from "vitest";

import { applySchema, resetTables } from "../../test/env";
import * as db from "./db";
import type { Subscriber } from "./types";

beforeAll(applySchema);
beforeEach(resetTables);

const NOW = "2026-07-21T12:00:00.000Z";
const LATER = "2026-07-21T13:00:00.000Z";

async function seedPending(email: string, tokens = { confirm: "c-tok", unsub: "u-tok" }) {
  await db.insertPending(env.DB, {
    email,
    confirmToken: tokens.confirm,
    unsubscribeToken: tokens.unsub,
    now: NOW,
  });
  return db.findByEmail(env.DB, email) as Promise<Subscriber>;
}

test("insertPending stores a pending row stamped with the confirmation send", async () => {
  const sub = await seedPending("a@example.com");
  expect(sub.status).toBe("pending");
  expect(sub.confirmed_at).toBeNull();
  expect(sub.confirm_sent_at).toBe(NOW);
});

test("the email column is unique, so a double submit cannot duplicate a row", async () => {
  await seedPending("a@example.com");
  await expect(seedPending("a@example.com")).rejects.toThrow();
});

test("confirmByToken promotes a pending subscriber", async () => {
  await seedPending("a@example.com");
  expect(await db.confirmByToken(env.DB, "c-tok", LATER)).toBe("ok");
  const sub = await db.findByEmail(env.DB, "a@example.com");
  expect(sub?.status).toBe("confirmed");
  expect(sub?.confirmed_at).toBe(LATER);
});

test("confirmByToken rejects an unknown token", async () => {
  expect(await db.confirmByToken(env.DB, "nope", NOW)).toBe("invalid");
});

test("confirming twice is idempotent, not an error", async () => {
  await seedPending("a@example.com");
  await db.confirmByToken(env.DB, "c-tok", NOW);
  expect(await db.confirmByToken(env.DB, "c-tok", LATER)).toBe("ok");
  // The original confirmation time stands; a re-click is not a new consent.
  expect((await db.findByEmail(env.DB, "a@example.com"))?.confirmed_at).toBe(NOW);
});

test("an old confirm link cannot resurrect someone who unsubscribed", async () => {
  await seedPending("a@example.com");
  await db.confirmByToken(env.DB, "c-tok", NOW);
  expect(await db.unsubscribeByToken(env.DB, "u-tok")).toBe(true);

  // They still have the original confirmation email in their inbox.
  expect(await db.confirmByToken(env.DB, "c-tok", LATER)).toBe("unsubscribed");
  expect((await db.findByEmail(env.DB, "a@example.com"))?.status).toBe("unsubscribed");
});

test("resetToPending re-arms a returning subscriber with a fresh token", async () => {
  await seedPending("a@example.com");
  await db.confirmByToken(env.DB, "c-tok", NOW);
  await db.unsubscribeByToken(env.DB, "u-tok");

  await db.resetToPending(env.DB, { email: "a@example.com", confirmToken: "c-tok-2", now: LATER });
  const sub = await db.findByEmail(env.DB, "a@example.com");
  expect(sub?.status).toBe("pending");
  expect(sub?.confirmed_at).toBeNull();
  // The stale token is dead; only the new one works.
  expect(await db.confirmByToken(env.DB, "c-tok", LATER)).toBe("invalid");
  expect(await db.confirmByToken(env.DB, "c-tok-2", LATER)).toBe("ok");
});

test("unsubscribing is idempotent and an unknown token is reported", async () => {
  await seedPending("a@example.com");
  expect(await db.unsubscribeByToken(env.DB, "u-tok")).toBe(true);
  expect(await db.unsubscribeByToken(env.DB, "u-tok")).toBe(true);
  expect(await db.unsubscribeByToken(env.DB, "nope")).toBe(false);
});

test("listConfirmed returns only confirmed subscribers, in id order", async () => {
  await seedPending("a@example.com", { confirm: "c1", unsub: "u1" });
  await seedPending("b@example.com", { confirm: "c2", unsub: "u2" });
  await seedPending("c@example.com", { confirm: "c3", unsub: "u3" });
  await db.confirmByToken(env.DB, "c3", NOW);
  await db.confirmByToken(env.DB, "c1", NOW);

  expect((await db.listConfirmed(env.DB)).map((s) => s.email)).toEqual([
    "a@example.com",
    "c@example.com",
  ]);
});

test("markConfirmSent moves the cooldown stamp without touching status", async () => {
  await seedPending("a@example.com");
  await db.markConfirmSent(env.DB, "a@example.com", LATER);
  const sub = await db.findByEmail(env.DB, "a@example.com");
  expect(sub?.confirm_sent_at).toBe(LATER);
  expect(sub?.status).toBe("pending");
});

test("seedSentPosts records the back catalog as already complete", async () => {
  await db.seedSentPosts(env.DB, ["a", "b"], NOW);
  const known = await db.getSentPosts(env.DB);
  expect([...known.keys()].sort()).toEqual(["a", "b"]);
  expect(known.get("a")?.completed_at).toBe(NOW);
  expect(known.get("a")?.attempts).toBe(0);
});

test("seedSentPosts of nothing is a no-op", async () => {
  await db.seedSentPosts(env.DB, [], NOW);
  expect((await db.getSentPosts(env.DB)).size).toBe(0);
});

test("beginAttempt creates the row then counts up on each retry", async () => {
  expect(await db.beginAttempt(env.DB, "a", NOW)).toBe(1);
  expect(await db.beginAttempt(env.DB, "a", LATER)).toBe(2);
  expect(await db.beginAttempt(env.DB, "a", LATER)).toBe(3);
  // sent_at records first pickup and must not drift on retry.
  expect((await db.getSentPosts(env.DB)).get("a")?.sent_at).toBe(NOW);
});

test("completeSentPost closes the post out", async () => {
  await db.beginAttempt(env.DB, "a", NOW);
  expect((await db.getSentPosts(env.DB)).get("a")?.completed_at).toBeNull();
  await db.completeSentPost(env.DB, "a", LATER);
  expect((await db.getSentPosts(env.DB)).get("a")?.completed_at).toBe(LATER);
});

test("deliveries are tracked per recipient and re-recording is harmless", async () => {
  await db.recordDeliveries(env.DB, "a", [1, 2], NOW);
  await db.recordDeliveries(env.DB, "a", [2, 3], LATER);
  expect([...(await db.getDeliveredIds(env.DB, "a"))].sort()).toEqual([1, 2, 3]);
  // Another post's deliveries are separate.
  expect((await db.getDeliveredIds(env.DB, "b")).size).toBe(0);
});

test("recordDeliveries of nothing is a no-op", async () => {
  await db.recordDeliveries(env.DB, "a", [], NOW);
  expect((await db.getDeliveredIds(env.DB, "a")).size).toBe(0);
});
