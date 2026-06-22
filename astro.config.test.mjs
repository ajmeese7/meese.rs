// Self-check for the draft-link rehype pass in astro.config.mjs.
// Run: node astro.config.test.mjs  (NODE_ENV defaults to non-prod, so the
// config's own draftSlugs scan stays empty; we pass an explicit set here.)
import assert from "node:assert/strict";
import { rehypeStripDraftLinks } from "./astro.config.mjs";

const link = (href, text) => ({
  type: "element",
  tagName: "a",
  properties: { href },
  children: [{ type: "text", value: text }],
});

const tree = {
  type: "root",
  children: [
    {
      type: "element",
      tagName: "p",
      children: [
        { type: "text", value: "see " },
        link("/posts/draft-one", "the draft"),
        { type: "text", value: " and " },
        link("/posts/published-one/", "the live one"),
        { type: "text", value: " and " },
        link("https://example.com", "outside"),
      ],
    },
  ],
};

rehypeStripDraftLinks(new Set(["draft-one"]))(tree);

const anchors = [];
const collect = (n) => {
  if (n.tagName === "a") anchors.push(n.properties.href);
  n.children?.forEach(collect);
};
collect(tree);

// Draft anchor unwrapped; published + external anchors survive.
assert.deepEqual(anchors.sort(), ["/posts/published-one/", "https://example.com"]);
// Draft link text is preserved as plain inline text.
const para = tree.children[0];
assert.ok(para.children.some((c) => c.type === "text" && c.value === "the draft"));

console.log("ok: draft links unwrapped, others preserved");
