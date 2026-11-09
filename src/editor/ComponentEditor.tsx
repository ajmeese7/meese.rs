import { useEffect, useRef, useState } from "react";
import { GenericJsxEditor, type JsxEditorProps } from "@mdxeditor/editor";
import { componentPreviewUrl, previewProps } from "./componentPreview";

export function ComponentEditor(props: JsxEditorProps) {
  const { mdastNode, descriptor } = props;
  const iframe = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(180);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const values = previewProps(mdastNode.attributes);
  // A slot needs the surrounding MDX, so keep its nested editor visible.
  const hasChildren = mdastNode.children.length > 0 || descriptor.hasChildren === true;
  const src = !hasChildren && values ? componentPreviewUrl(mdastNode.name, values) : null;

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);
  useEffect(() => {
    const frame = iframe.current;
    if (!loaded || !frame?.contentDocument) return;
    const content = frame.contentDocument.querySelector<HTMLElement>("[data-component-preview]");
    if (!content) {
      setFailed(true);
      return;
    }
    const resize = () => setHeight(Math.ceil(content.getBoundingClientRect().height) + 2);
    const observer = new ResizeObserver(resize);
    observer.observe(content);
    resize();
    const root = document.documentElement;
    const theme = () => {
      if (frame.contentDocument)
        frame.contentDocument.documentElement.dataset.theme = root.dataset.theme;
    };
    const themeObserver = new MutationObserver(theme);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    theme();
    return () => {
      observer.disconnect();
      themeObserver.disconnect();
    };
  }, [loaded, src]);

  return (
    <div className="editor-component" contentEditable={false}>
      {src && !failed ? (
        <iframe
          ref={iframe}
          className="editor-component__preview"
          title={`${mdastNode.name} inline preview`}
          src={src}
          style={{ height }}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      ) : !hasChildren ? (
        <p className="editor-component__fallback">
          {mdastNode.name}:{" "}
          {failed ? "Preview could not load." : "Use Exact preview to see computed properties."}
        </p>
      ) : null}
      {hasChildren ? (
        <GenericJsxEditor {...props} descriptor={{ ...descriptor, props: [], hasChildren: true }} />
      ) : null}
    </div>
  );
}
