import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { getProjectBySlug } from '../src/data/portfolio.mjs';
import { caseStudies } from '../src/data/caseStudies.mjs';
import sizes from '../src/data/exhibit-sizes.json' with { type: 'json' };

test('capstone retains the original survey denominators and separates follow-up work', () => {
  const project = getProjectBySlug('college-park-capstone');
  assert.deepEqual(project.evidence.surveyResponses, { students: 24, residents: 9 });
  const survey = project.exhibits.find(({ id }) => id === 'the-survey');
  assert.deepEqual(survey.panels[0].rows[0], ['Social media', '20 of 23', '3 of 9']);
  assert.deepEqual(survey.panels[1].rows[0], ['None', '17 of 24', '4 of 9']);
  // v2 (capstone-v2.md, what we heard): the survey lede reads its sample as signals; the stage closes on exhibit 04's
  // line, which cites its pages only, then exhibit 05's.
  assert.deepEqual(survey.lede, ['24 students and nine residents answered. At that size the numbers are signals, not estimates, so each one was checked against what we saw in the field.']);
  assert.deepEqual(survey.source, ['Final Report, survey results pp. 15–17.', 'Final Report pp. 15–17. Counts, not population estimates. Student preference item has one fewer response.']);
  // the follow-up is no chapter of its own: it closes the reflection as the moved test next prose.
  assert.equal(project.exhibits.some(({ id }) => id === 'next-study' || id === 'evidence'), false);
  const reflection = project.exhibits.find(({ id }) => id === 'reflection');
  const testNext = reflection.blocks.find(({ id }) => id === 'test-next');
  assert.equal(testNext.heading, 'What I would test next');
  assert.match(testNext.body, /^Recover the raw survey records, recruit attendees and nonattendees/);
  assert.match(testNext.body, /before claiming attendance improvement\.$/);
  // Kenneth confirmed he did the in-person surveying and the resident conversations himself (capstone-v2.md).
  // the claim lives in overview P2; the team field is the MY CONTRIBUTION column and names the work.
  const overview = project.exhibits.find(({ id }) => id === 'overview');
  assert.match(overview.lede[1], /did the in-person surveying and held the resident conversations at city events myself/);
  assert.match(overview.lede[1], /I ran our Trello board, built both Qualtrics surveys/);
  assert.match(project.team, /in-person surveying and resident conversations/);
  assert.match(project.team, /both Qualtrics surveys/);
  assert.equal(project.meta.find(({ label }) => label === 'My contribution').value, project.team);
});

// v2 (approved spec .private/capstone-v2/capstone-v2.md, figma 689:17674).
const capstone = () => getProjectBySlug('college-park-capstone');
const chapter = (id) => capstone().exhibits.find((exhibit) => exhibit.id === id);
const block = (chapterId, id) => chapter(chapterId).blocks.find((entry) => entry.id === id);

test('the capstone rail is the v2 section nav, and each chapter carries its blocks in order', () => {
  assert.deepEqual(capstone().exhibits.map(({ chapter }) => chapter), ['Overview', 'Approach', 'What we heard', 'Synthesis', 'Journeys', 'Recommendations', 'Reflection']);
  assert.deepEqual(capstone().exhibits.map(({ id }) => id), ['overview', 'approach', 'the-survey', 'the-persona', 'three-journeys', 'recommendations', 'reflection']);
  // each chapter's eyebrow is its rail name.
  assert.deepEqual(capstone().exhibits.map(({ eyebrow }) => eyebrow), capstone().exhibits.map(({ chapter }) => chapter));
  assert.deepEqual(Object.fromEntries(capstone().exhibits.filter(({ blocks }) => blocks).map(({ id, blocks }) => [id, blocks.map(({ kind }) => kind)])), {
    approach: ['questions', 'methods', 'bars'],
    'the-persona': ['needs', 'lens'],
    'three-journeys': ['breakdown', 'figure', 'lanes', 'lanes', 'lanes'],
    recommendations: ['deliverables', 'trace', 'reasoning'],
    reflection: ['lessons', 'prose'],
  });
  assert.deepEqual([chapter('approach').eyebrow, chapter('approach').heading], ['Approach', 'When the survey stalled, we went where residents already were']);
  // the four chapter headings figma 689:17674 sets where the spec is silent.
  assert.deepEqual(['the-survey', 'the-persona', 'three-journeys', 'recommendations'].map((id) => chapter(id).heading), [
    'The city was publishing beyond the students it reached',
    'Five ways to understand participation',
    'Follow the experience beyond the announcement',
    'Connect the findings to the next decision',
  ]);
  assert.deepEqual([chapter('reflection').eyebrow, chapter('reflection').heading, chapter('reflection').lede], ['Reflection', 'What I\'d do differently', ['Running this project taught me as much about research operations as about the city.']]);
});

