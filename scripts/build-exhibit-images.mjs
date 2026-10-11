import { mkdir, readdir, stat, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { basename, extname, join } from "node:path";
import sharp from "sharp";
import { caseStudies } from "../src/data/caseStudies.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputRoot = join(projectRoot, "public/images/exhibits/sized");
const manifestPath = join(projectRoot, "src/data/exhibit-sizes.json");
// the standard widths, plus one copy at the source's own width so a 2x screen can reach it; nothing is written
// wider than the source or than this cap, and every copy's name is its real width.
const exhibitWidths = [480, 960, 1440, 1920];
const maxWidth = 1920;

/** collect every image an exhibit places on a stage, once each. */
function exhibitSources() {
  const sources = new Set();
  for (const project of caseStudies) {
    for (const exhibit of project.exhibits ?? []) {
      // visuals sit on the exhibit itself, on each stage of a pair, or are the tiles of a states grid.
      // the writing pass adds a scrolling laptop, walkthrough screens and a pinned phone beside an exhibit.
      const visuals = [...(exhibit.visuals ?? []), ...(exhibit.stages ?? []).flatMap((stage) => stage.visuals ?? []), ...(exhibit.tiles ?? []), ...(exhibit.figure ? [exhibit.figure] : []),
        ...(exhibit.scroller ? [exhibit.scroller.visual] : []), ...(exhibit.walkthrough?.steps ?? []).map((step) => step.screen), ...(exhibit.pins ? [exhibit.pins.visual] : [])];
      for (const visual of visuals) sources.add(visual.src);
    }
  }
  return [...sources];
}

/** the widths a source gets: its own width capped, and every standard width below that. */
function widthsFor(sourceWidth) {
  const top = Math.min(sourceWidth, maxWidth);
  return [...exhibitWidths.filter((width) => width < top), top];
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
const sources = exhibitSources();
const manifest = {};
for (const src of sources) {
  const { name, widths } = await buildVariants(src);
  if (manifest[name]) throw new Error(`two exhibit images share the name ${name}; sized copies would overwrite each other`);
  manifest[name] = widths;
}

// the manifest is what the components build srcsets from, keyed by the name the sized copies use, sorted for a stable diff.
const sorted = Object.fromEntries(Object.keys(manifest).sort().map((name) => [name, manifest[name]]));
await writeFile(manifestPath, `{\n${Object.entries(sorted).map(([name, widths]) => `  ${JSON.stringify(name)}: [${widths.join(", ")}]`).join(",\n")}\n}\n`);

// stale copies (a width no source gets any more, or an image no exhibit uses) must not ship.
const expected = new Set(Object.entries(sorted).flatMap(([name, widths]) => widths.map((width) => `${name}-${width}.webp`)));
let removed = 0;
for (const file of await readdir(outputRoot)) {
  if (expected.has(file)) continue;
  await unlink(join(outputRoot, file));
  removed += 1;
}
console.log(`Built sized copies of ${sources.length} exhibit images (${expected.size} files${removed ? `, ${removed} stale removed` : ""})`);
