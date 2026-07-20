// Email delivery via Resend, plus the two templates. Resend is the only
// provider-specific piece; swapping senders is a change to `sendEmail` alone.
import type { FeedItem, NewsletterEnv } from "./types";

const RESEND_URL = "https://api.resend.com/emails";
const DEFAULT_FROM = "meese.rs <posts@mail.meese.rs>";

export interface OutboundEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}

// Returns true on a delivered send. Without a key (local dev) it logs and
// returns false so the whole flow can be exercised offline.
export async function sendEmail(env: NewsletterEnv, msg: OutboundEmail): Promise<boolean> {
  if (!env.RESEND_API_KEY) {
    console.warn(`newsletter: RESEND_API_KEY unset, skipped email to ${msg.to} (${msg.subject})`);
    return false;
  }
  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.NEWSLETTER_FROM ?? DEFAULT_FROM,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        headers: msg.headers,
      }),
    });
    if (!res.ok) {
      console.error(`newsletter: Resend send failed ${res.status} for ${msg.to}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`newsletter: Resend request threw for ${msg.to}`, err);
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const SHELL = (bodyHtml: string): string =>
  `<!doctype html><html><body style="margin:0;background:#f6f7f8;padding:24px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1a1c1f;line-height:1.6">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e6e8eb;border-radius:8px;padding:28px">
${bodyHtml}
</div></body></html>`;

export function confirmationEmail(confirmUrl: string): Omit<OutboundEmail, "to"> {
  const safe = escapeHtml(confirmUrl);
  return {
    subject: "Confirm your meese.rs subscription",
    text: `Almost there. Confirm your subscription to meese.rs by opening this link:\n\n${confirmUrl}\n\nIf you didn't request this, ignore this email and nothing happens.`,
    html: SHELL(
      `<h1 style="font-size:18px;margin:0 0 12px">Confirm your subscription</h1>
<p style="margin:0 0 20px">One click and you're on the list for new meese.rs posts.</p>
<p style="margin:0 0 24px"><a href="${safe}" style="display:inline-block;background:#6A4ED6;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600">Confirm subscription</a></p>
<p style="margin:0;font-size:13px;color:#6b7280">If the button doesn't work, paste this into your browser:<br><span style="word-break:break-all">${safe}</span></p>
<p style="margin:16px 0 0;font-size:13px;color:#6b7280">Didn't request this? Ignore this email and nothing happens.</p>`,
    ),
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
    html: SHELL(
      `<h1 style="font-size:20px;margin:0 0 12px"><a href="${safeUrl}" style="color:#1a1c1f;text-decoration:none">${safeTitle}</a></h1>
${summary ? `<p style="margin:0 0 20px;color:#374151">${summary}</p>` : ""}
<p style="margin:0 0 24px"><a href="${safeUrl}" style="display:inline-block;background:#6A4ED6;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:6px;font-weight:600">Read the post</a></p>
<p style="margin:0;font-size:13px;color:#6b7280">You're getting this because you subscribed at meese.rs. <a href="${safeUnsub}" style="color:#6b7280">Unsubscribe</a>.</p>`,
    ),
    // RFC 8058 one-click unsubscribe: mail clients surface a native button and
    // can POST here without the reader opening anything.
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}
