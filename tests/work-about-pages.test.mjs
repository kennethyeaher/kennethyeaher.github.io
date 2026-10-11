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

test("the Work page renders the approved thesis and the design-first project order", () => {
  assert.match(visibleText(workHtml), /I’m Ken, a product designer and data scientist\./);

  const routes = [
    "/work/terpcarehub",
    "/work/frontground",
    "/work/sohive",
    "/work/terpcare",
    "/work/ovara",
    "/work/college-park-capstone",
    "/work/kairo-health",
    "/work/usm-venture-benchmark",
  ];
  const positions = routes.map((route) => workHtml.indexOf(`href="${route}"`));

  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.equal((workHtml.match(/class="project-card"/g) ?? []).length, 8);
  assert.equal((workHtml.match(/data-tilt-card/g) ?? []).length, 8);
  assert.equal((workHtml.match(/data-project-cover/g) ?? []).length, 8);
  assert.doesNotMatch(workHtml, /class="cover-exhibit|data-device-frame=|class="[^"]*has-exhibit/);
  assert.equal((workHtml.match(/class="cover-scrim"/g) ?? []).length, 8);
  // names go on the clicked card only, from the head script, so the static markup carries none.
  assert.doesNotMatch(workHtml.replace(/<script[\s\S]*?<\/script>/g, ""), /view-transition-name/);
  assert.match(workHtml, /addEventListener\("pageswap"/);
  assert.match(workHtml, /addEventListener\("pagereveal"/);
  assert.equal((workHtml.match(/data-cover-gradient/g) ?? []).length, 8);
  assert.doesNotMatch(workHtml, /\.mp4|data-cover-video/);
  assert.doesNotMatch(workHtml, /Read case study/);
  assert.doesNotMatch(workHtml, /project-media is-contained/);
});

test("home v2 follows figma 131:1693 and 131:1973: a work header, a compact job list on phones, serif card lines", () => {
  assert.match(workHtml, /<h2 id="work-title"[^>]*>Selected work<\/h2>\s*<p[^>]*>08 projects<\/p>/);
  // card titles sit under the work header; the view transition names the clicked card's h3.
  assert.equal((workHtml.match(/<div class="project-heading"[^>]*>\s*<h3/g) ?? []).length, 8);
  assert.match(workHtml, /card\.querySelector\("h3"\)\.style\.viewTransitionName/);
  // the three entries the phone layout keeps, in order.
  const compact = [...workHtml.matchAll(/<li class="is-compact"[^>]*>\s*<span class="experience-year"[^>]*>(\d{4})<\/span>\s*<span class="experience-org"[^>]*>([^<]+)<\/span>\s*<span class="experience-role"[^>]*>([^<]+)<\/span>/g)].map((match) => match.slice(1).join(" "));
  assert.deepEqual(compact, ["2026 USM Maryland Momentum Fund Summer Investment Associate", "2025 Towers Surgical Partners Data Analyst", "2022 Frontground Founder"]);
  assert.equal((workHtml.match(/<li[^>]*>\s*<span class="experience-year"/g) ?? []).length, 6);

  const css = [...workHtml.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((match) => readFileSync(join(projectRoot, "dist", match[1]), "utf8")).join("\n");
  assert.match(css, /\.home-intro\[[^\]]+\]\{[^}]*padding-top:96px;padding-bottom:64px/);
  assert.match(css, /\.project-role\[[^\]]+\]\{[^}]*color:var\(--color-muted-label\);font:15px ?\/ ?1\.3 var\(--body\)/);
  assert.match(css, /\.project-summary\[[^\]]+\]\{[^}]*color:var\(--ink\);font-size:17px/);
});

test("the About page is HCI-focused and renders no fake photo placeholders", () => {
  assert.match(aboutHtml, /Human-computer interaction is the thread connecting my work/);
  assert.match(aboutHtml, /iPad-first electronic medical record/);
  assert.match(aboutHtml, /USM Maryland Momentum Fund/);
  assert.match(aboutHtml, /data-about-gallery/);
  assert.doesNotMatch(aboutHtml, /placeholder/i);
});
