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
      ...project.sections.flatMap((section) =>
        "media" in section && section.media ? section.media.map(({ src }) => src) : [],
      ),
    ]),
  ];

  for (const mediaPath of new Set(mediaPaths)) {
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
    "a53d35cdff2fd9a9f939c316fb38bebc7b2d47e97df5ebec72be6223225a7655",
  );
});
