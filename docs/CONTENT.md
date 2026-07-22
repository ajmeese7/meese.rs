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

A `related[].reason` is a card label, not prose. Every one on the site is a noun phrase naming what the two posts share ("The search decision behind this build, argued in full."), so write them that way and do not flag them as sentence fragments during review. Tell a review agent this, since it reads one draft and cannot see the convention.

---

## 5. Visibility

Separate axis from type and status: these fields decide whether a post is built at all, and where it surfaces once it is. Read them as a ladder from private to public.

| Field | Built in prod? | In listings/feeds/search/graph? | Reachable by URL? | Use it when |
|---|---|---|---|---|
| `draft: true` | No, dev only | No | No (no route exists) | Work in progress. Visible in `pnpm dev`, never shipped. |
| `unlisted: true` | Yes | No, and dropped from the sitemap + marked `noindex` | Yes | You want to share a link before (or instead of) publishing: a live URL that shows up nowhere on the site. |
| `hideFromFeed: true` | Yes | Skips the main feed only; still in topic/type pages, search, graph | Yes | A published post you want off the homepage and `/latest`, but otherwise browseable. Also the only way to publish without emailing subscribers (see below). |
| (none of the above) | Yes | Yes | Yes | A normal published post. |

`externalUrl:` is a separate case: the post is a pointer to somewhere else, so it gets no local page and its cards/feeds link straight out.

The split is enforced in [`src/utils/posts.ts`](../src/utils/posts.ts): `getBuildablePosts()` is the build/asset set and includes unlisted posts (so the page and its OG image render), while `getPosts()` is the listing default and excludes them, so every feed, topic, type page, count, graph, and backlink inherits the exclusion for free.

### Visibility and the newsletter

The newsletter cron queues off `feed.json`, which is `getFeedPosts()`, so all three flags gate email as well as the feed. A post notifies subscribers only when `draft`, `unlisted`, and `hideFromFeed` are all false. `hideFromFeed: true` is therefore the switch for "publish this properly, just don't spend an email on it": fully public, indexed, searchable, no inbox.

`unlisted` and `hideFromFeed` are not two flavours of the same thing. `unlisted` controls *discovery* (nobody can find the post at all), `hideFromFeed` controls *announcement* (anyone browsing finds it, it just isn't pushed at the homepage, feeds, or subscribers).

### Publishing an unlisted post later

Set `date` to the day the post goes public, not the day it was written. The two are the same for a normal post, so this only matters when unlisting something later: bump `date` to that day at the same time you set `unlisted: false`.

Email and RSS diverge otherwise. The cron keys on the post URL, so it mails correctly whenever the post enters the feed, but RSS readers sort by `date_published`, so a post kept unlisted for months arrives back-dated and buried under everything the subscriber has already read. Bumping `date` keeps both channels agreeing on when the post was published.

---

## 6. Reviewing a draft

Adversarial review of a draft is three passes, and the author can only run one of them.

The first is mechanical: comma pile-ups, repeated words in adjacent sentences, paragraph openers, em dashes, fragments, and a numeral-by-numeral check that every figure in the draft traces to a source rather than to a plausible-sounding guess. Include a lift check here, since a devlog is usually written next to the commits it describes: build a corpus from `git log --format=%B`, the PR body, and the docs you read, then list every 4-to-6-word phrase the draft shares with it. Commit-register prose reads as finished, so it skips the rewriting a fresh sentence would get, and it carries vocabulary that only makes sense with the repo open.

The second re-runs those same mechanical rules with fresh eyes, because the author's pass catches most of them and not all. Writing a sentence leaves you reading the punctuation you intended instead of the punctuation on the page, so a full gate pass here still shipped two commas before a coordinating conjunction with no independent clause after it, both spotted by a beta reader on first read. Aaron delegates this to a `line-editor` subagent that reads the voice profile and the draft, and nothing else.

The third is comprehension, and the author cannot run it. Having written the draft with the transcript, commits, and docs in context, they refill every missing antecedent from memory, so it reads fine to them and to nobody else. Delegate it to a reader that can see the draft and nothing else, and ask for every phrase unresolvable from the page: definite articles on nouns never introduced, bare identifiers, pronouns with distant antecedents, jargon used before definition, references to events the reader never witnessed, and internal contradictions or counts that do not add up. Contradictions are the highest-value findings, because they are the ones that survive self-review.

With an agent, enforce that structurally rather than by instruction, or it will read the repo and stop being a stranger. Aaron runs a `cold-reader` subagent whose tool list is locked to `Read`, kept machine-local alongside `line-editor` since nothing in either is project-specific. Then triage: fix what is wrong or unresolvable, dismiss what is ordinary vocabulary for a developer audience.

## 7. Headings and figures

Section headings are read out of context, in the table of contents and by someone skimming, so a heading has to make sense before its section does. `## The dots were Gmail, not the template` fails that test: it announces a minor find as though it were a finding. A gotcha that small belongs in a `<Callout>` inside a section that already earned its heading, where the callout's own title carries the context.

Figures live at `public/images/posts/<slug>/<name>.png` and render through `<Figure src alt caption kind>`. Capture them at a device pixel ratio of 2 or 3 rather than upscaling a 1x grab, which is grainy at the article column's width:

```
agent-browser set viewport 620 470 3     # third arg is deviceScaleFactor
agent-browser open <url>
agent-browser screenshot out.png
ffmpeg -i out.png -vf "crop=W:H:X:Y" public/images/posts/<slug>/<name>.png
```

Two traps when the subject is a rendered artifact rather than a live page:

- **The brand fonts are not installed in an agent sandbox**, so a naive capture silently falls back to Arial and the figure ends up contradicting prose about the design system. Astro's font provider emits hashed woff2 files to `dist/_astro/fonts/`; map them by grepping the `@font-face` rules in any built page (`grep -o '@font-face{[^}]*}' dist/index.html`), then declare those files under the real family names in a preview-only `<style>` block. Never add a webfont `<link>` to the email templates themselves, per the tracking-pixel reasoning in [`newsletter-setup.md`](newsletter-setup.md).
- **Render the real artifact, not a copy.** Import the actual template function (for emails, `postEmail()` / `confirmationEmail()` from `worker/newsletter/email.ts`) into a throwaway script and write its output to disk. A hand-rewritten approximation drifts from the thing it claims to show.

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
