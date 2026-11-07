import { useLayoutEffect, useRef, useState } from "react";
import {
  activeEditor$,
  addComposerChild$,
  applyFormat$,
  currentSelection$,
  iconComponentFor$,
  linkDialogState$,
  openLinkEditDialog$,
  readOnly$,
  realmPlugin,
  useCellValues,
  usePublisher,
} from "@mdxeditor/editor";

// Supplying this enables Lexical's built-in paste-URL-over-selection behavior.
export function isLinkUrl(value: string): boolean {
  if (!value || /\s/.test(value)) return false;
  // Keep internal links and email/phone links usable in the link dialog too.
  if (/^(?:\/(?!\/)|\.{1,2}\/|#)/.test(value)) return true;
  try {
    const url = new URL(value);
    return (
      (["http:", "https:"].includes(url.protocol) && Boolean(url.hostname)) ||
      (["mailto:", "tel:"].includes(url.protocol) && Boolean(url.pathname))
    );
  } catch {
    return false;
  }
}

const formats = [
  { format: "bold", label: "Bold", icon: "format_bold" },
  { format: "italic", label: "Italic", icon: "format_italic" },
  { format: "underline", label: "Underline", icon: "format_underlined" },
  { format: "strikethrough", label: "Strikethrough", icon: "strikeThrough" },
  { format: "code", label: "Inline code", icon: "code" },
] as const;

function SelectionToolbar() {
  const [editor, selection, linkDialog, readOnly, icon] = useCellValues(
    activeEditor$,
    currentSelection$,
    linkDialogState$,
    readOnly$,
    iconComponentFor$,
  );
  const applyFormat = usePublisher(applyFormat$);
  const openLink = usePublisher(openLinkEditDialog$);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const dismissedRef = useRef(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const visible = position !== null;

  useLayoutEffect(() => {
    if (!editor || readOnly || linkDialog.type === "edit") {
      setPosition(null);
      return;
    }
    let frame = 0;
    const update = () => {
      const root = editor.getRootElement();
      const domSelection = window.getSelection();
      if (
        dismissedRef.current ||
        !root ||
        !domSelection?.rangeCount ||
        domSelection.isCollapsed ||
        !domSelection.toString().trim() ||
        !root.contains(domSelection.anchorNode) ||
        !root.contains(domSelection.focusNode) ||
        (!root.contains(document.activeElement) &&
          !toolbarRef.current?.contains(document.activeElement))
      ) {
        setPosition(null);
        return;
      }

      const viewport = window.visualViewport;
      const viewportTop = viewport?.offsetTop ?? 0;
      const viewportLeft = viewport?.offsetLeft ?? 0;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
      const headerBottom =
        document.querySelector(".site-header")?.getBoundingClientRect().bottom ?? 0;
      const topEdge = Math.max(viewportTop, headerBottom) + 8;
      const rectangles = Array.from(domSelection.getRangeAt(0).getClientRects());
      const rect = rectangles.find(
        (candidate) =>
          candidate.width > 0 && candidate.bottom > topEdge && candidate.top < viewportBottom,
      );
      if (!rect) {
        setPosition(null);
        return;
      }
      const width = toolbarRef.current?.offsetWidth ?? 256;
      const height = toolbarRef.current?.offsetHeight ?? 44;
      const above = rect.top - height - 8;
      const top = above >= topEdge ? above : Math.max(topEdge, rect.bottom + 8);
      setPosition({
        top: Math.min(top, viewportBottom - height - 8),
        left: Math.max(
          viewportLeft + 8,
          Math.min(
            rect.left + rect.width / 2 - width / 2,
            viewportLeft + viewportWidth - width - 8,
          ),
        ),
      });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const onSelection = () => {
      dismissedRef.current = false;
      schedule();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      dismissedRef.current = true;
      setPosition(null);
    };
    document.addEventListener("selectionchange", onSelection);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", schedule);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    const unregister = editor.registerUpdateListener(schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      unregister();
      document.removeEventListener("selectionchange", onSelection);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", schedule);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
    };
  }, [editor, readOnly, linkDialog.type, visible]);

  if (!position || !selection || selection.isCollapsed()) return null;
  return (
    <div
      ref={toolbarRef}
      className="editor-selection-toolbar"
      role="toolbar"
      aria-label="Format selected text"
      aria-orientation="horizontal"
      style={position}
      onPointerDown={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        const buttons = Array.from(event.currentTarget.querySelectorAll("button"));
        const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (event.key === "Escape") editor?.focus();
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        buttons[
          (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length
        ]?.focus();
      }}
    >
      {formats.map(({ format, label, icon: name }) => (
        <button
          key={format}
          type="button"
          title={label}
          aria-label={label}
          aria-pressed={selection.hasFormat(format)}
          onClick={() => applyFormat(format)}
        >
          {icon(name)}
        </button>
      ))}
      <span className="editor-selection-toolbar__separator" aria-hidden="true" />
      <button type="button" title="Create link" aria-label="Create link" onClick={() => openLink()}>
        {icon("link")}
      </button>
    </div>
  );
}

export const selectionToolbarPlugin = realmPlugin({
  init(realm) {
    realm.pub(addComposerChild$, SelectionToolbar);
  },
});
