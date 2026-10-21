import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test, { before } from "node:test";
import assert from "node:assert/strict";
import { aboutChapters, aboutGallery, experience, getFeaturedProjects } from "../src/data/portfolio.mjs";
import { coverFields } from "../src/data/coverFields.mjs";
import { coverDevices } from "../src/data/coverDevices.mjs";
import { coverMotion } from "../src/data/coverMotion.mjs";

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

test("the Work page renders the approved thesis and the home grid project order", () => {
  assert.match(visibleText(workHtml), /I’m Ken, a product designer and data scientist\./);

  const routes = [
    "/work/elms-redesign",
    "/work/terpcarehub",
    "/work/sohive",
    "/work/ovara",
    "/work/college-park-capstone",
    "/work/terpcare",
    "/work/frontground",
    "/work/kairo-health",
  ];
  const positions = routes.map((route) => workHtml.indexOf(`href="${route}"`));

  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual([...positions].sort((a, b) => a - b), positions);
  assert.equal((workHtml.match(/class="project-card"/g) ?? []).length, 8);
  // the two macbook cards expand instead of tilting (the next tests).
  assert.equal((workHtml.match(/data-tilt-card/g) ?? []).length, 6);
  assert.equal((workHtml.match(/data-project-cover/g) ?? []).length, 8);
  assert.doesNotMatch(workHtml, /class="cover-exhibit|class="[^"]*has-exhibit/);
  // the only device frames on the grid are the two macbook covers (elms and frontground).
  assert.deepEqual([...workHtml.matchAll(/data-device-frame="([^"]+)"/g)].map(([, frame]) => frame), ["macbook", "macbook"]);
  assert.doesNotMatch(workHtml, /class="cover-scrim"|class="cover-label"/);
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

test("home grid covers are square, untitled, and a dark base under a blurred drifting colour field (figma 428:2684)", () => {
  const cards = [...workHtml.matchAll(/<a class="project-card"[\s\S]*?<\/a>/g)].map(([card]) => card);
  assert.equal(cards.length, getFeaturedProjects().length);
  for (const [index, project] of getFeaturedProjects().entries()) {
    const card = cards[index];
    const field = coverFields[project.slug];
    const cover = card.match(/<div class="project-cover[^"]*"[^>]*>/)?.[0] ?? "";
    assert.match(cover, new RegExp(`--cover-base: ${field.base}`), `${project.slug} base`);
    // the caption carries the name and year, so the cover itself has no title or category text; only a device's own
    // chrome (a status bar time, a browser address) and a motion cover's scene are text, inside aria-hidden layers.
    const coverHtml = card.slice(card.indexOf("<figure"), card.indexOf("</figure>"));
    const chrome = coverHtml.replace(/<style>[\s\S]*?<\/style>/g, "").replace(/<div class="cover-(devices|motion)[\s\S]*$/, "");
    assert.equal(chrome.replace(/<[^>]+>/g, "").trim(), "", `${project.slug} cover has no text`);
    assert.doesNotMatch(coverHtml, new RegExp(`>\\s*${project.cardTitle}\\s*<`), `${project.slug} cover has no title`);
    assert.doesNotMatch(coverHtml, new RegExp(project.category.replace(/[+]/g, "\\+")));
    const gradient = coverHtml.match(/<div class="cover-gradient"[^>]*>/)?.[0] ?? "";
    assert.match(gradient, /aria-hidden="true"/);
    assert.match(gradient, /data-cover-gradient/);
    assert.match(gradient, new RegExp(`--field-blur: ${(field.blur / 2 / 454 * 100).toFixed(3)}cqi`), `${project.slug} blur`);
    // a motion cover's blobs carry their figma node id between the class and the style.
    const spans = [...coverHtml.matchAll(/<span class="cover-field"(?: data-node="[^"]+")? style="([^"]+)"/g)].map(([, style]) => style);
    assert.equal(spans.length, field.ellipses.length, `${project.slug} one span per ellipse`);
    for (const [i, { x, y, r, colour, alpha }] of field.ellipses.entries()) {
      const box = `left: ${((x - r) / 454 * 100).toFixed(3)}%; top: ${((y - r) / 256 * 100).toFixed(3)}%; width: ${(2 * r / 454 * 100).toFixed(3)}%`;
      assert.ok(spans[i].startsWith(box), `${project.slug} ellipse ${i} box: ${spans[i]}`);
      assert.match(spans[i], new RegExp(`background: ${colour}; opacity: ${alpha};`), `${project.slug} ellipse ${i} fill`);
    }
  }

  const css = [...workHtml.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((match) => readFileSync(join(projectRoot, "dist", match[1]), "utf8")).join("\n");
  const rule = (selector, scope = css) => scope.match(new RegExp(`(?:^|[{}\\s])${selector}\\[[^\\]]+\\]\\{([^}]*)\\}`))?.[1] ?? "";
  // square corners, the base fill, and the old radial gradient fields and poster gone.
  assert.match(rule("\\.project-media"), /border-radius:0/);
  assert.match(rule("\\.project-cover"), /background:var\(--cover-base\)/);
  assert.match(rule("\\.cover-field"), /border-radius:50%/);
  assert.match(rule("\\.cover-field"), /aspect-ratio:1/);
  assert.match(rule("\\.cover-field"), /filter:blur\(var\(--field-blur\)\)/);
  assert.doesNotMatch(css, /\.cover-field[^{]*\{[^}]*radial-gradient/);
  assert.doesNotMatch(css, /--cover-poster|cover-drift-a|--cover-energy/);
  // the drift runs only when the cover is on screen (is-live) and motion is allowed; reduced motion is a still.
  const motion = css.slice(css.indexOf("@media(prefers-reduced-motion:no-preference){.cover-field"));
  assert.ok(motion.length < css.length, "the drift sits under prefers-reduced-motion: no-preference");
  assert.match(motion, /^@media\(prefers-reduced-motion:no-preference\)\{\.cover-field\[[^\]]+\]:not\(\[data-node\]\)\{[^}]*animation:cover-field-drift var\(--drift-s\) ease-in-out infinite alternate;[^}]*animation-play-state:paused/);
  assert.match(motion, /\.cover-gradient\[[^\]]+\]\.is-live \.cover-field\[[^\]]+\]\{animation-play-state:running\}/);
  assert.match(css, /@keyframes cover-field-drift\{to\{translate:var\(--drift-x\) var\(--drift-y\)\}\}/);
});

test("device covers draw figma's macbook and phones over the field and lift and fan out on hover", () => {
  const cards = new Map([...workHtml.matchAll(/<a class="project-card" href="\/work\/([^"]+)"[\s\S]*?<\/a>/g)].map(([card, slug]) => [slug, card]));
  for (const [slug, card] of cards) {
    const devices = card.match(/<div class="cover-devices is-(macbook|phones)"[^>]*>/);
    if (!coverDevices[slug]) { assert.equal(devices, null, `${slug} has no devices`); continue; }
    assert.equal(devices?.[1], coverDevices[slug].kind, `${slug} device kind`);
    assert.match(devices[0], /aria-hidden="true"/);
    assert.match(devices[0], new RegExp(`data-figma="${coverDevices[slug].figma}"`));
    // the devices sit after the field, inside the cover.
    assert.ok(card.indexOf("data-cover-gradient") < card.indexOf("cover-devices"), `${slug} devices over the field`);
    // a phone's screen is its own image; a macbook's sits in the device frame's screen, as on the elms page.
    const macbook = coverDevices[slug].kind === "macbook";
    const images = [...card.matchAll(macbook ? /<div class="device-screen"[^>]*> <picture[^>]*>\s*<img [^>]*>/g : /<img class="device-screen"[^>]*>/g)].map(([tag]) => tag);
    const screens = macbook ? [coverDevices[slug].screen] : coverDevices[slug].phones;
    assert.equal(images.length, screens.length, `${slug} screens`);
    for (const [index, { src, width, height }] of screens.entries()) {
      const attributes = macbook ? `src="${src}" alt width="${width}" height="${height}" loading="lazy" fetchpriority="auto" decoding="async"` : `src="${src}" alt="" width="${width}" height="${height}" loading="lazy" decoding="async"`;
      assert.match(images[index], new RegExp(attributes), `${slug} screen ${index}`);
    }
  }
  // terpcarehub's phones are its motion cover's now; sohive and terpcare keep three device phones with islands.
  assert.doesNotMatch(cards.get("terpcarehub"), /cover-devices|device-phone/);
  for (const slug of ["sohive", "terpcare"]) {
    assert.deepEqual([...cards.get(slug).matchAll(/<div class="device-phone is-(left|right|center)\b/g)].map(([, slot]) => slot), ["left", "right", "center"], slug);
    assert.equal([...cards.get(slug).matchAll(/class="phone-island"/g)].length, 3, slug);
  }
  assert.doesNotMatch(workHtml, /phone-status/);
  // elms leads the grid. elms and frontground are figma's Device/Laptop instances (528:12385, 528:12392): 384 by 207.36
  // at x 35 and y 28 on the 454 cover, drawn by the elms page's macbook frame (lid and camera, bezel, base and notch,
  // floor shadow), with no browser chrome; the macbook expands on hover (the next test).
  const elms = cards.get("elms-redesign");
  assert.equal([...cards.keys()][0], "elms-redesign");
  assert.match(elms, /<h3[^>]*>ELMS Redesign<\/h3>[\s\S]*?2026/);
  for (const slug of ["elms-redesign", "frontground"]) {
    const card = cards.get(slug);
    assert.match(card, /<div class="device-macbook device-center"[^>]*style="left: 7\.709cqi; top: 6\.167cqi; width: 84\.581cqi; height: 45\.674cqi"/, slug);
    assert.match(card, /<div class="device-frame frame-macbook" data-device-frame="macbook"/, slug);
    for (const part of ["macbook-shadow", "macbook-lid", "macbook-camera", "macbook-base", "macbook-notch"]) assert.match(card, new RegExp(`class="${part}"`), `${slug} ${part}`);
    assert.doesNotMatch(card, /browser-(chrome|light|address)/, slug);
  }

  const css = [...workHtml.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((match) => readFileSync(join(projectRoot, "dist", match[1]), "utf8")).join("\n");
  // the centre phone lifts 8px and the side phones fan out 6px, as the layer names say; reduced motion keeps them still.
  const hover = css.slice(css.indexOf("@media(prefers-reduced-motion:no-preference){.project-card:is(:hover,:focus-visible) .device-phone"));
  assert.ok(hover.length < css.length, "hover moves sit under prefers-reduced-motion: no-preference");
  assert.match(hover, /^@media\(prefers-reduced-motion:no-preference\)\{\.project-card:is\(:hover,:focus-visible\) \.device-phone\[[^\]]+\]\.device-center\{translate:0 -8px\}/);
  assert.match(hover, /\.project-card:is\(:hover,:focus-visible\) \.device-phone\[[^\]]+\]\.is-left\{translate:-6px\}/);
  assert.match(hover, /\.project-card:is\(:hover,:focus-visible\) \.device-phone\[[^\]]+\]\.is-right\{translate:6px\}/);
  assert.match(css, /\.device-phone\[[^\]]+\]\{[^}]*box-shadow:0 3\.965cqi 8\.811cqi #00000059/);
  // the macbook draws its own floor shadow (figma's 16 layer blur is css blur 8 at the component's 1000 width) and takes no box shadow.
  assert.match(css, /\.macbook-shadow\[[^\]]+\]\{[^}]*filter:blur\(\.8cqw\)/);
  assert.doesNotMatch(css, /\.device-macbook\[[^\]]+\]\{[^}]*box-shadow/);
});

test("the elms and frontground macbooks expand as figma's demo timelines draw it, and only they do", () => {
  const cards = new Map([...workHtml.matchAll(/<a class="project-card" href="\/work\/([^"]+)"[\s\S]*?<\/a>/g)].map(([card, slug]) => [slug, card]));
  const macbooks = Object.keys(coverDevices).filter((slug) => coverDevices[slug].kind === "macbook");
  assert.deepEqual(macbooks, ["elms-redesign", "frontground"]);
  for (const [slug, card] of cards) {
    const macbook = macbooks.includes(slug);
    assert.equal(/class="device-macbook\b/.test(card), macbook, `${slug} macbook`);
    assert.equal(/data-devices="macbook"/.test(card), macbook, `${slug} marks its cover for the field`);
    // the 3d tilt would blur the scaled screen, so a macbook card takes no tilt or shine; phone and motion cards keep both.
    assert.equal(/^<a class="project-card"[^>]* data-tilt-card[\s>=]/.test(card), !macbook, `${slug} tilt`);
  }

  // every rule with its enclosing at-rule, from the minified build.
  const css = [...workHtml.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((match) => readFileSync(join(projectRoot, "dist", match[1]), "utf8")).join("\n");
  const rules = [];
  const stack = [];
  let start = 0;
  for (let index = 0; index < css.length; index += 1) {
    if (css[index] === "{") {
      const prelude = css.slice(start, index).trim();
      const close = css.indexOf("}", index);
      const nested = css.indexOf("{", index + 1);
      if (prelude.startsWith("@") && !prelude.startsWith("@font-face")) stack.push(prelude);
      else if (nested === -1 || close < nested) { rules.push({ media: stack.join(" "), selector: prelude, body: css.slice(index + 1, close) }); index = close; }
      else stack.push(prelude);
      start = index + 1;
    } else if (css[index] === "}") { stack.pop(); start = index + 1; }
  }
  // keyframe stops are not rules a card state applies (terpcarehub's find care card scales in from 1.12), so they are skipped.
  const expanded = rules.filter(({ media, body }) => !media.startsWith("@keyframes") && /scale:1\.(12|06)/.test(body));
  // in cover units: scale 1.12 and 50px down on the 454 cover (11.013cqi) for the macbook, scale 1.06 for its field, on
  // focus, on click (is-expanding), and on hover only where a pointer hovers. all of it sits under no-preference.
  assert.deepEqual(expanded.map(({ selector }) => selector.replace(/\[data-astro-cid-\w+\]/g, "")).sort(), [
    ".project-card:hover .device-macbook",
    ".project-card:hover .project-cover[data-devices=macbook] .cover-gradient",
    ".project-card:is(:focus-visible,.is-expanding) .device-macbook",
    ".project-card:is(:focus-visible,.is-expanding) .project-cover[data-devices=macbook] .cover-gradient",
  ]);
  for (const { media, selector, body } of expanded) {
    assert.match(media, /prefers-reduced-motion:no-preference/, selector);
    assert.equal(/:hover/.test(selector), /\(hover:hover\)/.test(media), `${selector} hover only where a pointer hovers`);
    if (selector.includes("device-macbook")) assert.equal(body, "translate:0 11.013cqi;scale:1.12;transition-timing-function:cubic-bezier(.16,1,.3,1)");
    else assert.equal(body, "scale:1.06;transition:scale .8s cubic-bezier(.16,1,.3,1)");
  }
  // the tilt transform and the shine only reach cards that still carry data-tilt-card.
  const tilt = rules.filter(({ body }) => /--tilt-x/.test(body));
  assert.ok(tilt.length > 0);
  const tilted = (selector) => selector.replace(/\[data-astro-cid-\w+\]/g, "");
  for (const { selector } of tilt) assert.equal(tilted(selector), ".project-card[data-tilt-card] .project-media");
  const shine = rules.filter(({ selector, body }) => /project-media[^ ]*:after/.test(selector) && /opacity:1/.test(body));
  assert.deepEqual(shine.map(({ selector }) => tilted(selector)), [".project-card[data-tilt-card]:hover .project-media:after,.project-card[data-tilt-card]:focus-visible .project-media:after"]);
  // coming back: 0.7s on the ease in out curve for both.
  const rest = (pattern) => rules.find(({ selector, body }) => pattern.test(selector) && body.startsWith("transition"));
  assert.equal(rest(/^\.device-macbook\[[^\]]+\]$/)?.body, "transition:translate .7s cubic-bezier(.65,0,.35,1),scale .7s cubic-bezier(.65,0,.35,1)");
  assert.match(rest(/^\.device-macbook\[[^\]]+\]$/).media, /prefers-reduced-motion:no-preference/);
  assert.equal(rest(/^\.project-cover\[[^\]]+\]\[data-devices=macbook\] \.cover-gradient\[[^\]]+\]$/)?.body, "transition:scale .7s cubic-bezier(.65,0,.35,1)");
  // the macbook no longer takes the 8px lift; the phones keep it and their fan.
  for (const { selector, body } of rules.filter(({ body }) => /translate:0 -8px/.test(body))) assert.match(selector, /\.device-phone\[[^\]]+\]\.device-center$/, body);
  assert.ok(!rules.some(({ selector }) => /device-macbook/.test(selector) && !/^(\.project-card:(hover|is\(:focus-visible,\.is-expanding\)) )?\.device-macbook\[[^\]]+\]$/.test(selector)), "no other rule moves the macbook");

  // the click handler: the shipped script adds is-expanding to a macbook card and clears it on a back forward cache return.
  const scripts = [...workHtml.matchAll(/<script type="module" src="([^"]+)"/g)].map((match) => readFileSync(join(projectRoot, "dist", match[1]), "utf8")).join("\n");
  assert.match(scripts, /\.project-card:has\(\.cover-devices\.is-macbook\)/);
  assert.match(scripts, /classList\.add\(["`]is-expanding["`]\)/);
  assert.match(scripts, /pageshow/);
});

test("motion covers render figma's v4 layers and loop their timelines only on screen, holding a still under reduced motion", () => {
  const cards = new Map([...workHtml.matchAll(/<a class="project-card" href="\/work\/([^"]+)"[\s\S]*?<\/a>/g)].map(([card, slug]) => [slug, card]));
  for (const [slug, card] of cards) {
    const motion = card.match(/<div class="cover-motion"[^>]*>/)?.[0];
    if (!coverMotion[slug]) { assert.equal(motion, undefined, `${slug} has no motion layer`); continue; }
    assert.match(motion, /aria-hidden="true"/);
    assert.match(motion, new RegExp(`data-cover-motion="${slug}"`));
    assert.match(motion, new RegExp(`data-figma="${coverMotion[slug].figma}"`));
    assert.match(card, new RegExp(`<div class="project-cover[^"]*"[^>]*data-motion="${slug}"`));
    // the field blobs and the dot grid sit inside the cover, and every animated figma node is in the card once.
    const ids = [...card.matchAll(/data-node="([^"]+)"/g)].map(([, node]) => node);
    assert.equal(new Set(ids).size, ids.length, `${slug} node ids are unique`);
    for (const node of coverMotion[slug].field) assert.match(card, new RegExp(`<span class="cover-field"[^>]*data-node="${node}"`));
    // every motion cover but terpcarehub's lays the dot grid over its field.
    assert.equal(/<img class="cm-layer"[^>]*src="\/images\/exhibits\/cover-dot-grid\.svg"/.test(card), slug !== "terpcarehub", `${slug} dot grid`);
  }
  const capstone = cards.get("college-park-capstone");
  assert.match(capstone, />Diana</);
  assert.match(capstone, />JOURNEY · BRUCE</);
  assert.doesNotMatch(capstone, /Maria|Tyler/);
  // path trims draw on the inline paths; the cursors are svg files.
  assert.match(capstone, /<path data-node="482:10778" pathLength="1"/);
  assert.match(capstone, /<path data-node="482:11286" pathLength="1"/);
  assert.match(capstone, /<img class="cm-layer" src="\/images\/exhibits\/cover-cursor\.svg"[^>]*data-node="482:10780"/);
  const ovara = cards.get("ovara");
  for (const figure of [">Cass County<", ">Critical · 0.92 providers / 100k<", ">108,205<", ">Missouri · FIPS 29037<", ">Livingston Parish<", ">1.39<", ">1,029<", ">10.9M RESIDENTS<"]) assert.ok(ovara.includes(figure), `ovara card shows ${figure}`);
  assert.doesNotMatch(ovara, />Arkansas<|>20\.5<|>U\.S\. 30\.06</);
  assert.equal([...ovara.matchAll(/data-node="550:\d+"[^>]*style="left: [\d.]+cqi; top: [\d.]+cqi; width: 2\.423cqi; height: 2\.423cqi; background: #/g)].length, 224, "112 tiles over 112 bases");
  const kairo = cards.get("kairo-health");
  for (const value of [">55 of 56<", ">Extract<", ">20/03/2022<", ">Z0/O3/2O2Z<"]) assert.ok(kairo.includes(value), `kairo card shows ${value}`);
  // terpcarehub (584:18068): the real screens are image layers, the two checks draw in, and the search types flu shot.
  const hub = cards.get("terpcarehub");
  for (const value of [">flu shot<", ">University Health Center<", ">Booked · Today 2:40 PM<", ">Booked in two taps<", ">Plan accepted<", ">$0 copay<", ">Add to calendar<", ">ALERTS<", ">FIND CARE<", ">PROGRAMS<"]) assert.ok(hub.includes(value), `terpcarehub card shows ${value}`);
  for (const screen of ["terpcarehub-cover-home", "terpcarehub-cover-find-care", "terpcarehub-cover-wellness", "mobile-provider-detail", "mobile-booking-confirmed"]) {
    assert.match(hub, new RegExp(`<img class="cm-layer" src="/images/work/terpcarehub/${screen}\\.png"[^>]*style="[^"]*object-fit: cover`), screen);
  }
  assert.match(hub, /<path data-node="584:18138" pathLength="1"/);
  assert.match(hub, /<path data-node="585:18626" pathLength="1"/);

  // the keyframes ship in one stylesheet for the home page only, keyed by figma node id, on figma's loop lengths.
  const stylesheets = (html) => [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((match) => readFileSync(join(projectRoot, "dist", match[1]), "utf8")).join("\n");
  const css = stylesheets(workHtml);
  // terpcarehub's scene frame has no camera of its own, so its centre phone stands in: the first layer that fades.
  for (const [slug, seconds, scene] of [["college-park-capstone", "13.6s", "482:10762"], ["ovara", "13.6s", "550:12080"], ["kairo-health", "13.2s", "485:11658"], ["terpcarehub", "21s", "585:18527"]]) {
    const scope = `\\.project-cover\\[data-motion=${slug}\\]`;
    assert.match(css, new RegExp(`${scope}\\{--u: ?calc\\(100cqi / 454\\)\\}`), `${slug} unit`);
    assert.match(css, new RegExp(`${scope} \\[data-node="${scene}"\\]\\{animation:kf_${scene.replace(":", "_")}_opacity_0 ${seconds.replace(".", "\\.")} linear[,;}]`), `${slug} scene camera`);
    // off screen the timeline holds; reduced motion holds the still frame on the timeline's own length.
    assert.match(css, new RegExp(`${scope} :is\\(\\.cover-gradient,\\s?\\.cover-motion\\):not\\(\\.is-live\\) \\[data-node\\]\\{animation-play-state:paused\\}`), `${slug} pauses off screen`);
    const still = `-${coverMotion[slug].still}s`.replace(".", "\\.");
    assert.match(css, new RegExp(`@media ?\\(prefers-reduced-motion:\\s?reduce\\)\\{${scope} \\[data-node\\]\\[data-node\\]\\{animation-duration:${seconds.replace(".", "\\.")}!important;animation-iteration-count:infinite!important;animation-delay:${still};animation-play-state:paused\\}`), `${slug} reduced motion still`);
  }
  assert.match(css, /@keyframes kf_482_10778_path-trim_0\{0%\{stroke-dasharray:0 1;visibility:hidden\}/);
  assert.match(css, /@keyframes kf_550_13295_translate_0\{0%\{translate:0px 0px\}/);
  // the batch 1 step keyframes and the inline per cover styles are gone.
  assert.doesNotMatch(workHtml, /cm-anim|@keyframes cm-/);
  // the field drift skips the blobs that follow figma's timeline.
  assert.match(css, /\.cover-field\[[^\]]+\]:not\(\[data-node\]\)\{animation:cover-field-drift/);
  // no other page loads the cover timelines.
  assert.doesNotMatch(stylesheets(aboutHtml), /kf_(48[245]|549|550|58[45])_/);
  assert.doesNotMatch(stylesheets(readFileSync(join(projectRoot, "dist", "work", "ovara", "index.html"), "utf8")), /kf_(48[245]|549|550|58[45])_/);
  const script = readFileSync(join(projectRoot, "src/scripts/exhibits.ts"), "utf8");
  assert.match(script, /querySelectorAll<HTMLElement>\("\[data-cover-gradient\], \[data-cover-motion\]"\)/);
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
  const text = visibleText(aboutHtml);
  assert.match(text, /I’m a Master of Science in Human-Computer Interaction student at the University of Maryland, and I start projects by learning how people actually navigate a system before I decide what to build, measure, or recommend\./);
  assert.match(text, /I was born in Monrovia, Liberia, where many clinics still run on paper\. That gap pulled me toward healthcare access, product research, and the decisions behind both\./);
  assert.match(aboutHtml, /USM Maryland Momentum Fund/);
  assert.match(aboutHtml, /data-about-gallery/);
  assert.doesNotMatch(aboutHtml, /placeholder/i);
});

test("about v3 follows figma 255:1842: header, experience, education, interests and four photo chapters", () => {
  const text = visibleText(aboutHtml);
  // no visible headline: an sr-only h1 carries the heading, under the "ABOUT ME" eyebrow.
  assert.match(aboutHtml, /<h1 class="sr-only"[^>]*>About Kenneth Yeaher<\/h1>/);
  assert.match(aboutHtml, /class="about-eyebrow"[^>]*>About me</);
  assert.equal((aboutHtml.match(/<h1[\s>]/g) ?? []).length, 1);
  assert.doesNotMatch(text, /Human-computer interaction is the thread connecting my work|iPad-first electronic medical record/);
  assert.match(text, /Open to product, venture, data, and HCI opportunities where research can shape what gets built\./);
  assert.doesNotMatch(aboutHtml, /—/, "no em dashes");

  // practice areas, the long role list, credentials and the old grid are gone.
  const headings = [...aboutHtml.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map(([, heading]) => heading.trim());
  assert.deepEqual(headings, ["Experience", "Education", "Beyond the work", "Photos"]);
  assert.doesNotMatch(text, /Practice areas|Credentials|Photo journal/);
  assert.doesNotMatch(aboutHtml, /gallery-grid|role-bullets|cred-row/);

  // six experience rows: year, company, role.
  const rows = [...aboutHtml.matchAll(/<li class="experience-row"[^>]*>\s*<span[^>]*>([^<]+)<\/span>\s*<span[^>]*>([^<]+)<\/span>\s*<span[^>]*>([^<]+)<\/span>\s*<\/li>/g)].map((match) => match.slice(1).join(" | "));
  assert.deepEqual(rows, experience.map((row) => `${row.year} | ${row.organization} | ${row.role}`));

  // education: the MS is expected in 2028 with the new course order, the BS drops INST346, and no course notes.
  assert.match(text, /Master of Science, Human-Computer Interaction University of Maryland · Expected May 2028/);
  assert.match(text, /Bachelor of Science, Information Science University of Maryland · Graduated Dec 2024/);
  const codes = [...aboutHtml.matchAll(/<span class="course-code"[^>]*>([^<]+)<\/span>/g)].map(([, code]) => code);
  assert.deepEqual(codes, ["INST630", "INST631", "INST711", "INST737", "INST762", "INST610", "BMGT468R", "INST402", "INST408A", "INST362", "INST327", "INST314", "INST326"]);
  assert.doesNotMatch(text, /INST346|Notable courses|End to end data science pipeline/);

  // beyond the work: six interests, sports now travels for matches whenever it can.
  assert.equal((aboutHtml.match(/class="interest"/g) ?? []).length, 6);
  assert.match(text, /a massive Maryland Lacrosse fan\. I travel for matches whenever I can\./);

  // four chapters, each with its counter, title, line and photos in order, every photo carrying its gallery alt.
  const alts = new Map(aboutGallery.map((item) => [item.src, item.alt]));
  const chapters = [...aboutHtml.matchAll(/<article class="about-chapter"([^>]*)>([\s\S]*?)<\/article>/g)];
  assert.equal(chapters.length, 4);
  assert.deepEqual(aboutChapters.map((chapter) => chapter.title), ["On the field", "In the room", "With my people", "On the road"]);
  chapters.forEach(([, attributes, body], index) => {
    const chapter = aboutChapters[index];
    assert.match(body, new RegExp(`class="chapter-counter"[^>]*>0${index + 1} / 04<`));
    assert.match(body, new RegExp(`<h3 class="chapter-title"[^>]*>${chapter.title}</h3>`));
    assert.ok(visibleText(body).includes(chapter.line), `${chapter.title} line`);
    const images = [...body.matchAll(/<img src="([^"]+)" alt="([^"]*)"/g)];
    assert.deepEqual(images.map(([, src]) => src), [chapter.lead, ...chapter.rows.flat()].map((id) => `/images/about/${id}.jpg`));
    for (const [, src, alt] of images) {
      assert.ok(alts.get(src), `${src} has gallery alt text`);
      assert.equal(alt.replaceAll("&#39;", "'"), alts.get(src));
    }
    // chapter 01 ships unlocked; the rest lock only once the script runs.
    assert.equal(/\sdata-unlocked/.test(attributes), index === 0, `${chapter.title} unlocked state`);
  });
  // the On the field lead shows "Coast to coast" in the cursor chip; its alt stays for screen readers, and no other photo has a chip.
  assert.deepEqual(aboutGallery.filter((item) => item.chip).map((item) => [item.src, item.chip]), [["/images/about/about-03.jpg", "Coast to coast"]]);
  assert.equal(alts.get("/images/about/about-03.jpg"), "Carrying the ball upfield in a lacrosse game");
  assert.deepEqual([...aboutHtml.matchAll(/<figure class="chapter-photo[^"]*"[^>]*data-cursor-label="([^"]*)"[^>]*>\s*<img src="([^"]+)"/g)].map(([, label, src]) => [src, label]), [["/images/about/about-03.jpg", "Coast to coast"]]);
  assert.equal(aboutChapters[0].line, "You’ll either catch me on the lax field saving shots or on the football pitch doing my best Kanté impression.");
  assert.equal(aboutChapters[3].line, "Old Trafford in Manchester, live music at The Dubliner, a night on the beach, and a window seat after dark.");

  // locking lives only under no-preference motion, so reduced motion (and no script) shows every chapter.
  const css = [...aboutHtml.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((match) => readFileSync(join(projectRoot, "dist", match[1]), "utf8")).join("\n");
  const locked = [...css.matchAll(/\.chapters-ready/g)].map((match) => match.index);
  assert.ok(locked.length > 0, "chapter lock rules exist");
  const motionBlocks = [...css.matchAll(/@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{/g)].map((match) => {
    let depth = 1;
    let end = match.index + match[0].length;
    while (depth > 0 && end < css.length) depth += css[end] === "{" ? 1 : css[end] === "}" ? -1 : 0, end += 1;
    return [match.index, end];
  });
  for (const position of locked) {
    assert.ok(motionBlocks.some(([start, end]) => position > start && position < end), `.chapters-ready rule at ${position} sits outside the no-preference block`);
  }
  const script = [...aboutHtml.matchAll(/<script type="module" src="([^"]+)"/g)].map((match) => readFileSync(join(projectRoot, "dist", match[1]), "utf8")).join("\n");
  assert.match(script, /chapters-ready/);
});

test("every About photo offers its sized webp copies with sizes that match its width in the chapter layout", () => {
  const manifest = JSON.parse(readFileSync(join(projectRoot, "src", "data", "about-sizes.json"), "utf8"));
  const gallery = new Map(aboutGallery.map((item) => [item.src.split("/").pop().replace(/\.jpg$/, ""), item]));
  // the photo column is 584px from 1068 up, the about column less the 340px text column and the rail's 96px under
  // that, and the full about column (20px margins) at 980 and below. a row shares the column, less its 12px gaps, by
  // each photo's aspect ratio; a lead takes its share of the column.
  const desktop = "min(584px, 100vw - 484px)";
  const phone = "100vw - 40px";
  const width = (column, share, gaps) => (share === 1 && gaps === 0 ? column : `calc(${gaps ? `(${column} - ${gaps}px)` : `(${column})`} * ${share.toFixed(4)})`);
  const expected = aboutChapters.flatMap((chapter) => {
    const lead = chapter.leadWidth ?? 1;
    const rows = chapter.rows.flatMap((row) => {
      const total = row.reduce((sum, id) => sum + gallery.get(id).width / gallery.get(id).height, 0);
      return row.map((id) => [id, (gallery.get(id).width / gallery.get(id).height) / total, (row.length - 1) * 12]);
    });
    return [[chapter.lead, lead, 0], ...rows];
  }).map(([id, share, gaps]) => {
    const onPhone = width(phone, share, gaps);
    return { id, sizes: `(max-width: 980px) ${onPhone.startsWith("calc") ? onPhone : `calc(${onPhone})`}, ${width(desktop, share, gaps)}` };
  });
  const images = [...aboutHtml.matchAll(/<img src="\/images\/about\/[^"]+"[^>]*>/g)].map(([tag]) => tag);
  assert.equal(images.length, expected.length);
  images.forEach((tag, index) => {
    const { id, sizes } = expected[index];
    const item = gallery.get(id);
    const attr = (name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
    // the jpeg stays the src for anything that skips srcset, with its size, alt, lazy loading and async decoding.
    assert.equal(attr("src"), `/images/about/${id}.jpg`);
    assert.equal(attr("width"), String(item.width));
    assert.equal(attr("height"), String(item.height));
    assert.equal(attr("loading"), "lazy", `${id} loads lazily; chapter 01 sits below the fold`);
    assert.equal(attr("decoding"), "async");
    assert.equal(attr("srcset"), manifest[id].map((w) => `/images/about/sized/${id}-${w}.webp ${w}w`).join(", "), `${id} srcset`);
    assert.equal(attr("sizes"), sizes, `${id} sizes`);
  });
});
