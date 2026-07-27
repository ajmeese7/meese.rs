import { describe, expect, it } from "vitest";
import { personNode, siteGraph, websiteNode, PERSON_ID } from "./identity";

const SITE = new URL("https://meese.rs");

describe("personNode", () => {
  // meese.dev emits this same object. If this test needs updating, the change
  // has to land in both repos in the same breath or the shared entity splits
  // into two half-populated people.
  it("is the exact node meese.dev must also emit", () => {
    // Arrange / Act
    const person = personNode();

    // Assert
    expect(person).toEqual({
      "@type": "Person",
      "@id": "https://meese.dev/#person",
      name: "Aaron Meese",
      url: "https://meese.dev/",
      sameAs: [
        "https://meese.dev",
        "https://meese.rs",
        "https://github.com/ajmeese7",
        "https://www.linkedin.com/in/aaronmeese/",
        "https://x.com/ajmeese7",
      ],
    });
  });

  it("claims both properties as the same person", () => {
    // Arrange / Act
    const { sameAs } = personNode();

    // Assert
    expect(sameAs).toContain("https://meese.rs");
    expect(sameAs).toContain("https://meese.dev");
  });
});

describe("websiteNode", () => {
  it("is its own entity, distinct from the person and from meese.dev", () => {
    // Arrange / Act
    const site = websiteNode(SITE);

    // Assert
    expect(site["@id"]).toBe("https://meese.rs/#website");
    expect(site["@id"]).not.toBe(PERSON_ID);
    expect(site.name).toBe("meese.rs");
  });

  it("credits the shared person by reference rather than restating them", () => {
    // Arrange / Act
    const site = websiteNode(SITE);

    // Assert
    expect(site.author).toEqual({ "@id": PERSON_ID });
    expect(site.publisher).toEqual({ "@id": PERSON_ID });
  });
});

describe("siteGraph", () => {
  it("emits one website and one person, and nothing else", () => {
    // Arrange / Act
    const graph = siteGraph(SITE);

    // Assert
    expect(graph["@context"]).toBe("https://schema.org");
    expect(graph["@graph"].map((n) => n["@type"])).toEqual(["WebSite", "Person"]);
  });
});
