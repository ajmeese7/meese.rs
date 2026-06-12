/* meese.rs UI kit — GraphView (sleek branded concept graph) */
(function () {
  const { Badge, Button } = window.KIT;
  const { Icon } = window.KIT_CHROME;
  const { GRAPH, TYPE_HUE, POSTS } = window.KIT_DATA;

  const W = 1000, H = 640;
  const px = (n) => ({ x: n.x * W, y: n.y * H });

  // adjacency
  const adj = {};
  GRAPH.nodes.forEach((n) => (adj[n.id] = new Set()));
  GRAPH.edges.forEach(([a, b]) => { adj[a] && adj[a].add(b); adj[b] && adj[b].add(a); });

  function hueOf(n) { return n.kind === 'topic' ? 'var(--accent)' : (TYPE_HUE[n.kind] || 'var(--hue-slate)'); }

  const LEGEND = [
    ['topic', 'var(--accent)'], ['guide', 'var(--hue-cyan)'], ['devlog', 'var(--hue-green)'],
    ['note', 'var(--hue-slate)'], ['essay', 'var(--hue-violet)'], ['lab', 'var(--hue-gold)'], ['reference', 'var(--hue-rose)'],
  ];

  function GraphView({ onOpenPost, onTopic }) {
    const [sel, setSel] = React.useState('t:react-native');
    const [hover, setHover] = React.useState(null);
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => { const id = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(id); }, []);

    const focus = hover || sel;
    const active = React.useMemo(() => {
      if (!focus) return null;
      const s = new Set([focus]); adj[focus] && adj[focus].forEach((x) => s.add(x)); return s;
    }, [focus]);
    const isOn = (id) => !active || active.has(id);
    const edgeOn = (a, b) => !focus || a === focus || b === focus;

    const selNode = GRAPH.nodes.find((n) => n.id === sel);
    const selNeighbors = selNode ? GRAPH.nodes.filter((n) => adj[sel] && adj[sel].has(n.id)) : [];

    return (
      <div style={{ position: 'relative', height: 'calc(100vh - var(--header-height))', overflow: 'hidden', background: 'var(--bg-void)' }}>
        {/* grid backdrop */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }} />
        {/* reticle corners */}
        <Corners />

        {/* header */}
        <div style={{ position: 'absolute', top: 22, left: 26, zIndex: 3 }}>
          <div className="sys-label" style={{ color: 'var(--accent)' }}>// concept graph</div>
          <h2 style={{ fontSize: 'var(--text-2xl)', margin: '8px 0 0', letterSpacing: '-0.01em' }}>How the writing connects</h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink-3)', margin: '8px 0 0', maxWidth: '42ch' }}>
            Posts, notes, and the topics that bind them. Hover a node to trace its edges; click to inspect.
          </p>
        </div>

        {/* legend */}
        <div style={{ position: 'absolute', top: 24, right: 26, zIndex: 3, display: 'flex', flexWrap: 'wrap', gap: '8px 14px', maxWidth: 300, justifyContent: 'flex-end' }}>
          {LEGEND.map(([k, c]) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: c }} />{k}
            </span>
          ))}
        </div>

        {/* svg graph */}
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <g>
            {GRAPH.edges.map(([a, b], i) => {
              const na = GRAPH.nodes.find((n) => n.id === a), nb = GRAPH.nodes.find((n) => n.id === b);
              if (!na || !nb) return null;
              const pa = px(na), pb = px(nb), on = edgeOn(a, b);
              return <line key={i} x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                stroke={on && focus ? 'var(--accent-deep)' : 'var(--line-2)'}
                strokeWidth={on && focus ? 1.4 : 1}
                style={{ opacity: mounted ? (on ? 0.9 : 0.18) : 0, transition: 'opacity var(--dur-3) var(--ease-out), stroke var(--dur-2) var(--ease-out)' }} />;
            })}
          </g>
          <g>
            {GRAPH.nodes.map((n) => {
              const p = px(n), on = isOn(n.id), isSel = n.id === sel, isTopic = n.kind === 'topic';
              return (
                <g key={n.id} transform={`translate(${p.x},${p.y})`}
                  style={{ cursor: 'pointer', opacity: mounted ? (on ? 1 : 0.28) : 0, transition: 'opacity var(--dur-3) var(--ease-out)' }}
                  onMouseEnter={() => setHover(n.id)} onMouseLeave={() => setHover(null)}
                  onClick={() => setSel(n.id)}>
                  {isSel ? <circle r={n.r + 7} fill="none" stroke={hueOf(n)} strokeWidth="1" opacity="0.5" /> : null}
                  <circle r={n.r} fill={hueOf(n)} stroke="var(--bg-void)" strokeWidth="2"
                    style={{ filter: (isSel || n.id === hover) ? 'drop-shadow(0 0 8px ' + hueOf(n) + ')' : 'none' }} />
                  <text x={n.r + 7} y={4} fill={on ? (isTopic ? 'var(--ink-1)' : 'var(--ink-2)') : 'var(--ink-4)'}
                    style={{ fontFamily: isTopic ? 'var(--font-mono)' : 'var(--font-body)', fontSize: isTopic ? 14 : 12.5, fontWeight: isTopic ? 600 : 400, letterSpacing: isTopic ? '0.02em' : 0 }}>
                    {n.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* details panel */}
        {selNode ? (
          <div style={{
            position: 'absolute', bottom: 24, left: 26, zIndex: 3, width: 320,
            background: 'color-mix(in srgb, var(--surface-2) 92%, transparent)', backdropFilter: 'var(--blur-overlay)',
            border: '1px solid var(--line-2)', borderRadius: 'var(--radius-md)', padding: 18,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              {selNode.kind === 'topic'
                ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--accent)', background: 'var(--accent-wash)', border: '1px solid color-mix(in srgb, var(--accent) 38%, transparent)', borderRadius: 'var(--radius-xs)', height: 20, padding: '0 7px', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', flex: 'none' }}>[ TOPIC ]</span>
                : <Badge type={selNode.kind} />}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>{selNeighbors.length} edges</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, color: 'var(--ink-1)', marginBottom: 12 }}>{selNode.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 14, maxHeight: 132, overflowY: 'auto' }}>
              {selNeighbors.map((nb) => (
                <button key={nb.id} onClick={() => setSel(nb.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'transparent',
                  border: 'none', borderRadius: 'var(--radius-xs)', cursor: 'pointer', textAlign: 'left',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: hueOf(nb), flex: 'none' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nb.label}</span>
                </button>
              ))}
            </div>
            <Button variant="accent" size="sm" fullWidth
              onClick={() => selNode.kind === 'topic' ? onTopic(selNode.label) : onOpenPost(selNode.id)}>
              {selNode.kind === 'topic' ? 'Open topic →' : 'Read post →'}
            </Button>
          </div>
        ) : null}

        {/* a11y fallback */}
        <p style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          This graph shows relationships between posts, notes, topics, and tags. Use the Topics page or Search page for a non-visual navigation path.
        </p>
      </div>
    );
  }

  function Corners() {
    const c = { position: 'absolute', width: 16, height: 16, border: '1.5px solid var(--accent-dim)', zIndex: 2 };
    return (
      <>
        <span style={{ ...c, top: 14, left: 14, borderRight: 0, borderBottom: 0 }} />
        <span style={{ ...c, top: 14, right: 14, borderLeft: 0, borderBottom: 0 }} />
        <span style={{ ...c, bottom: 14, left: 14, borderRight: 0, borderTop: 0 }} />
        <span style={{ ...c, bottom: 14, right: 14, borderLeft: 0, borderTop: 0 }} />
      </>
    );
  }

  window.KIT_GRAPH = { GraphView };
})();
