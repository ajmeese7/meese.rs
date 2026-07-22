// Server-rendered pages for the flows a reader lands on directly: a no-JS
// subscribe result, and the confirm / unsubscribe link targets from emails.
// A \u00A0 inside a note ties the closing phrase together so the wrap lands
// between thoughts instead of stranding a single word on its own line.
import type { SubscribeState } from "./types";
import { escapeHtml } from "./validation";

const STYLES = `
  :root { color-scheme: dark; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: #090A0C; color: #AAB0B7;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  main { max-width: 30rem; padding: 2rem; text-align: center; }
  h1 { color: #EDEFF1; font-size: 1.35rem; margin: 0 0 .5rem; }
  p { line-height: 1.6; margin: 0 0 1.5rem; }
  a { color: #9A7CFF; }
  button { font: inherit; font-size: .9rem; font-weight: 600; letter-spacing: .04em;
    padding: .7rem 1.5rem; border-radius: 6px; cursor: pointer;
    background: #9A7CFF; color: #0A0814; border: 1px solid #9A7CFF; }
`;

function shell(heading: string, body: string, status: number): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHtml(heading)} · meese.rs</title>
<style>${STYLES}</style>
</head>
<body>
  <main>
    <h1>${escapeHtml(heading)}</h1>
${body}
  </main>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function page(opts: {
  heading: string;
  note: string;
  back: string;
  backLabel: string;
  status: number;
}): Response {
  // `back` is already origin-checked by backUrl(), this is the belt to that
  // suspenders: anything unexpected collapses to the site root.
  const safe =
    (opts.back.startsWith("/") && !opts.back.startsWith("//")) ||
    opts.back.startsWith("https://meese.rs")
      ? opts.back
      : "/";
  return shell(
    opts.heading,
    `    <p>${escapeHtml(opts.note)}</p>
    <a href="${escapeHtml(safe)}">${escapeHtml(opts.backLabel)}</a>`,
    opts.status,
  );
}

// A one-button form instead of acting on the GET. Mail security scanners
// (Outlook Safe Links and friends) prefetch every link in an inbound email, so
// anything that mutates on GET gets triggered without the reader ever clicking.
function promptPage(opts: {
  heading: string;
  note: string;
  action: string;
  token: string;
  submitLabel: string;
}): Response {
  const action = `${opts.action}?token=${encodeURIComponent(opts.token)}`;
  return shell(
    opts.heading,
    `    <p>${escapeHtml(opts.note)}</p>
    <form method="post" action="${escapeHtml(action)}">
      <button type="submit">${escapeHtml(opts.submitLabel)}</button>
    </form>`,
    200,
  );
}

// Copy mirrors the STATUS map in NewsletterSignup.astro; keep the two in sync.
const SUBSCRIBE_COPY: Record<SubscribeState, { heading: string; note: string; status: number }> = {
  ok: { heading: "Almost there", note: "Check your inbox to confirm your subscription.", status: 200 },
  exists: { heading: "Already subscribed", note: "That address is already on the list.", status: 200 },
  invalid: { heading: "Check that address", note: "That email doesn't look right. Head back and try again.", status: 400 },
  ratelimited: { heading: "Too many tries", note: "A lot of signups right now. Give it a minute and try again.", status: 429 },
  error: { heading: "Something broke", note: "That one is on us. Please head back and try again.", status: 500 },
};

export function subscribeStatusPage(state: SubscribeState, back: string): Response {
  const copy = SUBSCRIBE_COPY[state];
  return page({ ...copy, back, backLabel: "← back to the post" });
}

export function confirmPromptPage(token: string): Response {
  return promptPage({
    heading: "Confirm your subscription",
    note: "One click and you're on the list for new meese.rs\u00A0posts.",
    action: "/newsletter/confirm",
    token,
    submitLabel: "Confirm subscription",
  });
}

export function confirmPage(state: "ok" | "invalid" | "unsubscribed" | "error"): Response {
  const copy = {
    ok: { heading: "You're subscribed", note: "You'll get an email when a new post goes up. Nothing\u00A0else.", status: 200 },
    invalid: { heading: "Link not found", note: "That confirmation link is invalid. Try subscribing again.", status: 400 },
    unsubscribed: { heading: "You unsubscribed", note: "This link is from before you left the list, so it won't re-subscribe you. Sign up again on any post if you'd like back in.", status: 409 },
    error: { heading: "Something broke", note: "That one is on us. Please try again in a moment.", status: 500 },
  }[state];
  return page({ ...copy, back: "https://meese.rs", backLabel: "→ meese.rs" });
}

export function unsubscribePromptPage(token: string): Response {
  return promptPage({
    heading: "Unsubscribe",
    note: "Confirm and you're off the list. No more emails.",
    action: "/newsletter/unsubscribe",
    token,
    submitLabel: "Unsubscribe",
  });
}

export function unsubscribePage(state: "ok" | "invalid" | "error"): Response {
  const copy = {
    ok: { heading: "Unsubscribed", note: "You're off the list. No more emails, no hard\u00A0feelings.", status: 200 },
    invalid: { heading: "Link not found", note: "That unsubscribe link is invalid. You may already be off the list.", status: 400 },
    error: { heading: "Something broke", note: "That one is on us. Please try again in a moment.", status: 500 },
  }[state];
  return page({ ...copy, back: "https://meese.rs", backLabel: "→ meese.rs" });
}
