/* meese.rs UI kit — TopicsView: the topic index */
(function () {
  const { Icon } = window.KIT_CHROME;
  const { POSTS, TOPICS } = window.KIT_DATA;

  function TopicsView({ onTopic, onBack, backLabel }) {
    // live counts from POSTS
    const counts = {};
    POSTS.forEach((p) => p.topics.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
    const list = TOPICS.map((t) => ({ ...t, count: counts[t.slug] || t.count }))
      .sort((a, b) => b.count - a.count);

    return (
      <div style={{ maxWidth: 'var(--max-shell)', margin: '0 auto', padding: '28px 24px 24px' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12,
          color: 'var(--ink-3)', textDecoration: 'none', marginBottom: 24,
        }}>
          <Icon name="arrow-left" size={13} /> back to {backLabel || 'index'}
        </a>

        <h1 style={{ fontSize: 'var(--text-3xl)', lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0 }}>Topics</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--ink-2)', lineHeight: 1.6, margin: '14px 0 0', maxWidth: '56ch' }}>
          The higher-level threads running through the writing. Open one for everything filed under it.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))', gap: 12, marginTop: 28 }}>
          {list.map((t) => <TopicCard key={t.slug} t={t} onTopic={onTopic} />)}
        </div>
      </div>
    );
  }

  function TopicCard({ t, onTopic }) {
    const [hover, setHover] = React.useState(false);
    return (
      <a href="#" onClick={(e) => { e.preventDefault(); onTopic(t.slug); }}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          position: 'relative', display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none',
          padding: '16px 18px', borderRadius: 'var(--radius-md)',
          background: hover ? 'var(--surface-2)' : 'var(--surface-1)',
          border: '1px solid ' + (hover ? 'var(--line-2)' : 'var(--line-1)'),
          transition: 'all var(--dur-1) var(--ease-out)', transform: hover ? 'translateY(-2px)' : 'none',
        }}>
        <span style={{ width: 9, height: 9, borderRadius: 999, background: t.hue, boxShadow: hover ? '0 0 9px -1px ' + t.hue : 'none', flex: 'none' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: hover ? 'var(--ink-1)' : 'var(--ink-2)' }}>{t.label}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-4)' }}>{String(t.count).padStart(2, '0')}</span>
        <Icon name="arrow-right" size={14} color={hover ? 'var(--accent)' : 'var(--ink-4)'} />
      </a>
    );
  }

  window.KIT_TOPICS = { TopicsView };
})();
