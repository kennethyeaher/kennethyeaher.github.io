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
const exhibitWidths = [320, 480, 960, 1440, 1920];
const maxWidth = 1920;
// a zoomable figure's zoom copy, wider than the cap and kept out of the srcset, so only a zoom ever loads it.
const zoomQuality = 80;

/** collect every image an exhibit places on a stage, once each. */
function exhibitSources() {
  const sources = new Set();
  for (const project of caseStudies) {
    for (const exhibit of project.exhibits ?? []) {
      // visuals sit on the exhibit itself, on each stage of a pair, or are the tiles of a states grid.
      // the writing pass adds a scrolling laptop, walkthrough screens and a pinned phone beside an exhibit, and
      // redesign 2 adds rows after a stage (a journey's rows are table rows, with no visuals), and a live specimen
      // can show a capture (frontground's greyscale toggle). elms adds its four paper prototype photos, and the capstone
      // research layout a figure block (its working journey map).
      const visuals = [...(exhibit.visuals ?? []), ...(exhibit.stages ?? []).flatMap((stage) => stage.visuals ?? []), ...(exhibit.tiles ?? []), ...(exhibit.figure ? [exhibit.figure] : []),
        ...(exhibit.scroller ? [exhibit.scroller.visual] : []), ...(exhibit.walkthrough?.steps ?? []).map((step) => step.screen), ...(exhibit.pins ? [exhibit.pins.visual] : []),
        ...(exhibit.rows?.visuals ?? []), ...(exhibit.specimens ?? []).flatMap((specimen) => specimen.visual ? [specimen.visual] : []),
        ...(exhibit.papers?.cards ?? []).map((card) => card.photo), ...(exhibit.blocks ?? []).flatMap((block) => block.image?.src ? [block.image] : [])];
      for (const visual of visuals) sources.add(visual.src);
    }
  }
  return [...sources];
}

/** the figure blocks that zoom, each with the width its zoom draws at (capstone 692:153). */
function zoomSources() {
  return caseStudies.flatMap((project) => (project.exhibits ?? []).flatMap((exhibit) => exhibit.blocks ?? []))
    .filter((block) => block.image?.src && typeof block.zoom === "number")
    .map((block) => ({ src: block.image.src, width: block.zoom }));
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

// zoom copies sit beside the sized ones under the same naming, outside the manifest the srcsets read.
const zoomFiles = [];
for (const { src, width } of zoomSources()) {
  const input = join(projectRoot, "public", src);
  const output = join(outputRoot, `${basename(src, extname(src))}-${width}.webp`);
  const existing = await stat(output).catch(() => null);
  if (!existing || existing.mtimeMs < (await stat(input)).mtimeMs) {
    await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: zoomQuality }).toFile(output);
  }
  zoomFiles.push(basename(output));
}

// the manifest is what the components build srcsets from, keyed by the name the sized copies use, sorted for a stable diff.
const sorted = Object.fromEntries(Object.keys(manifest).sort().map((name) => [name, manifest[name]]));
await writeFile(manifestPath, `{\n${Object.entries(sorted).map(([name, widths]) => `  ${JSON.stringify(name)}: [${widths.join(", ")}]`).join(",\n")}\n}\n`);

// stale copies (a width no source gets any more, or an image no exhibit uses) must not ship.
const expected = new Set([...Object.entries(sorted).flatMap(([name, widths]) => widths.map((width) => `${name}-${width}.webp`)), ...zoomFiles]);
let removed = 0;
for (const file of await readdir(outputRoot)) {
  if (expected.has(file)) continue;
  await unlink(join(outputRoot, file));
  removed += 1;
}
console.log(`Built sized copies of ${sources.length} exhibit images (${expected.size} files, ${zoomFiles.length} zoom${removed ? `, ${removed} stale removed` : ""})`);
