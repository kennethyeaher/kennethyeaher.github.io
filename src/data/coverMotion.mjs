/**
 * home motion covers, built from figma's smart animate step frames: capstone (454:2562), ovara (446:9788) and kairo
 * (447:11130). each cover has four steps that hold for the prototype's after delay times, then ease in and out to the
 * next step over its transition, looping from step 4 back to step 1.
 *
 * a layer's box is figma's x, y, width and height in px, relative to its parent layer (the 454 by 256 cover for a top
 * layer). style is css whose {n} tokens are figma px, written as shares of the cover so the layer scales with the card.
 * steps, when present, give the layer's state in each step (x, y, w, h, r for rotation in degrees, o for opacity, bg
 * for a fill); a step leaves out what matches the box and style. step 1 is the markup, so reduced motion shows it still.
 * field holds each step's ellipse centres for the card's colour field (src/data/coverFields.mjs).
 *
 * the capstone persona and journey use dc names, diana and bruce, in place of the research personas.
 * ovara shows only figures from the published analysis: 20.5 providers per 100k in arkansas against 30.06 for the
 * u.s., 1,029 desert counties and 10.9m residents. kairo's field values are illustrative ocr reads, as in figma.
 *
 * @typedef {{ x?: number, y?: number, w?: number, h?: number, r?: number, o?: number, bg?: string }} LayerState
 * @typedef {{ id: string, box: number[], style?: string, text?: string,
 *   src?: string, steps?: LayerState[], children?: MotionLayer[] }} MotionLayer
 * @typedef {{ figma: string, holds: number[], transition: number, field: [number, number][][], layers: MotionLayer[] }} CoverMotion
 */

/** css for figma text: family, weight, size in px, letter spacing in em and colour. */
function type(family, weight, size, spacing, colour) {
  const families = { mono: "var(--mono)", serif: "var(--display)", inter: "\"Inter\", var(--ui)" };
  return `font-family: ${families[family]}; font-weight: ${weight}; font-size: {${size}}; letter-spacing: ${spacing}em; color: ${colour}`;
}

/** the same layer state in every step, with per step overrides. */
function each(overrides) {
  return overrides.map((state) => state ?? {});
}

/** opacity 1 in the listed steps (1 to 4) and 0 in the others. */
function shownIn(...steps) {
  return [1, 2, 3, 4].map((step) => ({ o: steps.includes(step) ? 1 : 0 }));
}

const noteShadow = "box-shadow: 0 {6} {14} rgb(0 0 0 / 35%)";
const noteLines = [[9, 38], [17, 30], [25, 20]].map(([y, w], index) => ({ id: `line-${index + 1}`, box: [8, y, w, 3], style: "border-radius: {1.5}; background: rgb(42 30 20 / 35%)" }));

// capstone notes: colour, then x, y and rotation in each step (454:450, 454:978, 454:1506, 454:2034); step 4 fades them.
const capstoneNotes = [
  ["#f2d7a6", [34, 58, 8], [60, 70, 0], [70, 84, 6], [70, 100, 6]],
  ["#f2d7a6", [372, 52, 6], [60, 112, 0], [73, 88, 4.5], [73, 104, 4.5]],
  ["#f2d7a6", [352, 170, 3], [60, 154, 0], [76, 92, 3], [76, 108, 3]],
  ["#f0b9a0", [128, 96, -6], [198, 70, 0], [79, 96, 1.5], [79, 112, 1.5]],
  ["#f0b9a0", [60, 150, -5], [198, 112, 0], [82, 100, 0], [82, 116, 0]],
  ["#f0b9a0", [176, 168, 7], [198, 154, 0], [85, 104, -1.5], [85, 120, -1.5]],
  ["#cfe0c8", [214, 48, 4], [336, 70, 0], [88, 108, -3], [88, 124, -3]],
  ["#cfe0c8", [300, 90, -9], [336, 112, 0], [91, 112, -4.5], [91, 128, -4.5]],
  ["#cfe0c8", [262, 158, -4], [336, 154, 0], [94, 116, -6], [94, 132, -6]],
];

