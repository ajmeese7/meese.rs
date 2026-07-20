// HTTP handlers for the subscribe / confirm / unsubscribe routes.
import * as db from "./db";
import { confirmationEmail, sendEmail } from "./email";
import { confirmPage, subscribeStatusPage, unsubscribePage } from "./pages";
import type { NewsletterEnv, SubscribeState } from "./types";
import { backUrl, isValidEmail, newToken, siteUrl } from "./validation";

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
  if (request.method !== "POST") return new Response(null, { status: 405 });

  const json = request.headers.get("x-requested-with") === "fetch";
  const back = backUrl(request);
  const respond = (state: SubscribeState, httpStatus: number): Response =>
    json ? Response.json({ state }, { status: httpStatus }) : subscribeStatusPage(state, back);

  const { email, honeypot } = await readSubmission(request);

  // A bot filled the hidden field. Look successful, but never touch the store.
  if (honeypot) return respond("ok", 200);
  if (!isValidEmail(email)) return respond("invalid", 400);

  try {
    const existing = await db.findByEmail(env.DB, email);
    if (existing?.status === "confirmed") return respond("exists", 200);

    const now = new Date().toISOString();
    // Reuse a still-pending token so refreshing the form doesn't orphan links.
    const confirmToken =
      existing?.status === "pending" ? existing.confirm_token : newToken();

    if (!existing) {
      await db.insertPending(env.DB, {
        email,
        confirmToken,
        unsubscribeToken: newToken(),
        now,
      });
    } else if (existing.status !== "pending") {
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

export async function handleConfirm(request: Request, env: NewsletterEnv): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token) return confirmPage("invalid");
  try {
    const sub = await db.confirmByToken(env.DB, token, new Date().toISOString());
    return confirmPage(sub ? "ok" : "invalid");
  } catch (err) {
    console.error("newsletter: confirm failed", err);
    return confirmPage("error");
  }
}

// GET from the email link renders a page; POST is the RFC 8058 one-click path
// mail clients fire. Both unsubscribe and return 200.
export async function handleUnsubscribe(request: Request, env: NewsletterEnv): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token) return unsubscribePage("invalid");
  try {
    const sub = await db.unsubscribeByToken(env.DB, token);
    return unsubscribePage(sub ? "ok" : "invalid");
  } catch (err) {
    console.error("newsletter: unsubscribe failed", err);
    return unsubscribePage("error");
  }
}
