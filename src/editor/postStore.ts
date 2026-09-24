import { createHash, randomBytes } from "node:crypto";
import { constants } from "node:fs";
import { lstat, mkdir, open, readdir, rename, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { format, resolveConfig } from "prettier";
import { parseDocument, stringify } from "yaml";

export const POSTS_DIR = resolve("src/content/posts");
export const ASSETS_DIR = resolve("public/images/posts");
export const FILE_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*\.mdx$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const POST_TYPES = new Set(["guide", "note", "devlog", "essay", "lab", "reference"]);
const MAX_ASSET_BYTES = 8_000_000;

export class EditorError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export type PostPayload = {
  file: string;
  frontmatter: string;
  body: string;
  revision: string;
};

export type NewPost = {
  title: string;
  slug: string;
  description: string;
  type: string;
  topics: string[];
};

function revision(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function validFile(value: unknown): string {
  if (typeof value !== "string" || !FILE_RE.test(value)) {
    throw new EditorError("invalid post filename");
  }
  return value;
}

export function splitPost(raw: string): { frontmatter: string; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) throw new EditorError("post has no frontmatter");
  return {
    frontmatter: match[1],
    body: raw.slice(match[0].length).replace(/^\s*\n/, ""),
  };
}

const SINGLE_COMMENT = /^\s*\{\/\*\s?(.*?)\s?\*\/\}\s*$/;
const COMMENT_BLOCK = /```mdxcomment\r?\n([\s\S]*?)\r?\n```/g;

export function commentsToCodeBlock(body: string): string {
  const lines = body.split("\n");
  const result: string[] = [];
  for (let i = 0; i < lines.length; ) {
    if (!SINGLE_COMMENT.test(lines[i])) {
      result.push(lines[i++]);
      continue;
    }
    const comments: string[] = [];
    while (i < lines.length) {
      const match = lines[i].match(SINGLE_COMMENT);
      if (!match) break;
      comments.push(match[1].trim());
      i++;
    }
    result.push("```mdxcomment", comments.filter(Boolean).join(" "), "```");
  }
  return result.join("\n");
}

function wrapComment(value: string): string {
  const lines: string[] = [];
  let current = "";
  for (const word of value.trim().split(/\s+/).filter(Boolean)) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && candidate.length + "{/*  */}".length > 100) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.map((line) => `{/* ${line} */}`).join("\n");
}

export function codeBlockToComments(body: string): string {
  return body.replace(COMMENT_BLOCK, (_full, content: string) =>
    wrapComment(
      content
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join(" "),
    ),
  );
}

export function validateFrontmatter(raw: string): Record<string, unknown> {
  const document = parseDocument(raw);
  if (document.errors.length) throw new EditorError(`invalid YAML: ${document.errors[0].message}`);
  const data = document.toJS();
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new EditorError("frontmatter must be a YAML object");
  }
  const fields = data as Record<string, unknown>;
  for (const field of ["title", "description"]) {
    if (typeof fields[field] !== "string" || !fields[field].trim()) {
      throw new EditorError(`${field} is required`);
    }
  }
  if (typeof fields.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fields.date)) {
    throw new EditorError("date must be YYYY-MM-DD");
  }
  const parsedDate = new Date(`${fields.date}T00:00:00Z`);
  if (Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== fields.date) {
    throw new EditorError("date is invalid");
  }
  if (typeof fields.type !== "string" || !POST_TYPES.has(fields.type)) {
    throw new EditorError("invalid post type");
  }
  for (const field of ["topics", "tags"]) {
    if (
      fields[field] !== undefined &&
      (!Array.isArray(fields[field]) ||
        !(fields[field] as unknown[]).every((v) => typeof v === "string"))
    ) {
      throw new EditorError(`${field} must be a list of strings`);
    }
  }
  for (const field of ["draft", "unlisted", "hideFromFeed", "featured", "pinned"]) {
    if (fields[field] !== undefined && typeof fields[field] !== "boolean") {
      throw new EditorError(`${field} must be true or false`);
    }
  }
  return fields;
}

async function formattedPost(frontmatter: string, body: string, path: string): Promise<string> {
  validateFrontmatter(frontmatter);
  const combined = `---\n${frontmatter.trim()}\n---\n\n${codeBlockToComments(body).trim()}\n`;
  const config = await resolveConfig(path);
  return format(combined, { ...config, filepath: path });
}

async function readRegular(path: string): Promise<string> {
  let handle;
  try {
    handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    const stat = await handle.stat();
    if (!stat.isFile()) throw new EditorError("post is not a regular file");
    return await handle.readFile("utf8");
  } finally {
    await handle?.close();
  }
}

export async function listPosts(postsDir = POSTS_DIR): Promise<string[]> {
  return (await readdir(postsDir)).filter((name) => FILE_RE.test(name)).sort();
}

