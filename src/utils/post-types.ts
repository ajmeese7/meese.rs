/**
 * Post-type badge metadata, shared by the `Badge.astro` component and the
 * client-side search script so a type renders the same label and icon
 * everywhere. Type badges lead with an icon and an unbracketed label; the icon
 * is what tells them apart from bracketed status badges and plain verdict pills.
 */
export const TYPE_LABELS: Record<string, string> = {
  guide: "GUIDE",
  note: "NOTE",
  devlog: "DEVLOG",
  essay: "ESSAY",
  lab: "LAB",
  reference: "REF",
  review: "REVIEW",
};

/** One Lucide icon per type; the glyph carries the "what kind of post" signal. */
export const TYPE_ICONS: Record<string, string> = {
  guide: "book-open",
  note: "pencil",
  devlog: "terminal",
  essay: "feather",
  lab: "flask-conical",
  reference: "bookmark",
  review: "star",
};
