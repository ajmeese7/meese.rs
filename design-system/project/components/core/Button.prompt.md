Mono-labelled button for meese.rs system-index UI; reach for it on any action, using `ghost` for low-emphasis chrome and `primary` (cyan signal) sparingly for the single key action per view.

```jsx
<Button variant="primary" size="md">Read guide</Button>
<Button variant="ghost" iconLeft={<SearchIcon />}>Search</Button>
```

Variants: `primary` (cyan fill), `secondary` (raised surface, default), `ghost` (transparent → surface on hover), `accent` (cyan wash), `danger` (red). Sizes: `sm` / `md` / `lg`. Press shifts 1px down; no bounce. Labels are JetBrains Mono with light tracking — keep them short.