/** a capstone column head and its rule, shown only in the affinity step. */
function capstoneHead(id, label, x, width, colour) {
  return [
    { id: `head-${id}`, box: [x, 40], text: label, style: type("mono", 500, 8, 0.1, "#fff"), steps: [{ o: 0 }, { y: 52, o: 0.7 }, { o: 0 }, { o: 0 }] },
    { id: `rule-${id}`, box: [x, 64, 0.01, 1], style: `background: ${colour}`, steps: [{ o: 0 }, { w: width, o: 0.8 }, { o: 0 }, { o: 0 }] },
  ];
}

const glass = (alpha, border) => `border: 1px solid rgb(255 255 255 / ${border}%); border-radius: {12}; background: rgb(255 255 255 / ${alpha}%); backdrop-filter: blur({9}); overflow: hidden`;

const capstone = {
  figma: "454:2562",
  holds: [2.2, 2.2, 2.6, 2.8],
  transition: 0.8,
  field: [
    [[60, 50], [109, 251], [425, 265], [390, 48], [235, 145]],
    [[84, 36], [95, 285], [395, 253], [410, 40], [259, 131]],
    [[70, 70], [65, 273], [415, 245], [434, 26], [245, 165]],
    [[40, 58], [85, 265], [439, 231], [420, 60], [215, 153]],
  ],
  layers: [
    { id: "dots", box: [0, 0, 454, 256], src: "/images/exhibits/cover-dot-grid.svg", style: "opacity: 0.06" },
    { id: "kicker", box: [22, 20], text: "USER RESEARCH · SYNTHESIS", style: type("mono", 500, 9, 0.08, "rgb(255 255 255 / 55%)") },
    ...["01  NOTES", "02  AFFINITY", "03  PERSONA", "04  JOURNEY"].map((label, index) => ({
      id: `stage-${index + 1}`, box: [300, 20, 132], text: label, style: `${type("mono", 500, 9, 0.08, "rgb(242 215 166 / 90%)")}; text-align: right`, steps: shownIn(index + 1),
    })),
    { id: "track", box: [22, 234, 96, 2], style: "border-radius: {1}; background: rgb(255 255 255 / 15%)" },
    { id: "progress", box: [22, 234, 24, 2], style: "border-radius: {1}; background: #e2a84b", steps: [{ w: 24 }, { w: 48 }, { w: 72 }, { w: 96 }] },
    ...capstoneHead("needs", "NEEDS", 60, 58, "#f2d7a6"),
    ...capstoneHead("pains", "PAINS", 198, 58, "#f0b9a0"),
    ...capstoneHead("moments", "MOMENTS", 336, 58, "#cfe0c8"),
    ...capstoneNotes.map(([colour, ...states], index) => ({
      id: `note-${index + 1}`, box: [states[0][0], states[0][1], 58, 34],
      style: `border-radius: {5}; background: ${colour}; ${noteShadow}; overflow: hidden`,
      steps: states.map(([x, y, r], step) => ({ x, y, r, o: step === 3 ? 0 : 1 })),
      children: noteLines,
    })),
    {
      id: "persona", box: [262, 74, 196, 150], style: glass(8, 18),
      steps: [{ o: 0 }, { o: 0 }, { x: 228, y: 56, o: 1 }, { x: 196, y: 40, o: 0 }],
      children: [
        { id: "avatar", box: [16, 16, 40, 40], src: "/images/work/capstone/cover-avatar.svg" },
        { id: "initial", box: [27, 23.5], text: "D", style: type("serif", 400, 20, 0, "#2a1e14") },
        { id: "persona-kicker", box: [68, 20], text: "PERSONA", style: type("mono", 500, 8, 0.1, "rgb(255 255 255 / 55%)") },
        { id: "name", box: [68, 31], text: "Diana", style: type("serif", 400, 22, 0, "#fff") },
        ...[["GOALS", 74, 104, "242 215 166"], ["PAINS", 96, 84, "240 185 160"], ["HABITS", 118, 116, "207 224 200"]].flatMap(([label, y, width, rgb]) => [
          { id: `trait-${label.toLowerCase()}`, box: [16, y], text: label, style: type("mono", 400, 7, 0.08, "rgb(255 255 255 / 50%)") },
          { id: `bar-${label.toLowerCase()}`, box: [62, y + 2, width, 4], style: `border-radius: {2}; background: rgb(${rgb} / 85%)` },
        ]),
      ],
    },
    {
      id: "journey", box: [22, 78, 410, 160], style: glass(7, 16),
      steps: [{ o: 0 }, { o: 0 }, { o: 0 }, { y: 50, o: 1 }],
      children: [
        { id: "journey-kicker", box: [18, 16], text: "JOURNEY · BRUCE", style: type("mono", 500, 8, 0.1, "rgb(255 255 255 / 60%)") },
        { id: "baseline", box: [18, 88, 374, 1], style: "background: rgb(255 255 255 / 15%)" },
        { id: "emotion", box: [29, 49, 352, 76], src: "/images/work/capstone/cover-emotion-line.svg" },
        ...[30, 112, 194, 276, 380].map((x, index) => ({ id: `tick-${index + 1}`, box: [x, 132, 1, 24], style: "background: rgb(255 255 255 / 12%)" })),
        ...[[25, 69], [107, 103], [189, 119], [271, 77], [375, 45]].map(([x, y], index) => ({
          id: `dot-${index + 1}`, box: [x, y, 10, 10], src: `/images/work/capstone/cover-stage-dot${index === 2 ? "-low" : ""}.svg`,
        })),
        { id: "low-point", box: [172, 136], text: "LOW POINT", style: type("mono", 500, 7, 0.1, "rgb(240 185 160 / 90%)") },
      ],
    },
  ],
};

