import * as React from 'react';

/**
 * System-index marker badge. Pass `type` for an icon-led post-type chip
 * (leading Lucide glyph + unbracketed label, fixed hue per content type) or
 * `status` for a bracketed update/deprecation marker.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Post type — sets label + hue automatically. */
  type?: 'guide' | 'note' | 'devlog' | 'essay' | 'lab' | 'reference' | 'review';
  /** Status marker — sets label + semantic hue automatically. */
  status?: 'updated' | 'corrected' | 'deprecated' | 'superseded' | 'pinned';
  /** Override the auto color (CSS color / var). */
  color?: string;
  /**
   * Wrap the label in [ … ] brackets. Defaults to `false` for type badges
   * (icon-led, unbracketed) and `true` for status/custom badges.
   */
  bracketed?: boolean;
  /** Show the leading type icon on a type badge. @default true */
  icon?: boolean;
  /** Solid fill instead of tinted outline. @default false */
  solid?: boolean;
  /** Custom label (overrides preset). */
  children?: React.ReactNode;
}

export function Badge(props: BadgeProps): JSX.Element;
