import "@mdxeditor/editor/style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MDXEditor,
  type JsxComponentDescriptor,
  GenericJsxEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  markdownShortcutPlugin,
  jsxPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CreateLink,
  ListsToggle,
  BlockTypeSelect,
  CodeToggle,
  InsertCodeBlock,
  Separator,
  Button,
  usePublisher,
  insertCodeBlock$,
} from "@mdxeditor/editor";
import { CommentBlock } from "./CommentBlock.tsx";
import { CODE_LANGUAGES } from "./codeLanguages.ts";

// Toolbar button that drops in a new MDX comment (a note to self). It inserts
// an empty `mdxcomment` block, which CommentBlock renders as a flowing comment
// and the integration saves back as `{/* ... */}`.
function InsertComment() {
  const insertCodeBlock = usePublisher(insertCodeBlock$);
  return (
    <Button
      title="Insert comment"
      onClick={() => insertCodeBlock({ language: "mdxcomment", code: "" })}
    >
      {"/* */"}
    </Button>
  );
}

// Every custom MDX component needs a descriptor or MDXEditor errors on unknown
// JSX. Only `Callout` wraps children in the posts; everything else is a
// self-closing widget. GenericJsxEditor renders them as opaque, labeled blocks
// and preserves the underlying JSX node on save (the spike verifies that claim).
const jsxComponentDescriptors: JsxComponentDescriptor[] = [
  {
    name: "Callout",
    kind: "flow",
    hasChildren: true,
    props: [
      { name: "type", type: "string" },
      { name: "title", type: "string" },
    ],
    Editor: GenericJsxEditor,
  },
  {
    name: "Figure",
    kind: "flow",
    hasChildren: false,
    props: [
      { name: "src", type: "string" },
      { name: "alt", type: "string" },
      { name: "caption", type: "string" },
      { name: "kind", type: "string" },
    ],
    Editor: GenericJsxEditor,
  },
  {
    name: "CodeCaption",
    kind: "flow",
    hasChildren: false,
    props: [{ name: "title", type: "string" }],
    Editor: GenericJsxEditor,
  },
  ...[
    "Aside",
    "BoundaryLayer",
    "DampingCurve",
    "DemoFrame",
    "DragSplit",
    "OrientationWidget",
    "RelayFlow",
    "ReynoldsRegime",
    "SpeciesChart",
    "WindCalculator",
    "WindSandbox",
  ].map(
    (name): JsxComponentDescriptor => ({
      name,
      kind: "flow",
      hasChildren: false,
      props: [],
      Editor: GenericJsxEditor,
    }),
  ),
];

type PostPayload = { file: string; frontmatter: string; body: string };
type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

// How long to wait after the last keystroke before autosaving. Long enough to
// coalesce a burst of typing, short enough that a preview tab feels live.
const AUTOSAVE_DELAY_MS = 1000;

// On load MDXEditor emits its own re-serialized markdown (different wrapping
// than the raw file), which must NOT count as an edit. Adopt whatever it emits
// during this window after opening a post as the clean baseline.
const INIT_SETTLE_MS = 600;

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `${res.status} ${res.statusText}`);
  return data;
}

