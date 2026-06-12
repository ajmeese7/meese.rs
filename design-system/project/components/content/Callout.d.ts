import * as React from 'react';

/**
 * In-article callout for notes/warnings/context. Tinted well + left signal
 * rail + mono `// LABEL`. One of the core MDX components.
 */
export interface CalloutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Severity / intent. @default "note" */
  type?: 'note' | 'tip' | 'warning' | 'danger' | 'context';
  /** Optional bold title beside the label. */
  title?: string;
  children?: React.ReactNode;
}

export function Callout(props: CalloutProps): JSX.Element;