test('the capstone metadata is the five v2 columns, and the at a glance band carries its headline and four stats', () => {
  assert.deepEqual(capstone().meta, [
    { label: 'Role', value: 'Project Manager, team of four' },
    { label: 'Client', value: 'City of College Park, Communications' },
    { label: 'Timeline', value: 'Fall 2024' },
    { label: 'My contribution', value: 'Project management, both Qualtrics surveys, in-person surveying and resident conversations, persona and journey map design' },
    { label: 'Methods', value: 'Surveys, field observation, contextual interviews, secondary data, social media audit' },
  ]);
  const glance = chapter('overview').glance;
  assert.equal(glance.label, 'AT A GLANCE');
  assert.equal(glance.headline, 'Every journey we mapped broke at the same two moments: walking in, and the day after.');
  assert.deepEqual(glance.stats.map(({ value, label }) => [value, label]), [
    ['24 + 9', 'students and residents answered our two surveys'],
    ['3', 'city events observed in person: College Park Day, Good Neighbor Day and Friday Night Live'],
    ['5 → 3', 'personas, with three carried into full journey maps'],
    ['2', 'reports delivered to the city: a 30 page final report and an 11 page social media audit'],
  ]);
});

test('approach asks three research questions and credits five sources with their owners', () => {
  const questions = block('approach', 'research-questions');
  assert.equal(questions.label, 'RESEARCH QUESTIONS');
  assert.deepEqual(questions.items.map(({ n, title }) => [n, title]), [
    ['01', 'How do students and residents find out about city events?'],
    ['02', 'What keeps them from going, or from coming back?'],
    ['03', 'What would help the city reach the groups it misses most?'],
  ]);
  const sources = block('approach', 'five-sources');
  assert.deepEqual([sources.heading, sources.subtitle], ['Five sources, one set of questions', 'No single method could carry the findings, so each one covered a gap in another.']);
  assert.deepEqual(sources.cards.map(({ eyebrow, title, reach, gaveUs }) => [eyebrow, title, reach, gaveUs]), [
    ['01 · SURVEY', 'Two Qualtrics surveys', '24 students, 9 residents', 'Channels, attendance and interest'],
    ['02 · FIELD', 'Observation at city events', '3 events', 'Arrival, wayfinding and who shows up'],
    ['03 · INTERVIEWS', 'Contextual interviews', 'Residents on site', 'Motivations and barriers in their own words'],
    ['04 · SECONDARY', 'City and Census data', 'Citywide', 'Household mix, language and growth'],
    ['05 · AUDIT', 'Social media audit', '3 platforms', 'Where the city already speaks, and how'],
  ]);
  // only the work Kenneth built or led gets the solid accent chip.
  assert.deepEqual(sources.cards.map(({ owner }) => [owner.label, owner.solid]), [['BUILT BY ME', true], ['LED BY ME', true], ['LED BY ME', true], ['TEAM', false], ['LED BY TEAMMATES', false]]);
  assert.deepEqual(sources.flow.map(({ label, solid }) => [label, Boolean(solid)]), [['All five sources', false], ['5 personas', false], ['3 journey maps', true], ['Recommendations', false], ['2 reports for the city', false]]);
  assert.equal(sources.note.label, 'WHY MIX METHODS');
  assert.match(sources.note.body, /investigator triangulation \(Rogers, Sharp and Preece, Interaction Design, §8\.2\.5\)\.$/);
  assert.equal(sources.source, 'Final Report, Methods and Project Deliverables, pp. 2–4.');
});

