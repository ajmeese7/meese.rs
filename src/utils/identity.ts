/**
 * Who owns this site, and how that relates to meese.dev.
 *
 * The two properties serve different purposes and describe themselves
 * differently, but they are run by one person. Schema.org models that as
 * separate node types, so this emits both: one `Person`, referenced from both
 * sites by the same `@id`, and a `WebSite` per property with its own name and
 * description. A crawler merges the person into one entity without treating
 * the sites as interchangeable.
 *
 * The `@id` is a meese.dev URL because the portfolio is the canonical page
 * about Aaron. This site is the canonical page about his writing.
 *
 * meese.dev emits a Person node that must match this one exactly. Changing
 * PERSON_ID, PERSON_NAME, PERSON_URL, or SAME_AS here without making the same
 * change there splits the entity back into two.
 */
export const SITE_NAME = "meese.rs";

export const SITE_DESCRIPTION =
  "Field notes from a builder, practical writing on software, AI/devtools, and systems-building.";

export const PERSON_ID = "https://meese.dev/#person";
export const PERSON_NAME = "Aaron Meese";
export const PERSON_URL = "https://meese.dev/";

/** Every profile and property that is the same person. Order is part of the contract. */
export const SAME_AS = [
  "https://meese.dev",
  "https://meese.rs",
  "https://github.com/ajmeese7",
  "https://www.linkedin.com/in/aaronmeese/",
  "https://x.com/ajmeese7",
] as const;

export function personNode() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: PERSON_NAME,
    url: PERSON_URL,
    sameAs: [...SAME_AS],
  };
}

/** This site as its own entity, authored by the shared person. */
export function websiteNode(site: URL) {
  return {
    "@type": "WebSite",
    "@id": new URL("#website", site).href,
    url: site.href,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    author: { "@id": PERSON_ID },
    publisher: { "@id": PERSON_ID },
  };
}

export function siteGraph(site: URL) {
  return {
    "@context": "https://schema.org",
    "@graph": [websiteNode(site), personNode()],
  };
}
