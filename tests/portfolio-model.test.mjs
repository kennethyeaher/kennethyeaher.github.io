import { existsSync, readFileSync } from "node:fs";
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
import { approvedLedes } from "../scripts/build-approved-ledes.mjs";

const specPath = new URL("../.private/redesign-spec/v2-pages.json", import.meta.url);

const expectedOrder = [
  "terpcarehub",
  "frontground",
  "sohive",
  "terpcare",
  "ovara",
  "college-park-capstone",
  "kairo-health",
  "usm-venture-benchmark",
];

test("featured work returns the approved eight projects, design work first", () => {
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
    "usm-venture-benchmark": "Venture Research + Data Visualization",
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
    getAdjacentProject("terpcarehub", "previous").slug,
    "usm-venture-benchmark",
  );
  assert.equal(
    getAdjacentProject("usm-venture-benchmark", "next").slug,
    "terpcarehub",
  );
  assert.equal(
    getAdjacentProject("ovara", "previous").slug,
    "terpcare",
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
    ["usm-venture-benchmark", 5],
    ["sohive", 8],
    ["college-park-capstone", 8],
    ["ovara", 8],
    ["kairo-health", 8],
    ["terpcare", 7],
    ["terpcarehub", 8],
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
const exhibitSlugs = ["kairo-health", "usm-venture-benchmark", "ovara", "terpcarehub", "college-park-capstone", "frontground", "terpcare", "sohive"];

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
  assert.deepEqual(getProjectBySlug("usm-venture-benchmark").exhibits.map(({ kind }) => kind), ["hero", "stage", "stage", "journey", "section"]);
  assert.deepEqual(getProjectBySlug("ovara").exhibits.map(({ kind }) => kind), ["hero", "rows", "stage", "custom", "section", "section"]);
  assert.deepEqual(getProjectBySlug("terpcarehub").exhibits.map(({ kind }) => kind), ["hero", "rows", "custom", "stage", "custom", "rows", "section"]);
  assert.deepEqual(getProjectBySlug("college-park-capstone").exhibits.map(({ kind }) => kind), ["hero", "heatmap", "stage", "journey", "section"]);
  assert.deepEqual(getProjectBySlug("frontground").exhibits.map(({ kind }) => kind), ["hero", "rows", "custom", "stage", "section", "stage", "stage", "section"]);
  assert.deepEqual(getProjectBySlug("terpcare").exhibits.map(({ kind }) => kind), ["hero", "journey", "stage", "rows", "rows", "stage", "stage", "section"]);
  assert.deepEqual(getProjectBySlug("sohive").exhibits.map(({ kind }) => kind), ["hero", "rows", "pair", "custom", "section", "stage", "stage", "section"]);
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
      const isNew = (added[slug] ?? []).includes(exhibit.id);
      for (const visual of phones(exhibit)) {
        if (isNew) {
          assert.equal(visual.fit, "contain", `${slug} ${exhibit.id} ${visual.src} fits`);
          assert.match(visual.bg, /^#[0-9a-f]{6}$/i, `${slug} ${exhibit.id} ${visual.src} has a screen colour`);
        } else assert.equal(visual.fit, undefined, `${slug} ${exhibit.id} ${visual.src} keeps cover`);
      }
    }
  }
  // the tall scroll capture stays cropped from the top.
  const findCare = getProjectBySlug("terpcarehub").exhibits.flatMap(phones).find(({ src }) => src.endsWith("mobile-find-care.png"));
  assert.ok(findCare && findCare.fit === undefined);
});

test("terpcare reads as a before and after: the 2024 header facts stay, the year, summary and metrics move", () => {
  const terpcare = getProjectBySlug("terpcare");
  assert.equal(terpcare.year, "2024, redesigned 2026");
  // the home card keeps the year the work was made.
  assert.equal(terpcare.cardYear, "2024");
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
  return existsSync(prosePath) ? approvedLedes(JSON.parse(readFileSync(prosePath, "utf8"))) : JSON.parse(readFileSync(fixturePath, "utf8"));
}

// pages built from their prose mock (figma section 07); every page joins as it is built.
const ledeSlugs = ["kairo-health", "usm-venture-benchmark", "ovara", "terpcarehub", "college-park-capstone", "frontground", "terpcare", "sohive"];

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

const mockSlugs = ["kairo-health", "usm-venture-benchmark", "ovara", "terpcarehub", "college-park-capstone", "frontground", "terpcare", "sohive"];

test("the approved lede fixture matches the prose export", { skip: !existsSync(prosePath) && "prose export not present" }, () => {
  const expected = approvedLedes(JSON.parse(readFileSync(prosePath, "utf8")));
  assert.deepEqual(JSON.parse(readFileSync(fixturePath, "utf8")), expected, "tests/fixtures/approved-ledes.json is out of date; run node scripts/build-approved-ledes.mjs");
});

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
  // some spec pages point at the frame's rail instead of listing chapters; those rails live in figmaRails.
  const rail = (Array.isArray(spec.chapters) ? spec.chapters : figmaRails[slug]).map((chapter) => chapter.replace(/\s+/g, " "));
  assert.deepEqual(project.exhibits.map(({ chapter }, index) => `0${index + 1} ${chapter}`), rail);
  for (const [built, source] of rest.filter(({ kind }) => kind !== "section").map((exhibit, index) => [exhibit, specRest[index]])) {
    assert.equal(built.figma, source.id);
    assert.equal(built.eyebrow, source.eyebrow);
    assert.equal(built.heading, source.heading);
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
    if (source.rows) {
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

for (const slug of exhibitSlugs) {
  test(`${slug} exhibit copy matches the approved spec word for word`, { skip: !existsSync(specPath) && "spec export not present" }, () => assertMatchesSpec(slug));
}
