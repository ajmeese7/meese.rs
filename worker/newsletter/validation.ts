import type { FeedItem, NewsletterEnv } from "./types";

// Pragmatic shape check, not RFC 5322. Double opt-in is the real gate: a
// typo'd-but-valid address simply never confirms and is never emailed.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return email.length >= 3 && email.length <= 320 && EMAIL_RE.test(email);
}

// 48 hex chars from a CSPRNG. Used for both confirm and unsubscribe links, so
// neither is guessable.
export function newToken(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Only ever bounce a no-JS submit back to our own origin (open-redirect guard).
export function backUrl(request: Request): string {
  const self = new URL(request.url);
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const r = new URL(referer);
      if (r.origin === self.origin) return r.pathname + r.search;
    } catch {
      // fall through to the site root
    }
  }
  return "/";
}

export function siteUrl(env: NewsletterEnv): string {
  return (env.SITE_URL ?? "https://meese.rs").replace(/\/+$/, "");
}

// Posts present in the feed but not yet recorded as sent.
export function selectNewItems(items: FeedItem[], sent: ReadonlySet<string>): FeedItem[] {
  return items.filter((item) => !sent.has(item.id));
}
