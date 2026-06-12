# Content & Taxonomy Reference

The writer/maintainer reference for what every label on the site means and which frontmatter field drives it. The machine source of truth is [`src/content.config.ts`](../src/content.config.ts); the original product spec is [`SPEC.md`](./SPEC.md) §14 to §17 (note: the spec predates the `review` type and the verdict system documented below).

There are **four independent label systems**. They look similar (most are mono, uppercase, or `#hashtag` pills) but they answer four different questions. Confusing them is the most common point of friction, so start here:

| System | Question it answers | Driven by | Cardinality |
|---|---|---|---|
| **Type** | What kind of writing is this? | `type:` | exactly one per post |
| **Status** | Where is it in its lifecycle? | `updated:`, `pinned:`, `supersededBy:`, etc. | zero or more, derived |
| **Verdict** | (Reviews only) How did the reviewed thing score? | `review.verdict` + `review.verdictLabel` | one, reviews only |
| **Topics / Tags** | What subjects/keywords does it cover? | `topics:` / `tags:` | many |

---

## 1. Type

One per post, set by `type:`. It is the post's primary identity and renders as a badge with a leading icon and an uppercase label (e.g. a terminal glyph + `DEVLOG`). Each type has a fixed icon and accent hue. Type badges deliberately have no brackets; that is what separates them at a glance from status badges (bracketed) and verdicts (plain pill).

| `type:` | Icon | Label | Hue | What it is | Update policy |
|---|---|---|---|---|---|
| `guide` | book-open | GUIDE | cyan | Tactical, practical "how to do X". | Update in place when facts, tooling, or recommendations change. |
| `note` | pencil | NOTE | slate | Short observation or two-minute read. | Leave historical unless correcting an error. |
| `devlog` | terminal | DEVLOG | green | Historical build/update log, a record of what happened. | Preserve historically; only clean up factual errors. |
| `essay` | feather | ESSAY | violet | Longer argument, opinion, or synthesis. | Preserve the original argument; add an update note if needed. |
| `lab` | flask-conical | LAB | gold | Experiment, benchmark, reproduction, or investigation. | Preserve the original result; publish a new run if materially different. |
| `reference` | bookmark | REF | rose | Durable explainer or glossary-style page. | Update in place. |
| `review` | star | REVIEW | accent | Software/library review. Gets the score band, criteria, and verdict treatment. | Update the score/verdict if the subject changes materially, and record the revision. |

Icons are Lucide glyphs from `src/components/layout/Icon.astro`; the type-to-icon map lives in `src/components/posts/Badge.astro`.

`review` is a first-class type beyond the SPEC's base six, because reviews are a major use case and need their own layout and structured frontmatter (see §3).

---

## 2. Status

Lifecycle markers, separate from type. You do not pick these as a category; they are derived from other frontmatter and shown only when relevant (the default is to show nothing). A post can carry more than one.

| Status badge | Hue | Triggered by | Meaning |
|---|---|---|---|
| `[ UPDATED ]` | green | `updated:` is set | Revised since first publish. Shows the revision date. |
| `[ CORRECTED ]` | gold | (editorial, manual) | A factual error was fixed. |
| `[ DEPRECATED ]` | red | (editorial, manual) | Advice no longer recommended. |
| `[ SUPERSEDED ]` | slate | `supersededBy:` points to a newer post | A newer piece replaces this one; the banner links to it. |
| `[ PINNED ]` | accent | `pinned: true` | Held at the top of the feed regardless of date. |

On a post page the banner precedence is: superseded, then updated. `featured: true` is related but is not a status badge; it only elevates a card (reticle ticks) in the feed.

---

## 3. Verdict (reviews only)

A review carries a structured `review` block. The verdict is two fields working together:

- `review.verdict`: one of four **machine values** that drive the color and the verdict panel.
- `review.verdictLabel`: the **free-text string** actually displayed. You write this.

| `verdict:` | Hue | Typical `verdictLabel` | Live example |
|---|---|---|---|
| `recommended` | green | "Recommended" | Claude Code, 4.6 |
| `caveats` | gold | "Recommended with caveats" | Bun, 4.2 |
| `watch` | accent | "One to watch" | Paseo, 3.9 |
| `skip` | red | "Skip" | (none yet) |

So `ONE TO WATCH` is a **review verdict**, not a content type. They live on different axes, and the UI keeps them apart: the type badge carries a leading icon, the verdict is a plain pill with no icon. The rest of the review block (`score`, `criteria`, `pros`, `cons`, `bottomLine`, `links`, `meta`) is documented inline in `src/content.config.ts` and rendered by `ReviewLayout`/`ReviewCard`.

---

## 4. Topics vs Tags

Both are arrays of lowercase strings, and topics render as `#pill`s, so they are easy to conflate. They are not the same:

| | **Topics** (`topics:`) | **Tags** (`tags:`) |
|---|---|---|
| Purpose | The curated, navigable taxonomy: subjects/sections. | Finer-grained free-form keywords. |
| Archive page | Yes, `/topics/<slug>/`. | No. |
| Where shown | "Active topics", card/post `#pills`, "same topic" backlinks, the concept graph. | Not rendered as pills anywhere. |
| Search | A search filter. | A search filter. |
| Rule of thumb | Few, reused, deliberate. A topic should earn its archive page. | Many, specific, cheap. Use freely for searchability. |

Practical guidance: if you would want a reader to browse everything under it, make it a **topic**. If it is just a searchable keyword, make it a **tag**. Tags never appear as visible pills, so they cannot clutter the feed.

---

## Quick frontmatter example

```yaml
---
title: "Getting an Expo SDK 56 App Running on a Real Device"
description: "A few gotchas the docs never connect for you."
date: 2026-06-08
updated: 2026-06-11        # -> [ UPDATED ] status badge
type: guide               # -> [ GUIDE ] type badge
topics: [react-native, expo]   # -> #pills + archive pages + graph
tags: [eas, sdk-56, ios]       # -> search filters only
featured: true            # -> reticle ticks in the feed
---
```

For reviews, add a `review:` block; see `src/content/posts/review-*.mdx` for complete, working examples.
