import type { APIContext, GetStaticPaths } from "astro";
import { getBuildablePosts } from "../../../utils/posts";

const companions = import.meta.glob<string>("../../../content/companions/*/AGENTS.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const getStaticPaths = (async () => {
  const posts = await getBuildablePosts();
  return posts.flatMap((post) => {
    const body = companions[`../../../content/companions/${post.id}/AGENTS.md`];
    return body && !post.data.externalUrl ? [{ params: { slug: post.id }, props: { body } }] : [];
  });
}) satisfies GetStaticPaths;

export function GET({ props }: APIContext) {
  return new Response(props.body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
