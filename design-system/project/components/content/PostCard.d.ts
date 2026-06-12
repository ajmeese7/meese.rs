import * as React from 'react';

/**
 * Standard feed card for longer writing. Shows a type badge, title,
 * description, date/reading-time, and topic tags. `featured` adds reticle
 * corner ticks + a pinned marker.
 *
 * @startingPoint section="Content" subtitle="Feed card for guides, devlogs, essays" viewport="700x240"
 */
export interface PostCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  title: string;
  description?: string;
  /** @default "guide" */
  type?: 'guide' | 'note' | 'devlog' | 'essay' | 'lab' | 'reference';
  /** Display date string, e.g. "2026-06-08". */
  date?: string;
  /** Optional "updated" date string. */
  updated?: string;
  /** e.g. "7 min". */
  readingTime?: string;
  /** Topic slugs rendered as tags. */
  topics?: string[];
  /** Pinned/featured treatment (reticle ticks). @default false */
  featured?: boolean;
  href?: string;
}

export function PostCard(props: PostCardProps): JSX.Element;