export default function Editor() {
  const [files, setFiles] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [frontmatter, setFrontmatter] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("Loading posts...");
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Working copy and last-persisted snapshot, kept in refs so the debounced
  // saver reads live values without stale closures or extra re-renders.
  const currentRef = useRef<string | null>(null);
  const bodyRef = useRef("");
  const frontmatterRef = useRef("");
  const savedBodyRef = useRef("");
  const savedFrontmatterRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializingRef = useRef(false);
  const initTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDirty = useCallback(
    () =>
      bodyRef.current !== savedBodyRef.current ||
      frontmatterRef.current !== savedFrontmatterRef.current,
    [],
  );

  // Persist the working copy. Never writes editor content back (that would reset
  // the cursor mid-edit); the file on disk is prettier-canonical regardless.
  const persist = useCallback(async (): Promise<void> => {
    const file = currentRef.current;
    if (!file || !isDirty()) return;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const body = bodyRef.current;
    const frontmatter = frontmatterRef.current;
    setSaveState("saving");
    try {
      await getJson<PostPayload>("/api/editor/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ file, frontmatter, body }),
      });
      savedBodyRef.current = body;
      savedFrontmatterRef.current = frontmatter;
      setSaveState(isDirty() ? "dirty" : "saved");
    } catch (err) {
      setSaveState("error");
      setMessage(`Save failed: ${(err as Error).message}`);
    }
  }, [isDirty]);

  const scheduleSave = useCallback(() => {
    setSaveState("dirty");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void persist();
    }, AUTOSAVE_DELAY_MS);
  }, [persist]);

  useEffect(() => {
    getJson<string[]>("/api/editor/posts")
      .then((list) => {
        setFiles(list);
        setMessage(`${list.length} posts.`);
      })
      .catch((err) => setMessage(`Failed to list posts: ${err.message}`));
  }, []);

  // Last-ditch flush if the tab closes with unsaved changes.
  useEffect(() => {
    const flush = () => {
      const file = currentRef.current;
      if (!file || !isDirty()) return;
      navigator.sendBeacon(
        "/api/editor/save",
        new Blob(
          [
            JSON.stringify({
              file,
              frontmatter: frontmatterRef.current,
              body: bodyRef.current,
            }),
          ],
          { type: "application/json" },
        ),
      );
    };
    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, [isDirty]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (initTimerRef.current) clearTimeout(initTimerRef.current);
    },
    [],
  );

  const openFile = useCallback(
    async (file: string) => {
      if (file === currentRef.current) return;
      // Flush the outgoing post before loading the next one: switching articles
      // must never silently drop edits.
      await persist();
      setMessage(`Opening ${file}...`);
      try {
        const post = await getJson<PostPayload>(
          `/api/editor/post?file=${encodeURIComponent(file)}`,
        );
        currentRef.current = post.file;
        bodyRef.current = post.body;
        frontmatterRef.current = post.frontmatter;
        savedBodyRef.current = post.body;
        savedFrontmatterRef.current = post.frontmatter;
        setCurrent(post.file);
        setBody(post.body);
        setFrontmatter(post.frontmatter);
        setSaveState("saved");
        setMessage(`Editing ${file}`);
        // Absorb MDXEditor's initial re-serialization as the baseline.
        initializingRef.current = true;
        if (initTimerRef.current) clearTimeout(initTimerRef.current);
        initTimerRef.current = setTimeout(() => {
          initializingRef.current = false;
        }, INIT_SETTLE_MS);
      } catch (err) {
        setMessage(`Failed to open ${file}: ${(err as Error).message}`);
      }
    },
    [persist],
  );

  const onBodyChange = useCallback(
    (md: string) => {
      bodyRef.current = md;
      // During the settle window, adopt the editor's serialization as baseline
      // rather than treating it as a change.
      if (initializingRef.current) {
        savedBodyRef.current = md;
        return;
      }
      if (md !== savedBodyRef.current) scheduleSave();
    },
    [scheduleSave],
  );

  const onFrontmatterChange = useCallback(
    (value: string) => {
      frontmatterRef.current = value;
      setFrontmatter(value);
      if (value !== savedFrontmatterRef.current) scheduleSave();
    },
    [scheduleSave],
  );

  const saveLabel: Record<SaveState, string> = {
    idle: "",
    dirty: "Unsaved changes",
    saving: "Saving...",
    saved: "Saved",
    error: "Save failed",
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside
        style={{
          width: 260,
          borderRight: "1px solid #ddd",
          overflowY: "auto",
          padding: "0.5rem",
        }}
      >
        <strong style={{ display: "block", padding: "0.5rem" }}>Posts</strong>
        {files.map((file) => (
          <button
            key={file}
            onClick={() => openFile(file)}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "0.4rem 0.5rem",
              border: "none",
              background: file === current ? "#eef" : "transparent",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            {file}
          </button>
        ))}
      </aside>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "0.5rem 1rem",
            borderBottom: "1px solid #ddd",
          }}
        >
          <span
            style={{
              fontSize: "0.85rem",
              fontWeight: 500,
              color: saveState === "error" ? "#b00" : saveState === "dirty" ? "#a60" : "#2a7",
            }}
          >
            {saveLabel[saveState]}
          </span>
          <span style={{ fontSize: "0.85rem", color: "#777" }}>{message}</span>
        </header>

        {current && (
          <>
            <details style={{ borderBottom: "1px solid #eee" }}>
              <summary style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
                Frontmatter (raw)
              </summary>
              <textarea
                value={frontmatter}
                onChange={(e) => onFrontmatterChange(e.target.value)}
                spellCheck={false}
                style={{
                  width: "100%",
                  minHeight: 160,
                  border: "none",
                  padding: "0.5rem 1rem",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: "0.8rem",
                  boxSizing: "border-box",
                }}
              />
            </details>

            <div style={{ flex: 1, overflowY: "auto" }}>
              <MDXEditor
                key={current}
                markdown={body}
                onChange={onBodyChange}
                plugins={[
                  headingsPlugin(),
                  listsPlugin(),
                  quotePlugin(),
                  thematicBreakPlugin(),
                  linkPlugin(),
                  linkDialogPlugin(),
                  tablePlugin(),
                  codeBlockPlugin({
                    defaultCodeBlockLanguage: "",
                    codeBlockEditorDescriptors: [
                      {
                        priority: 100,
                        match: (lang) => lang === "mdxcomment",
                        Editor: CommentBlock,
                      },
                    ],
                  }),
                  codeMirrorPlugin({
                    codeBlockLanguages: CODE_LANGUAGES,
                    // All supported grammars are declared explicitly, so skip the
                    // dynamic auto-load (it was flaky under Vite and left unlisted
                    // languages like graphql attempting a failing import). Unlisted
                    // languages simply render plain.
                    autoLoadLanguageSupport: false,
                  }),
                  jsxPlugin({ jsxComponentDescriptors }),
                  markdownShortcutPlugin(),
                  toolbarPlugin({
                    toolbarContents: () => (
                      <>
                        <UndoRedo />
                        <Separator />
                        <BoldItalicUnderlineToggles />
                        <CodeToggle />
                        <Separator />
                        <ListsToggle />
                        <BlockTypeSelect />
                        <Separator />
                        <CreateLink />
                        <InsertCodeBlock />
                        <InsertComment />
                      </>
                    ),
                  }),
                ]}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
