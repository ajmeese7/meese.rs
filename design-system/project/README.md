# meese.rs — Design System

> A dark, technical, restrained visual system for **meese.rs**, the canonical
> home for one builder's long- and short-form technical writing. The aesthetic
> is a *custom cybersecurity UX kit*: precise, system-index oriented, sleek —
> distinctive without ever sacrificing the reading experience.

---

## 1. What this is for

`meese.rs` is a static-first writing site — tactical guides, dev logs, short
notes, labs, references, and the occasional essay, all in **one latest-first
feed**. It should read like a *system index of a builder's work*, not a blog, a
magazine, a portfolio, a docs portal, a terminal gimmick, or a social feed.

This design system encodes that identity as reusable tokens, components, and
full-screen recreations so any agent or developer can produce on-brand
interfaces, mocks, and assets for meese.rs.

**Audience the brand speaks to:** engineers, AI/devtool builders, and
technically-minded people evaluating the author through proof-of-work writing —
plus a cybersecurity-adjacent secondary audience. Everything here should signal:
*this person builds real systems, understands tradeoffs, and can explain
implementation clearly.*

### Signature features the system supports
- mixed-length writing (notes and full guides) in one main feed
- topic-driven navigation + static search
- backlinks between related posts
- a **sleek, branded concept graph** (the logo is built from it)

---

## 2. Source material

This system was built against the author's own specification. Nothing visual
pre-existed — the spec explicitly ships *placeholder* tokens and defers the
final look to human approval. **This design system is that approved custom
visual direction.**

- **Spec repo:** `ajmeese7/meese.rs` (private) — `SPEC.md` is the product brief
  (architecture, routes, content types, schema, search, graph, feeds). Read it
  for product behavior; it intentionally contains no final brand.
  → https://github.com/ajmeese7/meese.rs
- Related author context (not used directly, but useful for voice/range):
  `ajmeese7/agentic-portfolio`, `ajmeese7/reading-log`,
  `meese-enterprises/*` (the author works across devtools, security, and
  systems). Explore these to better understand the builder this brand
  represents.

> If you have repo access, re-read `SPEC.md` before building product surfaces —
> it is the source of truth for *behavior*. This file is the source of truth for
> *look, feel, and voice*.

---

## 3. The system at a glance

