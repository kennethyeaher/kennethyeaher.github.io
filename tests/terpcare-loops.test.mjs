import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test, { before } from "node:test";
import assert from "node:assert/strict";

import { projects } from "../src/data/portfolio.mjs";

const projectRoot = new URL("..", import.meta.url).pathname;
const publicFile = (pathname) => join(projectRoot, "public", pathname.replace(/^\//, ""));
const pages = new Map();

// the hi-fi prototype loops (.private/terpcare-loops, .private/terpcarehub-loops) replace the annotated stills: each
// stage, and the find care pins stage under where it landed, plays one wide card with its device and field baked in.
const loops = [
  { slug: "terpcare", id: "mood-check-in", next: "privacy", folder: "terpcare", file: "terpcare-mood-loop", name: "mood", size: [1280, 712], base: "#211f20", tag: "LOOP · 18s" },
  { slug: "terpcare", id: "privacy", next: "reflection", folder: "terpcare", file: "terpcare-privacy-loop", name: "privacy", size: [1280, 712], base: "#211f20", tag: "LOOP · 18s" },
  // the v2 hub loops (.private/terpcarehub-loops/SPEC-v2.md) both sit on the alert stage's red field.
  { slug: "terpcarehub", id: "where-it-landed", next: "design-system", folder: "terpcarehub", file: "terpcarehub-alert-detail-loop", name: "alert detail", size: [1280, 872], base: "#8a0b1e", tag: "LOOP · 16s", v2: true },
  { slug: "terpcarehub", id: "where-it-landed", next: "design-system", folder: "terpcarehub", file: "terpcarehub-findcare-loop", name: "find care", size: [1280, 780], base: "#8a0b1e", tag: "LOOP · 18s", v2: true },
];
// stills only these stages drew; the check-in sheet, the october month and the alert page are used elsewhere and stay.
const goneStills = ["checkin-saved", "mood-patterns", "onboarding-welcome", "privacy-settings", "privacy-what-is-stored", "account-deleted"];

before(() => {
  execFileSync("npm", ["run", "build"], { cwd: projectRoot, encoding: "utf8", stdio: "pipe" });
  for (const slug of ["terpcare", "terpcarehub"]) pages.set(slug, readFileSync(join(projectRoot, "dist", "work", slug, "index.html"), "utf8"));
});

/** a chapter's converted exhibit: its html up to the dark mode row or the specimens that follow, if it has them. */
function chapterOf(slug, id, next) {
  const page = pages.get(slug);
  const chapter = page.slice(page.indexOf(`id="${id}"`), page.indexOf(`id="${next}"`));
  const ends = ['class="exhibit-rows', "data-specimen="].map((marker) => chapter.indexOf(marker)).filter((index) => index > 0);
  return ends.length ? chapter.slice(0, Math.min(...ends)) : chapter;
}

test("mood check-in, privacy and where it landed keep their ledes and drop every still, annotation, pin and note", () => {
  for (const [slug, id] of [["terpcare", "mood-check-in"], ["terpcare", "privacy"], ["terpcarehub", "where-it-landed"]]) {
    const exhibit = projects.find((project) => project.slug === slug).exhibits.find((entry) => entry.id === id);
    for (const key of ["visuals", "annotations", "notes", "pins", "field", "captions", "zoom"]) assert.equal(exhibit[key], undefined, `${id} still has ${key}`);
    assert.ok(exhibit.lede.length > 0, `${id} keeps its lede`);
    assert.equal(exhibit.loops.layout, "wide");
    const expected = loops.filter((loop) => loop.id === id);
    assert.deepEqual(exhibit.loops.visuals.map(({ loop }) => loop.name), expected.map(({ name }) => name));
    assert.deepEqual(exhibit.loops.captions, expected.map(({ tag }) => ({ tag })));
  }
  // the two dark mode rows and the specimen after mood check-in stay.
  const mood = projects.find((project) => project.slug === "terpcare").exhibits.find((entry) => entry.id === "mood-check-in");
  assert.equal(mood.rows.visuals.length, 2);
  assert.equal(mood.specimens.length, 1);
});

test("every new loop and poster exists, sized, faststart h264 with no sound and no provenance strings", async () => {
  const { default: sharp } = await import("sharp");
  for (const { slug, id, file, folder, name, size, base } of loops) {
    const exhibit = projects.find((project) => project.slug === slug).exhibits.find((entry) => entry.id === id);
    const visual = exhibit.loops.visuals.find(({ loop }) => loop.name === name);
    assert.equal(visual.loop.src, `/images/work/${folder}/${file}.mp4`);
    assert.equal(visual.loop.poster, `/images/work/${folder}/${file}-poster.webp`);
    assert.equal(visual.src, visual.loop.poster);
    assert.deepEqual([visual.width, visual.height], size);
    assert.equal(visual.base ?? exhibit.loops.base, base, `${name} keeps its stage base`);
    assert.ok(visual.alt.length > 80, `${name} has alt text from its steps`);
    for (const key of ["frame", "url", "screen", "at"]) assert.equal(visual[key], undefined, `${name} has no ${key}`);
    assert.ok(existsSync(publicFile(visual.loop.src)), `${visual.loop.src} exists`);
    assert.ok(existsSync(publicFile(visual.loop.poster)), `${visual.loop.poster} exists`);
    const clip = readFileSync(publicFile(visual.loop.src));
    assert.ok(clip.indexOf("moov") > 0 && clip.indexOf("moov") < clip.indexOf("mdat"), `${file} is faststart`);
    assert.ok(clip.includes("avc1"), `${file} is h264`);
    assert.ok(!clip.includes("soun"), `${file} has no audio`);
    const at = clip.indexOf("tkhd");
    const end = at - 4 + clip.readUInt32BE(at - 4);
    assert.deepEqual([clip.readUInt32BE(end - 8) / 65536, clip.readUInt32BE(end - 4) / 65536], size, `${file} size`);
    const poster = await sharp(publicFile(visual.loop.poster)).metadata();
    assert.deepEqual([poster.format, poster.width, poster.height], ["webp", ...size], `${file} poster`);
    for (const path of [visual.loop.src, visual.loop.poster]) assert.doesNotMatch(readFileSync(publicFile(path)).toString("latin1"), /c2pa|anthropic|claude/i, path);
  }
  // the core flows row keeps its own, older alert loop.
  assert.ok(existsSync(publicFile("/images/work/terpcarehub/terpcarehub-alert-loop.mp4")));
});

test("each converted stage renders one loop card, the pins stage too, with no annotations, pins or numbered notes", () => {
  for (const { slug, id, next, folder, file, name, size, base, tag } of loops) {
    const chapter = chapterOf(slug, id, next);
    assert.match(chapter, /<div class="exhibit-loops is-wide"/, id);
    assert.doesNotMatch(chapter, /class="exhibit-stage|data-device-frame|annotation-focus|annotation-badge|stage-field|exhibit-notes|exhibit-pins|data-pin|stage-caption|pin-note/, id);
    const items = [...chapter.matchAll(/<figure class="loop-exhibit"[^>]*>[\s\S]*?<\/figure>/g)].map((match) => match[0]);
    const item = items.find((entry) => entry.includes(`${file}.mp4`));
    assert.ok(item, `${id} plays ${file}`);
    assert.equal(items.filter((entry) => entry.includes(`${file}.mp4`)).length, 1, `${file} renders once`);
    const clipId = `clip-${name.replace(/ /g, "-")}-loop`;
    assert.match(item, new RegExp(`<div class="loop-card"[^>]*style="--loop-base: ${base}; aspect-ratio: ${size[0]} / ${size[1]}"`));
    assert.match(item, new RegExp(`<img class="loop-still"[^>]*src="/images/work/${folder}/${file}-poster\\.webp" alt="" width="${size[0]}" height="${size[1]}" loading="lazy" decoding="async"[^>]*>\\s*<video id="${clipId}" muted loop playsinline preload="none" width="${size[0]}" height="${size[1]}" aria-label="[^"]{80,}"`));
    assert.match(item, new RegExp(`<span class="media-tag has-control"[^>]*>(?:(?!</button>).)*${tag}(?:(?!</button>).)*aria-controls="${clipId}"`, "s"));
    assert.doesNotMatch(item, /<figcaption/);
    assert.ok(chapter.indexOf('class="chapter-lede') < chapter.indexOf('class="exhibit-loops'), `${id} loop follows the lede`);
  }
  // where it landed: the alert first, then find care where the pins stage stood.
  const landed = chapterOf("terpcarehub", "where-it-landed", "design-system");
  assert.equal([...landed.matchAll(/<figure class="loop-exhibit"/g)].length, 2);
  assert.ok(landed.indexOf("terpcarehub-alert-detail-loop.mp4") < landed.indexOf("terpcarehub-findcare-loop.mp4"));
  // mood check-in keeps its dark mode row and specimen after the loop.
  const mood = pages.get("terpcare").slice(pages.get("terpcare").indexOf('id="mood-check-in"'), pages.get("terpcare").indexOf('id="privacy"'));
  assert.ok(mood.indexOf('class="exhibit-loops') < mood.indexOf('class="exhibit-rows') && mood.indexOf('class="exhibit-rows') < mood.indexOf('data-specimen="terpcare-mood"'));
});

/** a clip's length in seconds, from its movie header. */
function seconds(clip) {
  const at = clip.indexOf("mvhd");
  const v1 = clip[at + 4] === 1;
  return v1 ? Number(clip.readBigUInt64BE(at + 28)) / clip.readUInt32BE(at + 24) : clip.readUInt32BE(at + 20) / clip.readUInt32BE(at + 16);
}

test("the v2 hub loops run 14 to 20 seconds at 30fps, their tags say so, and both cards take the red field's base", () => {
  const exhibit = projects.find((project) => project.slug === "terpcarehub").exhibits.find((entry) => entry.id === "where-it-landed");
  for (const { file, folder, name, tag, v2 } of loops) {
    if (!v2) continue;
    const clip = readFileSync(publicFile(`/images/work/${folder}/${file}.mp4`));
    const length = seconds(clip);
    assert.ok(length >= 14 && length <= 20, `${file} runs ${length}s`);
    assert.equal(tag, `LOOP · ${Math.round(length)}s`, `${file} tag`);
    const visual = exhibit.loops.visuals.find(({ loop }) => loop.name === name);
    assert.equal(visual.base ?? exhibit.loops.base, "#8a0b1e", `${name} sits on the red field`);
  }
  // find care no longer carries the yellow pins stage's own base.
  assert.equal(exhibit.loops.visuals.find(({ loop }) => loop.name === "find care").base, undefined);
});

test("the stills only those stages drew are gone from public, the size manifest and the sized copies", () => {
  const sized = readdirSync(publicFile("/images/exhibits/sized"));
  const manifest = JSON.parse(readFileSync(join(projectRoot, "src/data/exhibit-sizes.json"), "utf8"));
  for (const old of goneStills) {
    const name = `terpcare-${old}`;
    assert.ok(!existsSync(publicFile(`/images/work/terpcare/${name}.png`)), `${name}.png still ships`);
    assert.equal(manifest[name], undefined, `${name} is still in the manifest`);
    assert.ok(!sized.some((entry) => entry.startsWith(`${name}-`)), `${name} still has sized copies`);
    assert.doesNotMatch(pages.get("terpcare"), new RegExp(name), `${name} is still referenced`);
  }
});
