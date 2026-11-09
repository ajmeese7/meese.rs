type Attribute = {
  type: string;
  name?: string;
  value?: string | null | { value: string };
};

/** Read literal props without executing MDX expressions in the editor. */
export function previewProps(attributes: readonly Attribute[]): Record<string, unknown> | null {
  const props: Record<string, unknown> = Object.create(null);
  for (const attribute of attributes) {
    if (attribute.type !== "mdxJsxAttribute" || !attribute.name) return null;
    const value = attribute.value;
    if (value === null) props[attribute.name] = true;
    else if (typeof value === "string") props[attribute.name] = value;
    else if (value && typeof value === "object") {
      try {
        props[attribute.name] = JSON.parse(value.value);
      } catch {
        return null;
      }
    } else return null;
  }
  return props;
}

export function componentPreviewUrl(name: string | null, props: Record<string, unknown>): string {
  const params = new URLSearchParams({ name: name ?? "", props: JSON.stringify(props) });
  return `/editor/component?${params}`;
}
