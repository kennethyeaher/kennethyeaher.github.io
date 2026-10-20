import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { aboutChapters, aboutGallery, profile, projects } from "../src/data/portfolio.mjs";

const projectRoot = new URL("..", import.meta.url).pathname;
const publicRoot = join(projectRoot, "public");

function publicFile(pathname) {
  return join(publicRoot, pathname.replace(/^\//, ""));
}

function sha256(pathname) {
  return createHash("sha256").update(readFileSync(pathname)).digest("hex");
}

test("every published portfolio media reference resolves to a non-empty real file", () => {
  const mediaPaths = [
    ...aboutGallery.map(({ src }) => src),
    ...projects.flatMap((project) => [
      project.cardImage,
      project.heroImage,
      project.cover.poster,
      project.cover.exhibit?.src,
      `/images/social/${project.slug}.png`,
      ...project.sections.flatMap((section) =>
        "media" in section && section.media ? section.media.flatMap((item) => [item.src, item.poster, item.after?.src, ...(item.sources ?? []).map(({ src }) => src)]) : [],
      ),
    ]),
  ];

  for (const mediaPath of new Set(mediaPaths.filter(Boolean))) {
    const absolutePath = publicFile(mediaPath);
    assert.equal(existsSync(absolutePath), true, `${mediaPath} is missing`);
    assert.ok(statSync(absolutePath).size > 0, `${mediaPath} is empty`);
  }
});

/** a jpeg's pixel size, read from its first start-of-frame marker. */
function jpegSize(pathname) {
  const bytes = readFileSync(pathname);
  let offset = 2;
  while (offset < bytes.length) {
    const marker = bytes[offset + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
    }
    offset += 2 + bytes.readUInt16BE(offset + 2);
  }
  throw new Error(`${pathname} has no frame header`);
}

/** a webp's pixel size, from a lossy VP8 frame, a lossless VP8L bitstream or an extended VP8X canvas. */
function webpSize(pathname) {
  const buffer = readFileSync(pathname);
  assert.equal(buffer.subarray(0, 4).toString(), "RIFF");
  assert.equal(buffer.subarray(8, 12).toString(), "WEBP");
  const chunk = buffer.subarray(12, 16).toString();
  if (chunk === "VP8 ") return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff };
  if (chunk === "VP8L") {
    const bits = buffer.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (chunk === "VP8X") return { width: buffer.readUIntLE(24, 3) + 1, height: buffer.readUIntLE(27, 3) + 1 };
  throw new Error(`${pathname} has an unexpected webp chunk ${chunk}`);
}

test("every About chapter photo is a gallery photo with alt text, its real pixel size and sized copies at their real widths", () => {
  const gallery = new Map(aboutGallery.map((item) => [item.src, item]));
  const ids = aboutChapters.flatMap((chapter) => [chapter.lead, ...chapter.rows.flat()]);
  assert.equal(new Set(ids).size, ids.length, "no photo repeats across chapters");
  for (const id of ids) {
    const item = gallery.get(`/images/about/${id}.jpg`);
    assert.ok(item, `${id} is in aboutGallery`);
    assert.ok(item.alt.trim().length > 0, `${id} has alt text`);
    assert.doesNotMatch(item.alt, /—/);
  }
  for (const item of aboutGallery) {
    assert.deepEqual(jpegSize(publicFile(item.src)), { width: item.width, height: item.height }, `${item.src} size`);
  }

  // scripts/build-about-images.mjs writes webp copies at 160, 320, 480, 640, 960 and 1280 below the jpeg's width plus
  // one at that width, and the manifest the srcsets come from; each copy is as wide as its name and keeps the shape.
  const manifest = JSON.parse(readFileSync(join(projectRoot, "src/data/about-sizes.json"), "utf8"));
  const names = aboutGallery.map((item) => item.src.split("/").pop().replace(/\.jpg$/, ""));
  assert.deepEqual(Object.keys(manifest), [...names].sort());
  const expected = new Set();
  for (const [index, item] of aboutGallery.entries()) {
    const widths = [...[160, 320, 480, 640, 960, 1280].filter((width) => width < item.width), item.width];
    assert.deepEqual(manifest[names[index]], widths, `${names[index]} widths`);
    for (const width of widths) {
      const file = `${names[index]}-${width}.webp`;
      expected.add(file);
      const size = webpSize(publicFile(`/images/about/sized/${file}`));
      assert.equal(size.width, width, `${file} width`);
      assert.ok(Math.abs(size.height - (width * item.height) / item.width) <= 1, `${file} keeps the photo's shape`);
    }
  }
  assert.deepEqual(readdirSync(publicFile("/images/about/sized")).sort(), [...expected].sort(), "no stray sized copies");
});

test("the published resume matches the approved master PDF fingerprint", () => {
  const publishedResume = publicFile(profile.links.resume);

  assert.equal(existsSync(publishedResume), true);
  assert.equal(
    sha256(publishedResume),
    "6d904b3d0b2c727d9228f358a74198a24074bda727b4cf4d82a427d8c93f45b8",
  );
});


test("published social cards use the required dimensions and cover exhibits retain source proportions", () => {
  for (const project of projects) {
    const png = readFileSync(publicFile(`/images/social/${project.slug}.png`));
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(png.readUInt32BE(16), 1200);
    assert.equal(png.readUInt32BE(20), 630);
    const exhibit = project.cover.exhibit;
    assert.ok(exhibit.width > 0 && exhibit.height > 0);
    assert.ok(["phone", "tablet", "laptop", "sheet"].includes(exhibit.frame));
    assert.ok(project.sections.some((section) => section.media?.some((item) => item.src === exhibit.src)), `${project.slug} cover must use a documented exhibit`);
  }
});

test("exhibit kit assets from the figma components ship as real files", () => {
  for (const name of ["browser-light-red", "browser-light-yellow", "browser-light-green"]) {
    const svg = readFileSync(publicFile(`/images/exhibits/${name}.svg`), "utf8");
    assert.match(svg, /<svg[^>]*width="11"/);
  }
});

/** every image an exhibit places on a stage, once each: the same set scripts/build-exhibit-images.mjs sizes. */
function exhibitVisuals() {
  const visuals = new Map();
  for (const project of projects) {
    for (const exhibit of project.exhibits ?? []) {
      for (const visual of [...(exhibit.visuals ?? []), ...(exhibit.stages ?? []).flatMap((stage) => stage.visuals ?? []), ...(exhibit.tiles ?? []), ...(exhibit.figure ? [exhibit.figure] : []),
        ...(exhibit.scroller ? [exhibit.scroller.visual] : []), ...(exhibit.walkthrough?.steps ?? []).map((step) => step.screen), ...(exhibit.pins ? [exhibit.pins.visual] : []),
        ...(exhibit.rows?.visuals ?? []), ...(exhibit.specimens ?? []).flatMap((specimen) => specimen.visual ? [specimen.visual] : []),
        ...(exhibit.papers?.cards ?? []).map((card) => card.photo)]) {
        visuals.set(visual.src, visual);
      }
    }
  }
  return [...visuals.values()];
}

/** the width and height of an mp4's first track, from its tkhd box (two 16.16 fixed point numbers at the end). */
function mp4Size(buffer) {
  const at = buffer.indexOf("tkhd");
  assert.ok(at > 0, "the clip has a track header");
  const end = at - 4 + buffer.readUInt32BE(at - 4);
  return [buffer.readUInt32BE(end - 8) / 65536, buffer.readUInt32BE(end - 4) / 65536];
}

test("Frontground's laptop loops follow the loop conventions and the stills they replaced are gone", async () => {
  const frontground = projects.find((project) => project.slug === "frontground");
  const loops = frontground.exhibits.flatMap((exhibit) => (exhibit.loops?.visuals ?? []).map((visual) => [exhibit.id, visual]));
  assert.deepEqual(loops.map(([id, visual]) => [id, visual.loop.name]), [["offline", "sync"], ["offline", "duplicate"], ["triage", "triage"]]);
  // figma 325:506 sets the offline loops as a pair and 325:545 triage as a feature card with its five steps.
  const offline = frontground.exhibits.find((exhibit) => exhibit.id === "offline").loops;
  const triage = frontground.exhibits.find((exhibit) => exhibit.id === "triage").loops;
  assert.equal(offline.layout, "pair");
  assert.equal(triage.layout, "feature");
  assert.deepEqual(triage.steps, ["Intake", "Assessment, level suggested", "Hand-off with a note", "Arrives in the doctor’s queue", "Back to the queue, sorted by level"]);
  assert.deepEqual([...offline.captions, ...triage.captions].map(({ num, tag }) => [num, tag]), [["LOOP 01", "LOOP · 16s"], ["LOOP 02", "LOOP · 12s"], ["LOOP 03", "LOOP · 18s"]]);
  // the laptop and the colour field are baked into each video, so the site draws neither.
  for (const block of [offline, triage]) assert.equal(block.fields, undefined);
  const sizes = { sync: [1280, 856], duplicate: [1280, 856], triage: [1280, 800] };
  for (const [, visual] of loops) await assertLoopFiles(visual, sizes[visual.loop.name]);
  // the greyscale specimen draws its queue live (figma 365:519), so the triage-queue capture is gone too.
  assertStillsGone("frontground", ["sync-failed", "offline-queue", "duplicate-check", "triage-handoff", "triage-queue", "vitals-trend"]);
  // the core flows chapter went with its admin still and its doctor and nurse loops.
  assertStillsGone("frontground", ["admin"]);
  for (const name of ["doctor", "nurse"]) {
    for (const file of [`frontground-${name}-loop.mp4`, `frontground-${name}-loop-poster.webp`]) {
      assert.ok(!existsSync(publicFile(`/images/work/frontground/${file}`)), `${file} still ships`);
    }
  }
});

/** a loop whose device and colour field are baked in: no frame or box of its own, its poster as its src at the
    clip's size, and both files h264 or webp at that size with no metadata left by the render or by any tool. */
async function assertLoopFiles(visual, expected) {
  const { default: sharp } = await import("sharp");
  for (const key of ["frame", "url", "screen", "at"]) assert.equal(visual[key], undefined, `${visual.loop.name} has no ${key}`);
  assert.ok(visual.alt.length > 20, `${visual.loop.name} has alt text`);
  assert.equal(visual.src, visual.loop.poster);
  assert.equal(visual.loop.poster, visual.loop.src.replace(/\.mp4$/, "-poster.webp"));
  // h264 with the index up front and no sound track.
  const clip = readFileSync(publicFile(visual.loop.src));
  assert.ok(clip.indexOf("moov") > 0 && clip.indexOf("moov") < clip.indexOf("mdat"), `${visual.loop.src} is faststart`);
  assert.ok(clip.includes("avc1"), `${visual.loop.src} is h264`);
  assert.ok(!clip.includes("soun"), `${visual.loop.src} has no audio`);
  assert.deepEqual(mp4Size(clip), expected, `${visual.loop.src} size`);
  const poster = await sharp(publicFile(visual.loop.poster)).metadata();
  assert.deepEqual([poster.format, poster.width, poster.height], ["webp", ...expected], visual.loop.poster);
  assert.deepEqual([visual.width, visual.height], expected);
  for (const file of [visual.loop.src, visual.loop.poster]) assert.doesNotMatch(readFileSync(publicFile(file)).toString("latin1"), /c2pa|anthropic|claude/i, file);
}

/** stills a loop replaced: gone from public, from the size manifest and from the sized copies. */
function assertStillsGone(folder, names) {
  const sized = readdirSync(publicFile("/images/exhibits/sized"));
  const manifest = JSON.parse(readFileSync(join(projectRoot, "src/data/exhibit-sizes.json"), "utf8"));
  for (const old of names) {
    const name = `${folder}-${old}`;
    assert.ok(!existsSync(publicFile(`/images/work/${folder}/${name}.png`)), `${name}.png still ships`);
    assert.equal(manifest[name], undefined, `${name} is still in the manifest`);
    assert.ok(!sized.some((file) => file.startsWith(`${name}-`)), `${name} still has sized copies`);
  }
}

test("Ovara's dashboard rows play the Iris atlas loops and every earlier dashboard capture is gone", async () => {
  const { default: sharp } = await import("sharp");
  const ovara = projects.find((project) => project.slug === "ovara");
  const rows = ovara.exhibits.find((exhibit) => exhibit.id === "the-dashboard");
  assert.deepEqual(rows.visuals.map((visual) => visual.loop.name), ["search", "compare", "filter"]);
  assert.deepEqual(rows.captions.map(({ tag }) => tag), ["RECORDED LIVE", "LOOP · 17S", "LOOP · 11S"]);
  for (const visual of rows.visuals) {
    // a browser framed row keeps a still of its own under the loop, so the src is a capture and not the poster.
    assert.match(visual.src, /^\/images\/work\/ovara\/ovara-atlas-[a-z]+\.png$/);
    assert.equal(visual.loop.src, `/images/work/ovara/ovara-atlas-${visual.loop.name}-loop.mp4`);
    assert.equal(visual.loop.poster, visual.loop.src.replace(/\.mp4$/, "-poster.webp"));
    const clip = readFileSync(publicFile(visual.loop.src));
    assert.ok(clip.indexOf("moov") > 0 && clip.indexOf("moov") < clip.indexOf("mdat"), `${visual.loop.src} is faststart`);
    assert.ok(clip.includes("avc1"), `${visual.loop.src} is h264`);
    assert.ok(!clip.includes("soun"), `${visual.loop.src} has no audio`);
    assert.deepEqual(mp4Size(clip), [1280, 800], `${visual.loop.src} size`);
    const poster = await sharp(publicFile(visual.loop.poster)).metadata();
    assert.deepEqual([poster.format, poster.width, poster.height], ["webp", 1280, 800], visual.loop.poster);
    for (const file of [visual.src, visual.loop.src, visual.loop.poster]) assert.doesNotMatch(readFileSync(publicFile(file)).toString("latin1"), /c2pa|anthropic|claude|Lavf/i, file);
  }
  for (const name of ["explorer", "comparison", "missouri", "finding"]) {
    const still = await sharp(publicFile(`/images/work/ovara/ovara-atlas-${name}.png`)).metadata();
    assert.deepEqual([still.width, still.height], [2880, 1800], name);
  }
  // the cover, the stage and the field circles take the Iris atlas iris, burnt coral and cream.
  const colours = JSON.stringify([ovara.cover.palette, ovara.stagePalette, rows.fields]);
  assert.doesNotMatch(colours, /6B4FBF|E87A3C|F5EFE4/i);
  assert.match(colours, /#6846AA/);
  assert.match(colours, /#C45B32/);
  assert.ok(ovara.cover.palette.includes("#F7F4EE"));
  for (const loop of ["state", "county", "findings"]) assert.ok(!existsSync(publicFile(`/images/work/ovara/ovara-${loop}-loop.mp4`)), `${loop} loop still ships`);
  assertStillsGone("ovara", ["dashboard-county-overview", "dashboard-findings", "dashboard-map-selected"]);
  for (const old of ["dashboard-state", "dashboard-map", "dashboard-county"]) assert.ok(!existsSync(publicFile(`/images/work/ovara/ovara-${old}.jpg`)), `ovara-${old}.jpg still ships`);
});

test("sohive's rsvp outcomes and host side each show one wide loop in place of four annotated phones", async () => {
  const sohive = projects.find((project) => project.slug === "sohive");
  const alts = {
    rsvp: "sohive recording on four phones: an RSVP opens a You're going sheet and the calendar options, a full event puts the student fourth on the waitlist, a push about a new time leads to Still going, and a push about an open spot leads to Keep my spot and the ticket",
    host: "sohive recording on four phones: the host publishes from the preview, checks in Diana Prince and then Kara Danvers at the door, sends a message to 142 people, and the recap counts up to 118 checked in",
  };
  for (const [id, name] of [["rsvp-outcomes", "rsvp"], ["host-side", "host"]]) {
    const exhibit = sohive.exhibits.find((entry) => entry.id === id);
    // the four phones and the colour field are baked into the clip, so the chapter keeps no visuals, focus boxes or field.
    for (const key of ["visuals", "annotations", "field"]) assert.equal(exhibit[key], undefined, `${id} still has ${key}`);
    assert.equal(exhibit.loops.layout, "wide");
    assert.equal(exhibit.loops.visuals.length, 1);
    const [visual] = exhibit.loops.visuals;
    assert.equal(visual.loop.name, name);
    assert.equal(visual.loop.src, `/images/work/sohive/sohive-${name}-loop.mp4`);
    assert.equal(visual.alt, alts[name]);
    assert.deepEqual(exhibit.loops.captions, [{ tag: "LOOP · 18s" }]);
    await assertLoopFiles(visual, [1280, 712]);
    // the notes row stays.
    assert.equal(exhibit.notes.length, 4);
  }
  assertStillsGone("sohive", ["rsvp-confirmed", "rsvp-waitlisted", "event-changed", "waitlist-spot-opened", "host-preview", "host-door-checkin", "host-message", "host-after-event"]);
});

test("the offline stage still is the S2 capture with the new triage chips", () => {
  const source = join(projectRoot, ".private/fg-loops/frames/S2.png");
  if (!existsSync(source)) return;
  const hash = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");
  assert.equal(hash(publicFile("/images/work/frontground/frontground-sync-offline.png")), hash(source));
});

test("every exhibit image and loop file is a real file in public", () => {
  for (const visual of exhibitVisuals()) {
    for (const file of [visual.src, visual.loop?.src, visual.loop?.poster].filter(Boolean)) {
      assert.ok(existsSync(publicFile(file)) && statSync(publicFile(file)).size > 0, `${file} is missing`);
    }
  }
});

test("the exhibit size manifest lists the standard widths below each source plus one at the source width, capped at 1920, and every copy exists", () => {
  const manifest = JSON.parse(readFileSync(join(projectRoot, "src/data/exhibit-sizes.json"), "utf8"));
  const sizedDir = publicFile("/images/exhibits/sized");
  const expectedFiles = new Set();
  for (const visual of exhibitVisuals()) {
    const name = visual.src.split("/").pop().replace(/\.[^.]+$/, "");
    const widths = manifest[name];
    assert.ok(Array.isArray(widths), `${name} is missing from the manifest`);
    const top = Math.min(visual.width, 1920);
    const expected = [...[320, 480, 960, 1440, 1920].filter((width) => width < top), top];
    assert.deepEqual(widths, expected, `${name} (source ${visual.width} wide) has the wrong widths`);
    for (const width of widths) {
      const file = `${name}-${width}.webp`;
      expectedFiles.add(file);
      assert.ok(existsSync(join(sizedDir, file)) && statSync(join(sizedDir, file)).size > 0, `${file} is missing`);
    }
  }
  // nothing ships unused: every file in the sized folder is one the manifest names.
  assert.deepEqual(readdirSync(sizedDir).filter((file) => !expectedFiles.has(file)), []);
  // and the manifest names only exhibit images.
  assert.deepEqual(Object.keys(manifest).sort(), [...new Set(exhibitVisuals().map((visual) => visual.src.split("/").pop().replace(/\.[^.]+$/, "")))].sort());
});