// ovara county tiles: a 9 by 16 grid of 10px squares 13px apart (446:7758). step 1 is unlit, step 2 colours every
// county by access tier, step 3 dims all but arkansas, and step 4 keeps only the desert counties lit.
const tierCodes = { p: "#6b4fbf", s: "#8db596", m: "#e9b44c", c: "#e07a5f" };
// one letter per tile in row order, read from the step 2 fills: p well served, s adequate, m thin, c desert.
const tiers = "ssppsspcsspmmpspmpssppccpscpssmppcspsppmsspcpcspmsmmppsppsmmcpssscssppmppmccccmmsppspsmcmmpssspcscsspmcmmcmmmcpcppppsccmcmpspsppmpppmpspsspmsmpc";
// step 3 keeps these tiles, the arkansas focus, at full strength.
const arkansas = new Set([87, 88, 89, 103, 104, 105, 119, 120, 121]);

/** the 144 county tiles, each with its tier colour and its strength in each step. */
function countyTiles() {
  return [...tiers].map((code, index) => {
    const colour = tierCodes[code];
    const desert = code === "c";
    return {
      id: `tile-${index}`, box: [(index % 16) * 13, Math.floor(index / 16) * 13, 10, 10], style: "border-radius: {2.5}",
      steps: [{ bg: "#3a2e4d" }, { bg: colour }, { bg: colour, o: arkansas.has(index) ? 1 : 0.25 }, { bg: colour, o: desert ? 1 : 0.14 }],
    };
  });
}

