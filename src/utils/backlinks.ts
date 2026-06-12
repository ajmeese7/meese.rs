import type { Post } from "./posts";

export interface Backlinks {
  /** Manual frontmatter relations, with the author's reason. */
  related: { post: Post; reason: string }[];
  /** Posts whose body links to this one, or that supersede/are superseded. */
  mentionedBy: Post[];
  /** More in a shared topic (capped, ranked by shared-topic overlap). */
  sameTopic: Post[];
}

const INTERNAL_LINK = /\/posts\/([a-z0-9-]+)\/?/gi;

/** Slugs this post's body links to (internal /posts/<slug> references). */
function outboundLinks(post: Post): Set<string> {
  const out = new Set<string>();
  const body = post.body ?? "";
  for (const m of body.matchAll(INTERNAL_LINK)) out.add(m[1]);
  return out;
}

/**
 * Build-time backlinks for one post (SPEC §25). Sources, in priority order:
 * manual relations, then direct internal-link / supersede mentions, then
 * "more in this topic". Kept useful, not exhaustive, no AI-inferred links.
 */
export function getBacklinks(post: Post, all: Post[]): Backlinks {
  const others = all.filter((p) => p.id !== post.id);
  const seen = new Set<string>([post.id]);

  const related: Backlinks["related"] = [];
  for (const r of post.data.related) {
    const target = others.find((p) => p.id === r.slug);
    if (target && !seen.has(target.id)) {
      related.push({ post: target, reason: r.reason });
      seen.add(target.id);
    }
  }

  const mentionedBy: Post[] = [];
  for (const other of others) {
    if (seen.has(other.id)) continue;
    const links = outboundLinks(other);
    const mentions =
      links.has(post.id) ||
      other.data.supersedes.includes(post.id) ||
      other.data.supersededBy === post.id ||
      post.data.supersededBy === other.id ||
      post.data.supersedes.includes(other.id);
    if (mentions) {
      mentionedBy.push(other);
      seen.add(other.id);
    }
  }

  const sameTopic = others
    .filter((p) => !seen.has(p.id))
    .map((p) => ({
      post: p,
      shared: p.data.topics.filter((t) => post.data.topics.includes(t)).length,
    }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || +b.post.data.date - +a.post.data.date)
    .slice(0, 4)
    .map((x) => x.post);

  return { related, mentionedBy, sameTopic };
}
