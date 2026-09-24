import type { AstroIntegration } from "astro";
import type { IncomingMessage, ServerResponse } from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";
import {
  createPost,
  EditorError,
  listPosts,
  readPost,
  saveAsset,
  savePost,
  type NewPost,
} from "../editor/postStore.ts";
import {
  privateAuthoring,
  privateSyncStatus,
  schedulePrivateSync,
  syncPrivate,
} from "../editor/authoring.ts";
import { openPublicPr, preparePublicPr } from "../editor/publication.ts";

const MAX_POST_BYTES = 1_000_000;
const MAX_ASSET_REQUEST_BYTES = 11_000_000;

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req: IncomingMessage, limit: number): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > limit) throw new EditorError("request body is too large", 413);
    chunks.push(chunk as Buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new EditorError("request must contain valid JSON");
  }
}

function sameOrigin(req: IncomingMessage): boolean {
  const site = req.headers["sec-fetch-site"];
  if (typeof site === "string") return site === "same-origin";
  const origin = req.headers.origin;
  if (typeof origin !== "string") return true;
  return origin === `http://${req.headers.host}` || origin === `https://${req.headers.host}`;
}

function hasKey(req: IncomingMessage, expected: string): boolean {
  const value = req.headers["x-editor-key"];
  if (typeof value !== "string") return false;
  const actual = Buffer.from(value);
  const secret = Buffer.from(expected);
  return actual.length === secret.length && timingSafeEqual(actual, secret);
}

function hasSession(req: IncomingMessage, expected: string): boolean {
  const cookie = req.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("meese_editor="))
    ?.slice("meese_editor=".length);
  if (!cookie) return false;
  const actual = Buffer.from(cookie);
  const secret = Buffer.from(expected);
  return actual.length === secret.length && timingSafeEqual(actual, secret);
}

export default function editor(): AstroIntegration {
  const configuredKey = process.env.MEESE_EDITOR_KEY;
  if (configuredKey && !/^[a-f0-9]{48}$/.test(configuredKey))
    throw new Error("MEESE_EDITOR_KEY must be a 48-character lowercase hex key");
  const key = configuredKey ?? randomBytes(24).toString("hex");
  return {
    name: "meese-editor",
    hooks: {
      "astro:server:start": () => {
        console.info(`\n  meese-editor  open /editor?key=${key}\n`);
      },
      "astro:config:setup": ({ command, injectRoute, updateConfig }) => {
        if (command !== "dev") return;
        injectRoute({
          pattern: "/editor",
          entrypoint: "./src/editor/EditorPage.astro",
          prerender: false,
        });
        updateConfig({
          vite: {
            plugins: [
              {
                name: "meese-private-preview-gate",
                enforce: "pre",
                configureServer(server) {
                  const privatePreview = process.env.CODESPACES === "true";
                  server.middlewares.use((req, res, next) => {
                    if (!privatePreview) return next();
                    const url = new URL(req.url ?? "/", "http://localhost");
                    if (url.pathname === "/editor" && url.searchParams.get("key") === key) {
                      res.writeHead(302, {
                        location: "/editor",
                        "set-cookie": `meese_editor=${key}; HttpOnly; Secure; SameSite=Lax; Path=/`,
                        "cache-control": "no-store",
                      });
                      return res.end();
                    }
                    if (!hasSession(req, key) && !hasKey(req, key)) {
                      res.writeHead(403, {
                        "content-type": "text/plain",
                        "cache-control": "no-store",
                      });
                      return res.end(
                        "Private editor session required. Open the editor URL printed by the dev server.",
                      );
                    }
                    next();
                  });
                },
              },
            ],
          },
        });
      },
      "astro:server:setup": ({ server }) => {
        const privateMode = privateAuthoring();
        server.middlewares.use(async (req, res, next) => {
          const url = new URL(req.url ?? "/", "http://localhost");
          if (!url.pathname.startsWith("/api/editor/")) return next();
          if (!sameOrigin(req))
            return sendJson(res, 403, { error: "cross-origin request rejected" });
          if (!hasKey(req, key) && !((await privateMode) && hasSession(req, key))) {
            return sendJson(res, 403, { error: "missing or invalid editor key" });
          }

          try {
            if (req.method === "GET" && url.pathname === "/api/editor/posts") {
              return sendJson(res, 200, await listPosts());
            }
            if (req.method === "GET" && url.pathname === "/api/editor/post") {
              return sendJson(res, 200, await readPost(url.searchParams.get("file")));
            }
            if (req.method === "GET" && url.pathname === "/api/editor/config") {
              return sendJson(res, 200, { privateAuthoring: await privateAuthoring() });
            }
            if (req.method === "GET" && url.pathname === "/api/editor/sync") {
              return sendJson(res, 200, privateSyncStatus(url.searchParams.get("file")));
            }
            if (req.method === "POST" && url.pathname === "/api/editor/create") {
              const input = await readJsonBody(req, MAX_POST_BYTES);
              const post = await createPost(input as NewPost);
              if (await privateAuthoring()) schedulePrivateSync(post.file);
              return sendJson(res, 201, post);
            }
            if (req.method === "POST" && url.pathname === "/api/editor/save") {
              const input = await readJsonBody(req, MAX_POST_BYTES);
              const post = await savePost(input as Parameters<typeof savePost>[0]);
              if (await privateAuthoring()) schedulePrivateSync(post.file);
              return sendJson(res, 200, post);
            }
            if (req.method === "POST" && url.pathname === "/api/editor/asset") {
              const input = (await readJsonBody(req, MAX_ASSET_REQUEST_BYTES)) as {
                slug?: unknown;
                filename?: unknown;
                base64?: unknown;
              };
              const asset = await saveAsset(input.slug, input.filename, input.base64);
              if (await privateAuthoring()) schedulePrivateSync(`${input.slug}.mdx`);
              return sendJson(res, 201, asset);
            }
            if (req.method === "POST" && url.pathname === "/api/editor/sync") {
              const input = (await readJsonBody(req, 10_000)) as { file?: unknown };
              return sendJson(res, 200, await syncPrivate(input.file));
            }
            if (req.method === "POST" && url.pathname === "/api/editor/prepare") {
              const input = (await readJsonBody(req, 10_000)) as { file?: unknown };
              return sendJson(res, 200, await preparePublicPr(input.file));
            }
            if (req.method === "POST" && url.pathname === "/api/editor/publish") {
              const input = (await readJsonBody(req, 10_000)) as {
                file?: unknown;
                fingerprint?: unknown;
              };
              return sendJson(res, 201, await openPublicPr(input.file, input.fingerprint));
            }
            return sendJson(res, 404, { error: "unknown editor endpoint" });
          } catch (error) {
            const status = error instanceof EditorError ? error.status : 500;
            const message = error instanceof Error ? error.message : "editor request failed";
            return sendJson(res, status, { error: message });
          }
        });
      },
    },
  };
}
