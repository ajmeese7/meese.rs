The standard feed entry for longer writing — guides, devlogs, essays, labs, references. Composes `Badge` + `Tag`.

```jsx
<PostCard
  type="guide"
  title="Getting an Expo SDK 56 App Running on a Real Device"
  description="Modernizing an old app turns up gotchas the docs never connect."
  date="2026-06-08" updated="2026-06-11" readingTime="7 min"
  topics={['react-native','expo']}
  featured
/>
```

`featured` adds reticle corner ticks + a `[ PINNED ]` marker. Whole card is the link; title shifts to cyan and the card lifts 2px on hover. Use `NoteCard` for short notes instead.
