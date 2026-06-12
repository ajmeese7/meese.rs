import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getFeedPosts, postUrl } from "../utils/posts";

export async function GET(context: APIContext) {
  const posts = (await getFeedPosts()).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
  const site = context.site ?? new URL("https://meese.rs");

  return rss({
    title: "meese.rs",
    description:
      "Field notes from a builder, practical writing on software, AI/devtools, and systems-building.",
    site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: post.data.externalUrl ?? new URL(postUrl(post), site).href,
      categories: [post.data.type, ...post.data.topics],
    })),
    customData: "<language>en</language>",
  });
}
