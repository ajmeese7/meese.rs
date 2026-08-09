import { LanguageSupport, StreamLanguage } from "@codemirror/language";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { yaml } from "@codemirror/lang-yaml";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { markdown } from "@codemirror/lang-markdown";
import { shell } from "@codemirror/legacy-modes/mode/shell";
import type { CodeBlockLanguage } from "@mdxeditor/editor";

// Code-block languages for the editor with grammar support wired in explicitly.
// MDXEditor's auto-load (via @codemirror/language-data) only highlights ids it
// recognizes, so non-standard fences (jsonc, bash) came up unhighlighted.
// Providing `support` guarantees highlighting; aliases map the fence ids used in
// the posts onto each grammar without changing what gets written back on save.
export const CODE_LANGUAGES: CodeBlockLanguage[] = [
  { name: "Plain", alias: ["text", "plaintext"] },
  { name: "JavaScript", alias: ["js", "jsx", "mjs", "cjs"], support: javascript({ jsx: true }) },
  {
    name: "TypeScript",
    alias: ["ts", "tsx"],
    support: javascript({ typescript: true, jsx: true }),
  },
  { name: "JSON", alias: ["json", "jsonc", "json5"], support: json() },
  { name: "YAML", alias: ["yaml", "yml"], support: yaml() },
  {
    name: "Shell",
    alias: ["bash", "sh", "shell", "zsh"],
    support: new LanguageSupport(StreamLanguage.define(shell)),
  },
  { name: "CSS", alias: ["css"], support: css() },
  { name: "HTML", alias: ["html"], support: html() },
  { name: "Markdown", alias: ["md", "markdown"], support: markdown() },
];
