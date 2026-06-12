/* meese.rs UI kit — Home (latest-first system index) */
(function () {
  const { PostCard, NoteCard, Tag, ReviewCard } = window.KIT;
  const { Icon } = window.KIT_CHROME;
  const { POSTS, TOPICS, REVIEWS } = window.KIT_DATA;

  function SectionLabel({ children, action, onAction }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span className="sys-label" style={{ color: 'var(--ink-3)' }}>{children}</span>
        <span style={{ flex: 1, height: 1, background: 'var(--line-1)' }} />
        {action ? (
          <a href="#" onClick={(e) => { e.preventDefault(); onAction && onAction(); }} style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>{action}<Icon name="arrow-right" size={12} /></a>
        ) : null}
      </div>
    );
  }

  function Identity() {
    return (
      <div style={{ display: 'flex', gap: 28, alignItems: 'stretch', padding: '40px 0 8px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 420px', minWidth: 280 }}>
          <div className="sys-label" style={{ color: 'var(--cyan)', marginBottom: 14 }}>// system index</div>
          <h1 style={{ fontSize: 'var(--text-3xl)', lineHeight: 1.08, margin: 0, letterSpacing: '-0.02em' }}>
            Practical writing on software,<br />AI/devtools, and systems-building.
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--ink-2)', lineHeight: 1.6, margin: '18px 0 0', maxWidth: '54ch' }}>
            Tactical guides, dev logs, short notes, labs, and references — long and short
            in one feed. Built things, learned the tradeoffs, wrote them down.
          </p>
        </div>
        {/* reticle status panel */}
        <div style={{ position: 'relative', flex: '0 1 280px', minWidth: 240, background: 'var(--surface-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--radius-md)', padding: 22 }}>
          <Reticle />
          <div className="sys-label" style={{ color: 'var(--ink-3)', marginBottom: 16 }}>// index status</div>
          {[['entries', String(POSTS.length).padStart(2, '0')], ['topics', String(TOPICS.length).padStart(2, '0')], ['last write', '2026-06-11'], ['build', 'static · pagefind']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--line-faint)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
              <span style={{ color: 'var(--ink-4)' }}>{k}</span>
              <span style={{ color: 'var(--ink-1)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function Reticle() {
    const c = { position: 'absolute', width: 11, height: 11, border: '1.5px solid var(--cyan-deep)' };
    return (
      <>
        <span style={{ ...c, top: 7, left: 7, borderRight: 0, borderBottom: 0 }} />
        <span style={{ ...c, top: 7, right: 7, borderLeft: 0, borderBottom: 0 }} />
        <span style={{ ...c, bottom: 7, left: 7, borderRight: 0, borderTop: 0 }} />
        <span style={{ ...c, bottom: 7, right: 7, borderLeft: 0, borderTop: 0 }} />
      </>
    );
  }

  function TopicRow({ t, onTopic }) {
    const [hover, setHover] = React.useState(false);
    return (
      <a href="#" onClick={(e) => { e.preventDefault(); onTopic(t.slug); }}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 'var(--radius-sm)',
          textDecoration: 'none', background: hover ? 'var(--surface-2)' : 'transparent',
          transition: 'background var(--dur-1) var(--ease-out)',
        }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: t.hue, flex: 'none' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: hover ? 'var(--ink-1)' : 'var(--ink-2)' }}>{t.label}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>{String(t.count).padStart(2, '0')}</span>
      </a>
    );
  }

  function GraphTeaser({ onOpenGraph }) {
    return (
      <a href="#" onClick={(e) => { e.preventDefault(); onOpenGraph(); }} style={{
        display: 'block', position: 'relative', textDecoration: 'none', borderRadius: 'var(--radius-md)',
        border: '1px solid var(--line-1)', overflow: 'hidden', background: 'var(--bg-void)',
      }}>
        <div style={{
          height: 132, position: 'relative',
          backgroundImage: 'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}>
          <svg viewBox="0 0 240 132" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <line x1="60" y1="44" x2="120" y2="80" stroke="var(--line-2)" strokeWidth="1" />
            <line x1="120" y1="80" x2="186" y2="50" stroke="var(--line-2)" strokeWidth="1" />
            <line x1="120" y1="80" x2="96" y2="112" stroke="var(--line-2)" strokeWidth="1" />
            <line x1="186" y1="50" x2="60" y2="44" stroke="var(--line-2)" strokeWidth="1" />
            <circle cx="120" cy="80" r="8" fill="var(--ember)" />
            <circle cx="60" cy="44" r="5.5" fill="var(--cyan)" />
            <circle cx="186" cy="50" r="6" fill="var(--cyan)" />
            <circle cx="96" cy="112" r="4.5" fill="var(--hue-violet)" />
          </svg>
        </div>
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid var(--line-1)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--ink-1)' }}>Concept graph</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>posts · topics · backlinks</div>
          </div>
          <span style={{ flex: 1 }} />
          <Icon name="git-fork" size={18} color="var(--ink-3)" />
        </div>
      </a>
    );
  }

  function FeaturedReview({ onOpenPost, onOpenReviews }) {
    const reviews = POSTS.filter((p) => p.type === 'review').sort((a, b) => (a.date < b.date ? 1 : -1));
    const post = reviews[0];
    if (!post || !ReviewCard) return null;
    const r = REVIEWS[post.slug] || {};
    return (
      <div style={{ marginBottom: 30 }}>
        <SectionLabel action={`all reviews · ${String(reviews.length).padStart(2, '0')}`} onAction={onOpenReviews}>// latest review</SectionLabel>
        <ReviewCard subject={post.subject} version={post.version} oneLiner={post.description}
          score={r.score} verdict={r.verdict} date={post.date} topics={post.topics}
          href="#" onClick={(e) => { e.preventDefault(); onOpenPost(post.slug); }} />
      </div>
    );
  }

  function Home({ onOpenPost, onOpenGraph, onOpenReviews, onSearch, onTopic }) {
    return (
      <div style={{ maxWidth: 'var(--max-shell)', margin: '0 auto', padding: '0 24px 24px' }}>
        <Identity />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 40, marginTop: 36, alignItems: 'start' }}>
          {/* feed */}
          <div>
            <FeaturedReview onOpenPost={onOpenPost} onOpenReviews={onOpenReviews} />
            <SectionLabel action={`all writing · ${String(POSTS.filter((p) => p.type !== 'review').length).padStart(2, '0')}`} onAction={() => onTopic('all')}>// latest writing</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {POSTS.filter((p) => p.type !== 'review').map((p) => p.type === 'note'
                ? <NoteCard key={p.slug} title={p.title} body={p.description} date={p.date} href="#" onClick={(e) => { e.preventDefault(); onOpenPost(p.slug); }} />
                : <PostCard key={p.slug} title={p.title} description={p.description} type={p.type} date={p.date} updated={p.updated} readingTime={p.readingTime} topics={p.topics} featured={p.featured} href="#" onClick={(e) => { e.preventDefault(); onOpenPost(p.slug); }} />
              )}
            </div>
          </div>
          {/* sidebar */}
          <aside style={{ position: 'sticky', top: 'calc(var(--header-height) + 24px)', display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div>
              <SectionLabel action="topics" onAction={() => onTopic('index')}>// active topics</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {TOPICS.slice(0, 6).map((t) => <TopicRow key={t.slug} t={t} onTopic={onTopic} />)}
              </div>
            </div>
            <div>
              <SectionLabel>// graph</SectionLabel>
              <GraphTeaser onOpenGraph={onOpenGraph} />
            </div>
            <div>
              <SectionLabel>// search</SectionLabel>
              <button onClick={onSearch} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                background: 'var(--surface-well)', border: '1px solid var(--line-2)', borderRadius: 'var(--radius-md)',
                color: 'var(--ink-3)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 13,
              }}>
                <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>/</span>
                <span>Search the index…</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  window.KIT_HOME = { Home };
})();
