import { describe, expect, it } from "vitest";
import { componentPreviewUrl, previewProps } from "./componentPreview";

describe("inline component properties", () => {
  it("renders string, boolean and JSON props without losing their types", () => {
    expect(
      previewProps([
        { type: "mdxJsxAttribute", name: "kind", value: "memory" },
        { type: "mdxJsxAttribute", name: "enabled", value: null },
        { type: "mdxJsxAttribute", name: "count", value: { value: "3" } },
        { type: "mdxJsxAttribute", name: "data", value: { value: '[{"label":"GPU","value":32}]' } },
      ]),
    ).toEqual({ kind: "memory", enabled: true, count: 3, data: [{ label: "GPU", value: 32 }] });
  });

  it("defers executable expressions and spreads to the exact post preview", () => {
    expect(
      previewProps([
        { type: "mdxJsxAttribute", name: "value", value: { value: "process.exit()" } },
      ]),
    ).toBeNull();
    expect(previewProps([{ type: "mdxJsxExpressionAttribute", value: "...props" }])).toBeNull();
  });

  it("keeps captions and URLs in a single encoded query parameter", () => {
    const props = { src: "/chart.svg?one=1&two=2", caption: 'A "quoted" chart #1 + 2' };
    const url = new URL(componentPreviewUrl("Figure", props), "http://example.test");
    expect(url.pathname).toBe("/editor/component");
    expect(url.searchParams.get("name")).toBe("Figure");
    expect(JSON.parse(url.searchParams.get("props")!)).toEqual(props);
    expect([...url.searchParams.keys()]).toEqual(["name", "props"]);
  });
});
