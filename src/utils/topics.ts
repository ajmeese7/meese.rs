import { getPosts, getByTopic, type Post } from "./posts";

export interface Topic {
  slug: string;
  label: string;
  count: number;
  hue: string;
}

// Categorical hues (the muted palette, never the neon accent). Curated
// assignments match the design system's topic colors; anything else gets a
// stable hue by hashing the slug, so new topics still get a consistent dot.
const HUE_VARS = [
  "var(--hue-cyan)",
  "var(--hue-violet)",
  "var(--hue-green)",
  "var(--hue-gold)",
  "var(--hue-rose)",
  "var(--hue-slate)",
];

const CURATED: Record<string, string> = {
  "react-native": "var(--hue-cyan)",
  expo: "var(--hue-cyan)",
  "ai-devtools": "var(--hue-violet)",
  agents: "var(--hue-violet)",
  "static-sites": "var(--hue-green)",
  publishing: "var(--hue-slate)",
  "local-llms": "var(--hue-gold)",
  "developer-experience": "var(--hue-rose)",
  security: "var(--hue-gold)",
};

export function topicHue(slug: string): string {
  if (CURATED[slug]) return CURATED[slug];
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return HUE_VARS[h % HUE_VARS.length];
}

/** Live topic index, computed from publishable posts, by count desc. */
export async function getTopics(): Promise<Topic[]> {
  const posts = await getPosts();
  const counts = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.data.topics) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, label: slug, count, hue: topicHue(slug) }))
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}

/** Topics that co-occur with `topic` on shared posts, for "related topics". */
export async function getRelatedTopics(topic: string): Promise<Topic[]> {
  const posts = await getByTopic(topic);
  const counts = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.data.topics) {
      if (t === topic) continue;
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, label: slug, count, hue: topicHue(slug) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function topicUrl(slug: string): string {
  return `/topics/${slug}/`;
}

export function postTopics(post: Post): string[] {
  return post.data.topics;
}
