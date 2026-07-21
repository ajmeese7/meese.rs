import { env } from "cloudflare:workers";
import { beforeAll, beforeEach, expect, test } from "vitest";

import { applySchema, resetTables, stub, testEnv } from "../../test/env";
import * as db from "./db";
import { handleConfirm, handleSubscribe, handleUnsubscribe } from "./handlers";

beforeAll(applySchema);
beforeEach(async () => {
  await resetTables();
  await stub.reset();
});

// The rate limiter binding is real and its counters outlive a single test, so
// each test gets its own client IP and therefore its own bucket.
let ipCounter = 0;
const nextIp = () => `203.0.113.${++ipCounter % 255}`;

function subscribeRequest(opts: {
  email?: string;
  honeypot?: string;
  ip?: string;
  json?: boolean;
  referer?: string;
  method?: string;
}): Request {
  const body = new URLSearchParams();
  if (opts.email !== undefined) body.set("email", opts.email);
  if (opts.honeypot !== undefined) body.set("website", opts.honeypot);
  const headers: Record<string, string> = {
    "content-type": "application/x-www-form-urlencoded",
    "cf-connecting-ip": opts.ip ?? nextIp(),
  };
  if (opts.json) headers.accept = "application/json";
  if (opts.referer) headers.referer = opts.referer;
  return new Request("https://meese.rs/newsletter/subscribe", {
    method: opts.method ?? "POST",
    headers,
    body: opts.method === "GET" ? undefined : body,
  });
}

const stateOf = async (res: Response): Promise<string> =>
  ((await res.json()) as { state: string }).state;

test("a new address is stored pending and emailed a confirmation link", async () => {
  const res = await handleSubscribe(subscribeRequest({ email: "a@example.com", json: true }), testEnv());
  expect(res.status).toBe(200);
  expect(await stateOf(res)).toBe("ok");

  const sub = await db.findByEmail(env.DB, "a@example.com");
  expect(sub?.status).toBe("pending");

  const sent = await stub.sent();
  expect(sent).toHaveLength(1);
  expect(sent[0].to).toBe("a@example.com");
  // The emailed link must carry this subscriber's real token.
  expect(sent[0].html).toContain(sub!.confirm_token);
});

test("a malformed address is rejected before anything is stored or sent", async () => {
  const res = await handleSubscribe(subscribeRequest({ email: "nope", json: true }), testEnv());
  expect(res.status).toBe(400);
  expect(await stateOf(res)).toBe("invalid");
  expect(await stub.sent()).toHaveLength(0);
});

test("a filled honeypot looks successful but touches nothing", async () => {
  const res = await handleSubscribe(
    subscribeRequest({ email: "bot@example.com", honeypot: "spam", json: true }),
    testEnv(),
  );
  expect(await stateOf(res)).toBe("ok");
  expect(await db.findByEmail(env.DB, "bot@example.com")).toBeNull();
  expect(await stub.sent()).toHaveLength(0);
});

test("an already-confirmed address is told so without a second email", async () => {
  await handleSubscribe(subscribeRequest({ email: "a@example.com", json: true }), testEnv());
  const sub = await db.findByEmail(env.DB, "a@example.com");
  await db.confirmByToken(env.DB, sub!.confirm_token, new Date().toISOString());
  await stub.reset();

  const res = await handleSubscribe(subscribeRequest({ email: "a@example.com", json: true }), testEnv());
  expect(await stateOf(res)).toBe("exists");
  expect(await stub.sent()).toHaveLength(0);
});

test("a repeat submit inside the cooldown does not send a second email", async () => {
  const e = testEnv();
  await handleSubscribe(subscribeRequest({ email: "a@example.com", json: true }), e);
  expect(await stub.sent()).toHaveLength(1);

  // Same address from a different IP, so the per-IP limiter is not what stops it.
  const res = await handleSubscribe(subscribeRequest({ email: "a@example.com", json: true }), e);
  expect(await stateOf(res)).toBe("ok"); // indistinguishable from a real send
  expect(await stub.sent()).toHaveLength(1);
});

