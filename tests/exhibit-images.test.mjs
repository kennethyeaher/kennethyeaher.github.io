// the sized exhibit copies and the srcsets built from them: a copy is as wide as its name claims, the built pages
// offer only copies the manifest lists, and every exhibit has a copy wide enough for a 2x screen.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test, { before } from "node:test";
import assert from "node:assert/strict";

const projectRoot = new URL("..", import.meta.url).pathname;
const sizedDir = join(projectRoot, "public/images/exhibits/sized");
const manifest = JSON.parse(readFileSync(join(projectRoot, "src/data/exhibit-sizes.json"), "utf8"));
const slugs = ["usm-venture-benchmark", "ovara", "kairo-health", "terpcarehub", "college-park-capstone", "frontground", "terpcare", "sohive"];

/** the pixel width in a webp header: a lossy VP8 frame, a lossless VP8L bitstream or an extended VP8X canvas. */
function webpWidth(buffer) {
  assert.equal(buffer.subarray(0, 4).toString(), "RIFF");
  assert.equal(buffer.subarray(8, 12).toString(), "WEBP");
  const chunk = buffer.subarray(12, 16).toString();
  if (chunk === "VP8 ") return buffer.readUInt16LE(26) & 0x3fff;
  if (chunk === "VP8L") return (buffer.readUInt32LE(21) & 0x3fff) + 1;
  if (chunk === "VP8X") return buffer.readUIntLE(24, 3) + 1;
  throw new Error(`unexpected webp chunk ${chunk}`);
}

before(() => {
  execFileSync("npm", ["run", "build"], { cwd: projectRoot, encoding: "utf8", stdio: "pipe" });
});

test("every sized copy is as wide as its name claims", () => {
  const files = readdirSync(sizedDir).filter((file) => file.endsWith(".webp"));
  assert.ok(files.length > 0, "the sized folder has copies");
  for (const file of files) {
    const claimed = Number(file.match(/-(\d+)\.webp$/)?.[1]);
    assert.ok(claimed > 0, `${file} does not name a width`);
    assert.equal(webpWidth(readFileSync(join(sizedDir, file))), claimed, `${file} is not ${claimed} wide`);
  }
});

test("every exhibit srcset the built pages emit offers only copies the manifest lists", () => {
  let candidates = 0;
  for (const slug of slugs) {
    const html = readFileSync(join(projectRoot, "dist", "work", slug, "index.html"), "utf8");
    for (const [, srcset] of html.matchAll(/srcset="([^"]*)"/g)) {
      for (const candidate of srcset.split(",").map((part) => part.trim())) {
        const match = candidate.match(/^\/images\/exhibits\/sized\/(.+)-(\d+)\.webp (\d+)w$/);
        assert.ok(match, `${slug}: ${candidate} is not a sized exhibit copy with a width descriptor`);
        const [, name, fileWidth, descriptor] = match;
        assert.equal(descriptor, fileWidth, `${slug}: ${candidate} describes a different width than its file name`);
        assert.ok(manifest[name]?.includes(Number(fileWidth)), `${slug}: ${candidate} is not in the manifest`);
        candidates += 1;
      }
    }
  }
  assert.ok(candidates > 100, `only ${candidates} candidates found across the case studies`);
});

// the widest each exhibit image renders at 1440, in css px, measured on the live site. a 2x screen needs twice
// that; the build caps copies at 1920, so the three widest images are held to the cap instead.
const renderedWidths = {
  "frontground-doctor": 838,
  "frontground-nurse": 698,
  "ovara-dashboard-county-overview": 1326,
  "ovara-dashboard-map-selected": 879,
  "journey-tyler": 1116,
  "journey-jessica": 560,
  "persona-maria": 639,
  "persona-maria-detail": 639,
  "validation-grid": 1020,
  "kairo-form-clean": 789,
  "kairo-llm-heatmap": 420,
  "kairo-rules-heatmap": 420,
  "brief-overview-redacted": 419,
  "brief-deep-dive-redacted": 419,
  "brief-portfolio-redacted": 419,
  "brief-vehicles-redacted": 419,
  "alert-detail": 958,
  "home-full": 838,
  "provider-card": 456,
  "mobile-find-care": 340,
  "sohive-feed-screen": 296,
  "sohive-event-screen": 296,
  "sohive-profile-screen": 296,
  "terpcare-home": 289,
  "terpcare-mood-calendar": 289,
  "figma-discussion-recents": 289,
  "figma-discussion-create": 289,
  "figma-resources-therapy": 289,
  "figma-book-appointment": 289,
  "interface-state-empty": 193,
  "interface-state-loading": 193,
  "interface-state-degraded": 193,
  "interface-state-confirmation": 193,
};

test("every exhibit's widest copy is at least twice its rendered width at 1440, up to the 1920 cap", () => {
  for (const [name, cssWidth] of Object.entries(renderedWidths)) {
    const widths = manifest[name];
    assert.ok(Array.isArray(widths) && widths.length > 0, `${name} has no sized copies`);
    const widest = Math.max(...widths);
    const needed = Math.min(2 * cssWidth, 1920);
    assert.ok(widest >= needed, `${name}: widest copy is ${widest}, a 2x screen at ${cssWidth} css px needs ${needed}`);
  }
});
