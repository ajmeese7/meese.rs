// Unit tests for the pure newsletter helpers. No network, no D1, no mocks.
// Run: pnpm exec tsx --test worker/newsletter.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";

import { confirmationEmail, postEmail } from "./newsletter/email";
import type { FeedItem } from "./newsletter/types";
import { backUrl, isValidEmail, newToken, selectNewItems } from "./newsletter/validation";

test("isValidEmail accepts ordinary addresses", () => {
  assert.ok(isValidEmail("aaron@meese.dev"));
  assert.ok(isValidEmail("a+tag@sub.example.co.uk"));
});

test("isValidEmail rejects malformed input", () => {
  for (const bad of ["", "aaron", "aaron@", "@meese.dev", "aaron@meese", "a b@c.d", "no-at.example.com"]) {
    assert.equal(isValidEmail(bad), false, `expected ${JSON.stringify(bad)} to be invalid`);
  }
});

test("isValidEmail rejects absurdly long input", () => {
  assert.equal(isValidEmail(`${"x".repeat(320)}@example.com`), false);
});

test("newToken is 48 hex chars and non-repeating", () => {
  const a = newToken();
  const b = newToken();
  assert.match(a, /^[0-9a-f]{48}$/);
  assert.notEqual(a, b);
});

const requestWithReferer = (referer: string | null): Request =>
  new Request("https://meese.rs/newsletter/subscribe", {
    method: "POST",
    headers: referer ? { referer } : {},
  });

test("backUrl returns the same-origin referer path", () => {
  assert.equal(backUrl(requestWithReferer("https://meese.rs/posts/my-post/?ref=x")), "/posts/my-post/?ref=x");
});

test("backUrl refuses cross-origin referers", () => {
  assert.equal(backUrl(requestWithReferer("https://evil.example/phish")), "/");
});

test("backUrl falls back to root without a referer", () => {
  assert.equal(backUrl(requestWithReferer(null)), "/");
});

const item = (id: string): FeedItem => ({ id, url: id, title: `Post ${id}` });

test("selectNewItems returns only unsent items", () => {
  const items = [item("c"), item("b"), item("a")];
  const fresh = selectNewItems(items, new Set(["a", "b"]));
  assert.deepEqual(fresh.map((i) => i.id), ["c"]);
});

test("selectNewItems returns nothing when all are sent", () => {
  const items = [item("a"), item("b")];
  assert.equal(selectNewItems(items, new Set(["a", "b"])).length, 0);
});

test("confirmationEmail embeds the confirm URL in html and text", () => {
  const url = "https://meese.rs/newsletter/confirm?token=abc123";
  const mail = confirmationEmail(url);
  assert.match(mail.subject, /confirm/i);
  assert.ok(mail.html.includes(url));
  assert.ok(mail.text.includes(url));
});

test("postEmail carries the post, an unsubscribe link, and one-click headers", () => {
  const unsub = "https://meese.rs/newsletter/unsubscribe?token=xyz";
  const mail = postEmail({ id: "p1", url: "https://meese.rs/posts/p1/", title: "Hello", summary: "A post" }, unsub);
  assert.equal(mail.subject, "Hello");
  assert.ok(mail.html.includes("https://meese.rs/posts/p1/"));
  assert.ok(mail.html.includes(unsub));
  assert.equal(mail.headers?.["List-Unsubscribe"], `<${unsub}>`);
  assert.equal(mail.headers?.["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click");
});

test("postEmail escapes HTML in the title", () => {
  const mail = postEmail({ id: "p2", url: "https://meese.rs/x/", title: "A <script> & \"quotes\"" }, "https://meese.rs/u");
  assert.ok(!mail.html.includes("<script>"));
  assert.ok(mail.html.includes("&lt;script&gt;"));
});
