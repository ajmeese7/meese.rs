import React from 'react';
import { Badge } from '../core/Badge.jsx';
import { Tag } from '../core/Tag.jsx';

/**
 * meese.rs — Stars
 * Precise partial-fill rating in the accent color (e.g. 4.2 / 5).
 * Uses the ★ glyph (symbol, not emoji) layered for sub-star precision.
 */
export function Stars({ score = 0, size = 14 }) {
  const pct = Math.max(0, Math.min(100, (score / 5) * 100));
  const wrap = { position: 'relative', display: 'inline-block', fontSize: size, lineHeight: 1, letterSpacing: '2px', fontFamily: 'var(--font-mono)' };
  return (
    <span style={wrap} aria-label={score + ' out of 5'}>
      <span style={{ color: 'var(--line-3)' }}>★★★★★</span>
      <span style={{ position: 'absolute', left: 0, top: 0, width: pct + '%', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--accent)' }}>★★★★★</span>
    </span>
  );
}

const VERDICT = {
  recommended:  { color: 'var(--green)', label: 'RECOMMENDED' },
  caveats:      { color: 'var(--gold)',  label: 'WITH CAVEATS' },
  watch:        { color: 'var(--accent)',label: 'ONE TO WATCH' },
  skip:         { color: 'var(--red)',   label: 'SKIP FOR NOW' },
};

/**
 * meese.rs — ReviewCard
 * Feed card for a software / library review. Leads with the subject,
 * a precise star score, and a verdict — reviews are a first-class use
 * case on meese.rs, so the type badge takes the brand accent.
 */
export function ReviewCard({
  subject,
  version,
  oneLiner,
  score = 0,
  verdict = 'recommended',
  date,
  topics = [],
  href = '#',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const v = VERDICT[verdict] || VERDICT.recommended;

  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', display: 'block', textDecoration: 'none',
        background: hover ? 'var(--surface-2)' : 'var(--surface-1)',
        border: '1px solid', borderColor: hover ? 'var(--line-2)' : 'var(--line-1)',
        borderRadius: 'var(--radius-md)', padding: 'var(--space-6)',
        transition: 'background var(--dur-2) var(--ease-out), border-color var(--dur-2) var(--ease-out), transform var(--dur-2) var(--ease-out)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        ...style,
      }}
      {...rest}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Badge type="review" />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', fontWeight: 600, letterSpacing: '0.1em',
          color: v.color, border: '1px solid color-mix(in srgb, ' + v.color + ' 40%, transparent)',
          background: 'color-mix(in srgb, ' + v.color + ' 12%, transparent)', borderRadius: 'var(--radius-xs)',
          height: 20, padding: '0 7px', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap',
        }}>{v.label}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--ink-3)' }}>{date}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 600, lineHeight: 1.15,
          letterSpacing: '-0.01em', color: hover ? 'var(--accent-bright)' : 'var(--ink-1)', margin: 0,
          transition: 'color var(--dur-1) var(--ease-out)',
        }}>{subject}</h3>
        {version ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--ink-4)' }}>{version}</span> : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 0' }}>
        <Stars score={score} size={15} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--ink-2)' }}>
          <strong style={{ color: 'var(--ink-1)', fontWeight: 600 }}>{score.toFixed(1)}</strong> / 5
        </span>
      </div>

      {oneLiner ? (
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', lineHeight: 1.6, color: 'var(--ink-2)',
          margin: '12px 0 0', maxWidth: '62ch', textWrap: 'pretty',
        }}>{oneLiner}</p>
      ) : null}

      {topics.length ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
          {topics.map((t) => <Tag key={t} href={'#' + t}>{t}</Tag>)}
        </div>
      ) : null}
    </a>
  );
}
