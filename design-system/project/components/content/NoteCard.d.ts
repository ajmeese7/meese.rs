import * as React from 'react';

/**
 * Compact feed entry for short notes that live inline among longer posts.
 * Mono date rail + [ NOTE ] marker + tight body — reads like a log line.
 */
export interface NoteCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  /** Optional short title. Notes can be title-less. */
  title?: string;
  /** The note body (1–3 sentences). */
  body: string;
  date?: string;
  href?: string;
}

export function NoteCard(props: NoteCardProps): JSX.Element;
