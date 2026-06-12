# UI Kit — meese.rs reading site

An interactive, high-fidelity recreation of the **meese.rs** static writing
site, built from the product spec (`ajmeese7/meese.rs` → `SPEC.md`). It composes
the design-system primitives (`Button`, `Badge`, `Tag`, `Input`, `PostCard`,
`NoteCard`, `Callout`) and uses Lucide for iconography.

## Run it
Open `index.html`. Everything is client-side; no build step.

## Screens & flow
- **System-index home** — latest-first feed mixing long posts (`PostCard`) and
  short notes (`NoteCard`) inline, a reticle "index status" panel, an active-
  topics rail, a concept-graph teaser, and a search entry.
- **Post reading page** — type/status badges, large display title, lead, sticky
  table of contents, `.prose` body with a `Callout`, code blocks and a
  blockquote, an "Updated" banner, plus **Related / Same topic** backlinks.
- **Concept graph** (`/graph`) — the branded SVG node graph. Hover a node to
  trace its edges; click to inspect connections in the detail panel; legend +
  a screen-reader fallback paragraph.
- **Search overlay** — static Pagefind-style search. Press **⌘K / Ctrl-K**
  (or the header/sidebar search). Live filtering with type chips and match
  highlighting.

## Files
| File | Role |
|---|---|
| `index.html` | Entry — loads React, Babel, Lucide, the DS bundle, then the screens |
| `data.js` | Sample posts/topics/graph data (on-brand voice) |
| `kit-primitives.js` | Resolves DS components from the bundle; preview fallbacks |
| `Chrome.jsx` | `SiteHeader`, `SiteFooter`, `Icon`, `Wordmark` |
| `Home.jsx` | System-index home |
| `PostView.jsx` | Long-form reading page |
| `GraphView.jsx` | Concept graph |
| `SearchOverlay.jsx` | Search modal |
| `app.jsx` | Routing, keyboard shortcuts, Lucide refresh |

## Notes
- `kit-primitives.js` prefers the real
  `window.MeeseRsDesignSystem_ed1971.*` components and only falls back to inline
  versions when the bundle hasn't compiled yet — so the kit always renders.
- This is a *recreation for design reference*, not production code: data is
  static, routes are React state, and search/graph are demo implementations of
  the behavior the spec describes.
