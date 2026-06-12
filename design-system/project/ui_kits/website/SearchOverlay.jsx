/* meese.rs UI kit — SearchOverlay (static Pagefind-style search) */
(function () {
  const { Badge, Input, Tag } = window.KIT;
  const { Icon } = window.KIT_CHROME;
  const { POSTS } = window.KIT_DATA;

  const TYPES = ['guide', 'note', 'devlog', 'essay', 'lab', 'reference'];

  function SearchOverlay({ onClose, onOpenPost }) {
    const [q, setQ] = React.useState('');
    const [typeFilter, setTypeFilter] = React.useState(null);
    const inputRef = React.useRef(null);
    React.useEffect(() => { const t = setTimeout(() => { const el = document.getElementById('kit-search-input'); el && el.focus(); }, 30); return () => clearTimeout(t); }, []);

    const results = POSTS.filter((p) => {
      if (typeFilter && p.type !== typeFilter) return false;
      if (!q.trim()) return true;
      const hay = (p.title + ' ' + p.description + ' ' + p.topics.join(' ') + ' ' + p.tags.join(' ')).toLowerCase();
      return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
    });

    return (
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 1000, background: 'color-mix(in srgb, var(--bg-void) 70%, transparent)',
        backdropFilter: 'var(--blur-overlay)', WebkitBackdropFilter: 'var(--blur-overlay)',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '12vh 20px 20px',
      }}>
        <div onClick={(e) => e.stopPropagation()} style={{
          width: '100%', maxWidth: 640, background: 'var(--surface-1)', border: '1px solid var(--line-2)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-3)', overflow: 'hidden',
        }}>
          {/* input row */}
          <div style={{ padding: 14, borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 12px', background: 'var(--surface-well)', border: '1px solid var(--line-2)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>/</span>
              <input id="kit-search-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the index…"
                style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink-1)', fontFamily: 'var(--font-mono)', fontSize: 14 }} />
            </div>
            <button onClick={onClose} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-4)', background: 'var(--surface-2)', border: '1px solid var(--line-1)', borderRadius: 3, padding: '4px 7px', cursor: 'pointer' }}>ESC</button>
          </div>

          {/* filters */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="sys-label" style={{ marginRight: 2 }}>type</span>
            <Tag active={!typeFilter} onClick={() => setTypeFilter(null)}>all</Tag>
            {TYPES.map((t) => <Tag key={t} active={typeFilter === t} onClick={() => setTypeFilter(typeFilter === t ? null : t)}>{t}</Tag>)}
          </div>

          {/* results */}
          <div style={{ maxHeight: '48vh', overflowY: 'auto' }}>
            {results.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-4)' }}>
                no entries match "<span style={{ color: 'var(--ink-2)' }}>{q}</span>"
              </div>
            ) : results.map((p, i) => (
              <a key={p.slug} href="#" onClick={(e) => { e.preventDefault(); onOpenPost(p.slug); }} style={{
                display: 'block', padding: '14px 16px', textDecoration: 'none',
                borderTop: i === 0 ? 'none' : '1px solid var(--line-faint)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 5 }}>
                  <Badge type={p.type} />
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--ink-1)' }}>{p.title}</span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>{p.date}</span>
                </div>
                <Excerpt text={p.description} q={q} />
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {p.topics.map((t) => <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)' }}>#{t}</span>)}
                </div>
              </a>
            ))}
          </div>

          {/* footer */}
          <div style={{ padding: '9px 16px', borderTop: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-well)' }}>
            <Icon name="zap" size={12} color="var(--ink-4)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>
              static index · {String(results.length).padStart(2, '0')} / {String(POSTS.length).padStart(2, '0')} entries
            </span>
          </div>
        </div>
      </div>
    );
  }

  function Excerpt({ text, q }) {
    const term = q.trim().split(/\s+/)[0];
    if (!term) return <p style={ex}>{text}</p>;
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    if (idx < 0) return <p style={ex}>{text}</p>;
    return (
      <p style={ex}>
        {text.slice(0, idx)}
        <mark style={{ background: 'var(--cyan-wash-2)', color: 'var(--cyan-bright)', padding: '0 2px', borderRadius: 2 }}>{text.slice(idx, idx + term.length)}</mark>
        {text.slice(idx + term.length)}
      </p>
    );
  }
  const ex = { fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.5, margin: 0, maxWidth: '64ch' };

  window.KIT_SEARCH = { SearchOverlay };
})();
