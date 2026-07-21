import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

// Worker tests run inside workerd against real bindings (real D1, real rate
// limiter), so they exercise the same runtime production does rather than a
// stand-in for it. See test/resend-stub.ts for the outbound-email double.
export default defineConfig({
  plugins: [cloudflareTest({ wrangler: { configPath: "./wrangler.jsonc" } })],
  test: {
    include: ["worker/**/*.test.ts"],
    globalSetup: ["./test/resend-stub.ts"],
    // One stub server serves the whole run, so files can't send to it
    // concurrently without reading each other's mail. The suite takes seconds.
    fileParallelism: false,
  },
});
