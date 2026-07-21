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

// Workers rate limiting binding. Per-colo and eventually consistent by design,
// which suits us: it exists to blunt abuse, not to meter anything.
export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface NewsletterEnv {
  DB: D1Database;
  // Secrets / vars / bindings (see docs/newsletter-setup.md). All optional so the
  // Worker degrades safely in local dev: without a Resend key emails are logged
  // and skipped, and without the limiter subscribe is simply unthrottled.
  SUBSCRIBE_LIMIT?: RateLimiter;
  RESEND_API_KEY?: string;
  NEWSLETTER_FROM?: string;
  SITE_URL?: string;
  // Resend's API origin. Only overridden by the tests, which point it at a real
  // local stand-in so delivery and retry behavior can be exercised over HTTP.
  RESEND_BASE_URL?: string;
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
  // When this address was last emailed a confirmation link. Throttles resends so
  // a repeated submit can't be aimed at someone else's inbox.
  confirm_sent_at: string | null;
}

// One row per post the digest has picked up. `completed_at` is set once every
// confirmed subscriber has a delivery row (or we've given up on the stragglers).
export interface SentPost {
  guid: string;
  sent_at: string;
  completed_at: string | null;
  attempts: number;
}

// Result the subscribe form renders. Mirrors the STATUS map in NewsletterSignup.astro.
export type SubscribeState = "ok" | "exists" | "invalid" | "ratelimited" | "error";

// Confirming is not unconditional: an old link must not resurrect someone who
// has since unsubscribed.
export type ConfirmResult = "ok" | "invalid" | "unsubscribed";

// The subset of JSON Feed fields the digest needs.
export interface FeedItem {
  id: string;
  url: string;
  title: string;
  summary?: string;
  date_published?: string;
}
