// Server-rendered pages for the flows a reader lands on directly: a no-JS
// subscribe result, and the confirm / unsubscribe link targets from emails.
import type { SubscribeState } from "./types";

function page(opts: {
  heading: string;
  note: string;
  back: string;
  backLabel: string;
  status: number;
}): Response {
  const back = opts.back.startsWith("/") || opts.back.startsWith("https://") ? opts.back : "/";
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${opts.heading} · meese.rs</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center;
    background: #090A0C; color: #AAB0B7;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  main { max-width: 30rem; padding: 2rem; text-align: center; }
  h1 { color: #EDEFF1; font-size: 1.35rem; margin: 0 0 .5rem; }
  p { line-height: 1.6; margin: 0 0 1.5rem; }
  a { color: #9A7CFF; }
</style>
</head>
<body>
  <main>
    <h1>${opts.heading}</h1>
    <p>${opts.note}</p>
    <a href="${back}">${opts.backLabel}</a>
  </main>
</body>
</html>`;
  return new Response(html, {
    status: opts.status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// Copy mirrors the STATUS map in NewsletterSignup.astro; keep the two in sync.
const SUBSCRIBE_COPY: Record<SubscribeState, { heading: string; note: string; status: number }> = {
  ok: { heading: "Almost there", note: "Check your inbox to confirm your subscription.", status: 200 },
  exists: { heading: "Already subscribed", note: "That address is already on the list.", status: 200 },
  invalid: { heading: "Check that address", note: "That email doesn't look right. Head back and try again.", status: 400 },
  error: { heading: "Something broke", note: "That one is on us. Please head back and try again.", status: 500 },
};

export function subscribeStatusPage(state: SubscribeState, back: string): Response {
  const copy = SUBSCRIBE_COPY[state];
  return page({ ...copy, back, backLabel: "← back to the post" });
}

export function confirmPage(state: "ok" | "invalid" | "error"): Response {
  const copy = {
    ok: { heading: "You're subscribed", note: "You'll get an email when a new post goes up. Nothing else.", status: 200 },
    invalid: { heading: "Link expired", note: "That confirmation link is invalid or already used. Try subscribing again.", status: 400 },
    error: { heading: "Something broke", note: "That one is on us. Please try again in a moment.", status: 500 },
  }[state];
  return page({ ...copy, back: "https://meese.rs", backLabel: "→ meese.rs" });
}

export function unsubscribePage(state: "ok" | "invalid" | "error"): Response {
  const copy = {
    ok: { heading: "Unsubscribed", note: "You're off the list. No more emails, no hard feelings.", status: 200 },
    invalid: { heading: "Link not found", note: "That unsubscribe link is invalid. You may already be off the list.", status: 400 },
    error: { heading: "Something broke", note: "That one is on us. Please try again in a moment.", status: 500 },
  }[state];
  return page({ ...copy, back: "https://meese.rs", backLabel: "→ meese.rs" });
}
