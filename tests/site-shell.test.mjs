import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test, { before } from "node:test";
import assert from "node:assert/strict";

const projectRoot = new URL("..", import.meta.url).pathname;
const globalCss = readFileSync(join(projectRoot, "src", "styles", "global.css"), "utf8");

before(() => {
  execFileSync("npm", ["run", "build"], {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: "pipe",
  });
});

test("the rendered shell exposes only Work, About, and Resume navigation", () => {
  const html = readFileSync(join(projectRoot, "dist", "index.html"), "utf8");

  assert.match(html, />\s*Work\s*</);
  assert.match(html, /href="\/about"[^>]*>\s*About\s*</);
  assert.match(html, /href="\/resume\/kyresume\.pdf"[^>]*>\s*Resume\s*</);
  assert.doesNotMatch(html, />\s*Education\s*</);
  assert.doesNotMatch(html, />\s*Contact\s*</);
});

test("the rendered shell provides theme choice and keeps accessible fallbacks", () => {
  const html = readFileSync(join(projectRoot, "dist", "index.html"), "utf8");

  assert.match(html, /class="skip-link"/);
  assert.doesNotMatch(html, /cursor-dot/);
  assert.doesNotMatch(globalCss, /cursor:\s*none/);
  assert.match(html, /data-nav-toggle/);
  assert.match(html, /data-theme-toggle/);
  assert.match(html, /aria-label="Use dark theme"/);
  assert.match(globalCss, /prefers-color-scheme: dark/);
  assert.match(globalCss, /:root\[data-theme="dark"\]/);
  assert.match(html, /portfolio-theme/);
  assert.match(globalCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(globalCss, /@media \(pointer: fine\) and \(prefers-reduced-motion: no-preference\)/);
});

test("the interaction system uses blue rather than the previous orange accent", () => {
  assert.doesNotMatch(globalCss, /#c95a30/i);
  assert.doesNotMatch(globalCss, /#f2ded5/i);
  assert.match(globalCss, /--accent:\s*#(?:1f4f7a|174f7a|194f78|1e4d73)/i);
});

test("reveal targets stay visible until the fallback observer opts in", () => {
  assert.match(globalCss, /\.reveal-ready \[data-reveal\] \{/);
  assert.match(globalCss, /\.reveal-ready \.section-rule\[data-reveal\] \{/);
  assert.doesNotMatch(globalCss, /^\.section-rule\[data-reveal\] \{/m);
});

test("the home cover gradient registers its animated properties", () => {
  for (const name of ["--drift-a", "--drift-b", "--cover-energy"]) {
    assert.match(globalCss, new RegExp(`@property ${name} \\{`));
  }
  assert.match(globalCss, /@supports \(background: linear-gradient\(in oklab/);
});

test("one annotation colour is defined for light and both dark theme paths", () => {
  assert.equal((globalCss.match(/--color-annotate:/g) ?? []).length, 3);
  assert.equal((globalCss.match(/--on-annotate:/g) ?? []).length, 3);
});

test("annotation motion follows the exhibit note and stays off under reduced motion", () => {
  const block = globalCss.slice(globalCss.indexOf("/* exhibit annotations"));
  assert.match(block, /^\/\* exhibit annotations[\s\S]*?@media \(prefers-reduced-motion: no-preference\) \{\n  @supports \(\(animation-timeline: view\(\)\) and \(animation-range: entry\)\)/);
  assert.match(block, /transition: scale 400ms/);
  assert.match(block, /var\(--order, 0\) \* 120ms/);
  assert.match(block, /translate: 0 6px/);
  assert.doesNotMatch(block.replace(/\/\*[\s\S]*?\*\//g, ""), /infinite|alternate|pulse/);
});

test("the collapsed menu is the first paint when scripts run, so the nav never shifts the page", () => {
  const html = readFileSync(join(projectRoot, "dist", "work", "kairo-health", "index.html"), "utf8");
  const head = html.slice(0, html.indexOf("<body"));
  assert.match(head, /document\.documentElement\.classList\.add\("nav-ready"\)/);
  // without scripts the class never lands, and the link row fallback still applies.
  assert.match(globalCss, /html:not\(\.nav-ready\) \.primary-links/);
});
