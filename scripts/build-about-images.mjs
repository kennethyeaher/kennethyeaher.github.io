import { mkdir, readdir, stat, unlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { basename, extname, join } from "node:path";
import sharp from "sharp";
import { aboutGallery } from "../src/data/portfolio.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputRoot = join(projectRoot, "public/images/about/sized");
const manifestPath = join(projectRoot, "src/data/about-sizes.json");
// the About photos render from about 50px wide (a slim photo in a row of four on a phone) to 932 (a lead at 980), so
// the standard widths start small; each photo also gets a copy at its own width, and every copy's name is its real width.
const aboutWidths = [160, 320, 480, 640, 960, 1280];

/** write a webp copy at each width under the jpeg's own, and one at it, unless an up to date one exists. */
async function buildVariants(src) {
  const input = join(projectRoot, "public", src);
  const name = basename(src, extname(src));
  const sourceTime = (await stat(input)).mtimeMs;
  const { width: sourceWidth } = await sharp(input).metadata();
  const widths = [...aboutWidths.filter((width) => width < sourceWidth), sourceWidth];
  for (const width of widths) {
    const output = join(outputRoot, `${name}-${width}.webp`);
    const existing = await stat(output).catch(() => null);
    if (existing && existing.mtimeMs >= sourceTime) continue;
    await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(output);
  }
  return { name, widths };
}

await mkdir(outputRoot, { recursive: true });
const manifest = {};
for (const { src } of aboutGallery) {
  const { name, widths } = await buildVariants(src);
  manifest[name] = widths;
}

// AboutChapters builds each srcset from this, keyed by file name, sorted for a stable diff.
const sorted = Object.fromEntries(Object.keys(manifest).sort().map((name) => [name, manifest[name]]));
await writeFile(manifestPath, `{\n${Object.entries(sorted).map(([name, widths]) => `  ${JSON.stringify(name)}: [${widths.join(", ")}]`).join(",\n")}\n}\n`);

// copies of a photo the gallery dropped, or at a width it no longer gets, must not ship.
const expected = new Set(Object.entries(sorted).flatMap(([name, widths]) => widths.map((width) => `${name}-${width}.webp`)));
let removed = 0;
for (const file of await readdir(outputRoot)) {
  if (expected.has(file)) continue;
  await unlink(join(outputRoot, file));
  removed += 1;
}
console.log(`Built sized copies of ${aboutGallery.length} About photos (${expected.size} files${removed ? `, ${removed} stale removed` : ""})`);
