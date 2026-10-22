import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test, { before } from "node:test";
import assert from "node:assert/strict";
import { exploreCategories, exploreItems } from "../src/data/explore.mjs";

const projectRoot = new URL("..", import.meta.url).pathname;
const source = (...parts) => readFileSync(join(projectRoot, ...parts), "utf8");
const reelScript = source("src", "scripts", "explore-reel.ts");
const itemScript = source("src", "scripts", "explore-item.ts");
const reelSource = source("src", "pages", "explore", "index.astro");
const itemSource = source("src", "pages", "explore", "[id].astro");
const sizes = JSON.parse(source("src", "data", "explore-sizes.json"));
// the figma export lives in .private, which ci does not have; the copy checks run only where it exists.
const specPath = join(projectRoot, ".private", "explore-v5", "explore-v5.json");
const spec = existsSync(specPath) ? JSON.parse(readFileSync(specPath, "utf8")) : null;
const codes = ["PF-26", "OL-26", "SR-26", "NG-26", "CM-26", "LL-26", "RS-26", "RC-26"];
const ids = ["pf", "ol", "sr", "ng", "cm", "ll", "rs", "rc"];
let reelHtml = "";

const page = (...parts) => readFileSync(join(projectRoot, "dist", ...parts, "index.html"), "utf8");
const publicFile = (url) => join(projectRoot, "public", url);
const fileName = (url) => url.split("/").pop();
const sizedName = (url) => fileName(url).replace(/\.[^.]+$/, "");
// astro escapes apostrophes and ampersands in text.
const escaped = (text) => text.replaceAll("&", "&amp;").replaceAll("'", "&#39;");
const sheet = (html) => html.match(/<section class="item-sheet"[\s\S]*?<\/section>/)?.[0] ?? "";

before(() => {
  execFileSync("npm", ["run", "build"], { cwd: projectRoot, encoding: "utf8", stdio: "pipe" });
  reelHtml = page("explore");
});

test("the explore data holds the eight v5 items in order, with codes, ids and categories", () => {
  assert.deepEqual(exploreItems.map((item) => item.code), codes);
  assert.deepEqual(exploreItems.map((item) => item.id), ids);
  assert.deepEqual(exploreItems.map((item) => item.category), [...Array(4).fill("personal"), ...Array(4).fill("school")]);
  assert.deepEqual(exploreCategories, [
    { id: "all", label: "ALL" },
    { id: "personal", label: "PERSONAL" },
    { id: "school", label: "SCHOOL" },
  ]);
  assert.deepEqual(exploreItems.filter((item) => item.device === "iphones").map((item) => item.id), ["cm", "rc"]);
  for (const item of exploreItems) {
    assert.equal(item.screens.length, 3, item.id);
    assert.equal(item.thumbs.length, 3, item.id);
    assert.equal(item.steps.length, 3, item.id);
    assert.ok([...item.screens, ...item.thumbs].every((image) => image.alt.trim().length > 0), item.id);
  }
});

test("every explore screen, thumb, cover video and poster exists under public", () => {
  for (const item of exploreItems) {
    for (const url of [...item.screens.map((s) => s.src), ...item.thumbs.map((t) => t.src), item.cover.video, item.cover.poster]) {
      assert.match(url, new RegExp(`^/images/explore/${item.id}/`), url);
      assert.ok(existsSync(publicFile(url)), url);
    }
    assert.match(item.cover.video, /\.mp4$/);
  }
});

