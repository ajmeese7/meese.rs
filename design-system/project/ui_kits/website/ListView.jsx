/* meese.rs UI kit — ListView: filtered feed for Guides / Notes / all writing / topics */
(function () {
  const { PostCard, NoteCard, ReviewCard, Tag } = window.KIT;
  const { Icon } = window.KIT_CHROME;
  const { POSTS, REVIEWS } = window.KIT_DATA;

  function baseSet(spec) {
    if (spec.kind === 'type') return POSTS.filter((p) => p.type === spec.value);
    if (spec.kind === 'topic') return POSTS.filter((p) => p.topics.includes(spec.value));
    return POSTS.filter((p) => p.type !== 'review'); // 'all' = writing
  }

  function renderCard(p, onOpenPost, onTopic) {
    const open = (e) => { e.preventDefault(); onOpenPost(p.slug); };
    if (p.type === 'review') {
      const r = REVIEWS[p.slug] || {};
      return <ReviewCard key={p.slug} subject={p.subject} version={p.version} oneLiner={p.description}
        score={r.score} verdict={r.verdict} date={p.date} topics={p.topics} href="#" onClick={open} />;
    }
    if (p.type === 'note') {
      return <NoteCard key={p.slug} title={p.title} body={p.description} date={p.date} href="#" onClick={open} />;
    }
    return <PostCard key={p.slug} title={p.title} description={p.description} type={p.type} date={p.date}
      updated={p.updated} readingTime={p.readingTime} topics={p.topics} featured={p.featured} href="#" onClick={open} />;
  }

  function ListView({ spec, onOpenPost, onBack, backLabel, onTopic }) {
    const [topic, setTopic] = React.useState(null);
    React.useEffect(() => { setTopic(null); }, [spec.kind, spec.value]);

    const base = baseSet(spec).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    const topics = [...new Set(base.flatMap((p) => p.topics))].sort();
    const visible = topic ? base.filter((p) => p.topics.includes(topic)) : base;

    return (
      <div style={{ maxWidth: 'var(--max-shell)', margin: '0 auto', padding: '28px 24px 24px' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12,
          color: 'var(--ink-3)', textDecoration: 'none', marginBottom: 24,
        }}>
          <Icon name="arrow-left" size={13} /> back to {backLabel || 'index'}
        </a>

        <h1 style={{ fontSize: 'var(--text-3xl)', lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0 }}>{spec.title}</h1>
        {spec.subtitle ? (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--ink-2)', lineHeight: 1.6, margin: '14px 0 0', maxWidth: '58ch' }}>{spec.subtitle}</p>
        ) : null}

        {/* topic filter */}
        {topics.length > 1 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', margin: '24px 0 6px' }}>
            <span className="sys-label" style={{ marginRight: 2 }}>topic</span>
            <Tag active={!topic} onClick={() => setTopic(null)}>all</Tag>
            {topics.map((t) => <Tag key={t} active={topic === t} onClick={() => setTopic(topic === t ? null : t)}>{t}</Tag>)}
          </div>
        ) : null}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 16px' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--line-1)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>{String(visible.length).padStart(2, '0')} entries</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {visible.map((p) => renderCard(p, onOpenPost, onTopic))}
          {visible.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-4)' }}>no entries here yet</div>
          ) : null}
        </div>
      </div>
    );
  }

  window.KIT_LIST = { ListView };
})();
