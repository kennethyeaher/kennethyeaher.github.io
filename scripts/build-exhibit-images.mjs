import { mkdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { basename, extname, join } from "node:path";
import sharp from "sharp";
import { caseStudies } from "../src/data/caseStudies.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputRoot = join(projectRoot, "public/images/exhibits/sized");
const exhibitWidths = [480, 960];

/** collect every image an exhibit places on a stage, once each. */
function exhibitSources() {
  const sources = new Set();
  for (const project of caseStudies) {
    for (const exhibit of project.exhibits ?? []) {
      // visuals sit on the exhibit itself, on each stage of a pair, or are the tiles of a states grid.
      const visuals = [...(exhibit.visuals ?? []), ...(exhibit.stages ?? []).flatMap((stage) => stage.visuals ?? []), ...(exhibit.tiles ?? []), ...(exhibit.figure ? [exhibit.figure] : [])];
      for (const visual of visuals) sources.add(visual.src);
    }
  }
  return [...sources];
}

/** write a webp copy at each width unless an up to date one already exists. */
async function buildVariants(src) {
  const input = join(projectRoot, "public", src);
  const name = basename(src, extname(src));
  const sourceTime = (await stat(input)).mtimeMs;
  for (const width of exhibitWidths) {
    const output = join(outputRoot, `${name}-${width}.webp`);
    const existing = await stat(output).catch(() => null);
    if (existing && existing.mtimeMs >= sourceTime) continue;
    await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(output);
  }
}

await mkdir(outputRoot, { recursive: true });
const sources = exhibitSources();
for (const src of sources) await buildVariants(src);
console.log(`Built sized copies of ${sources.length} exhibit images`);
