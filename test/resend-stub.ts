// A real HTTP server standing in for Resend and for the site's own feed.json,
// started once for the whole test run. The Worker talks to it over the network
// exactly as it talks to the real thing, so the send path under test is the
// production one rather than a substituted function.
//
// Tests drive it through the /__control routes: they run inside workerd and the
// server runs in Node, so HTTP is also how they configure it and read back what
// it received.
import { createServer, type IncomingMessage, type Server } from "node:http";

import { STUB_PORT } from "./stub-port";

interface SentEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}

interface State {
  sent: SentEmail[];
  feedItems: unknown[];
  // Number of upcoming send requests to reject, for exercising retries.
  failNextSends: number;
}

const state: State = { sent: [], feedItems: [], failNextSends: 0 };

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

async function handle(req: IncomingMessage): Promise<{ status: number; body: unknown }> {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");

  if (url.pathname === "/__control/reset") {
    state.sent = [];
    state.feedItems = [];
    state.failNextSends = 0;
    return { status: 200, body: { ok: true } };
  }
  if (url.pathname === "/__control/feed") {
    state.feedItems = JSON.parse(await readBody(req));
    return { status: 200, body: { ok: true } };
  }
  if (url.pathname === "/__control/fail") {
    state.failNextSends = Number(url.searchParams.get("count") ?? 1);
    return { status: 200, body: { ok: true } };
  }
  if (url.pathname === "/__control/sent") {
    return { status: 200, body: state.sent };
  }

  if (url.pathname === "/feed.json") {
    return { status: 200, body: { version: "https://jsonfeed.org/version/1.1", items: state.feedItems } };
  }

  // Resend surface. Both routes take the same email shape, batch as an array.
  if (url.pathname === "/emails" || url.pathname === "/emails/batch") {
    if (req.headers.authorization !== "Bearer test-key") {
      return { status: 401, body: { message: "missing or bad api key" } };
    }
    if (state.failNextSends > 0) {
      state.failNextSends -= 1;
      return { status: 500, body: { message: "simulated upstream failure" } };
    }
    const parsed = JSON.parse(await readBody(req));
    const emails: SentEmail[] = Array.isArray(parsed) ? parsed : [parsed];
    state.sent.push(...emails);
    return { status: 200, body: { data: emails.map((_, i) => ({ id: `stub-${state.sent.length + i}` })) } };
  }

  return { status: 404, body: { message: "no stub route" } };
}

let server: Server | undefined;

export async function setup(): Promise<void> {
  server = createServer((req, res) => {
    handle(req)
      .then(({ status, body }) => {
        res.writeHead(status, { "content-type": "application/json" });
        res.end(JSON.stringify(body));
      })
      .catch((err: unknown) => {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ message: String(err) }));
      });
  });
  await new Promise<void>((resolve) => server!.listen(STUB_PORT, "127.0.0.1", resolve));
}

export async function teardown(): Promise<void> {
  await new Promise<void>((resolve, reject) =>
    server ? server.close((err) => (err ? reject(err) : resolve())) : resolve(),
  );
}
