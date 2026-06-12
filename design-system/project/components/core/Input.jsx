import React from 'react';

/**
 * meese.rs — Input
 * Dark well, mono text, cyan focus ring. The `search` variant adds a
 * leading prompt glyph and is the basis of the static Pagefind search UI.
 */
export function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  variant = 'default',
  iconLeft,
  prompt,
  size = 'md',
  disabled = false,
  fullWidth = true,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const isSearch = variant === 'search';

  const heights = { sm: 32, md: 40, lg: 48 };
  const h = heights[size] || heights.md;

  const lead = prompt != null ? prompt : (isSearch ? '/' : null);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        width: fullWidth ? '100%' : 'auto',
        height: h,
        padding: '0 12px',
        background: 'var(--surface-well)',
        border: '1px solid',
        borderColor: focus ? 'var(--cyan)' : 'var(--line-2)',
        borderRadius: isSearch ? 'var(--radius-md)' : 'var(--radius-sm)',
        boxShadow: focus ? 'var(--glow-soft)' : 'none',
        opacity: disabled ? 0.5 : 1,
        transition: 'border-color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out)',
        ...style,
      }}
    >
      {lead ? (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: focus ? 'var(--cyan)' : 'var(--ink-4)', fontWeight: 600 }}>{lead}</span>
      ) : null}
      {iconLeft ? <span style={{ display: 'inline-flex', color: 'var(--ink-3)' }}>{iconLeft}</span> : null}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          flex: 1,
          minWidth: 0,
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--ink-1)',
          fontFamily: isSearch ? 'var(--font-mono)' : 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          letterSpacing: isSearch ? '0.01em' : '0',
        }}
        {...rest}
      />
    </div>
  );
}
