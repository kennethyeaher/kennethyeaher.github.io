import { existsSync, readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

import {
  experience,
  homeNow,
  getAdjacentProject,
  getFeaturedProjects,
  getProjectBySlug,
  profile,
  projects,
} from "../src/data/portfolio.mjs";
import { caseStudies } from "../src/data/caseStudies.mjs";
import { coverFields } from "../src/data/coverFields.mjs";
import { coverDevices } from "../src/data/coverDevices.mjs";
import { coverMotion, ovaraTiles } from "../src/data/coverMotion.mjs";
import { coverMotionCss, coverMotionPath, loopMotionCss, readMotion, scalePx, splitSnippet } from "../scripts/build-cover-motion.mjs";
import { loopMotion } from "../src/data/loopMotion.mjs";
import { approvedLedes, readProse } from "../scripts/build-approved-ledes.mjs";

const specPath = new URL("../.private/redesign-spec/v2-pages.json", import.meta.url);

// home grid redesign (figma 428:2684): elms leads (436:1866), then the capstone, and frontground follows terpcarehub.
const expectedOrder = [
  "elms-redesign",
  "college-park-capstone",
  "terpcarehub",
  "frontground",
  "sohive",
  "terpcare",
  "ovara",
  "kairo-health",
];

test("featured work returns the approved eight projects in the home grid order", () => {
  assert.deepEqual(
    getFeaturedProjects().map((project) => project.slug),
    expectedOrder,
  );
});

test("categories come from one fixed set, one or two per project", () => {
  const allowed = new Set(["Product Design", "Interaction Design", "Design Systems", "UX Research", "Data Science", "Data Visualization", "Venture Research"]);
  for (const project of projects) {
    const parts = project.category.split(" + ");
    assert.ok(parts.length >= 1 && parts.length <= 2, project.slug);
    for (const part of parts) assert.ok(allowed.has(part), `${project.slug}: ${part}`);
  }
  assert.deepEqual(Object.fromEntries(projects.map((project) => [project.slug, project.category])), {
    terpcarehub: "Interaction Design + Design Systems",
    frontground: "Product Design + UX Research",
    sohive: "Product Design + Design Systems",
    terpcare: "Product Design",
    ovara: "Data Science + Data Visualization",
    "college-park-capstone": "UX Research",
    "kairo-health": "Data Science",
    "elms-redesign": "Interaction Design",
  });
});

test("every project has a unique slug and every navigation target resolves", () => {
  const slugs = projects.map((project) => project.slug);

  assert.equal(new Set(slugs).size, projects.length);
  for (const slug of slugs) {
    assert.equal(getProjectBySlug(slug)?.slug, slug);
  }
});

test("adjacent-project navigation wraps without a dead end", () => {
  assert.equal(
    getAdjacentProject("college-park-capstone", "previous").slug,
    "elms-redesign",
  );
  // kairo hands on to elms, and elms wraps round to the capstone.
  assert.equal(getAdjacentProject("kairo-health", "next").slug, "elms-redesign");
  assert.equal(getAdjacentProject("elms-redesign", "next").slug, "college-park-capstone");
  assert.equal(getAdjacentProject("college-park-capstone", "next").slug, "terpcarehub");
  assert.equal(getAdjacentProject("terpcarehub", "next").slug, "frontground");
  assert.equal(getAdjacentProject("frontground", "previous").slug, "terpcarehub");
  assert.equal(
    getAdjacentProject("ovara", "previous").slug,
    "terpcare",
  );
  assert.equal(getAdjacentProject("ovara", "next").slug, "kairo-health");
  // every next is undone by a previous, round the whole loop.
  for (const { slug } of projects) assert.equal(getAdjacentProject(getAdjacentProject(slug, "next").slug, "previous").slug, slug);
});

test("the public identity uses the corrected professional title", () => {
  assert.equal(
    profile.roleLine,
    "Product Designer and Data Scientist",
  );
});

test("professional history includes the supplied Towers internship and Frontground start year", () => {
  assert.ok(
    experience.some(
      ({ year, organization, role }) =>
        year === "2024" &&
        organization === "Towers Surgical Partners" &&
        role === "Data Analyst Intern",
    ),
  );
  assert.ok(
    experience.some(
      ({ year, organization, role }) =>
        year === "2022" && organization === "Frontground" && role === "Founder",
    ),
  );
});

test("home v3 keeps Currently and Previously as short prose, and the compact history stays in the data", () => {
  assert.deepEqual(homeNow, {
    currently: ["Studying HCIM @ UMD", "in College Park, Maryland"],
    previously:
      "Screened deals @ USM Maryland Momentum Fund, analyzed data @ Towers Surgical Partners, founded Frontground, and more.",
  });
  // the home page no longer renders `experience`, but all six entries stay, in order, without the phone subset.
  assert.deepEqual(
    experience.map(({ year, organization, role }) => `${year} ${organization} ${role}`),
    [
      "2026 USM Maryland Momentum Fund Summer Investment Associate",
      "2026 USM Maryland Momentum Fund Venture Fellow",
      "2025 Towers Surgical Partners Data Analyst",
      "2024 Towers Surgical Partners Data Analyst Intern",
      "2022 Frontground Founder",
      "2021 hiveSocial Product Design Intern",
    ],
  );
  assert.ok(experience.every((entry) => !("compact" in entry)));
});

test("every featured project carries a project-palette motion cover and a substantial case narrative", () => {
  const minimumSections = new Map([
    ["frontground", 8],
    ["sohive", 8],
    ["college-park-capstone", 8],
    ["ovara", 8],
    ["kairo-health", 8],
    ["terpcare", 7],
    ["terpcarehub", 8],
    ["elms-redesign", 8],
  ]);

  for (const project of projects) {
    assert.equal("video" in project.cover, false, `${project.slug} cover has no video`);
    assert.match(project.cover.poster, /\.png$/);
    assert.equal(project.cover.titlePlacement, "center");
    assert.ok(project.cover.palette.length >= 4, `${project.slug} needs a real project palette`);
    assert.ok(
      project.sections.length >= minimumSections.get(project.slug),
      `${project.slug} needs a fuller case narrative`,
    );
  }

  assert.ok(
    getProjectBySlug("college-park-capstone").sections.some(
      ({ id }) => id === "reflection",
    ),
  );
});

test("the USM Venture Benchmark is gone from the data, the images and the lede fixture, and the fund job stays", () => {
  const root = new URL("../", import.meta.url);
  assert.equal(caseStudies.some(({ slug }) => slug === "usm-venture-benchmark"), false);
  assert.equal(getProjectBySlug("usm-venture-benchmark"), undefined);
  assert.equal(existsSync(new URL("public/images/work/usm-venture-benchmark", root)), false);
  assert.equal(existsSync(new URL("public/images/social/usm-venture-benchmark.png", root)), false);
  assert.equal("usm-venture-benchmark" in JSON.parse(readFileSync(new URL("./fixtures/approved-ledes.json", import.meta.url), "utf8")), false);
  // the benchmark's sized exhibit copies go with it.
  const sizes = JSON.parse(readFileSync(new URL("src/data/exhibit-sizes.json", root), "utf8"));
  for (const name of ["research-system", "brief-overview-redacted", "brief-vehicles-redacted", "brief-portfolio-redacted", "brief-deep-dive-redacted", "comparison-model", "validation-grid", "transferability-lens"]) {
    assert.equal(name in sizes, false, `${name} has no sized copies`);
  }
  // the job itself stays in the history and the Previously line.
  assert.ok(experience.some(({ organization }) => organization === "USM Maryland Momentum Fund"));
  assert.match(homeNow.previously, /USM Maryland Momentum Fund/);
});

test("every home card takes its dark base and blurred colour field from its figma colour field frame (428:2684)", () => {
  assert.deepEqual(Object.keys(coverFields).sort(), projects.map(({ slug }) => slug).sort());
  // the cover frame's fill, the colour field frame's node, figma's blur radius and its ellipse count.
  const expected = {
    "college-park-capstone": ["#15110d", "I454:3047;454:451", 72, 5],
    terpcarehub: ["#140c10", "451:8407", 72, 5],
    frontground: ["#071311", "451:8413", 72, 5],
    sohive: ["#0f1014", "445:7303", 70, 6],
    terpcare: ["#150a0b", "451:8419", 72, 5],
    ovara: ["#1a1326", "I447:11135;452:5410", 72, 5],
    "kairo-health": ["#081127", "I447:11757;452:5434", 72, 5],
    "elms-redesign": ["#120b0c", "451:8401", 72, 5],
  };
  for (const [slug, [base, figma, blur, count]] of Object.entries(expected)) {
    const field = coverFields[slug];
    assert.deepEqual([field.base, field.figma, field.blur, field.ellipses.length], [base, figma, blur, count], slug);
    for (const { x, y, r, colour, alpha } of field.ellipses) {
      assert.ok([x, y, r].every(Number.isFinite) && r > 0, `${slug} ellipse geometry`);
      assert.match(colour, /^#[0-9a-f]{6}$/, `${slug} ellipse colour`);
      assert.ok(alpha > 0 && alpha <= 1, `${slug} ellipse opacity`);
    }
  }
  // spot checks against the exported field: centre, radius, fill and fill opacity on the 454 by 256 cover.
  assert.deepEqual(coverFields.terpcarehub.ellipses[0], { x: 65, y: 55, r: 135, colour: "#b3122e", alpha: 0.9 });
  assert.deepEqual(coverFields.sohive.ellipses.at(-1), { x: 200, y: 250, r: 80, colour: "#e0b23a", alpha: 0.5 });
  assert.deepEqual(coverFields["kairo-health"].ellipses[4], { x: 230, y: 140, r: 80, colour: "#4c8dff", alpha: 0.3 });
});

/** the width and height in a png's ihdr chunk. */
function pngSize(file) {
  const bytes = readFileSync(file);
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
}

test("device covers follow their figma frames: a macbook for elms and frontground, three phones for the app cards", () => {
  assert.deepEqual(Object.keys(coverDevices).sort(), ["elms-redesign", "frontground", "sohive", "terpcare", "terpcarehub"]);
  // both macbooks are Device/Laptop instances (325:499) on figma 428:2664.
  assert.deepEqual([coverDevices.frontground.kind, coverDevices.frontground.figma], ["macbook", "528:12392"]);
  assert.deepEqual([coverDevices["elms-redesign"].kind, coverDevices["elms-redesign"].figma], ["macbook", "528:12385"]);
  // elms shows the dc repainted ready to send screen at 1440 (figma's core-1 fill, 2880 by 2152), frontground the doctor dashboard.
  assert.equal(coverDevices["elms-redesign"].screen.src, "/images/work/elms-redesign/elms-cover-new-message.png");
  assert.equal(coverDevices.frontground.screen.src, "/images/work/frontground/frontground-cover-doctor.png");
  const phones = { terpcarehub: "428:2686", sohive: "428:2698", terpcare: "428:2704" };
  for (const [slug, figma] of Object.entries(phones)) {
    const cover = coverDevices[slug];
    assert.deepEqual([cover.kind, cover.figma], ["phones", figma], slug);
    // drawn in figma's layer order, so the centre phone sits on top of the two it fans out from.
    assert.deepEqual(cover.phones.map(({ slot }) => slot), ["left", "right", "center"], slug);
  }
  // status bars and islands only where figma draws them: terpcarehub's right screen carries its own.
  const layers = (slug) => coverDevices[slug].phones.map(({ slot, statusBar = false, island = false }) => [slot, statusBar, island]);
  assert.deepEqual(layers("terpcarehub"), [["left", true, true], ["right", false, false], ["center", true, true]]);
  for (const slug of ["sohive", "terpcare"]) assert.deepEqual(layers(slug), [["left", false, true], ["right", false, true], ["center", false, true]]);
  // sohive's three screens are the case study's own captures, so the cover reuses them.
  assert.deepEqual(coverDevices.sohive.phones.map(({ src }) => src), ["/images/work/sohive/sohive-event-screen.png", "/images/work/sohive/sohive-profile-screen.png", "/images/work/sohive/sohive-feed-screen.png"]);
  const screens = [coverDevices.frontground.screen, coverDevices["elms-redesign"].screen, ...Object.keys(phones).flatMap((slug) => coverDevices[slug].phones)];
  for (const { src, width, height } of screens) {
    const slug = Object.keys(coverDevices).find((key) => src.startsWith(`/images/work/${key}/`));
    assert.ok(slug, `${src} sits in its project's folder`);
    const file = new URL(`../public${src}`, import.meta.url);
    assert.ok(existsSync(file), `${src} exists`);
    assert.deepEqual(pngSize(file), [width, height], `${src} size`);
  }
});

/** every layer of a motion cover, children included. */
function motionLayers(layers) {
  return layers.flatMap((layer) => [layer, ...motionLayers(layer.children ?? [])]);
}

/** every figma node id a motion cover renders: the layers, the paths inside inline svgs, and the field's blobs. */
function motionNodes(slug) {
  const layers = motionLayers(coverMotion[slug].layers);
  const paths = layers.flatMap(({ svg }) => (svg ? [...svg.body.matchAll(/data-node="([^"]+)"/g)].map(([, node]) => node) : []));
  return [...coverMotion[slug].field, ...layers.flatMap(({ node }) => (node ? [node] : [])), ...paths];
}

test("motion covers run figma's v4 timelines (482:10252, 484:10700, 485:11148) on every animated node", () => {
  assert.deepEqual(Object.keys(coverMotion).sort(), ["college-park-capstone", "kairo-health", "ovara"]);
  const expected = { "college-park-capstone": ["482:10252", 13.6, 51], ovara: ["484:10700", 13.6, 141], "kairo-health": ["485:11148", 13.2, 37] };
  for (const [slug, [figma, seconds, animated]] of Object.entries(expected)) {
    const motion = coverMotion[slug];
    const { nodes, timelineCohorts } = readMotion(slug);
    assert.deepEqual([motion.figma, motion.seconds], [figma, seconds], slug);
    assert.deepEqual(timelineCohorts.map(({ rootNodeId, durationMs, loopMode }) => [rootNodeId, durationMs, loopMode]), [[figma, seconds * 1000, "loop"]], `${slug} one looping timeline`);
    assert.equal(nodes.length, animated, `${slug} animated nodes`);
    // every animated node in figma's export lands on exactly one rendered layer, and the ids are unique.
    const rendered = motionNodes(slug);
    assert.equal(new Set(rendered).size, rendered.length, `${slug} node ids are unique`);
    for (const { nodeId } of nodes) assert.ok(rendered.includes(nodeId), `${slug} renders ${nodeId}`);
    for (const layer of motionLayers(motion.layers)) {
      if (layer.src) assert.ok(existsSync(new URL(`../public${layer.src}`, import.meta.url)), `${slug} ${layer.src} exists`);
    }
    // the field blobs are the card field's ellipses, in order, and the reduced motion still sits inside the loop.
    assert.equal(motion.field.length, coverFields[slug].ellipses.length, `${slug} one blob per ellipse`);
    assert.deepEqual(nodes.slice(0, 5).map(({ nodeName }) => nodeName), ["Blob 1", "Blob 2", "Blob 3", "Blob 4", "Blob 5"]);
    assert.deepEqual(nodes.slice(0, 5).map(({ nodeId }) => nodeId), motion.field, `${slug} field blob ids`);
    assert.ok(motion.still > 0 && motion.still < seconds, `${slug} still`);
  }
  // each scene frame keeps its cards inside it, so its camera moves them together.
  const scenes = (slug) => coverMotion[slug].layers.filter(({ children, box }) => children && box.join() === "0,0,454,256").map(({ node }) => node);
  assert.deepEqual(scenes("college-park-capstone"), ["482:10762", "482:10847", "482:11136", "482:11281"]);
  assert.deepEqual(scenes("ovara"), ["484:11210"]);
  assert.deepEqual(scenes("kairo-health"), ["485:11658"]);
  // the ovara tiers match figma's tile motion: desert tiles pop to 1.25 and stay lit, the rest fade to 0.16.
  const tiles = readMotion("ovara").nodes.filter(({ nodeName }) => nodeName.startsWith("Tile "));
  assert.equal(tiles.length, 112);
  for (const { nodeName, codeSnippets: { css } } of tiles) {
    const [r, c] = nodeName.slice(5).split("-").map(Number);
    const desert = ovaraTiles[r][c] === "R";
    assert.equal(css.includes("scale: 1.25 1.25"), desert, `${nodeName} pop`);
    assert.equal(css.includes("opacity: 0.16"), !desert, `${nodeName} fade`);
  }
});

test("the cover keyframes are generated from figma's snippets with every timing and value kept", () => {
  for (const slug of Object.keys(coverMotion)) {
    const css = readFileSync(coverMotionPath(slug), "utf8");
    assert.equal(css, coverMotionCss(slug), `${slug} stylesheet is fresh (node scripts/build-cover-motion.mjs)`);
    for (const { nodeId, codeSnippets } of readMotion(slug).nodes) {
      const { declarations, keyframes } = splitSnippet(codeSnippets.css);
      assert.ok(css.includes(`[data-node="${nodeId}"] { ${scalePx(declarations)} }`), `${slug} ${nodeId} animation`);
      for (const rule of keyframes) {
        assert.ok(css.includes(scalePx(rule)), `${slug} ${nodeId} keyframes`);
        // only px lengths change: stops, easings and unitless values are figma's text.
        assert.equal(scalePx(rule).replace(/calc\((-?[\d.]+) \* var\(--u\)\)/g, "$1px"), rule);
      }
    }
  }
  // the html exhibit loops (elms's send path) come from their own export the same way.
  for (const slug of Object.keys(loopMotion)) {
    const css = readFileSync(coverMotionPath(slug), "utf8");
    assert.equal(css, loopMotionCss(slug), `${slug} stylesheet is fresh (node scripts/build-cover-motion.mjs)`);
    for (const { nodeId, codeSnippets } of readMotion(slug).nodes) {
      const { declarations, keyframes, properties } = splitSnippet(codeSnippets.css);
      assert.ok(css.includes(`[data-node="${nodeId}"] { ${scalePx(declarations)} }`), `${slug} ${nodeId} animation`);
      for (const rule of [...keyframes, ...properties]) assert.ok(css.includes(scalePx(rule)), `${slug} ${nodeId} keyframes`);
    }
  }
  assert.equal(scalePx("translate: 138.6px -104.4px; width: 0.01px; filter: blur(0px);"), "translate: calc(138.6 * var(--u)) calc(-104.4 * var(--u)); width: calc(0.01 * var(--u)); filter: blur(0px);");
});

test("motion cover copy uses real figures and DC names in place of the capstone personas", () => {
  const text = (slug) => motionLayers(coverMotion[slug].layers).flatMap(({ text: value }) => (value ? [value] : []));
  const ovara = text("ovara");
  for (const figure of ["Arkansas", "20.5", "U.S. 30.06", "1,029", "10.9M RESIDENTS", "providers per 100k", "counties with zero providers"]) assert.ok(ovara.includes(figure), `ovara shows ${figure}`);
  // nothing else numeric: the figures come from the published ovara analysis.
  const numbers = ovara.join(" ").match(/\d[\d.,]*/g);
  assert.deepEqual([...new Set(numbers)].sort(), ["1,029", "10.9", "100", "20.5", "30.06"]);
  const kairo = text("kairo-health");
  for (const value of ["55 of 56", "won by the zero-shot model", "Extract", "PEDIATRIC TRIAGE"]) assert.ok(kairo.includes(value), `kairo shows ${value}`);
  // the site's jetbrains mono has no ✓, so each llm chip draws the font's own check as an svg in the glyph's cell.
  assert.doesNotMatch(kairo.join(" "), /✓/);
  const llmChips = motionLayers(coverMotion["kairo-health"].layers).filter(({ node }) => readMotion("kairo-health").nodes.some(({ nodeId, nodeName }) => nodeId === node && nodeName === "Chip LLM ✓"));
  assert.equal(llmChips.length, 3);
  for (const { children } of llmChips) assert.deepEqual(children.map(({ text: value, svg, box }) => value ?? (svg && box)), ["LLM", [20.4, 3, 3.6, 7.92]]);
  assert.ok(JSON.stringify(caseStudies.find(({ slug }) => slug === "kairo-health")).includes('"value":"55 of 56"'), "55 of 56 is the case study's figure");
  const capstone = text("college-park-capstone");
  assert.ok(capstone.includes("17") && capstone.includes("of 24 follow no city channel"), "the tally is 17 of 24");
  assert.equal(motionNodes("college-park-capstone").filter((node) => readMotion("college-park-capstone").nodes.find(({ nodeId, nodeName }) => nodeId === node && nodeName === "Seg fill")).length, 17, "17 segments fill");
  assert.ok(capstone.includes("Diana") && capstone.includes("D"), "persona is Diana");
  assert.ok(capstone.includes("JOURNEY · BRUCE"), "journey follows Bruce");
  for (const slug of Object.keys(coverMotion)) {
    assert.doesNotMatch(text(slug).join(" "), /Maria|Tyler|caveats?|limitations?|future (work|improvements?)|next steps/i, slug);
  }
  // the card and hero alts describe what each cover plays.
  const alts = {
    "college-park-capstone": ["survey", "None of these", "17 of 24", "Diana", "Bruce", "journey curve"],
    ovara: ["Arkansas", "search", "county map", "20.5", "U.S. 30.06", "1,029"],
    "kairo-health": ["scanned pediatric triage form", "Extract", "noisy values", "55 of 56"],
  };
  for (const [slug, words] of Object.entries(alts)) {
    const study = caseStudies.find((entry) => entry.slug === slug);
    for (const alt of [study.cardAlt, study.heroAlt]) for (const word of words) assert.ok(alt.includes(word), `${slug} alt names ${word}`);
  }
});

test("no temporary figma asset urls are left in the source or the public files", () => {
  const root = new URL("../", import.meta.url);
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = new URL(entry.name + (entry.isDirectory() ? "/" : ""), dir);
      if (entry.isDirectory()) walk(path);
      else if (/\.(astro|mjs|ts|css|json|svg|html)$/.test(entry.name)) files.push(path);
    }
  };
  for (const dir of ["src/", "public/"]) walk(new URL(dir, root));
  for (const file of files) assert.doesNotMatch(readFileSync(file, "utf8"), /figma\.com\/api\/mcp\/asset/, file.pathname);
});

test("the civic case study uses the approved User Research Capstone name", () => {
  const capstone = getProjectBySlug("college-park-capstone");

  assert.equal(capstone.title, "User Research Capstone");
  assert.equal(capstone.cardTitle, "User Research Capstone");
});

test("the Capstone preserves the two survey cohorts and their decision evidence", () => {
  const capstone = getProjectBySlug("college-park-capstone");
  const survey = capstone.sections.find(({ id }) => id === "survey-audit");

  assert.deepEqual(capstone.evidence.surveyResponses, {
    students: 24,
    residents: 9,
  });
  assert.deepEqual(survey.artifact.rows, [
    ["UMD students", "Event attendance", "22 of 24 had not attended a city event", "Discovery is the first problem, not persuasion"],
    ["UMD students", "Channels followed", "17 of 24 followed none; 7 Instagram, 2 Twitter, 1 Facebook", "More posts on the same accounts will not reach them"],
    ["UMD students", "Interest", "14 somewhat interested, 2 very interested, 8 not interested", "Interest is real and it is not universal"],
    ["UMD students", "Preferred updates", "20 of 23 chose social media; 9 email; 9 text; 6 bulletins; 4 campus calendar", "No single channel covers the cohort"],
    ["College Park residents", "Channels followed", "4 of 9 followed none; 3 Facebook, 2 Instagram, 2 Twitter", "The same gap appears, on nine answers"],
    ["College Park residents", "Preferred updates", "6 of 9 chose email; 5 text; 4 bulletins; 3 social", "Residents ask for direct channels, students ask for social"],
  ]);
});

test("Ovara publishes the real analytical product evidence and repository", () => {
  const ovara = getProjectBySlug("ovara");
  const media = ovara.sections.flatMap((section) => section.media ?? []);

  assert.ok(
    ovara.links.some(
      ({ href }) =>
        href === "https://github.com/kennethyeaher/inst737-final-project-kenneth-yeaher",
    ),
  );
  assert.ok(media.some(({ src }) => src.endsWith("ovara-dashboard-state.jpg")));
  assert.ok(media.some(({ src }) => src.endsWith("ovara-dashboard-map.jpg")));
  assert.ok(media.some(({ src }) => src.endsWith("ovara-dashboard-county.jpg")));
  assert.ok(media.some(({ src }) => src.endsWith("ovara-dashboard-map.jpg")));
  assert.equal(media.some(({ src }) => src.endsWith("ovara-dashboard.png")), false);
  assert.deepEqual(
    media
      .filter(({ src }) => /ovara-(cover|method|benchmark|county-scale)\.png$/.test(src))
      .map(({ src }) => src),
    [],
  );
});

test("TerpCare documents the full fifteen-screen system and uses original Figma exports", () => {
  const terpcare = getProjectBySlug("terpcare");

  assert.equal(terpcare.screenInventory.length, 15);
  assert.equal(new Set(terpcare.screenInventory.map(({ name }) => name)).size, 15);
  assert.ok(
    terpcare.sections
      .flatMap((section) => section.media ?? [])
      .filter(({ src }) => src.includes("/figma-")).length >= 6,
  );
});

test("TerpCare presents readable exports without the unusable Figma canvas atlas", () => {
  const terpcare = getProjectBySlug("terpcare");
  const highFidelity = terpcare.sections.find(({ id }) => id === "high-fidelity");
  const mediaSources = highFidelity.media.map(({ src }) => src);

  assert.equal(
    mediaSources.some((src) => src.endsWith("terpcare-figma-atlas.jpg")),
    false,
  );
  assert.deepEqual(mediaSources, [
    "/images/work/terpcare/figma-campaign-news.png",
    "/images/work/terpcare/figma-discussion-recents.png",
    "/images/work/terpcare/figma-discussion-create.png",
    "/images/work/terpcare/figma-resources-therapy.png",
    "/images/work/terpcare/figma-book-appointment.png",
    "/images/work/terpcare/figma-login.png",
    "/images/work/terpcare/terpcare-home.png",
    "/images/work/terpcare/terpcare-discussion.png",
    "/images/work/terpcare/terpcare-mood-calendar.png",
  ]);
});

test("Kairo connects benchmark results to a deployment routing decision", () => {
  const kairo = getProjectBySlug("kairo-health");

  assert.ok(kairo.sections.some(({ id }) => id === "deployment-routing"));
  assert.equal(kairo.evidence.heavyNoiseMcNemarP, 1.6e-15);
  assert.equal(kairo.evidence.totalHallucinations, 5);
});

test("Kairo publishes the corrected safety finding and a reproducible pipeline", () => {
  const kairo = getProjectBySlug("kairo-health");
  const sectionIds = kairo.sections.map(({ id }) => id);

  for (const id of ["triage-safety", "reproducibility", "audit"]) {
    assert.ok(sectionIds.includes(id), `kairo-health is missing the ${id} section`);
  }

  assert.equal(kairo.evidence.reproducibleWithoutApiKey, true);
  assert.equal(kairo.evidence.cachedModelResponses, 146);
});

test("every case includes at least one source-backed visual artifact beyond screenshots", () => {
  for (const project of projects) {
    assert.ok(
      project.sections.some((section) => "artifact" in section),
      `${project.slug} needs a designed evidence artifact`,
    );
  }
});

test("case-study records preserve the approved evidence boundaries", () => {
  const capstone = getProjectBySlug("college-park-capstone");
  const ovara = getProjectBySlug("ovara");
  const kairo = getProjectBySlug("kairo-health");
  const terpcare = getProjectBySlug("terpcare");
  const terpcarehub = getProjectBySlug("terpcarehub");

  assert.deepEqual(capstone.metrics.map(({ value }) => value), ["17 of 24", "5", "3"]);
  assert.equal(ovara.evidence.modelStatus, "negative result at state level, direct count at county level");
  assert.equal(ovara.evidence.crossValidationR2, 0.1244);
  assert.equal(ovara.evidence.zeroProviderCounties, 1029);
  assert.equal(ovara.evidence.populationInZeroProviderCounties, 10917875);
  assert.equal(ovara.evidence.stateRiskTiers, false);
  assert.equal(kairo.evidence.syntheticDocuments, 150);
  assert.equal(kairo.evidence.heavyNoiseUndertriage, "2 of 30");
  assert.equal(terpcare.evidence.directUserTesting, false);
  assert.equal(terpcarehub.evidence.directUserTesting, false);
});

test("unknown slugs fail closed", () => {
  assert.equal(getProjectBySlug("not-a-project"), undefined);
  assert.throws(
    () => getAdjacentProject("not-a-project", "next"),
    /Unknown project slug/,
  );
});

// pages on the v2 exhibit layout.
const exhibitSlugs = ["kairo-health", "ovara", "terpcarehub", "college-park-capstone", "frontground", "terpcare", "sohive", "elms-redesign"];

// figma rails for pages whose spec export carries no chapter list, read from the frame's chapter rail.
// terpcarehub 90:1631 replaced the find care loop with a walkthrough and dropped the provider card stage.
// redesign 2 (206:1840) adds booking to terpcarehub, offline and triage to frontground, and two flow stages to sohive.
const figmaRails = {
  ovara: ["01 Overview", "02 The dashboard", "03 The finding", "04 Corrections", "05 Design", "06 Reflection"],
  terpcarehub: ["01 Overview", "02 Core flows", "03 The measure", "04 Where it landed", "05 Design system", "06 Booking", "07 Reflection"],
  frontground: ["01 Overview", "02 Core flows", "03 The problem", "04 The solution", "05 The system", "06 Offline", "07 Triage", "08 Where it stands"],
  sohive: ["01 Overview", "02 Core flows", "03 The feed", "04 The audit", "05 Identity", "06 RSVP outcomes", "07 Host side", "08 Reflection"],
};


test("exhibits are optional and only the converted pages opt in", () => {
  for (const project of projects) {
    if (exhibitSlugs.includes(project.slug)) continue;
    assert.equal(project.exhibits, undefined, `${project.slug} should keep the current layout`);
  }
  for (const slug of exhibitSlugs) {
    const project = getProjectBySlug(slug);
    // figma's rail is the chapter list (checked in the spec test). a rail chapter with no exhibit shows its
    // existing prose, so every prose chapter needs text in the data; sections off the rail do not render.
    const prose = project.exhibits.filter(({ kind }) => kind === "section");
    for (const { section } of prose) {
      assert.ok(project.sections.find(({ id }) => id === section)?.body.length, `${slug} closing chapter ${section} needs prose in the data`);
    }
    for (const exhibit of project.exhibits) {
      for (const visual of exhibit.visuals ?? []) {
        assert.ok(visual.alt && visual.width > 0 && visual.height > 0, `${slug} ${exhibit.id} visual needs alt and size`);
      }
      for (const annotation of exhibit.annotations ?? []) {
        // an annotation needs a note to point at, unless the exhibit explains itself with captions instead.
        if (!exhibit.captions) assert.ok(exhibit.notes.some(({ n }) => n === annotation.num), `${slug} ${exhibit.id} annotation ${annotation.num} needs a note`);
      }
      assert.ok((exhibit.annotations ?? []).length <= 4, `${slug} ${exhibit.id} carries at most four annotations`);
      for (const stage of exhibit.kind === "pair" ? exhibit.stages : []) {
        assert.ok((stage.annotations ?? []).length <= 4, `${slug} ${exhibit.id} stage carries at most four annotations`);
        for (const visual of stage.visuals) assert.ok(visual.alt && visual.width > 0 && visual.height > 0, `${slug} ${exhibit.id} stage visual needs alt and size`);
      }
    }
  }
  assert.deepEqual(getProjectBySlug("kairo-health").exhibits.map(({ kind }) => kind), ["hero", "stage", "stage", "journey", "section"]);
  assert.deepEqual(getProjectBySlug("ovara").exhibits.map(({ kind }) => kind), ["hero", "rows", "stage", "custom", "section", "section"]);
  assert.deepEqual(getProjectBySlug("terpcarehub").exhibits.map(({ kind }) => kind), ["hero", "rows", "custom", "stage", "custom", "rows", "section"]);
  assert.deepEqual(getProjectBySlug("college-park-capstone").exhibits.map(({ kind }) => kind), ["hero", "heatmap", "stage", "journey", "section"]);
  assert.deepEqual(getProjectBySlug("frontground").exhibits.map(({ kind }) => kind), ["hero", "rows", "custom", "stage", "section", "stage", "stage", "section"]);
  assert.deepEqual(getProjectBySlug("terpcare").exhibits.map(({ kind }) => kind), ["hero", "journey", "stage", "rows", "rows", "stage", "stage", "section"]);
  assert.deepEqual(getProjectBySlug("sohive").exhibits.map(({ kind }) => kind), ["hero", "rows", "pair", "custom", "section", "stage", "stage", "section"]);
  assert.deepEqual(getProjectBySlug("elms-redesign").exhibits.map(({ kind }) => kind), ["hero", "custom", "stage", "stage", "stage", "journey", "section"]);
});

/** every phone an exhibit draws: on the exhibit, on a pair stage, on a stage's rows and on walkthrough steps. */
function phones(exhibit) {
  const framed = [...(exhibit.visuals ?? []), ...(exhibit.stages ?? []).flatMap((stage) => stage.visuals ?? []), ...(exhibit.rows?.visuals ?? [])];
  return [...framed.filter(({ frame }) => frame === "iphone"), ...(exhibit.walkthrough?.steps ?? []).map((step) => step.screen)];
}

test("phones added in redesign 2 fit their screens whole, and the older phones keep cover", () => {
  const added = { frontground: [], sohive: ["rsvp-outcomes", "host-side"], terpcarehub: ["booking"], terpcare: ["overview", "the-original", "get-support-now", "book", "mood-check-in", "privacy"] };
  for (const slug of exhibitSlugs) {
    for (const exhibit of getProjectBySlug(slug).exhibits) {
      for (const visual of phones(exhibit)) {
        // terpcarehub's find care hero and walkthrough screens were re-exported phone height with the status bar (oct 12).
        const refit = slug === "terpcarehub" && (exhibit.walkthrough?.steps.some(({ screen }) => screen === visual) || visual.src.endsWith("mobile-find-care.png"));
        if ((added[slug] ?? []).includes(exhibit.id) || refit) {
          assert.equal(visual.fit, "contain", `${slug} ${exhibit.id} ${visual.src} fits`);
          assert.match(visual.bg, /^#[0-9a-f]{6}$/i, `${slug} ${exhibit.id} ${visual.src} has a screen colour`);
        } else assert.equal(visual.fit, undefined, `${slug} ${exhibit.id} ${visual.src} keeps cover`);
      }
    }
  }
  // find care is one phone-height capture everywhere; the pins phone (119:71) fits it whole on white too, so its home
  // indicator clears the tab labels at 390, with its pins re-measured onto the same capture pixels.
  const hub = getProjectBySlug("terpcarehub");
  const findCare = [hub.cover.exhibit, ...hub.exhibits.flatMap((exhibit) => [...phones(exhibit), ...(exhibit.pins ? [exhibit.pins.visual] : [])]), ...hub.sections.flatMap(({ media }) => media ?? [])]
    .filter(({ src }) => src.endsWith("mobile-find-care.png"));
  // the pins phone gave way to the find care loop (.private/terpcarehub-loops).
  assert.equal(findCare.length, 5);
  for (const visual of findCare) assert.deepEqual([visual.width, visual.height], [780, 1688]);
  assert.equal(hub.exhibits.find(({ pins }) => pins), undefined);
});

test("terpcare reads as a before and after: the 2024 header facts stay, the year, summary and metrics move", () => {
  const terpcare = getProjectBySlug("terpcare");
  assert.equal(terpcare.year, "2024, redesigned 2026");
  // the home card shows the redesign year (figma 428:2704); the case study header keeps both years.
  assert.equal(terpcare.cardYear, "2026");
  // the capstone card keeps the year the work was made.
  assert.equal(getProjectBySlug("college-park-capstone").cardYear ?? getProjectBySlug("college-park-capstone").year, "2024");
  assert.deepEqual([terpcare.role, terpcare.timeline, terpcare.team], ["Product Designer", "Spring 2024", "Four-person course team"]);
  const metrics = [["15", "screens in the 2024 team concept"], ["57", "screens in the 2026 solo redesign"], ["4", "flows that play end to end"]];
  assert.deepEqual(terpcare.metrics.map(({ value, label }) => [value, label]), metrics);
  assert.deepEqual(terpcare.exhibits[0].metrics.map(({ value, label }) => [value, label]), metrics);
  assert.equal(terpcare.exhibits.find(({ id }) => id === "the-original").zoom, true);
  assert.deepEqual(terpcare.sections.find(({ id }) => id === "reflection").body, terpcare.exhibits.at(-1).lede);
  assert.equal(terpcare.cover.exhibit.src, "/images/work/terpcare/terpcare-mood-calendar.png");
});

/** split prose into sentences, keeping decimals such as 0.91 and initials inside one sentence. */
function sentences(text) {
  return text.split(/(?<=[.?!])\s+(?=[A-Z0-9])/).map((sentence) => sentence.trim()).filter(Boolean);
}

// the "+ prose (mock)" frames in figma section 07, exported to .private/redesign-spec/prose.json, set each
// page's rail, chapter heads and ledes.
const prosePath = new URL("../.private/redesign-spec/prose.json", import.meta.url);
// ci has no .private, so it reads the approved paragraphs from a committed fixture (scripts/build-approved-ledes.mjs).
const fixturePath = new URL("./fixtures/approved-ledes.json", import.meta.url);

/** per slug, each chapter's approved paragraphs: from the prose export when present, else the fixture. */
function approvedParagraphs() {
  return existsSync(prosePath) ? approvedLedes(readProse()) : JSON.parse(readFileSync(fixturePath, "utf8"));
}

// pages built from their prose mock (figma section 07); every page joins as it is built.
const ledeSlugs = ["kairo-health", "ovara", "terpcarehub", "college-park-capstone", "frontground", "terpcare", "sohive", "elms-redesign"];

/** every lede sentence of a chapter; a prose chapter with no lede of its own reads its section text. */
function ledeSentences(project, exhibit) {
  const paragraphs = exhibit.lede ?? project.sections.find(({ id }) => id === exhibit.section).body;
  return paragraphs.flatMap((paragraph) => typeof paragraph === "string"
    ? sentences(paragraph).map((text) => ({ text }))
    : paragraph.map((sentence) => (typeof sentence === "string" ? { text: sentence } : sentence)));
}

test("every lede sentence on a converted page is that page's own copy", () => {
  const approvedBySlug = approvedParagraphs();
  for (const slug of ledeSlugs) {
    const project = getProjectBySlug(slug);
    // a page's copy is its section text, the captions of its section media, and the paragraphs approved in its prose mock.
    const approved = approvedBySlug[slug].flat();
    const prose = [...project.sections.flatMap(({ body, media }) => [...body, ...(media ?? []).map(({ caption }) => caption)]), ...approved].join("\n");
    for (const exhibit of project.exhibits) {
      const lede = ledeSentences(project, exhibit);
      assert.ok(lede.length > 0, `${slug} ${exhibit.id} has a lede`);
      for (const sentence of lede) {
        if (!sentence.newCopy) assert.ok(prose.includes(sentence.text), `${slug} ${exhibit.id} lede sentence is not verbatim: ${sentence.text}`);
      }
    }
  }
});

const mockSlugs = ["kairo-health", "ovara", "terpcarehub", "college-park-capstone", "frontground", "terpcare", "sohive", "elms-redesign"];

test("the approved lede fixture matches the prose export", { skip: !existsSync(prosePath) && "prose export not present" }, () => {
  const expected = approvedLedes(readProse());
  assert.deepEqual(JSON.parse(readFileSync(fixturePath, "utf8")), expected, "tests/fixtures/approved-ledes.json is out of date; run node scripts/build-approved-ledes.mjs");
});

test("converted pages follow their prose mock word for word", { skip: !existsSync(prosePath) && "prose export not present" }, () => {
  const mocks = readProse();
  for (const slug of mockSlugs) {
    const project = getProjectBySlug(slug);
    const mock = mocks[slug];
    assert.deepEqual(project.exhibits.map(({ chapter }, index) => `0${index + 1} ${chapter}`), mock.rail, `${slug} rail matches the mock`);
    assert.equal(project.exhibits.length, mock.chapters.length);
    for (const [exhibit, chapter] of project.exhibits.map((exhibit, index) => [exhibit, mock.chapters[index]])) {
      assert.deepEqual(exhibit.lede, chapter.paragraphs, `${slug} ${exhibit.id} lede matches the mock`);
      assert.deepEqual([exhibit.eyebrow, exhibit.heading], [chapter.eyebrow, chapter.heading], `${slug} ${exhibit.id} head matches the mock`);
    }
  }
});

const replacedRows = new Set(["frontground offline", "frontground triage"]);
// sohive's four phone stages gave way to one wide recorded loop each (.private/sohive-loops), with the phones, the
// colour field and the outcomes baked in, so the spec's visuals and focus boxes stand replaced; the notes stay.
// terpcare's mood check-in and privacy, and terpcarehub's where it landed with its pins stage, went the same way
// (.private/terpcare-loops, .private/terpcarehub-loops), and those drop their notes, pins and captions too.
const replacedStages = new Set(["sohive rsvp-outcomes", "sohive host-side", "terpcare mood-check-in", "terpcare privacy", "terpcarehub where-it-landed"]);
const notesKept = new Set(["sohive rsvp-outcomes", "sohive host-side"]);

/** compare one converted page against its spec export: chapters, hero, and every exhibit's copy and boxes. */
function assertMatchesSpec(slug) {
  const spec = JSON.parse(readFileSync(specPath, "utf8")).pages.find((page) => page.slug === slug);
  const project = getProjectBySlug(slug);
  const [hero, ...rest] = project.exhibits;
  const [specHero, ...specRest] = spec.sections;

  assert.deepEqual(hero.metrics.map(({ value, label }) => [value, label]), spec.metrics);
  if (specHero.kpi) {
    assert.deepEqual(
      { eyebrow: hero.kpi.eyebrow, value: hero.kpi.value, label: hero.kpi.label },
      { eyebrow: specHero.kpi.eyebrow, value: specHero.kpi.value, label: specHero.kpi.label },
    );
  } else assert.equal(hero.kpi, undefined);
  assert.deepEqual(hero.visuals.map(({ rot, at }) => [rot, at]), specHero.visuals.map(({ rot, stagePct }) => [rot, stagePct]));
  // figma's rail is the chapter list: every rail chapter renders, numbered as figma numbers it.
  // some spec pages point at the frame's rail instead of listing chapters; those rails live in figmaRails.
  const rail = (Array.isArray(spec.chapters) ? spec.chapters : figmaRails[slug]).map((chapter) => chapter.replace(/\s+/g, " "));
  assert.deepEqual(project.exhibits.map(({ chapter }, index) => `0${index + 1} ${chapter}`), rail);
  for (const [built, source] of rest.filter(({ kind }) => kind !== "section").map((exhibit, index) => [exhibit, specRest[index]])) {
    assert.equal(built.figma, source.id);
    assert.equal(built.eyebrow, source.eyebrow);
    assert.equal(built.heading, source.heading);
    if (replacedStages.has(`${slug} ${built.id}`)) {
      assert.deepEqual([built.visuals, built.annotations, built.loops.layout], [undefined, undefined, "wide"], `${slug} ${built.id} keeps what its loop replaced`);
      if (notesKept.has(`${slug} ${built.id}`)) assert.deepEqual(built.notes, source.notes);
      else assert.deepEqual([built.notes, built.pins, built.captions], [undefined, undefined, undefined], `${slug} ${built.id} keeps notes, pins or captions`);
      // a row's caption can move into a lead block above the stage, word for word. zigzag rows (terpcare dark mode,
      // figma 64:795) carry an eyebrow on each caption and add rows past the spec's, held to their approved wording.
      const rowCaptions = built.rows?.lead ? [{ title: built.rows.lead.title, body: built.rows.lead.body }] : built.rows?.captions.map(({ title, body }) => ({ title, body }));
      if (source.rows) assert.deepEqual(rowCaptions?.slice(0, source.rows.captions.length), source.rows.captions, `${slug} ${built.id} row captions`);
      if (source.rows && !built.rows.zigzag) assert.equal(rowCaptions.length, source.rows.captions.length, `${slug} ${built.id} row count`);
      if (built.rows?.lead) assert.deepEqual([built.rows.lead.eyebrow, built.rows.captions], ["DARK MODE", []], `${slug} ${built.id} lead replaces the side caption`);
      if (built.rows?.zigzag) assert.deepEqual(built.rows.captions.map(({ eyebrow }) => eyebrow), ["DARK MODE", "DARK MODE · MONTH"], `${slug} ${built.id} zigzag eyebrows`);
      if (built.rows?.zigzag) assert.deepEqual(rowCaptions.slice(source.rows.captions.length), [{ title: "The month keeps its meaning", body: "The October month is the same frame with the Dark mode switched on. Each level keeps its colour and its bar count, and missed days stay blank in both." }], `${slug} ${built.id} zigzag month row`);
      continue;
    }
    if (source.notes) assert.deepEqual(built.notes, source.notes);
    if (source.annotations) {
      // a pair carries its annotations per stage; stage i holds the spec's visual i.
      // a native annotation names a row or column of a rendered table; the rest sit on a visual.
      const annotations = built.annotations?.map((annotation) => ({ ...annotation, host: annotation.target ? "native" : annotation.on === undefined ? "stage" : source.visuals[annotation.on].id }))
        ?? built.stages.flatMap((stage, index) => stage.annotations.map((annotation) => ({ ...annotation, host: source.visuals[index].id })));
      // a box is a share of its visual (pct) or, for leaders placed on the stage, of the stage (stagePct).
      // a leader the spec ties only to a row (sohive 58:870) has no box there; it is measured from figma instead.
      assert.deepEqual(annotations.map(({ num, at }, index) => [num, source.annotations[index].row ? undefined : at]), source.annotations.map(({ num, pct, stagePct }) => [num, pct ?? stagePct]));
      assert.deepEqual(annotations.map(({ host }) => host), source.annotations.map(({ on, row }) => on ?? (row ? source.visuals[row - 1].id : "stage")));
      assert.deepEqual(annotations.map(({ label }) => label), source.annotations.map(({ label }) => label));
      assert.deepEqual(annotations.map(({ target }) => target), source.annotations.map(({ target }) => target));
    }
    if (source.visuals && built.kind === "stage") assert.deepEqual(built.visuals.map(({ at }) => at), source.visuals.map(({ stagePct }) => stagePct));
    if (source.captions) {
      assert.deepEqual(built.captions, source.captions);
      if (source.visuals) assert.equal((built.visuals ?? built.stages).length, source.visuals.length);
    }
    if (source.text) assert.deepEqual([built.text, built.footnote], [source.text, source.footnote]);
    if (source.walkthrough) {
      assert.equal(built.walkthrough.figma, source.walkthrough.id);
      assert.equal(built.walkthrough.tag, source.walkthrough.tag);
      assert.deepEqual(built.walkthrough.steps.map(({ label, title, body }) => ({ label, title, body })), source.walkthrough.steps);
    }
    if (source.pins) {
      assert.deepEqual([built.pins.figma, built.pins.ratio, built.pins.active], [source.pins.id, source.pins.stage, source.pins.active]);
      assert.deepEqual(built.pins.pins.map(({ n, title, body }) => ({ n, title, body })), source.pins.pins);
      assert.deepEqual(built.pins.caption, source.pins.caption);
    }
    if (source.captions && built.kind === "stage") assert.deepEqual(built.captions, source.captions);
    // a stage's rows (frontground 222:284, 222:392; terpcare 218:311): one visual and caption per row.
    // frontground's offline and triage rows gave way to recorded loops (.private/fg-loops/hifi), so the spec's rows stand replaced.
    if (source.rows && replacedRows.has(`${slug} ${built.id}`)) assert.equal(built.rows, undefined, `${slug} ${built.id} keeps rows its loops replaced`);
    else if (source.rows) {
      assert.deepEqual(built.rows.visuals.map(({ at }) => at), source.rows.visuals.map(({ stagePct }) => stagePct), `${slug} ${built.id} row boxes`);
      assert.deepEqual(built.rows.captions, source.rows.captions, `${slug} ${built.id} row captions`);
    } else if (built.kind === "stage") assert.equal(built.rows, undefined, `${slug} ${built.id} has rows the spec does not`);
    if (source.matrix) assert.deepEqual({ label: built.label, columns: built.columns, rows: built.rows }, source.matrix);
    if (source.heatmap) assert.deepEqual(Object.fromEntries(built.panels.map(({ label, columns, rows }) => [label, { columns, rows }])), source.heatmap);
    if (source.figure) assert.deepEqual([built.figure.label, built.figure.caption, built.figure.src.endsWith("journey-tyler.png")], [source.figure.label, source.figure.caption, true]);
    if (source.journey) {
      assert.deepEqual(built.stages, source.journey.stages);
      assert.equal(built.accentStage, source.journey.accentStage);
      assert.deepEqual(Object.fromEntries(built.rows.map(({ label, cells }) => [label, cells])), source.journey.rows);
      assert.deepEqual(built.strip, source.strip);
    }
  }
}

// elms came after the v2 spec export, so its copy is held to its own mock export (prose-elms.json) instead.
for (const slug of exhibitSlugs.filter((entry) => entry !== "elms-redesign")) {
  test(`${slug} exhibit copy matches the approved spec word for word`, { skip: !existsSync(specPath) && "spec export not present" }, () => assertMatchesSpec(slug));
}
