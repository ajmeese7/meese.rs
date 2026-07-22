// Shared setup for the Worker tests: real D1 behind the schema, and an env that
// can only ever reach the local stub.
import { env } from "cloudflare:workers";

import type { NewsletterEnv } from "../worker/newsletter/types";
import { STUB_ORIGIN } from "./stub-port";

// The tests run the same migration files `wrangler d1 migrations apply` runs
// against the deployed database, rather than a separate copy of the schema.
// Globbed rather than imported one by one so a new migration is picked up by
// existing, not by remembering to add a line here.
const migrations = import.meta.glob<string>("../migrations/*.sql", {
  query: "?raw",
  import: "default",
  eager: true,
});

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

const TABLES = ["deliveries", "sent_posts", "subscribers"];

function statementsIn(sql: string): string[] {
  return sql
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Rebuilds the database from the migration chain. Drops first so this is safe to
// call more than once, including from the test that drops a table to check the
// handler's error path. Migrations are exact DDL, so re-running them over a live
// table would otherwise fail on "table already exists".
export async function applyMigrations(): Promise<void> {
  for (const table of TABLES) {
    await env.DB.prepare(`DROP TABLE IF EXISTS ${table}`).run();
  }
  for (const path of Object.keys(migrations).sort()) {
    for (const statement of statementsIn(migrations[path])) {
      await env.DB.prepare(statement).run();
    }
  }
}

export async function resetTables(): Promise<void> {
  for (const table of TABLES) {
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
