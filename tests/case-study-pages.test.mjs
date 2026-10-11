import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test, { before } from "node:test";
import assert from "node:assert/strict";

import { projects } from "../src/data/portfolio.mjs";
import { contrast, hexToOklch } from "../src/utils/oklch.mjs";

const projectRoot = new URL("..", import.meta.url).pathname;
const slugs = [
  "usm-venture-benchmark",
  "ovara",
  "kairo-health",
  "terpcarehub",
  "college-park-capstone",
  "frontground",
  "terpcare",
  "sohive",
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

test("the renamed capstone and expanded product evidence render publicly", () => {
  const usm = pages.get("usm-venture-benchmark");

  assert.match(usm, /USM Venture Benchmark/);
  assert.match(usm, /638 cells/);
  assert.match(usm, /zero field-level mismatches/);
  assert.match(usm, /brief-overview-redacted\.png/);
  assert.match(usm, /brief-vehicles-redacted\.png/);
  assert.match(usm, /brief-portfolio-redacted\.png/);
  assert.match(usm, /brief-deep-dive-redacted\.png/);
  assert.doesNotMatch(usm, /figma\.com\/design\/Vi6MdEzxLKirckl6xpY2jJ/);
  assert.match(pages.get("college-park-capstone"), /Information Science Capstone/);
  assert.match(pages.get("terpcare"), /15-screen product system/);
  assert.match(pages.get("kairo-health"), /Deployment routing/);
});

test("previous and next project links wrap without dead ends", () => {
  const first = pages.get("terpcarehub");
  const middle = pages.get("terpcare");
  const last = pages.get("usm-venture-benchmark");

  // the v2 exhibit shell (figma 61:1059) closes on a next project link only, in the home order.
  assert.match(first, /href="\/work\/frontground"/);
  assert.match(middle, /href="\/work\/ovara"/);
  assert.match(last, /href="\/work\/terpcarehub"/);
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
  assert.equal(loops, 9);
});

test("reading progress matches figma 26:105: a sticky rule track under the header, filled in the case study accent", () => {
  for (const [slug, html] of pages) {
    const project = projects.find((entry) => entry.slug === slug);
    // the first thing in main, so it rests under the header and pins once the header scrolls away.
    const bar = html.match(/<main id="main-content">\s*<div class="reading-progress" data-reading-progress aria-hidden="true" style="--reading-accent: (#[0-9a-fA-F]{6}); --reading-accent-dark: (#[0-9a-fA-F]{6})"><span><\/span><\/div>/);
    assert.ok(bar, `${slug} opens main with the reading progress bar`);
    assert.equal(bar[1], project.cover.accent ?? project.cover.palette[1]);
    assert.ok(contrast(bar[2], "#344553") >= 3, `${slug} dark fill reaches 3:1 on the dark track`);
    // the dark fill is the same hue, lighter, with chroma cut only where srgb runs out.
    const [lightness, chroma, hue] = hexToOklch(bar[1]);
    const [darkLightness, darkChroma, darkHue] = hexToOklch(bar[2]);
    assert.ok(darkLightness > lightness, `${slug} dark fill is lighter`);
    assert.ok(Math.abs(darkHue - hue) * (180 / Math.PI) < 2, `${slug} dark fill keeps its hue`);
    assert.ok(darkChroma > chroma * 0.9, `${slug} dark fill keeps its chroma`);
  }
  assert.match(pages.get("terpcarehub"), /--reading-accent: #E21833;/);

  const globalCss = readFileSync(join(projectRoot, "src", "styles", "global.css"), "utf8");
  assert.match(globalCss, /\.reading-progress \{ position: sticky; z-index: 40; top: 0; height: 3px; background: var\(--rule\); pointer-events: none; \}/);
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

test("metric labels are serif sentence case on all eight pages, and tiles in a row share one height", () => {
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
    assert.match(html, /width="1919" height="1079"|width="1489" height="1600"/);
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
  assert.match(kairo, /href="\/work\/usm-venture-benchmark"/);
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

test("USM renders the v2 exhibit layout from the approved spec", () => {
  const usm = pages.get("usm-venture-benchmark");
  const chapters = ["overview", "the-brief-system", "validation-grid", "the-evidence-path", "the-vc-lens"];
  const sectionIds = [...usm.matchAll(/<section[^>]*\bid="([^"]+)"[^>]*data-case-section/g)].map((match) => match[1]);
  assert.deepEqual(sectionIds, chapters);
  for (const id of chapters) assert.match(usm, new RegExp(`href="#${id}"`));
  assert.match(usm, /<span class="chapter-number"[^>]*>05<\/span>\s*The VC lens/);
  // 05 the vc lens has no exhibit in figma, so it is a prose chapter; the decision framework stays in 04.
  assert.doesNotMatch(usm, /id="reflection"/);
  const vcLens = usm.slice(usm.indexOf('id="the-vc-lens"'), usm.indexOf("data-project-pager"));
  assert.match(vcLens, /<p class="section-eyebrow"[^>]*>THE VC LENS<\/p>/);
  assert.match(vcLens, /The last step moved from what exists elsewhere to what might transfer\./);
  assert.doesNotMatch(vcLens, /journey-strip/);
  assert.doesNotMatch(usm, /transferability-lens/);
  const evidencePath = usm.slice(usm.indexOf('id="the-evidence-path"'), usm.indexOf('id="the-vc-lens"'));
  assert.match(evidencePath, /class="journey-strip"/);
  assert.match(usm, /class="exhibit-stage stage-hero/);
  assert.match(usm, /--stage-ratio: 1116 \/ 460/);
  assert.match(usm, /left: 70\.8%; top: 71\.7%/);
  assert.match(usm, /data-count-to="638"/);
  assert.match(usm, /<table class="journey/);
  assert.match(usm, /<th scope="col" class="is-accent[^"]*"[^>]*>[\s\S]*?Investment synthesis/);
  assert.equal([...usm.matchAll(/class="is-mechanism/g)].length, 4);
  assert.match(usm, /<span class="strip-commitment"[^>]*>HIGH CAPITAL AND GOVERNANCE<\/span>/);
  assert.match(usm, /The mechanisms are generic\. Confidential institution findings and recommendations are omitted\./);
  assert.match(usm, /href="\/work\/terpcarehub"/);
  assertBadgesResolve(usm, 6);
  assert.doesNotMatch(usm, /data-cover-video|\.mp4/);
});

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
  // three dashboard rows, each a recorded loop with a poster and its own named control.
  assert.equal([...ovara.matchAll(/class="exhibit-row"/g)].length, 3);
  for (const name of ["state", "county", "findings"]) {
    assert.match(ovara, new RegExp(`poster="/images/work/ovara/ovara-${name}-loop-poster\\.webp"`));
    assert.match(ovara, new RegExp(`data-src="/images/work/ovara/ovara-${name}-loop\\.mp4"`));
    assert.match(ovara, new RegExp(`data-loop-name="${name} loop"`));
    assert.match(ovara, new RegExp(`class="loop-toggle"[^>]*data-loop-toggle aria-controls="clip-${name.replace(/ /g, "-")}-loop" hidden[^>]*><span data-loop-action[^>]*>Pause</span><span class="loop-name"[^>]*> ${name} loop</span></button></span>`));
  }
  assert.doesNotMatch(ovara, /autoplay/);
  // audit cards in html, every field from the spec text.
  assert.equal([...ovara.matchAll(/<p class="audit-value"[^>]*>/g)].length, 3);
  assert.match(ovara, /<p class="audit-value"[^>]*>\+0\.33 → \+0\.12<\/p>/);
  assert.match(ovara, /<dt class="audit-heading is-guard"[^>]*>Guard<\/dt>/);
  assert.match(ovara, /That is the number I would have quoted in an interview\./);
  assert.match(ovara, /href="\/work\/college-park-capstone"/);
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
  assert.deepEqual(sectionIds, ["overview", "core-flows", "the-measure", "where-it-landed", "design-system", "reflection"]);
  assert.match(page, /What I would test first/);
  // two iphone rows, each a cropped screen loop with its own named control; the find care loop is gone.
  assert.equal([...page.matchAll(/class="exhibit-row"/g)].length, 2);
  assert.doesNotMatch(page, /terpcarehub-find-care-loop/);
  for (const [clip, name] of [["alert", "alert"], ["dashboard", "own items"]]) {
    assert.match(page, new RegExp(`data-src="/images/work/terpcarehub/terpcarehub-${clip}-loop\\.mp4"`));
    assert.match(page, new RegExp(`class="loop-toggle"[^>]*data-loop-toggle aria-controls="clip-${name.replace(/ /g, "-")}-loop" hidden[^>]*><span data-loop-action[^>]*>Pause</span><span class="loop-name"[^>]*> ${name} loop</span></button></span>`));
  }
  // a veil on each row stage, the overview laptop, the pinned walkthrough stage and its three narrow-screen stages.
  assert.equal([...page.matchAll(/class="stage-veil"/g)].length, 7);
  // the minute 22 timeline is html over an svg rail.
  assert.match(page, /<ol class="timeline-steps"/);
  assert.equal([...page.matchAll(/<li[^>]*class="is-marked"[^>]*>/g)].length, 1);
  assert.match(page, /<svg class="timeline-rail"[^>]*aria-hidden="true"/);
  assert.match(page, /Minute 22 · 11:24 PM/);
  // the alert stage alone, full width: three focus markers and a caption instead of notes; the provider card is gone.
  assert.doesNotMatch(page, /annotation-leader/);
  assert.doesNotMatch(page, /class="exhibit-pair"/);
  const landed = page.slice(page.indexOf('id="where-it-landed"'), page.indexOf('id="design-system"'));
  assert.equal([...landed.matchAll(/<span class="annotation-badge"[^>]*aria-hidden="true"/g)].length, 3);
  assert.doesNotMatch(page, /class="annotation-badge"[^>]*href=/);
  assert.match(page, /<span class="browser-address"[^>]*>terpcarehub · alert<\/span>/);
  // four interface states, each with its name and line.
  assert.equal([...page.matchAll(/<p class="state-name"/g)].length, 4);
  assert.match(page, /interface-state-degraded\.png/);
  assert.match(page, /href="\/work\/frontground"/);
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
  assert.ok(statSync(join(projectRoot, "public/images/work/terpcarehub/home-full.webp")).size < 400 * 1024, "the home page export stays under 400 KB");
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
  for (const [slug, kind] of [["college-park-capstone", "heatmap"], ["college-park-capstone", "journey"], ["terpcare", "matrix"], ["terpcarehub", "timeline"], ["frontground", "visit"]]) {
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

test("TerpCareHub's annotated pins are focusable buttons announced with their notes", () => {
  const page = pages.get("terpcarehub");
  const landed = page.slice(page.indexOf('id="where-it-landed"'), page.indexOf('id="design-system"'));
  const pins = landed.slice(landed.indexOf('class="exhibit-pins"'));
  assert.ok(landed.indexOf("exhibit-pins") > landed.indexOf("terpcarehub · alert"), "the pins sit below the alert stage");
  const buttons = [...pins.matchAll(/<button type="button" class="pin" data-pin="(\d)" aria-describedby="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g)];
  assert.deepEqual(buttons.map((match) => [match[1], textOf(match[3])]), [["1", "Annotation 1"], ["2", "Annotation 2"], ["3", "Annotation 3"]]);
  assert.doesNotMatch(pins, /<button[^>]*tabindex="-1"/);
  // each pin is described by a note that exists, carries the same number, and holds the approved text.
  const notes = [...pins.matchAll(/<li class="pin-note" id="([^"]+)" data-note="(\d)"[^>]*>([\s\S]*?)<\/li>/g)];
  assert.deepEqual(buttons.map((match) => match[2]), notes.map((match) => match[1]));
  assert.deepEqual(notes.map((match) => textOf(match[3])), [
    "ANNOTATION 1 Live status on every card Open or closed status sits on each provider card, so hours never need a second page.",
    "ANNOTATION 2 Cost before the click Cost was the blocker that ended the search in the journey map, so availability, plan acceptance, and expected cost sit on the card itself.",
    "ANNOTATION 3 Sign in only to book Browsing, filtering and deciding stay open so an urgent decision never hits a login wall.",
  ]);
  // pin 2 is active while nothing is hovered or focused.
  assert.match(page, /\[data-pins="where-it-landed-pins"\]:not\(:has\(\[data-pin\]:is\(:hover, :focus-visible\)\)\) :is\(\[data-pin="2"\], \[data-note="2"\]\)/);
  assert.deepEqual([texts(pins, "caption-title")[0], texts(pins, "caption-body")[0]], ["Provider card, design decisions", "Hover or tab to a pin to open its note. The active pin and its note are linked by color and number, and both are announced to screen readers."]);
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
  assert.match(page, /href="\/work\/kairo-health"/);
});

test("Frontground renders the v2 exhibit layout from its prose mock", () => {
  const page = pages.get("frontground");
  const sectionIds = [...page.matchAll(/<section[^>]*\bid="([^"]+)"[^>]*data-case-section/g)].map((match) => match[1]);
  assert.deepEqual(sectionIds, ["overview", "core-flows", "the-problem", "the-solution", "the-system", "where-it-stands"]);
  assert.match(page, /Three columns, three questions/);
  assert.match(page, /What the venture taught me and what I still owe it/);
  // doctor and nurse rows are clean recorded loops; the admin row is a still with no loop tag.
  for (const name of ["doctor", "nurse"]) {
    assert.match(page, new RegExp(`data-src="/images/work/frontground/frontground-${name}-loop\\.mp4"`));
    assert.match(page, new RegExp(`data-loop-name="${name} loop"`));
  }
  assert.equal([...page.matchAll(/class="row-tag"/g)].length, 2);
  assert.match(page, /frontground-admin\.png/);
  // the six stage visit graphic: html words over an svg rail, two legend categories.
  assert.equal([...page.matchAll(/<li class="is-(care|time)"[^>]*>\s*<span class="stage-num"/g)].length, 6);
  assert.equal([...page.matchAll(/<li class="is-time"[^>]*>\s*<span class="stage-num"/g)].length, 2);
  assert.match(page, /<svg class="visit-rail"[^>]*aria-hidden="true"/);
  assert.match(page, /Refiling is the one that matters most and gets the least attention\./);
  // the solution: four leaders on the stage, two pointing in from the left, and the caption under it.
  assert.equal([...page.matchAll(/class="annotation annotation-leader is-left/g)].length, 2);
  assert.equal([...page.matchAll(/class="annotation annotation-leader is-vertical/g)].length, 1);
  assert.match(page, /What the interviews put on the first screen/);
  assert.match(page, /href="\/work\/sohive"/);
});

test("TerpCare renders the v2 exhibit layout from its prose mock", () => {
  const page = pages.get("terpcare");
  const sectionIds = [...page.matchAll(/<section[^>]*\bid="([^"]+)"[^>]*data-case-section/g)].map((match) => match[1]);
  assert.deepEqual(sectionIds, ["overview", "the-gap", "five-destinations", "core-flows", "reflection"]);
  assert.match(page, /The strongest design move was connecting scattered moments/);
  // the competitive matrix is one real table, its opportunity column accented, three weakness cells boxed.
  assert.equal([...page.matchAll(/<table class="matrix"/g)].length, 1);
  assert.match(page, /<th scope="col" class="is-accent"[^>]*>Opportunity<\/th>/);
  assert.equal([...page.matchAll(/<td class="is-accent"/g)].length, 3);
  for (const n of ["01", "02", "03"]) assert.match(page, new RegExp(`<li id="the-gap-note-${n}"`));
  // the five destinations grid is a table with no accent stage, closed by its label and note, no cards.
  assert.equal([...page.matchAll(/<th scope="col"[^>]*>\s*<span class="journey-number"/g)].length, 5);
  assert.doesNotMatch(page, /<th scope="col" class="is-accent"[^>]*>\s*<span class="journey-number"/);
  assert.match(page, /PERSISTENT BOTTOM NAVIGATION  ·  NOTIFICATIONS AND PROFILE SUPPORT CONTINUITY/);
  // core flows: four phones, four boxes, every badge resolving to its note (three on the matrix, four here).
  assert.equal([...page.matchAll(/data-device-frame="iphone"/g)].length, 7);
  assertBadgesResolve(page, 7);
  assert.match(page, /href="\/work\/ovara"/);
});

test("sohive renders the v2 exhibit layout from its prose mock", () => {
  const page = pages.get("sohive");
  const sectionIds = [...page.matchAll(/<section[^>]*\bid="([^"]+)"[^>]*data-case-section/g)].map((match) => match[1]);
  assert.deepEqual(sectionIds, ["overview", "core-flows", "the-feed", "the-audit", "identity", "reflection"]);
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
  assert.match(page, /href="\/work\/terpcare"/);
});
