import { mkdir, readdir, stat, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { basename, extname, join } from "node:path";
import sharp from "sharp";
import { exploreItems } from "../src/data/explore.mjs";

// the explore screens and step thumbnails get sized webp copies the same way the exhibits do (scripts/build-exhibit-images.mjs),
// in their own folder and manifest so the exhibit manifest stays pinned by its test.
const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputRoot = join(projectRoot, "public/images/explore/sized");
const manifestPath = join(projectRoot, "src/data/explore-sizes.json");
const exploreWidths = [320, 480, 960, 1440, 1920];
const maxWidth = 1920;

/** every screen and thumbnail, once each (a thumbnail is often the screen itself). */
function exploreSources() {
  return [...new Set(exploreItems.flatMap((item) => [...item.screens, ...item.thumbs].map((image) => image.src)))];
}

/** the widths a source gets: its own width capped, and every standard width below that. */
function widthsFor(sourceWidth) {
  const top = Math.min(sourceWidth, maxWidth);
  return [...exploreWidths.filter((width) => width < top), top];
}

/** write a webp copy at each width unless an up to date one already exists; return the widths written. */
async function buildVariants(src) {
  const input = join(projectRoot, "public", src);
  const name = basename(src, extname(src));
  const sourceTime = (await stat(input)).mtimeMs;
  const { width: sourceWidth } = await sharp(input).metadata();
  const widths = widthsFor(sourceWidth);
  for (const width of widths) {
    const output = join(outputRoot, `${name}-${width}.webp`);
    const existing = await stat(output).catch(() => null);
    if (existing && existing.mtimeMs >= sourceTime) continue;
    await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(output);
  }
  return { name, widths };
}

await mkdir(outputRoot, { recursive: true });
const sources = exploreSources();
const manifest = {};
for (const src of sources) {
  const { name, widths } = await buildVariants(src);
  if (manifest[name]) throw new Error(`two explore images share the name ${name}; sized copies would overwrite each other`);
  manifest[name] = widths;
}

// keyed by the name the sized copies use, sorted for a stable diff.
const sorted = Object.fromEntries(Object.keys(manifest).sort().map((name) => [name, manifest[name]]));
await writeFile(manifestPath, `{\n${Object.entries(sorted).map(([name, widths]) => `  ${JSON.stringify(name)}: [${widths.join(", ")}]`).join(",\n")}\n}\n`);

// stale copies (a width no source gets any more, or an image no item uses) must not ship.
const expected = new Set(Object.entries(sorted).flatMap(([name, widths]) => widths.map((width) => `${name}-${width}.webp`)));
let removed = 0;
for (const file of await readdir(outputRoot)) {
  if (expected.has(file)) continue;
  await unlink(join(outputRoot, file));
  removed += 1;
}
console.log(`Built sized copies of ${sources.length} explore images (${expected.size} files${removed ? `, ${removed} stale removed` : ""})`);