export async function readPost(file: unknown, postsDir = POSTS_DIR): Promise<PostPayload> {
  const name = validFile(file);
  const raw = await readRegular(join(postsDir, name));
  const parts = splitPost(raw);
  return {
    file: name,
    frontmatter: parts.frontmatter,
    body: commentsToCodeBlock(parts.body),
    revision: revision(raw),
  };
}

export async function createPost(input: NewPost, postsDir = POSTS_DIR): Promise<PostPayload> {
  if (!input || typeof input !== "object") throw new EditorError("post details are required");
  if (typeof input.slug !== "string" || !SLUG_RE.test(input.slug)) {
    throw new EditorError("slug must use lowercase words separated by hyphens");
  }
  if (!Array.isArray(input.topics) || !input.topics.every((topic) => typeof topic === "string")) {
    throw new EditorError("topics must be a list of strings");
  }
  const file = `${input.slug}.mdx`;
  const frontmatter = stringify({
    title: input.title,
    description: input.description,
    date: new Date().toISOString().slice(0, 10),
    type: input.type,
    topics: input.topics,
    tags: [],
    draft: true,
  }).trim();
  const path = join(postsDir, file);
  const formatted = await formattedPost(frontmatter, "", path);
  try {
    await writeFile(path, formatted, { encoding: "utf8", flag: "wx" });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new EditorError("a post with that slug already exists", 409);
    }
    throw error;
  }
  return readPost(file, postsDir);
}

const pending = new Map<string, Promise<void>>();

async function locked<T>(key: string, task: () => Promise<T>): Promise<T> {
  const previous = pending.get(key) ?? Promise.resolve();
  let release!: () => void;
  const next = new Promise<void>((resolve) => {
    release = resolve;
  });
  const queued = previous.then(() => next);
  pending.set(key, queued);
  await previous;
  try {
    return await task();
  } finally {
    release();
    if (pending.get(key) === queued) pending.delete(key);
  }
}

export async function savePost(
  input: { file: unknown; frontmatter: unknown; body: unknown; revision: unknown },
  postsDir = POSTS_DIR,
): Promise<PostPayload> {
  const file = validFile(input.file);
  if (typeof input.frontmatter !== "string" || typeof input.body !== "string") {
    throw new EditorError("frontmatter and body must be text");
  }
  if (typeof input.revision !== "string" || !/^[a-f0-9]{64}$/.test(input.revision)) {
    throw new EditorError("post revision is required");
  }
  return locked(join(postsDir, file), async () => {
    const path = join(postsDir, file);
    const current = await readRegular(path);
    if (revision(current) !== input.revision) {
      throw new EditorError("this post changed elsewhere; reload before saving", 409);
    }
    const formatted = await formattedPost(input.frontmatter as string, input.body as string, path);
    const temp = join(postsDir, `.${file}.${randomBytes(8).toString("hex")}.tmp`);
    try {
      await writeFile(temp, formatted, { encoding: "utf8", flag: "wx" });
      if (revision(await readRegular(path)) !== input.revision) {
        throw new EditorError("this post changed elsewhere; reload before saving", 409);
      }
      await rename(temp, path);
    } finally {
      await rm(temp, { force: true });
    }
    return readPost(file, postsDir);
  });
}

export async function saveAsset(
  slug: unknown,
  filename: unknown,
  base64: unknown,
  assetsDir = ASSETS_DIR,
): Promise<{ src: string }> {
  if (typeof slug !== "string" || !SLUG_RE.test(slug)) throw new EditorError("invalid post slug");
  if (typeof filename !== "string" || !/^[\w.-]+\.(png|jpe?g|webp|avif)$/i.test(filename)) {
    throw new EditorError("upload a PNG, JPEG, WebP, or AVIF image");
  }
  if (typeof base64 !== "string" || base64.length > MAX_ASSET_BYTES * 1.4) {
    throw new EditorError("image is too large");
  }
  const buffer = Buffer.from(base64, "base64");
  if (buffer.length > MAX_ASSET_BYTES) throw new EditorError("image is too large");
  const sharp = (await import("sharp")).default;
  let output: Buffer;
  try {
    output = await sharp(buffer, { limitInputPixels: 40_000_000 })
      .rotate()
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    throw new EditorError("image could not be decoded");
  }
  const basename = filename
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-");
  const name = `${basename || "image"}.webp`;
  const dir = join(assetsDir, slug);
  await mkdir(dir, { recursive: true });
  if (!(await lstat(dir)).isDirectory()) throw new EditorError("image directory is not regular");
  try {
    await writeFile(join(dir, name), output, { flag: "wx" });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new EditorError("an image with that name already exists", 409);
    }
    throw error;
  }
  return { src: `/images/posts/${slug}/${name}` };
}
