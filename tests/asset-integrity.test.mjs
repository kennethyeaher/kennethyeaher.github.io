import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { aboutGallery, profile, projects } from "../src/data/portfolio.mjs";

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
      project.cover.video,
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
