// v2 copy (approved spec .private/capstone-v2/capstone-v2.md, figma 689:17674). every string is the spec's, verbatim,
// or where the spec is silent (exhibits 07, 12, 13 to 15 and 16), the figma frame's own text.
// a SOURCE line is stored without its "SOURCE" label; the renderer adds the mono label and the rule above it.

/** synthesis (figma 689:17825), exhibit 07: one row per persona, a numbered name, the need in accent and what it asks for. */
export const capstoneNeeds = {
  kind: "needs", id: "five-needs", figma: "689:17825",
  heading: "Five needs shape participation",
  subtitle: "Reframing the original personas around goals makes their design implications easier to use.",
  rows: [
    { n: "01", name: "Jessica", need: "Plan a family outing", detail: "Practical details before committing" },
    { n: "02", name: "Alex", need: "Find a social connection", detail: "A clear sense of who the event is for" },
    { n: "03", name: "Tyler", need: "Join something spontaneously", detail: "Visible information at the moment of discovery" },
    { n: "04", name: "Priya", need: "Help others participate", detail: "Shareable details for student organizing" },
    { n: "05", name: "Maria", need: "Access information in Spanish", detail: "Language support throughout the experience" },
  ],
  source: "Team persona board in FigJam. Needs reframed by me from each persona's goals and frustrations.",
};

/** synthesis (figma 689:17855), exhibit 12: maria's goal on an accent card beside four labelled lines; the last label is orange. */
export const capstoneLens = {
  kind: "lens", id: "maria-lens", figma: "689:17855",
  heading: "Maria / Language access",
  subtitle: "Composite persona from the original project. Refined here as a working design lens.",
  goal: { label: "PARTICIPATION GOAL", title: "Participate with confidence in Spanish", tag: "05 / COMPOSITE" },
  items: [
    { label: "NEEDS", body: "Understandable information before and during an event" },
    { label: "FRICTION TO ADDRESS", body: "Language gaps can interrupt planning, arrival and access to support." },
    { label: "DESIGN OPPORTUNITY", body: "Consistent Spanish information plus visible bilingual assistance." },
    { label: "QUESTION TO VALIDATE", body: "Can Spanish speakers plan and navigate the event independently?", tone: "annotate" },
  ],
  source: "Maria's persona and journey map in FigJam.",
};

// journeys (figma 689:17884, 689:17934, 689:17976), exhibits 13 to 15: one lane per row, a numbered stage per column.
// all three share the spec's subtitle; tyler's map has four stages.
const laneLabels = { stage: "STAGE", scenario: "SCENARIO", need: "NEED / FRICTION", response: "PROPOSED RESPONSE" };
const laneSubtitle = "Condensed from my journey map. The bottom lane is the response I proposed for each stage.";

export const capstoneLanes = [
  {
    kind: "lanes", id: "journey-jessica", figma: "689:17884",
    heading: "Jessica / Planning a family outing",
    subtitle: laneSubtitle,
    labels: laneLabels,
    stages: [
      { name: "Awareness", scenario: "Find an event", need: "Relevant activities", response: "Activity overview" },
      { name: "Planning", scenario: "Coordinate the day", need: "Schedule and logistics", response: "Practical planning checklist" },
      { name: "Arrival", scenario: "Locate entry and parking", need: "Clear directions", response: "Arrival map" },
      { name: "Experience", scenario: "Take part as a family", need: "Queues, shade and facilities", response: "Visible amenities and help" },
      { name: "Post-event", scenario: "Decide whether to return", need: "Useful follow-up", response: "Simple feedback invitation" },
    ],
    source: "My Jessica journey map, FigJam final draft. A composite scenario built around the persona.",
  },
  {
    kind: "lanes", id: "journey-tyler", figma: "689:17934",
    heading: "Tyler / Joining a discovered event",
    subtitle: laneSubtitle,
    labels: laneLabels,
    stages: [
      { name: "Curiosity", scenario: "Hear music near City Hall", need: "No prior awareness", response: "Visible event identity" },
      { name: "Exploration", scenario: "Figure out what is happening", need: "Unclear student relevance", response: "Immediate activity details" },
      { name: "Experience", scenario: "Choose whether to join", need: "An obvious entry point", response: "Welcoming volunteer contact" },
      { name: "Reflection", scenario: "Consider coming again", need: "A way to hear about next time", response: "Optional event updates" },
    ],
    source: "My Tyler journey map, FigJam final draft. A composite scenario built around the persona.",
  },
  {
    kind: "lanes", id: "journey-maria", figma: "689:17976",
    heading: "Maria / Participating with language support",
    subtitle: laneSubtitle,
    labels: laneLabels,
    stages: [
      { name: "Curiosity", scenario: "Encounter event information", need: "Spanish information", response: "Spanish event summary" },
      { name: "Planning", scenario: "Understand the plan", need: "Consistent translated details", response: "Language access details" },
      { name: "Arrival", scenario: "Find the event and support", need: "Bilingual signs", response: "Bilingual wayfinding" },
      { name: "Experience", scenario: "Participate and ask questions", need: "Visible language assistance", response: "Clearly identified support" },
      { name: "Reflection", scenario: "Share or revisit the experience", need: "Accessible follow-up", response: "Spanish feedback option" },
    ],
    source: "My Maria journey map, FigJam final draft. A composite scenario built around the persona.",
  },
];

