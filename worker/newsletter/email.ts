// Email delivery via Resend, plus the two templates. Resend is the only
// provider-specific piece; swapping senders is a change to the two send
// functions alone.
import type { FeedItem, NewsletterEnv } from "./types";
import { escapeHtml } from "./validation";

const DEFAULT_RESEND_BASE = "https://api.resend.com";
// Resend's documented ceiling for POST /emails/batch.
export const BATCH_MAX = 100;

function resendUrl(env: NewsletterEnv, path: string): string {
  return `${(env.RESEND_BASE_URL ?? DEFAULT_RESEND_BASE).replace(/\/+$/, "")}${path}`;
}

export interface OutboundEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}

function fromAddress(env: NewsletterEnv): string {
  // Falls back to the same address wrangler.jsonc sets, so a missing var can't
  // silently change the sender.
  return env.NEWSLETTER_FROM ?? "meese.rs <posts@mail.meese.rs>";
}

function payload(env: NewsletterEnv, msg: OutboundEmail): Record<string, unknown> {
  return {
    from: fromAddress(env),
    to: msg.to,
    subject: msg.subject,
    html: msg.html,
    text: msg.text,
    headers: msg.headers,
  };
}

async function postToResend(
  env: NewsletterEnv,
  url: string,
  body: unknown,
  label: string,
): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`newsletter: Resend send failed ${res.status} for ${label}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`newsletter: Resend request threw for ${label}`, err);
    return false;
  }
}

// Returns true on a delivered send. Without a key (local dev) it logs and
// returns false so the whole flow can be exercised offline.
export async function sendEmail(env: NewsletterEnv, msg: OutboundEmail): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.warn(`newsletter: RESEND_API_KEY unset, skipped email to ${msg.to} (${msg.subject})`);
    return false;
  }
  return postToResend(env, resendUrl(env, "/emails"), payload(env, msg), msg.to);
}

// One request for up to BATCH_MAX recipients. The digest sends this way so a
// list of any realistic size stays inside both Resend's per-second rate limit
// and the Worker's per-invocation subrequest budget. All-or-nothing per call:
// the caller retries the whole group, which is safe because delivery is
// recorded per recipient.
export async function sendBatch(env: NewsletterEnv, messages: OutboundEmail[]): Promise<boolean> {
  if (messages.length === 0) return true;
  if (messages.length > BATCH_MAX) {
    throw new RangeError(`batch of ${messages.length} exceeds Resend's limit of ${BATCH_MAX}`);
  }
  if (!env.RESEND_API_KEY) {
    console.warn(`newsletter: RESEND_API_KEY unset, skipped batch of ${messages.length}`);
    return false;
  }
  return postToResend(
    env,
    resendUrl(env, "/emails/batch"),
    messages.map((msg) => payload(env, msg)),
    `batch of ${messages.length}`,
  );
}

