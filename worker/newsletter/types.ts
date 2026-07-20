// Minimal D1 surface we actually use, declared locally so the Worker keeps
// typechecking against the DOM lib (like the caches.default cast in index.ts)
// without pulling in @cloudflare/workers-types.
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<unknown>;
  all<T = unknown>(): Promise<{ results: T[] }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
}

export interface NewsletterEnv {
  DB: D1Database;
  // Secrets / vars (see docs/newsletter-setup.md). Optional so the Worker degrades
  // safely in local dev: without a Resend key, emails are logged and skipped.
  RESEND_API_KEY?: string;
  NEWSLETTER_FROM?: string;
  SITE_URL?: string;
}

export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";

export interface Subscriber {
  id: number;
  email: string;
  status: SubscriberStatus;
  confirm_token: string;
  unsubscribe_token: string;
  created_at: string;
  confirmed_at: string | null;
}

// Result the subscribe form renders. Mirrors the STATUS map in NewsletterSignup.astro.
export type SubscribeState = "ok" | "exists" | "invalid" | "error";

// The subset of JSON Feed fields the digest needs.
export interface FeedItem {
  id: string;
  url: string;
  title: string;
  summary?: string;
  date_published?: string;
}
