// The test bindings, declared locally for the same reason worker/newsletter/types.ts
// declares the D1 surface: pulling in @cloudflare/workers-types would fight the
// DOM lib the rest of this project typechecks against. This is the whole surface
// the tests touch, and it is the same shape the Worker itself consumes.
declare module "cloudflare:workers" {
  import type { D1Database, RateLimiter } from "../worker/newsletter/types";

  export const env: {
    DB: D1Database;
    SUBSCRIBE_LIMIT: RateLimiter;
  };
}
