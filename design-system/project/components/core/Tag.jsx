import React from 'react';

/**
 * meese.rs — Tag
 * Lower-level label. Mono, prefixed with a faint hash, subtle until hover.
 * Used in clusters under post cards and on topic pages.
 */
export function Tag({ children, href, active = false, onClick, style, ...rest }) {
  const [hover, setHover] = React.useState(false);
  const Comp = href ? 'a' : 'span';
  const interactive = !!(href || onClick);

  return (
    <Comp
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        height: 22,
        padding: '0 8px',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        fontWeight: 500,
        letterSpacing: '0.02em',
        lineHeight: 1,
        textDecoration: 'none',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid',
        borderColor: active ? 'var(--accent-deep)' : (hover && interactive ? 'var(--line-3)' : 'var(--line-1)'),
        background: active ? 'var(--accent-wash)' : (hover && interactive ? 'var(--surface-2)' : 'transparent'),
        color: active ? 'var(--accent-bright)' : (hover && interactive ? 'var(--ink-1)' : 'var(--ink-3)'),
        cursor: interactive ? 'pointer' : 'default',
        transition: 'all var(--dur-1) var(--ease-out)',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      <span style={{ color: active ? 'var(--accent)' : 'var(--ink-4)' }}>#</span>{children}
    </Comp>
  );
}
