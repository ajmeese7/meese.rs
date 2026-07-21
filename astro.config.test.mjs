// Self-check for the draft-link rehype pass in astro.config.mjs. Runs as the
// first half of `pnpm test`. (NODE_ENV defaults to non-prod, so the config's
// own draftSlugs scan stays empty; we pass an explicit set here.)
import assert from "node:assert/strict";
import config, { rehypeStripDraftLinks } from "./astro.config.mjs";

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

// The pass only runs if it's actually mounted on the processor. Astro's next
// major drops `rehypePlugins` on `mdx({...})` silently, and a config that
// stopped applying this would ship live links to unbuilt drafts rather than
// fail loudly, so assert the wiring and not just the walk.
const processor = config.markdown?.processor;
assert.equal(processor?.name, "unified", "markdown.processor must be unified()");
assert.ok(
  processor.options.rehypePlugins.some(
    (entry) => (Array.isArray(entry) ? entry[0] : entry) === rehypeStripDraftLinks,
  ),
  "rehypeStripDraftLinks is not mounted on markdown.processor",
);

console.log("ok: draft-link pass is mounted on markdown.processor");
