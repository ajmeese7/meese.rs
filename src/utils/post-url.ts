/**
 * Where an entry lives. Its own leaf module, with no `astro:content` import,
 * so build-time consumers (the catalog, the feeds) and their tests can resolve
 * a URL without pulling in the whole content layer.
 *
 * Structurally typed rather than typed as `Post`: every caller passes a real
 * collection entry, and a test can pass the three fields the rule reads.
 */
export interface Addressable {
  id: string;
  data: { externalUrl?: string };
}

/**
 * An entry whose writing lives elsewhere points at that URL; meese.rs holds
 * only the index card for it. Everything else points at its own page.
 */
export function postUrl(post: Addressable): string {
  if (post.data.externalUrl) return post.data.externalUrl;
  return `/posts/${post.id}/`;
}
