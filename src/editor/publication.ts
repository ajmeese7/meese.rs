import { createHash, randomBytes } from "node:crypto";
import { constants } from "node:fs";
import { open } from "node:fs/promises";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { requirePrivateAuthoring, syncPrivate } from "./authoring.ts";
import {
  EditorError,
  POSTS_DIR,
  ASSETS_DIR,
  splitPost,
  validFile,
  validateFrontmatter,
} from "./postStore.ts";

const exec = promisify(execFile);
const PUBLIC_REPO = "ajmeese7/meese.rs";
const API = `https://api.github.com/repos/${PUBLIC_REPO}`;
const MASTER = "master";
const IMAGE_RE = /\/images\/posts\/([a-z0-9-]+)\/([a-z0-9-]+\.webp)\b/g;

type GitHubFile = { content: string; encoding: string; sha: string };
type ReviewFile = {
  path: string;
  kind: "post" | "image";
  before?: string;
  after?: string;
  bytes: number;
};
type PublicationReview = {
  file: string;
  title: string;
  baseSha: string;
  fingerprint: string;
  files: ReviewFile[];
  warnings: string[];
  visibility: "listed" | "unlisted";
};

async function api<T>(path: string, init: RequestInit = {}, allow404 = false): Promise<T | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new EditorError("Codespace GitHub token is missing", 503);
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
      ...(init.body ? { "content-type": "application/json" } : {}),
    },
  });
  if (allow404 && response.status === 404) return null;
  if (!response.ok) {
    const message = ((await response.json().catch(() => ({}))) as { message?: string }).message;
    throw new EditorError(`GitHub ${response.status}: ${message ?? response.statusText}`, 502);
  }
  return response.json() as Promise<T>;
}

async function regularBuffer(path: string): Promise<Buffer> {
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    if (!(await handle.stat()).isFile()) throw new EditorError("publication file is not regular");
    return await handle.readFile();
  } finally {
    await handle.close();
  }
}

async function publicFile(path: string): Promise<GitHubFile | null> {
  const result = await api<GitHubFile>(`/contents/${path}?ref=${MASTER}`, {}, true);
  if (result && result.encoding !== "base64")
    throw new EditorError("unexpected GitHub file encoding", 502);
  return result;
}

async function checks(): Promise<void> {
  for (const [command, args] of [
    ["./node_modules/.bin/tsx", ["scripts/validate-content.ts"]],
    ["./node_modules/.bin/astro", ["check"]],
  ] as const) {
    try {
      await exec(command, args, { cwd: process.cwd(), timeout: 180_000, maxBuffer: 4_000_000 });
    } catch (error) {
      const details =
        (error as { stdout?: string; stderr?: string }).stderr ||
        (error as { stdout?: string }).stdout;
      throw new EditorError(
        `${args.join(" ")} failed: ${details?.trim() || (error as Error).message}`,
        422,
      );
    }
  }
}

