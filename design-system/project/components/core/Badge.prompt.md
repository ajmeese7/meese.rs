The system-index marker. TYPE badges (`guide/note/devlog/essay/lab/reference/review`) lead with a Lucide icon + an **unbracketed** label — the glyph is the type signal, each type a fixed categorical hue. STATUS badges (`updated/corrected/deprecated/superseded/pinned`) are bracketed `[ LABEL ]` with no icon, in a semantic hue.

```jsx
<Badge type="guide" />            {/* ▸ book-open  GUIDE  */}
<Badge type="review" />           {/* ▸ star  REVIEW       */}
<Badge status="superseded" />     {/* [ SUPERSEDED ]       */}
<Badge color="var(--accent)" bracketed={false}>72ch</Badge>
```

Tinted-outline by default; pass `solid` for a filled chip. Pass `icon={false}` to drop the glyph from a type badge, or `bracketed` to override the default (types unbracketed, status/custom bracketed). Verdict pills on reviews are a separate plain-pill shape — not a Badge.