test('who answered draws the spec counts as x/n bars, students in accent and residents in orange', () => {
  const bars = block('approach', 'who-answered');
  assert.deepEqual([bars.heading, bars.subtitle], ['Who answered', 'Mostly upperclass students living off campus, and residents fairly new to the city.']);
  assert.deepEqual(bars.groups.map(({ label, count, tone, bars: rows }) => [label, count, tone, rows.map(({ label: row, value, total }) => `${row} ${value}/${total}`)]), [
    ['Students · age', 'ITEM RESPONSES n=27', 'accent', ['18 to 20 3/27', '21 to 23 21/27', '24 or older 3/27']],
    ['Students · where they live', 'n=26', 'accent', ['On campus 5/26', 'Off campus, near campus 15/26', 'Commute from farther 6/26']],
    ['Residents · years in College Park', 'n=9', 'annotate', ['Less than 1 year 2/9', '1 to 3 years 4/9', '4 to 10 years 2/9', 'More than 10 years 1/9']],
  ]);
  // every group's bars add up to its n.
  for (const group of bars.groups) assert.equal(group.bars.reduce((sum, { value }) => sum + value, 0), group.bars[0].total, group.label);
  assert.equal(bars.note.label, 'CITY CONTEXT');
  assert.match(bars.note.body, /^48% of adults are single, 28% of households are single adults and 17\.2% of residents are Hispanic or Latino\./);
  assert.equal(bars.source, 'Final Report pp. 14–19: survey results and the City of College Park Age-Friendly Action Plan. Counts, not population estimates.');
});

test('where every journey broke lines up three personas on five stages, with three findings', () => {
  const grid = block('three-journeys', 'where-every-journey-broke');
  assert.equal(grid.heading, 'Where every journey broke');
  assert.deepEqual(grid.stages, ['DISCOVER', 'PLAN', 'ARRIVE', 'EXPERIENCE', 'AFTER']);
  assert.deepEqual(grid.tags, { ARRIVE: 'THE DOOR', AFTER: 'BROKE FOR ALL THREE' });
  assert.deepEqual(grid.personas.map(({ name, role, cells }) => [name, role, cells.length]), [['Jessica', 'Engaged parent', 5], ['Tyler', 'Off-campus student', 5], ['Maria', 'Spanish speaking resident', 5]]);
  // tyler decided on the sidewalk, so his plan cell is the one empty box.
  const empty = grid.personas.flatMap(({ name, cells }) => cells.map((cell, index) => [name, index, cell])).filter(([, , cell]) => cell.empty);
  assert.deepEqual(empty.map(([name, index, { label, body }]) => [name, grid.stages[index], label, body]), [['Tyler', 'PLAN', 'NO PLANNING STAGE', 'He decided on the sidewalk.']]);
  const allowed = ['MODERATE TO HIGH', 'MODERATE', 'MILD TO MODERATE', 'MILD', 'NOT RATED'];
  assert.deepEqual(Object.keys(grid.ratingTones).sort(), [...allowed].sort());
  assert.deepEqual(Object.values(grid.ratingTones), ['annotate', 'accent', 'accent', 'soft', 'outline']);
  for (const { name, cells } of grid.personas) {
    for (const cell of cells.filter(({ empty: blank }) => !blank)) {
      assert.ok(allowed.includes(cell.rating), `${name} ${cell.stage} rating ${cell.rating}`);
      assert.match(cell.feels, /^feels /, `${name} ${cell.stage}`);
      assert.ok(cell.pain.length > 10, `${name} ${cell.stage}`);
    }
  }
  assert.deepEqual(grid.personas.map(({ cells }) => cells.map((cell) => cell.rating ?? '')), [
    ['MODERATE', 'NOT RATED', 'NOT RATED', 'MODERATE TO HIGH', 'MILD'],
    ['MODERATE', '', 'MILD', 'MODERATE', 'MILD'],
    ['MODERATE', 'MILD TO MODERATE', 'MODERATE', 'NOT RATED', 'NOT RATED'],
  ]);
  assert.deepEqual(grid.findings.map(({ label, title }) => [label, title]), [
    ['FINDING 01', 'The entrance is a decision point'],
    ['FINDING 02', 'Every event ended in silence'],
    ['FINDING 03', 'Language shapes every stage for Maria'],
  ]);
  assert.match(grid.findings[0].body, /\(Norman, The Design of Everyday Things, ch\. 1\)\.$/);
  assert.equal(grid.source, 'My FigJam journey maps, final drafts. I aligned the stages; ratings are the friction notes on each map, marked not rated where a stage had none.');
});

