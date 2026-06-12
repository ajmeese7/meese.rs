import * as React from 'react';

/** Precise partial-fill star rating in the accent color. */
export interface StarsProps {
  /** 0–5, fractional allowed (e.g. 4.2). */
  score?: number;
  /** Glyph size in px. @default 14 */
  size?: number;
}
export function Stars(props: StarsProps): JSX.Element;

/**
 * Feed card for a software / library review — a first-class meese.rs content
 * type. Leads with the subject, a precise star score, and a verdict pill.
 *
 * @startingPoint section="Content" subtitle="Software / library review card" viewport="700x240"
 */
export interface ReviewCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  /** What is being reviewed, e.g. "Bun". */
  subject: string;
  /** Version reviewed, e.g. "v1.2". */
  version?: string;
  /** One-sentence take. */
  oneLiner?: string;
  /** Overall score 0–5 (fractional ok). */
  score?: number;
  /** Verdict pill. @default "recommended" */
  verdict?: 'recommended' | 'caveats' | 'watch' | 'skip';
  date?: string;
  topics?: string[];
  href?: string;
}
export function ReviewCard(props: ReviewCardProps): JSX.Element;
