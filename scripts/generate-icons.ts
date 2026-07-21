/**
 * Raster icon fallbacks, generated from public/favicon.svg.
 *
 * The SVG favicon stays primary, but it does not cover everything: Safari only
 * renders SVG favicons from Safari 26, browsers and crawlers request
 * /favicon.ico by convention whether or not a <link> points at it, iOS wants a
 * raster apple-touch-icon for home-screen bookmarks, and third-party favicon
 * fetchers (Proton Mail's sender images, RSS readers, chat unfurlers) commonly
 * parse only ICO or PNG.
 *
 * Outputs are committed rather than built, because they change roughly never
 * and rasterising on every build buys nothing. Re-run `pnpm generate:icons`
 * after editing favicon.svg.
 *
 * sharp cannot write ICO, so the container is assembled here. That is a 6-byte
 * header plus one 16-byte directory entry per image wrapped around PNG
 * payloads, which is not worth taking on a dependency for.
 */
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const SRC = "public/favicon.svg";
const ICO_OUT = "public/favicon.ico";
const TOUCH_OUT = "public/apple-touch-icon.png";

// 16 for legacy tab/bookmark chrome, 32 for the common case, 48 for Windows
// site tiles and the higher-density taskbar.
const ICO_SIZES = [16, 32, 48];

// Apple's current home-screen size. iOS masks the corners itself.
const TOUCH_SIZE = 180;

// Matches the logomark's own field, so flattening the rounded card onto it
// reads as a full-bleed icon rather than a card floating on a backdrop.
const BACKDROP = "#090A0C";

const render = (size: number, opaque: boolean) => {
  let img = sharp(SRC, { density: 384 }).resize(size, size, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
  // iOS composites the touch icon over an unknown surface and ignores alpha,
  // so transparent corners there render as whatever the OS picks.
  if (opaque) img = img.flatten({ background: BACKDROP });
  return img.png({ compressionLevel: 9 }).toBuffer();
};

/** Pack PNG buffers into an ICO container (PNG-in-ICO, Vista+). */
const packIco = (images: { size: number; data: Buffer }[]) => {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(images.length, 4);

  const DIR_ENTRY = 16;
  let offset = header.length + images.length * DIR_ENTRY;

  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(DIR_ENTRY);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // 0 encodes 256
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt8(0, 2); // palette size, 0 for truecolour
    e.writeUInt8(0, 3); // reserved
    e.writeUInt16LE(1, 4); // colour planes
    e.writeUInt16LE(32, 6); // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
};

const icoImages = await Promise.all(
  ICO_SIZES.map(async (size) => ({ size, data: await render(size, false) })),
);
writeFileSync(ICO_OUT, packIco(icoImages));

writeFileSync(TOUCH_OUT, await render(TOUCH_SIZE, true));

const sizes = ICO_SIZES.join("/");
console.log(`✓ ${ICO_OUT} (${sizes}px)  ${TOUCH_OUT} (${TOUCH_SIZE}px)`);
