import "@mdxeditor/editor/style.css";
import "./editor.css";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { parseDocument } from "yaml";
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
  insertJsx$,
} from "@mdxeditor/editor";
import { CommentBlock } from "./CommentBlock.tsx";
import { CODE_LANGUAGES } from "./codeLanguages.ts";
import { softBreakPlugin } from "./softBreakPlugin.ts";

type PostPayload = { file: string; frontmatter: string; body: string; revision: string };
type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";
type NewPostForm = {
  title: string;
  slug: string;
  description: string;
  type: string;
  topics: string;
};
type SyncStatus = { state: string; message?: string };
type PublicationReview = {
  file: string;
  title: string;
  fingerprint: string;
  visibility: string;
  files: { path: string; kind: "post" | "image"; before?: string; after?: string; bytes: number }[];
  warnings: string[];
};

const KEY_STORAGE = "meese-editor-key";
const AUTOSAVE_DELAY_MS = 1000;
const INIT_SETTLE_MS = 600;
const TYPES = ["guide", "note", "devlog", "essay", "lab", "reference"];

function readKey(): string {
  const url = new URL(window.location.href);
  const fromUrl = url.searchParams.get("key");
  if (!fromUrl) return sessionStorage.getItem(KEY_STORAGE) ?? "";
  sessionStorage.setItem(KEY_STORAGE, fromUrl);
  url.searchParams.delete("key");
  window.history.replaceState(null, "", url.toString());
  return fromUrl;
}

async function getJson<T>(url: string, key: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { ...init?.headers, "x-editor-key": key },
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? `${response.status} ${response.statusText}`);
  return data;
}

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

function UploadFigure({ upload }: { upload: (file: File) => Promise<string> }) {
  const insertJsx = usePublisher(insertJsx$);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const onSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const alt = window.prompt("Describe the image for readers who cannot see it:");
    if (!alt?.trim()) {
      event.target.value = "";
      return;
    }
    setBusy(true);
    try {
      const src = await upload(file);
      insertJsx({
        kind: "flow",
        name: "Figure",
        props: { src, alt: alt.trim(), kind: "screenshot" },
      });
    } catch (error) {
      window.alert(`Upload failed: ${(error as Error).message}`);
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        onChange={onSelect}
        hidden
      />
      <Button
        title="Upload image and insert a figure"
        disabled={busy}
        onClick={() => input.current?.click()}
      >
        {busy ? "Uploading…" : "Figure"}
      </Button>
    </>
  );
}

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

function metadataOf(frontmatter: string): Record<string, unknown> {
  try {
    const data = parseDocument(frontmatter).toJS();
    return data && typeof data === "object" && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1] ?? "");
    reader.onerror = () => reject(new Error("image could not be read"));
    reader.readAsDataURL(file);
  });
}

function fitTitle(field: HTMLTextAreaElement | null): void {
  if (!field) return;
  field.style.height = "auto";
  field.style.height = `${field.scrollHeight + field.offsetHeight - field.clientHeight}px`;
}

