import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test, { before } from "node:test";
import assert from "node:assert/strict";
import { exploreItems, explorePalettes, visualBackground } from "../src/data/explore.mjs";

const projectRoot = new URL("..", import.meta.url).pathname;
const exploreScript = readFileSync(join(projectRoot, "src", "scripts", "explore.ts"), "utf8");
let gridHtml = "";

const page = (...parts) => readFileSync(join(projectRoot, "dist", ...parts, "index.html"), "utf8");
const section = (html, category) => html.match(new RegExp(`<section[^>]*data-category="${category}"[^>]*>([\\s\\S]*?)</section>`))?.[1] ?? "";
const tiles = (html) => [...html.matchAll(/<a [^>]*class="explore-tile"[^>]*>/g)].map(([tag]) => tag);

before(() => {
  execFileSync("npm", ["run", "build"], { cwd: projectRoot, encoding: "utf8", stdio: "pipe" });
  gridHtml = page("explore");
});

test("the explore data holds 12 school and 8 personal placeholders with three gradient visuals each", () => {
  const school = exploreItems.filter((item) => item.category === "school");
  const personal = exploreItems.filter((item) => item.category === "personal");
  assert.deepEqual(school.map((item) => item.id), Array.from({ length: 12 }, (_, i) => `school-${String(i + 1).padStart(2, "0")}`));
  assert.deepEqual(personal.map((item) => item.id), Array.from({ length: 8 }, (_, i) => `personal-${String(i + 1).padStart(2, "0")}`));
  assert.ok(school.every((item) => item.code === "XX-26"));
  assert.ok(personal.every((item) => item.code === "XX-25"));
  assert.ok(exploreItems.every((item) => /^[A-Z]{2}-\d\d$/.test(item.code)));
  // the default info line.
  assert.ok(exploreItems.every((item) => item.info === "Coming soon"));

  // school takes the 12 palettes in order, personal starts at the sixth, and visuals 2 and 3 use the next two.
  assert.equal(explorePalettes.length, 12);
  assert.deepEqual(explorePalettes[0], ["#101826", "#2c5a7a", "#9cc3d8"]);
  school.forEach((item, i) => assert.deepEqual(item.visuals.map((v) => v.gradient), [0, 1, 2].map((k) => explorePalettes[(i + k) % 12])));
  personal.forEach((item, i) => assert.deepEqual(item.visuals.map((v) => v.gradient), [0, 1, 2].map((k) => explorePalettes[(5 + i + k) % 12])));
  assert.equal(visualBackground({ gradient: explorePalettes[0] }), "linear-gradient(90deg, #101826 0%, #2c5a7a 55%, #9cc3d8 100%)");
});

test("explore sits in the rail between Work and About, current on the grid and the item pages", () => {
  for (const html of [gridHtml, page("explore", "personal-03")]) {
    const rail = html.slice(html.indexOf('aria-label="Primary navigation"'), html.indexOf("</nav>", html.indexOf('aria-label="Primary navigation"')));
    assert.deepEqual([...rail.matchAll(/class="rail-link"[^>]*>\s*([^<]+?)\s*</g)].map(([, label]) => label), ["Work", "Explore", "About", "Resume"]);
    assert.match(rail, /<a href="\/explore" class="rail-link" aria-current="page" data-astro-prefetch="viewport">\s*Explore\s*</);
  }
});

