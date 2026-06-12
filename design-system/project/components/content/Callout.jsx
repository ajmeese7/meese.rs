import React from 'react';

/**
 * meese.rs — Callout
 * MDX callout for warnings/notes/context inside long-form posts.
 * Tinted well + left signal rail + mono label. No emoji.
 */
const KIND = {
  note:    { color: 'var(--cyan)',  label: 'NOTE' },
  tip:     { color: 'var(--green)', label: 'TIP' },
  warning: { color: 'var(--gold)',  label: 'WARNING' },
  danger:  { color: 'var(--red)',   label: 'DANGER' },
  context: { color: 'var(--violet)',label: 'CONTEXT' },
};

export function Callout({ type = 'note', title, children, style, ...rest }) {
  const k = KIND[type] || KIND.note;
  return (
    <div
      role="note"
      style={{
        background: `color-mix(in srgb, ${k.color} 8%, var(--surface-1))`,
        border: '1px solid',
        borderColor: `color-mix(in srgb, ${k.color} 28%, transparent)`,
        borderLeft: `2px solid ${k.color}`,
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4) var(--space-5)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: title || children ? 8 : 0 }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          fontWeight: 600,
          letterSpacing: '0.14em',
          color: k.color,
        }}>{`// ${k.label}`}</span>
        {title ? (
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--ink-1)' }}>{title}</span>
        ) : null}
      </div>
      {children ? (
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--ink-2)' }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