/** recommendations (figma 689:18031), exhibit 16: evidence, interpretation and decision per row, orange arrows between. */
export const capstoneReasoning = {
  kind: "reasoning", id: "research-decisions", figma: "689:18031",
  heading: "Make the path from evidence to decision visible",
  subtitle: "A recommendation becomes more useful when its reasoning can be inspected.",
  columns: ["EVIDENCE", "INTERPRETATION", "PROPOSED DECISION"],
  rows: [
    ["17/24 students followed no city account", "City channels may miss students who are not already connected.", "Explore student distribution partners and event discovery touchpoints."],
    ["20/23 students selected social media; 6/9 residents selected email", "The groups may need different communication mixes.", "Test audience specific outreach while retaining accessible alternatives."],
    ["Maria’s persona and journey identify language access needs", "Information needs to remain understandable across the whole visit.", "Test Spanish event information, wayfinding and visible bilingual support."],
  ],
  source: "Survey results and journey maps. Interpretation and decisions are my synthesis for this case study.",
};

/** the band under the metadata (figma 689:18146). stats share ExhibitMetrics' { value, label } shape. */
export const capstoneGlance = {
  figma: "689:18146",
  label: "AT A GLANCE",
  headline: "Every journey we mapped broke at the same two moments: walking in, and the day after.",
  stats: [
    { value: "24 + 9", label: "students and residents answered our two surveys" },
    { value: "3", label: "city events observed in person: College Park Day, Good Neighbor Day and Friday Night Live" },
    { value: "5 → 3", label: "personas, with three carried into full journey maps" },
    { value: "2", label: "reports delivered to the city: a 30 page final report and an 11 page social media audit" },
  ],
};

/** approach (figma 690:7): three research questions, each a top rule, a mono number and a question. */
export const capstoneQuestions = {
  kind: "questions", id: "research-questions", figma: "690:7",
  label: "RESEARCH QUESTIONS",
  items: [
    { n: "01", title: "How do students and residents find out about city events?" },
    { n: "02", title: "What keeps them from going, or from coming back?" },
    { n: "03", title: "What would help the city reach the groups it misses most?" },
  ],
};

/** approach (figma 690:22): five method cards, a pill flow, a note and a source. owner.solid marks the accent chips. */
export const capstoneSources = {
  kind: "methods", id: "five-sources", figma: "690:22",
  heading: "Five sources, one set of questions",
  subtitle: "No single method could carry the findings, so each one covered a gap in another.",
  cards: [
    { eyebrow: "01 · SURVEY", title: "Two Qualtrics surveys", body: "One for students on and near campus, one for residents who aren't students. I built both and ran them in person at events.", reach: "24 students, 9 residents", gaveUs: "Channels, attendance and interest", owner: { label: "BUILT BY ME", solid: true } },
    { eyebrow: "02 · FIELD", title: "Observation at city events", body: "College Park Day, Good Neighbor Day and Friday Night Live, watched from arrival to leaving.", reach: "3 events", gaveUs: "Arrival, wayfinding and who shows up", owner: { label: "LED BY ME", solid: true } },
    { eyebrow: "03 · INTERVIEWS", title: "Contextual interviews", body: "My conversations with residents at the events themselves, in the moment.", reach: "Residents on site", gaveUs: "Motivations and barriers in their own words", owner: { label: "LED BY ME", solid: true } },
    { eyebrow: "04 · SECONDARY", title: "City and Census data", body: "The city's Age-Friendly Action Plan and U.S. Census figures.", reach: "Citywide", gaveUs: "Household mix, language and growth", owner: { label: "TEAM", solid: false } },
    { eyebrow: "05 · AUDIT", title: "Social media audit", body: "Instagram, Facebook and Twitter, plus the city's Hootsuite setup.", reach: "3 platforms", gaveUs: "Where the city already speaks, and how", owner: { label: "LED BY TEAMMATES", solid: false } },
  ],
  labels: { reach: "REACH", gaveUs: "GAVE US" },
  // pills joined by orange arrows; the solid one is filled.
  flow: [
    { label: "All five sources" },
    { label: "5 personas" },
    { label: "3 journey maps", solid: true },
    { label: "Recommendations" },
    { label: "2 reports for the city" },
  ],
  note: { label: "WHY MIX METHODS", body: "Surveys gave us counts from small samples; the field gave us context without counts. Pointing both at the same questions is methodological triangulation, and four of us reading and interpreting the data adds investigator triangulation (Rogers, Sharp and Preece, Interaction Design, §8.2.5)." },
  source: "Final Report, Methods and Project Deliverables, pp. 2–4.",
};

