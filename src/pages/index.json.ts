import type { APIContext } from "astro";
import { buildCatalog } from "../utils/catalog";
import { getPosts } from "../utils/posts";

/**
 * The machine-readable catalog. `getPosts()` is the site's own listing set, so
 * drafts and unlisted entries are excluded here exactly as they are everywhere
 * else. See src/utils/catalog.ts for why this is not folded into feed.json.
 */
export async function GET(context: APIContext) {
  const posts = (await getPosts()).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
  const site = context.site ?? new URL("https://meese.rs");

  return new Response(JSON.stringify(buildCatalog(posts, site), null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
