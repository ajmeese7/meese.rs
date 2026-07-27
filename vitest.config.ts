import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

// Two suites with genuinely different needs, so they run as separate projects.
//
// `worker` runs inside workerd against real bindings (real D1, real rate
// limiter), so it exercises the same runtime production does rather than a
// stand-in for it. See test/resend-stub.ts for the outbound-email double.
//
// `src` runs in plain node and covers the pure build-time helpers. That is why
// those live in leaf modules that never import `astro:content`: the content
// layer only resolves inside an Astro build.
export default defineConfig({
  test: {
    projects: [
      {
        plugins: [cloudflareTest({ wrangler: { configPath: "./wrangler.jsonc" } })],
        test: {
          name: "worker",
          include: ["worker/**/*.test.ts"],
          globalSetup: ["./test/resend-stub.ts"],
          // One stub server serves the whole run, so files can't send to it
          // concurrently without reading each other's mail. It takes seconds.
          fileParallelism: false,
        },
      },
      {
        test: {
          name: "src",
          include: ["src/**/*.test.ts"],
          environment: "node",
        },
      },
    ],
  },
});
