import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Dependency-free frontmatter reader for the build scripts. It is NOT a general
 * YAML parser, it extracts exactly the fields validate-content and
 * generate-graph need (scalars, simple string lists, and the `related` list of
 * `{slug, reason}`), and ignores deeper nesting like the `review` block.
 */

export interface ParsedPost {
  id: string;
  file: string;
  raw: Record<string, unknown>;
  body: string;
  data: {
    title?: string;
    description?: string;
    type?: string;
    date?: string;
    updated?: string;
    draft: boolean;
    topics: string[];
    tags: string[];
    related: { slug: string }[];
    supersedes: string[];
    supersededBy?: string;
    externalUrl?: string;
  };
}

const POSTS_DIR = join(process.cwd(), "src", "content", "posts");

function unquote(v: string): string {
  const t = v.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1);
  }
  return t;
}

function getScalar(fm: string, key: string): string | undefined {
  const m = fm.match(new RegExp(`^${key}:[ \\t]*(.+)$`, "m"));
  return m ? unquote(m[1]) : undefined;
}

/** Lines like `key:\n  - a\n  - b` -> ["a","b"]. */
function getList(fm: string, key: string): string[] {
  const lines = fm.split("\n");
  const out: string[] = [];
  let inBlock = false;
  for (const line of lines) {
    if (!inBlock) {
      if (new RegExp(`^${key}:[ \\t]*$`).test(line)) inBlock = true;
      continue;
    }
    const item = line.match(/^\s+-\s+(.+)$/);
    if (item) {
      out.push(unquote(item[1]));
      continue;
    }
    if (/^\S/.test(line)) break; // dedent to a new top-level key
  }
  return out;
}

/** `related:` is a list of `- slug: x` (+ reason); pull the slugs. */
function getRelatedSlugs(fm: string): string[] {
  const lines = fm.split("\n");
  const out: string[] = [];
  let inBlock = false;
  for (const line of lines) {
    if (!inBlock) {
      if (/^related:[ \t]*$/.test(line)) inBlock = true;
      continue;
    }
    if (/^\S/.test(line)) break;
    const slug = line.match(/^\s+-?\s*slug:\s*(.+)$/);
    if (slug) out.push(unquote(slug[1]));
  }
  return out;
}

function parse(file: string, id: string): ParsedPost {
  const text = readFileSync(file, "utf8");
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const fm = m ? m[1] : "";
  const body = m ? m[2] : text;

  const draftRaw = getScalar(fm, "draft");
  const data: ParsedPost["data"] = {
    title: getScalar(fm, "title"),
    description: getScalar(fm, "description"),
    type: getScalar(fm, "type"),
    date: getScalar(fm, "date"),
    updated: getScalar(fm, "updated"),
    draft: draftRaw === "true",
    topics: getList(fm, "topics"),
    tags: getList(fm, "tags"),
    related: getRelatedSlugs(fm).map((slug) => ({ slug })),
    supersedes: getList(fm, "supersedes"),
    supersededBy: getScalar(fm, "supersededBy"),
    externalUrl: getScalar(fm, "externalUrl"),
  };

  return { id, file, raw: {}, body, data };
}

/** Load every post in src/content/posts (id = filename without extension). */
export function loadPosts(): ParsedPost[] {
  return readdirSync(POSTS_DIR)
    .filter((f) => /\.(md|mdx)$/.test(f))
    .map((f) => parse(join(POSTS_DIR, f), f.replace(/\.(md|mdx)$/, "")));
}
