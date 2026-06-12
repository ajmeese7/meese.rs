/** ISO-ish date formatting, the system-index look is `2026-06-08`. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** RFC-822-ish for feeds / machine consumers. */
export function rfcDate(date: Date): string {
  return date.toUTCString();
}
