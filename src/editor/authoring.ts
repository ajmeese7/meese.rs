import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import { ASSETS_DIR, EditorError, validFile } from "./postStore.ts";

const exec = promisify(execFile);
const PRIVATE_REPO = "ajmeese7/meese-rs-authoring";
const status = new Map<
  string,
  { state: "pending" | "syncing" | "synced" | "error"; message?: string }
>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
let queue: Promise<void> = Promise.resolve();

async function git(...args: string[]): Promise<string> {
  try {
    const result = await exec("git", args, { cwd: process.cwd(), maxBuffer: 2_000_000 });
    return result.stdout.trim();
  } catch (error) {
    const detail = (error as { stderr?: string }).stderr?.trim();
    throw new EditorError(detail || (error as Error).message, 502);
  }
}

function originRepository(origin: string): string | null {
  const scp = origin.match(/^git@github\.com:([^/]+\/[^/]+)$/);
  if (scp) return scp[1].replace(/\.git$/, "");
  try {
    const url = new URL(origin);
    if (url.hostname !== "github.com" || !["https:", "ssh:"].includes(url.protocol)) return null;
    const path = url.pathname.replace(/^\//, "").replace(/\.git$/, "");
    return /^[^/]+\/[^/]+$/.test(path) ? path : null;
  } catch {
    return null;
  }
}

export async function privateAuthoring(): Promise<boolean> {
  if (process.env.CODESPACES !== "true" || process.env.GITHUB_REPOSITORY !== PRIVATE_REPO)
    return false;
  try {
    const origin = await git("remote", "get-url", "origin");
    return originRepository(origin)?.toLowerCase() === PRIVATE_REPO.toLowerCase();
  } catch {
    return false;
  }
}

export async function requirePrivateAuthoring(): Promise<void> {
  if (!(await privateAuthoring())) {
    throw new EditorError(
      "private authoring is available only in the private authoring Codespace",
      403,
    );
  }
}

async function syncOne(file: string): Promise<void> {
  await requirePrivateAuthoring();
  status.set(file, { state: "syncing" });
  const slug = file.slice(0, -4);
  const paths = [join("src/content/posts", file)];
  try {
    if ((await stat(join(ASSETS_DIR, slug))).isDirectory())
      paths.push(join("public/images/posts", slug));
  } catch {
    /* A post may have no assets. */
  }
  await git("add", "--", ...paths);
  const changed = await git("diff", "--cached", "--name-only", "--", ...paths);
  if (changed) {
    await git(
      "-c",
      "user.name=meese.rs authoring",
      "-c",
      "user.email=authoring@users.noreply.github.com",
      "commit",
      "--only",
      "-m",
      `Save ${slug} draft`,
      "--",
      ...paths,
    );
  }
  await git("push", "origin", "HEAD");
  status.set(file, { state: "synced" });
}

export function schedulePrivateSync(fileInput: unknown): void {
  const file = validFile(fileInput);
  if (timers.has(file)) clearTimeout(timers.get(file));
  status.set(file, { state: "pending" });
  timers.set(
    file,
    setTimeout(() => {
      timers.delete(file);
      void syncPrivate(file);
    }, 3000),
  );
}

export async function syncPrivate(
  fileInput: unknown,
): Promise<{ state: string; message?: string }> {
  const file = validFile(fileInput);
  if (timers.has(file)) clearTimeout(timers.get(file));
  timers.delete(file);
  const task = queue.then(() => syncOne(file));
  queue = task.catch(() => {});
  try {
    await task;
  } catch (error) {
    status.set(file, { state: "error", message: (error as Error).message });
  }
  return status.get(file) ?? { state: "error", message: "sync did not finish" };
}

export function privateSyncStatus(fileInput: unknown): { state: string; message?: string } {
  return status.get(validFile(fileInput)) ?? { state: "unknown" };
}
