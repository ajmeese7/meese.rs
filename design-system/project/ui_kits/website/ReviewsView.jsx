/* meese.rs UI kit — ReviewsView (index of all software / library reviews) */
(function () {
  const { ReviewCard, Tag } = window.KIT;
  const { Icon } = window.KIT_CHROME;
  const { POSTS, REVIEWS } = window.KIT_DATA;

  function Stars({ score, size = 16 }) {
    const pct = Math.max(0, Math.min(100, (score / 5) * 100));
    return (
      <span style={{ position: 'relative', display: 'inline-block', fontSize: size, lineHeight: 1, letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}>
        <span style={{ color: 'var(--line-3)' }}>★★★★★</span>
        <span style={{ position: 'absolute', left: 0, top: 0, width: pct + '%', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--accent)' }}>★★★★★</span>
      </span>
    );
  }

  function ReviewsView({ onOpenPost, onBack, backLabel, onTopic }) {
    const [sort, setSort] = React.useState('recent'); // recent | score
    const [topic, setTopic] = React.useState(null);
    const all = POSTS.filter((p) => p.type === 'review').map((p) => ({ ...p, r: REVIEWS[p.slug] || {} }));
    const topics = [...new Set(all.flatMap((p) => p.topics))].sort();
    const reviews = topic ? all.filter((p) => p.topics.includes(topic)) : all;
    const sorted = [...reviews].sort((a, b) =>
      sort === 'score' ? (b.r.score || 0) - (a.r.score || 0) : (a.date < b.date ? 1 : -1)
    );
    const avg = reviews.length ? (reviews.reduce((s, x) => s + (x.r.score || 0), 0) / reviews.length) : 0;

    return (
      <div style={{ maxWidth: 'var(--max-shell)', margin: '0 auto', padding: '28px 24px 24px' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12,
          color: 'var(--ink-3)', textDecoration: 'none', marginBottom: 26,
        }}>
          <Icon name="arrow-left" size={13} /> back to {backLabel || 'index'}
        </a>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 360px' }}>
            <h1 style={{ fontSize: 'var(--text-3xl)', lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0 }}>Reviews</h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--ink-2)', lineHeight: 1.6, margin: '14px 0 0', maxWidth: '56ch' }}>
              Honest, score-backed takes on the software and libraries I actually run. Each one is a
              full breakdown — performance, DX, tradeoffs — not a press release.
            </p>
          </div>
          {/* aggregate panel */}
          <div style={{ display: 'flex', gap: 22, padding: '16px 20px', background: 'var(--surface-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--radius-md)' }}>
            <Stat label="reviews" value={String(reviews.length).padStart(2, '0')} />
            <div style={{ width: 1, background: 'var(--line-2)' }} />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 6 }}>avg score</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ink-1)', lineHeight: 1 }}>{avg.toFixed(1)}</span>
                <Stars score={avg} size={13} />
              </div>
            </div>
          </div>
        </div>

        {/* topic filter + sort row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', margin: '26px 0 16px' }}>
          <span className="sys-label" style={{ marginRight: 2 }}>topic</span>
          <Tag active={!topic} onClick={() => setTopic(null)}>all</Tag>
          {topics.map((t) => <Tag key={t} active={topic === t} onClick={() => setTopic(topic === t ? null : t)}>{t}</Tag>)}
          <span style={{ flex: 1 }} />
          <span className="sys-label">sort</span>
          {[['recent', 'newest'], ['score', 'highest rated']].map(([v, l]) => (
            <button key={v} onClick={() => setSort(v)} style={{
              fontFamily: 'var(--font-mono)', fontSize: 11.5, padding: '5px 11px', borderRadius: 'var(--radius-pill)', cursor: 'pointer',
              border: '1px solid ' + (sort === v ? 'var(--accent-deep)' : 'var(--line-2)'),
              background: sort === v ? 'var(--accent-wash)' : 'transparent',
              color: sort === v ? 'var(--accent-bright)' : 'var(--ink-3)',
            }}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ flex: 1, height: 1, background: 'var(--line-1)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>{String(reviews.length).padStart(2, '0')} entries</span>
        </div>

        {/* list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {sorted.map((p) => (
            <ReviewCard key={p.slug}
              subject={p.subject} version={p.version} oneLiner={p.description}
              score={p.r.score} verdict={p.r.verdict} date={p.date} topics={p.topics}
              href="#" onClick={(e) => { e.preventDefault(); onOpenPost(p.slug); }} />
          ))}
        </div>
      </div>
    );
  }

  function Stat({ label, value }) {
    return (
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 6 }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ink-1)', lineHeight: 1 }}>{value}</div>
      </div>
    );
  }

  window.KIT_REVIEWS = { ReviewsView };
})();
