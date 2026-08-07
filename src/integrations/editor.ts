import type { AstroIntegration } from "astro";
import type { IncomingMessage, ServerResponse } from "node:http";
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

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
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
  return {
    name: "meese-editor",
    hooks: {
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
          try {
            if (req.method === "GET" && url.pathname === "/api/editor/posts") {
              const files = (await readdir(POSTS_DIR)).filter((f) => FILE_RE.test(f));
              return sendJson(res, 200, files.sort());
            }
            if (req.method === "GET" && url.pathname === "/api/editor/post") {
              const file = validFile(url.searchParams.get("file"));
              const path = join(POSTS_DIR, file);
              const raw = await readFile(path, "utf8");
              // Serve prose unwrapped so the editor shows paragraphs flowing at
              // the reading width instead of echoing prettier's hard wrap as
              // line breaks. Save re-wraps with the repo config below.
              const config = await resolveConfig(path);
              const unwrapped = await format(raw, {
                ...config,
                filepath: path,
                proseWrap: "never",
              });
              return sendJson(res, 200, { file, ...splitPost(unwrapped) });
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
              const body = String(payload.body ?? "");
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