export default function Editor() {
  const [key] = useState(readKey);
  const [files, setFiles] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [frontmatter, setFrontmatter] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("Loading posts…");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const [newPost, setNewPost] = useState<NewPostForm>({
    title: "",
    slug: "",
    description: "",
    type: "note",
    topics: "",
  });
  const [privateMode, setPrivateMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [review, setReview] = useState<PublicationReview | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [pullRequest, setPullRequest] = useState("");

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const currentRef = useRef<string | null>(null);
  const bodyRef = useRef("");
  const frontmatterRef = useRef("");
  const savedBodyRef = useRef("");
  const savedFrontmatterRef = useRef("");
  const revisionRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializingRef = useRef(false);
  const inFlightRef = useRef<Promise<boolean> | null>(null);

  const meta = useMemo(() => metadataOf(frontmatter), [frontmatter]);
  useLayoutEffect(() => fitTitle(titleRef.current), [current, preview, meta.title]);
  useEffect(() => {
    const onResize = () => fitTitle(titleRef.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isDirty = useCallback(
    () =>
      bodyRef.current !== savedBodyRef.current ||
      frontmatterRef.current !== savedFrontmatterRef.current,
    [],
  );

  const persist = useCallback(async (): Promise<boolean> => {
    if (inFlightRef.current) return inFlightRef.current;
    if (!currentRef.current || !isDirty()) return true;
    if (timerRef.current) clearTimeout(timerRef.current);
    const task = (async () => {
      while (currentRef.current && isDirty()) {
        const file = currentRef.current;
        const body = bodyRef.current;
        const fm = frontmatterRef.current;
        setSaveState("saving");
        try {
          const saved = await getJson<PostPayload>("/api/editor/save", key, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ file, frontmatter: fm, body, revision: revisionRef.current }),
          });
          revisionRef.current = saved.revision;
          savedBodyRef.current = body;
          savedFrontmatterRef.current = fm;
        } catch (error) {
          setSaveState("error");
          setMessage(`Save failed: ${(error as Error).message}`);
          return false;
        }
      }
      setSaveState("saved");
      setMessage("Saved to workspace");
      return true;
    })();
    inFlightRef.current = task;
    try {
      return await task;
    } finally {
      inFlightRef.current = null;
    }
  }, [isDirty, key]);

  const scheduleSave = useCallback(() => {
    setReview(null);
    setSaveState("dirty");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void persist();
    }, AUTOSAVE_DELAY_MS);
  }, [persist]);

  const setFrontmatterValue = useCallback(
    (value: string) => {
      frontmatterRef.current = value;
      setFrontmatter(value);
      if (value !== savedFrontmatterRef.current) scheduleSave();
    },
    [scheduleSave],
  );

  const updateField = useCallback(
    (field: string, value: unknown) => {
      const document = parseDocument(frontmatterRef.current);
      if (document.errors.length) {
        setMessage("Fix the YAML in Advanced metadata before editing fields.");
        return;
      }
      document.set(field, value);
      setFrontmatterValue(document.toString());
    },
    [setFrontmatterValue],
  );

  useEffect(() => {
    getJson<string[]>("/api/editor/posts", key)
      .then((list) => {
        setFiles(list);
        setMessage(`${list.length} posts`);
      })
      .catch((error) =>
        setMessage(
          `Could not open posts: ${error.message}. Open the /editor?key=… URL printed by the dev server.`,
        ),
      );
    getJson<{ privateAuthoring: boolean }>("/api/editor/config", key)
      .then((config) => setPrivateMode(config.privateAuthoring))
      .catch((error) => setMessage(`Could not check authoring mode: ${error.message}`));
  }, [key]);

  useEffect(() => {
    if (!privateMode || !current) return;
    const poll = () =>
      void getJson<SyncStatus>(`/api/editor/sync?file=${encodeURIComponent(current)}`, key)
        .then(setSyncStatus)
        .catch((error) => setSyncStatus({ state: "error", message: error.message }));
    poll();
    const id = window.setInterval(poll, 5000);
    return () => window.clearInterval(id);
  }, [current, key, privateMode]);

  useEffect(() => {
    const flush = () => {
      if (!currentRef.current || !isDirty()) return;
      void fetch("/api/editor/save", {
        method: "POST",
        keepalive: true,
        headers: { "content-type": "application/json", "x-editor-key": key },
        body: JSON.stringify({
          file: currentRef.current,
          frontmatter: frontmatterRef.current,
          body: bodyRef.current,
          revision: revisionRef.current,
        }),
      });
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [isDirty, key]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (initTimerRef.current) clearTimeout(initTimerRef.current);
    },
    [],
  );

  const loadPost = useCallback((post: PostPayload) => {
    currentRef.current = post.file;
    bodyRef.current = post.body;
    frontmatterRef.current = post.frontmatter;
    savedBodyRef.current = post.body;
    savedFrontmatterRef.current = post.frontmatter;
    revisionRef.current = post.revision;
    setCurrent(post.file);
    setBody(post.body);
    setFrontmatter(post.frontmatter);
    setSaveState("saved");
    setMessage(`Editing ${post.file}`);
    setCreating(false);
    setPreview(false);
    setReview(null);
    setPullRequest("");
    setSyncStatus(null);
    initializingRef.current = true;
    if (initTimerRef.current) clearTimeout(initTimerRef.current);
    initTimerRef.current = setTimeout(() => {
      initializingRef.current = false;
    }, INIT_SETTLE_MS);
  }, []);

  const openFile = useCallback(
    async (file: string) => {
      if (file === currentRef.current && !creating) return;
      if (!(await persist())) return;
      try {
        setMessage(`Opening ${file}…`);
        loadPost(
          await getJson<PostPayload>(`/api/editor/post?file=${encodeURIComponent(file)}`, key),
        );
      } catch (error) {
        setMessage(`Failed to open ${file}: ${(error as Error).message}`);
      }
    },
    [creating, key, loadPost, persist],
  );

  const startNew = useCallback(async () => {
    if (!(await persist())) return;
    currentRef.current = null;
    setCurrent(null);
    setCreating(true);
    setPreview(false);
    setNewPost({ title: "", slug: "", description: "", type: "note", topics: "" });
    setSlugEdited(false);
  }, [persist]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const post = await getJson<PostPayload>("/api/editor/create", key, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...newPost,
          topics: newPost.topics
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });
      setFiles((previous) => [...previous, post.file].sort());
      loadPost(post);
    } catch (error) {
      setMessage(`Could not create post: ${(error as Error).message}`);
    }
  };

  const onBodyChange = useCallback(
    (markdown: string) => {
      bodyRef.current = markdown;
      if (initializingRef.current) {
        savedBodyRef.current = markdown;
        return;
      }
      if (markdown !== savedBodyRef.current) scheduleSave();
    },
    [scheduleSave],
  );

  const upload = useCallback(
    async (file: File): Promise<string> => {
      if (!currentRef.current) throw new Error("Open a post first");
      const slug = currentRef.current.replace(/\.mdx$/, "");
      const result = await getJson<{ src: string }>("/api/editor/asset", key, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, filename: file.name, base64: await fileToBase64(file) }),
      });
      return result.src;
    },
    [key],
  );

  const showPreview = async () => {
    if (preview) {
      setPreview(false);
      return;
    }
    if (await persist()) setPreview(true);
  };

  const syncNow = async () => {
    if (!current || !(await persist())) return;
    setSyncStatus({ state: "syncing" });
    try {
      const result = await getJson<SyncStatus>("/api/editor/sync", key, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ file: current }),
      });
      setSyncStatus(result);
      if (result.state === "error") setMessage(`Private sync failed: ${result.message}`);
    } catch (error) {
      setSyncStatus({ state: "error", message: (error as Error).message });
    }
  };

  const prepare = async () => {
    if (!current || !(await persist())) return;
    setPublishing(true);
    setMessage("Checking content and preparing public PR review…");
    try {
      setReview(
        await getJson<PublicationReview>("/api/editor/prepare", key, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ file: current }),
        }),
      );
      setMessage("Review the files below before opening the public PR.");
    } catch (error) {
      setMessage(`Cannot prepare PR: ${(error as Error).message}`);
    } finally {
      setPublishing(false);
    }
  };

  const publish = async () => {
    if (!review || !current) return;
    setPublishing(true);
    setMessage("Opening public pull request…");
    try {
      const result = await getJson<{ url: string }>("/api/editor/publish", key, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ file: current, fingerprint: review.fingerprint }),
      });
      setPullRequest(result.url);
      setReview(null);
      setMessage("Public PR opened. The site changes after that PR is merged.");
    } catch (error) {
      setMessage(`Could not open PR: ${(error as Error).message}`);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="editor-workspace">
      <aside className="editor-sidebar" aria-label="Posts">
        <div className="editor-sidebar__head">
          <strong>Posts</strong>
          <button type="button" onClick={startNew}>
            New post
          </button>
        </div>
        <div className="editor-post-list">
          {files.map((file) => (
            <button
              type="button"
              key={file}
              className={file === current ? "is-current" : ""}
              onClick={() => void openFile(file)}
            >
              {file.replace(/\.mdx$/, "")}
            </button>
          ))}
        </div>
      </aside>

      <div className="editor-main">
        <div className="editor-bar">
          <span className={`editor-save editor-save--${saveState}`} role="status">
            {saveState === "dirty"
              ? "Unsaved changes"
              : saveState === "saving"
                ? "Saving…"
                : saveState === "saved"
                  ? "Saved to workspace"
                  : saveState === "error"
                    ? "Save failed"
                    : ""}
          </span>
          <span className="editor-message">{message}</span>
          {current && (
            <div className="editor-bar__actions">
              {privateMode && (
                <span
                  className={`editor-sync editor-sync--${syncStatus?.state ?? "unknown"}`}
                  title={syncStatus?.message}
                >
                  Private: {syncStatus?.state ?? "unknown"}
                </span>
              )}
              {privateMode && (
                <button type="button" onClick={() => void syncNow()}>
                  Sync now
                </button>
              )}
              {privateMode && (
                <button type="button" disabled={publishing} onClick={() => void prepare()}>
                  Prepare public PR
                </button>
              )}
              {saveState === "error" && (
                <button type="button" onClick={() => void persist()}>
                  Retry save
                </button>
              )}
              <button type="button" onClick={() => void showPreview()}>
                {preview ? "Edit" : "Exact preview"}
              </button>
              <a href={`/posts/${current.replace(/\.mdx$/, "")}/`} target="_blank" rel="noreferrer">
                Open post ↗
              </a>
            </div>
          )}
        </div>

        {creating && (
          <form
            className="editor-new shell post post--solo"
            onSubmit={(event) => void create(event)}
          >
            <span className="sys-label">// new draft</span>
            <label>
              Title
              <input
                autoFocus
                required
                value={newPost.title}
                onChange={(event) => {
                  const title = event.target.value;
                  setNewPost((previous) => ({
                    ...previous,
                    title,
                    slug: slugEdited ? previous.slug : slugify(title),
                  }));
                }}
              />
            </label>
            <label>
              Slug
              <input
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                value={newPost.slug}
                onChange={(event) => {
                  setSlugEdited(true);
                  setNewPost((previous) => ({ ...previous, slug: event.target.value }));
                }}
              />
            </label>
            <label>
              Description
              <textarea
                required
                value={newPost.description}
                onChange={(event) =>
                  setNewPost((previous) => ({ ...previous, description: event.target.value }))
                }
              />
            </label>
            <div className="editor-new__row">
              <label>
                Type
                <select
                  value={newPost.type}
                  onChange={(event) =>
                    setNewPost((previous) => ({ ...previous, type: event.target.value }))
                  }
                >
                  {TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Topics, comma separated
                <input
                  value={newPost.topics}
                  onChange={(event) =>
                    setNewPost((previous) => ({ ...previous, topics: event.target.value }))
                  }
                />
              </label>
            </div>
            <button type="submit">Create draft</button>
          </form>
        )}

        {current && (
          <>
            {pullRequest && (
              <p className="editor-publication-link">
                Public pull request:{" "}
                <a href={pullRequest} target="_blank" rel="noreferrer">
                  {pullRequest}
                </a>
              </p>
            )}
            {review && (
              <section className="editor-review" aria-label="Public PR review">
                <h2>Review public PR</h2>
                <p>
                  This will make these files public as soon as the PR opens. The live site changes
                  after merge.
                </p>
                <p>
                  Visibility after merge: <strong>{review.visibility}</strong>
                </p>
                <ul>
                  {review.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
                <h3>Files to publish</h3>
                <ul>
                  {review.files.map((file) => (
                    <li key={file.path}>
                      {file.path} ({file.bytes.toLocaleString()} bytes)
                    </li>
                  ))}
                </ul>
                {review.files
                  .filter((file) => file.kind === "post")
                  .map((file) => (
                    <div className="editor-review__compare" key={file.path}>
                      <details>
                        <summary>Current public source</summary>
                        <pre>{file.before ?? "New post"}</pre>
                      </details>
                      <details open>
                        <summary>Proposed public source</summary>
                        <pre>{file.after}</pre>
                      </details>
                    </div>
                  ))}
                <div className="editor-review__actions">
                  <button type="button" disabled={publishing} onClick={() => setReview(null)}>
                    Cancel
                  </button>
                  <button type="button" disabled={publishing} onClick={() => void publish()}>
                    Open public PR
                  </button>
                </div>
              </section>
            )}
            {preview ? (
              <iframe
                className="editor-preview"
                title={`Preview of ${current}`}
                src={`/posts/${current.replace(/\.mdx$/, "")}/`}
              />
            ) : (
              <article className="shell post post--solo editor-article">
                <header className="post__header">
                  <div className="post__meta">
                    <span className="sys-label">
                      [ {String(meta.type ?? "POST").toUpperCase()} ]
                    </span>
                    <span className="post__meta-date">
                      {String(meta.date ?? "")} ·{" "}
                      {meta.draft ? "PRIVATE DRAFT" : "PUBLISHED SOURCE"}
                    </span>
                  </div>
                  <textarea
                    ref={titleRef}
                    className="post__title editor-title"
                    aria-label="Post title"
                    value={String(meta.title ?? "")}
                    onChange={(event) =>
                      updateField("title", event.target.value.replace(/\s*\r?\n\s*/g, " "))
                    }
                    rows={1}
                  />
                  <textarea
                    className="post__lead editor-lead"
                    aria-label="Post description"
                    value={String(meta.description ?? "")}
                    onChange={(event) => updateField("description", event.target.value)}
                    rows={2}
                  />
                  <div className="post__topics">
                    {(Array.isArray(meta.topics) ? meta.topics : []).map((topic) => (
                      <span className="tag" key={String(topic)}>
                        {String(topic)}
                      </span>
                    ))}
                  </div>
                </header>

                <details className="editor-metadata">
                  <summary>Post metadata</summary>
                  <div className="editor-metadata__grid">
                    <label>
                      Type
                      <select
                        value={String(meta.type ?? "note")}
                        onChange={(event) => updateField("type", event.target.value)}
                      >
                        {TYPES.map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Publication date
                      <input
                        type="date"
                        value={String(meta.date ?? "")}
                        onChange={(event) => updateField("date", event.target.value)}
                      />
                    </label>
                    <label>
                      Topics
                      <input
                        value={Array.isArray(meta.topics) ? meta.topics.join(", ") : ""}
                        onChange={(event) =>
                          updateField(
                            "topics",
                            event.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          )
                        }
                      />
                    </label>
                    <label>
                      Tags
                      <input
                        value={Array.isArray(meta.tags) ? meta.tags.join(", ") : ""}
                        onChange={(event) =>
                          updateField(
                            "tags",
                            event.target.value
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          )
                        }
                      />
                    </label>
                    <label className="editor-check">
                      <input
                        type="checkbox"
                        checked={meta.draft === true}
                        onChange={(event) => updateField("draft", event.target.checked)}
                      />{" "}
                      Draft
                    </label>
                    <label className="editor-check">
                      <input
                        type="checkbox"
                        checked={meta.unlisted === true}
                        onChange={(event) => updateField("unlisted", event.target.checked)}
                      />{" "}
                      Unlisted
                    </label>
                    <label className="editor-check">
                      <input
                        type="checkbox"
                        checked={meta.hideFromFeed === true}
                        onChange={(event) => updateField("hideFromFeed", event.target.checked)}
                      />{" "}
                      Hide from feed and newsletter
                    </label>
                  </div>
                  <details className="editor-raw">
                    <summary>Advanced YAML</summary>
                    <textarea
                      spellCheck={false}
                      value={frontmatter}
                      onChange={(event) => setFrontmatterValue(event.target.value)}
                    />
                  </details>
                </details>

                <div className="prose editor-prose">
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
                        autoLoadLanguageSupport: false,
                      }),
                      jsxPlugin({ jsxComponentDescriptors }),
                      markdownShortcutPlugin(),
                      softBreakPlugin(),
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
                            <UploadFigure upload={upload} />
                          </>
                        ),
                      }),
                    ]}
                  />
                </div>
              </article>
            )}
          </>
        )}
      </div>
    </div>
  );
}