async function snapshot(
  fileInput: unknown,
  runChecks: boolean,
): Promise<{ review: PublicationReview; contents: Map<string, Buffer> }> {
  await requirePrivateAuthoring();
  const file = validFile(fileInput);
  const slug = file.slice(0, -4);
  const post = await regularBuffer(join(POSTS_DIR, file));
  const raw = post.toString("utf8");
  const fields = validateFrontmatter(splitPost(raw).frontmatter);
  if (fields.draft === true) throw new EditorError("turn off Draft before preparing a public PR");
  if (runChecks) await checks();

  const title = String(fields.title);
  const contents = new Map<string, Buffer>([[`src/content/posts/${file}`, post]]);
  const referenced = [...raw.matchAll(IMAGE_RE)];
  for (const match of referenced) {
    if (match[1] !== slug)
      throw new EditorError(`image ${match[0]} must be stored under this post's slug`);
    const path = `public/images/posts/${slug}/${match[2]}`;
    if (!contents.has(path))
      contents.set(path, await regularBuffer(join(ASSETS_DIR, slug, match[2])));
  }

  const ref = await api<{ object: { sha: string } }>(`/git/ref/heads/${MASTER}`);
  if (!ref) throw new EditorError("public master branch is missing", 502);
  const files: ReviewFile[] = [];
  const fingerprint = createHash("sha256").update(ref.object.sha);
  for (const [path, bytes] of contents) {
    const existing = await publicFile(path);
    if (path !== `src/content/posts/${file}` && existing) {
      throw new EditorError(`public image already exists: ${path}`, 409);
    }
    const before = existing
      ? Buffer.from(existing.content.replace(/\s/g, ""), "base64").toString("utf8")
      : undefined;
    files.push({
      path,
      kind: path.endsWith(".mdx") ? "post" : "image",
      before,
      after: path.endsWith(".mdx") ? raw : undefined,
      bytes: bytes.length,
    });
    fingerprint.update(path).update(bytes);
    fingerprint.update(existing?.sha ?? "new");
  }
  const warnings: string[] = [];
  if (fields.unlisted === true)
    warnings.push(
      "This post will have a public URL but will be absent from feeds, search, listings, the graph, and the sitemap.",
    );
  else warnings.push("This post will be listed publicly after the PR is merged.");
  if (fields.hideFromFeed === true)
    warnings.push("This post is hidden from the main feed and newsletter.");
  if (files.every((item) => item.before === item.after)) {
    throw new EditorError("this post already matches the public source", 409);
  }
  return {
    review: {
      file,
      title,
      baseSha: ref.object.sha,
      fingerprint: fingerprint.digest("hex"),
      files,
      warnings,
      visibility: fields.unlisted === true ? "unlisted" : "listed",
    },
    contents,
  };
}

export async function preparePublicPr(file: unknown): Promise<PublicationReview> {
  return (await snapshot(file, true)).review;
}

export async function openPublicPr(
  file: unknown,
  reviewedFingerprint: unknown,
): Promise<{ url: string; branch: string }> {
  if (typeof reviewedFingerprint !== "string" || !/^[a-f0-9]{64}$/.test(reviewedFingerprint)) {
    throw new EditorError("a reviewed publication fingerprint is required");
  }
  const { review, contents } = await snapshot(file, true);
  if (review.fingerprint !== reviewedFingerprint) {
    throw new EditorError("post or public master changed since review; prepare again", 409);
  }
  const sync = await syncPrivate(review.file);
  if (sync.state !== "synced")
    throw new EditorError(`private sync failed: ${sync.message ?? "unknown error"}`, 502);
  const latest = await snapshot(review.file, false);
  if (latest.review.fingerprint !== reviewedFingerprint) {
    throw new EditorError("post or public master changed during private sync; prepare again", 409);
  }

  const slug = review.file.slice(0, -4);
  const branch = `editor/${slug}-${randomBytes(4).toString("hex")}`;
  await api("/git/refs", {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: review.baseSha }),
  });
  try {
    for (const [path, bytes] of contents) {
      const current = await publicFile(path);
      await api(`/contents/${path}`, {
        method: "PUT",
        body: JSON.stringify({
          message: `Update ${slug}`,
          content: bytes.toString("base64"),
          branch,
          ...(current ? { sha: current.sha } : {}),
        }),
      });
    }
    const pr = await api<{ html_url: string }>("/pulls", {
      method: "POST",
      body: JSON.stringify({
        title: review.title,
        head: branch,
        base: MASTER,
        body: `Post: \`${review.file}\`\n\nCreated from the private authoring editor. Review the content and checks before merging.`,
        draft: false,
      }),
    });
    if (!pr) throw new EditorError("GitHub did not return a pull request URL", 502);
    return { url: pr.html_url, branch };
  } catch (error) {
    throw new EditorError(
      `Public branch ${branch} was created but the PR did not finish: ${(error as Error).message}. Inspect https://github.com/${PUBLIC_REPO}/tree/${branch}`,
      502,
    );
  }
}
