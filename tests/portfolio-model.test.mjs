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

const expectedOrder = [
  "college-park-capstone",
  "ovara",
  "kairo-health",
  "terpcare",
  "cognitive-wellness-garden",
];

test("featured work returns the approved five projects in narrative order", () => {
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
    getAdjacentProject("college-park-capstone", "previous").slug,
    "cognitive-wellness-garden",
  );
  assert.equal(
    getAdjacentProject("cognitive-wellness-garden", "next").slug,
    "college-park-capstone",
  );
});

test("the public identity uses the corrected professional title", () => {
  assert.equal(
    profile.roleLine,
    "Product Specialist, Data Scientist, Venture Capitalist",
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
    ["college-park-capstone", 8],
    ["ovara", 8],
    ["kairo-health", 8],
    ["terpcare", 7],
    ["cognitive-wellness-garden", 5],
  ]);

  for (const project of projects) {
    assert.match(project.cover.video, /cover-gradient\.mp4$/);
    assert.match(project.cover.poster, /cover-gradient-poster\.png$/);
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
    ["UMD students", "Event attendance", "22 of 24 had not attended a city event", "Close the discovery gap"],
    ["UMD students", "Preferred updates", "20 of 23 chose social media; 9 email; 9 text", "Use a coordinated channel mix"],
    ["UMD students", "Interest", "16 of 24 were at least somewhat interested", "Interest existed before participation"],
    ["College Park residents", "Preferred updates", "6 of 9 chose email; 5 text; 4 bulletins; 3 social", "Make direct updates easy to opt into"],
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
  const garden = getProjectBySlug("cognitive-wellness-garden");

  assert.deepEqual(capstone.metrics.map(({ value }) => value), ["5", "3"]);
  assert.equal(ovara.evidence.modelStatus, "negative result at state level, direct count at county level");
  assert.equal(ovara.evidence.crossValidationR2, 0.1244);
  assert.equal(ovara.evidence.zeroProviderCounties, 1029);
  assert.equal(ovara.evidence.populationInZeroProviderCounties, 10917875);
  assert.equal(ovara.evidence.stateRiskTiers, false);
  assert.equal(kairo.evidence.syntheticDocuments, 150);
  assert.equal(kairo.evidence.heavyNoiseUndertriage, "2 of 30");
  assert.equal(terpcare.evidence.directUserTesting, false);
  assert.equal(garden.evidence.participantValidation, false);
});

test("unknown slugs fail closed", () => {
  assert.equal(getProjectBySlug("not-a-project"), undefined);
  assert.throws(
    () => getAdjacentProject("not-a-project", "next"),
    /Unknown project slug/,
  );
});
