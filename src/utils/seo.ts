export interface SeoInput {
  title: string;
  description: string;
  /** Astro.url.pathname */
  path: string;
  site: URL | string;
  type?: "website" | "article";
  publishedTime?: Date;
  modifiedTime?: Date;
  tags?: string[];
}

export interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  ogType: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags: string[];
}

const SITE_NAME = "meese.rs";

export function buildSeo(input: SeoInput): SeoMeta {
  const base = new URL(input.site);
  const canonical = new URL(input.path, base).href;
  const title =
    input.title === SITE_NAME ? SITE_NAME : `${input.title} · ${SITE_NAME}`;
  return {
    title,
    description: input.description,
    canonical,
    ogType: input.type ?? "website",
    publishedTime: input.publishedTime?.toISOString(),
    modifiedTime: input.modifiedTime?.toISOString(),
    tags: input.tags ?? [],
  };
}
