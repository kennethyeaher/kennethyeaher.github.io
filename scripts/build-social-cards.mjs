import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import sharp from "sharp";
import { caseStudies } from "../src/data/caseStudies.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const outputRoot = join(projectRoot, "public/images/social");

/** Escape portfolio text before placing it in an SVG text element. */
function escapeText(text) {
  return String(text).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[character]);
}

/** Wrap a project title at word boundaries for the fixed social-card canvas. */
function titleLines(title) {
  const lines = [""];
  for (const word of title.split(/\s+/)) {
    const index = lines.length - 1;
    if (lines[index] && `${lines[index]} ${word}`.length > 23) lines.push(word);
    else lines[index] = `${lines[index]} ${word}`.trim();
  }
  return lines;
}

/** Render one card from the public palette and existing source-backed exhibit. */
async function buildCard(project) {
  const exhibit = project.cover.exhibit;
  if (!exhibit) throw new Error(`Missing cover exhibit for ${project.slug}`);
  const screen = await sharp(join(projectRoot, "public", exhibit.src))
    .resize({ width: 440, height: 410, fit: "inside" })
    .png().toBuffer({ resolveWithObject: true });
  const x = Math.round(910 - screen.info.width / 2);
  const y = Math.round(315 - screen.info.height / 2);
  const radius = exhibit.frame === "phone" ? 18 : exhibit.frame === "sheet" ? 3 : 12;
  const lines = titleLines(project.title);
  const title = lines.map((line, index) =>
    `<text x="70" y="${218 + index * 60}" font-size="50" font-weight="600">${escapeText(line)}</text>`,
  ).join("");
  const roleLines = titleLines(`${project.role} · ${project.year}`);
  const role = roleLines.map((line, index) =>
    `<text x="72" y="${454 + index * 27}" font-size="19" fill="#d4e2eb">${escapeText(line)}</text>`,
  ).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs><linearGradient id="palette" x2="1" y2="1"><stop stop-color="#0d1d29"/><stop offset="1" stop-color="${project.cover.palette[1]}"/></linearGradient></defs>
    <rect width="1200" height="630" fill="url(#palette)"/>
    <rect width="640" height="630" fill="#0d1d29" opacity=".72"/>
    <g fill="white" font-family="sans-serif">
      <text x="72" y="83" font-size="21">Kenneth Yeaher</text>
      ${title}${role}
      <text x="72" y="570" font-size="16" fill="#d4e2eb">kennethyeaher.github.io</text>
    </g>
    <rect x="${x - 10}" y="${y - 10}" width="${screen.info.width + 20}" height="${screen.info.height + 20}" rx="${radius}" fill="#18202a" stroke="#7d8a96"/>
  </svg>`;
  const png = await sharp(Buffer.from(svg))
    .composite([{ input: screen.data, left: x, top: y }])
    .png().toBuffer();
  await writeFile(join(outputRoot, `${project.slug}.png`), png);
}

await mkdir(outputRoot, { recursive: true });
for (const project of caseStudies) await buildCard(project);
console.log(`Built ${caseStudies.length} project social cards`);