const ovara = {
  figma: "446:9788",
  holds: [1.2, 1.8, 2.4, 2.6],
  transition: 0.7,
  field: [
    [[70, 50], [434, 226], [90, 280], [380, 28], [225, 255]],
    [[94, 36], [420, 260], [60, 268], [400, 20], [249, 241]],
    [[80, 70], [390, 248], [80, 260], [424, 6], [235, 275]],
    [[50, 58], [410, 240], [104, 246], [410, 40], [205, 263]],
  ],
  layers: [
    { id: "dots", box: [0, 0, 454, 256], src: "/images/exhibits/cover-dot-grid.svg", style: "opacity: 0.08" },
    {
      id: "search", box: [87, 108, 280, 40], style: "border-radius: {20}; background: #f6f0e6; box-shadow: 0 {12} {28} rgb(0 0 0 / 30%); overflow: hidden",
      steps: each([{}, { x: 28, y: 24, w: 210, h: 32 }, { x: 28, y: 24, w: 210, h: 32 }, { x: 28, y: 24, w: 210, h: 32 }]),
      children: [
        { id: "pin", box: [14, 16, 8, 8], src: "/images/work/ovara/cover-pin.svg", steps: each([{}, { y: 12 }, { y: 12 }, { y: 12 }]) },
        { id: "query-typed", box: [30, 11], text: "Arkans", style: type("inter", 500, 14, 0, "#231a33"), steps: shownIn(1) },
        { id: "caret", box: [80, 12, 1.5, 16], style: "background: #6b4fbf", steps: shownIn(1) },
        { id: "query", box: [30, 9], text: "Arkansas", style: type("inter", 500, 12, 0, "#231a33"), steps: shownIn(2, 3, 4) },
        { id: "hint", box: [204, 15.5], text: "COUNTY ACCESS", style: type("mono", 400, 7, 0.08, "#8a7f95"), steps: [{}, { x: 134, y: 11.5 }, { x: 134, y: 11.5 }, { x: 134, y: 11.5, o: 0 }] },
        { id: "hint-all", box: [106, 11.5], text: "U.S. · ALL COUNTIES", style: type("mono", 400, 7, 0.08, "#8a7f95"), steps: shownIn(4) },
      ],
    },
    {
      id: "tiles", box: [28, 96, 205, 114], steps: [{ o: 0 }, { y: 74, o: 1 }, { y: 74, o: 1 }, { y: 74, o: 1 }],
      children: [
        ...countyTiles(),
        { id: "focus", box: [88, 62, 42, 42], style: "border: {1.5} solid #f6f0e6; border-radius: {4}", steps: shownIn(3) },
      ],
    },
    {
      // the legend keys step 2 only; the arkansas and desert steps let the tiles speak.
      id: "legend", box: [28, 222, 256, 12], steps: [{ o: 0 }, { y: 200, o: 1 }, { y: 200, o: 0 }, { y: 200, o: 0 }],
      children: [["Well served", "#6b4fbf"], ["Adequate", "#8db596"], ["Thin", "#e9b44c"], ["Desert", "#e07a5f"]].flatMap(([label, colour], index) => [
        { id: `key-${index + 1}`, box: [index * 64, 3, 6, 6], style: `border-radius: {1.5}; background: ${colour}` },
        { id: `label-${index + 1}`, box: [index * 64 + 9, 0], text: label, style: type("inter", 400, 7.5, 0, "rgb(246 240 230 / 75%)") },
      ]),
    },
    {
      id: "state", box: [300, 74, 170, 124], style: "border-radius: {10}; background: #f6f0e6; box-shadow: 0 {12} {28} rgb(0 0 0 / 30%)",
      steps: [{ o: 0 }, { o: 0 }, { x: 256, o: 1 }, { o: 0 }],
      children: [
        { id: "state-name", box: [14, 14], text: "ARKANSAS", style: type("mono", 500, 7.5, 0.1, "#7a6e86") },
        { id: "value", box: [14, 26], text: "20.5", style: type("serif", 400, 34, 0, "#e07a5f") },
        { id: "unit", box: [14, 68], text: "providers per 100k", style: type("inter", 400, 9, 0, "#5c5266") },
        {
          id: "track", box: [14, 94, 142, 6], style: "border-radius: {3}; background: #e7dfee",
          children: [
            // the fill reaches 20.5 of the 30.06 at the marker: 73 of 107px.
            { id: "fill", box: [0, 0, 1, 6], style: "border-radius: {3}; background: #e07a5f", steps: each([{}, {}, { w: 73 }, {}]) },
            { id: "marker", box: [107, -3, 1.5, 12], style: "background: #231a33" },
          ],
        },
        { id: "marker-label", box: [97, 104], text: "U.S. 30.06", style: type("mono", 400, 7, 0, "#231a33") },
      ],
    },
    {
      id: "headline", box: [300, 82, 170, 110], steps: [{ o: 0 }, { o: 0 }, { o: 0 }, { x: 258, o: 1 }],
      children: [
        { id: "big", box: [0, 0], text: "1,029", style: type("serif", 400, 42, 0, "#f6f0e6") },
        { id: "sub", box: [2, 54], text: "access desert counties", style: type("inter", 500, 10, 0, "rgb(246 240 230 / 85%)") },
        { id: "residents", box: [2, 74], text: "10.9M RESIDENTS", style: type("mono", 400, 7.5, 0.08, "#e07a5f") },
      ],
    },
  ],
};

