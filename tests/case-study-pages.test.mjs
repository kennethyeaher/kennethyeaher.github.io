import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test, { before } from "node:test";
import assert from "node:assert/strict";

import { projects } from "../src/data/portfolio.mjs";
import { contrast, hexToOklch } from "../src/utils/oklch.mjs";

const projectRoot = new URL("..", import.meta.url).pathname;
const slugs = [
  "ovara",
  "kairo-health",
  "terpcarehub",
  "college-park-capstone",
  "frontground",
  "terpcare",
  "sohive",
  "elms-redesign",
];
const pages = new Map();

before(() => {
  execFileSync("npm", ["run", "build"], {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: "pipe",
  });

  for (const slug of slugs) {
    pages.set(
      slug,
      readFileSync(join(projectRoot, "dist", "work", slug, "index.html"), "utf8"),
    );
  }
});

test("all eight approved case studies render from one route system", () => {
  assert.equal(pages.size, 8);

  for (const html of pages.values()) {
    assert.match(html, /data-case-nav/);
    assert.match(html, /data-chapter-select/);
    assert.match(html, /class="case-meta"/);
    assert.match(html, />\s*Role\s*</);
    assert.match(html, />\s*Timeline\s*</);
    assert.match(html, />\s*Team\s*</);
    assert.match(html, />\s*Skills\s*</);
    assert.match(html, /data-project-pager/);
  }
});

test("chapter links and mobile wayfinding target every project section", () => {
  for (const html of pages.values()) {
    const sectionIds = [...html.matchAll(/<section[^>]*\bdata-case-section\b[^>]*>/g)]
      .map((match) => match[0].match(/\bid="([^"]+)"/)?.[1])
      .filter(Boolean);

    assert.ok(sectionIds.length >= 3);
    for (const sectionId of sectionIds) {
      assert.match(html, new RegExp(`href="#${sectionId}"`));
      assert.match(html, new RegExp(`value="${sectionId}"`));
    }
  }
});

