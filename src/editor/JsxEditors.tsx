import type { CSSProperties } from "react";
import {
  NestedLexicalEditor,
  useMdastNodeUpdater,
  type JsxEditorProps,
  type MdastJsx,
} from "@mdxeditor/editor";

// Custom prop panels for the two components that appear in prose flow. They
// replace MDXEditor's generic fallback block with typed controls (a `type`
// dropdown, a `title` field, ...) and, for Callout, an inline rich-text editor
// for its children. Every other custom component keeps the generic opaque block.

type Attributes = MdastJsx["attributes"];

const isNamed = (attr: Attributes[number], name: string): boolean =>
  attr.type === "mdxJsxAttribute" && attr.name === name;

function readAttr(attributes: Attributes, name: string): string {
  const attr = attributes.find((a) => isNamed(a, name));
  return attr && attr.type === "mdxJsxAttribute" && typeof attr.value === "string"
    ? attr.value
    : "";
}

// Immutable attribute update that preserves author order (prettier keeps
// attribute order, so reordering would show as a diff). Empty value drops the
// attribute so optional props like `title` don't serialize as `title=""`.
function setAttr(attributes: Attributes, name: string, value: string): Attributes {
  if (value === "") return attributes.filter((a) => !isNamed(a, name));
  if (attributes.some((a) => isNamed(a, name))) {
    return attributes.map((a) => (isNamed(a, name) ? { ...a, value } : a));
  }
  return [...attributes, { type: "mdxJsxAttribute", name, value }];
}

const CALLOUT_TYPES = ["note", "tip", "warning", "danger", "context"];
const FIGURE_KINDS = ["screenshot", "diagram", "chart"];

const panel: CSSProperties = {
  border: "1px solid #d3d3de",
  borderRadius: 6,
  padding: "0.5rem 0.75rem",
  margin: "0.6rem 0",
  background: "#fafaff",
};
const head: CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  alignItems: "flex-end",
  flexWrap: "wrap",
};
const tag: CSSProperties = {
  fontFamily: "ui-monospace, monospace",
  fontSize: "0.7rem",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#66a",
  fontWeight: 600,
};
const field: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  fontSize: "0.7rem",
  color: "#666",
  gap: 2,
};

export function CalloutEditor({ mdastNode }: JsxEditorProps) {
  const update = useMdastNodeUpdater<MdastJsx>();
  const attrs = mdastNode.attributes;
  return (
    <div style={panel}>
      <div style={head}>
        <span style={tag}>Callout</span>
        <label style={field}>
          type
          <select
            value={readAttr(attrs, "type") || "note"}
            onChange={(e) => update({ attributes: setAttr(attrs, "type", e.target.value) })}
          >
            {CALLOUT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label style={{ ...field, flex: 1, minWidth: 160 }}>
          title
          <input
            value={readAttr(attrs, "title")}
            placeholder="(optional)"
            onChange={(e) => update({ attributes: setAttr(attrs, "title", e.target.value) })}
          />
        </label>
      </div>
      <NestedLexicalEditor<MdastJsx>
        block
        getContent={(node) => node.children}
        getUpdatedMdastNode={(node, children) => ({ ...node, children }) as MdastJsx}
      />
    </div>
  );
}

export function FigureEditor({ mdastNode }: JsxEditorProps) {
  const update = useMdastNodeUpdater<MdastJsx>();
  const attrs = mdastNode.attributes;
  const textField = (name: string, placeholder?: string) => (
    <label style={{ ...field, flex: 1, minWidth: 140 }}>
      {name}
      <input
        value={readAttr(attrs, name)}
        placeholder={placeholder}
        onChange={(e) => update({ attributes: setAttr(attrs, name, e.target.value) })}
      />
    </label>
  );
  return (
    <div style={panel}>
      <div style={head}>
        <span style={tag}>Figure</span>
        <label style={field}>
          kind
          <select
            value={readAttr(attrs, "kind") || "diagram"}
            onChange={(e) => update({ attributes: setAttr(attrs, "kind", e.target.value) })}
          >
            {FIGURE_KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
        {textField("src", "(optional)")}
        {textField("alt")}
        {textField("caption", "(optional)")}
      </div>
    </div>
  );
}