/** approach (figma 690:103): horizontal bars in groups; tone "accent" for students, "annotate" for residents. each bar reads value/total in mono. */
export const capstoneRespondents = {
  kind: "bars", id: "who-answered", figma: "690:103",
  heading: "Who answered",
  subtitle: "Mostly upperclass students living off campus, and residents fairly new to the city.",
  groups: [
    { label: "Students · age", count: "ITEM RESPONSES n=27", tone: "accent", bars: [
      { label: "18 to 20", value: 3, total: 27 },
      { label: "21 to 23", value: 21, total: 27 },
      { label: "24 or older", value: 3, total: 27 },
    ] },
    { label: "Students · where they live", count: "n=26", tone: "accent", bars: [
      { label: "On campus", value: 5, total: 26 },
      { label: "Off campus, near campus", value: 15, total: 26 },
      { label: "Commute from farther", value: 6, total: 26 },
    ] },
    { label: "Residents · years in College Park", count: "n=9", tone: "annotate", bars: [
      { label: "Less than 1 year", value: 2, total: 9 },
      { label: "1 to 3 years", value: 4, total: 9 },
      { label: "4 to 10 years", value: 2, total: 9 },
      { label: "More than 10 years", value: 1, total: 9 },
    ] },
  ],
  note: { label: "CITY CONTEXT", body: "48% of adults are single, 28% of households are single adults and 17.2% of residents are Hispanic or Latino. About one household in four has children (20% two parent, 7% single parent), so family events alone miss most of the city." },
  source: "Final Report pp. 14–19: survey results and the City of College Park Age-Friendly Action Plan. Counts, not population estimates.",
};

/**
 * journeys (figma 692:8): three personas by five aligned stages. a cell is { stage, pain, feels, rating } with stage the
 * map's own stage name (mono 9 muted); feels is the whole italic line. an empty cell is { empty: true, label, body }
 * (tyler has no planning stage), drawn as a dashed box. rating tones: annotate solid, accent solid, soft, outline.
 * on phones the grid becomes one card per persona with the five stages stacked (task 2).
 */