test("the chapter rail matches the v3 rail: same spot, no numbers, the square on the active chapter, no back link (figma 177:1801)", () => {
  for (const [slug, html] of pages) {
    const aside = html.slice(html.indexOf('<aside class="case-rail"'), html.indexOf("</aside>"));
    const chapters = [...aside.matchAll(/<a class="rail-link" href="#([^"]+)" data-section-link="\1"( aria-current="location")?[^>]*>\s*([^<]+?)\s*<\/a>/g)];
    const project = projects.find((entry) => entry.slug === slug);
    // the chapter names keep their words, and the first starts active until the scroll tracking moves it.
    assert.deepEqual(chapters.map(([, , , label]) => label), project.exhibits.map((exhibit) => exhibit.chapter), slug);
    assert.deepEqual(chapters.map(([, , current]) => Boolean(current)), chapters.map((_, index) => index === 0), slug);
    assert.match(aside, /<ol class="rail"/, slug);
    // the breadcrumb replaces both back links.
    assert.doesNotMatch(html, /class="back-link"|Back to Work|chapter-number|is-numbered/, slug);
  }
  const nav = readFileSync(join(projectRoot, "src", "components", "CaseStudyNav.astro"), "utf8");
  assert.match(nav, /\.case-rail \.rail \{\n    position: fixed;\n    z-index: 10;\n    top: 200px;\n    left: calc\(var\(--page-gutter\) - 10px\);/);
  assert.match(nav, /@media \(max-width: 980px\) \{\n    \.case-rail \{\n      display: none;/);
  assert.doesNotMatch(nav.slice(nav.indexOf("<style>")), /opacity/);
  // the scroll tracking still moves aria-current across the rail links and the select.
  const site = readFileSync(join(projectRoot, "src", "scripts", "site.ts"), "utf8");
  assert.match(site, /link\.setAttribute\("aria-current", "location"\)/);
  assert.match(site, /if \(chapterSelect\) chapterSelect\.value = sectionId;/);
});

test("public case studies keep caveats and future-improvement notes out of the reader experience", () => {
  for (const html of pages.values()) {
    const text = html
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    assert.doesNotMatch(text, /\bcaveats?\b/i);
    assert.doesNotMatch(text, /\blimitations?\b/i);
    assert.doesNotMatch(text, /\bfuture (?:work|improvements?)\b/i);
    // plural only: approved copy says an alert "resolves to a single next step", which is not a future-work note.
    assert.doesNotMatch(text, /\bnext steps\b/i);
    assert.doesNotMatch(html, /case-callout/);
  }
});

test("the renamed capstone and expanded product evidence render publicly, and the USM benchmark is gone", () => {
  assert.match(pages.get("college-park-capstone"), /User Research Capstone/);
  assert.match(pages.get("terpcare"), /What four of us built in spring 2024/);
  assert.match(pages.get("kairo-health"), /Deployment routing/);
  for (const html of pages.values()) assert.doesNotMatch(html, /usm-venture-benchmark|USM Venture Benchmark/);
});

test("previous and next project links wrap without dead ends", () => {
  const first = pages.get("college-park-capstone");
  const middle = pages.get("terpcare");
  const kairo = pages.get("kairo-health");
  const last = pages.get("elms-redesign");

  // the v2 exhibit shell (figma 61:1059) closes on a next project link only, in the home order.
  assert.match(first, /href="\/work\/sohive"/);
  assert.match(middle, /href="\/work\/frontground"/);
  assert.match(kairo, /class="next-link" href="\/work\/elms-redesign"/);
  assert.match(last, /class="next-link" href="\/work\/college-park-capstone"/);
});


test("every case study has a unique social preview and reading progress", () => {
  for (const [slug, html] of pages) {
    assert.match(html, new RegExp(`property="og:image"[^>]*content="https://kennethyeaher\\.github\\.io/images/social/${slug}\\.png"`));
    assert.match(html, /data-reading-progress/);
    assert.match(html, new RegExp(`view-transition-name: cover-${slug}`));
    const names = [...html.matchAll(/view-transition-name: ([a-z-]+)/g)].map((match) => match[1]);
    assert.equal(new Set(names).size, names.length, `duplicate transition names on ${slug}`);
    assert.doesNotMatch(html, /\bTODO\b/);
    assert.doesNotMatch(html, /autoplay/);
  }
});

test("every eagerly loaded hero image is also fetched at high priority, cropped or not", () => {
  for (const [slug, html] of pages) {
    const hero = html.slice(html.indexOf('class="hero-wrap"'), html.indexOf('class="case-meta"'));
    const eager = hero.match(/<img[^>]*loading="eager"[^>]*>/g) ?? [];
    assert.ok(eager.length > 0, `${slug} has an eager hero image`);
    for (const img of eager) assert.match(img, /fetchpriority="high"/, `${slug}: ${img.slice(0, 120)}`);
  }
});

test("every loop control joins its media tag as one pill and never sits on the device (figma 132:1838)", () => {
  let loops = 0;
  for (const [slug, html] of pages) {
    for (const [, id] of html.matchAll(/<video id="(clip-[a-z0-9-]+)"/g)) {
      loops += 1;
      const controls = [...html.matchAll(new RegExp(`<span class="media-tag has-control"[^>]*>(?:(?!</button>).)*aria-controls="${id}"`, "gs"))];
      assert.equal(controls.length, 1, `${slug}: ${id} has one control, inside its media tag`);
    }
    // nothing inside a device frame or a clip is a loop control.
    for (const device of html.matchAll(/<div class="device-frame[^"]*"(?:(?!<\/video>).)*<\/video>/gs)) assert.doesNotMatch(device[0], /data-loop-toggle/, slug);
    assert.doesNotMatch(html, /<div class="exhibit-loop"(?:(?!<\/div>).)*data-loop-toggle/s, slug);
  }
  // ten, plus sohive's rsvp and host loops, terpcare's mood and privacy loops, and terpcarehub's alert detail and find care loops.
  assert.equal(loops, 16);
});

test("reading progress matches figma 26:105, filled in the case study accent, with its empty track hidden (v3)", () => {
  for (const [slug, html] of pages) {
    const project = projects.find((entry) => entry.slug === slug);
    // the first thing in main, so it rests under the header and pins once the header scrolls away.
    const bar = html.match(/<main id="main-content">\s*<div class="reading-progress" data-reading-progress aria-hidden="true" style="--reading-accent: (#[0-9a-fA-F]{6}); --reading-accent-dark: (#[0-9a-fA-F]{6})"><span><\/span><\/div>/);
    assert.ok(bar, `${slug} opens main with the reading progress bar`);
    assert.equal(bar[1], project.cover.accent ?? project.cover.palette[1]);
    // lifted to 3:1 against the old dark track (dark --rule), so it clears the darker dark canvas it sits on too.
    assert.ok(contrast(bar[2], "#344553") >= 3, `${slug} dark fill reaches 3:1 on the dark rule`);
    assert.ok(contrast(bar[2], "#111923") >= 3, `${slug} dark fill reaches 3:1 on the dark canvas`);
    // the dark fill is the same hue, lighter, with chroma cut only where srgb runs out.
    const [lightness, chroma, hue] = hexToOklch(bar[1]);
    const [darkLightness, darkChroma, darkHue] = hexToOklch(bar[2]);
    assert.ok(darkLightness > lightness, `${slug} dark fill is lighter`);
    assert.ok(Math.abs(darkHue - hue) * (180 / Math.PI) < 2, `${slug} dark fill keeps its hue`);
    assert.ok(darkChroma > chroma * 0.9, `${slug} dark fill keeps its chroma`);
  }
  assert.match(pages.get("terpcarehub"), /--reading-accent: #E21833;/);

  const globalCss = readFileSync(join(projectRoot, "src", "styles", "global.css"), "utf8");
  // no track: only the fill shows, so the top of the page has no line under the header.
  assert.match(globalCss, /\.reading-progress \{ position: sticky; z-index: 40; top: 0; height: 3px; pointer-events: none; \}/);
  for (const [, body] of globalCss.matchAll(/\.reading-progress \{([^}]*)\}/g)) assert.doesNotMatch(body, /background/);
  // the scroll timeline only runs where motion is welcome; under reduced motion the script sets the fill directly.
  const start = globalCss.indexOf("@media (prefers-reduced-motion: no-preference)");
  const motion = globalCss.slice(start, globalCss.indexOf("@media (prefers-reduced-motion: reduce)", start));
  assert.match(motion, /@supports \(animation-timeline: scroll\(\)\) \{\s*\.reading-progress span \{ animation: reading-progress linear both; animation-timeline: scroll\(root block\); \}/);
  const script = readFileSync(join(projectRoot, "src", "scripts", "exhibits.ts"), "utf8");
  const fallback = script.slice(script.indexOf("export function initializeReadingProgress"), script.indexOf("\n}\n", script.indexOf("export function initializeReadingProgress")));
  assert.match(fallback, /const native = CSS\.supports\("animation-timeline: scroll\(\)"\);/);
  assert.match(fallback, /prefers-reduced-motion: reduce/);
  assert.match(fallback, /if \(native && !motion\.matches\)/);
  // no rule for the bar eases it, so the script's updates land as they are.
  for (const [, body] of globalCss.matchAll(/\.reading-progress[^{]*\{([^}]*)\}/g)) assert.doesNotMatch(body, /transition/);
});

test("metric labels are serif sentence case on every page, and tiles in a row share one height", () => {
  for (const [slug, html] of pages) {
    const labels = [...html.matchAll(/<div class="metric"[^>]*>\s*<dt[^>]*>([^<]+)<\/dt>/g)].map((match) => match[1]);
    assert.equal(labels.length, 3, slug);
    for (const label of labels) assert.match(label, /^[A-Z0-9]/, `${slug}: ${label}`);
  }
  const source = readFileSync(join(projectRoot, "src", "components", "exhibits", "ExhibitMetrics.astro"), "utf8");
  assert.match(source, /\.metric dt \{ color: var\(--color-muted-label\); font: 16px \/ 1\.3 var\(--body\); \}/);
  // grid items stretch to the row, and the reversed column packs the value to the top.
  assert.match(source, /\.metric \{ display: flex; flex-direction: column-reverse; justify-content: flex-end;/);
  assert.doesNotMatch(source, /align-items: (?:start|center|end)|align-self/);
});

test("device exhibits preserve captions and source dimensions", () => {
  // every page is on the exhibit layout now; device frames keep their source dimensions there.
  for (const slug of ["frontground", "terpcarehub"]) {
    const html = pages.get(slug);
    assert.match(html, /data-device-frame="browser"/);
    assert.match(html, /width="1919" height="1079"|width="3024" height="9046"/);
  }
});

test("Kairo renders the v2 exhibit layout from the approved spec", () => {
  const kairo = pages.get("kairo-health");
  for (const id of ["overview", "the-brief", "field-by-tier", "a-scans-journey", "reflection"]) {
    assert.match(kairo, new RegExp(`<section[^>]*id="${id}"[^>]*data-case-section`));
    assert.match(kairo, new RegExp(`href="#${id}"`));
  }
  assert.match(kairo, /view-transition-name: cover-kairo-health/);
  assert.match(kairo, /view-transition-name: title-kairo-health/);
  assert.match(kairo, /class="exhibit-stage stage-hero/);
  assert.match(kairo, /0\.91 vs 0\.86/);
  assert.match(kairo, /data-count-to="150"/);
  assert.match(kairo, /data-count-to="55" data-count-rest=" of 56"/);
  assert.match(kairo, /<table class="journey/);
  assert.match(kairo, /<th scope="col" class="is-accent[^"]*"/);
  // kairo, the last card, wraps round to elms, the first.
  assert.match(kairo, /href="\/work\/elms-redesign"/);
  assert.match(kairo, /The useful finding was a workflow insight, not a winner/);
  const badges = [...kairo.matchAll(/<a class="annotation-badge[^"]*" href="#([^"]+)" aria-describedby="([^"]+)"/g)];
  assert.equal(badges.length, 6);
  for (const [, href, describedBy] of badges) {
    assert.equal(href, describedBy);
    assert.match(kairo, new RegExp(`<li id="${describedBy}"`));
  }
  assert.doesNotMatch(kairo, /data-cover-video|\.mp4/);
});

/** every annotation badge links to, and is described by, a note that exists on the page. */
function assertBadgesResolve(html, count) {
  const badges = [...html.matchAll(/<a class="annotation-badge[^"]*" href="#([^"]+)" aria-describedby="([^"]+)"/g)];
  assert.equal(badges.length, count);
  for (const [, href, describedBy] of badges) {
    assert.equal(href, describedBy);
    assert.match(html, new RegExp(`<li id="${describedBy}"`));
  }
}

test("Ovara renders the v2 exhibit layout from the approved spec", () => {
  const ovara = pages.get("ovara");
  const sectionIds = [...ovara.matchAll(/<section[^>]*\bid="([^"]+)"[^>]*data-case-section/g)].map((match) => match[1]);
  assert.deepEqual(sectionIds, ["overview", "the-dashboard", "the-finding", "corrections", "design", "reflection"]);
  // 05 design has no exhibit in figma, so it shows the design section's own text.
  assert.match(ovara, /The interface has to make the uncertainty visible, not smooth it over/);
  assert.match(ovara, /The audit is the part I would defend in an interview/);
  // the hero kpi is a crop of the live dashboard, not a coded card.
  assert.match(ovara, /class="visual-sheet visual-crop"/);
  assert.doesNotMatch(ovara, /class="hero-kpi"/);
  assert.match(ovara, /<span class="browser-address"[^>]*>ovara · county level<\/span>/);
  assert.match(ovara, /data-count-to="1029"[^>]*data-count-grouped/);
  assert.match(ovara, /data-count-to="10.9" data-count-rest="M" data-count-decimals="1"/);
  // three dashboard rows, each a recorded loop over a lazy still and its own named control. no poster attribute,
  // which would load up front even with preload="none".
  assert.equal([...ovara.matchAll(/class="exhibit-row"/g)].length, 3);
  assert.doesNotMatch(ovara, /<video[^>]*\sposter=/);
  for (const name of ["search", "compare", "filter"]) {
    assert.match(ovara, new RegExp(`<img class="loop-still"[^>]*src="/images/work/ovara/ovara-atlas-${name}-loop-poster\\.webp" alt="" width="\\d+" height="\\d+" loading="lazy" decoding="async"[^>]*>\\s*<video id="clip-${name}-loop"`));
    assert.match(ovara, new RegExp(`data-src="/images/work/ovara/ovara-atlas-${name}-loop\\.mp4"`));
    assert.match(ovara, new RegExp(`data-loop-name="${name} loop"`));
    assert.match(ovara, new RegExp(`class="loop-toggle"[^>]*data-loop-toggle aria-controls="clip-${name.replace(/ /g, "-")}-loop" hidden[^>]*><span data-loop-action[^>]*>Pause</span><span class="loop-name"[^>]*> ${name} loop</span></button></span>`));
  }
  assert.doesNotMatch(ovara, /autoplay/);
  // audit cards in html, every field from the spec text.
  assert.equal([...ovara.matchAll(/<p class="audit-value"[^>]*>/g)].length, 3);
  assert.match(ovara, /<p class="audit-value"[^>]*>\+0\.33 → \+0\.12<\/p>/);
  assert.match(ovara, /<dt class="audit-heading is-guard"[^>]*>Guard<\/dt>/);
  assert.match(ovara, /That is the number I would have quoted in an interview\./);
  assert.match(ovara, /href="\/work\/terpcarehub"/);
  assertBadgesResolve(ovara, 3);
});

test("new lede sentences stay off the page until their wording is approved", () => {
  for (const project of projects) {
    const held = (project.exhibits ?? []).flatMap(({ lede }) => (lede ?? []).flat()).filter((sentence) => sentence?.newCopy);
    for (const { text } of held) assert.ok(!pages.get(project.slug).includes(text), `${project.slug} ships unapproved copy: ${text}`);
  }
  const kairo = pages.get("kairo-health");
  assert.equal([...kairo.matchAll(/class="chapter-lede"/g)].length, 5);
  assert.match(kairo, /<p class="section-eyebrow"[^>]*>OVERVIEW<\/p>/);
  assert.match(kairo, /When the scan breaks, how does extraction change\?/);
});

test("TerpCareHub renders the v2 exhibit layout from its prose mock", () => {
  const page = pages.get("terpcarehub");
  const sectionIds = [...page.matchAll(/<section[^>]*\bid="([^"]+)"[^>]*data-case-section/g)].map((match) => match[1]);
  assert.deepEqual(sectionIds, ["overview", "core-flows", "the-measure", "where-it-landed", "design-system", "booking", "reflection"]);
  assert.match(page, /What I would test first/);
  // two iphone rows in core flows, each a cropped screen loop with its own named control, and booking's programs row; the find care loop is gone.
  assert.equal([...page.matchAll(/class="exhibit-row"/g)].length, 3);
  assert.doesNotMatch(page, /terpcarehub-find-care-loop/);
  for (const [clip, name] of [["alert", "alert"], ["dashboard", "own items"]]) {
    assert.match(page, new RegExp(`data-src="/images/work/terpcarehub/terpcarehub-${clip}-loop\\.mp4"`));
    assert.match(page, new RegExp(`class="loop-toggle"[^>]*data-loop-toggle aria-controls="clip-${name.replace(/ /g, "-")}-loop" hidden[^>]*><span data-loop-action[^>]*>Pause</span><span class="loop-name"[^>]*> ${name} loop</span></button></span>`));
  }
  // a veil on each row stage, the overview laptop, and each walkthrough's pinned stage and three narrow-screen stages.
  assert.equal([...page.matchAll(/class="stage-veil"/g)].length, 12);
  // booking (221:340): provider detail, confirmed and cancel, pinned, then the programs row.
  const booking = page.slice(page.indexOf('id="booking"'), page.indexOf('id="reflection"'));
  assert.deepEqual(texts(booking, "walk-title"), ["Plan and cost above the slots", "Booked, with the next two actions", "Cancel says where the time goes"]);
  assert.ok(booking.indexOf("data-walkthrough") < booking.indexOf('class="exhibit-row"'), "the walkthrough comes before the programs row");
  assert.match(booking, /Verified and pending review are labelled/);
  // the minute 22 timeline is html over an svg rail.
  assert.match(page, /<ol class="timeline-steps"/);
  assert.equal([...page.matchAll(/<li[^>]*class="is-marked"[^>]*>/g)].length, 1);
  assert.match(page, /<svg class="timeline-rail"[^>]*aria-hidden="true"/);
  assert.match(page, /Minute 22 · 11:24 PM/);
  // where it landed plays the alert detail and find care loops (tests/terpcare-loops.test.mjs); the provider card is gone.
  assert.doesNotMatch(page, /annotation-leader/);
  assert.doesNotMatch(page, /class="exhibit-pair"/);
  const landed = page.slice(page.indexOf('id="where-it-landed"'), page.indexOf('id="design-system"'));
  assert.equal([...landed.matchAll(/<figure class="loop-exhibit"/g)].length, 2);
  assert.doesNotMatch(landed, /class="annotation-badge"|data-pin/);
  // four interface states, each with its name and line.
  assert.equal([...page.matchAll(/<p class="state-name"/g)].length, 4);
  assert.match(page, /interface-state-degraded\.png/);
  assert.match(page, /href="\/work\/terpcare"/);
});

/** the visible text of an html fragment, tags dropped and whitespace collapsed. */
function textOf(html) {
  return html.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** the inner text of every element carrying one class, in page order. */
function texts(html, className) {
  return [...html.matchAll(new RegExp(`<(\\w+) class="${className}"[^>]*>([\\s\\S]*?)</\\1>`, "g"))].map((match) => textOf(match[2]));
}

test("TerpCareHub's overview laptop scrolls the full home page on hover or focus", () => {
  const page = pages.get("terpcarehub");
  const overview = page.slice(page.indexOf('id="overview"'), page.indexOf('id="core-flows"'));
  const laptop = overview.slice(overview.indexOf('class="exhibit-scroller"'));
  assert.ok(laptop.length > 0, "the laptop renders in the overview");
  // one wording per input: hover where a pointer can hover, tap on touch screens (any-hover: none).
  assert.match(laptop, /<span class="tag-pointer"[^>]*>HOVER · SCROLLS<\/span><span class="tag-touch"[^>]*>TAP · SCROLLS<\/span>/);
  const tag = readFileSync(join(projectRoot, "src", "components", "exhibits", "MediaTag.astro"), "utf8");
  assert.match(tag, /\.tag-touch \{ display: none; \}\s*@media \(any-hover: none\) \{\s*\.tag-pointer \{ display: none; \}\s*\.tag-touch \{ display: inline; \}/);
  assert.match(laptop, /<span class="browser-address"[^>]*>terpcarehub · home<\/span>/);
  assert.match(laptop, /<img class="scroller-page" src="\/images\/work\/terpcarehub\/home-full\.webp"/);
  // keyboard focus reaches the frame, which is described by its caption.
  assert.match(laptop, /<div class="scroller-focus" tabindex="0" role="img" aria-label="[^"]+" aria-describedby="overview-scroller-caption"/);
  assert.deepEqual([texts(laptop, "caption-title")[0], texts(laptop, "caption-body")[0]], ["Home, desktop", "The redesigned hero states the promise in the university’s own colours, using the product’s real interface language behind it."]);
  // the widest copy a browser is offered (the 1920 one; the 3024 export is only the fallback) stays under 400 KB.
  assert.ok(statSync(join(projectRoot, "public/images/exhibits/sized/home-full-1920.webp")).size < 400 * 1024, "the widest home page copy stays under 400 KB");
});

test("TerpCareHub's core flows open with a scroll walkthrough beside a pinned phone", () => {
  const page = pages.get("terpcarehub");
  const flows = page.slice(page.indexOf('id="core-flows"'), page.indexOf('id="the-measure"'));
  const walkthrough = flows.slice(flows.indexOf("data-walkthrough"), flows.indexOf('class="exhibit-rows"'));
  assert.ok(flows.indexOf("data-walkthrough") < flows.indexOf('class="exhibit-row"'), "the walkthrough is the first row after the lede");
  assert.match(walkthrough, /SCROLL · PHONE PINNED/);
  assert.deepEqual(texts(walkthrough, "walk-label"), ["STEP 1", "STEP 2", "STEP 3"]);
  assert.deepEqual(texts(walkthrough, "walk-title"), ["Filters are preset", "Cost is visible before the click", "Sign in only to book"]);
  assert.deepEqual(texts(walkthrough, "walk-body"), [
    "Open now and Takes my plan start switched on, and the list is sorted by soonest appointment.",
    "Plan acceptance and expected cost sit on the card itself.",
    "Browsing, filtering and deciding stay open so an urgent decision never hits a login wall.",
  ]);
  // one pinned screen per step, the first shown until a script moves the active step.
  const screens = [...walkthrough.matchAll(/<div class="walk-screen( is-active)?" data-walk-screen="(\d)"( aria-hidden="true")?/g)];
  assert.deepEqual(screens.map((match) => [match[2], Boolean(match[1]), Boolean(match[3])]), [["0", true, false], ["1", false, true], ["2", false, true]]);
  assert.match(walkthrough, /mobile-sign-in-to-book\.png/);
  assert.equal([...walkthrough.matchAll(/class="annotation annotation-focus on-light"/g)].length, 2, "step 2 outlines the plan and cost row, pinned and stacked");
});

test("every iphone draws apple's home indicator, and a fitted screen shows the whole capture on its own colour", () => {
  const frame = readFileSync(join(projectRoot, "src", "components", "DeviceFrame.astro"), "utf8");
  // 134 by 5 pt, 8 pt above the screen's foot, on a 300 wide frame with a 282 by 602 screen (figma Device/iPhone).
  assert.match(frame, /\.iphone-home \{[^}]*bottom: 4\.75cqw; left: 50%; width: 29\.29cqw; height: 1\.093cqw;[^}]*border-radius: 0\.5465cqw; background: #000; opacity: 0\.55; \}/);
  assert.match(frame, /\.device-screen\.is-contain img[^{]*\{ object-fit: contain; object-position: center; \}/);
  const walk = readFileSync(join(projectRoot, "src", "components", "exhibits", "ExhibitWalkthrough.astro"), "utf8");
  assert.match(walk, /\.walk-capture\.is-contain \{[^}]*height: 100%;[^}]*\}/);
  // terpcare's hero home is fitted on white; terpcarehub's find care is fitted in the hero, the walkthrough and the pins phone.
  const terpcare = pages.get("terpcare");
  assert.match(terpcare, /<div class="device-screen is-contain" style="background: #ffffff"[^>]*>\s*<picture[^>]*>\s*<source type="image\/webp" srcset="\/images\/exhibits\/sized\/terpcare-redesign-home-/);
  assert.match(terpcare, /<div class="walk-capture is-contain" style="background: #ffffff"[^>]*>\s*<picture[^>]*>\s*<source type="image\/webp" srcset="\/images\/exhibits\/sized\/terpcare-book-in-person-or-virtual-/);
  // sohive's fitted phones on black were the rsvp and host stages, which now play as wide loops.
  assert.doesNotMatch(pages.get("sohive"), /<div class="device-screen is-contain"/);
  const hub = pages.get("terpcarehub");
  assert.match(hub, /<div class="device-screen is-contain" style="background: #ffffff"[^>]*>\s*<picture[^>]*>\s*<source type="image\/webp" srcset="\/images\/exhibits\/sized\/mobile-find-care-/);
  assert.equal([...hub.matchAll(/<div class="walk-capture is-contain" style="background: #ffffff"[^>]*>\s*<picture[^>]*>\s*<source type="image\/webp" srcset="\/images\/exhibits\/sized\/mobile-find-care-/g)].length, 4, "steps 1 and 2, stacked and pinned");
  assert.doesNotMatch(hub, /class="walk-capture" style="aspect-ratio/);
  // step 2's box is the same plan and cost row, as a share of the phone-height capture.
  assert.equal([...hub.matchAll(/class="annotation annotation-focus on-light"[^>]*style="left: 8\.7%; top: 48\.6%; width: 82\.6%; height: 8\.6%;/g)].length, 2);
});

test("on phones the walkthrough draws each step's phone 256 wide and whole, as figma 32:393 does", () => {
  const source = readFileSync(join(projectRoot, "src", "components", "exhibits", "ExhibitWalkthrough.astro"), "utf8");
  const phone = source.slice(source.indexOf("@media (max-width: 767px)"));
  assert.match(phone, /\.walk-static :global\(\.exhibit-stage\) \{ aspect-ratio: auto; padding: 28px 0; \}/);
  assert.match(phone, /\.walk-static \.walk-phone \{ position: relative;[^}]*width: min\(256px, 76\.5%\);/);
  // the phone's screens are fetched for its phone width, not for 42% of the stage.
  assert.match(pages.get("terpcarehub"), /sizes="\(max-width: 767px\) min\(256px, calc\(\(100vw - 40px\) \* 0\.76\)\), /);
});

test("timeline and visit quotes sit outside their sideways scroll, so they wrap on a phone", () => {
  for (const [slug, kind] of [["terpcarehub", "timeline"], ["frontground", "visit"]]) {
    const page = pages.get(slug);
    const quote = page.indexOf(`<blockquote class="${kind}-quote"`);
    assert.ok(quote > 0, `${slug} renders its ${kind} quote`);
    // the canvas, the scroll region and its edge fade wrapper all close before the quote opens.
    assert.match(page.slice(page.indexOf(`class="${kind}-scroll`), quote), /<\/div>\s*<\/div>\s*<\/div>\s*$/);
  }
});

test("every sideways scrolling card fades at its right edge while there is more, scroll-driven and out of flow", () => {
  const css = readFileSync(join(projectRoot, "src", "styles", "global.css"), "utf8");
  assert.match(css, /\.edge-fade \{ position: relative; min-width: 0; max-width: 100%; timeline-scope: --edge; \}/);
  assert.match(css, /\.edge-fade::after \{ position: absolute;[^}]*opacity: 0; pointer-events: none; \}/);
  // only where scroll-driven animation exists; elsewhere the fade stays at 0.
  assert.match(css, /@supports \(animation-timeline: scroll\(\)\) and \(timeline-scope: --edge\) \{\s*\.edge-fade > \.edge-scroll \{ scroll-timeline: --edge inline; \}\s*\.edge-fade::after \{ animation: edge-fade linear both; animation-timeline: --edge; \}\s*@keyframes edge-fade \{ 0%, 92% \{ opacity: 1; \} 100% \{ opacity: 0; \} \}/);
  for (const [slug, kind] of [["college-park-capstone", "heatmap"], ["college-park-capstone", "journey"], ["terpcare", "journey"], ["terpcarehub", "timeline"], ["frontground", "visit"]]) {
    assert.match(pages.get(slug), new RegExp(`<div class="edge-fade"[^>]*>\\s*<div class="${kind}-scroll edge-scroll"`), `${slug} wraps its ${kind}`);
  }
});

test("a tap plays the laptop scroll, since touch screens have no hover", () => {
  const scroller = readFileSync(join(projectRoot, "src", "components", "exhibits", "ExhibitScroller.astro"), "utf8");
  assert.match(scroller, /\.scroller-focus:is\(:hover, :focus, \.is-playing\) \.scroller-page \{ animation: page-scroll/);
  const script = readFileSync(join(projectRoot, "src", "scripts", "exhibits.ts"), "utf8");
  const tap = script.slice(script.indexOf("export function initializeScrollers"));
  assert.match(tap, /addEventListener\("click"[\s\S]*classList\.add\("is-playing"\)/);
  assert.match(tap, /animation\.currentTime = 0;/);
});

test("TerpCareHub's walkthrough steps, pin notes and pins never dim by opacity", () => {
  const page = pages.get("terpcarehub");
  // every stylesheet the page loads and every style block it inlines.
  const css = [
    ...[...page.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((match) => readFileSync(join(projectRoot, "dist", match[1]), "utf8")),
    ...[...page.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((match) => match[1]),
  ].join("\n");
  // a selector that names a step, a note or a pin; the phone's own screen layers may still crossfade.
  const target = /\.walk-(?:step|text|label|title|body)(?![\w-])|\.pin(?:-note)?(?![\w-])|\.note-(?:label|title|body)(?![\w-])|\[data-(?:pin|note)(?:[=\]])/;
  const screenLayer = /\.walk-(?:screen|capture|static|pin|phone)(?![\w-])[^\s>+~]*$/;
  let checked = 0;
  for (const [, selectors, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const pieces = selectors.split(",").map((piece) => piece.trim()).filter((piece) => target.test(piece) && !screenLayer.test(piece));
    if (!pieces.length) continue;
    checked += 1;
    for (const [, value] of body.matchAll(/(?:^|;)\s*opacity\s*:\s*([^;!}]+)/g)) {
      const number = value.trim().endsWith("%") ? parseFloat(value) / 100 : parseFloat(value);
      assert.ok(!(number < 1), `${pieces.join(", ")} sets opacity ${value.trim()}`);
    }
  }
  assert.ok(checked > 10, "the walkthrough and pin rules were found");
  // no inline opacity on the elements themselves either.
  for (const [tag] of page.matchAll(/<(?:li|div|p|span|button)[^>]*class="(?:walk-step|walk-text|walk-label|walk-title|walk-body|pin|pin-note|note-label|note-title|note-body)[ "][^>]*>/g)) {
    assert.doesNotMatch(tag, /style="[^"]*opacity/, tag);
  }
});

test("the Capstone renders the v2 exhibit layout from its prose mock", () => {
  const page = pages.get("college-park-capstone");
  const sectionIds = [...page.matchAll(/<section[^>]*\bid="([^"]+)"[^>]*data-case-section/g)].map((match) => match[1]);
  assert.deepEqual(sectionIds, ["overview", "the-survey", "the-persona", "three-journeys", "evidence"]);
  assert.match(page, /What this research supports, and what it does not/);
  // the heatmap is two real tables from the spec numbers, shaded by share.
  assert.equal([...page.matchAll(/<table class="heatmap"/g)].length, 2);
  assert.match(page, /<th scope="col"[^>]*>[\s\S]*?Students[\s\S]*?N = 23/);
  assert.match(page, /<td[^>]*style="background: #3c82b1; color: #05101a"[^>]*>20 of 23<\/td>/);
  assert.match(page, /<td class="is-empty"[^>]*>n\/a<\/td>/);
  // native annotations sit on the row or column they name, and that header is described by its note.
  assert.match(page, /<th scope="row" aria-describedby="the-survey-note-01"[^>]*>\s*Social media/);
  assert.match(page, /<th scope="row" aria-describedby="the-survey-note-02"[^>]*>\s*None/);
  assert.match(page, /<th scope="col" aria-describedby="the-survey-note-03"[^>]*>\s*<span class="heatmap-col"[^>]*>Residents/);
  for (const n of ["01", "02", "03"]) assert.match(page, new RegExp(`<li id="the-survey-note-${n}"`));
  // the persona keeps linked badges; the journey grid closes on tyler's map.
  assertBadgesResolve(page, 3);
  assert.match(page, /TYLER’S JOURNEY MAP  ·  FOUR STAGES, NO PLANNING, NO ARRIVAL/);
  assert.match(page, /journey-tyler\.png/);
  assert.match(page, /href="\/work\/sohive"/);
});

test("Frontground renders the v2 exhibit layout from its prose mock", () => {
  const page = pages.get("frontground");
  const sectionIds = [...page.matchAll(/<section[^>]*\bid="([^"]+)"[^>]*data-case-section/g)].map((match) => match[1]);
  assert.deepEqual(sectionIds, ["overview", "the-problem", "the-solution", "the-system", "offline", "triage", "where-it-stands"]);
  assert.match(page, /Three columns, three questions/);
  assert.match(page, /What the venture taught me and what I still owe it/);
  // the core flows chapter is gone, so no rows, no row tags, and none of its admin still or doctor and nurse loops.
  assert.doesNotMatch(page, /class="exhibit-rows/);
  assert.doesNotMatch(page, /class="row-tag"/);
  assert.doesNotMatch(page, /frontground-admin/);
  assert.doesNotMatch(page, /frontground-(doctor|nurse)-loop/);
  // the six stage visit graphic: html words over an svg rail, two legend categories.
  assert.equal([...page.matchAll(/<li class="is-(care|time)"[^>]*>\s*<span class="stage-num"/g)].length, 6);
  assert.equal([...page.matchAll(/<li class="is-time"[^>]*>\s*<span class="stage-num"/g)].length, 2);
  assert.match(page, /<svg class="visit-rail"[^>]*aria-hidden="true"/);
  assert.match(page, /Refiling is the one that matters most and gets the least attention\./);
  // the solution: four leaders on the stage, two pointing in from the left, and the caption under it. offline adds
  // two from the left, triage two from the left and one vertical.
  assert.equal([...page.matchAll(/class="annotation annotation-leader is-left/g)].length, 6);
  assert.equal([...page.matchAll(/class="annotation annotation-leader is-vertical/g)].length, 2);
  assert.match(page, /What the interviews put on the first screen/);
  // the proposed stages close on full width recorded loops after their caption instead of rows; no chapter has rows.
  for (const [id, next] of [["offline", "triage"], ["triage", "where-it-stands"]]) {
    const chapter = page.slice(page.indexOf(`id="${id}"`), page.indexOf(`id="${next}"`));
    assert.ok(chapter.indexOf('class="stage-caption"') < chapter.indexOf('class="exhibit-loops'), `${id} loops follow the caption`);
    assert.doesNotMatch(chapter, /class="exhibit-rows/, `${id} has no rows`);
  }
  assert.equal([...page.matchAll(/class="exhibit-row"/g)].length, 0);
  assert.match(page, /href="\/work\/kairo-health"/);
});

test("Frontground's offline chapter pairs two laptop loops and triage features one with its steps (figma 325:506, 325:545)", () => {
  const page = pages.get("frontground");
  const chapters = {
    offline: page.slice(page.indexOf('id="offline"'), page.indexOf('id="triage"')),
    triage: page.slice(page.indexOf('id="triage"'), page.indexOf('id="where-it-stands"')),
  };
  const expected = {
    offline: [
      ["sync", 856, "LOOP 01", "LOOP · 16s", "One record, from failure to retry", "The pill counts what is waiting, the queue sends oldest first, and a record the server rejects says why instead of failing quietly."],
      ["duplicate", 856, "LOOP 02", "LOOP · 12s", "A possible duplicate, before save", "Any phone format is accepted and shown back in one form. A match on name, date of birth and phone stops a second record."],
    ],
    triage: [
      ["triage", 800, "LOOP 03", "LOOP · 18s", "From intake to the doctor’s queue", "The level is suggested from the signs and vitals and the nurse confirms it. The summary travels with the patient, so the doctor reads it instead of asking again."],
    ],
  };
  // the layouts are the shared ones the specimens use too (global.css .exhibit-layout).
  assert.match(chapters.offline, /<div class="exhibit-loops exhibit-layout is-pair"/);
  assert.match(chapters.triage, /<div class="exhibit-loops exhibit-layout is-feature"/);
  for (const [id, loops] of Object.entries(expected)) {
    const chapter = chapters[id];
    const items = [...chapter.matchAll(/<figure class="loop-exhibit"[^>]*>[\s\S]*?<\/figure>/g)].map((match) => match[0]);
    assert.equal(items.length, loops.length, `${id} loop exhibits`);
    for (const [index, [name, height, num, tag, title, body]] of loops.entries()) {
      const item = items[index];
      // a rounded card the clip fills: the laptop and the field are in the video, so no frame and no stage field.
      assert.match(item, /<div class="loop-card"/);
      assert.doesNotMatch(item, /data-device-frame|class="exhibit-stage|stage-field/);
      assert.match(item, new RegExp(`<img class="loop-still"[^>]*src="/images/work/frontground/frontground-${name}-loop-poster\\.webp" alt="" width="1280" height="${height}" loading="lazy" decoding="async"[^>]*>\\s*<video id="clip-${name}-loop" muted loop playsinline preload="none" width="1280" height="${height}" aria-label="([^"]{20,})"`));
      assert.match(item, new RegExp(`data-src="/images/work/frontground/frontground-${name}-loop\\.mp4"`));
      assert.match(item, new RegExp(`aria-controls="clip-${name}-loop"`));
      assert.match(item, new RegExp(`<span class="media-tag has-control"[^>]*>(?:(?!</button>).)*${tag}`, "s"));
      assert.match(item, new RegExp(`<p class="loop-num"[^>]*>${num}</p>`));
      assert.match(item, new RegExp(`${title}[\\s\\S]*${body.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    }
  }
  // the duplicate body ends at the second record, as in figma.
  assert.doesNotMatch(chapters.offline, /opening the existing one is the default/);
  // triage's steps read as an ordered list, each a two digit number and the step.
  const steps = chapters.triage.match(/<ol class="loop-steps"[^>]*>([\s\S]*?)<\/ol>/);
  assert.ok(steps, "triage has an ordered list of steps");
  assert.deepEqual([...steps[1].matchAll(/<li[^>]*>\s*<span class="step-num"[^>]*>(\d\d)<\/span>\s*<span class="step-text"[^>]*>([^<]+)<\/span>\s*<\/li>/g)].map(([, n, text]) => [n, text]),
    [["01", "Intake"], ["02", "Assessment, level suggested"], ["03", "Hand-off with a note"], ["04", "Arrives in the doctor’s queue"], ["05", "Back to the queue, sorted by level"]]);
  // the greyscale specimen draws its queue live, so triage-queue is gone with the rest.
  for (const old of ["sync-failed", "offline-queue", "duplicate-check", "triage-handoff", "triage-queue", "vitals-trend"]) {
    assert.doesNotMatch(page, new RegExp(`frontground-${old}`), `${old} is still referenced`);
  }
});

test("sohive's rsvp outcomes and host side each play one wide loop card in place of the four phone stage", () => {
  const page = pages.get("sohive");
  for (const [id, next, name] of [["rsvp-outcomes", "host-side", "rsvp"], ["host-side", "reflection", "host"]]) {
    const chapter = page.slice(page.indexOf(`id="${id}"`), page.indexOf(`id="${next}"`));
    const specimen = chapter.indexOf("data-specimen=");
    const exhibit = specimen < 0 ? chapter : chapter.slice(0, specimen);
    assert.match(exhibit, /<div class="exhibit-loops is-wide"/, id);
    // the phones and the colour field are in the clip: no stage, no device frame, no focus boxes or badges.
    assert.doesNotMatch(exhibit, /class="exhibit-stage|data-device-frame|annotation-focus|annotation-badge|stage-field/, id);
    const items = [...exhibit.matchAll(/<figure class="loop-exhibit"[^>]*>[\s\S]*?<\/figure>/g)].map((match) => match[0]);
    assert.equal(items.length, 1, `${id} plays one loop`);
    const [item] = items;
    assert.match(item, /<div class="loop-card"[^>]*style="--loop-base: #000000; aspect-ratio: 1280 \/ 712"/);
    assert.match(item, new RegExp(`<img class="loop-still"[^>]*src="/images/work/sohive/sohive-${name}-loop-poster\\.webp" alt="" width="1280" height="712" loading="lazy" decoding="async"[^>]*>\\s*<video id="clip-${name}-loop" muted loop playsinline preload="none" width="1280" height="712" aria-label="sohive recording on four phones: `));
    assert.match(item, new RegExp(`data-src="/images/work/sohive/sohive-${name}-loop\\.mp4"`));
    assert.match(item, new RegExp(`<span class="media-tag has-control"[^>]*>(?:(?!</button>).)*LOOP · 18s(?:(?!</button>).)*aria-controls="clip-${name}-loop"`, "s"));
    // a wide card has no caption of its own: the chapter's lede and notes say what it plays.
    assert.doesNotMatch(item, /<figcaption/);
    // the loop stands where the stage stood: after the lede, before the notes.
    assert.ok(chapter.indexOf('class="chapter-lede') < chapter.indexOf('class="exhibit-loops') && chapter.indexOf('class="exhibit-loops') < chapter.indexOf('class="exhibit-notes'), `${id} order`);
  }
  // the rsvp chapter keeps its specimen after the notes.
  const rsvp = page.slice(page.indexOf('id="rsvp-outcomes"'), page.indexOf('id="host-side"'));
  assert.ok(rsvp.indexOf('class="exhibit-notes') < rsvp.indexOf('data-specimen="sohive-rsvp"'));
  for (const old of ["rsvp-confirmed", "rsvp-waitlisted", "event-changed", "waitlist-spot-opened", "host-preview", "host-door-checkin", "host-message", "host-after-event"]) {
    assert.doesNotMatch(page, new RegExp(`sohive-${old}`), `${old} is still referenced`);
  }
});

/** the css inside one at-rule block of some css, such as "@media (max-width: 640px)"; every match, joined. */
function blocksOf(css, at) {
  const found = [];
  for (let start = css.indexOf(at); start >= 0; start = css.indexOf(at, start + 1)) {
    let depth = 0;
    let end = css.indexOf("{", start);
    const open = end;
    for (; end < css.length; end += 1) {
      if (css[end] === "{") depth += 1;
      if (css[end] === "}" && --depth === 0) break;
    }
    found.push(css.slice(open + 1, end));
  }
  return found.join("\n");
}

/** the css of a component's style blocks. */
const componentCss = (name) => [...readFileSync(join(projectRoot, "src", "components", "exhibits", `${name}.astro`), "utf8").matchAll(/<style>([\s\S]*?)<\/style>/g)].map(([, css]) => css).join("\n");

test("every loop card's media tag sits in its bottom left corner, 16px in, and under the card on phones", () => {
  for (const [slug, html] of pages) {
    for (const [item] of html.matchAll(/<figure class="loop-exhibit"[^>]*>[\s\S]*?<\/figure>/g)) {
      // a still waiting for its recording (elms) has no clip and no control; it keeps the card and tag places.
      if (item.includes('class="loop-still-card"')) {
        assert.doesNotMatch(item, /data-loop-toggle|LOOP ·/, slug);
        continue;
      }
      // the tag follows the card rather than sitting inside it, so on phones it can drop below the device. an html
      // loop (elms's core flow cards) closes its frame and layers where a clip closes its video, and takes the same control.
      const media = item.includes("data-motion-loop") ? /<div class="motion-loop"[\s\S]*<\/div>\s*<\/div>\s*<\/div>/.source : /[\s\S]*?<\/video>\s*<\/div>\s*<\/div>/.source;
      assert.match(item, new RegExp(`<div class="loop-card"[^>]*>\\s*<div class="exhibit-loop"[^>]*>\\s*${media}\\s*<span class="loop-tag"`), slug);
      const id = item.match(/<(?:video|div class="motion-loop") id="([^"]+)"/)?.[1];
      assert.ok(id && item.includes(`aria-controls="${id}"`), `${slug} control names its loop`);
    }
  }
  const css = componentCss("ExhibitLoops");
  assert.match(css, /\.loop-tag \{[^}]*position: absolute;[^}]*bottom: 16px; left: 16px;/);
  const phone = blocksOf(css, "@media (max-width: 640px)");
  assert.match(phone, /\.loop-tag \{[^}]*position: static;/);
  assert.match(phone, /\.loop-tag \{[^}]*justify-self: start;/);
  // a wide card is the stage's full width, at the clip's own ratio.
  assert.match(css, /\.exhibit-loops\.is-wide \{[^}]*margin-top: 0;/);
});

test("below 640px every leader shows only its numbered dot, and a numbered legend under its stage carries the labels", () => {
  let stages = 0;
  for (const project of projects.filter((entry) => slugs.includes(entry.slug))) {
    const html = pages.get(project.slug);
    for (const exhibit of project.exhibits) {
      // a stage's leaders, or each stage of a pair's.
      const groups = exhibit.stages ? exhibit.stages.map((stage) => stage.annotations ?? []) : [exhibit.annotations ?? []];
      const start = html.indexOf(`<section id="${exhibit.id}"`);
      const end = html.indexOf("data-case-section", html.indexOf(">", start));
      const chapter = html.slice(start, end < 0 ? undefined : end);
      const legends = [...chapter.matchAll(/<ol class="leader-legend"[^>]*>([\s\S]*?)<\/ol>/g)];
      const expected = groups.map((annotations) => annotations.filter((annotation) => annotation.on === undefined && annotation.type?.startsWith("leader"))
        .sort((a, b) => Number(a.num) - Number(b.num)).map(({ num, label }) => [num, label])).filter((leaders) => leaders.length > 0);
      assert.equal(legends.length, expected.length, `${project.slug} ${exhibit.id} legends`);
      for (const [index, [whole, items]] of legends.map((match) => [match[0], match[1]]).entries()) {
        // a copy of the labels the leaders already carry, so assistive tech hears them once.
        assert.match(whole, /<ol class="leader-legend"[^>]*aria-hidden="true"/);
        const rows = [...items.matchAll(/<li[^>]*>\s*<span class="legend-num"[^>]*>(\d\d)<\/span>\s*<span class="legend-text"[^>]*>([^<]+)<\/span>\s*<\/li>/g)].map(([, num, text]) => [num, text.replace(/&#39;/g, "'")]);
        assert.deepEqual(rows, expected[index], `${project.slug} ${exhibit.id} legend ${index}`);
        stages += 1;
      }
      // directly under its stage: after the stage's last leader, before any notes or caption.
      for (const match of chapter.matchAll(/<ol class="leader-legend"/g)) {
        const before = chapter.slice(0, match.index);
        assert.ok(before.lastIndexOf("annotation-leader") > before.lastIndexOf("exhibit-caption") , `${project.slug} ${exhibit.id} legend follows its leaders`);
        assert.doesNotMatch(chapter.slice(match.index, chapter.indexOf("</ol>", match.index)), /exhibit-caption|note-title/);
      }
    }
  }
  // frontground's solution, offline and triage, sohive's two feed stages, and elms's round one and core flow.
  assert.equal(stages, 7);

  const leader = componentCss("AnnotationLeader");
  const phone = blocksOf(leader, "@media (max-width: 640px)");
  assert.match(phone, /\.leader-line \{[^}]*display: none;/);
  // the label's text stays in the accessibility tree, only unseen; the number becomes the dot on the anchor.
  assert.match(phone, /\.leader-text \{[^}]*color: transparent;/);
  assert.match(phone, /\.leader-dot \{[^}]*position: absolute;[^}]*border-radius: 50%;/);
  assert.match(readFileSync(join(projectRoot, "src", "components", "exhibits", "AnnotationLeader.astro"), "utf8"), /<span class="leader-dot" aria-hidden="true">\{num\}<\/span>/);
  assert.match(phone, /\.leader-anchor \{[^}]*visibility: hidden;/);
  assert.doesNotMatch(phone, /\.leader-text \{[^}]*(display: none|visibility: hidden)/);
  const legend = componentCss("LeaderLegend");
  assert.match(legend, /\.leader-legend \{[^}]*display: none;/);
  assert.match(blocksOf(legend, "@media (max-width: 640px)"), /\.leader-legend \{[^}]*display: grid;/);
  assert.match(legend, /\.legend-num \{[^}]*color: var\(--color-annotate\);[^}]*var\(--mono\)/);
});

test("TerpCare renders the v2 exhibit layout from its prose mock", () => {
  const page = pages.get("terpcare");
  const sectionIds = [...page.matchAll(/<section[^>]*\bid="([^"]+)"[^>]*data-case-section/g)].map((match) => match[1]);
  assert.deepEqual(sectionIds, ["overview", "what-changed", "the-original", "get-support-now", "book", "mood-check-in", "privacy", "reflection"]);
  assert.match(page, /University of Maryland · Product Design · 2024, redesigned 2026/);
  assert.match(page, /What the redesign taught me about the original/);
  assert.doesNotMatch(page, /<table class="matrix"/);
  // what changed reuses the five destinations grid: five tabs, no accent stage, closed by its label and note.
  assert.equal([...page.matchAll(/<th scope="col"[^>]*>\s*<span class="journey-number"/g)].length, 5);
  assert.doesNotMatch(page, /<th scope="col" class="is-accent"[^>]*>\s*<span class="journey-number"/);
  assert.match(page, /FIVE TABS  ·  HOME, BOOK, BOARD, MOOD, PROFILE/);
  // phones: three in the hero, four on the original's stage, two support rows, the two dark rows, and the book
  // walkthrough's four stacked steps plus its pinned phone; mood check-in and privacy play wide loops.
  assert.equal([...page.matchAll(/data-device-frame="iphone"/g)].length, 3 + 4 + 2 + 2 + 5);
  // the original boxes four regions, every badge resolving to its note.
  assertBadgesResolve(page, 4);
  const book = page.slice(page.indexOf('id="book"'), page.indexOf('id="mood-check-in"'));
  assert.deepEqual(texts(book, "walk-label"), ["STEP 1", "STEP 2", "STEP 3", "STEP 4"]);
  assert.doesNotMatch(book, /class="exhibit-row"/);
  const mood = page.slice(page.indexOf('id="mood-check-in"'), page.indexOf('id="privacy"'));
  assert.ok(mood.indexOf('class="exhibit-loops') < mood.indexOf('class="exhibit-rows'), "the dark mode row follows the loop");
  assert.doesNotMatch(mood.slice(0, mood.indexOf('class="exhibit-rows')), /class="exhibit-notes"/);
  assert.match(mood, /Dark mode from the same tokens/);
  // dark mode runs as two zigzag rows under the loop (figma 64:795): row 1 sets its stage then its caption, row 2
  // flips to caption then stage, and the specimen follows. no lead block sits above them.
  const rows = mood.slice(mood.indexOf('class="exhibit-rows'), mood.indexOf('data-specimen="terpcare-mood"'));
  assert.ok(mood.indexOf('data-specimen="terpcare-mood"') > mood.indexOf('class="exhibit-rows'), "the specimen follows the rows");
  assert.match(rows, /^class="exhibit-rows[^"]*\bis-zigzag\b/);
  assert.doesNotMatch(mood, /class="rows-lead"/);
  const darkRows = rows.split(/<div class="exhibit-row\b/).slice(1);
  assert.equal(darkRows.length, 2);
  const order = (row) => [row.indexOf('class="exhibit-stage'), row.indexOf('class="row-caption')];
  const [stage1, caption1] = order(darkRows[0]);
  assert.ok(stage1 >= 0 && caption1 > stage1, "row 1 sets its stage before its caption");
  assert.doesNotMatch(darkRows[0].slice(0, darkRows[0].indexOf('"')), /is-reverse/);
  const [stage2, caption2] = order(darkRows[1]);
  assert.ok(caption2 >= 0 && stage2 > caption2, "row 2 sets its caption before its stage");
  assert.match(darkRows[1], /^[^>]*\bis-reverse\b/);
  assert.match(darkRows[0], /terpcare-checkin-dark/);
  assert.match(darkRows[1], /terpcare-mood-october-dark/);
  const caption = (eyebrow, title, body) => new RegExp(`<p class="row-eyebrow"[^>]*>${eyebrow}</p>\\s*<div class="exhibit-caption"[^>]*>\\s*<p class="caption-title"[^>]*>${title}</p>\\s*<p class="caption-body"[^>]*>${body}</p>`);
  assert.match(darkRows[0], caption("DARK MODE", "Dark mode from the same tokens", "Dark mode is a second mode on the colour variables, not a second file\\. The check-in is the same frame in both, which is how the 200% text version was built too\\."));
  assert.match(darkRows[1], caption("DARK MODE · MONTH", "The month keeps its meaning", "The October month is the same frame with the Dark mode switched on\\. Each level keeps its colour and its bar count, and missed days stay blank in both\\."));
  assert.equal([...mood.matchAll(/Dark mode from the same tokens/g)].length, 1);
  // no other rows carry a lead or zigzag (frontground, terpcarehub).
  for (const [slug, other] of pages) if (slug !== "terpcare") assert.doesNotMatch(other, /class="rows-lead"|is-zigzag/, `${slug} has no rows lead or zigzag`);
  assert.match(page, /href="\/work\/frontground"/);
});

test("sohive renders the v2 exhibit layout from its prose mock", () => {
  const page = pages.get("sohive");
  const sectionIds = [...page.matchAll(/<section[^>]*\bid="([^"]+)"[^>]*data-case-section/g)].map((match) => match[1]);
  assert.deepEqual(sectionIds, ["overview", "core-flows", "the-feed", "the-audit", "identity", "rsvp-outcomes", "host-side", "reflection"]);
  // two chapters after identity (211:18, 211:50) keep their notes; their phones play in one wide loop each, with no badges.
  for (const id of ["rsvp-outcomes", "host-side"]) for (const n of ["01", "02", "03", "04"]) assert.match(page, new RegExp(`<li id="${id}-note-${n}"`));
  assertBadgesResolve(page, 0);
  assert.match(page, /hiveSocial · Product Design \+ Design Systems · 2022/);
  // the summary is the prose mock's header (90:2555), word for word, in the header and the social meta tags.
  const summary = "A campus events and social network for the University of Maryland. I joined a file called WTM with a placeholder blue button, and left it with a name, a colour system and thirty four screens.";
  assert.ok(page.includes(`<p class="exhibit-summary"`) && page.includes(`>${summary}</p>`));
  for (const name of ['name="description"', 'property="og:description"', 'name="twitter:description"']) assert.ok(page.includes(`${name} content="${summary}"`), name);
  assert.match(page, /A hive is the people, not the app/);
  assert.match(page, /What an unnamed file taught me/);
  // feed and event rows are clean rendered loops; the profile row is a still with no loop tag.
  for (const name of ["feed", "event"]) {
    assert.match(page, new RegExp(`data-src="/images/work/sohive/sohive-${name}-loop\\.mp4"`));
    assert.match(page, new RegExp(`data-loop-name="${name} loop"`));
  }
  assert.equal([...page.matchAll(/class="row-tag"/g)].length, 2);
  assert.match(page, /sohive-profile-screen\.png/);
  // the feed pair: five leaders on two stages, three pointing in from the left.
  assert.equal([...page.matchAll(/class="annotation annotation-leader is-(left|right)/g)].length, 5);
  assert.equal([...page.matchAll(/class="annotation annotation-leader is-left/g)].length, 3);
  assert.match(page, /No card needs a photo to look finished/);
  // the artboard count draws 114 and 34 tiles in html, with its counts as text.
  assert.equal([...page.matchAll(/<div class="count-tiles"[^>]*>([\s\S]*?)<\/div>/g)].map((match) => (match[1].match(/<i\b/g) ?? []).length).join(","), "114,34");
  assert.match(page, /<span class="count-number"[^>]*>114<\/span>/);
  assert.match(page, /href="\/work\/ovara"/);
});

test("exactly the eleven small pinned stages zoom to the active annotation (figma 168:1745, 197:1727)", () => {
  // every data-pin-zoom element across the seven pages, by page and stage id; the pair and the walkthrough give one
  // exhibit several stage elements (each feed stage zooms on its own; the walkthrough's pinned stage, and the one
  // static step with a focus box). frontground's solution and sohive's feed zoom from their leaders (197:1727).
  const expected = {
    ovara: ["the-finding"], "kairo-health": ["field-by-tier"], "college-park-capstone": ["the-persona"],
    frontground: ["the-solution", "offline", "triage"], terpcare: ["the-original"], sohive: ["the-feed-0", "the-feed-1"],
    terpcarehub: ["core-flows-walkthrough-1", "core-flows-walkthrough-pin"], "elms-redesign": [],
  };
  for (const [slug, page] of pages) {
    const stages = [...page.matchAll(/<div class="exhibit-stage[^"]*"[^>]*data-pin-zoom="([^"]+)"([^>]*)>/g)];
    assert.deepEqual(stages.map((match) => match[1]), expected[slug], slug);
    // frontground's offline and triage leaders zoom on phones only; every other stage everywhere.
    for (const match of stages) assert.equal(/data-pin-zoom-phone/.test(match[2]), ["offline", "triage"].includes(match[1]), `${slug} ${match[1]} phone only`);
    for (const match of stages) {
      const start = match.index;
      const end = Math.min(...['<figcaption', 'class="exhibit-notes"', 'class="stage-caption"', 'class="walk-text"', 'class="exhibit-pins"', "</section>"].map((marker) => page.indexOf(marker, start)).filter((index) => index > 0));
      const stage = page.slice(start, end);
      // the zoom layer wraps the content once, right after the field (and veil), and holds every annotation.
      assert.equal([...stage.matchAll(/data-zoom-layer/g)].length, 1, `${slug} ${match[1]} has one zoom layer`);
      assert.match(stage, /class="stage-field"[^>]*><\/span>\s*(<span class="stage-veil"[^>]*><\/span>\s*)?<div class="stage-zoom" data-zoom-layer[^>]*>/);
      const annotations = [...stage.matchAll(/<span class="annotation annotation-(focus|leader)[^"]*"[^>]*data-annotation="(\d\d)"([^>]*)>/g)];
      assert.ok(annotations.length > 0, `${slug} ${match[1]} has annotations`);
      assert.ok(stage.indexOf("data-zoom-layer") < annotations[0].index, `${slug} ${match[1]} annotations sit in the layer`);
      // numbers rise in order, badges and leaders together, so ‹ and › step through them as the notes do.
      assert.deepEqual(annotations.map((a) => a[2]), [...annotations.map((a) => a[2])].sort());
      // a leader carries its label as the bar title and is followed by its invisible target region, which sets the zoom.
      for (const annotation of annotations.filter((a) => a[1] === "leader")) {
        assert.match(annotation[3], /data-zoom-title="[^"]+"/, `${slug} leader ${annotation[2]} title`);
        assert.match(stage.slice(annotation.index), /^<span[^>]*>(?:\s*<span class="leader-[^"]+"[^>]*>(?:<span[^>]*>[^<]*<\/span>)*<\/span>)+\s*<\/span>\s*<span class="leader-target" style="left: [\d.]+%; top: [\d.]+%; width: [\d.]+%; height: [\d.]+%" aria-hidden="true"/, `${slug} leader ${annotation[2]} target`);
      }
      // without scripts every badge is still the link to its note, or the aria-hidden marker it is today; the script
      // makes the markers and leader labels real buttons. a link's note must exist with a title the bar can use.
      for (const [badge] of stage.matchAll(/<(?:a|span) class="annotation-badge"[^>]*>/g)) {
        if (badge.startsWith("<a")) {
          const note = badge.match(/href="#([^"]+)"/)?.[1];
          assert.ok(note, `${slug} ${badge} links its note`);
          assert.match(page, new RegExp(`<li id="${note}"[^>]*>[\\s\\S]*?class="note-title"`), `${slug} ${note} exists`);
        } else assert.match(badge, /aria-hidden="true"/, `${slug} ${badge}`);
        assert.doesNotMatch(badge, /<button/);
      }
    }
    // one bar template per page with the three named controls and the polite title.
    assert.equal([...page.matchAll(/<template data-zoom-bar>/g)].length, 1, `${slug} bar template`);
    assert.match(page, /<template data-zoom-bar><div class="zoom-bar"><span class="zoom-title" aria-live="polite"><\/span><div class="zoom-controls"><button type="button" aria-label="Previous note">‹<\/button><button type="button" aria-label="Next note">›<\/button><button type="button" aria-label="Close zoom">✕<\/button><\/div><\/div><\/template>/);
  }
  // the walkthrough's badge takes its step's title, and its inactive screens are inert as well as hidden.
  const terpcarehub = pages.get("terpcarehub");
  assert.equal([...terpcarehub.matchAll(/data-annotation="02" data-zoom-title="Cost is visible before the click"/g)].length, 2);
  assert.equal([...terpcarehub.matchAll(/data-walk-screen="[12]" aria-hidden="true" inert/g)].length, 4);
  assert.doesNotMatch(terpcarehub, /data-walk-screen="0"[^>]*(aria-hidden|inert)/);
  // the alert badges zoomed too until where it landed became the alert detail loop (.private/terpcarehub-loops).
  assert.doesNotMatch(terpcarehub, /data-pin-zoom="where-it-landed"/);
  // each leader's target region is its zoomAt, a share of its stage; only these fourteen leaders have one.
  const targets = (page, from) => [...page.slice(page.indexOf(`data-pin-zoom="${from}"`)).split(/<div class="exhibit-stage/)[0].matchAll(/data-annotation="(\d\d)" data-zoom-title="([^"]+)"[\s\S]*?<span class="leader-target" style="([^"]+)"/g)].map((m) => [m[1], m[2], m[3]]);
  const box = (x, y, w, h) => `left: ${x}%; top: ${y}%; width: ${w}%; height: ${h}%`;
  assert.deepEqual(targets(pages.get("frontground"), "the-solution"), [
    ["01", "Chart is context", box(27.78, 23.91, 20.88, 17.5)],
    ["02", "Queue is the working surface", box(27.78, 42.97, 40.95, 34.38)],
    ["03", "Requests keep a status", box(69.89, 23.91, 14.96, 53.44)],
    ["04", "Triage carries a shape and a word, not only a colour", box(54.84, 48.75, 5.45, 29.06)],
  ]);
  // offline and triage (222:289, 222:397) zoom to the pill and banner, the queue, and the triage form's three parts.
  assert.deepEqual(targets(pages.get("frontground"), "offline"), [
    ["01", "Offline, with a count", box(27.69, 16.88, 38.17, 7.38)],
    ["02", "Charting continues", box(27.82, 43.13, 40.79, 33.75)],
  ]);
  assert.deepEqual(targets(pages.get("frontground"), "triage"), [
    ["01", "Emergency signs first", box(29.44, 23.67, 15.86, 12.66)],
    ["02", "Vitals in Fahrenheit", box(29.57, 37.03, 20.16, 13.59)],
    ["03", "The nurse confirms the level", box(60.35, 29.06, 22.85, 20.16)],
  ]);
  const sohive = pages.get("sohive");
  assert.deepEqual(targets(sohive, "the-feed-0"), [
    ["01", "Date and time", box(31.27, 29.0, 37.45, 4.83)],
    ["02", "Title on colour", box(31.27, 34.0, 37.45, 7.33)],
    ["03", "Going, one action", box(31.27, 41.17, 37.45, 3.67)],
  ]);
  assert.deepEqual(targets(sohive, "the-feed-1"), [
    ["01", "Gradient, not a stock photo", box(46.44, 9.17, 44.19, 28.33)],
    ["02", "RSVP in a fixed bar", box(49.25, 81.67, 38.76, 6.0)],
  ]);
  assert.equal([...pages.values()].flatMap((page) => [...page.matchAll(/class="leader-target"/g)]).length, 14);
  // the feed's first leader names only the date and time strip it points at.
  assert.doesNotMatch(sohive, /Place and time/);
  // and no other stage on any page carries the attribute (the heatmap, matrix, pins and rows stay as they are).
  const marked = [...pages.values()].flatMap((page) => [...page.matchAll(/data-pin-zoom="/g)]).length;
  assert.equal(marked, Object.values(expected).flat().length);
});

// mono labels on phones (figma 174:1721): at 390 no mono text is under 11px, and badge and leader numerals are not
// under 10px. the build has no browser, so this resolves the built css the way a 390 screen would: every rule whose
// width conditions hold at 390 applies in source order, :root custom properties resolve, and each selector that sets
// the mono family takes its last font size. a clamp counts at its floor, and an em size only fails if it shrinks.
test("no mono text renders under 11px at 390, badge numerals under 10px", () => {
  const assetDir = join(projectRoot, "dist", "_astro");
  const css = readdirSync(assetDir).filter((name) => name.endsWith(".css")).map((name) => readFileSync(join(assetDir, name), "utf8")).join("\n");
  const holds = (media) => [...media.matchAll(/\((max-width:|width ?<=|min-width:|width ?>=)\s*(\d+(?:\.\d+)?)px\)/g)].every(([, kind, px]) => (/max|<=/.test(kind) ? 390 <= Number(px) : 390 >= Number(px)));
  // [selectors, declarations] for every style rule that applies at 390, in source order.
  const rules = [];
  const walk = (text) => {
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf("{", i);
      if (open < 0) break;
      const prelude = text.slice(i, open).trim();
      let depth = 1, j = open + 1;
      for (; depth; j++) depth += text[j] === "{" ? 1 : text[j] === "}" ? -1 : 0;
      const body = text.slice(open + 1, j - 1);
      if (prelude.startsWith("@media")) { if (holds(prelude)) walk(body); }
      else if (prelude.startsWith("@supports") || prelude.startsWith("@layer")) walk(body);
      else if (!prelude.startsWith("@")) rules.push([prelude.split(",").map((s) => s.trim()), body]);
      i = j;
    }
  };
  walk(css);

  const root = {};
  const decls = (body) => [...body.matchAll(/(--[\w-]+|[a-z-]+)\s*:\s*([^;]+)/g)].map(([, prop, value]) => [prop, value.trim()]);
  for (const [selectors, body] of rules) if (selectors.includes(":root")) for (const [prop, value] of decls(body)) if (prop.startsWith("--")) root[prop] = value;
  const resolve = (value) => {
    let out = value;
    for (let k = 0; k < 5 && out.includes("var("); k++) out = out.replace(/var\((--[\w-]+)(?:,\s*((?:[^()]|\([^()]*\))*))?\)/g, (_, name, fallback) => root[name] ?? fallback ?? "");
    return out;
  };
  const px = (size) => {
    const clamp = size.match(/^clamp\(\s*([\d.]+)px/);
    if (clamp) return Number(clamp[1]);
    if (/^[\d.]+px$/.test(size)) return parseFloat(size);
    if (/^[\d.]+rem$/.test(size)) return parseFloat(size) * 16;
    // a relative size scales its parent's text, which is checked on its own; only a shrink could fall under the floor.
    if (/^[\d.]+em$/.test(size)) return parseFloat(size) >= 1 ? Infinity : 0;
    return NaN;
  };

  const type = new Map();
  for (const [selectors, body] of rules) {
    for (const [prop, raw] of decls(body)) {
      if (prop !== "font" && prop !== "font-size" && prop !== "font-family") continue;
      const value = resolve(raw);
      for (const selector of selectors) {
        const entry = type.get(selector) ?? {};
        if (prop === "font-size") entry.size = value;
        else if (prop === "font-family") entry.mono = /JetBrains Mono/.test(value);
        else {
          const shorthand = value.match(/((?:clamp\((?:[^()]|\([^()]*\))*\)|[\d.]+px))\s*(?:\/\s*\S+)?\s+(.+)$/);
          if (shorthand) { entry.size = shorthand[1]; entry.mono = /JetBrains Mono/.test(shorthand[2]); }
        }
        type.set(selector, entry);
      }
    }
  }

  const mono = [...type].filter(([, entry]) => entry.mono && entry.size);
  assert.ok(mono.length > 40, `found ${mono.length} mono selectors`);
  for (const [selector, { size }] of mono) {
    // the phone leader dot is a badge numeral too.
    const floor = /annotation-badge|leader-number|leader-dot/.test(selector) ? 10 : 11;
    assert.ok(px(size) >= floor, `${selector} is ${size} at 390, under ${floor}px`);
  }
  // the badges and leader numerals are in the set, so the 10px floor is really checked.
  assert.ok(mono.some(([selector]) => /annotation-badge/.test(selector)) && mono.some(([selector]) => /leader-number/.test(selector)));
});
