import { OGImageRoute } from "astro-og-canvas";
import { getBuildablePosts } from "../../utils/posts";

// Brand palette (RGB) pulled from src/styles/tokens/colors.css.
const BG_VOID: [number, number, number] = [6, 7, 10]; // --bg-void
const SURFACE: [number, number, number] = [16, 18, 21]; // --surface-1
const ACCENT: [number, number, number] = [154, 124, 255]; // --accent (neon-violet)
const INK_1: [number, number, number] = [237, 239, 241]; // --ink-1
const INK_3: [number, number, number] = [118, 125, 133]; // --ink-3

const FONTS = [
  "./src/assets/og/space-grotesk-700.ttf",
  "./src/assets/og/ibm-plex-sans-400.ttf",
];

interface OgPage {
  title: string;
  description: string;
}

// One card per locally-rendered post, keyed `posts/<id>` -> /og/posts/<id>.png.
// Non-post pages use the static hero card (public/social.png) instead.
const posts = await getBuildablePosts();
const pages: Record<string, OgPage> = {};
for (const post of posts) {
  if (post.data.externalUrl) continue; // no local page, no card
  pages[`posts/${post.id}`] = {
    title: post.data.title,
    description: post.data.description,
  };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  param: "route",
  pages,
  getImageOptions: (_path, page: OgPage) => ({
    title: page.title,
    description: page.description,
    logo: { path: "./src/assets/og/logomark.png", size: [84, 84] },
    // Shared node-graph art (src/assets/og/article-bg.svg). Left third is
    // darkened in the art so the title/description always sit on a clean field.
    bgImage: { path: "./src/assets/og/article-bg.png", fit: "cover" },
    bgGradient: [BG_VOID, SURFACE], // fallback behind the image
    border: { color: ACCENT, width: 16, side: "inline-start" },
    padding: 72,
    font: {
      title: {
        color: INK_1,
        size: 60,
        lineHeight: 1.12,
        weight: "Bold",
        families: ["Space Grotesk"],
      },
      description: {
        color: INK_3,
        size: 30,
        lineHeight: 1.4,
        families: ["IBM Plex Sans"],
      },
    },
    fonts: FONTS,
  }),
});
