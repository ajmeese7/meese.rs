import { realmPlugin, addImportVisitor$ } from "@mdxeditor/editor";

// Minimal shapes of the mdast text node and the visitor actions this plugin
// touches. `pubIn` erases the visitor's declared type, and @types/mdast is not a
// direct dep that pnpm resolves transitively, so declare them locally (as
// astro.config.mjs does for hast).
interface MdastText {
  type: "text";
  value: string;
}

interface VisitorActions {
  nextVisitor(): void;
}

// Prettier hard-wraps the posts at 100 columns, and MDXEditor's default text
// visitor copies each mdast `text` value into a Lexical text node verbatim,
// newlines included. Lexical's contenteditable is `white-space: pre-wrap` and
// must stay that way (under `normal` the browser collapses a just-typed space at
// a text-node boundary and Lexical then drops it from the model, which made a
// space unaddable after an inline format such as `_word_`), so every wrapped
// source line would render as a hard line break.
//
// A soft break is a space per CommonMark, so collapse it here on the way in:
// this covers prose, list items, table cells and JSX children alike, while real
// hard breaks (`break` nodes) and code have their own visitors and are
// untouched. Delegating to the default visitor afterwards keeps the formatting
// and style context handling in one place. Prettier re-wraps on save.
export const softBreakPlugin = realmPlugin({
  init(realm) {
    realm.pubIn({
      [addImportVisitor$]: {
        testNode: "text",
        priority: 1,
        visitNode({ mdastNode, actions }: { mdastNode: MdastText; actions: VisitorActions }) {
          mdastNode.value = mdastNode.value.replace(/\n/g, " ");
          actions.nextVisitor();
        },
      },
    });
  },
});
