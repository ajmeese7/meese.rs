import * as React from 'react';

/**
 * Lower-level label chip (`#tag`). Renders as an anchor when `href` is set,
 * otherwise a static span. Subtle until hover; `active` shows the cyan signal.
 */
export interface TagProps extends React.HTMLAttributes<HTMLElement> {
  /** Makes the tag a link. */
  href?: string;
  /** Selected state (filter UIs). @default false */
  active?: boolean;
  children?: React.ReactNode;
}

export function Tag(props: TagProps): JSX.Element;
