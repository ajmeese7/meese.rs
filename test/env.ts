// Shared setup for the Worker tests: real D1 behind the schema, and an env that
// can only ever reach the local stub.
import { env } from "cloudflare:workers";

import schemaSql from "../worker/schema.sql?raw";
import type { NewsletterEnv } from "../worker/newsletter/types";
import { STUB_ORIGIN } from "./stub-port";

// `env` carries whatever is in .dev.vars, including a real Resend key. Tests get
// an explicit override instead, so no test can reach the live API by accident.
export function testEnv(overrides: Partial<NewsletterEnv> = {}): NewsletterEnv {
  return {
    DB: env.DB,
    SUBSCRIBE_LIMIT: env.SUBSCRIBE_LIMIT,
    RESEND_API_KEY: "test-key",
    RESEND_BASE_URL: STUB_ORIGIN,
    SITE_URL: STUB_ORIGIN,
    NEWSLETTER_FROM: "meese.rs test <posts@mail.meese.rs>",
    ...overrides,
  } as NewsletterEnv;
}

export async function applySchema(): Promise<void> {
  const statements = schemaSql
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) {
    await env.DB.prepare(statement).run();
  }
}

export async function resetTables(): Promise<void> {
  for (const table of ["deliveries", "sent_posts", "subscribers"]) {
    await env.DB.prepare(`DELETE FROM ${table}`).run();
  }
}

// Drives the stub server over HTTP, the only channel between workerd and Node.
export const stub = {
  async reset(): Promise<void> {
    await fetch(`${STUB_ORIGIN}/__control/reset`);
  },
  async setFeed(items: unknown[]): Promise<void> {
    await fetch(`${STUB_ORIGIN}/__control/feed`, { method: "POST", body: JSON.stringify(items) });
  },
  async failNextSends(count: number): Promise<void> {
    await fetch(`${STUB_ORIGIN}/__control/fail?count=${count}`, { method: "POST" });
  },
  async sent(): Promise<
    { to: string; subject: string; html: string; text: string; headers?: Record<string, string> }[]
  > {
    return (await fetch(`${STUB_ORIGIN}/__control/sent`)).json();
  },
};