/** one kairo extraction row: the raw ocr read, the resolved value, the error underline and the two method chips. */
function extractionRow(label, raw, resolved, y) {
  return {
    id: `row-${label.toLowerCase()}`, box: [0, y, 220, 42], style: "border: 1px solid rgb(255 255 255 / 8%); border-radius: {8}; background: rgb(255 255 255 / 6%)",
    children: [
      { id: `${label.toLowerCase()}-label`, box: [12, 8], text: label, style: type("mono", 400, 7, 0.08, "#8fa3c2") },
      { id: `${label.toLowerCase()}-raw`, box: [12, 19], text: raw, style: type("mono", 500, 13, 0, "#b9c3d3"), steps: shownIn(1, 2, 4) },
      { id: `${label.toLowerCase()}-value`, box: [12, 19], text: resolved, style: type("mono", 500, 13, 0, "#fff"), steps: shownIn(3) },
      { id: `${label.toLowerCase()}-error`, box: [12, 36, 84, 1.5], style: "background: rgb(240 138 138 / 80%)", steps: shownIn(2) },
      {
        id: `${label.toLowerCase()}-regex`, box: [146, 13, 30, 16], style: "border-radius: {4}; background: rgb(240 138 138 / 14%)", steps: shownIn(3),
        children: [{ id: `${label.toLowerCase()}-regex-text`, box: [6, 4], text: "RX ✕", style: type("mono", 500, 6.5, 0, "#f08a8a") }],
      },
      {
        id: `${label.toLowerCase()}-llm`, box: [180, 13, 30, 16], style: "border-radius: {4}; background: rgb(127 216 164 / 14%)", steps: shownIn(3),
        children: [{ id: `${label.toLowerCase()}-llm-text`, box: [4, 4], text: "LLM ✓", style: type("mono", 500, 6.5, 0, "#7fd8a4") }],
      },
    ],
  };
}

