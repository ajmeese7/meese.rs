/* meese.rs UI kit — PostView (long-form reading page, block-rendered per post) */
(function () {
  const { Badge, Tag, Callout } = window.KIT;
  const { Icon } = window.KIT_CHROME;
  const { POSTS, BODIES } = window.KIT_DATA;

  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const inline = (s) => (s || '')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  function Corners({ c = 'var(--accent-deep)' }) {
    const s = { position: 'absolute', width: 11, height: 11, border: '1.5px solid ' + c };
    return (
      <>
        <span style={{ ...s, top: 8, left: 8, borderRight: 0, borderBottom: 0 }} />
        <span style={{ ...s, top: 8, right: 8, borderLeft: 0, borderBottom: 0 }} />
        <span style={{ ...s, bottom: 8, left: 8, borderRight: 0, borderTop: 0 }} />
        <span style={{ ...s, bottom: 8, right: 8, borderLeft: 0, borderTop: 0 }} />
      </>
    );
  }

  function Figure({ caption, kind }) {
    const icon = { screenshot: 'image', diagram: 'git-fork', chart: 'bar-chart-3' }[kind] || 'image';
    return (
      <figure style={{ margin: '26px 0' }}>
        <div style={{
          position: 'relative', height: 210, borderRadius: 'var(--radius-md)', border: '1px solid var(--line-2)',
          overflow: 'hidden', background: 'var(--bg-void)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundImage: 'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}>
          <Corners c="var(--accent-dim)" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <Icon name={icon} size={30} color="var(--accent)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>
              {kind || 'figure'} · placeholder
            </span>
          </div>
        </div>
        <figcaption style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)', marginTop: 10, lineHeight: 1.5 }}>{caption}</figcaption>
      </figure>
    );
  }

  function Block({ b }) {
    const [t] = b;
    if (t === 'h') return <h2 id={slugify(b[1])} style={{ fontSize: 'var(--text-xl)' }}>{b[1]}</h2>;
    if (t === 'p') return <p dangerouslySetInnerHTML={{ __html: inline(b[1]) }} />;
    if (t === 'code') return <pre><code>{b[1]}</code></pre>;
    if (t === 'quote') return <blockquote>{b[1]}</blockquote>;
    if (t === 'ul') return <ul>{b[1].map((it, i) => <li key={i} dangerouslySetInnerHTML={{ __html: inline(it) }} />)}</ul>;
    if (t === 'callout') return <div style={{ margin: '20px 0' }}><Callout type={b[1]} title={b[2]}>{b[3]}</Callout></div>;
    if (t === 'figure') return <Figure caption={b[1]} kind={b[2]} />;
    if (t === 'table') {
      const [head, ...rows] = b[1];
      return (
        <table>
          <thead><tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
        </table>
      );
    }
    return null;
  }

  function PostView({ slug, onOpenPost, onBack, backLabel, onTopic }) {
    const post = POSTS.find((p) => p.slug === slug) || POSTS[0];
    const body = BODIES[post.slug] || [];
    const toc = body.filter((b) => b[0] === 'h').map((b) => [slugify(b[1]), b[1]]);
    const related = POSTS.filter((p) => p.slug !== post.slug && p.type !== 'review' && p.topics.some((t) => post.topics.includes(t))).slice(0, 2);
    const sameTopic = POSTS.filter((p) => p.slug !== post.slug && p.type !== 'review').slice(0, 3);

    return (
      <div style={{ maxWidth: 'var(--max-shell)', margin: '0 auto', padding: '28px 24px 24px' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12,
          color: 'var(--ink-3)', textDecoration: 'none', marginBottom: 28,
        }}>
          <Icon name="arrow-left" size={13} /> back to {backLabel || 'index'}
        </a>

        <header style={{ maxWidth: '74ch', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <Badge type={post.type} />
            {post.updated ? <Badge status="updated" /> : null}
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
              {post.date}{post.readingTime ? '  ·  ' + post.readingTime : ''}
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--text-3xl)', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0, textWrap: 'balance' }}>{post.title}</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-md)', color: 'var(--ink-2)', lineHeight: 1.6, marginTop: 16 }}>{post.description}</p>
          <div style={{ display: 'flex', gap: 6, marginTop: 18, flexWrap: 'wrap' }}>
            {post.topics.map((t) => <Tag key={t} href="#" onClick={(e) => { e.preventDefault(); onTopic(t); }}>{t}</Tag>)}
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: toc.length ? '200px minmax(0,1fr)' : 'minmax(0,1fr)', gap: 48, marginTop: 36, alignItems: 'start' }}>
          {toc.length ? (
            <nav style={{ position: 'sticky', top: 'calc(var(--header-height) + 24px)' }}>
              <div className="sys-label" style={{ marginBottom: 12 }}>// on this page</div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2, borderLeft: '1px solid var(--line-1)' }}>
                {toc.map(([id, label], i) => (
                  <li key={id}>
                    <a href={'#' + id} style={{
                      display: 'block', padding: '5px 0 5px 14px', marginLeft: '-1px',
                      borderLeft: '2px solid ' + (i === 0 ? 'var(--accent)' : 'transparent'),
                      fontFamily: 'var(--font-mono)', fontSize: 12, textDecoration: 'none',
                      color: i === 0 ? 'var(--accent-bright)' : 'var(--ink-3)',
                    }}>{label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <div>
            {post.updated ? <UpdateBanner date={post.updated} /> : null}
            <article className="prose">
              {body.map((b, i) => <Block key={i} b={b} />)}
            </article>

            <section style={{ marginTop: 56, borderTop: '1px solid var(--line-1)', paddingTop: 28 }}>
              {related.length ? (
                <>
                  <div className="sys-label" style={{ marginBottom: 16 }}>// related</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {related.map((p) => <RelatedCard key={p.slug} post={p} onOpenPost={onOpenPost} />)}
                  </div>
                </>
              ) : null}
              <div className="sys-label" style={{ margin: '28px 0 12px' }}>// same topic</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {sameTopic.map((p, i) => (
                  <a key={p.slug} href="#" onClick={(e) => { e.preventDefault(); onOpenPost(p.slug); }} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0',
                    borderTop: i === 0 ? 'none' : '1px solid var(--line-faint)', textDecoration: 'none',
                  }}>
                    <Badge type={p.type} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 14.5, color: 'var(--ink-2)' }}>{p.title}</span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>{p.date}</span>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  function UpdateBanner({ date }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', marginBottom: 28,
        background: 'var(--green-wash)', border: '1px solid color-mix(in srgb, var(--green) 30%, transparent)',
        borderRadius: 'var(--radius-sm)',
      }}>
        <Icon name="refresh-cw" size={15} color="var(--green)" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--green)', letterSpacing: '0.02em' }}>UPDATED {date}</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 13.5, color: 'var(--ink-2)' }}>— revised since first publish.</span>
      </div>
    );
  }

  function RelatedCard({ post, onOpenPost }) {
    const [hover, setHover] = React.useState(false);
    return (
      <a href="#" onClick={(e) => { e.preventDefault(); onOpenPost(post.slug); }}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          display: 'block', textDecoration: 'none', padding: '14px 16px',
          background: hover ? 'var(--surface-2)' : 'var(--surface-1)',
          border: '1px solid ' + (hover ? 'var(--line-2)' : 'var(--line-1)'),
          borderRadius: 'var(--radius-md)', transition: 'all var(--dur-1) var(--ease-out)',
        }}>
        <div style={{ marginBottom: 8 }}><Badge type={post.type} /></div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: hover ? 'var(--accent-bright)' : 'var(--ink-1)', lineHeight: 1.3 }}>{post.title}</div>
      </a>
    );
  }

  window.KIT_POST = { PostView };
})();
