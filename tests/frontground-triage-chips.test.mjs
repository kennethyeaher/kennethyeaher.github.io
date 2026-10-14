import { statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { caseStudies } from "../src/data/caseStudies.mjs";

const projectRoot = new URL("..", import.meta.url).pathname;
const frontground = caseStudies.find((entry) => entry.slug === "frontground");

// the doctor and nurse screens now show triage as a shape and a word (red square, yellow rounded, green circle), so
// the copy no longer names letters.
test("Frontground's copy describes triage as a shape and a word, not a letter", () => {
  const text = JSON.stringify(frontground);
  assert.doesNotMatch(text, /carries a letter/);
  assert.doesNotMatch(text, /E, U, D and M/);
  assert.match(text, /Triage carries a shape and a word as well as a colour/);
  assert.match(text, /Red, Yellow and Green survive both\./);
});

test("Frontground's solution annotation 04 names the shape and the word", () => {
  const solution = frontground.exhibits.find((exhibit) => exhibit.id === "the-solution");
  const note = solution.annotations.find((annotation) => annotation.num === "04");
  assert.equal(note.label, "Triage carries a shape and a word, not only a colour");
});

// pinning inter's opsz axis at 14 keeps the specimen face small; the TerpCare and Sohive pages load it.
test("the Inter specimen font stays under 40000 bytes", () => {
  assert.ok(statSync(join(projectRoot, "public", "fonts", "inter", "inter-latin.woff2")).size < 40000);
});