test('the working artifact is maria\'s whole board with the spec alt, sized and zoomable', () => {
  const figure = block('three-journeys', 'working-artifact');
  assert.equal(figure.heading, 'The working artifact');
  assert.equal(figure.subtitle, 'Maria\'s map as I built it in FigJam: five stages and seven rows, from touchpoints to opportunities. The grid above is distilled from boards like this one.');
  assert.deepEqual([figure.image.src, figure.image.width, figure.image.height], ['/images/work/capstone/maria-journey-map.png', 3600, 1744]);
  assert.equal(figure.image.alt, 'Maria\'s journey map in FigJam with five stages (Curiosity, Planning, Arrival, Experience, Reflection) and rows for touchpoints, user actions, goals, feelings, pain points and opportunities, covered in color coded sticky notes.');
  // the zoom draws the board 2400 wide from a webp of its own, outside the srcset widths.
  assert.equal(figure.zoom, 2400);
  assert.equal(figure.source, 'Journey map board in FigJam, final draft. Every note on the three maps is mine.');
  // the sized pipeline lists its widths and each copy is on disk.
  assert.deepEqual(sizes['maria-journey-map'], [320, 480, 960, 1440, 1920]);
  for (const width of [...sizes['maria-journey-map'], 2400]) assert.ok(existsSync(new URL(`../public/images/exhibits/sized/maria-journey-map-${width}.webp`, import.meta.url)), `${width}w`);
});

test('synthesis reframes five personas as needs, then reads maria as a design lens (figma 689:17825, 689:17855)', () => {
  const needs = block('the-persona', 'five-needs');
  assert.deepEqual([needs.heading, needs.subtitle], ['Five needs shape participation', 'Reframing the original personas around goals makes their design implications easier to use.']);
  assert.deepEqual(needs.rows.map(({ n, name, need }) => [n, name, need]), [
    ['01', 'Jessica', 'Plan a family outing'],
    ['02', 'Alex', 'Find a social connection'],
    ['03', 'Tyler', 'Join something spontaneously'],
    ['04', 'Priya', 'Help others participate'],
    ['05', 'Maria', 'Access information in Spanish'],
  ]);
  assert.equal(needs.source, 'Team persona board in FigJam. Needs reframed by me from each persona\'s goals and frustrations.');
  const lens = block('the-persona', 'maria-lens');
  assert.deepEqual([lens.heading, lens.goal.title, lens.goal.tag], ['Maria / Language access', 'Participate with confidence in Spanish', '05 / COMPOSITE']);
  assert.deepEqual(lens.items.map(({ label, tone }) => [label, tone ?? '']), [['NEEDS', ''], ['FRICTION TO ADDRESS', ''], ['DESIGN OPPORTUNITY', ''], ['QUESTION TO VALIDATE', 'annotate']]);
  assert.ok(lens.items.at(-1).body.endsWith('?'));
  assert.equal(lens.source, 'Maria\'s persona and journey map in FigJam.');
  assert.equal(chapter('the-persona').closing, 'Maria is shown in depth here; the other four follow the same structure.');
});

test('three condensed journeys run four lanes per stage under the shared v2 subtitle (figma 689:17884, 689:17934, 689:17976)', () => {
  const lanes = chapter('three-journeys').blocks.filter(({ kind }) => kind === 'lanes');
  assert.deepEqual(lanes.map(({ heading, stages }) => [heading, stages.length]), [
    ['Jessica / Planning a family outing', 5],
    ['Tyler / Joining a discovered event', 4],
    ['Maria / Participating with language support', 5],
  ]);
  for (const lane of lanes) {
    assert.equal(lane.subtitle, 'Condensed from my journey map. The bottom lane is the response I proposed for each stage.');
    assert.deepEqual(lane.labels, { stage: 'STAGE', scenario: 'SCENARIO', need: 'NEED / FRICTION', response: 'PROPOSED RESPONSE' });
    for (const stage of lane.stages) for (const key of ['name', 'scenario', 'need', 'response']) assert.ok(stage[key], `${lane.id} ${stage.name} ${key}`);
  }
  assert.deepEqual(lanes.map(({ source }) => source), ['Jessica', 'Tyler', 'Maria'].map((name) => `My ${name} journey map, FigJam final draft. A composite scenario built around the persona.`));
  assert.deepEqual(lanes[1].stages.map(({ name }) => name), ['Curiosity', 'Exploration', 'Experience', 'Reflection']);
});

