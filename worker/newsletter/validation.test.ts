import { expect, test } from "vitest";

import type { FeedItem, SentPost } from "./types";
import {
  backUrl,
  backUrlWithState,
  chunk,
  escapeHtml,
  isValidEmail,
  isWithinCooldown,
  newToken,
  selectQueue,
} from "./validation";

test("isValidEmail accepts ordinary addresses", () => {
  expect(isValidEmail("aaron@meese.dev")).toBe(true);
  expect(isValidEmail("a+tag@sub.example.co.uk")).toBe(true);
});

test("isValidEmail rejects malformed input", () => {
  for (const bad of ["", "aaron", "aaron@", "@meese.dev", "aaron@meese", "a b@c.d", "no-at.example.com"]) {
    expect(isValidEmail(bad), `expected ${JSON.stringify(bad)} to be invalid`).toBe(false);
  }
});

test("isValidEmail rejects absurdly long input", () => {
  expect(isValidEmail(`${"x".repeat(320)}@example.com`)).toBe(false);
});

test("newToken is 48 hex chars and non-repeating", () => {
  const a = newToken();
  expect(a).toMatch(/^[0-9a-f]{48}$/);
  expect(a).not.toBe(newToken());
});

test("escapeHtml neutralizes markup and attribute breakouts", () => {
  expect(escapeHtml(`<script>alert("x")</script>`)).toBe(
    "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;",
  );
  expect(escapeHtml("a & b")).toBe("a &amp; b");
});

const requestWithReferer = (referer: string | null): Request =>
  new Request("https://meese.rs/newsletter/subscribe", {
    method: "POST",
    headers: referer ? { referer } : {},
  });

test("backUrl returns the same-origin referer path", () => {
  expect(backUrl(requestWithReferer("https://meese.rs/posts/my-post/?ref=x"))).toBe(
    "/posts/my-post/?ref=x",
  );
});

test("backUrl refuses cross-origin referers", () => {
  expect(backUrl(requestWithReferer("https://evil.example/phish"))).toBe("/");
});

test("backUrl refuses a protocol-relative path that would link off-site", () => {
  // Same origin by URL parsing, but "//evil.example" in an href leaves the site.
  expect(backUrl(requestWithReferer("https://meese.rs//evil.example/phish"))).toBe("/");
});

test("backUrl falls back to root without a referer", () => {
  expect(backUrl(requestWithReferer(null))).toBe("/");
});

test("backUrlWithState appends the state, preserving existing query", () => {
  expect(backUrlWithState("/posts/a/?ref=x", "ok")).toBe("/posts/a/?ref=x&subscribe=ok");
});

test("backUrlWithState replaces a stale state rather than stacking one", () => {
  expect(backUrlWithState("/posts/a/?subscribe=error", "ok")).toBe("/posts/a/?subscribe=ok");
});

test("isWithinCooldown is true only inside the window", () => {
  const now = "2026-07-21T12:00:00.000Z";
  expect(isWithinCooldown("2026-07-21T11:58:00.000Z", now, 5 * 60_000)).toBe(true);
  expect(isWithinCooldown("2026-07-21T11:50:00.000Z", now, 5 * 60_000)).toBe(false);
});

test("isWithinCooldown treats never-sent and unparseable stamps as expired", () => {
  const now = "2026-07-21T12:00:00.000Z";
  expect(isWithinCooldown(null, now, 5 * 60_000)).toBe(false);
  expect(isWithinCooldown("not a date", now, 5 * 60_000)).toBe(false);
});

const item = (id: string): FeedItem => ({ id, url: `https://meese.rs/${id}/`, title: `Post ${id}` });
const sentPost = (guid: string, over: Partial<SentPost> = {}): SentPost => ({
  guid,
  sent_at: "2026-07-21T00:00:00.000Z",
  completed_at: "2026-07-21T00:00:00.000Z",
  attempts: 1,
  ...over,
});

test("selectQueue returns unseen posts oldest-first", () => {
  // Feed order is newest-first, so "a" is the oldest of the three.
  const queue = selectQueue([item("c"), item("b"), item("a")], new Map(), 3);
  expect(queue.map((i) => i.id)).toEqual(["a", "b", "c"]);
});

test("selectQueue skips posts already fully delivered", () => {
  const known = new Map([["a", sentPost("a")]]);
  expect(selectQueue([item("b"), item("a")], known, 3).map((i) => i.id)).toEqual(["b"]);
});

test("selectQueue re-queues a post that still owes someone an email", () => {
  const known = new Map([["a", sentPost("a", { completed_at: null, attempts: 1 })]]);
  expect(selectQueue([item("a")], known, 3).map((i) => i.id)).toEqual(["a"]);
});

test("selectQueue drops an incomplete post once it is out of attempts", () => {
  const known = new Map([["a", sentPost("a", { completed_at: null, attempts: 3 })]]);
  expect(selectQueue([item("a")], known, 3)).toEqual([]);
});

test("chunk splits into full groups plus a remainder", () => {
  expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  expect(chunk([], 2)).toEqual([]);
});

test("chunk rejects a nonsense size instead of looping forever", () => {
  expect(() => chunk([1], 0)).toThrow(RangeError);
});
