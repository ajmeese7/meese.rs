import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"posts">;

/** Drafts ship in `astro dev` but never in a production build. */
const includeDrafts = import.meta.env.DEV;

/** Roughly 200 wpm; the UI shows "7 min". */
export function readingTime(body: string | undefined): string {
  const words = (body ?? "").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min`;
}

/** pinned first, then newest `date` first, the SPEC feed order. */
export function byFeedOrder(a: Post, b: Post): number {
  const ap = a.data.pinned ? 1 : 0;
  const bp = b.data.pinned ? 1 : 0;
  if (ap !== bp) return bp - ap;
  return b.data.date.getTime() - a.data.date.getTime();
}

/**
 * Every post built into a page (draft-aware), feed-ordered. Includes `unlisted`
 * posts: they get a live URL, they just never surface in a listing. Only the
 * routes that must emit them (`/posts/[slug]` and their OG images) should call
 * this. Anything user-facing should use `getPosts`.
 */
export async function getBuildablePosts(): Promise<Post[]> {
  const posts = await getCollection(
    "posts",
    (p) => includeDrafts || !p.data.draft,
  );
  return posts.sort(byFeedOrder);
}

/**
 * Listing default: buildable posts minus `unlisted`. Feeds, topics, types,
 * search, graph, backlinks, and counts all derive from this, so an unlisted
 * post stays reachable by URL while showing up nowhere on the site.
 */
export async function getPosts(): Promise<Post[]> {
  return (await getBuildablePosts()).filter((p) => !p.data.unlisted);
}

/** Main feed: everything except `hideFromFeed`. */
export async function getFeedPosts(): Promise<Post[]> {
  return (await getPosts()).filter((p) => !p.data.hideFromFeed);
}

/** "Writing" = the feed minus reviews (reviews have their own index). */
export async function getWriting(): Promise<Post[]> {
  return (await getFeedPosts()).filter((p) => p.data.type !== "review");
}

export async function getByType(type: Post["data"]["type"]): Promise<Post[]> {
  return (await getPosts()).filter((p) => p.data.type === type);
}

export async function getByTopic(topic: string): Promise<Post[]> {
  return (await getPosts()).filter((p) => p.data.topics.includes(topic));
}

export async function getReviews(): Promise<Post[]> {
  return getByType("review");
}

export function postUrl(post: Post): string {
  if (post.data.externalUrl) return post.data.externalUrl;
  return `/posts/${post.id}/`;
}

/** The public repo this site (and every post in it) is built from. */
export const REPO_URL = "https://github.com/ajmeese7/meese.rs";

/**
 * The MDX behind a post, on GitHub. `filePath` is repo-relative and set by the
 * glob loader; an entry that came from somewhere other than a file has none,
 * and gets no link rather than a guessed path that 404s.
 */
export function postSourceUrl(post: Post): string | null {
  if (!post.filePath) return null;
  return `${REPO_URL}/blob/master/${post.filePath}`;
}
