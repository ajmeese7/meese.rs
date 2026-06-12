import React from 'react';
import { Icon, TYPE_ICONS } from './Icon.jsx';

/**
 * meese.rs — Badge
 * The system-index marker. Two distinct shapes by intent:
 *   • TYPE badges lead with a Lucide icon and an UNBRACKETED label — the
 *     glyph is what tells one content type from another (guide ▸ book,
 *     review ▸ star, …). Each type carries a fixed categorical hue.
 *   • STATUS badges are bracketed `[ LABEL ]` with no icon, in a semantic
 *     hue (updated/corrected/deprecated/superseded/pinned).
 * Verdict pills on reviews are a third, separate shape (see ReviewCard).
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
  updated:    { color: 'var(--green)',     label: 'UPDATED' },
  corrected:  { color: 'var(--gold)',      label: 'CORRECTED' },
  deprecated: { color: 'var(--red)',       label: 'DEPRECATED' },
  superseded: { color: 'var(--hue-slate)', label: 'SUPERSEDED' },
  pinned:     { color: 'var(--accent)',    label: 'PINNED' },
};

export function Badge({
  type,
  status,
  children,
  color,
  bracketed,
  solid = false,
  icon = true,
  style,
  ...rest
}) {
  const preset = type ? TYPE_MAP[type] : status ? STATUS_MAP[status] : null;
  const hue = color || (preset ? preset.color : 'var(--ink-3)');
  const label = children != null ? children : preset ? preset.label : '';

  // Type badges are icon-led + unbracketed; status/custom badges bracket by
  // default. An explicit `bracketed` prop always wins.
  const showBracket = bracketed === undefined ? !type : bracketed;
  const text = showBracket ? `[ ${label} ]` : label;
  const iconName = icon && type ? TYPE_ICONS[type] : null;

  const base = solid
    ? { background: hue, color: 'var(--ink-inverse)', border: `1px solid ${hue}` }
    : {
        background: 'color-mix(in srgb, ' + hue + ' 12%, transparent)',
        color: hue,
        border: `1px solid color-mix(in srgb, ${hue} 38%, transparent)`,
      };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: iconName ? 5 : 0,
        height: 20,
        padding: iconName ? '0 7px 0 6px' : '0 7px',
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
      {iconName ? <Icon name={iconName} size={13} /> : null}
      {text}
    </span>
  );
}
