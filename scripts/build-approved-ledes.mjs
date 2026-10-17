// regenerate tests/fixtures/approved-ledes.json from the private prose mock export.
// the fixture keeps only each chapter's approved paragraphs, so ci can verify lede copy without .private.
// usage: node scripts/build-approved-ledes.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { caseStudies } from "../src/data/caseStudies.mjs";

export const prosePath = fileURLToPath(new URL("../.private/redesign-spec/prose.json", import.meta.url));
export const fixturePath = fileURLToPath(new URL("../tests/fixtures/approved-ledes.json", import.meta.url));

// the export keeps mocks for pages that were taken down (the usm benchmark); only published pages reach the fixture.
const published = new Set(caseStudies.map(({ slug }) => slug));

/** per published slug, the paragraphs of each chapter in order; no node ids, frame names or heads. */
export function approvedLedes(prose) {
  return Object.fromEntries(Object.entries(prose).filter(([slug]) => published.has(slug)).map(([slug, { chapters }]) => [slug, chapters.map(({ paragraphs }) => paragraphs)]));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const ledes = approvedLedes(JSON.parse(readFileSync(prosePath, "utf8")));
  writeFileSync(fixturePath, `${JSON.stringify(ledes, null, 2)}\n`);
  console.log(`Wrote approved ledes for ${Object.keys(ledes).length} pages`);
}
