import React from 'react';
import { Badge } from '../core/Badge.jsx';

/**
 * meese.rs — NoteCard
 * Compact entry for short notes living inline in the main feed. Reads
 * almost like a log line: mono date rail, [ NOTE ] marker, tight body.
 */
export function NoteCard({ title, body, date, href = '#', style, ...rest }) {
  const [hover, setHover] = React.useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        gap: 16,
        textDecoration: 'none',
        background: hover ? 'var(--surface-2)' : 'transparent',
        border: '1px solid',
        borderColor: hover ? 'var(--line-2)' : 'var(--line-1)',
        borderLeft: '2px solid var(--hue-slate)',
        borderRadius: 'var(--radius-sm)',
        padding: 'var(--space-4) var(--space-5)',
        transition: 'background var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, flex: 'none', paddingTop: 1 }}>
        <Badge type="note" />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--ink-4)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{date}</span>
      </div>
      <div style={{ minWidth: 0 }}>
        {title ? (
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-base)',
            fontWeight: 600,
            color: hover ? 'var(--accent-bright)' : 'var(--ink-1)',
            transition: 'color var(--dur-1) var(--ease-out)',
            marginBottom: 4,
            textWrap: 'pretty',
          }}>{title}</div>
        ) : null}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          lineHeight: 1.55,
          color: 'var(--ink-2)',
          margin: 0,
          textWrap: 'pretty',
        }}>{body}</p>
      </div>
    </a>
  );
}
