import * as React from 'react';

/**
 * System-index marker badge. Pass `type` for a post-type chip (fixed hue
 * per content type) or `status` for an update/deprecation marker.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Post type — sets label + hue automatically. */
  type?: 'guide' | 'note' | 'devlog' | 'essay' | 'lab' | 'reference' | 'review';
  /** Status marker — sets label + semantic hue automatically. */
  status?: 'updated' | 'corrected' | 'deprecated' | 'pinned';
  /** Override the auto color (CSS color / var). */
  color?: string;
  /** Wrap the label in [ … ] brackets. @default true */
  bracketed?: boolean;
  /** Solid fill instead of tinted outline. @default false */
  solid?: boolean;
  /** Custom label (overrides preset). */
  children?: React.ReactNode;
}

export function Badge(props: BadgeProps): JSX.Element;
