import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test, { before } from "node:test";
import assert from "node:assert/strict";

import { projects } from "../src/data/portfolio.mjs";

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
// pages already moved to the v2 exhibit layout; the older cover and media checks skip them.
const exhibitPages = new Set(["kairo-health", "usm-venture-benchmark", "ovara", "terpcarehub"]);
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
    assert.doesNotMatch(text, /\bnext steps?\b/i);
    assert.doesNotMatch(html, /case-callout/);
  }
});

test("case-study covers show real exhibits with explicitly controlled motion", () => {
  for (const [slug, html] of pages) {
    if (exhibitPages.has(slug)) continue;
    assert.match(html, /data-project-cover/);
    assert.match(html, /class="cover-motion"/);
    assert.doesNotMatch(html, /autoplay/);
    assert.match(html, /data-cover-toggle/);
    assert.match(html, /data-cover-video/);
    assert.match(html, /data-device-frame/);
    assert.match(html, /preload="none"/);
    assert.match(html, /muted/);
    assert.match(html, /loop/);
    assert.match(html, /class="cover-label"/);
    assert.doesNotMatch(html, /case-hero[\s\S]{0,500}is-contained/);
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
  const first = pages.get("usm-venture-benchmark");
  const middle = pages.get("frontground");
  const last = pages.get("sohive");

  // the v2 exhibit shell (figma 61:1059) closes on a next project link only, so previous is checked on the older layout.
  if (!exhibitPages.has("usm-venture-benchmark")) assert.match(first, /href="\/work\/sohive"/);
  assert.match(first, /href="\/work\/ovara"/);
  assert.match(middle, /href="\/work\/college-park-capstone"/);
  assert.match(middle, /href="\/work\/terpcare"/);
  assert.match(last, /href="\/work\/terpcare"/);
  assert.match(last, /href="\/work\/usm-venture-benchmark"/);
});


test("every case study has a unique social preview and reading progress", () => {
  for (const [slug, html] of pages) {
    assert.match(html, new RegExp(`property="og:image"[^>]*content="https://kennethyeaher\\.github\\.io/images/social/${slug}\\.png"`));
    assert.match(html, /data-reading-progress/);
    assert.match(html, new RegExp(`view-transition-name: cover-${slug}`));
    const names = [...html.matchAll(/view-transition-name: ([a-z-]+)/g)].map((match) => match[1]);
    assert.equal(new Set(names).size, names.length, `duplicate transition names on ${slug}`);
    assert.doesNotMatch(html, /\bTODO\b/);
  }
});

test("device exhibits preserve captions and source dimensions", () => {
  for (const slug of ["frontground"]) {
    const html = pages.get(slug);
    assert.match(html, /data-media-kind="device"/);
    assert.match(html, /width="\d+" height="\d+"/);
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
  assert.match(kairo, /href="\/work\/terpcarehub"/);
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
  assert.match(usm, /href="\/work\/ovara"/);
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
    assert.match(ovara, new RegExp(`data-loop-toggle hidden[^>]*><span data-loop-action[^>]*>Pause</span><span class="loop-name"[^>]*> ${name} loop</span></button>`));
  }
  assert.doesNotMatch(ovara, /autoplay/);
  // audit cards in html, every field from the spec text.
  assert.equal([...ovara.matchAll(/<p class="audit-value"[^>]*>/g)].length, 3);
  assert.match(ovara, /<p class="audit-value"[^>]*>\+0\.33 → \+0\.12<\/p>/);
  assert.match(ovara, /<dt class="audit-heading is-guard"[^>]*>Guard<\/dt>/);
  assert.match(ovara, /That is the number I would have quoted in an interview\./);
  assert.match(ovara, /href="\/work\/kairo-health"/);
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
  // three iphone rows, each a cropped screen loop with its own named control.
  assert.equal([...page.matchAll(/class="exhibit-row"/g)].length, 3);
  for (const [clip, name] of [["find-care", "same-day care"], ["alert", "alert"], ["dashboard", "own items"]]) {
    assert.match(page, new RegExp(`data-src="/images/work/terpcarehub/terpcarehub-${clip}-loop\\.mp4"`));
    assert.match(page, new RegExp(`data-loop-toggle hidden[^>]*><span data-loop-action[^>]*>Pause</span><span class="loop-name"[^>]*> ${name} loop</span></button>`));
  }
  assert.equal([...page.matchAll(/class="stage-veil"/g)].length, 3);
  // the minute 22 timeline is html over an svg rail.
  assert.match(page, /<ol class="timeline-steps"/);
  assert.equal([...page.matchAll(/<li[^>]*class="is-marked"[^>]*>/g)].length, 1);
  assert.match(page, /<svg class="timeline-rail"[^>]*aria-hidden="true"/);
  assert.match(page, /Minute 22 · 11:24 PM/);
  // the pair: three leaders on the card, three focus markers on the alert, captions instead of notes.
  assert.equal([...page.matchAll(/class="annotation annotation-leader is-vertical on-light"/g)].length, 3);
  assert.equal([...page.matchAll(/<span class="annotation-badge"[^>]*aria-hidden="true"/g)].length, 3);
  assert.doesNotMatch(page, /class="annotation-badge"[^>]*href=/);
  assert.match(page, /<span class="browser-address"[^>]*>terpcarehub · alert<\/span>/);
  // four interface states, each with its name and line.
  assert.equal([...page.matchAll(/<p class="state-name"/g)].length, 4);
  assert.match(page, /interface-state-degraded\.png/);
  assert.match(page, /href="\/work\/college-park-capstone"/);
});
