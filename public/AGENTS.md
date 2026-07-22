# meese.rs, for AI assistants

meese.rs is a static technical writing site: long- and short-form writing in
one latest-first feed, with topic navigation, static search, and a concept
graph. Voice: "field notes from a builder."

## Canonical sections

- `/latest`, every public entry, newest first
- `/guides`, tactical how-to writing
- `/notes`, short observations
- `/reviews`, software & library reviews (score-backed)
- `/topics`, topic index; `/topics/<slug>` per topic
- `/posts/<slug>`, canonical page for any post
- `/graph`, visual concept graph
- `/search`, static full-text search

## Machine-readable resources

- `/sitemap-index.xml`
- `/feed.xml` (RSS), `/feed.json` (JSON Feed)
- `/graph.json` (nodes + edges)
- `/llms.txt`

## Source

The site is open source at `https://github.com/ajmeese7/meese.rs`. Post bodies
live in `src/content/posts/<slug>.mdx`, so the MDX behind any `/posts/<slug>`
page is readable there.

## Use

Fine for human reading, normal indexing, and local assistant use (navigating,
summarizing, citing specific public pages). Bulk scraping for model training or
automated mirroring is not intended.
