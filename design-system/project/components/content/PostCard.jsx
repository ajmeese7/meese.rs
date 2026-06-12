import React from 'react';
import { Badge } from '../core/Badge.jsx';
import { Tag } from '../core/Tag.jsx';

/**
 * meese.rs — PostCard
 * The standard feed entry for longer writing (guide/devlog/essay/lab/
 * reference). Featured cards get reticle corner ticks. Composes Badge + Tag.
 */
export function PostCard({
  title,
  description,
  type = 'guide',
  date,
  updated,
  readingTime,
  topics = [],
  featured = false,
  href = '#',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);

  return (
    <a
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'block',
        textDecoration: 'none',
        background: hover ? 'var(--surface-2)' : 'var(--surface-1)',
        border: '1px solid',
        borderColor: featured ? 'var(--line-2)' : (hover ? 'var(--line-2)' : 'var(--line-1)'),
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)',
        transition: 'background var(--dur-2) var(--ease-out), border-color var(--dur-2) var(--ease-out), transform var(--dur-2) var(--ease-out)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        ...style,
      }}
      {...rest}
    >
      {featured ? <Reticle /> : null}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <Badge type={type} />
        {featured ? <Badge status="pinned" /> : null}
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
          {date}{readingTime ? `  ·  ${readingTime}` : ''}
        </span>
      </div>

      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-xl)',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '-0.01em',
        color: hover ? 'var(--cyan-bright)' : 'var(--ink-1)',
        margin: 0,
        transition: 'color var(--dur-1) var(--ease-out)',
        textWrap: 'pretty',
      }}>
        {title}
      </h3>

      {description ? (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          lineHeight: 1.6,
          color: 'var(--ink-2)',
          margin: '10px 0 0',
          maxWidth: '62ch',
          textWrap: 'pretty',
        }}>
          {description}
        </p>
      ) : null}

      {(topics.length || updated) ? (
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
          {topics.map((t) => <Tag key={t} href={`#${t}`}>{t}</Tag>)}
          {updated ? (
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--green)', letterSpacing: '0.04em' }}>
              updated {updated}
            </span>
          ) : null}
        </div>
      ) : null}
    </a>
  );
}

function Reticle() {
  const c = { position: 'absolute', width: 11, height: 11, border: '1.5px solid var(--cyan-deep)' };
  return (
    <>
      <span style={{ ...c, top: 7, left: 7, borderRight: 0, borderBottom: 0 }} />
      <span style={{ ...c, top: 7, right: 7, borderLeft: 0, borderBottom: 0 }} />
      <span style={{ ...c, bottom: 7, left: 7, borderRight: 0, borderTop: 0 }} />
      <span style={{ ...c, bottom: 7, right: 7, borderLeft: 0, borderTop: 0 }} />
    </>
  );
}