const kairo = {
  figma: "447:11130",
  holds: [1, 1.6, 2.4, 2.4],
  transition: 0.7,
  field: [
    [[65, 55], [119, 251], [425, 255], [380, 48], [230, 140]],
    [[89, 41], [105, 285], [395, 243], [400, 40], [254, 126]],
    [[75, 75], [75, 273], [415, 235], [424, 26], [240, 160]],
    [[45, 63], [95, 265], [439, 221], [410, 60], [210, 148]],
  ],
  layers: [
    { id: "dots", box: [0, 0, 454, 256], src: "/images/exhibits/cover-dot-grid.svg", style: "opacity: 0.07" },
    {
      id: "form", box: [34, 30, 148, 196], style: "border-radius: {6}; background: #f7f5ef; box-shadow: 0 {14} {30} rgb(0 0 0 / 35%); overflow: hidden",
      steps: [{}, {}, {}, { x: -40, o: 0 }],
      children: [
        { id: "header", box: [14, 14, 120, 7], style: "border-radius: {2}; background: rgb(44 62 92 / 85%)" },
        { id: "form-title", box: [14, 26], text: "PEDIATRIC TRIAGE", style: type("mono", 500, 5.5, 0.06, "#2c3e5c") },
        ...[0, 1, 2, 3, 4, 5].flatMap((row) => [
          { id: `label-${row}`, box: [14, 44 + row * 24, 34, 4], style: "border-radius: {2}; background: #9aa4b2" },
          { id: `box-${row}`, box: [14, 51 + row * 24, 120, 10], style: "border: {0.75} solid #c9cfd8; border-radius: {2}; background: #fff" },
        ]),
        // the three fields the extraction reads light up once the scan has passed.
        ...[0, 1, 2].map((row) => ({
          id: `highlight-${row}`, box: [12, 41 + row * 24, 124, 24], style: "border: 1px solid #4c8dff; border-radius: {3}; background: rgb(76 141 255 / 8%)", steps: shownIn(2, 3),
        })),
        { id: "veil", box: [0, 0, 148, 196], style: "background: rgb(122 122 122 / 18%); filter: blur({1})", steps: [{ o: 1 }, { o: 0.6 }, { o: 0 }, { o: 0 }] },
        {
          id: "beam", box: [0, -30, 148, 26], style: "background: linear-gradient(rgb(76 141 255 / 0%), rgb(76 141 255 / 35%) 85%, #4c8dff)",
          steps: [{}, { y: 190 }, { y: 190, o: 0 }, { y: 190, o: 0 }],
        },
      ],
    },
    ...[["OCR · HEAVY NOISE", "#f3b27a"], ["TESSERACT READ", "#4c8dff"], ["ZERO-SHOT LLM", "#4c8dff"], ["KAIRO HEALTH", "#4c8dff"]].map(([label, colour], index) => ({
      id: `status-${index + 1}`, box: [34, 10], text: label, style: type("mono", 500, 7, 0.1, colour), steps: shownIn(index + 1),
    })),
    {
      id: "extraction", box: [202, 40, 220, 150], steps: [{ o: 0 }, { o: 1 }, { o: 1 }, { x: 140, o: 0 }],
      children: [
        extractionRow("DOB", "Z0/O3/2O2Z", "20/03/2022", 0),
        extractionRow("TEMP", "3B.6 *C", "38.6 °C", 50),
        extractionRow("WEIGHT", "l2.4 kq", "12.4 kg", 100),
      ],
    },
    {
      id: "summary", box: [80, 62, 380, 140], steps: [{ o: 0 }, { o: 0 }, { o: 0 }, { x: 40, o: 1 }],
      children: [
        { id: "line", box: [0, 0], text: "Noisy scans in, structured triage out.", style: type("inter", 600, 17, 0, "#fff") },
        ...[["14", "fields per form", "#fff"], ["5", "OCR noise tiers", "#fff"], ["2", "methods compared", "#4c8dff"]].map(([n, label, colour], index) => ({
          id: `stat-${index + 1}`, box: [index * 124, 44, 112, 70], style: "border-radius: {10}; background: rgb(255 255 255 / 6%)",
          children: [
            { id: `stat-${index + 1}-n`, box: [14, 10], text: n, style: type("inter", 600, 26, 0, colour) },
            { id: `stat-${index + 1}-label`, box: [14, 46], text: label, style: type("inter", 400, 9, 0, "#8fa3c2") },
          ],
        })),
      ],
    },
  ],
};

/** @type {Record<string, CoverMotion>} */
export const coverMotion = {
  "college-park-capstone": capstone,
  ovara,
  "kairo-health": kairo,
};

/** a cover's loop length in seconds, and each step's hold as [start, end] percentages of the loop. */
export function motionTimeline({ holds, transition }) {
  const duration = Number((holds.reduce((sum, hold) => sum + hold, 0) + transition * holds.length).toFixed(3));
  let at = 0;
  const stops = holds.map((hold) => {
    const stop = [at, at + hold].map((time) => Number(((time / duration) * 100).toFixed(3)));
    at += hold + transition;
    return stop;
  });
  return { duration, stops };
}
