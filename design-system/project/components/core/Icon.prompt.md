Inline Lucide glyphs (1.5px stroke, no fill, `currentColor`), self-contained — no CDN runtime. The same glyph map the badges, chrome, and search results draw from, ported from the site's `icons.ts`.

```jsx
<Icon name="search" />
<Icon name="git-fork" size={20} />
<Icon name="arrow-up-right" size={16} style={{ color: 'var(--accent)' }} />
```

Color comes from the parent (`currentColor`); size in px (18 UI · 16 inline · ~13 in a badge). `TYPE_ICONS` maps each post type to its glyph; Badge uses it automatically.
