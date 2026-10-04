import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

import {
  experience,
  getAdjacentProject,
  getFeaturedProjects,
  getProjectBySlug,
  profile,
  projects,
} from "../src/data/portfolio.mjs";

const specPath = new URL("../.private/redesign-spec/v2-pages.json", import.meta.url);

const expectedOrder = [
  "usm-venture-benchmark",
  "ovara",
  "kairo-health",
  "terpcarehub",
  "college-park-capstone",
  "frontground",
  "terpcare",
  "sohive",
];

test("featured work returns the approved eight projects newest first", () => {
  assert.deepEqual(
    getFeaturedProjects().map((project) => project.slug),
    expectedOrder,
  );
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
    getAdjacentProject("usm-venture-benchmark", "previous").slug,
    "sohive",
  );
  assert.equal(
    getAdjacentProject("sohive", "next").slug,
    "usm-venture-benchmark",
  );
  assert.equal(
    getAdjacentProject("frontground", "previous").slug,
    "college-park-capstone",
  );
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

test("every featured project carries a project-palette motion cover and a substantial case narrative", () => {
  const minimumSections = new Map([
    ["frontground", 8],
    ["usm-venture-benchmark", 5],
    ["sohive", 8],
    ["college-park-capstone", 8],
    ["ovara", 8],
    ["kairo-health", 8],
    ["terpcare", 7],
    ["terpcarehub", 8],
  ]);

  for (const project of projects) {
    assert.match(project.cover.video, /\.mp4$/);
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

test("the USM benchmark publishes its method and aggregate QA without confidential findings", () => {
  const usm = getProjectBySlug("usm-venture-benchmark");
  const media = usm.sections.flatMap((section) => section.media ?? []);

  assert.equal(usm.category, "Venture Research + Data Visualization");
  assert.equal(usm.role, "Investment Associate");
  assert.deepEqual(
    usm.sections.map(({ id }) => id),
    ["comparison-problem", "benchmark-system", "evidence-design", "validation", "vc-lens"],
  );
  assert.deepEqual(usm.metrics.map(({ value }) => value), ["29", "22", "638"]);
  assert.equal(usm.evidence.finalizedProfiles, 29);
  assert.equal(usm.evidence.matrixFields, 22);
  assert.equal(usm.evidence.dataCells, 638);
  assert.equal(usm.evidence.correctedCells, 41);
  assert.equal(usm.evidence.changedToNotDisclosed, 9);
  assert.equal(usm.evidence.fieldLevelMismatches, 0);
  assert.equal(usm.evidence.unresolvedCitations, 0);
  assert.equal(usm.evidence.publicInstitutionFindings, false);
  assert.equal(usm.evidence.confidentialRecommendationsPublished, false);
  assert.deepEqual(
    media.map(({ src }) => src),
    [
      "/images/work/usm-venture-benchmark/research-system.png",
      "/images/work/usm-venture-benchmark/brief-overview-redacted.png",
      "/images/work/usm-venture-benchmark/brief-vehicles-redacted.png",
      "/images/work/usm-venture-benchmark/brief-portfolio-redacted.png",
      "/images/work/usm-venture-benchmark/brief-deep-dive-redacted.png",
      "/images/work/usm-venture-benchmark/comparison-model.png",
      "/images/work/usm-venture-benchmark/validation-grid.png",
      "/images/work/usm-venture-benchmark/transferability-lens.png",
    ],
  );
  assert.equal("links" in usm, false);
  assert.match(
    usm.sections.find(({ id }) => id === "benchmark-system").body.join(" "),
    /designed the six-page brief system/,
  );
});

test("the civic case study uses the approved Information Science Capstone name", () => {
  const capstone = getProjectBySlug("college-park-capstone");

  assert.equal(capstone.title, "Information Science Capstone");
  assert.equal(capstone.cardTitle, "Information Science Capstone");
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
  const usm = getProjectBySlug("usm-venture-benchmark");
  const capstone = getProjectBySlug("college-park-capstone");
  const ovara = getProjectBySlug("ovara");
  const kairo = getProjectBySlug("kairo-health");
  const terpcare = getProjectBySlug("terpcare");
  const terpcarehub = getProjectBySlug("terpcarehub");

  assert.deepEqual(capstone.metrics.map(({ value }) => value), ["17 of 24", "5", "3"]);
  assert.equal(usm.evidence.publicInstitutionFindings, false);
  assert.equal(usm.evidence.confidentialRecommendationsPublished, false);
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
const exhibitSlugs = ["kairo-health", "usm-venture-benchmark", "ovara"];

// figma rails for pages whose spec export carries no chapter list, read from the frame's chapter rail.
const figmaRails = {
  ovara: ["01 Overview", "02 The dashboard", "03 The finding", "04 Corrections", "05 Design", "06 Reflection"],
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
        assert.ok(exhibit.notes.some(({ n }) => n === annotation.num), `${slug} ${exhibit.id} annotation ${annotation.num} needs a note`);
      }
      assert.ok((exhibit.annotations ?? []).length <= 4, `${slug} ${exhibit.id} carries at most four annotations`);
    }
  }
  assert.deepEqual(getProjectBySlug("kairo-health").exhibits.map(({ kind }) => kind), ["hero", "stage", "stage", "journey", "section"]);
  assert.deepEqual(getProjectBySlug("usm-venture-benchmark").exhibits.map(({ kind }) => kind), ["hero", "stage", "stage", "journey", "section"]);
  assert.deepEqual(getProjectBySlug("ovara").exhibits.map(({ kind }) => kind), ["hero", "rows", "stage", "custom", "section", "section"]);
});

/** split prose into sentences, keeping decimals such as 0.91 and initials inside one sentence. */
function sentences(text) {
  return text.split(/(?<=[.?!])\s+(?=[A-Z0-9])/).map((sentence) => sentence.trim()).filter(Boolean);
}

// pages built from their prose mock (figma section 07); every page joins as it is built.
const ledeSlugs = ["kairo-health", "usm-venture-benchmark"];

/** every lede sentence of a chapter; a prose chapter with no lede of its own reads its section text. */
function ledeSentences(project, exhibit) {
  const paragraphs = exhibit.lede ?? project.sections.find(({ id }) => id === exhibit.section).body;
  return paragraphs.flatMap((paragraph) => typeof paragraph === "string"
    ? sentences(paragraph).map((text) => ({ text }))
    : paragraph.map((sentence) => (typeof sentence === "string" ? { text: sentence } : sentence)));
}

test("every lede sentence on a converted page is that page's own copy", () => {
  for (const slug of ledeSlugs) {
    const project = getProjectBySlug(slug);
    // a page's copy is its section text and the captions of its section media.
    const prose = project.sections.flatMap(({ body, media }) => [...body, ...(media ?? []).map(({ caption }) => caption)]).join("\n");
    for (const exhibit of project.exhibits) {
      const lede = ledeSentences(project, exhibit);
      assert.ok(lede.length > 0, `${slug} ${exhibit.id} has a lede`);
      for (const sentence of lede) {
        if (!sentence.newCopy) assert.ok(prose.includes(sentence.text), `${slug} ${exhibit.id} lede sentence is not verbatim: ${sentence.text}`);
      }
    }
  }
});

// the "+ prose (mock)" frames in figma section 07, exported to .private/redesign-spec/prose.json, set each
// page's rail, chapter heads and ledes.
const prosePath = new URL("../.private/redesign-spec/prose.json", import.meta.url);
const mockSlugs = ["kairo-health", "usm-venture-benchmark"];

test("converted pages follow their prose mock word for word", { skip: !existsSync(prosePath) && "prose export not present" }, () => {
  const mocks = JSON.parse(readFileSync(prosePath, "utf8"));
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
  const rail = (spec.chapters ?? figmaRails[slug]).map((chapter) => chapter.replace(/\s+/g, " "));
  assert.deepEqual(project.exhibits.map(({ chapter }, index) => `0${index + 1} ${chapter}`), rail);
  for (const [built, source] of rest.filter(({ kind }) => kind !== "section").map((exhibit, index) => [exhibit, specRest[index]])) {
    assert.equal(built.figma, source.id);
    assert.equal(built.eyebrow, source.eyebrow);
    assert.equal(built.heading, source.heading);
    if (source.notes) assert.deepEqual(built.notes, source.notes);
    if (source.annotations) {
      assert.deepEqual(built.annotations.map(({ num, at }) => [num, at]), source.annotations.map(({ num, pct }) => [num, pct]));
      assert.deepEqual(built.annotations.map(({ on }) => built.visuals[on] && source.visuals[on].id), source.annotations.map(({ on }) => on));
    }
    if (source.visuals && built.kind === "stage") assert.deepEqual(built.visuals.map(({ at }) => at), source.visuals.map(({ stagePct }) => stagePct));
    if (source.captions) {
      assert.deepEqual(built.captions, source.captions);
      assert.equal(built.visuals.length, source.visuals.length);
    }
    if (source.text) assert.deepEqual([built.text, built.footnote], [source.text, source.footnote]);
    if (source.journey) {
      assert.deepEqual(built.stages, source.journey.stages);
      assert.equal(built.accentStage, source.journey.accentStage);
      assert.deepEqual(Object.fromEntries(built.rows.map(({ label, cells }) => [label, cells])), source.journey.rows);
      assert.deepEqual(built.strip, source.strip);
    }
  }
}

for (const slug of exhibitSlugs) {
  test(`${slug} exhibit copy matches the approved spec word for word`, { skip: !existsSync(specPath) && "spec export not present" }, () => assertMatchesSpec(slug));
}
