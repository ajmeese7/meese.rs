import * as React from 'react';

/** Inline Lucide glyph name available in the icon map. */
export type IconName =
  | 'search' | 'arrow-right' | 'arrow-left' | 'chevron-down' | 'check'
  | 'git-fork' | 'zap' | 'refresh-cw' | 'image' | 'bar-chart-3'
  | 'book-open' | 'terminal' | 'pencil' | 'feather' | 'flask-conical'
  | 'bookmark' | 'star' | 'github' | 'plus' | 'minus' | 'x'
  | 'linkedin' | 'x-twitter' | 'mail' | 'arrow-up-right' | 'menu';

/** Raw inner-SVG markup per glyph name (1.5px stroke, no fill, currentColor). */
export const ICONS: Record<IconName, string>;

/** One Lucide icon per post type — the glyph is the type signal on a Badge. */
export const TYPE_ICONS: Record<'guide' | 'note' | 'devlog' | 'essay' | 'lab' | 'reference' | 'review', IconName>;

export interface IconProps extends Omit<React.SVGAttributes<SVGSVGElement>, 'name'> {
  /** Glyph to draw (key of the ICONS map). */
  name: IconName;
  /** Square px size. 18 in UI, 16 inline, ~13 inside a badge. @default 18 */
  size?: number;
  /** Stroke width. @default 1.5 */
  strokeWidth?: number;
}

/** Inline icon that inherits color via `currentColor`. Self-contained — no CDN. */
export function Icon(props: IconProps): JSX.Element;
