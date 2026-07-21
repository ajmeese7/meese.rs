// HTTP handlers for the subscribe / confirm / unsubscribe routes.
import * as db from "./db";
import { confirmationEmail, sendEmail } from "./email";
import {
  confirmPage,
  confirmPromptPage,
  subscribeStatusPage,
  unsubscribePage,
  unsubscribePromptPage,
} from "./pages";
import type { NewsletterEnv, SubscribeState } from "./types";
import {
  backUrl,
  backUrlWithState,
  isValidEmail,
  isWithinCooldown,
  newToken,
  siteUrl,
} from "./validation";

// The IP rate limiter can't help a victim whose address someone else keeps
// submitting from fresh IPs, so confirmation resends are throttled per address
// too. Long enough to stop a flood, short enough that "resend it" still works.
const CONFIRM_RESEND_COOLDOWN_MS = 5 * 60 * 1000;

async function readSubmission(request: Request): Promise<{ email: string; honeypot: string }> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" ? v : "");
    return { email: str(body.email).trim(), honeypot: str(body.website).trim() };
  }
  const form = await request.formData().catch(() => new FormData());
  return {
    email: String(form.get("email") ?? "").trim(),
    honeypot: String(form.get("website") ?? "").trim(),
  };
}

export async function handleSubscribe(request: Request, env: NewsletterEnv): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(null, { status: 405, headers: { allow: "POST" } });
  }

  const accept = request.headers.get("accept") ?? "";
  const wantsJson =
    request.headers.get("x-requested-with") === "fetch" || accept.includes("application/json");
  const back = backUrl(request);
  const respond = (state: SubscribeState, httpStatus: number): Response => {
    if (wantsJson) return Response.json({ state }, { status: httpStatus });
    // POST-redirect-GET so a refresh can't resubmit. The form's own script reads
    // ?subscribe=<state> and renders it inline. When there's no same-origin page
    // to bounce to (the root fallback carries no form), render a page instead.
    if (back === "/") return subscribeStatusPage(state, back);
    return new Response(null, { status: 303, headers: { location: backUrlWithState(back, state) } });
  };

  // Cheapest check first: this is an unauthenticated endpoint that makes us send
  // mail, so it gets throttled before it touches D1 or Resend.
  const limiter = env.SUBSCRIBE_LIMIT;
  if (limiter) {
    const key = request.headers.get("cf-connecting-ip") ?? "unknown";
    if (!(await limiter.limit({ key })).success) return respond("ratelimited", 429);
  }

  const { email, honeypot } = await readSubmission(request);

  // A bot filled the hidden field. Look successful, but never touch the store.
  if (honeypot) return respond("ok", 200);
  if (!isValidEmail(email)) return respond("invalid", 400);

  try {
    const existing = await db.findByEmail(env.DB, email);
    if (existing?.status === "confirmed") return respond("exists", 200);

    const now = new Date().toISOString();
    if (
      existing?.status === "pending" &&
      isWithinCooldown(existing.confirm_sent_at, now, CONFIRM_RESEND_COOLDOWN_MS)
    ) {
      // Same answer as a real send, so this doesn't become a way to probe which
      // addresses are already pending.
      return respond("ok", 200);
    }

    // Reuse a still-pending token so refreshing the form doesn't orphan links.
    const confirmToken = existing?.status === "pending" ? existing.confirm_token : newToken();

    if (!existing) {
      await db.insertPending(env.DB, {
        email,
        confirmToken,
        unsubscribeToken: newToken(),
        now,
      });
    } else if (existing.status === "pending") {
      await db.markConfirmSent(env.DB, email, now);
    } else {
      await db.resetToPending(env.DB, { email, confirmToken, now });
    }

    const message = confirmationEmail(`${siteUrl(env)}/newsletter/confirm?token=${confirmToken}`);
    await sendEmail(env, { to: email, ...message });
    return respond("ok", 200);
  } catch (err) {
    console.error("newsletter: subscribe failed", err);
    return respond("error", 500);
  }
}

// GET renders a one-button form; the state change happens on POST. Mail scanners
// prefetch inbound links, and a scanner confirming for the reader would make our
// double opt-in record document consent nobody gave.
export async function handleConfirm(request: Request, env: NewsletterEnv): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token) return confirmPage("invalid");
  if (request.method !== "POST") return confirmPromptPage(token);
  try {
    return confirmPage(await db.confirmByToken(env.DB, token, new Date().toISOString()));
  } catch (err) {
    console.error("newsletter: confirm failed", err);
    return confirmPage("error");
  }
}

// Same GET/POST split, for the same reason: a scanner following the unsubscribe
// link would silently drop the reader off the list. The RFC 8058 one-click path
// mail clients fire is already a POST, so it lands directly on the action.
export async function handleUnsubscribe(request: Request, env: NewsletterEnv): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token) return unsubscribePage("invalid");
  if (request.method !== "POST") return unsubscribePromptPage(token);
  try {
    return unsubscribePage((await db.unsubscribeByToken(env.DB, token)) ? "ok" : "invalid");
  } catch (err) {
    console.error("newsletter: unsubscribe failed", err);
    return unsubscribePage("error");
  }
}
