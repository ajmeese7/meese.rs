import { describe, expect, it } from "vitest";
import { buildCatalog, CATALOG_VERSION, type CatalogPost } from "./catalog";

const SITE = new URL("https://meese.rs");

function post(id: string, data: Partial<CatalogPost["data"]> = {}): CatalogPost {
  return {
    id,
    data: {
      title: `Title for ${id}`,
      description: `Description for ${id}`,
      date: new Date("2026-06-11T00:00:00.000Z"),
      type: "devlog",
      topics: ["astro"],
      tags: ["mdx"],
      ...data,
    },
  };
}

describe("buildCatalog", () => {
  it("carries the contract's version and count", () => {
    // Arrange
    const posts = [post("one"), post("two")];

    // Act
    const catalog = buildCatalog(posts, SITE);

    // Assert
    expect(catalog.version).toBe(CATALOG_VERSION);
    expect(catalog.count).toBe(2);
    expect(catalog.count).toBe(catalog.items.length);
    expect(catalog.site).toBe("https://meese.rs/");
  });

  it("emits every field a consumer needs, and no post body", () => {
    // Arrange
    const posts = [
      post("backlinks-at-build-time", {
        title: "Backlinks at build time",
        description: "How the backlink pass works.",
        date: new Date("2026-05-02T00:00:00.000Z"),
        type: "note",
        topics: ["astro", "publishing"],
        tags: ["mdx"],
      }),
    ];

    // Act
    const [item] = buildCatalog(posts, SITE).items;

    // Assert
    expect(item).toEqual({
      slug: "backlinks-at-build-time",
      title: "Backlinks at build time",
      description: "How the backlink pass works.",
      url: "https://meese.rs/posts/backlinks-at-build-time/",
      date: "2026-05-02T00:00:00.000Z",
      type: "note",
      topics: ["astro", "publishing"],
      tags: ["mdx"],
    });
  });

  it("includes repo when a post declares one", () => {
    // Arrange
    const posts = [post("local-llms-benchmark", { repo: "https://github.com/ajmeese7/local-llms" })];

    // Act
    const [item] = buildCatalog(posts, SITE).items;

    // Assert
    expect(item.repo).toBe("https://github.com/ajmeese7/local-llms");
  });

  it("omits the repo key entirely when a post declares none", () => {
    // Arrange
    const posts = [post("no-repo")];

    // Act
    const [item] = buildCatalog(posts, SITE).items;

    // Assert
    expect(item).not.toHaveProperty("repo");
  });

  it("points at externalUrl when the writing lives elsewhere", () => {
    // Arrange
    const posts = [post("elsewhere", { externalUrl: "https://example.com/the-real-post" })];

    // Act
    const [item] = buildCatalog(posts, SITE).items;

    // Assert
    expect(item.url).toBe("https://example.com/the-real-post");
  });

  it("returns a valid empty catalog when there are no posts", () => {
    // Arrange
    const posts: CatalogPost[] = [];

    // Act
    const catalog = buildCatalog(posts, SITE);

    // Assert
    expect(catalog).toEqual({
      version: CATALOG_VERSION,
      site: "https://meese.rs/",
      count: 0,
      items: [],
    });
  });

  it("survives a JSON round trip, which is how consumers actually read it", () => {
    // Arrange
    const posts = [post("one", { repo: "https://github.com/ajmeese7/meese.rs" })];

    // Act
    const parsed = JSON.parse(JSON.stringify(buildCatalog(posts, SITE)));

    // Assert
    expect(parsed).toEqual(buildCatalog(posts, SITE));
  });
});
