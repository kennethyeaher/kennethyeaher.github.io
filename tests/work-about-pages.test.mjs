import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test, { before } from "node:test";
import assert from "node:assert/strict";

const projectRoot = new URL("..", import.meta.url).pathname;
let workHtml = "";
let aboutHtml = "";

const visibleText = (html) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

before(() => {
  execFileSync("npm", ["run", "build"], {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: "pipe",
  });
  workHtml = readFileSync(join(projectRoot, "dist", "index.html"), "utf8");
  aboutHtml = readFileSync(join(projectRoot, "dist", "about", "index.html"), "utf8");
});

test("the Work page renders the approved thesis and project order", () => {
  assert.match(visibleText(workHtml), /product specialist led by evidence/i);

  const routes = [
    "/work/college-park-capstone",
    "/work/ovara",
    "/work/kairo-health",
    "/work/terpcare",
    "/work/cognitive-wellness-garden",
  ];
  const positions = routes.map((route) => workHtml.indexOf(`href="${route}"`));

  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.equal((workHtml.match(/class="project-card"/g) ?? []).length, 5);
  assert.equal((workHtml.match(/data-cursor-label="View case study"/g) ?? []).length, 5);
  assert.equal((workHtml.match(/data-project-cover/g) ?? []).length, 5);
  assert.doesNotMatch(workHtml, /Read case study/);
  assert.doesNotMatch(workHtml, /project-media is-contained/);
});

test("the About page is HCI-focused and renders no fake photo placeholders", () => {
  assert.match(aboutHtml, /Human-computer interaction is the thread connecting my work/);
  assert.match(aboutHtml, /more than 60 physician interviews/);
  assert.match(aboutHtml, /USM Maryland Momentum Fund/);
  assert.match(aboutHtml, /data-about-gallery/);
  assert.doesNotMatch(aboutHtml, /placeholder/i);
});
