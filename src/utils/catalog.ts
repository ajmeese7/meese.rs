/**
 * The `/index.json` catalog: a compact, machine-readable list of everything
 * published here.
 *
 * This is deliberately not a feed. `feed.xml` and `feed.json` are syndication
 * formats with fixed schemas, meant for readers that display posts to humans.
 * The catalog is for programs that need to reason about the writing: today
 * that is meese.dev, which reads it to ground its chat clone in what has
 * actually been written instead of letting it improvise. Keeping the two
 * separate means consumer-driven field changes never touch what real RSS
 * readers parse.
 *
 * Pure on purpose: `buildCatalog` takes posts and returns a plain object, so
 * the contract can be tested without standing up an Astro build.
 */
import { postUrl, type Addressable } from "./post-url";

/**
 * Bump when a change would break a consumer that understood the previous
 * shape: a renamed or removed field, or a field whose type changes. Adding an
 * optional field is backwards compatible and does not need a bump.
 */
export const CATALOG_VERSION = 1;

/** The fields the catalog reads. Real collection entries carry more. */
export interface CatalogPost extends Addressable {
  id: string;
  data: {
    title: string;
    description: string;
    date: Date;
    type: string;
    topics: string[];
    tags: string[];
    repo?: string;
    externalUrl?: string;
  };
}

export interface CatalogItem {
  slug: string;
  title: string;
  description: string;
  url: string;
  date: string;
  type: string;
  topics: string[];
  tags: string[];
  repo?: string;
}

export interface Catalog {
  version: number;
  site: string;
  count: number;
  items: CatalogItem[];
}

/**
 * Build the catalog from posts the caller has already filtered. Visibility is
 * the caller's job: pass `getPosts()` and drafts and unlisted entries are
 * already gone.
 *
 * Carries no post body and no timestamp. A `generated` field would rewrite the
 * file on every build for no gain, since consumers cache on their own clock.
 */
export function buildCatalog(posts: CatalogPost[], site: URL): Catalog {
  const items = posts.map((post): CatalogItem => {
    const d = post.data;
    return {
      slug: post.id,
      title: d.title,
      description: d.description,
      // Resolves `externalUrl` for entries whose writing lives elsewhere,
      // via the same helper the feeds use, so all three agree by construction.
      url: new URL(postUrl(post), site).href,
      date: d.date.toISOString(),
      type: d.type,
      topics: d.topics,
      tags: d.tags,
      // Omitted rather than null when absent, so a consumer can test presence.
      ...(d.repo ? { repo: d.repo } : {}),
    };
  });

  return {
    version: CATALOG_VERSION,
    site: site.href,
    count: items.length,
    items,
  };
}
