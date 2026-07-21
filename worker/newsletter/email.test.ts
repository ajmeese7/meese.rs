import { beforeEach, expect, test } from "vitest";

import { stub, testEnv } from "../../test/env";
import { BATCH_MAX, confirmationEmail, postEmail, sendBatch, sendEmail } from "./email";
import type { FeedItem } from "./types";

beforeEach(async () => {
  await stub.reset();
});

const post: FeedItem = {
  id: "p1",
  url: "https://meese.rs/posts/p1/",
  title: "Hello",
  summary: "A post",
};

test("confirmationEmail embeds the confirm URL in html and text", () => {
  const url = "https://meese.rs/newsletter/confirm?token=abc123";
  const mail = confirmationEmail(url);
  expect(mail.subject).toMatch(/confirm/i);
  expect(mail.html).toContain(url);
  expect(mail.text).toContain(url);
});

test("postEmail carries the post, an unsubscribe link, and one-click headers", () => {
  const unsub = "https://meese.rs/newsletter/unsubscribe?token=xyz";
  const mail = postEmail(post, unsub);
  expect(mail.subject).toBe("Hello");
  expect(mail.html).toContain("https://meese.rs/posts/p1/");
  expect(mail.html).toContain(unsub);
  expect(mail.headers?.["List-Unsubscribe"]).toBe(`<${unsub}>`);
  expect(mail.headers?.["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
});

test("postEmail escapes HTML in the title", () => {
  const mail = postEmail({ ...post, title: 'A <script> & "quotes"' }, "https://meese.rs/u");
  expect(mail.html).not.toContain("<script>");
  expect(mail.html).toContain("&lt;script&gt;");
});

test("sendEmail posts a single message and reports success", async () => {
  const ok = await sendEmail(testEnv(), { to: "a@example.com", ...confirmationEmail("https://x/c") });
  expect(ok).toBe(true);
  const sent = await stub.sent();
  expect(sent).toHaveLength(1);
  expect(sent[0].to).toBe("a@example.com");
});

test("sendBatch delivers every recipient in one request", async () => {
  const messages = ["a@example.com", "b@example.com", "c@example.com"].map((to) => ({
    to,
    ...postEmail(post, `https://meese.rs/u?token=${to}`),
  }));
  expect(await sendBatch(testEnv(), messages)).toBe(true);

  const sent = await stub.sent();
  expect(sent.map((m) => m.to)).toEqual(["a@example.com", "b@example.com", "c@example.com"]);
  // Each recipient must carry their own unsubscribe link, not a shared one.
  expect(sent[0].headers?.["List-Unsubscribe"]).not.toBe(sent[1].headers?.["List-Unsubscribe"]);
});

test("sendBatch reports failure when the API rejects the request", async () => {
  await stub.failNextSends(1);
  const ok = await sendBatch(testEnv(), [{ to: "a@example.com", ...postEmail(post, "https://x/u") }]);
  expect(ok).toBe(false);
  expect(await stub.sent()).toHaveLength(0);
});

test("sendBatch refuses a group larger than Resend accepts", async () => {
  const messages = Array.from({ length: BATCH_MAX + 1 }, (_, i) => ({
    to: `a${i}@example.com`,
    ...postEmail(post, "https://x/u"),
  }));
  await expect(sendBatch(testEnv(), messages)).rejects.toThrow(RangeError);
});

test("sendBatch of nothing is a no-op success, not a wasted request", async () => {
  expect(await sendBatch(testEnv(), [])).toBe(true);
  expect(await stub.sent()).toHaveLength(0);
});

test("without an API key nothing is sent and the caller is told", async () => {
  const ok = await sendBatch(testEnv({ RESEND_API_KEY: undefined }), [
    { to: "a@example.com", ...postEmail(post, "https://x/u") },
  ]);
  expect(ok).toBe(false);
  expect(await stub.sent()).toHaveLength(0);
});
