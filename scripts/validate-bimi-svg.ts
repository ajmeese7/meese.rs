/**
 * BIMI logo compliance check (see docs/bimi.md).
 *
 * public/bimi-logo.svg must satisfy the SVG Tiny Portable/Secure profile
 * (draft-svg-tiny-ps-abrotman) or mail clients silently fall back to the
 * generic avatar. That failure is invisible from the website itself and only
 * shows up in an inbox, so it needs to fail the build instead.
 *
 * The realistic way to break it is round-tripping the file through a design
 * tool, which re-adds `x`/`y` to the root, `style=`/`class=`, or `role`/
 * `aria-*`. So this is an allowlist: anything not known-good is an error.
 *
 * This is a tag scanner, not a general XML parser, which is proportionate for
 * a 20-line file we author by hand. It deliberately refuses anything it cannot
 * account for rather than trying to be lenient.
 */
import { readFileSync } from "node:fs";

const FILE = process.argv[2] ?? "public/bimi-logo.svg";
const SVG_NS = "http://www.w3.org/2000/svg";
const MAX_BYTES = 32 * 1024;

// SVG Tiny 1.2 shapes and containers we would plausibly use. Anything else
// (script, image, a, switch, foreignObject, animation) is rejected by default.
const ELEMENTS = new Set([
  "svg", "title", "desc", "g", "defs", "rect", "circle", "ellipse",
  "line", "path", "polygon", "polyline",
  "linearGradient", "radialGradient", "stop",
]);

const PAINT = [
  "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin",
  "stroke-miterlimit", "stroke-dasharray", "stroke-dashoffset", "fill-rule",
  "fill-opacity", "stroke-opacity", "opacity", "transform", "id", "display",
  "visibility", "color",
];

const ATTRS: Record<string, string[]> = {
  svg: ["xmlns", "version", "baseProfile", "viewBox", "width", "height", "preserveAspectRatio"],
  title: [], desc: [], g: [], defs: [],
  rect: [...PAINT, "x", "y", "width", "height", "rx", "ry"],
  circle: [...PAINT, "cx", "cy", "r"],
  ellipse: [...PAINT, "cx", "cy", "rx", "ry"],
  line: [...PAINT, "x1", "y1", "x2", "y2"],
  path: [...PAINT, "d"],
  polygon: [...PAINT, "points"],
  polyline: [...PAINT, "points"],
  linearGradient: ["id", "gradientUnits", "gradientTransform", "x1", "y1", "x2", "y2", "spreadMethod"],
  radialGradient: ["id", "gradientUnits", "gradientTransform", "cx", "cy", "r", "fx", "fy", "spreadMethod"],
  stop: ["offset", "stop-color", "stop-opacity"],
};

const errors: string[] = [];
const fail = (m: string) => errors.push(m);

const raw = readFileSync(FILE, "utf8");
if (Buffer.byteLength(raw) > MAX_BYTES) {
  fail(`file is ${Buffer.byteLength(raw)} bytes, over the ${MAX_BYTES} byte limit`);
}

// Comments carry prose about the constraints, so scan the markup without them.
const src = raw.replace(/<!--[\s\S]*?-->/g, "").replace(/<\?[\s\S]*?\?>/g, "");

// Returns pairs rather than a record: collapsing to a record lets a duplicate
// attribute hide the value of the one it overwrites.
const parseAttrs = (s: string): [string, string][] =>
  [...s.matchAll(/([a-zA-Z_:][\w:.-]*)\s*=\s*"([^"]*)"|([a-zA-Z_:][\w:.-]*)\s*=\s*'([^']*)'/g)].map(
    (m) => [m[1] ?? m[3], m[2] ?? m[4]],
  );

const tags = [...src.matchAll(/<([a-zA-Z][\w:.-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)\s*\/?>/g)];
if (tags.length === 0) fail("no elements found, is the file valid SVG?");

let root: Record<string, string> | null = null;
for (const [, name, attrText] of tags) {
  if (!ELEMENTS.has(name)) {
    fail(`<${name}> is not permitted by SVG Tiny PS`);
    continue;
  }
  const attrs = parseAttrs(attrText);
  if (name === "svg" && !root) root = Object.fromEntries(attrs);

  const allowed = new Set(ATTRS[name]);
  const seen = new Set<string>();
  for (const [attr, value] of attrs) {
    if (seen.has(attr)) fail(`<${name}> repeats attribute "${attr}"`);
    seen.add(attr);
    if (!allowed.has(attr)) fail(`<${name}> has disallowed attribute "${attr}"`);
    // Only the namespace declaration may reference anything external.
    if (attr !== "xmlns" && /\b(https?:|url\()/i.test(value)) {
      fail(`<${name}> attribute "${attr}" contains an external reference`);
    }
  }
}

if (!root) {
  fail("missing root <svg> element");
} else {
  if (root.xmlns !== SVG_NS) fail(`root xmlns must be "${SVG_NS}"`);
  if (root.version !== "1.2") fail('root must have version="1.2"');
  if (root.baseProfile !== "tiny-ps") fail('root must have baseProfile="tiny-ps"');
  // Design tools love adding these, and they invalidate the file.
  for (const a of ["x", "y"]) {
    if (a in root) fail(`root <svg> must not have an "${a}" attribute`);
  }
  const box = root.viewBox?.trim().split(/[\s,]+/).map(Number);
  if (!box || box.length !== 4 || box.some(Number.isNaN)) {
    fail("root <svg> needs a valid 4-value viewBox");
  } else if (box[2] !== box[3]) {
    fail(`viewBox must be square for a sender avatar, got ${box[2]}x${box[3]}`);
  }
}

const titles = [...src.matchAll(/<title\s*>([\s\S]*?)<\/title>/g)].map((m) => m[1].trim());
if (titles.length !== 1) {
  fail(`expected exactly one <title>, found ${titles.length}`);
} else if (!titles[0]) {
  fail("<title> must not be empty");
} else if (titles[0].length > 64) {
  fail(`<title> should be 64 characters or fewer, got ${titles[0].length}`);
}

if (errors.length) {
  console.error(`\n✗ ${FILE} is not SVG Tiny PS compliant (${errors.length}):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error("\n  See docs/bimi.md for the constraint list.\n");
  process.exit(1);
}

console.log(`✓ ${FILE} ok, SVG Tiny PS compliant, ${Buffer.byteLength(raw)} bytes`);
