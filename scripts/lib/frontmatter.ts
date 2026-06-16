import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

/**
 * Frontmatter reader for the build scripts. Astro's Zod schema enforces field
 * types at build; this pulls the handful of fields validate-content and
 * generate-graph need (cross-file relationships and integrity checks) without
 * spinning up the whole content layer. Parsing is delegated to `yaml`, so
 * anything valid YAML (multiline scalars, wrapped strings) reads correctly.
 */

export interface ParsedPost {
  id: string;
  file: string;
  body: string;
  data: {
    title?: string;
    description?: string;
    type?: string;
    date?: string;
    updated?: string;
    draft: boolean;
    unlisted: boolean;
    topics: string[];
    tags: string[];
    related: { slug: string }[];
    supersedes: string[];
    supersededBy?: string;
    externalUrl?: string;
  };
}

const POSTS_DIR = join(process.cwd(), "src", "content", "posts");
const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

/** Coerce a scalar to a trimmed string, or undefined when absent. */
function str(v: unknown): string | undefined {
  return v == null ? undefined : String(v).trim();
}

/** Coerce a YAML list of strings, dropping anything non-scalar. */
function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.map(str).filter((s): s is string => !!s) : [];
}

function parse(file: string, id: string): ParsedPost {
  const text = readFileSync(file, "utf8");
  const m = text.match(FRONTMATTER);
  const body = m ? m[2] : text;
  const fm = (m ? parseYaml(m[1]) : null) ?? {};

  const related = Array.isArray(fm.related)
    ? fm.related
        .map((r: unknown) =>
          r && typeof r === "object" ? str((r as { slug?: unknown }).slug) : undefined,
        )
        .filter((slug: string | undefined): slug is string => !!slug)
        .map((slug: string) => ({ slug }))
    : [];

  const data: ParsedPost["data"] = {
    title: str(fm.title),
    description: str(fm.description),
    type: str(fm.type),
    date: str(fm.date),
    updated: str(fm.updated),
    draft: fm.draft === true,
    unlisted: fm.unlisted === true,
    topics: strList(fm.topics),
    tags: strList(fm.tags),
    related,
    supersedes: strList(fm.supersedes),
    supersededBy: str(fm.supersededBy),
    externalUrl: str(fm.externalUrl),
  };

  return { id, file, body, data };
}

/** Load every post in src/content/posts (id = filename without extension). */
export function loadPosts(): ParsedPost[] {
  return readdirSync(POSTS_DIR)
    .filter((f) => /\.(md|mdx)$/.test(f))
    .map((f) => parse(join(POSTS_DIR, f), f.replace(/\.(md|mdx)$/, "")));
}