test('exhibit 16 runs evidence to interpretation to a proposed decision, three rows (figma 689:18031)', () => {
  const reasoning = block('recommendations', 'research-decisions');
  assert.deepEqual([reasoning.kind, reasoning.heading, reasoning.subtitle], ['reasoning', 'Make the path from evidence to decision visible', 'A recommendation becomes more useful when its reasoning can be inspected.']);
  assert.deepEqual(reasoning.columns, ['EVIDENCE', 'INTERPRETATION', 'PROPOSED DECISION']);
  assert.deepEqual(reasoning.rows.map((row) => row.length), [3, 3, 3]);
  assert.deepEqual(reasoning.rows.map(([evidence]) => evidence), ['17/24 students followed no city account', '20/23 students selected social media; 6/9 residents selected email', 'Maria’s persona and journey identify language access needs']);
  assert.equal(reasoning.source, 'Survey results and journey maps. Interpretation and decisions are my synthesis for this case study.');
});

test('recommendations show what the city received and trace seven map notes to report pages', () => {
  const received = block('recommendations', 'what-the-city-received');
  assert.deepEqual([received.heading, received.subtitle], ['What the city received', 'Four artifacts the communications team could use without us in the room.']);
  assert.deepEqual(received.cards.map(({ label, count }) => [label, count]), [['FINAL REPORT', '30 pages'], ['SOCIAL MEDIA AUDIT', '11 pages'], ['PERSONAS', '5 profiles'], ['JOURNEY MAPS', '3 maps']]);
  assert.match(received.cards[1].body, /Led by teammates\.$/);
  assert.match(received.cards[3].body, /Built by me\.$/);
  assert.equal(received.note.label, 'MEASUREMENT BUILT IN');
  assert.equal(received.note.body, 'The city had no attendance baseline to measure change against. The report recommends moving event RSVPs from Nextdoor to Eventbrite, so every future event produces RSVP, check-in and post-event survey data.');
  const trace = block('recommendations', 'maps-to-report');
  assert.equal(trace.heading, 'From my maps to the city\'s report');
  assert.deepEqual(trace.columns, ['OPPORTUNITY ON MY MAP', 'IN THE FINAL REPORT']);
  assert.deepEqual(trace.rows.map(({ label, page }) => [label, page]), [
    ['JESSICA · ARRIVAL', 'P. 12'],
    ['JESSICA · PLANNING', 'P. 12'],
    ['JESSICA · POST-EVENT', 'P. 12'],
    ['TYLER · EXPLORATION', 'P. 13'],
    ['TYLER · REFLECTION', 'P. 27'],
    ['MARIA · CURIOSITY', 'P. 13'],
    ['MARIA · EXPERIENCE', 'P. 14'],
  ]);
  for (const row of trace.rows) assert.ok(row.opportunity.endsWith('.') && row.report.endsWith('.'), row.label);
  assert.equal(trace.source, 'My FigJam journey maps and the Final Report, pp. 12–14 and 27. The team wrote the report; the map notes are mine.');
});

test('reflection closes on three lessons, the moved test next prose and the no outcome line', () => {
  const lessons = block('reflection', 'lessons');
  assert.deepEqual(lessons.items.map(({ label, title }) => [label, title]), [
    ['LESSON 01', 'Recruit where people already are'],
    ['LESSON 02', 'Rate every pain the same way'],
    ['LESSON 03', 'Ask for a baseline on day one'],
  ]);
  assert.deepEqual(block('reflection', 'test-next').kind, 'prose');
  assert.equal(chapter('reflection').closing, 'The project ended with the reports. I don\'t know which recommendations the city adopted, so this case study claims the research, not an outcome.');
  // the test next prose left the recommendations chapter when it moved.
  assert.equal(chapter('recommendations').blocks.some(({ id }) => id === 'test-next'), false);
});

test('the capstone data and the v2 exhibit components carry no em dash', () => {
  assert.ok(!JSON.stringify(caseStudies.find(({ slug }) => slug === 'college-park-capstone')).includes('\u2014'), 'capstone record');
  const files = ['src/data/capstoneResearch.mjs', 'src/scripts/figure-zoom.ts', ...['ExhibitBars', 'ExhibitBlocks', 'ExhibitBreakdown', 'ExhibitColumns', 'ExhibitDeliverables', 'ExhibitFigure', 'ExhibitGlance', 'ExhibitHead', 'ExhibitLanes', 'ExhibitLens', 'ExhibitMethods', 'ExhibitNeeds', 'ExhibitNote', 'ExhibitReasoning', 'ExhibitSource', 'ExhibitTrace'].map((name) => `src/components/exhibits/${name}.astro`)];
  for (const file of files) assert.ok(!readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').includes('\u2014'), file);
});
