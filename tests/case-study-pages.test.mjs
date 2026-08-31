import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test, { before } from "node:test";
import assert from "node:assert/strict";

const projectRoot = new URL("..", import.meta.url).pathname;
const slugs = [
  "frontground",
  "usm-venture-benchmark",
  "college-park-capstone",
  "ovara",
  "kairo-health",
  "terpcare",
  "terpcarehub",
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

test("all seven approved case studies render from one route system", () => {
  assert.equal(pages.size, 7);

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

test("case-study covers render as full-bleed project-palette motion media", () => {
  for (const html of pages.values()) {
    assert.match(html, /data-project-cover/);
    assert.match(html, /class="cover-motion"/);
    assert.match(html, /autoplay/);
    assert.match(html, /muted/);
    assert.match(html, /loop/);
    assert.match(html, /class="cover-label is-centered"/);
    assert.doesNotMatch(html, /case-hero[\s\S]{0,500}is-contained/);
  }
});

test("the renamed capstone and expanded product evidence render publicly", () => {
  const usm = pages.get("usm-venture-benchmark");

  assert.match(usm, /USM Venture Benchmark/);
  assert.match(usm, /638 data cells/);
  assert.match(usm, /zero field-level mismatches/);
  assert.match(usm, /brief-overview-redacted\.png/);
  assert.match(usm, /brief-vehicles-redacted\.png/);
  assert.match(usm, /brief-portfolio-redacted\.png/);
  assert.match(usm, /brief-deep-dive-redacted\.png/);
  assert.match(usm, /data-media-layout="lead-grid"/);
  assert.doesNotMatch(usm, /figma\.com\/design\/Vi6MdEzxLKirckl6xpY2jJ/);
  assert.match(pages.get("college-park-capstone"), /Information Science Capstone/);
  assert.match(pages.get("terpcare"), /15-screen product system/);
  assert.match(pages.get("kairo-health"), /Deployment routing/);
});

test("previous and next project links wrap without dead ends", () => {
  const first = pages.get("frontground");
  const usm = pages.get("usm-venture-benchmark");
  const last = pages.get("terpcarehub");

  assert.match(first, /href="\/work\/terpcarehub"/);
  assert.match(first, /href="\/work\/usm-venture-benchmark"/);
  assert.match(usm, /href="\/work\/frontground"/);
  assert.match(usm, /href="\/work\/college-park-capstone"/);
  assert.match(last, /href="\/work\/terpcare"/);
  assert.match(last, /href="\/work\/frontground"/);
});
