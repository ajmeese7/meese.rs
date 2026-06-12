The system-index marker that labels every post by `type` (guide/note/devlog/essay/lab/reference, each a fixed hue) or flags `status` (updated/corrected/deprecated/pinned).

```jsx
<Badge type="guide" />
<Badge status="deprecated" />
<Badge color="var(--cyan)" bracketed={false}>72ch</Badge>
```

Tinted-outline by default; pass `solid` for a filled chip. Bracketed `[ LABEL ]` mono styling is the house look — keep it on for type/status markers.
