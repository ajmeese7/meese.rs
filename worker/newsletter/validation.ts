import type { FeedItem, NewsletterEnv, SubscribeState } from "./types";

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

// Everything interpolated into our HTML goes through here: subscriber input in
// emails, and tokens echoed back into the confirm / unsubscribe forms.
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Only ever bounce a no-JS submit back to our own origin (open-redirect guard).
export function backUrl(request: Request): string {
  const self = new URL(request.url);
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const r = new URL(referer);
      const path = r.pathname + r.search;
      // Same origin isn't enough: "//evil.example" is a same-origin pathname that
      // renders as a protocol-relative, off-site link. Demand exactly one slash.
      if (r.origin === self.origin && path.startsWith("/") && !path.startsWith("//")) {
        return path;
      }
    } catch {
      // fall through to the site root
    }
  }
  return "/";
}

// Where a no-JS submit lands: the page it came from, carrying the result for the
// form's own script to render inline.
export function backUrlWithState(back: string, state: SubscribeState): string {
  const target = new URL(back, "https://newsletter.invalid");
  target.searchParams.set("subscribe", state);
  return target.pathname + target.search;
}

export function siteUrl(env: NewsletterEnv): string {
  return (env.SITE_URL ?? "https://meese.rs").replace(/\/+$/, "");
}

// True while a confirmation email is too recent to send another one.
export function isWithinCooldown(
  lastSentAt: string | null,
  now: string,
  windowMs: number,
): boolean {
  if (!lastSentAt) return false;
  const last = Date.parse(lastSentAt);
  if (Number.isNaN(last)) return false;
  return Date.parse(now) - last < windowMs;
}

// Posts present in the feed but not yet recorded as sent.
export function selectNewItems(items: FeedItem[], sent: ReadonlySet<string>): FeedItem[] {
  return items.filter((item) => !sent.has(item.id));
}