| Layer | Choice |
|---|---|
| **Mood** | dark · technical · futuristic but restrained · system-index |
| **Foundation** | graphite blue-black surfaces + faint blueprint grid (fixed) |
| **Signal** | a single **neon accent**, themeable via `data-theme`. Default = **neon-violet** (`--accent` #9A7CFF), with a soft glow on focus/active |
| **Themes** | 9 presets: neon-violet · acid-green · neon-lime · neon-mint · neon-cyan · electric-blue · hot-magenta · neon-pink · coral |
| **Display** | Space Grotesk |
| **Body** | IBM Plex Sans (long-form, never monospace) |
| **Mono** | JetBrains Mono (metadata, code, system chrome, search) |
| **Geometry** | small radii (3–12px), hairline borders, low cool shadows |
| **Motifs** | reticle corner ticks · mono `[ LABEL ]` / `// LABEL` · concept-graph mark |

Reference the **semantic aliases** (`--text-body`, `--surface-card`,
`--accent`, `--border-default`…) in everything you build, not the raw base
palette — that keeps surfaces retheme-able.

### Theming (`data-theme`)

The graphite foundation is fixed; the **accent is one swappable layer**. Set
`data-theme` on `<html>` (or any ancestor) to retheme everything that uses the
accent — links, buttons, focus, badges, the brand mark, graph topic nodes:

```html
<html data-theme="acid-green"> … </html>   <!-- default (omitted) = neon-violet -->
```

All nine presets live in `tokens/colors.css`; each one only overrides the nine
`--accent*` vars, so adding your own theme is a ten-line block. To let users
toggle it, set the attribute from JS and persist it — the website UI kit's
header has a working `ThemeSwitcher` (writes `data-theme` + `localStorage`) you
can lift. The accent is the single source of truth — there are no
`--cyan*` / `--ember*` aliases; reference `--accent*` (or the `--link` /
`--brand` semantic names) directly.

---

## 4. CONTENT FUNDAMENTALS — how meese.rs writes

The editorial voice is **"field notes from a builder."** Match it in any UI copy,
placeholder text, or sample content you generate.

**Person & stance**
- First person for the author's own experience ("I shipped…", "what I'd do
  differently"), **second person** for instruction ("you'll hit a mismatch
  error here"). Never corporate "we."
- Confident but honest about tradeoffs. The writing earns trust by being
  *specific*, not by being polished. Show the gotcha, name the constraint.

**Tone**
- Direct, technical, unhurried. Declarative sentences. Low ceremony.
- Dry, not jokey. No hype words ("revolutionary", "seamless", "game-changing").
- Precise nouns over adjectives. Prefers the concrete ("Expo SDK 56 on a Pixel
  7") to the abstract ("modern mobile development").

**Casing & mechanics**
- **Sentence case** for headings and titles — not Title Case, not ALL CAPS.
  > *"Getting an Expo SDK 56 app running on a real device"*
- ALL CAPS + mono is reserved for **system labels only** (`[ UPDATED ]`,
  `// WARNING`, `TOPICS`). Treat caps as UI chrome, never prose. (Type badges
  pair the caps label with their icon and drop the brackets; bracketed caps are
  for status markers and other system chrome.)
- Dates are ISO-ish and mono: `2026-06-08`. Reading time: `7 min`.
- Topic slugs are `kebab-case`: `react-native`, `local-llms`, `static-sites`.
- Tags carry a `#` prefix in the UI (`#expo-go`, `#eas`).

**Vibe / do & don't**
- ✅ "A short note on why SDK/runtime mismatch errors remain more confusing than
  they need to be."
- ✅ Titles state the *actual task or claim*, not a teaser.
- ❌ No clickbait, no listicle voice, no "Ultimate guide to…".
- ❌ **No emoji** anywhere in product UI or brand copy. (The system grid, mono
  labels, and reticle ticks carry the personality instead.)
- ❌ Don't manufacture stats, badges, or "confidence" labels. The spec
  explicitly avoids `stable` / `experimental` / `field-tested` badges. Only the
  four real status markers appear when relevant: **Updated · Corrected ·
  Deprecated · Superseded by**.

**Content types** (one feed, a `type` per entry): `guide` · `note` · `devlog` ·
`essay` · `lab` · `reference` · `review`. Notes are short and live *inline* with
long posts — the feed mixes lengths on purpose. **Reviews** of software and
libraries are a first-class use case: they carry the brand accent, a star score,
a verdict, and a structured score breakdown (see the review reading page in the
website UI kit).

---

## 5. VISUAL FOUNDATIONS

Answers to "what does this brand actually look like," in detail.

**Color & mood.** A cool, blue-black foundation — the "system index" — lit by a
single signal. Backgrounds run `--bg-void #06080C` → `--surface-3 #1B2230`;
nothing is pure black and nothing is warm-gray. Text is cool off-white
(`--ink-1 #E8EDF4`) down to faint slate. The **only** saturated interactive
color is the **neon accent** (default violet); there is no second brand color.
The accent lights links, primary actions, focus, the brand mark, the `.rs`, and
"live/pinned" accents, used sparingly. Semantic hues (green/gold/red/violet)
appear only for status and graph categories. There are **no purple→blue
gradients** and no decorative gradients at all.

**Backgrounds.** Not flat: a **faint blueprint grid** (`--grid-line`, ~4.5%
alpha, 32px) sits under everything — a restrained nod to schematics/system maps.
No photography, no illustrations, no texture/grain, no hero images. Imagery, when
it appears in posts, sits in bordered figure frames; the brand itself is
type-and-line, not pictures.

**Typography.** Three technical superfamilies, strictly zoned: Space Grotesk
(display/headings), IBM Plex Sans (long-form body — readability is the priority,
~72ch measure, 1.7 leading), JetBrains Mono (all system chrome: badges, dates,
nav, code, search). Body is **never** monospace. Headings are sentence case,
semibold, slightly tight tracking.

**Spacing & layout.** 4px grid. Tight, predictable rhythm — chrome favors the
small steps. Reading column caps at `--content-width: 72ch`; the index shell at
`--wide-content-width: 1120px`. Fixed elements: a slim 60px top header. Content
is left-aligned and column-based, not centered hero blocks.

**Corner radii & borders.** Sharp and engineered: 3px (badges/inputs), 5px
(buttons), 8px (cards), 12px (dialogs), pill for tags. Borders are **hairline
1px** and do most of the structural work — surfaces are separated by lines, not
shadows.

**Cards.** Flat `--surface-1` fill, 1px `--line-1` border, 8px radius, generous
interior padding (`--pad-card` 24px). **Featured** cards add **reticle corner
ticks** (accent L-brackets at the four corners) and a `[ PINNED ]` marker — the
house "this is elevated" signal. Notes use a lighter, transparent card with a
slate left-rail, reading like a log line.

**Shadows & elevation.** Low, cool, used sparingly (`--shadow-1..3`, pure-black
at 40–55%). Depth comes mostly from **surface-lightening** on hover. The
signature "lit" effect is an **accent glow** (`--glow-soft`, `--glow-accent`)
reserved for focus and active/primary states. No big diffuse drop shadows.

**Hover states.** Surfaces lighten one step (`--surface-1`→`--surface-2`),
borders go one step stronger (`--line-1`→`--line-2`), interactive titles shift to
`--accent-bright`, cards lift `translateY(-2px)`. Links brighten + underline.
Never opacity-dimming as the only hover cue.

**Press states.** Buttons shift **down 1px** (`translateY(1px)`) and darken
toward `--accent-press` — mechanical, no scale-bounce.

**Focus states.** Always visible, accessible: a 2px offset accent ring
(`--ring`) plus, on inputs, a soft glow. Never removed.

**Motion.** Restrained and quick: 120–260ms, `--ease-out`
(`cubic-bezier(.22,.61,.30,1)`). Fades and small translateY only. **No bounce,
no spring, no infinite decorative loops.** The graph may animate node settling
once on load. `prefers-reduced-motion` is honored globally.

**Transparency & blur.** Used only for overlays/menus: `--blur-overlay`
(`blur(10px) saturate(120%)`) over a high surface. Color washes
(`--accent-wash`, status `*-wash`) tint badges/callouts at
8–18% alpha. No frosted-glass everywhere.

**Imagery vibe.** Cool, technical, low-key. If screenshots/diagrams appear they
sit in 8px bordered frames; prefer diagrams and code over photos. No warm,
no glossy, no stock.

See the **Design System tab** for live specimen cards of every foundation above.

---

## 6. ICONOGRAPHY

- **Icon set: Lucide** (https://lucide.dev), shipped as an **inline glyph map**
  (`components/core/Icon.jsx`, ported from the site's `src/utils/icons.ts`) —
  NOT the CDN runtime. Chosen for its **1.5px stroke, square-ish geometry, and
  no-fill** style — it matches the hairline-border, engineered feel exactly.
  Rendering inline keeps badges and chrome self-contained with zero external
  script. *(Substitution flag: the spec ships no icon assets, so Lucide is a
  deliberate, on-brand pick rather than a copied set. Swap if the author
  prefers another stroke set.)*
- **Usage:** thin stroke (1.5px), `currentColor` so icons inherit ink/accent,
  18–20px in UI, 16px inline. Use them for nav, search, external-link marks,
  copy buttons, and graph controls — sparingly. Icons support text; they rarely
  stand alone.
- **Type badges are icon-led.** Every post-type badge leads with its Lucide
  glyph and an *unbracketed* label (guide ▸ `book-open`, note ▸ `pencil`,
  devlog ▸ `terminal`, essay ▸ `feather`, lab ▸ `flask-conical`, reference ▸
  `bookmark`, review ▸ `star`). The icon is what distinguishes a type chip from
  a **bracketed** status badge (`[ UPDATED ]`) and from a plain verdict pill.
- **No emoji**, ever, in product UI or brand copy.
- **Unicode/mono glyphs as micro-icons** are on-brand where Lucide is overkill:
  the search prompt `/`, the tag `#`, list markers, `·` separators, `//` and
  `[ ]` label framing. These come from JetBrains Mono and reinforce the
  system-index feel.
- **The brand mark is the concept graph itself** — three nodes (two accent, one
  neutral) joined by hairline edges, optionally inside a reticle frame. Files:
  `assets/logomark.svg` (glyph) and `assets/favicon.svg` (glyph on a dark
  reticle tile). The wordmark sets the `.rs` in the accent. Don't redraw it;
  reference these files. (The SVGs hardcode the default violet; swap if you
  ship a different default theme.)

---

## 7. Index / manifest

**Foundations**
- `styles.css` — the single entry point consumers link (imports only).
- `tokens/colors.css` · `tokens/typography.css` · `tokens/spacing.css` ·
  `tokens/effects.css` · `tokens/fonts.css` — all CSS custom properties + fonts.
- `base.css` — resets, the grid backdrop, link/focus/scrollbar styling, and the
  `.prose` reading column.

**Components** (`window.MeeseRsDesignSystem_ed1971.*`)
- `components/core/` — **Button**, **Badge**, **Tag**, **Input**, **Icon**
- `components/content/` — **PostCard**, **NoteCard**, **ReviewCard** (+ **Stars**), **Callout**
- Each ships `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md`, and a directory
  `*.card.html` thumbnail.

**UI kit**
- `ui_kits/website/` — full-screen, interactive recreation of the meese.rs
  reading site: the system-index home, a post reading page, the static search
  overlay, and the branded concept graph. See its `README.md`.

**Specimen cards** — every `guidelines/*.html` (Colors, Type, Spacing, Brand)
plus the component cards populate the Design System tab.

**Assets** — `assets/logomark.svg`, `assets/favicon.svg`.

**Brand & usage** — `SKILL.md` (portable Agent Skill entry point) + this README.

---

## 8. Known caveats / open with the author

- **Fonts are CDN-linked from Google Fonts**, not self-hosted binaries. The spec
  wants `font-src 'self'` for the production CSP — self-host under
  `assets/fonts/` before launch. *(Flagged for your binaries.)*
- **Icons are Lucide via CDN** — a substitution, not a provided set.
- **The whole visual identity is newly created** under the spec's "approval to
  build a custom system" clause. Colors, type pairing, motifs, and the
  graph-based logo are all proposals awaiting your sign-off.
