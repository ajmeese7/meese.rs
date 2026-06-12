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

/** All publishable posts (draft-aware), feed-ordered. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection(
    "posts",
    (p) => includeDrafts || !p.data.draft,
  );
  return posts.sort(byFeedOrder);
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
