import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import sharp from "sharp";
import { parseDocument } from "yaml";
import { createPost, EditorError, readPost, saveAsset, savePost } from "./postStore";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "meese-editor-test-"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("post file operations", () => {
  it("creates a valid private draft and rejects duplicate slugs", async () => {
    const input = {
      title: "A new note",
      slug: "a-new-note",
      description: "A short lead.",
      type: "note",
      topics: ["astro"],
    };
    const post = await createPost(input, dir);
    expect(post.file).toBe("a-new-note.mdx");
    expect(post.frontmatter).toContain("draft: true");
    expect(post.frontmatter).toContain("title: A new note");
    await expect(createPost(input, dir)).rejects.toMatchObject({ status: 409 });
  });

  it("refuses stale saves and preserves the newer version", async () => {
    const post = await createPost(
      { title: "First", slug: "first", description: "Lead", type: "essay", topics: [] },
      dir,
    );
    const saved = await savePost({ ...post, body: "First version." }, dir);
    expect(saved.body).toContain("First version.");
    await expect(savePost({ ...post, body: "Stale version." }, dir)).rejects.toMatchObject({
      status: 409,
    });
    expect((await readPost(post.file, dir)).body).toContain("First version.");
  });

  it("rejects malformed frontmatter without changing the file", async () => {
    const post = await createPost(
      { title: "First", slug: "first", description: "Lead", type: "note", topics: [] },
      dir,
    );
    await expect(
      savePost({ ...post, frontmatter: "title: [broken", body: "Text" }, dir),
    ).rejects.toBeInstanceOf(EditorError);
    expect(await readFile(join(dir, post.file), "utf8")).not.toContain("Text");
  });

  it("does not follow a symlink outside the posts directory", async () => {
    const outside = join(tmpdir(), `meese-editor-outside-${Date.now()}.mdx`);
    try {
      await writeFile(outside, "secret");
      await symlink(outside, join(dir, "outside.mdx"));
      await expect(readPost("outside.mdx", dir)).rejects.toThrow();
    } finally {
      await rm(outside, { force: true });
    }
  });

  it("adds, normalizes, and clears the AI model without changing the MDX body", async () => {
    const created = await createPost(
      {
        title: "Model credit",
        slug: "model-credit",
        description: "Lead",
        type: "note",
        topics: [],
      },
      dir,
    );
    const post = await savePost(
      {
        ...created,
        frontmatter: `${created.frontmatter}\n# Keep this editorial note\ncustomField: preserved`,
        body: `import Widget from "../../components/Widget.astro";\n\nOpening paragraph.\n\n<Widget title="Keep this" count={3} options={{ mode: "full" }} />\n\nThe complete ending.`,
      },
      dir,
    );
    const saved = await savePost(
      { ...post, frontmatter: `${post.frontmatter}\naiModel: "  GPT-6.1-Sol  "` },
      dir,
    );
    expect(parseDocument(saved.frontmatter).get("aiModel")).toBe("GPT-6.1-Sol");
    expect(saved.frontmatter).toContain("# Keep this editorial note");
    expect(saved.frontmatter).toContain("customField: preserved");
    expect(saved.body).toBe(post.body);
    const document = parseDocument(saved.frontmatter);
    document.set("aiModel", "   ");
    const cleared = await savePost({ ...saved, frontmatter: document.toString() }, dir);
    expect(cleared.frontmatter).not.toContain("aiModel:");
    expect(cleared.body).toBe(post.body);
    expect((await readPost(post.file, dir)).body).toBe(post.body);
  });

  it.each([false, 42, [], {}, null, "x".repeat(81)])(
    "rejects an invalid AI model (%j) without changing the file",
    async (aiModel) => {
      const post = await createPost(
        {
          title: "Model credit",
          slug: "model-credit",
          description: "Lead",
          type: "note",
          topics: [],
        },
        dir,
      );
      const before = await readFile(join(dir, post.file), "utf8");
      await expect(
        savePost(
          { ...post, frontmatter: `${post.frontmatter}\naiModel: ${JSON.stringify(aiModel)}` },
          dir,
        ),
      ).rejects.toBeInstanceOf(EditorError);
      expect(await readFile(join(dir, post.file), "utf8")).toBe(before);
    },
  );
});

describe("asset uploads", () => {
  it("converts an uploaded image to a post-scoped WebP", async () => {
    const image = await sharp({ create: { width: 2, height: 2, channels: 3, background: "red" } })
      .png()
      .toBuffer();
    const result = await saveAsset("a-new-note", "Example.png", image.toString("base64"), dir);
    expect(result.src).toBe("/images/posts/a-new-note/example.webp");
    expect((await sharp(join(dir, "a-new-note", "example.webp")).metadata()).format).toBe("webp");
  });
});
