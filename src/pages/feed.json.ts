import type { APIContext } from "astro";
import { getFeedPosts, postUrl } from "../utils/posts";

// JSON Feed 1.1, https://www.jsonfeed.org/version/1.1/
export async function GET(context: APIContext) {
  const posts = (await getFeedPosts()).sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
  const site = context.site ?? new URL("https://meese.rs");
  const abs = (path: string) => new URL(path, site).href;

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "meese.rs",
    home_page_url: site.href,
    feed_url: abs("/feed.json"),
    description:
      "Field notes from a builder, practical writing on software, AI/devtools, and systems-building.",
    language: "en",
    items: posts.map((post) => ({
      id: post.data.externalUrl ?? abs(postUrl(post)),
      url: post.data.externalUrl ?? abs(postUrl(post)),
      title: post.data.title,
      summary: post.data.description,
      date_published: post.data.date.toISOString(),
      ...(post.data.updated
        ? { date_modified: post.data.updated.toISOString() }
        : {}),
      tags: [post.data.type, ...post.data.topics],
      _meese: { type: post.data.type },
    })),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { "Content-Type": "application/feed+json; charset=utf-8" },
  });
}
