/* meese.rs UI kit — shared chrome: Icon, SiteHeader, SiteFooter, Wordmark */
(function () {
  const { Button } = window.KIT;

  // Lucide icon rendered as a REAL React SVG (no post-render DOM mutation,
  // which would corrupt reconciliation of the persistent header).
  // Lucide node shape: ["svg", {attrs}, [ [tag, {attrs}], ... ]] — children are node[2].
  function Icon({ name, size = 18, color, style }) {
    const pascal = name.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    const L = window.lucide || {};
    const node = (L.icons && L.icons[pascal]) || L[pascal];
    const base = { width: size, height: size, display: 'inline-block', flex: 'none', verticalAlign: 'middle', ...style };
    const childDefs = Array.isArray(node) ? node[2] : null;
    if (!Array.isArray(childDefs)) return React.createElement('span', { style: base });
    const children = childDefs
      .filter((c) => Array.isArray(c) && typeof c[0] === 'string')
      .map((c, i) => React.createElement(c[0], Object.assign({ key: i }, c[1])));
    return React.createElement('svg', {
      xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', fill: 'none',
      stroke: color || 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round',
      style: base,
    }, ...children);
  }

  const THEMES = [
    ['neon-violet', 'Violet', '#9A7CFF'], ['acid-green', 'Acid Green', '#84F24B'], ['neon-lime', 'Lime', '#CCFF42'],
    ['neon-mint', 'Mint', '#35F0A2'], ['neon-cyan', 'Cyan', '#29E7F2'], ['electric-blue', 'Blue', '#5391FF'],
    ['hot-magenta', 'Magenta', '#FF3DA1'], ['neon-pink', 'Pink', '#FF73B6'], ['coral', 'Coral', '#FF5E73'],
  ];

  function ThemeSwitcher() {
    const [theme, setTheme] = React.useState(() => document.documentElement.dataset.theme || 'neon-violet');
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);
    const current = THEMES.find((t) => t[0] === theme) || THEMES[0];

    React.useEffect(() => {
      if (!open) return;
      const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
      document.addEventListener('mousedown', onDoc);
      document.addEventListener('keydown', onKey);
      return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
    }, [open]);

    const apply = (t) => {
      document.documentElement.dataset.theme = t;
      try { localStorage.setItem('meeders-theme', t); } catch (e) {}
      setTheme(t);
      setOpen(false);
    };

    const swatch = (color, size = 11) => (
      <span style={{ width: size, height: size, borderRadius: 999, background: color, boxShadow: '0 0 8px -1px ' + color, flex: 'none' }} />
    );

    return (
      <div ref={ref} style={{ position: 'relative' }}>
        <button onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, height: 34, padding: '0 9px 0 11px', minWidth: 132,
          background: 'var(--surface-well)', border: '1px solid ' + (open ? 'var(--accent)' : 'var(--line-2)'),
          borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--ink-2)',
          fontFamily: 'var(--font-mono)', fontSize: 12, boxShadow: open ? 'var(--glow-soft)' : 'none',
          transition: 'border-color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out)',
        }}>
          {swatch(current[2])}
          <span style={{ color: 'var(--ink-1)' }}>{current[1]}</span>
          <span style={{ flex: 1 }} />
          <span style={{ display: 'inline-flex', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-1) var(--ease-out)' }}>
            <Icon name="chevron-down" size={13} color="var(--ink-4)" />
          </span>
        </button>
        {open ? (
          <ul role="listbox" style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 300, width: 176, margin: 0, padding: 5,
            listStyle: 'none', background: 'var(--surface-3)', border: '1px solid var(--line-2)',
            borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-3)',
          }}>
            {THEMES.map(([v, l, c]) => {
              const sel = v === theme;
              return (
                <li key={v} role="option" aria-selected={sel} onClick={() => apply(v)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius-xs)',
                  cursor: 'pointer', background: sel ? 'var(--accent-wash)' : 'transparent',
                  fontFamily: 'var(--font-mono)', fontSize: 12.5, color: sel ? 'var(--ink-1)' : 'var(--ink-2)',
                }}
                onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = 'transparent'; }}>
                  {swatch(c, 13)}
                  <span>{l}</span>
                  <span style={{ flex: 1 }} />
                  {sel ? <Icon name="check" size={13} color="var(--accent)" /> : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    );
  }

  function Wordmark({ size = 20, onClick }) {
    return (
      <a href="#" onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <img src="../../assets/logomark.svg" width={size + 8} height={size + 8} alt="" />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: size, letterSpacing: '-0.02em', color: 'var(--ink-1)' }}>
          meese<span style={{ color: 'var(--ember)' }}>.rs</span>
        </span>
      </a>
    );
  }

  const NAV = ['Latest', 'Guides', 'Notes', 'Reviews', 'Topics', 'Graph'];

  function NavLink({ label, active, onClick }) {
    const [hover, setHover] = React.useState(false);
    return (
      <a href="#" onClick={(e) => { e.preventDefault(); onClick(); }}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          fontFamily: 'var(--font-mono)', fontSize: 12.5, letterSpacing: '0.02em',
          padding: '7px 11px', borderRadius: 'var(--radius-sm)', textDecoration: 'none',
          color: active ? 'var(--accent-bright)' : (hover ? 'var(--ink-1)' : 'var(--ink-3)'),
          background: active ? 'var(--accent-wash)' : (hover ? 'var(--surface-2)' : 'transparent'),
          transition: 'color var(--dur-1) var(--ease-out), background var(--dur-1) var(--ease-out)',
        }}>
        {label}
      </a>
    );
  }

  function SiteHeader({ navKey, onNav, onSearch, onHome }) {
    return (
      <header style={{
        position: 'sticky', top: 0, zIndex: 200, height: 'var(--header-height)',
        display: 'flex', alignItems: 'center', gap: 24,
        padding: '0 24px', borderBottom: '1px solid var(--line-1)',
        background: 'color-mix(in srgb, var(--bg-void) 82%, transparent)',
        backdropFilter: 'var(--blur-overlay)', WebkitBackdropFilter: 'var(--blur-overlay)',
      }}>
        <Wordmark onClick={(e) => { e.preventDefault(); onHome(); }} />
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
          {NAV.map((n) => <NavLink key={n} label={n} active={navKey === n} onClick={() => onNav(n)} />)}
        </nav>
        <div style={{ flex: 1 }} />
        <ThemeSwitcher />
        <button onClick={onSearch} style={{
          display: 'inline-flex', alignItems: 'center', gap: 9, height: 34, padding: '0 10px 0 12px',
          background: 'var(--surface-well)', border: '1px solid var(--line-2)', borderRadius: 'var(--radius-sm)',
          color: 'var(--ink-3)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 12,
        }}>
          <Icon name="search" size={15} />
          <span>Search</span>
          <kbd style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-4)', background: 'var(--surface-2)',
            border: '1px solid var(--line-1)', borderRadius: 3, padding: '1px 5px', marginLeft: 4,
          }}>⌘K</kbd>
        </button>
      </header>
    );
  }

  function SiteFooter() {
    const links = ['feed.xml', 'feed.json', 'sitemap.xml', 'llms.txt', 'AGENTS.md'];
    return (
      <footer style={{
        borderTop: '1px solid var(--line-1)', marginTop: 64, padding: '28px 24px',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="../../assets/logomark.svg" width="20" height="20" alt="" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-3)' }}>
            meese.rs — field notes from a builder
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {links.map((l) => (
            <a key={l} href="#" onClick={(e) => e.preventDefault()} style={{
              fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-4)', textDecoration: 'none',
            }}>/{l}</a>
          ))}
        </div>
      </footer>
    );
  }

  window.KIT_CHROME = { Icon, Wordmark, SiteHeader, SiteFooter, ThemeSwitcher };
})();
