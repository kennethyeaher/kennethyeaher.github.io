import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { aboutChapters, aboutGallery, profile, projects } from "../src/data/portfolio.mjs";

const projectRoot = new URL("..", import.meta.url).pathname;
const publicRoot = join(projectRoot, "public");

function publicFile(pathname) {
  return join(publicRoot, pathname.replace(/^\//, ""));
}

function sha256(pathname) {
  return createHash("sha256").update(readFileSync(pathname)).digest("hex");
}

test("every published portfolio media reference resolves to a non-empty real file", () => {
  const mediaPaths = [
    ...aboutGallery.map(({ src }) => src),
    ...projects.flatMap((project) => [
      project.cardImage,
      project.heroImage,
      project.cover.poster,
      project.cover.exhibit?.src,
      `/images/social/${project.slug}.png`,
      ...project.sections.flatMap((section) =>
        "media" in section && section.media ? section.media.flatMap((item) => [item.src, item.poster, item.after?.src, ...(item.sources ?? []).map(({ src }) => src)]) : [],
      ),
    ]),
  ];

  for (const mediaPath of new Set(mediaPaths.filter(Boolean))) {
    const absolutePath = publicFile(mediaPath);
    assert.equal(existsSync(absolutePath), true, `${mediaPath} is missing`);
    assert.ok(statSync(absolutePath).size > 0, `${mediaPath} is empty`);
  }
});

/** a jpeg's pixel size, read from its first start-of-frame marker. */
function jpegSize(pathname) {
  const bytes = readFileSync(pathname);
  let offset = 2;
  while (offset < bytes.length) {
    const marker = bytes[offset + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
    }
    offset += 2 + bytes.readUInt16BE(offset + 2);
  }
  throw new Error(`${pathname} has no frame header`);
}

test("every About chapter photo is a gallery photo with alt text and its real pixel size", () => {
  const gallery = new Map(aboutGallery.map((item) => [item.src, item]));
  const ids = aboutChapters.flatMap((chapter) => [chapter.lead, ...chapter.rows.flat()]);
  assert.equal(new Set(ids).size, ids.length, "no photo repeats across chapters");
  for (const id of ids) {
    const item = gallery.get(`/images/about/${id}.jpg`);
    assert.ok(item, `${id} is in aboutGallery`);
    assert.ok(item.alt.trim().length > 0, `${id} has alt text`);
    assert.doesNotMatch(item.alt, /—/);
  }
  for (const item of aboutGallery) {
    assert.deepEqual(jpegSize(publicFile(item.src)), { width: item.width, height: item.height }, `${item.src} size`);
  }
});

test("the published resume matches the approved master PDF fingerprint", () => {
  const publishedResume = publicFile(profile.links.resume);

  assert.equal(existsSync(publishedResume), true);
  assert.equal(
    sha256(publishedResume),
    "6d904b3d0b2c727d9228f358a74198a24074bda727b4cf4d82a427d8c93f45b8",
  );
});


test("published social cards use the required dimensions and cover exhibits retain source proportions", () => {
  for (const project of projects) {
    const png = readFileSync(publicFile(`/images/social/${project.slug}.png`));
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
    const exhibit = project.cover.exhibit;
    assert.ok(exhibit.width > 0 && exhibit.height > 0);
    assert.ok(["phone", "tablet", "laptop", "sheet"].includes(exhibit.frame));
    assert.ok(project.sections.some((section) => section.media?.some((item) => item.src === exhibit.src)), `${project.slug} cover must use a documented exhibit`);
  }
});

test("exhibit kit assets from the figma components ship as real files", () => {
  for (const name of ["browser-light-red", "browser-light-yellow", "browser-light-green"]) {
    const svg = readFileSync(publicFile(`/images/exhibits/${name}.svg`), "utf8");
    assert.match(svg, /<svg[^>]*width="11"/);
  }
});

/** every image an exhibit places on a stage, once each: the same set scripts/build-exhibit-images.mjs sizes. */
function exhibitVisuals() {
  const visuals = new Map();
  for (const project of projects) {
    for (const exhibit of project.exhibits ?? []) {
      for (const visual of [...(exhibit.visuals ?? []), ...(exhibit.stages ?? []).flatMap((stage) => stage.visuals ?? []), ...(exhibit.tiles ?? []), ...(exhibit.figure ? [exhibit.figure] : []),
        ...(exhibit.scroller ? [exhibit.scroller.visual] : []), ...(exhibit.walkthrough?.steps ?? []).map((step) => step.screen), ...(exhibit.pins ? [exhibit.pins.visual] : []),
        ...(exhibit.rows?.visuals ?? [])]) {
        visuals.set(visual.src, visual);
      }
    }
  }
  return [...visuals.values()];
}

test("every exhibit image and loop file is a real file in public", () => {
  for (const visual of exhibitVisuals()) {
    for (const file of [visual.src, visual.loop?.src, visual.loop?.poster].filter(Boolean)) {
      assert.ok(existsSync(publicFile(file)) && statSync(publicFile(file)).size > 0, `${file} is missing`);
    }
  }
});

test("the exhibit size manifest lists the standard widths below each source plus one at the source width, capped at 1920, and every copy exists", () => {
  const manifest = JSON.parse(readFileSync(join(projectRoot, "src/data/exhibit-sizes.json"), "utf8"));
  const sizedDir = publicFile("/images/exhibits/sized");
  const expectedFiles = new Set();
  for (const visual of exhibitVisuals()) {
    const name = visual.src.split("/").pop().replace(/\.[^.]+$/, "");
    const widths = manifest[name];
    assert.ok(Array.isArray(widths), `${name} is missing from the manifest`);
    const top = Math.min(visual.width, 1920);
    const expected = [...[320, 480, 960, 1440, 1920].filter((width) => width < top), top];
    assert.deepEqual(widths, expected, `${name} (source ${visual.width} wide) has the wrong widths`);
    for (const width of widths) {
      const file = `${name}-${width}.webp`;
      expectedFiles.add(file);
      assert.ok(existsSync(join(sizedDir, file)) && statSync(join(sizedDir, file)).size > 0, `${file} is missing`);
    }
  }
  // nothing ships unused: every file in the sized folder is one the manifest names.
  assert.deepEqual(readdirSync(sizedDir).filter((file) => !expectedFiles.has(file)), []);
  // and the manifest names only exhibit images.
  assert.deepEqual(Object.keys(manifest).sort(), [...new Set(exhibitVisuals().map((visual) => visual.src.split("/").pop().replace(/\.[^.]+$/, "")))].sort());
});
