Feed card for a software / library review — reviews are a major meese.rs use case, so the type badge takes the brand accent. Composes `Badge` + `Tag` + `Stars`.

```jsx
<ReviewCard
  subject="Bun" version="v1.2"
  oneLiner="A genuinely fast all-in-one runtime — with a few rough edges you'll feel in production."
  score={4.2} verdict="caveats" date="2026-06-10"
  topics={['runtime','javascript','devtools']}
/>
```

`verdict`: `recommended` (green), `caveats` (gold), `watch` (accent), `skip` (red). `<Stars score={4.2} />` renders a precise partial fill and is exported separately for use in full review layouts (score breakdowns).