export const capstoneBreakdown = {
  kind: "breakdown", id: "where-every-journey-broke", figma: "692:8",
  heading: "Where every journey broke",
  subtitle: "My three maps aligned on the same five moments. Each cell holds the main pain from that stage, how the persona felt, and the friction rating I gave it on the map.",
  stages: ["DISCOVER", "PLAN", "ARRIVE", "EXPERIENCE", "AFTER"],
  // tinted accent-soft columns, each with an orange mono tag above.
  tags: { ARRIVE: "THE DOOR", AFTER: "BROKE FOR ALL THREE" },
  ratingTones: { "MODERATE TO HIGH": "annotate", "MODERATE": "accent", "MILD TO MODERATE": "accent", "MILD": "soft", "NOT RATED": "outline" },
  personas: [
    { name: "Jessica", role: "Engaged parent", cells: [
      { stage: "AWARENESS", pain: "No parking or schedule details up front", feels: "feels relieved", rating: "MODERATE" },
      { stage: "PLANNING", pain: "Weather plans and family zones unclear", feels: "feels slightly stressed", rating: "NOT RATED" },
      { stage: "ARRIVAL", pain: "Parking fills fast; entrance signs unclear", feels: "feels slightly confused", rating: "NOT RATED" },
      { stage: "EXPERIENCE", pain: "Long lines and little shade", feels: "feels thrilled", rating: "MODERATE TO HIGH" },
      { stage: "POST-EVENT", pain: "Little to keep her engaged afterward", feels: "feels grateful", rating: "MILD" },
    ] },
    { name: "Tyler", role: "Off-campus student", cells: [
      { stage: "CURIOSITY", pain: "Never heard of it; couldn't see what was on from the entrance", feels: "feels curious, surprised", rating: "MODERATE" },
      { empty: true, label: "NO PLANNING STAGE", body: "He decided on the sidewalk." },
      { stage: "EXPLORATION", pain: "No prompt to explore past the music", feels: "feels happy, relaxed", rating: "MILD" },
      { stage: "EXPERIENCE", pain: "Few students around; nowhere to sit and talk", feels: "feels satisfied", rating: "MODERATE" },
      { stage: "REFLECTION", pain: "No clear way to hear about the next one", feels: "feels relaxed, curious", rating: "MILD" },
    ] },
    { name: "Maria", role: "Spanish speaking resident", cells: [
      { stage: "CURIOSITY", pain: "Unsure the event is meant for Spanish speaking families", feels: "feels curious but hesitant", rating: "MODERATE" },
      { stage: "PLANNING", pain: "Few bilingual planning details online", feels: "feels excited but nervous", rating: "MILD TO MODERATE" },
      { stage: "ARRIVAL", pain: "Little bilingual signage or staff at the door", feels: "feels happy but overwhelmed", rating: "MODERATE" },
      { stage: "EXPERIENCE", pain: "Announcements only in English; few chances to meet other families", feels: "feels happy, then isolated", rating: "NOT RATED" },
      { stage: "REFLECTION", pain: "No follow-up in Spanish", feels: "feels proud, then disappointed", rating: "NOT RATED" },
    ] },
  ],
  // each a top rule, an orange mono label, a heading and a body; the same { label, title, body } shape as the lessons.
  findings: [
    { label: "FINDING 01", title: "The entrance is a decision point", body: "Jessica and Maria both hit signage at arrival, and Tyler's whole decision happened on the sidewalk outside. People decide whether to stay with what they can see at the door, which makes signs the signifiers of an event (Norman, The Design of Everyday Things, ch. 1)." },
    { label: "FINDING 02", title: "Every event ended in silence", body: "All three maps end with the same gap: nobody left with a way to hear about the next event, in English or in Spanish. That is the cheapest moment to keep someone, and the city wasn't using it." },
    { label: "FINDING 03", title: "Language shapes every stage for Maria", body: "Hers is the only map where every stage carries a hesitation, from the flyer to the follow-up. Translating the flyer helps at the start and leaves the other four stages untouched." },
  ],
  source: "My FigJam journey maps, final drafts. I aligned the stages; ratings are the friction notes on each map, marked not rated where a stage had none.",
};

/**
 * journeys (figma 692:153): maria's whole board, full width, 12 radius, rule stroke, zoomable like other wide figures.
 * scripts/build-exhibit-images.mjs sizes it with the stage images; zoom opens it on the full board to pan
 * (src/scripts/figure-zoom.ts) from its own zoom copy, since a board of sticky notes has no single region to frame.
 */
export const capstoneWorkingArtifact = {
  kind: "figure", id: "working-artifact", figma: "692:153",
  heading: "The working artifact",
  subtitle: "Maria's map as I built it in FigJam: five stages and seven rows, from touchpoints to opportunities. The grid above is distilled from boards like this one.",
  image: {
    src: "/images/work/capstone/maria-journey-map.png",
    width: 3600,
    height: 1744,
    alt: "Maria's journey map in FigJam with five stages (Curiosity, Planning, Arrival, Experience, Reflection) and rows for touchpoints, user actions, goals, feelings, pain points and opportunities, covered in color coded sticky notes.",
  },
  // the width the zoom draws the board at, two thirds of its own, where its smallest notes read at about 9px. the
  // image script writes a webp at this width for the zoom alone.
  zoom: 2400,
  source: "Journey map board in FigJam, final draft. Every note on the three maps is mine.",
};