test("a resend after the cooldown reuses the original token", async () => {
  const e = testEnv();
  await handleSubscribe(subscribeRequest({ email: "a@example.com", json: true }), e);
  const first = await db.findByEmail(env.DB, "a@example.com");

  // Backdate the last send past the cooldown window.
  await db.markConfirmSent(env.DB, "a@example.com", "2020-01-01T00:00:00.000Z");
  await handleSubscribe(subscribeRequest({ email: "a@example.com", json: true }), e);

  const sent = await stub.sent();
  expect(sent).toHaveLength(2);
  // Same link, so an older email in their inbox still works.
  expect((await db.findByEmail(env.DB, "a@example.com"))?.confirm_token).toBe(first!.confirm_token);
});

test("a returning unsubscriber is re-armed with a fresh token", async () => {
  const e = testEnv();
  await handleSubscribe(subscribeRequest({ email: "a@example.com", json: true }), e);
  const first = await db.findByEmail(env.DB, "a@example.com");
  await db.confirmByToken(env.DB, first!.confirm_token, new Date().toISOString());
  await db.unsubscribeByToken(env.DB, first!.unsubscribe_token);

  const res = await handleSubscribe(subscribeRequest({ email: "a@example.com", json: true }), e);
  expect(await stateOf(res)).toBe("ok");
  const again = await db.findByEmail(env.DB, "a@example.com");
  expect(again?.status).toBe("pending");
  expect(again?.confirm_token).not.toBe(first!.confirm_token);
});

test("the sixth submit from one IP inside a minute is throttled", async () => {
  const ip = "198.51.100.7";
  const e = testEnv();
  for (let i = 0; i < 5; i++) {
    const ok = await handleSubscribe(subscribeRequest({ email: `u${i}@example.com`, ip, json: true }), e);
    expect(await stateOf(ok)).toBe("ok");
  }
  const res = await handleSubscribe(subscribeRequest({ email: "u5@example.com", ip, json: true }), e);
  expect(res.status).toBe(429);
  expect(await stateOf(res)).toBe("ratelimited");
  // Throttled before the store, so the flood never lands.
  expect(await db.findByEmail(env.DB, "u5@example.com")).toBeNull();
});

test("subscribe rejects anything but POST", async () => {
  const res = await handleSubscribe(subscribeRequest({ method: "GET" }), testEnv());
  expect(res.status).toBe(405);
  expect(res.headers.get("allow")).toBe("POST");
});

test("a no-JS submit bounces back to the post carrying the result", async () => {
  const res = await handleSubscribe(
    subscribeRequest({ email: "a@example.com", referer: "https://meese.rs/posts/hello/" }),
    testEnv(),
  );
  expect(res.status).toBe(303);
  expect(res.headers.get("location")).toBe("/posts/hello/?subscribe=ok");
});

test("a no-JS submit with no post to return to renders a page instead", async () => {
  const res = await handleSubscribe(subscribeRequest({ email: "a@example.com" }), testEnv());
  expect(res.status).toBe(200);
  expect(res.headers.get("content-type")).toContain("text/html");
  expect(await res.text()).toContain("Almost there");
});

test("a store failure fails closed without leaking the error", async () => {
  // A genuinely broken database rather than a stand-in for one: drop the table
  // and let real D1 raise, which is what a bad migration looks like in prod.
  await env.DB.prepare("DROP TABLE subscribers").run();
  try {
    const res = await handleSubscribe(
      subscribeRequest({ email: "a@example.com", json: true }),
      testEnv(),
    );
    expect(res.status).toBe(500);
    const body = await res.text();
    expect(JSON.parse(body).state).toBe("error");
    expect(body).not.toContain("subscribers");
    expect(await stub.sent()).toHaveLength(0);
  } finally {
    await applySchema();
  }
});

