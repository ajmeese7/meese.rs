import type { AstroIntegration } from "astro";
import type { IncomingMessage, ServerResponse } from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { format, resolveConfig } from "prettier";

// Dev-only visual MDX editor. Injects a `/editor` route and mounts a small file
// API on the Vite dev server. Both are gated to `astro dev`: the integration is
// only added to the config outside production (see astro.config.mjs) and the
// route is only injected under the `dev` command, so nothing here reaches the
// static Cloudflare build. See .local/mdx-visual-editor-proposal.md for why.

const POSTS_DIR = resolve("src/content/posts");
const FILE_RE = /^[a-z0-9-]+\.mdx?$/i;

// Frontmatter stays verbatim text (the editor only touches the body), so split
// on the first fenced block and keep the raw YAML untouched for round-tripping.
function splitPost(raw: string): { frontmatter: string; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { frontmatter: "", body: raw };
  return { frontmatter: m[1], body: raw.slice(m[0].length).replace(/^\s*\n/, "") };
}

// MDXEditor renders `{/* ... */}` with an inline widget that looks nothing like
// a comment (visible braces, per-line boxes) and flattens multi-line comments.
// So for the editor we fold a run of consecutive single-line MDX comments into
// one `mdxcomment` fenced block whose content is the fragments JOINED into one
// flowing line; CommentBlock.tsx renders it as a plain flowing comment. On save
// we convert it back to `{/* ... */}` (one comment per line, so a note stays a
// single `{/* ... */}` which prettier keeps on one line).
const SINGLE_COMMENT = /^\s*\{\/\*\s?(.*?)\s?\*\/\}\s*$/;
const COMMENT_BLOCK = /```mdxcomment\r?\n([\s\S]*?)\r?\n```/g;

function commentsToCodeBlock(body: string): string {
  const lines = body.split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    if (!SINGLE_COMMENT.test(lines[i])) {
      out.push(lines[i]);
      i++;
      continue;
    }
    const inners: string[] = [];
    while (i < lines.length) {
      const m = lines[i].match(SINGLE_COMMENT);
      if (!m) break;
      inners.push(m[1].trim());
      i++;
    }
    out.push("```mdxcomment", inners.filter(Boolean).join(" "), "```");
  }
  return out.join("\n");
}

// Prettier does not wrap `{/* */}` comments itself (a single long one stays on
// one line), so wrap the note here at the repo print width into one comment per
// line. The editor folds these back into one flowing note on load; this keeps
// the source git-readable and consistent with the 100-column prose. Idempotent.
const PRINT_WIDTH = 100;
const COMMENT_WRAPPER = "{/*  */}".length; // 8

function wrapComment(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && candidate.length + COMMENT_WRAPPER > PRINT_WIDTH) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.map((l) => `{/* ${l} */}`).join("\n");
}

function codeBlockToComments(body: string): string {
  return body.replace(COMMENT_BLOCK, (_full, content: string) => {
    const joined = content
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .join(" ");
    return wrapComment(joined);
  });
}

function validFile(name: unknown): string {
  if (typeof name !== "string" || !FILE_RE.test(name)) {
    throw new Error(`invalid post file: ${String(name)}`);
  }
  return name;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json" });
  res.end(payload);
}

