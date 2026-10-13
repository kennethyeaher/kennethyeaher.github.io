import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test, { before } from "node:test";
import assert from "node:assert/strict";
import { getFeaturedProjects } from "../src/data/portfolio.mjs";

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
  assert.match(workHtml, /event\.viewTransition\.finished\.finally\(\(\) => nameCard\(card, false\)\)\.catch\(\(\) => \{\}\);/);
  assert.equal((workHtml.match(/data-cover-gradient/g) ?? []).length, 8);
  assert.doesNotMatch(workHtml, /\.mp4|data-cover-video/);
  assert.doesNotMatch(workHtml, /Read case study/);
  assert.doesNotMatch(workHtml, /project-media is-contained/);
});

test("home v3 follows figma 176:1721 and 177:1723: Currently and Previously under the thesis, name / year captions", () => {
  // no visible work header or project count; the h2 stays for screen readers so the card h3s keep a parent.
  assert.match(workHtml, /<h2 id="work-title" class="sr-only"[^>]*>Selected work<\/h2>/);
  assert.doesNotMatch(workHtml, /class="work-header"|\d\d projects/);
  // the experience list no longer renders on the home page.
  assert.doesNotMatch(workHtml, /experience-list|experience-year|is-compact/);

  // Currently is two lines and Previously one sentence, where each "@" holds to the word before it.
  const now = workHtml.match(/<dl class="home-now"[^>]*>([\s\S]*?)<\/dl>/)?.[1];
  assert.ok(now, "the Currently and Previously list renders");
  const pairs = [...now.matchAll(/<dt[^>]*>([^<]+)<\/dt>\s*(?:<!--[\s\S]*?-->\s*)?<dd[^>]*>([\s\S]*?)<\/dd>/g)].map(([, label, body]) => [label, body.replace(/<span[^>]*>([^<]*)<\/span>/g, "$1|").replace(/\|$/, "")]);
  assert.deepEqual(pairs, [
    ["Currently", "Studying HCIM @ UMD|in College Park, Maryland"],
    ["Previously", "Screened deals\u00a0@ USM Maryland Momentum Fund, analyzed data\u00a0@ Towers Surgical Partners, founded Frontground, and more."],
  ]);
  assert.doesNotMatch(visibleText(now), /\b(19|20)\d\d\b/, "no years");

  // each card is its cover, then "{name} / {year}" with an aria-hidden slash; no category, role or summary.
  const captions = [...workHtml.matchAll(/<div class="project-caption"[^>]*>\s*<h3[^>]*>([^<]+)<\/h3>\s*<span class="project-caption-slash" aria-hidden="true"[^>]*>\/<\/span>\s*<span class="project-year"[^>]*>(\d{4})<\/span>\s*<\/div>\s*<\/a>/g)].map((match) => `${match[1]} / ${match[2]}`);
  assert.deepEqual(captions, getFeaturedProjects().map((project) => `${project.cardTitle} / ${project.cardYear ?? project.year}`));
  assert.doesNotMatch(workHtml, /class="project-(role|summary|heading)"/);
  assert.match(workHtml, /card\.querySelector\("h3"\)\.style\.viewTransitionName/);

  const css = [...workHtml.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((match) => readFileSync(join(projectRoot, "dist", match[1]), "utf8")).join("\n");
  const rule = (selector, scope = css) => scope.match(new RegExp(`(?:^|[{}\\s])${selector}\\[[^\\]]+\\]\\{([^}]*)\\}`))?.[1] ?? "";
  // a 924px column centred on the screen (x=258 at 1440) clear of the rail; the credit 140px under the grid.
  assert.match(rule("\\.home-page"), /^width:min\(924px,100% - 48px\);margin-bottom:116px;margin-left:max\(24px,50% - 510px\)$/);
  assert.match(rule("\\.home-intro"), /^padding-top:136px;padding-bottom:96px$/);
  assert.match(rule("\\.home-thesis\\[[^\\]]+\\] h1"), /font-size:72px;font-weight:400;letter-spacing:-\.02em;line-height:74px/);
  assert.match(rule("\\.home-now"), /^display:flex;margin:48px 0 0;gap:48px;font:15px \/ 22px var\(--ui-sans\)$/);
  assert.match(rule("\\.home-now-currently"), /^flex:0 280px$/);
  assert.match(rule("\\.home-now-previously"), /^flex:0 470px$/);
  assert.match(rule("\\.home-now\\[[^\\]]+\\] dt"), /^color:var\(--muted\)$/);
  assert.match(rule("\\.home-now\\[[^\\]]+\\] dd"), /color:var\(--ink\)$/);
  assert.match(rule("\\.work-grid"), /grid-template-columns:repeat\(2,minmax\(0,1fr\)\);gap:40px 16px$/);
  assert.match(rule("\\.project-caption"), /^display:flex;margin-top:12px;align-items:baseline;gap:8px;color:var\(--muted\);font:15px \/ 20px var\(--ui-sans\)$/);
  assert.match(rule("\\.project-caption\\[[^\\]]+\\] h3"), /color:var\(--ink\)/);
  assert.match(rule("\\.project-caption-slash"), /^color:color-mix\(in srgb,var\(--muted\) 50%,var\(--canvas\)\)$/);

  // at 980 and below the 20px margin and the stack, 24px apart; at 760 the 40px thesis and one column of cards.
  const at = (width) => css.slice(css.indexOf(`@media(width<=${width}px){.home-`));
  assert.match(rule("\\.home-page", at(980)), /^width:auto;margin-left:0;padding-inline:20px$/);
  assert.match(rule("\\.home-now", at(980)), /^flex-direction:column;margin-top:32px;gap:24px$/);
  assert.match(rule("\\.home-intro", at(980)), /padding-bottom:56px/);
  assert.match(rule("\\.home-thesis\\[[^\\]]+\\] h1", at(760)), /font-size:40px;line-height:42px/);
  assert.match(rule("\\.work-grid", at(760)), /^grid-template-columns:1fr;gap:32px$/);
  assert.match(rule("\\.home-page", at(620)), /^margin-bottom:-16px$/);
});

test("the About page is HCI-focused and renders no fake photo placeholders", () => {
  assert.match(aboutHtml, /Human-computer interaction is the thread connecting my work/);
  assert.match(aboutHtml, /iPad-first electronic medical record/);
  assert.match(aboutHtml, /USM Maryland Momentum Fund/);
  assert.match(aboutHtml, /data-about-gallery/);
  assert.doesNotMatch(aboutHtml, /placeholder/i);
});