// --- confirm -------------------------------------------------------------

const confirmRequest = (token: string, method = "POST"): Request =>
  new Request(`https://meese.rs/newsletter/confirm?token=${token}`, { method });

test("a GET on the confirm link only renders a form, it does not confirm", async () => {
  const e = testEnv();
  await handleSubscribe(subscribeRequest({ email: "a@example.com", json: true }), e);
  const token = (await db.findByEmail(env.DB, "a@example.com"))!.confirm_token;

  const res = await handleConfirm(confirmRequest(token, "GET"), e);
  const body = await res.text();
  expect(res.status).toBe(200);
  expect(body).toContain("<form method=\"post\"");
  // This is the whole point: a link scanner following the URL changes nothing.
  expect((await db.findByEmail(env.DB, "a@example.com"))?.status).toBe("pending");
});

test("a POST on the confirm link confirms", async () => {
  const e = testEnv();
  await handleSubscribe(subscribeRequest({ email: "a@example.com", json: true }), e);
  const token = (await db.findByEmail(env.DB, "a@example.com"))!.confirm_token;

  const res = await handleConfirm(confirmRequest(token), e);
  expect(res.status).toBe(200);
  expect(await res.text()).toContain("You're subscribed");
  expect((await db.findByEmail(env.DB, "a@example.com"))?.status).toBe("confirmed");
});

test("confirm with a missing or unknown token says so", async () => {
  const e = testEnv();
  expect((await handleConfirm(new Request("https://meese.rs/newsletter/confirm"), e)).status).toBe(400);
  expect((await handleConfirm(confirmRequest("nope"), e)).status).toBe(400);
});

test("confirming after unsubscribing explains why it did nothing", async () => {
  const e = testEnv();
  await handleSubscribe(subscribeRequest({ email: "a@example.com", json: true }), e);
  const sub = (await db.findByEmail(env.DB, "a@example.com"))!;
  await handleConfirm(confirmRequest(sub.confirm_token), e);
  await db.unsubscribeByToken(env.DB, sub.unsubscribe_token);

  const res = await handleConfirm(confirmRequest(sub.confirm_token), e);
  expect(res.status).toBe(409);
  expect(await res.text()).toContain("You unsubscribed");
  expect((await db.findByEmail(env.DB, "a@example.com"))?.status).toBe("unsubscribed");
});

// --- unsubscribe ---------------------------------------------------------

const unsubRequest = (token: string, method = "POST"): Request =>
  new Request(`https://meese.rs/newsletter/unsubscribe?token=${token}`, { method });

test("a GET on the unsubscribe link only renders a form", async () => {
  const e = testEnv();
  await handleSubscribe(subscribeRequest({ email: "a@example.com", json: true }), e);
  const sub = (await db.findByEmail(env.DB, "a@example.com"))!;

  const res = await handleUnsubscribe(unsubRequest(sub.unsubscribe_token, "GET"), e);
  expect(res.status).toBe(200);
  expect(await res.text()).toContain("<form method=\"post\"");
  // A scanner prefetching the link must not drop them off the list.
  expect((await db.findByEmail(env.DB, "a@example.com"))?.status).toBe("pending");
});

test("a POST unsubscribes, which is what the one-click header triggers", async () => {
  const e = testEnv();
  await handleSubscribe(subscribeRequest({ email: "a@example.com", json: true }), e);
  const sub = (await db.findByEmail(env.DB, "a@example.com"))!;

  const res = await handleUnsubscribe(unsubRequest(sub.unsubscribe_token), e);
  expect(res.status).toBe(200);
  expect(await res.text()).toContain("Unsubscribed");
  expect((await db.findByEmail(env.DB, "a@example.com"))?.status).toBe("unsubscribed");
});

test("unsubscribe with an unknown token reports not found", async () => {
  expect((await handleUnsubscribe(unsubRequest("nope"), testEnv())).status).toBe(400);
});