// A save body is one post, a few KB at most. The cap is a backstop so a stray
// or hostile request can't buffer the dev server out of memory.
const MAX_BODY_BYTES = 1_000_000;

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY_BYTES) throw new Error("request body too large");
    chunks.push(chunk as Buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

// `/api/editor/save` takes a JSON body, which makes it a CORS *simple request*:
// no preflight, so without this check any page in any open tab could POST to it
// and silently rewrite a post file. CORS would hide the response from that page
// but not stop the write, and the edit would land in a file that later gets
// committed and deployed. Browsers state a request's provenance, so require
// same-origin and reject anything else.
function isSameOrigin(req: IncomingMessage): boolean {
  const site = req.headers["sec-fetch-site"];
  if (typeof site === "string") return site === "same-origin";
  // No Fetch Metadata means a non-browser client (curl, a script). Fall back to
  // Origin, which browsers do send on cross-origin writes; absent both, there is
  // no browser to be tricked.
  const origin = req.headers.origin;
  if (typeof origin !== "string") return true;
  return origin === `http://${req.headers.host}` || origin === `https://${req.headers.host}`;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

// `astro dev --host` binds every interface (deliberately, for LAN access to the
// dev site), and Vite's allowedHosts check permits any IP-literal Host header,
// so without a key this file API would be an unauthenticated read/write of the
// posts directory for every device that can reach the dev server. The key is
// never embedded in the page (anything served to the browser is served to the
// network too); it is printed to the dev-server console and passed once as
// `?key=`.
function hasKey(req: IncomingMessage, url: URL, key: string): boolean {
  const header = req.headers["x-editor-key"];
  if (typeof header === "string") return safeEqual(header, key);
  // `navigator.sendBeacon` (the unload flush) cannot set headers, so the key may
  // also ride in the query string.
  return safeEqual(url.searchParams.get("key") ?? "", key);
}

// Recombine, then hand the whole file to prettier so the committed output is
// prettier's canonical form (exactly what `format:check` enforces in CI). The
// editor's own serialization is a throwaway intermediate.
async function formatPost(frontmatter: string, body: string, path: string): Promise<string> {
  const recombined = `---\n${frontmatter.trim()}\n---\n\n${body.trim()}\n`;
  const config = await resolveConfig(path);
  return format(recombined, { ...config, filepath: path });
}

export default function editor(): AstroIntegration {
  // Fresh per dev-server start, so a key never outlives the session it was
  // printed for.
  const key = randomBytes(24).toString("hex");
  return {
    name: "meese-editor",
    hooks: {
      "astro:server:start": () => {
        console.info(`\n  meese-editor  open /editor?key=${key}\n`);
      },
      "astro:config:setup": ({ command, injectRoute }) => {
        if (command !== "dev") return;
        injectRoute({
          pattern: "/editor",
          entrypoint: "./src/editor/EditorPage.astro",
          prerender: false,
        });
      },
      "astro:server:setup": ({ server }) => {
        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url ?? "/", "http://localhost");
          if (!url.pathname.startsWith("/api/editor/")) return next();
          if (!isSameOrigin(req)) {
            return sendJson(res, 403, { error: "cross-origin request rejected" });
          }
          if (!hasKey(req, url, key)) {
            return sendJson(res, 403, { error: "missing or invalid editor key" });
          }
          try {
            if (req.method === "GET" && url.pathname === "/api/editor/posts") {
              const files = (await readdir(POSTS_DIR)).filter((f) => FILE_RE.test(f));
              return sendJson(res, 200, files.sort());
            }
            if (req.method === "GET" && url.pathname === "/api/editor/post") {
              const file = validFile(url.searchParams.get("file"));
              const raw = await readFile(join(POSTS_DIR, file), "utf8");
              const { frontmatter, body } = splitPost(raw);
              return sendJson(res, 200, {
                file,
                frontmatter,
                body: commentsToCodeBlock(body),
              });
            }
            if (req.method === "POST" && url.pathname === "/api/editor/save") {
              const payload = (await readJsonBody(req)) as {
                file?: unknown;
                frontmatter?: unknown;
                body?: unknown;
              };
              const file = validFile(payload.file);
              const path = join(POSTS_DIR, file);
              const frontmatter = String(payload.frontmatter ?? "");
              const body = codeBlockToComments(String(payload.body ?? ""));
              const formatted = await formatPost(frontmatter, body, path);
              await writeFile(path, formatted, "utf8");
              return sendJson(res, 200, { file, ...splitPost(formatted) });
            }
            return next();
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            return sendJson(res, 400, { error: message });
          }
        });
      },
    },
  };
}