// Site design tokens, inlined (email can't use CSS vars). Graphite-dark surfaces
// lit by the neon-violet accent, matching src/styles/tokens.
const C = {
  void: "#06070A",
  card: "#101215",
  line: "#22252A",
  ink1: "#EDEFF1",
  ink2: "#AAB0B7",
  ink3: "#767D85",
  ink4: "#535961",
  accent: "#9A7CFF",
  onAccent: "#0A0814",
};
// Brand fonts as first choice with system fallbacks. Deliberately NO webfont
// <link>: an external font request would ping the sender on open, i.e. the
// "tracking pixel" the signup promises there won't be. Renders branded only if
// the reader already has the font locally; clean system fallback otherwise.
const FONT_DISPLAY = "'Space Grotesk',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const FONT_BODY = "'IBM Plex Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const FONT_MONO = "'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 4px">
<tr><td align="center" bgcolor="${C.accent}" style="border-radius:6px;background:${C.accent}">
<a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 24px;font-family:${FONT_MONO};font-size:13px;font-weight:600;letter-spacing:0.03em;color:${C.onAccent};text-decoration:none;border-radius:6px">${label}</a>
</td></tr></table>`;
}

// `label` is the mono `// ...` system tag that anchors every meese.rs surface.
function shell(opts: { subject: string; preheader: string; label: string; body: string }): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${escapeHtml(opts.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${C.void}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.void}">${escapeHtml(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.void}" style="background:${C.void}">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:100%;background:${C.card};border:1px solid ${C.line};border-radius:8px">
<tr><td style="padding:30px 32px 28px">
<div style="font-family:${FONT_MONO};font-size:11px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${C.accent};margin:0 0 16px">${opts.label}</div>
${opts.body}
</td></tr></table>
<div style="width:560px;max-width:100%;font-family:${FONT_MONO};font-size:11px;letter-spacing:0.06em;color:${C.ink4};padding:16px 4px 0;text-align:left">meese.rs · field notes from a builder</div>
</td></tr></table>
</body>
</html>`;
}

export function confirmationEmail(confirmUrl: string): Omit<OutboundEmail, "to"> {
  const safe = escapeHtml(confirmUrl);
  return {
    subject: "Confirm your meese.rs subscription",
    text: `Almost there. Confirm your subscription to meese.rs by opening this link:\n\n${confirmUrl}\n\nIf you didn't request this, ignore this email and nothing happens.`,
    html: shell({
      subject: "Confirm your meese.rs subscription",
      preheader: "One click to confirm and start getting new meese.rs posts by email.",
      label: "// confirm",
      body: `<h1 style="font-family:${FONT_DISPLAY};font-size:22px;font-weight:600;line-height:1.25;color:${C.ink1};margin:0 0 10px">Confirm your subscription</h1>
<p style="font-family:${FONT_BODY};font-size:15px;line-height:1.6;color:${C.ink2};margin:0">One click and you're on the list for new meese.rs posts.</p>
${button(confirmUrl, "Confirm subscription")}
<p style="font-family:${FONT_MONO};font-size:12px;line-height:1.6;color:${C.ink4};margin:14px 0 0">Button not working? Paste this into your browser:<br><span style="word-break:break-all;color:${C.ink3}">${safe}</span></p>
<p style="font-family:${FONT_BODY};font-size:13px;line-height:1.6;color:${C.ink4};margin:16px 0 0">Didn't request this? Ignore this email and nothing happens.</p>`,
    }),
  };
}

export function postEmail(item: FeedItem, unsubscribeUrl: string): Omit<OutboundEmail, "to"> {
  const safeUrl = escapeHtml(item.url);
  const safeTitle = escapeHtml(item.title);
  const safeUnsub = escapeHtml(unsubscribeUrl);
  const summary = item.summary ? escapeHtml(item.summary) : "";
  return {
    subject: item.title,
    text: `${item.title}\n\n${item.summary ?? ""}\n\nRead it: ${item.url}\n\n—\nYou're getting this because you subscribed at meese.rs.\nUnsubscribe: ${unsubscribeUrl}`,
    html: shell({
      subject: item.title,
      preheader: item.summary ?? "A new post is up on meese.rs.",
      label: "// new post",
      body: `<h1 style="font-family:${FONT_DISPLAY};font-size:22px;font-weight:600;line-height:1.25;margin:0 0 10px"><a href="${safeUrl}" style="color:${C.ink1};text-decoration:none">${safeTitle}</a></h1>
${summary ? `<p style="font-family:${FONT_BODY};font-size:15px;line-height:1.6;color:${C.ink2};margin:0">${summary}</p>` : ""}
${button(item.url, "Read the post")}
<div style="border-top:1px solid ${C.line};margin:24px 0 0"></div>
<p style="font-family:${FONT_MONO};font-size:12px;line-height:1.6;color:${C.ink4};margin:16px 0 0">You're getting this because you subscribed at meese.rs. <a href="${safeUnsub}" style="color:${C.accent};text-decoration:none">Unsubscribe</a>.</p>`,
    }),
    // RFC 8058 one-click unsubscribe: mail clients surface a native button and
    // can POST here without the reader opening anything.
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}
