import React from 'react';

/**
 * meese.rs — Button
 * Technical, restrained. Primary uses the cyan signal; ghost is the
 * default for system-index chrome. Press shifts down 1px, no bounce.
 */
export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  iconLeft,
  iconRight,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);

  const sizes = {
    sm: { height: 30, padding: '0 12px', font: 'var(--text-2xs)', gap: 6, radius: 'var(--radius-sm)' },
    md: { height: 38, padding: '0 16px', font: 'var(--text-sm)', gap: 8, radius: 'var(--radius-sm)' },
    lg: { height: 46, padding: '0 22px', font: 'var(--text-base)', gap: 9, radius: 'var(--radius-md)' },
  };
  const s = sizes[size] || sizes.md;

  const variants = {
    primary: {
      base: { background: 'var(--cyan)', color: 'var(--ink-inverse)', border: '1px solid var(--cyan)' },
      hover: { background: 'var(--cyan-bright)', borderColor: 'var(--cyan-bright)', boxShadow: 'var(--glow-soft)' },
    },
    secondary: {
      base: { background: 'var(--surface-2)', color: 'var(--ink-1)', border: '1px solid var(--line-2)' },
      hover: { background: 'var(--surface-3)', borderColor: 'var(--line-3)' },
    },
    ghost: {
      base: { background: 'transparent', color: 'var(--ink-2)', border: '1px solid transparent' },
      hover: { background: 'var(--surface-2)', color: 'var(--ink-1)' },
    },
    accent: {
      base: { background: 'var(--cyan-wash)', color: 'var(--cyan-bright)', border: '1px solid var(--cyan-dim)' },
      hover: { background: 'var(--cyan-wash-2)', borderColor: 'var(--cyan-deep)' },
    },
    danger: {
      base: { background: 'var(--red-wash)', color: 'var(--red)', border: '1px solid var(--red)' },
      hover: { background: 'rgba(226,106,98,0.20)' },
    },
  };
  const v = variants[variant] || variants.secondary;

  const composed = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    height: s.height,
    padding: s.padding,
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'var(--font-mono)',
    fontSize: s.font,
    fontWeight: 500,
    letterSpacing: '0.02em',
    lineHeight: 1,
    borderRadius: s.radius,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'background var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out), color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out), transform var(--dur-1) var(--ease-out)',
    transform: active && !disabled ? 'translateY(1px)' : 'translateY(0)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    ...v.base,
    ...(hover && !disabled ? v.hover : null),
    ...style,
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={composed}
      {...rest}
    >
      {iconLeft ? <span style={{ display: 'inline-flex', marginLeft: -2 }}>{iconLeft}</span> : null}
      {children}
      {iconRight ? <span style={{ display: 'inline-flex', marginRight: -2 }}>{iconRight}</span> : null}
    </button>
  );
}