test("the grid has a School and Personal toggle with pressed states kept in ?view=", () => {
  assert.match(gridHtml, /<h1[^>]*class="sr-only"[^>]*>Explore<\/h1>/);
  const toggle = gridHtml.match(/<div[^>]*class="explore-toggle"[^>]*role="group"[^>]*aria-label="Category"[^>]*>([\s\S]*?)<\/div>/)?.[1];
  assert.ok(toggle, "the toggle group renders");
  const buttons = [...toggle.matchAll(/<button type="button"[^>]*data-view-button="(\w+)"[^>]*aria-pressed="(true|false)"[^>]*>\s*(\w+)\s*<\/button>/g)].map(([, view, pressed, label]) => [view, pressed, label]);
  assert.deepEqual(buttons, [["school", "true", "School"], ["personal", "false", "Personal"]]);
  // the view is read from the url before first paint, and written back with replaceState.
  assert.match(gridHtml, /new URLSearchParams\(location\.search\)\.get\("view"\) === "personal"/);
  assert.match(exploreScript, /history\.replaceState/);
  assert.match(exploreScript, /searchParams\.(set|delete)\("view"/);
  assert.match(exploreScript, /setAttribute\("aria-pressed"/);
});

test("the size button switches 4 to 2 per row (2 to 1 on phones), says what it will do and respects reduced motion", () => {
  assert.match(gridHtml, /<button type="button"[^>]*class="explore-size"[^>]*data-size-button[^>]*aria-label="Show 2 per row"/);
  assert.match(gridHtml, /data-explore[^>]*data-size="many"/);
  assert.match(exploreScript, /"Show 4 per row"/);
  assert.match(exploreScript, /"Show 1 per row"/);
  assert.match(exploreScript, /prefers-reduced-motion: reduce/);
  assert.match(exploreScript, /startViewTransition/);
});

test("the grid lists every item per category as linked tiles labelled for the cursor", () => {
  // both categories render as labelled lists, so the page works with scripts off.
  assert.match(gridHtml, /<section[^>]*data-category="school"[^>]*aria-labelledby="explore-school"/);
  assert.match(gridHtml, /<section[^>]*data-category="personal"[^>]*aria-labelledby="explore-personal"/);
  assert.match(gridHtml, /<h2 id="explore-school"[^>]*>School<\/h2>/);
  assert.match(gridHtml, /<h2 id="explore-personal"[^>]*>Personal<\/h2>/);
  assert.equal(tiles(section(gridHtml, "school")).length, 12);
  assert.equal(tiles(section(gridHtml, "personal")).length, 8);
  for (const item of exploreItems) {
    const tag = tiles(gridHtml).find((t) => t.includes(`href="/explore/${item.id}"`));
    assert.ok(tag, item.id);
    assert.match(tag, /data-cursor="card"/);
    assert.match(tag, new RegExp(`data-cursor-label="View ${item.code}"`));
  }
  // each tile is its square visual, then the code.
  assert.match(gridHtml, /<div class="explore-visual"[^>]*aria-hidden="true"[^>]*style="background-image: linear-gradient\(90deg, #101826 0%, #2c5a7a 55%, #9cc3d8 100%\)"/);
  assert.equal((gridHtml.match(/<span class="explore-code"[^>]*>XX-26<\/span>/g) ?? []).length, 12);
  assert.equal((gridHtml.match(/<span class="explore-code"[^>]*>XX-25<\/span>/g) ?? []).length, 8);
});

test("each item has its own page with back, arrows, dots, code, info and a live region", () => {
  for (const item of exploreItems) assert.ok(existsSync(join(projectRoot, "dist", "explore", item.id, "index.html")), item.id);

  const school = page("explore", "school-01");
  const personal = page("explore", "personal-03");
  // back to the grid, keeping the view.
  assert.match(school, /<a class="explore-back"[^>]*href="\/explore"[^>]*><span aria-hidden="true"[^>]*>‹<\/span>\s*Explore<\/a>/);
  assert.match(personal, /<a class="explore-back"[^>]*href="\/explore\?view=personal"[^>]*><span aria-hidden="true"[^>]*>‹<\/span>\s*Explore<\/a>/);

  assert.match(school, /<button type="button"[^>]*class="explore-arrow is-prev"[^>]*data-step="-1"[^>]*aria-label="Previous visual"/);
  assert.match(school, /<button type="button"[^>]*class="explore-arrow is-next"[^>]*data-step="1"[^>]*aria-label="Next visual"/);
  assert.equal((school.match(/class="explore-slide[^"]*"/g) ?? []).length, 3);
  // gradient visuals are decorative.
  assert.equal((school.match(/<div class="explore-slide[^"]*"[^>]*aria-hidden="true"/g) ?? []).length, 3);
  assert.equal((school.match(/<li class="explore-dot[^"]*"/g) ?? []).length, 3);
  assert.match(school, /<ol class="explore-dots"[^>]*aria-hidden="true"/);
  assert.match(school, /<p class="sr-only"[^>]*aria-live="polite"[^>]*data-viewer-status/);
  assert.match(school, /<h1 class="explore-item-code"[^>]*>XX-26<\/h1>/);
  assert.match(personal, /<h1 class="explore-item-code"[^>]*>XX-25<\/h1>/);
  assert.match(school, /<p class="explore-item-info"[^>]*>Coming soon<\/p>/);

  // arrows, keys and swipes all step and wrap, and the live region says where it is.
  assert.match(exploreScript, /"ArrowLeft"/);
  assert.match(exploreScript, /"ArrowRight"/);
  assert.match(exploreScript, /pointerType === "touch"/);
  assert.match(exploreScript, /`Visual \$\{.+\} of \$\{.+\}`/);
  assert.match(exploreScript, /% count/);
});
