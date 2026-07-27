/**
 * Content integrity check (SPEC §38). Astro's Zod schema already enforces
 * field types at build; this catches the cross-file relationships and content
 * mistakes a single-file schema can't see, and runs in CI before the build.
 */
import { loadPosts } from "./lib/frontmatter";

const TYPES = [
  "guide",
  "note",
  "devlog",
  "essay",
  "lab",
  "reference",
  "review",
];

/**
 * `repo` points at a GitHub repository root and nothing else: no tree/blob
 * deep links, no trailing query. Shape only. Resolving it would put a GitHub
 * API call (and its rate limit) between a blog post and a green deploy, so a
 * repo that later goes private or gets deleted is not caught here.
 */
const REPO_URL = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;

const posts = loadPosts();
const ids = new Set(posts.map((p) => p.id));
const errors: string[] = [];
const seen = new Set<string>();

for (const p of posts) {
  const where = `${p.id}`;
  const d = p.data;

  if (seen.has(p.id)) errors.push(`${where}: duplicate slug`);
  seen.add(p.id);

  if (!d.title) errors.push(`${where}: missing or empty title`);
  if (!d.description) errors.push(`${where}: missing or empty description`);
  if (!d.type) errors.push(`${where}: missing type`);
  else if (!TYPES.includes(d.type))
    errors.push(`${where}: invalid type "${d.type}"`);

  if (!d.date) errors.push(`${where}: missing date`);
  else if (Number.isNaN(Date.parse(d.date)))
    errors.push(`${where}: invalid date "${d.date}"`);
  if (d.updated && Number.isNaN(Date.parse(d.updated)))
    errors.push(`${where}: invalid updated date "${d.updated}"`);

  if (d.repo && !REPO_URL.test(d.repo)) {
    errors.push(
      `${where}: repo "${d.repo}" is not a GitHub repository URL ` +
        `(expected https://github.com/<owner>/<repo>)`,
    );
  }
  // Reviews carry their own link list, which renders in the review sidebar.
  // Declaring the same URL both ways would print it twice on one page.
  if (d.repo && d.reviewLinks.some((href) => href.replace(/\/$/, "") === d.repo!.replace(/\/$/, ""))) {
    errors.push(
      `${where}: repo "${d.repo}" is already in review.links; drop one`,
    );
  }

  for (const r of d.related) {
    if (!ids.has(r.slug))
      errors.push(`${where}: related slug "${r.slug}" does not exist`);
  }
  for (const s of d.supersedes) {
    if (!ids.has(s))
      errors.push(`${where}: supersedes slug "${s}" does not exist`);
  }
  if (d.supersededBy && !ids.has(d.supersededBy)) {
    errors.push(`${where}: supersededBy slug "${d.supersededBy}" does not exist`);
  }
}

if (errors.length) {
  console.error(`\n✗ content validation failed (${errors.length}):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error("");
  process.exit(1);
}

const drafts = posts.filter((p) => p.data.draft).length;
const unlisted = posts.filter((p) => p.data.unlisted).length;
console.log(
  `✓ content ok, ${posts.length} posts, ${ids.size} unique slugs` +
    (drafts ? `, ${drafts} draft(s) (excluded from production build)` : "") +
    (unlisted ? `, ${unlisted} unlisted (live URL, hidden from listings)` : ""),
);
