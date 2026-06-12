import React from 'react';

/**
 * meese.rs — Badge
 * The system-index type marker. Each post type carries a fixed hue;
 * status badges (updated/deprecated) reuse the semantic palette.
 */
const TYPE_MAP = {
  guide:     { color: 'var(--hue-cyan)',   label: 'GUIDE' },
  note:      { color: 'var(--hue-slate)',  label: 'NOTE' },
  devlog:    { color: 'var(--hue-green)',  label: 'DEVLOG' },
  essay:     { color: 'var(--hue-violet)', label: 'ESSAY' },
  lab:       { color: 'var(--hue-gold)',   label: 'LAB' },
  reference: { color: 'var(--hue-rose)',   label: 'REF' },
  review:    { color: 'var(--accent)',     label: 'REVIEW' },
};
const STATUS_MAP = {
  updated:    { color: 'var(--green)', label: 'UPDATED' },
  corrected:  { color: 'var(--gold)',  label: 'CORRECTED' },
  deprecated: { color: 'var(--red)',   label: 'DEPRECATED' },
  pinned:     { color: 'var(--ember)', label: 'PINNED' },
};

export function Badge({
  type,
  status,
  children,
  color,
  bracketed = true,
  solid = false,
  style,
  ...rest
}) {
  const preset = type ? TYPE_MAP[type] : status ? STATUS_MAP[status] : null;
  const hue = color || (preset ? preset.color : 'var(--ink-3)');
  const label = children != null ? children : preset ? preset.label : '';
  const text = bracketed ? `[ ${label} ]` : label;

  const base = solid
    ? { background: hue, color: 'var(--ink-inverse)', border: `1px solid ${hue}` }
    : { background: 'color-mix(in srgb, ' + hue + ' 12%, transparent)', color: hue, border: `1px solid color-mix(in srgb, ${hue} 38%, transparent)` };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 7px',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        fontWeight: 600,
        letterSpacing: '0.1em',
        lineHeight: 1,
        borderRadius: 'var(--radius-xs)',
        whiteSpace: 'nowrap',
        ...base,
        ...style,
      }}
      {...rest}
    >
      {text}
    </span>
  );
}
