import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test, { before } from "node:test";
import assert from "node:assert/strict";

import { getProjectBySlug, projects } from "../src/data/portfolio.mjs";
import * as sendBar from "../src/components/exhibits/elms-send-bar.mjs";

// the elms redesign case study, from figma 413:2396 ("Case study v3 / ELMS Messages"). its screens are the frame's own
// fills with the placeholder people repainted to dc names; the whole path card plays figma's send path loop (504:11596)
// in html over the repainted screens, and the other loop cards hold stills until recordings exist.
const projectRoot = new URL("..", import.meta.url).pathname;
let page = "";
const pages = new Map();

before(() => {
  execFileSync("npm", ["run", "build"], { cwd: projectRoot, encoding: "utf8", stdio: "pipe" });
  for (const project of projects) pages.set(project.slug, readFileSync(join(projectRoot, "dist", "work", project.slug, "index.html"), "utf8"));
  page = pages.get("elms-redesign");
});

/** the page's text as it reads: styles, scripts and tags stripped, entities for quotes decoded. */
function textOf(html) {
  return html.replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ")
    .replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

/** the html of one chapter, from its section to the next chapter's. */
function chapter(id) {
  const start = page.indexOf(`<section id="${id}"`);
  assert.ok(start >= 0, `no ${id} chapter`);
  const next = page.indexOf("data-case-section", page.indexOf(">", start));
  return page.slice(start, next < 0 ? undefined : next);
}

test("the send bar is incomplete until someone is chosen, the × undoes it, and Send another starts over", () => {
  const detail = { person: "Barry Allen · TA", course: "INST711", time: "10:34 AM" };
  let state = sendBar.createSendBar();
  assert.equal(state, "incomplete");
  assert.deepEqual(sendBar.sendButton(state), { label: "Send message", disabled: true });
  assert.equal(sendBar.barText(state, detail), "Required: choose who gets this message.");
  // Send does nothing until a person is named.
  assert.equal(sendBar.send(state), "incomplete");
  state = sendBar.choose(state);
  assert.equal(state, "ready");
  assert.equal(sendBar.barText(state, detail), "Sending to Barry Allen · TA · INST711 · 1 recipient");
  assert.deepEqual(sendBar.sendButton(state), { label: "Send message", disabled: false });
  assert.equal(sendBar.remove(state), "incomplete");
  state = sendBar.send(state);
  assert.equal(state, "sent");
  assert.equal(sendBar.barText(state, detail), "✓  Message sent to Barry Allen · TA · INST711 at 10:34 AM");
  assert.deepEqual(sendBar.sendButton(state), { label: "Send another", disabled: false });
  assert.equal(sendBar.send(state), "incomplete");
});

test("elms follows figma 413:2396: seven rail chapters, the award on the hero, Figma's metrics and its parts in order", () => {
  const project = getProjectBySlug("elms-redesign");
  assert.deepEqual([project.title, project.cardTitle, project.year], ["ELMS Redesign", "ELMS Redesign", "2026"]);
  const ids = [...page.matchAll(/<section[^>]*\bid="([^"]+)"[^>]*data-case-section/g)].map((match) => match[1]);
  assert.deepEqual(ids, ["overview", "the-gap", "round-one", "the-pivot", "core-flow", "what-changed", "reflection"]);
  assert.deepEqual(project.exhibits.map(({ chapter }) => chapter), ["Overview", "The gap", "Round one", "The pivot", "Core flow", "What changed", "Reflection"]);
  assert.match(page, /<h1 id="case-title"[^>]*>ELMS Redesign<\/h1>/);
  assert.match(page, /class="kpi-eyebrow"[^>]*>INST711 CLASS AWARD<\/p>\s*<p class="kpi-value"[^>]*>Best UI<\/p>\s*<p class="kpi-label"[^>]*>for the final project<\/p>/);
  assert.match(page, /data-device-frame="macbook"/);
  assert.deepEqual(project.exhibits[0].metrics.map(({ value }) => value), ["5/6", "9", "26"]);
  assert.equal(project.exhibits[0].metrics[2].label, "components built from ELMS colors and type");

  // the gap: six steps, five that add doubt, each finding the button's description; then the reframe card.
  const gap = chapter("the-gap");
  assert.equal([...gap.matchAll(/<button type="button" class="doubt-step/g)].length, 6);
  assert.equal([...gap.matchAll(/class="doubt-step is-clear"/g)].length, 1);
  for (const n of ["01", "02", "03", "04", "05", "06"]) assert.match(gap, new RegExp(`aria-describedby="the-gap-finding-${n}"[\\s\\S]*?<p class="doubt-finding" id="the-gap-finding-${n}"`));
  assert.match(gap, /<s\b[^>]*>“The compose button needs a label\.”<\/s>/);
  assert.equal([...gap.matchAll(/<dt\b/g)].length, 4);

  // round one: four filter chips over ten ideas, four paper photos, then the mid-fi stage and its two leaders.
  const round = chapter("round-one");
  assert.deepEqual([...round.matchAll(/data-filter="([^"]+)"/g)].map((match) => match[1]), ["all", "built", "parked", "set-aside"]);
  assert.match(round, /aria-pressed="true"[^>]*data-filter="all"/);
  assert.equal([...round.matchAll(/class="idea is-/g)].length, 10);
  assert.equal([...round.matchAll(/class="idea is-built"/g)].length, 4);
  assert.equal([...round.matchAll(/<a class="paper-photo" href="\/images\/work\/elms-redesign\/elms-paper-/g)].length, 4);
  assert.ok(round.indexOf("ideas-grid") < round.indexOf("papers-grid") && round.indexOf("papers-grid") < round.indexOf("exhibit-stage"));
  assert.equal([...round.matchAll(/class="annotation annotation-leader/g)].length, 2);

  // the pivot: the seven step timeline with its critique, the model toggle on email, then the two wireframe stills.
  const pivot = chapter("the-pivot");
  assert.equal([...pivot.matchAll(/<li class="is-critique/g)].length, 1);
  assert.equal([...pivot.matchAll(/class="process-node"/g)].length, 7);
  assert.match(pivot, /aria-pressed="true"[^>]*data-option="email"/);
  assert.match(pivot, /data-window="chat" hidden/);
  assert.match(pivot, /WIREFRAME · ROUND ONE/);
  assert.ok(pivot.indexOf("process-steps") < pivot.indexOf("data-model-toggle") && pivot.indexOf("data-model-toggle") < pivot.indexOf("loop-exhibit"));

  // core flow: the browser with four leaders, its caption, the send bar, the two cards, then the whole path part.
  const core = chapter("core-flow");
  assert.equal([...core.matchAll(/class="annotation annotation-leader/g)].length, 4);
  assert.equal([...core.matchAll(/class="annotation annotation-leader is-vertical is-above/g)].length, 1);
  assert.match(core, /<button type="button" class="send-button" disabled data-send-button[^>]*>Send message<\/button>/);
  assert.match(core, /<h3 id="core-flow-part-heading"[^>]*>Eight screens, one direction<\/h3>/);
  // the send path's caption and the four steps it plays.
  assert.deepEqual([...core.matchAll(/<span class="step-text"[^>]*>([^<]+)<\/span>/g)].map((match) => match[1]), ["Choose a course", "Choose the TA", "Send", "Sent"]);
  assert.ok(core.indexOf("exhibit-caption") < core.indexOf("data-send-bar") && core.indexOf("data-send-bar") < core.indexOf("loop-exhibit"));

  // what changed: four destinations, the hi-fi row tinted, closed by its label and note.
  const changed = chapter("what-changed");
  assert.equal([...changed.matchAll(/<th scope="col"[^>]*>\s*<span class="journey-number"/g)].length, 4);
  assert.match(changed, /<tr class="is-accent-row"[^>]*>\s*<th scope="row"[^>]*>HI-FI PROTOTYPE<\/th>/);
  assert.match(changed, /FOUR ROUNDS  ·  AUDIT, PAPER, WIREFRAMES, HI-FI/);
  // the next project is the capstone, the first card in the home order.
  assert.match(page, /class="next-link" href="\/work\/college-park-capstone"/);
});

test("placeholder people are dc characters on the screens and in the copy, and the professor's advice is paraphrased", () => {
  const text = textOf(page);
  const alts = [...page.matchAll(/\balt="([^"]*)"/g)].map((match) => match[1]).join(" ");
  for (const name of ["Alex", "Morgan", "Rivera", "Maya", "Chen"]) {
    assert.doesNotMatch(text, new RegExp(`\\b${name}\\b`), name);
    assert.doesNotMatch(alts, new RegExp(`\\b${name}\\b`), name);
  }
  assert.match(text, /Barry Allen · TA/);
  assert.match(text, /Picking Barry only fills To/);
  // the advice is told in the first person, never quoted.
  const pivot = getProjectBySlug("elms-redesign").exhibits.find(({ id }) => id === "the-pivot").lede[0];
  assert.match(pivot, /my professor gave me the best advice of the project: do not stop at a better email form\./);
  assert.doesNotMatch(pivot, /[“”"]/);
  // the repaint keeps the originals in .private for an undo (there is no .private in ci).
  const originals = join(projectRoot, ".private", "elms-originals");
  if (existsSync(originals)) for (const file of ["core-1.png", "core-2.png", "core-3.png", "path-loop.png", "wf-thread@2x.png"]) assert.ok(existsSync(join(originals, file)), file);
});

test("the stills keep an empty loop slot, and the whole path plays the send path loop with the only loop tag", () => {
  const project = getProjectBySlug("elms-redesign");
  const cards = project.exhibits.flatMap((exhibit) => [...(exhibit.loops?.visuals ?? []), ...(exhibit.part?.loops.visuals ?? [])]);
  assert.equal(cards.length, 5);
  // each one a distinct screen; the four stills have no loop yet, and the last is the send path.
  assert.equal(new Set(cards.map(({ src }) => src)).size, 5);
  for (const card of cards) assert.ok(existsSync(join(projectRoot, "public", card.src)), card.src);
  assert.deepEqual(cards.slice(0, 4).map(({ loop }) => loop), [null, null, null, null]);
  assert.deepEqual(cards[4].loop, { motion: "elms-send-path", name: "send path" });
  assert.equal([...page.matchAll(/<img class="loop-still-card"/g)].length, 4);
  assert.doesNotMatch(page, /<video/);
  // one tag, on the send path, with its pause control; the numbers stay 01 to 03.
  assert.deepEqual([...page.matchAll(/LOOP · \d+s/g)].map(([tag]) => tag), ["LOOP · 16s"]);
  assert.equal([...page.matchAll(/data-loop-toggle/g)].length, 1);
  assert.match(page, /<button class="loop-toggle"[^>]*aria-controls="clip-send-path-loop"/);
  assert.deepEqual([...page.matchAll(/<p class="loop-num"[^>]*>([^<]+)<\/p>/g)].map((match) => match[1]), ["MID-FI 01", "MID-FI 02", "01", "02", "03"]);
  assert.match(page, /<p class="exhibit-caption-title"[^>]*>The send path<\/p>|>The send path</);
});

test("the send path is figma 504:11596 in html: the four repainted screens under real overlays, on the camera's timeline", () => {
  const frame = page.match(/<div class="motion-loop" id="clip-send-path-loop"[^>]*>/)?.[0] ?? "";
  assert.match(frame, /role="img"/);
  assert.match(frame, /aria-label="The ELMS send path, looping: [^"]*Barry Allen, TA[^"]*"/);
  assert.match(frame, /data-motion-loop="elms-send-path"/);
  assert.match(frame, /data-figma="504:11596"/);
  assert.match(frame, /aspect-ratio: 960 \/ 540/);
  // every animated figma node is on the page, from the camera to the cursor.
  const { nodes } = JSON.parse(readFileSync(join(projectRoot, "scripts", "cover-motion", "elms-send-path.motion.json"), "utf8"));
  assert.equal(nodes.length, 43);
  for (const { nodeId } of nodes) assert.match(page, new RegExp(`data-node="${nodeId}"`), nodeId);
  // the screens are the repaints at figma's 2880 by 2152, in order, and the overlays are text, not pictures of it.
  const screens = [...page.matchAll(/src="\/images\/work\/elms-redesign\/(elms-send-path-[^"]+\.webp)"/g)].map((match) => match[1]);
  assert.deepEqual(screens, ["elms-send-path-1-course.webp", "elms-send-path-2-no-recipient.webp", "elms-send-path-3-ready.webp", "elms-send-path-4-sent.webp"]);
  for (const name of screens) {
    const webp = readFileSync(join(projectRoot, "public", "images", "work", "elms-redesign", name));
    // vp8 or vp8x, the canvas size sits at a known offset.
    const vp8x = webp.toString("latin1", 12, 16) === "VP8X";
    const [width, height] = vp8x ? [1 + webp.readUIntLE(24, 3), 1 + webp.readUIntLE(27, 3)] : [webp.readUInt16LE(26) & 0x3fff, webp.readUInt16LE(28) & 0x3fff];
    assert.deepEqual([width, height], [2880, 2152], name);
  }
  for (const text of ["TEACHING ASSISTANTS", "INSTRUCTORS", "CLASSMATES", "Barry Allen · TA", "Dr. Prince · Professor", "Kara Danvers · Classmate", "Bar"]) {
    assert.match(page, new RegExp(`<span class="cm-layer"[^>]*>${text}</span>`), text);
  }
  // the timeline is linked on this page only, and holds 0.45s in under reduced motion and until the loop is live.
  const href = page.match(/<link rel="stylesheet" href="(\/_astro\/elms-send-path\.[^"]+\.css)">/)?.[1];
  assert.ok(href, "send path stylesheet linked");
  for (const [slug, html] of pages) if (slug !== "elms-redesign") assert.doesNotMatch(html, /elms-send-path/, slug);
  const css = readFileSync(join(projectRoot, "dist", href), "utf8");
  assert.match(css, /\[data-motion-loop=elms-send-path\]\{--u: ?calc\(100cqi \/ 960\)\}/);
  assert.match(css, /\[data-motion-loop=elms-send-path\]:not\(\.is-live\) \[data-node\]\{animation-play-state:paused\}/);
  assert.match(css, /\[data-motion-loop=elms-send-path\] \[data-node\]\[data-node\]\{animation-delay:-\.45s\}/);
  assert.match(css, /@media ?\(prefers-reduced-motion:reduce\)\{\[data-motion-loop=elms-send-path\] \[data-node\]\[data-node\]\{animation-duration:16\.4s!important;animation-iteration-count:infinite!important;animation-delay:-\.45s;animation-play-state:paused\}\}/);
  assert.match(css, /@property --rotate-transform/);
});

test("lato loads on the elms page only, for its send bar and model window", () => {
  const head = page.split("</head>")[0];
  for (const weight of ["400", "700"]) assert.match(head, new RegExp(`font-family: "Lato"; font-style: normal; font-weight: ${weight};[^}]*/fonts/lato/lato-${weight}-latin\\.woff2`));
  assert.match(readFileSync(join(projectRoot, "public", "fonts", "lato", "OFL.txt"), "utf8"), /SIL Open Font License, Version 1\.1/);
  for (const [slug, html] of pages) if (slug !== "elms-redesign") assert.doesNotMatch(html, /fonts\/lato\//, slug);
  for (const name of ["index.html", "about/index.html"]) assert.doesNotMatch(readFileSync(join(projectRoot, "dist", name), "utf8"), /fonts\/lato\//, name);
  const assets = join(projectRoot, "dist", "_astro");
  for (const name of readdirSync(assets).filter((file) => file.endsWith(".css"))) assert.doesNotMatch(readFileSync(join(assets, name), "utf8"), /fonts\/lato\//, name);
});