test("personal items have no links and school items carry their links", () => {
  for (const item of exploreItems.filter((item) => item.category === "personal")) assert.deepEqual(item.links, [], item.id);
  for (const item of exploreItems.filter((item) => item.category === "school")) {
    assert.ok(item.links.length > 0, item.id);
    assert.ok(item.links.every((link) => /^https:\/\//.test(link.url) && link.label), item.id);
  }
});

test("the explore copy, files and links match the figma export verbatim", { skip: spec ? false : "no .private/explore-v5 here" }, () => {
  assert.deepEqual(spec.order, codes);
  assert.deepEqual(spec.items.map((item) => item.code), codes);
  spec.items.forEach((expected, index) => {
    const item = exploreItems[index];
    for (const key of ["code", "id", "title", "category", "meta", "tags", "line", "about", "device"]) assert.equal(item[key], expected[key], `${item.id} ${key}`);
    assert.deepEqual(item.steps.map((step) => [step.title, step.body]), expected.steps, `${item.id} steps`);
    assert.deepEqual(item.screens.map((s) => fileName(s.src)), expected.screens, `${item.id} screens`);
    assert.deepEqual(item.thumbs.map((t) => fileName(t.src)), expected.thumbs, `${item.id} thumbs`);
    assert.deepEqual(item.links, expected.links, `${item.id} links`);
    assert.equal(fileName(item.cover.video), fileName(expected.cover.video), `${item.id} video`);
    assert.equal(fileName(item.cover.poster), fileName(expected.cover.poster), `${item.id} poster`);
    assert.equal(item.cover.duration, expected.cover.duration, `${item.id} duration`);
    assert.deepEqual(item.figma, expected.figma, `${item.id} figma`);
  });
});

test("explore-sizes.json lists sized webp copies for every screen and thumb, and each copy exists", () => {
  for (const item of exploreItems) {
    for (const image of [...item.screens, ...item.thumbs]) {
      const name = sizedName(image.src);
      const widths = sizes[name];
      assert.ok(Array.isArray(widths) && widths.length > 0, name);
      assert.deepEqual(widths, [...widths].sort((a, b) => a - b), `${name} widest last`);
      for (const width of widths) assert.ok(existsSync(join(projectRoot, "public", "images", "explore", "sized", `${name}-${width}.webp`)), `${name}-${width}`);
    }
  }
});

test("explore sits in the rail between Work and About, current on the grid and the item pages", () => {
  for (const html of [reelHtml, page("explore", "cm")]) {
    const rail = html.slice(html.indexOf('aria-label="Primary navigation"'), html.indexOf("</nav>", html.indexOf('aria-label="Primary navigation"')));
    assert.deepEqual([...rail.matchAll(/class="rail-link"[^>]*>\s*([^<]+?)\s*</g)].map(([, label]) => label), ["Work", "Explore", "About", "Resume"]);
    assert.match(rail, /<a href="\/explore" class="rail-link" aria-current="page" data-astro-prefetch="viewport">\s*Explore\s*</);
  }
});

test("the reel has its eyebrow and an ALL, PERSONAL and SCHOOL filter kept in ?filter=", () => {
  assert.match(reelHtml, /<h1[^>]*class="sr-only"[^>]*>Explore<\/h1>/);
  assert.match(reelHtml, /<p class="reel-eyebrow"[^>]*>EXPLORE {2}· {2}REEL<\/p>/);
  const filter = reelHtml.match(/<div class="reel-filter"[^>]*role="group"[^>]*aria-label="Filter"[^>]*>([\s\S]*?)<\/div>/)?.[1];
  assert.ok(filter, "the filter group renders");
  const buttons = [...filter.matchAll(/<button type="button"[^>]*data-filter-button="(\w+)"[^>]*aria-pressed="(true|false)"[^>]*>(\w+)<\/button>/g)].map(([, id, pressed, label]) => [id, pressed, label]);
  assert.deepEqual(buttons, [["all", "true", "ALL"], ["personal", "false", "PERSONAL"], ["school", "false", "SCHOOL"]]);
  // the filter is read from the url before first paint, and written back with replaceState.
  assert.match(reelHtml, /new URLSearchParams\(location\.search\)\.get\("filter"\)/);
  assert.match(reelScript, /history\.replaceState/);
  assert.match(reelScript, /searchParams\.set\("filter"/);
  assert.match(reelScript, /searchParams\.delete\("filter"\)/);
  assert.match(reelScript, /setAttribute\("aria-pressed"/);
});

test("the reel lists the eight items in order as alternating rows linking to their pages", () => {
  const rows = [...reelHtml.matchAll(/<li class="reel-row"[^>]*data-category="(\w+)"[^>]*data-side="(\w+)"[^>]*>([\s\S]*?)<\/li>/g)];
  assert.equal(rows.length, 8);
  rows.forEach(([, category, side, body], index) => {
    const item = exploreItems[index];
    assert.equal(category, item.category, item.id);
    assert.equal(side, index % 2 === 0 ? "start" : "swap", item.id);
    assert.match(body, new RegExp(`<a class="reel-link" href="/explore/${item.id}"`), item.id);
    assert.match(body, new RegExp(`data-cursor="card" data-cursor-label="View ${item.title}"`), item.id);
    assert.match(body, new RegExp(`<span class="reel-code"[^>]*>${item.code}</span>`), item.id);
    assert.match(body, /<h2 class="reel-title"[^>]*>[^<]+<\/h2>/, item.id);
    const video = body.match(/<video[^>]*>/)?.[0] ?? "";
    for (const attribute of [/\bmuted\b/, /\bloop\b/, /\bplaysinline\b/, /preload="none"/]) assert.match(video, attribute, item.id);
    assert.match(video, new RegExp(`poster="${item.cover.poster}"`), item.id);
    assert.match(body, new RegExp(`<source src="${item.cover.video}" type="video/mp4"`), item.id);
  });
  // covers play only on screen, and never under reduced motion.
  assert.match(reelScript, /IntersectionObserver/);
  assert.match(reelScript, /prefers-reduced-motion/);
});

test("each explore item has its own page with title, code, meta, about, three numbered steps and the scroll hint", () => {
  for (const item of exploreItems) {
    assert.ok(existsSync(join(projectRoot, "dist", "explore", item.id, "index.html")), item.id);
    const html = page("explore", item.id);
    const body = sheet(html);
    assert.ok(body, `${item.id} sheet`);
    assert.match(body, new RegExp(`<h1 class="item-title" id="item-title"[^>]*>${item.title}</h1>`), item.id);
    assert.match(body, new RegExp(`<p class="item-code"[^>]*>${item.code}</p>`), item.id);
    assert.match(body, new RegExp(`<p class="item-meta"[^>]*>${item.meta}</p>`), item.id);
    assert.ok(body.includes(`>${escaped(item.about)}</p>`), `${item.id} about`);
    assert.deepEqual([...body.matchAll(/<span class="item-step-number"[^>]*>(\d\d)<\/span>/g)].map(([, n]) => n), ["01", "02", "03"], item.id);
    assert.deepEqual([...body.matchAll(/<h2 class="item-step-title"[^>]*>([^<]+)<\/h2>/g)].map(([, title]) => title), item.steps.map((step) => step.title), item.id);
    const thumbs = [...body.matchAll(/<picture class="item-thumb"[^>]*>\s*<source type="image\/webp" srcset="([^"]+)"/g)].map(([, srcset]) => srcset);
    assert.equal(thumbs.length, 3, item.id);
    thumbs.forEach((srcset, index) => assert.match(srcset, new RegExp(`^/images/explore/sized/${sizedName(item.thumbs[index].src)}-\\d+\\.webp \\d+w`), item.id));
    assert.match(html, /<p class="item-hint"[^>]*>SCROLL FOR THE PROJECT ↓<\/p>/, item.id);
    assert.match(html, /<p class="sr-only" aria-live="polite" data-item-status/, item.id);
  }
});

test("the item pager wraps, so PF follows RC and RC leads back to PF", () => {
  exploreItems.forEach((item, index) => {
    const html = page("explore", item.id);
    const prev = exploreItems[(index + exploreItems.length - 1) % exploreItems.length];
    const next = exploreItems[(index + 1) % exploreItems.length];
    assert.match(html, new RegExp(`<a class="item-pager-link" href="/explore/${prev.id}" rel="prev"`), item.id);
    assert.match(html, new RegExp(`<a class="item-pager-link" href="/explore/${next.id}" rel="next"`), item.id);
  });
  assert.match(page("explore", "pf"), /href="\/explore\/rc" rel="prev"/);
  assert.match(page("explore", "rc"), /href="\/explore\/pf" rel="next"/);
});

test("macbook items show their screens in the macbook frame and iphones items show three phones", () => {
  for (const item of exploreItems) {
    const html = page("explore", item.id);
    const frames = [...html.matchAll(/data-device-frame="(\w+)"/g)].map(([, frame]) => frame);
    assert.match(html, new RegExp(`<article class="explore-item" data-device="${item.device}"`), item.id);
    if (item.device === "macbook") {
      assert.deepEqual(frames, ["macbook"], item.id);
      assert.equal((html.match(/<picture class="item-screen[^"]*"[^>]*data-screen/g) ?? []).length, 3, item.id);
      assert.equal((html.match(/class="item-screen is-current"/g) ?? []).length, 1, item.id);
    } else {
      assert.deepEqual(frames, ["iphone", "iphone", "iphone"], item.id);
      assert.deepEqual([...html.matchAll(/data-phone data-pos="(\w+)"/g)].map(([, pos]) => pos), ["left", "front", "right"], item.id);
    }
  }
  assert.deepEqual(exploreItems.filter((item) => item.device === "iphones").map((item) => item.code), ["CM-26", "RC-26"]);
});

test("personal item sheets have no links; school links open in a new tab with an arrow", () => {
  for (const item of exploreItems) {
    const body = sheet(page("explore", item.id));
    if (item.category === "personal") {
      assert.doesNotMatch(body, /item-links/, item.id);
      assert.doesNotMatch(body, /target="_blank"/, item.id);
      continue;
    }
    const links = [...body.matchAll(/<a href="([^"]+)" target="_blank" rel="noopener"[^>]*>\s*([^<]+?)\s*<span aria-hidden="true"[^>]*>↗<\/span>/g)].map(([, url, label]) => ({ label, url: url.replaceAll("&amp;", "&") }));
    assert.deepEqual(links, item.links, item.id);
  }
});

test("the item page handles reduced motion and steps by arrows, keys and swipes with a live region", () => {
  assert.match(itemSource, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(itemSource, /prefers-reduced-motion: no-preference/);
  assert.match(itemScript, /"ArrowLeft"/);
  assert.match(itemScript, /"ArrowRight"/);
  assert.match(itemScript, /pointerType === "touch"/);
  assert.match(itemScript, /pointerup/);
  assert.match(itemScript, /`Screen \$\{.+\} of \$\{.+\}/);
  assert.match(itemScript, /% count/);
  assert.match(itemScript, /data-item-status/);
});

test("the old v1 explore script is gone", () => {
  assert.equal(existsSync(join(projectRoot, "src", "scripts", "explore.ts")), false);
  assert.doesNotMatch(reelSource + itemSource, /scripts\/explore\.ts/);
});

test("no em dash in the explore sources, data or built pages", () => {
  const sources = [
    ["src/pages/explore/index.astro", reelSource],
    ["src/pages/explore/[id].astro", itemSource],
    ["src/scripts/explore-reel.ts", reelScript],
    ["src/scripts/explore-item.ts", itemScript],
    ["src/data/explore.mjs", source("src", "data", "explore.mjs")],
    ["src/utils/exploreSrcset.ts", source("src", "utils", "exploreSrcset.ts")],
    ["scripts/build-explore-images.mjs", source("scripts", "build-explore-images.mjs")],
    ["dist/explore/index.html", reelHtml],
    ...exploreItems.map((item) => [`dist/explore/${item.id}/index.html`, page("explore", item.id)]),
  ];
  for (const [name, text] of sources) assert.ok(!text.includes("\u2014"), name);
});
