import * as React from 'react';

/**
 * Dark-well text input with a cyan focus ring. The `search` variant adds a
 * leading prompt glyph and mono text — the base of the static search UI.
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** "default" text field or "search" (prompt glyph + mono). @default "default" */
  variant?: 'default' | 'search';
  /** Control height. @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Leading icon node. */
  iconLeft?: React.ReactNode;
  /** Override the leading prompt glyph (search defaults to "/"). */
  prompt?: React.ReactNode;
  /** @default true */
  fullWidth?: boolean;
}

export function Input(props: InputProps): JSX.Element;
