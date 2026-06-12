/** Minimal post shape the graph builder needs, `Post` satisfies it
 *  structurally, and the standalone `generate-graph` script can build it from
 *  parsed frontmatter without pulling in the Astro runtime. */
export interface GraphPost {
  id: string;
  body?: string;
  data: {
    type: string;
    title: string;
    topics: string[];
    externalUrl?: string;
    related: { slug: string }[];
    supersedes: string[];
    supersededBy?: string;
  };
}

export type GraphNodeType = string;
export type GraphEdgeType =
  | "topic"
  | "tag"
  | "related"
  | "mentions"
  | "supersedes"
  | "superseded_by";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  title: string;
  url: string;
  /** normalized layout position (0..1) + radius, for rendering */
  x: number;
  y: number;
  r: number;
}
export interface GraphEdge {
  source: string;
  target: string;
  type: GraphEdgeType;
}
export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const TWO_PI = Math.PI * 2;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295; // 0..1, deterministic
}

const clamp = (n: number) => Math.min(0.93, Math.max(0.07, n));

/**
 * Build the concept graph (SPEC §26): post + topic nodes, edges by topic
 * membership, manual relations, internal mentions, and supersede chains.
 *
 * Layout is deterministic (seeded by id) so the same content always lays out
 * the same way and the build is reproducible: topics sit on an inner ring,
 * posts orbit the centroid of their topics with a hashed offset.
 */
export function buildGraph(posts: GraphPost[]): Graph {
  const topicSet = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.data.topics) topicSet.set(t, (topicSet.get(t) ?? 0) + 1);
  }
  const topics = [...topicSet.entries()].sort((a, b) => b[1] - a[1]);

  const nodes: GraphNode[] = [];
  const topicPos = new Map<string, { x: number; y: number }>();

  topics.forEach(([slug, count], i) => {
    const angle = (i / Math.max(1, topics.length)) * TWO_PI;
    const x = clamp(0.5 + Math.cos(angle) * 0.3);
    const y = clamp(0.5 + Math.sin(angle) * 0.3);
    topicPos.set(slug, { x, y });
    nodes.push({
      id: `topic:${slug}`,
      type: "topic",
      title: slug,
      url: `/topics/${slug}/`,
      x,
      y,
      r: 13 + Math.min(6, count),
    });
  });

  const POST_R: Record<string, number> = {
    guide: 9,
    devlog: 9,
    review: 9,
    lab: 9,
    essay: 8,
    reference: 8,
    note: 7,
  };

  for (const p of posts) {
    const pts = p.data.topics
      .map((t) => topicPos.get(t))
      .filter((v): v is { x: number; y: number } => !!v);
    let cx = 0.5;
    let cy = 0.5;
    if (pts.length) {
      cx = pts.reduce((s, v) => s + v.x, 0) / pts.length;
      cy = pts.reduce((s, v) => s + v.y, 0) / pts.length;
    }
    const a = hash(p.id) * TWO_PI;
    const rad = 0.1 + hash(p.id + "r") * 0.12;
    nodes.push({
      id: p.id,
      type: p.data.type,
      title: p.data.title,
      url: p.data.externalUrl ?? `/posts/${p.id}/`,
      x: clamp(cx + Math.cos(a) * rad),
      y: clamp(cy + Math.sin(a) * rad),
      r: POST_R[p.data.type] ?? 8,
    });
  }

  const ids = new Set(posts.map((p) => p.id));
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();
  const push = (source: string, target: string, type: GraphEdgeType) => {
    const key = `${source}->${target}:${type}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ source, target, type });
  };

  const INTERNAL = /\/posts\/([a-z0-9-]+)\/?/gi;
  for (const p of posts) {
    for (const t of p.data.topics) push(p.id, `topic:${t}`, "topic");
    for (const r of p.data.related) {
      if (ids.has(r.slug)) push(p.id, r.slug, "related");
    }
    for (const s of p.data.supersedes) {
      if (ids.has(s)) push(p.id, s, "supersedes");
    }
    if (p.data.supersededBy && ids.has(p.data.supersededBy)) {
      push(p.id, p.data.supersededBy, "superseded_by");
    }
    for (const m of (p.body ?? "").matchAll(INTERNAL)) {
      if (m[1] !== p.id && ids.has(m[1])) push(p.id, m[1], "mentions");
    }
  }

  return { nodes, edges };
}

/** Hue for a graph node, topics take the neon accent, posts a categorical hue. */
export function graphNodeHue(node: GraphNode): string {
  if (node.type === "topic") return "var(--accent)";
  const map: Record<string, string> = {
    guide: "var(--hue-cyan)",
    note: "var(--hue-slate)",
    devlog: "var(--hue-green)",
    essay: "var(--hue-violet)",
    lab: "var(--hue-gold)",
    reference: "var(--hue-rose)",
    review: "var(--accent)",
    tag: "var(--hue-slate)",
  };
  return map[node.type] ?? "var(--hue-slate)";
}

/** The literal hex per categorical hue, for emitting a self-contained graph.json. */
export function graphNodeColor(type: GraphNodeType): string {
  const map: Record<string, string> = {
    topic: "#9A7CFF",
    guide: "#6FA8D6",
    note: "#8B95A2",
    devlog: "#5FB58C",
    essay: "#9A8BD8",
    lab: "#C9A95E",
    reference: "#CF8497",
    review: "#9A7CFF",
    tag: "#8B95A2",
  };
  return map[type] ?? "#8B95A2";
}
