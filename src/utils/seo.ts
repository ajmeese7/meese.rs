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
  /** Absolute URL of the OG card. */
  image: string;
  imageWidth: number;
  imageHeight: number;
  publishedTime?: string;
  modifiedTime?: string;
  tags: string[];
}

const SITE_NAME = "meese.rs";

/** Posts get a per-post card (1200x630, see src/pages/og/[...route].ts).
 *  Every other page uses the static hero card (1280x640). */
function ogImage(path: string): {
  image: string;
  imageWidth: number;
  imageHeight: number;
} {
  const match = path.match(/^\/posts\/(.+?)\/?$/);
  return match
    ? { image: `/og/posts/${match[1]}.png`, imageWidth: 1200, imageHeight: 630 }
    : { image: "/social.png", imageWidth: 1280, imageHeight: 640 };
}

export function buildSeo(input: SeoInput): SeoMeta {
  const base = new URL(input.site);
  const canonical = new URL(input.path, base).href;
  const title =
    input.title === SITE_NAME ? SITE_NAME : `${input.title} · ${SITE_NAME}`;
  const { image, imageWidth, imageHeight } = ogImage(input.path);
  return {
    title,
    description: input.description,
    canonical,
    ogType: input.type ?? "website",
    image: new URL(image, base).href,
    imageWidth,
    imageHeight,
    publishedTime: input.publishedTime?.toISOString(),
    modifiedTime: input.modifiedTime?.toISOString(),
    tags: input.tags ?? [],
  };
}
