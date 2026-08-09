import type { CSSProperties } from "react";
import { useCodeBlockEditorContext, type CodeBlockEditorProps } from "@mdxeditor/editor";

// Renders an MDX comment (folded into an `mdxcomment` code block by the editor
// integration) as a plain, flowing comment: /* and */ delimiters with the
// content wrapping like prose. Deliberately NOT a code block, no line numbers,
// no language chrome; it is a note to self, not article code.

const wrap: CSSProperties = {
  margin: "0.7rem 0",
  padding: "0.55rem 0.8rem",
  borderRadius: 6,
  background: "#f3f4f6",
  color: "#6b7280",
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "0.8rem",
  lineHeight: 1.55,
};
const delim: CSSProperties = { display: "block", userSelect: "none", opacity: 0.7 };
const area: CSSProperties = {
  display: "block",
  width: "100%",
  border: "none",
  background: "transparent",
  color: "inherit",
  font: "inherit",
  lineHeight: "inherit",
  resize: "none",
  padding: 0,
  margin: "0.1rem 0",
  overflow: "hidden",
  // fieldSizing auto-grows the textarea to its content (not yet in TS lib types).
  ...({ fieldSizing: "content" } as CSSProperties),
};

export function CommentBlock({ code }: CodeBlockEditorProps) {
  const { setCode } = useCodeBlockEditorContext();
  return (
    <div style={wrap} contentEditable={false}>
      <span style={delim}>{"/*"}</span>
      <textarea
        defaultValue={code}
        rows={Math.max(2, Math.ceil((code.length || 1) / 90))}
        spellCheck={false}
        onChange={(e) => setCode(e.target.value)}
        style={area}
      />
      <span style={delim}>{"*/"}</span>
    </div>
  );
}
