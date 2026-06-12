---
name: meese-rs-design
description: Use this skill to generate well-branded interfaces and assets for meese.rs — the dark, technical, system-index writing site — for production or throwaway prototypes/mocks. Contains the design guidelines, color/type/spacing tokens, fonts, brand assets, and UI kit components for prototyping.
user-invocable: true
---

# meese.rs — design skill

meese.rs is a dark, technical, *system-index-oriented* writing site: long- and
short-form technical writing in one latest-first feed, with a branded concept
graph. The look is a **custom cybersecurity UX kit** — precise, restrained,
sleek — and the voice is **"field notes from a builder."**

Read `README.md` in this skill first; it is the full design guide (content
fundamentals, visual foundations, iconography, and a file index). Then explore:

- `styles.css` + `tokens/*` + `base.css` — the token system and base layer. Link
  `styles.css` and style against the **semantic aliases** (`--text-body`,
  `--surface-card`, `--accent`, `--border-default`, …).
- `components/**` — React primitives (`Button`, `Badge`, `Tag`, `Input`,
  `PostCard`, `NoteCard`, `Callout`). Each has a `.prompt.md` with usage.
- `ui_kits/website/` — a full interactive recreation of the site; copy patterns
  from here for whole screens.
- `guidelines/*.html` — live specimen cards for color, type, spacing, brand.
- `assets/` — the concept-graph logomark + favicon.

## How to work
If you're making **visual artifacts** (slides, mocks, throwaway prototypes),
copy the assets you need out and produce self-contained static HTML for the user
to view. If you're working on **production code**, copy assets and apply the
rules here to design fluently in the brand.

Non-negotiables: dark blue-black surfaces + faint system grid; **cyan** is the
only interactive signal, **ember** the only warm accent (the `.rs`, sparingly);
Space Grotesk / IBM Plex Sans / JetBrains Mono, body never monospace; sentence
case prose, ALL-CAPS only for mono system labels; hairline borders and small
radii; restrained motion (no bounce); Lucide icons; **no emoji.**

If the user invokes this skill without guidance, ask what they want to build,
ask a few focused questions, then act as an expert designer who outputs HTML
artifacts or production code as the need dictates.
