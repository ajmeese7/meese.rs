// Same-domain PostHog ingest proxy. Everything under PROXY_PREFIX is forwarded
// to PostHog Cloud US; every other request falls through to the static assets
// that make up the site (identical to the previous assets-only deployment).
//
// The prefix is deliberately not named "posthog" or "analytics" so filter-list
// heuristics on the path don't eat first-party events.
const PROXY_PREFIX = "/relay";
const API_HOST = "us.i.posthog.com";
const ASSET_HOST = "us-assets.i.posthog.com";

interface Env {
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
    return env.ASSETS.fetch(request);
  },
};

function proxyToPosthog(request: Request, url: URL, ctx: Ctx): Promise<Response> {
  const pathWithSearch = url.pathname.slice(PROXY_PREFIX.length) + url.search;
  if (pathWithSearch.startsWith("/static/")) {
    return retrieveStatic(request, pathWithSearch, ctx);
  }
  return forwardRequest(request, pathWithSearch);
}

// The SDK bundle (array.js etc.) is hot on every pageview; cache it at the
// edge instead of round-tripping to PostHog each time.
async function retrieveStatic(
  request: Request,
  pathWithSearch: string,
  ctx: Ctx,
): Promise<Response> {
  const cached = await edgeCache().match(request);
  if (cached) return cached;
  const response = await fetch(`https://${ASSET_HOST}${pathWithSearch}`);
  ctx.waitUntil(edgeCache().put(request, response.clone()));
  return response;
}

function forwardRequest(request: Request, pathWithSearch: string): Promise<Response> {
  const headers = new Headers(request.headers);
  // First-party cookies are none of PostHog's business.
  headers.delete("cookie");
  return fetch(`https://${API_HOST}${pathWithSearch}`, {
    method: request.method,
    headers,
    body: request.body,
    redirect: "follow",
  });
}