/** recommendations (figma 693:2): four equal cards, then a note. the spec gives this exhibit no SOURCE line. */
export const capstoneDeliverables = {
  kind: "deliverables", id: "what-the-city-received", figma: "693:2",
  heading: "What the city received",
  subtitle: "Four artifacts the communications team could use without us in the room.",
  cards: [
    { label: "FINAL REPORT", count: "30 pages", body: "Methods, personas, journey maps, survey data, city context and recommendations by audience." },
    { label: "SOCIAL MEDIA AUDIT", count: "11 pages", body: "Instagram, Facebook and Twitter strengths and gaps, accessibility fixes, and five Hootsuite alternatives compared. Led by teammates." },
    { label: "PERSONAS", count: "5 profiles", body: "Jessica, Alex, Tyler, Priya and Maria, with goals, frustrations, channels and motivations." },
    { label: "JOURNEY MAPS", count: "3 maps", body: "Jessica, Tyler and Maria from first hearing to coming back, with pains and opportunities at every stage. Built by me." },
  ],
  note: { label: "MEASUREMENT BUILT IN", body: "The city had no attendance baseline to measure change against. The report recommends moving event RSVPs from Nextdoor to Eventbrite, so every future event produces RSVP, check-in and post-event survey data." },
};

/** recommendations (figma 693:26): two columns with an orange arrow between; page in orange mono. */
export const capstoneTrace = {
  kind: "trace", id: "maps-to-report", figma: "693:26",
  heading: "From my maps to the city's report",
  subtitle: "Most of the report's event recommendations trace back to an opportunity note on one of my journey maps.",
  columns: ["OPPORTUNITY ON MY MAP", "IN THE FINAL REPORT"],
  rows: [
    { label: "JESSICA · ARRIVAL", opportunity: "Assign volunteers to direct traffic and guide attendees at key points.", page: "P. 12", report: "Have volunteers direct traffic and guide attendees." },
    { label: "JESSICA · PLANNING", opportunity: "Provide downloadable event maps with clearly labeled family zones.", page: "P. 12", report: "Provide downloadable event maps for easy navigation." },
    { label: "JESSICA · POST-EVENT", opportunity: "Send follow-up emails with future event recommendations and a feedback system.", page: "P. 12", report: "Send follow up emails with post-event surveys and future events." },
    { label: "TYLER · EXPLORATION", opportunity: "Have volunteers approach groups like Tyler's to share information about other activities.", page: "P. 13", report: "Have volunteers approach groups like Tyler's to share information about activities." },
    { label: "TYLER · REFLECTION", opportunity: "Provide QR codes on signage or at the event that link to future event schedules.", page: "P. 27", report: "Distribute event flyers and QR codes for sign up during orientation sessions." },
    { label: "MARIA · CURIOSITY", opportunity: "Ensure promotional materials are available in Spanish and distributed in community hubs.", page: "P. 13", report: "Ensure promotional material is available in Spanish." },
    { label: "MARIA · EXPERIENCE", opportunity: "Include bilingual announcers or interpreters for live events and activities.", page: "P. 14", report: "Include bilingual announcers or interpreters at the event." },
  ],
  source: "My FigJam journey maps and the Final Report, pp. 12–14 and 27. The team wrote the report; the map notes are mine.",
};

/** reflection (figma 693:105): three lessons, then the test next heading and paragraph moved from the evidence section, then the closing line. */
export const capstoneLessons = {
  kind: "lessons", id: "lessons", figma: "693:105",
  items: [
    { label: "LESSON 01", title: "Recruit where people already are", body: "Nine residents answered our survey; the events gave us far more. Next time I'd plan field recruitment from the first week and ask the groups residents already trust, like the Spanish speaking organizations Maria's map points to, to share the survey." },
    { label: "LESSON 02", title: "Rate every pain the same way", body: "My maps rated friction on some stages and not others, which is why parts of the grid read not rated. One consistent scale on every stage would make the cross-journey comparison sharper." },
    { label: "LESSON 03", title: "Ask for a baseline on day one", body: "Without attendance or RSVP numbers we could describe problems but not size them. That gap is why the report pushes Eventbrite RSVPs, and it's the first thing I'd request from a client now." },
  ],
};

/** the existing figma text (689:18063, 689:18064) the spec moves into reflection, and its closing line (689:18065). */
export const capstoneTestNext = {
  kind: "prose", id: "test-next", figma: "689:18063",
  heading: "What I would test next",
  body: "Recover the raw survey records, recruit attendees and nonattendees, and test event discovery and arrival tasks. Measure a communication pilot against a baseline before claiming attendance improvement.",
};
export const capstoneClosing = "The project ended with the reports. I don't know which recommendations the city adopted, so this case study claims the research, not an outcome.";
