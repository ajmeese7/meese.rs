/* meese.rs UI kit — ReviewView (full software / library review layout) */
(function () {
  const { Badge, Tag } = window.KIT;
  const { Icon } = window.KIT_CHROME;
  const { REVIEWS, POSTS } = window.KIT_DATA;

  function Stars({ score, size = 15 }) {
    const pct = Math.max(0, Math.min(100, (score / 5) * 100));
    return (
      <span style={{ position: 'relative', display: 'inline-block', fontSize: size, lineHeight: 1, letterSpacing: '2px', fontFamily: 'var(--font-mono)' }}>
        <span style={{ color: 'var(--line-3)' }}>★★★★★</span>
        <span style={{ position: 'absolute', left: 0, top: 0, width: pct + '%', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--accent)' }}>★★★★★</span>
      </span>
    );
  }

  const VERDICT = { recommended: 'var(--green)', caveats: 'var(--gold)', watch: 'var(--accent)', skip: 'var(--red)' };

  function ReviewView({ slug, onBack, backLabel, onOpenPost }) {
    const r = REVIEWS[slug] || REVIEWS[Object.keys(REVIEWS)[0]];
    const vcolor = VERDICT[r.verdict] || 'var(--green)';
    const related = POSTS.filter((p) => p.slug !== slug && p.topics.some((t) => (r.topics || []).includes(t)));

    return (
      <div style={{ maxWidth: 'var(--max-shell)', margin: '0 auto', padding: '28px 24px 24px' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12,
          color: 'var(--ink-3)', textDecoration: 'none', marginBottom: 28,
        }}>
          <Icon name="arrow-left" size={13} /> back to {backLabel || 'index'}
        </a>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 300px', gap: 44, alignItems: 'start' }}>
          {/* main */}
          <div>
            {/* header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Badge type="review" />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', fontWeight: 600, letterSpacing: '0.1em', color: vcolor,
                border: '1px solid color-mix(in srgb, ' + vcolor + ' 40%, transparent)', background: 'color-mix(in srgb, ' + vcolor + ' 12%, transparent)',
                borderRadius: 'var(--radius-xs)', height: 20, padding: '0 7px', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap',
              }}>{(r.verdictLabel || r.verdict).toUpperCase()}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--ink-3)' }}>reviewed {r.reviewed}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'var(--text-3xl)', lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0 }}>{r.subject}</h1>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-md)', color: 'var(--ink-4)' }}>{r.version}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--ink-2)', lineHeight: 1.6, margin: '14px 0 0', maxWidth: '60ch' }}>{r.tagline}</p>

            {/* overall score band */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 22, padding: '16px 18px', background: 'var(--surface-1)', border: '1px solid var(--line-1)', borderLeft: '2px solid var(--accent)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 700, color: 'var(--ink-1)', lineHeight: 1 }}>{r.score.toFixed(1)}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ink-4)' }}>/ 5</span>
              </div>
              <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--line-2)' }} />
              <Stars score={r.score} size={20} />
              <span style={{ flex: 1 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                {r.links.map(([k, v]) => (
                  <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-3)', border: '1px solid var(--line-2)', borderRadius: 'var(--radius-sm)', padding: '5px 9px' }}>
                    <Icon name={k === 'repo' ? 'github' : 'book-open'} size={12} />{v}
                  </span>
                ))}
              </div>
            </div>

            {/* meta strip */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 24px', marginTop: 16 }}>
              {r.meta.map(([k, v]) => (
                <span key={k} style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-4)' }}>
                  {k}: <span style={{ color: 'var(--ink-2)' }}>{v}</span>
                </span>
              ))}
            </div>

            {/* score breakdown */}
            <div className="sys-label" style={{ margin: '34px 0 14px' }}>// score breakdown</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {r.criteria.map(([name, s, note]) => (
                <div key={name} style={{ display: 'grid', gridTemplateColumns: '170px 120px 1fr', gap: 16, alignItems: 'start' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 600, color: 'var(--ink-1)' }}>{name}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                    <Stars score={s} size={13} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-3)' }}>{s.toFixed(1)}</span>
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.5 }}>{note}</span>
                </div>
              ))}
            </div>

            {/* pros / cons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 30 }}>
              <ProsCons title="Pros" items={r.pros} icon="plus" color="var(--green)" />
              <ProsCons title="Cons" items={r.cons} icon="minus" color="var(--red)" />
            </div>

            {/* verdict prose */}
            <article className="prose" style={{ marginTop: 36, maxWidth: 'none' }}>
              {r.body.map(([h, p]) => (
                <React.Fragment key={h}>
                  <h2 style={{ fontSize: 'var(--text-xl)' }}>{h}</h2>
                  <p dangerouslySetInnerHTML={{ __html: p.replace(/`([^`]+)`/g, '<code>$1</code>') }} />
                </React.Fragment>
              ))}
            </article>

            {/* bottom line */}
            <div style={{ marginTop: 28, padding: '18px 20px', background: 'color-mix(in srgb, var(--accent) 9%, var(--surface-1))', border: '1px solid var(--accent-line)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', color: 'var(--accent)', marginBottom: 8 }}>// THE BOTTOM LINE</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', lineHeight: 1.6, color: 'var(--ink-1)', margin: 0 }}>{r.bottomLine}</p>
            </div>
          </div>

          {/* sidebar: verdict summary */}
          <aside style={{ position: 'sticky', top: 'calc(var(--header-height) + 24px)', display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ position: 'relative', padding: 20, background: 'var(--surface-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--radius-md)' }}>
              <Reticle />
              <div className="sys-label" style={{ marginBottom: 14 }}>// verdict</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 700, color: 'var(--ink-1)', lineHeight: 1 }}>{r.score.toFixed(1)}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--ink-4)' }}>/ 5</span>
              </div>
              <Stars score={r.score} size={18} />
              <div style={{ marginTop: 14, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: vcolor }}>{(r.verdictLabel || '').toUpperCase()}</div>
            </div>
            {related.length ? (
              <div>
                <div className="sys-label" style={{ marginBottom: 12 }}>// related</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {related.slice(0, 3).map((p) => (
                    <a key={p.slug} href="#" onClick={(e) => { e.preventDefault(); onOpenPost(p.slug); }} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 8px', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <Badge type={p.type} />
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.3 }}>{p.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    );
  }

  function ProsCons({ title, items, icon, color }) {
    return (
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--radius-md)', padding: '16px 18px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: color, marginBottom: 12 }}>{title}</div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
          {items.map((it, i) => (
            <li key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <span style={{ display: 'inline-flex', color: color, marginTop: 2, flex: 'none' }}><Icon name={icon} size={13} /></span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.45 }}>{it}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  function Reticle() {
    const c = { position: 'absolute', width: 10, height: 10, border: '1.5px solid var(--accent-deep)' };
    return (
      <>
        <span style={{ ...c, top: 7, left: 7, borderRight: 0, borderBottom: 0 }} />
        <span style={{ ...c, top: 7, right: 7, borderLeft: 0, borderBottom: 0 }} />
        <span style={{ ...c, bottom: 7, left: 7, borderRight: 0, borderTop: 0 }} />
        <span style={{ ...c, bottom: 7, right: 7, borderLeft: 0, borderTop: 0 }} />
      </>
    );
  }

  window.KIT_REVIEW = { ReviewView };
})();
