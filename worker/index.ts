// Same-domain PostHog ingest proxy. Everything under PROXY_PREFIX is forwarded
// to PostHog Cloud US; every other request falls through to the static assets
// that make up the site (identical to the previous assets-only deployment).
//
// The prefix is deliberately not named "posthog" or "analytics" so filter-list
// heuristics on the path don't eat first-party events.
import {
  handleConfirm,
  handleSubscribe,
  handleUnsubscribe,
  runNewPostDigest,
  type NewsletterEnv,
} from "./newsletter";

const PROXY_PREFIX = "/relay";
const API_HOST = "us.i.posthog.com";
const ASSET_HOST = "us-assets.i.posthog.com";

// Only the endpoints posthog-js actually talks to are forwarded; anything
// else under /relay is a 404, so the Worker can't be used as a general
// relay to PostHog's API surface.
const API_PATHS = ["/e", "/i/v0/e", "/flags", "/decide", "/array"];
const MAX_BODY_BYTES = 1_000_000; // event batches are a few KB; 1MB is generous

// Env extends NewsletterEnv (DB + Resend secret/vars); see docs/newsletter-setup.md.
interface Env extends NewsletterEnv {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

interface Ctx {
  waitUntil(promise: Promise<unknown>): void;
}

// This project typechecks against DOM lib types, which lack the Workers-only
// `caches.default` edge cache.
const edgeCache = () => (caches as unknown as { default: Cache }).default;

export default {
  async fetch(request: Request, env: Env, ctx: Ctx): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === PROXY_PREFIX || url.pathname.startsWith(`${PROXY_PREFIX}/`)) {
      return proxyToPosthog(request, url, ctx);
    }
    switch (url.pathname) {
      case "/newsletter/subscribe":
        return handleSubscribe(request, env);
      case "/newsletter/confirm":
        return handleConfirm(request, env);
      case "/newsletter/unsubscribe":
        return handleUnsubscribe(request, env);
    }
    return env.ASSETS.fetch(request);
  },

  // Hourly cron: email confirmed subscribers about posts new since last run.
  async scheduled(_event: unknown, env: Env, ctx: Ctx): Promise<void> {
    ctx.waitUntil(runNewPostDigest(env));
  },
};

function proxyToPosthog(request: Request, url: URL, ctx: Ctx): Promise<Response> {
  const path = url.pathname.slice(PROXY_PREFIX.length);
  if (path.startsWith("/static/")) {
    if (request.method !== "GET") return Promise.resolve(new Response(null, { status: 405 }));
    return retrieveStatic(request, path + url.search, ctx);
  }
  const isApiPath = API_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
  if (!isApiPath || (request.method !== "GET" && request.method !== "POST")) {
    return Promise.resolve(new Response(null, { status: 404 }));
  }
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return Promise.resolve(new Response(null, { status: 413 }));
  }
  return forwardRequest(request, path + url.search);
}

// The SDK bundle (array.js etc.) is hot on every pageview; cache it at the
// edge instead of round-tripping to PostHog each time. Only clean 200s are
// cached so an upstream blip can't get pinned as a cached failure.
async function retrieveStatic(
  request: Request,
  pathWithSearch: string,
  ctx: Ctx,
): Promise<Response> {
  const cached = await edgeCache().match(request);
  if (cached) return cached;
  const response = await fetch(`https://${ASSET_HOST}${pathWithSearch}`);
  if (response.status === 200) {
    ctx.waitUntil(edgeCache().put(request, response.clone()));
  }
  return stripCookies(response);
}

// Forward only the headers PostHog needs (UA/referrer analytics, geo from the
// CF/XFF client-IP headers), so nothing a future feature attaches to requests
// can leak to a third party by default.
const FORWARDED_HEADERS = [
  "accept",
  "accept-language",
  "content-type",
  "origin",
  "referer",
  "user-agent",
  "x-forwarded-for",
  "cf-connecting-ip",
  "cf-ipcountry",
];

function forwardRequest(request: Request, pathWithSearch: string): Promise<Response> {
  const headers = new Headers();
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  return fetch(`https://${API_HOST}${pathWithSearch}`, {
    method: request.method,
    headers,
    body: request.body,
    redirect: "follow",
  }).then(stripCookies);
}

// PostHog's ingest hosts don't set cookies today, but if they ever do, they
// must not land as first-party meese.rs cookies through the proxy.
function stripCookies(response: Response): Response {
  if (!response.headers.has("set-cookie")) return response;
  const stripped = new Response(response.body, response);
  stripped.headers.delete("set-cookie");
  return stripped;
}
