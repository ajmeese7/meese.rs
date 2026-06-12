import * as React from 'react';

/**
 * Technical button for meese.rs. Mono label, restrained signal styling.
 *
 * @startingPoint section="Core" subtitle="Mono-label button, 5 variants × 3 sizes" viewport="700x140"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "secondary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
  /** Control height. @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Element rendered before the label. */
  iconLeft?: React.ReactNode;
  /** Element rendered after the label. */
  iconRight?: React.ReactNode;
  /** Stretch to container width. @default false */
  fullWidth?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function Button(props: ButtonProps): JSX.Element;
