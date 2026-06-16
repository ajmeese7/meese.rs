/**
 * Emit public/graph.json (SPEC §26–27), the machine-readable concept graph,
 * shared with the /graph page via the same buildGraph pass. Runs as part of
 * `pnpm build`; the /graph page also builds the graph live, so dev stays fresh.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { loadPosts } from "./lib/frontmatter";
import { buildGraph, graphNodeColor, type GraphPost } from "../src/utils/graph";

const posts: GraphPost[] = loadPosts()
  .filter((p) => !p.data.draft && !p.data.unlisted)
  .map((p) => ({
    id: p.id,
    body: p.body,
    data: {
      type: p.data.type ?? "note",
      title: p.data.title ?? p.id,
      topics: p.data.topics,
      externalUrl: p.data.externalUrl,
      related: p.data.related,
      supersedes: p.data.supersedes,
      supersededBy: p.data.supersededBy,
    },
  }));

const { nodes, edges } = buildGraph(posts);

const out = {
  nodes: nodes.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    url: n.url,
    color: graphNodeColor(n.type),
    x: Number(n.x.toFixed(4)),
    y: Number(n.y.toFixed(4)),
    r: n.r,
  })),
  edges,
};

const publicDir = join(process.cwd(), "public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "graph.json"), JSON.stringify(out, null, 2));
console.log(
  `✓ graph.json, ${out.nodes.length} nodes, ${out.edges.length} edges`,
);
