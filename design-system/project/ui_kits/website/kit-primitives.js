/* meese.rs UI kit — primitive resolver.
   Uses the real design-system bundle when present; falls back to minimal
   inline versions so the kit still renders in preview before the bundle
   is compiled. Post-compile, window.MeeseRsDesignSystem_ed1971 wins. */
(function () {
  const DS = window.MeeseRsDesignSystem_ed1971 || {};
  const h = React.createElement;

  const TYPE = {
    guide: ['GUIDE', 'var(--hue-cyan)'], note: ['NOTE', 'var(--hue-slate)'],
    devlog: ['DEVLOG', 'var(--hue-green)'], essay: ['ESSAY', 'var(--hue-violet)'],
    lab: ['LAB', 'var(--hue-gold)'], reference: ['REF', 'var(--hue-rose)'], review: ['REVIEW', 'var(--accent)'],
  };
  const STATUS = {
    updated: ['UPDATED', 'var(--green)'], corrected: ['CORRECTED', 'var(--gold)'],
    deprecated: ['DEPRECATED', 'var(--red)'], superseded: ['SUPERSEDED', 'var(--hue-slate)'], pinned: ['PINNED', 'var(--accent)'],
  };

  // Leading type-badge glyphs (the 7 post types), matching Icon.jsx geometry.
  const TYPE_GLYPH = {
    guide: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    note: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
    devlog: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
    essay: '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" x2="2" y1="8" y2="22"/><line x1="17.5" x2="9" y1="15" y2="15"/>',
    lab: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    reference: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    review: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  };
  const glyph = (type) => h('svg', { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', style: { display: 'block', flex: 'none' }, 'aria-hidden': true, dangerouslySetInnerHTML: { __html: TYPE_GLYPH[type] || '' } });

  const Fallback = {
    Button: ({ children, variant = 'secondary', size = 'md', style, ...p }) =>
      h('button', { style: {
        fontFamily: 'var(--font-mono)', fontSize: size === 'sm' ? 11 : 14, fontWeight: 500,
        height: size === 'sm' ? 30 : size === 'lg' ? 46 : 38, padding: '0 16px',
        borderRadius: 'var(--radius-sm)', cursor: 'pointer', letterSpacing: '.02em',
        background: variant === 'primary' ? 'var(--accent)' : variant === 'ghost' ? 'transparent' : 'var(--surface-2)',
        color: variant === 'primary' ? 'var(--ink-inverse)' : 'var(--ink-1)',
        border: '1px solid ' + (variant === 'primary' ? 'var(--accent)' : variant === 'ghost' ? 'transparent' : 'var(--line-2)'),
        ...style }, ...p }, children),
    Badge: ({ type, status, children, bracketed, color, icon = true, style }) => {
      const p = type ? TYPE[type] : status ? STATUS[status] : null;
      const hue = color || (p ? p[1] : 'var(--ink-3)');
      const label = children != null ? children : (p ? p[0] : '');
      const showBracket = bracketed === undefined ? !type : bracketed;
      const withIcon = icon && type;
      return h('span', { style: {
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '.1em',
        gap: withIcon ? 5 : 0, height: 20, padding: withIcon ? '0 7px 0 6px' : '0 7px',
        display: 'inline-flex', alignItems: 'center',
        borderRadius: 'var(--radius-xs)', color: hue, whiteSpace: 'nowrap',
        background: 'color-mix(in srgb, ' + hue + ' 12%, transparent)',
        border: '1px solid color-mix(in srgb, ' + hue + ' 38%, transparent)', ...style },
      }, withIcon ? glyph(type) : null, showBracket ? '[ ' + label + ' ]' : label);
    },
    Tag: ({ children, href, active, onClick, style }) =>
      h(href ? 'a' : 'span', { href, onClick, style: {
        fontFamily: 'var(--font-mono)', fontSize: 11, height: 22, padding: '0 8px',
        display: 'inline-flex', alignItems: 'center', gap: 2, textDecoration: 'none',
        borderRadius: 'var(--radius-pill)', border: '1px solid ' + (active ? 'var(--accent-deep)' : 'var(--line-1)'),
        background: active ? 'var(--accent-wash)' : 'transparent',
        color: active ? 'var(--accent-bright)' : 'var(--ink-3)', cursor: href || onClick ? 'pointer' : 'default', whiteSpace: 'nowrap', ...style },
      }, h('span', { style: { color: 'var(--ink-4)' } }, '#'), children),
    Input: ({ variant, placeholder, value, onChange, style, ...p }) =>
      h('div', { style: {
        display: 'flex', alignItems: 'center', gap: 8, height: 40, padding: '0 12px',
        background: 'var(--surface-well)', border: '1px solid var(--line-2)',
        borderRadius: variant === 'search' ? 'var(--radius-md)' : 'var(--radius-sm)', ...style } },
        variant === 'search' ? h('span', { style: { fontFamily: 'var(--font-mono)', color: 'var(--ink-4)', fontWeight: 600 } }, '/') : null,
        h('input', { placeholder, value, onChange, style: {
          flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
          color: 'var(--ink-1)', fontFamily: variant === 'search' ? 'var(--font-mono)' : 'var(--font-body)', fontSize: 14 }, ...p })),
  };

  Fallback.PostCard = ({ title, description, type = 'guide', date, updated, readingTime, topics = [], featured, href = '#', onClick }) =>
    h('a', { href, onClick, style: {
      display: 'block', textDecoration: 'none', background: 'var(--surface-1)',
      border: '1px solid ' + (featured ? 'var(--line-2)' : 'var(--line-1)'),
      borderRadius: 'var(--radius-md)', padding: 'var(--space-6)', position: 'relative' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 } },
        h(Fallback.Badge, { type }),
        featured ? h(Fallback.Badge, { status: 'pinned' }) : null,
        h('span', { style: { flex: 1 } }),
        h('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' } }, date + (readingTime ? '  ·  ' + readingTime : ''))),
      h('h3', { style: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink-1)', margin: 0, lineHeight: 1.2 } }, title),
      description ? h('p', { style: { fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--ink-2)', lineHeight: 1.6, margin: '10px 0 0', maxWidth: '62ch' } }, description) : null,
      topics.length ? h('div', { style: { display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' } }, topics.map((t) => h(Fallback.Tag, { key: t, href: '#' }, t))) : null);

  Fallback.NoteCard = ({ title, body, date, href = '#', onClick }) =>
    h('a', { href, onClick, style: {
      display: 'flex', gap: 16, textDecoration: 'none', background: 'transparent',
      border: '1px solid var(--line-1)', borderLeft: '2px solid var(--hue-slate)',
      borderRadius: 'var(--radius-sm)', padding: 'var(--space-4) var(--space-5)' } },
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, flex: 'none' } },
        h(Fallback.Badge, { type: 'note' }),
        h('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' } }, date)),
      h('div', { style: { minWidth: 0 } },
        title ? h('div', { style: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink-1)', marginBottom: 4 } }, title) : null,
        h('p', { style: { fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-2)', lineHeight: 1.55, margin: 0 } }, body)));

  const CK = { note: ['NOTE', 'var(--accent)'], tip: ['TIP', 'var(--green)'], warning: ['WARNING', 'var(--gold)'], danger: ['DANGER', 'var(--red)'], context: ['CONTEXT', 'var(--violet)'] };
  Fallback.Callout = ({ type = 'note', title, children }) => {
    const k = CK[type] || CK.note;
    return h('div', { style: {
      background: 'color-mix(in srgb, ' + k[1] + ' 8%, var(--surface-1))',
      border: '1px solid color-mix(in srgb, ' + k[1] + ' 28%, transparent)',
      borderLeft: '2px solid ' + k[1], borderRadius: 'var(--radius-md)', padding: 'var(--space-4) var(--space-5)' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 } },
        h('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '.14em', color: k[1] } }, '// ' + k[0]),
        title ? h('span', { style: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink-1)' } }, title) : null),
      children ? h('div', { style: { fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--ink-2)', lineHeight: 1.6 } }, children) : null);
  };

  Fallback.Stars = ({ score = 0, size = 14 }) => {
    const pct = Math.max(0, Math.min(100, (score / 5) * 100));
    return h('span', { style: { position: 'relative', display: 'inline-block', fontSize: size, lineHeight: 1, letterSpacing: '2px', fontFamily: 'var(--font-mono)' } },
      h('span', { style: { color: 'var(--line-3)' } }, '\u2605\u2605\u2605\u2605\u2605'),
      h('span', { style: { position: 'absolute', left: 0, top: 0, width: pct + '%', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--accent)' } }, '\u2605\u2605\u2605\u2605\u2605'));
  };

  const VK = { recommended: 'var(--green)', caveats: 'var(--gold)', watch: 'var(--accent)', skip: 'var(--red)' };
  const VL = { recommended: 'RECOMMENDED', caveats: 'WITH CAVEATS', watch: 'ONE TO WATCH', skip: 'SKIP FOR NOW' };
  Fallback.ReviewCard = ({ subject, version, oneLiner, score = 0, verdict = 'recommended', date, topics = [], href = '#', onClick }) => {
    const c = VK[verdict] || VK.recommended;
    return h('a', { href, onClick, style: { display: 'block', textDecoration: 'none', background: 'var(--surface-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--radius-md)', padding: 'var(--space-6)' } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 } },
        h(Fallback.Badge, { type: 'review' }),
        h('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: c, border: '1px solid color-mix(in srgb, ' + c + ' 40%, transparent)', background: 'color-mix(in srgb, ' + c + ' 12%, transparent)', borderRadius: 'var(--radius-xs)', height: 20, padding: '0 7px', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' } }, VL[verdict] || ''),
        h('span', { style: { flex: 1 } }),
        h('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' } }, date)),
      h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' } },
        h('h3', { style: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--ink-1)', margin: 0, lineHeight: 1.15 } }, subject),
        version ? h('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--ink-4)' } }, version) : null),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 } },
        h(Fallback.Stars, { score, size: 15 }),
        h('span', { style: { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink-2)' } }, score.toFixed(1) + ' / 5')),
      oneLiner ? h('p', { style: { fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--ink-2)', lineHeight: 1.6, margin: '12px 0 0', maxWidth: '62ch' } }, oneLiner) : null,
      topics.length ? h('div', { style: { display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' } }, topics.map((t) => h(Fallback.Tag, { key: t, href: '#' }, t))) : null);
  };

  window.KIT = {
    Button: DS.Button || Fallback.Button,
    Badge: DS.Badge || Fallback.Badge,
    Tag: DS.Tag || Fallback.Tag,
    Input: DS.Input || Fallback.Input,
    PostCard: DS.PostCard || Fallback.PostCard,
    NoteCard: DS.NoteCard || Fallback.NoteCard,
    Callout: DS.Callout || Fallback.Callout,
    ReviewCard: DS.ReviewCard || Fallback.ReviewCard,
    Stars: DS.Stars || Fallback.Stars,
    usingBundle: !!DS.Button,
  };
})();
