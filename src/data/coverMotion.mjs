/**
 * home motion covers, built from figma's motion cover v4 timelines: capstone (482:10252), ovara (484:10700) and kairo
 * (485:11148). each cover loops one timeline. this file holds the layers in figma's nesting; the keyframes come from
 * figma's get_motion_context css snippets (scripts/cover-motion/*.motion.json), which scripts/build-cover-motion.mjs
 * writes into src/styles/cover-motion/<slug>.css, keyed by the figma node id each layer carries.
 *
 * a layer's box is figma's x, y, width and height in px, relative to its parent layer (the 454 by 256 cover for a top
 * layer). style is css whose {n} tokens are figma px, written as shares of the cover so the layer scales with the card.
 * node is the figma node id the keyframes target; a layer without one never moves. each scene frame is the camera for
 * its cards, so the cards stay nested inside it. svg layers are inlined so a path trim can draw the stroke; other
 * vectors are files. field lists the node ids of the colour field's blobs, in the order of src/data/coverFields.mjs.
 * still is the second of the timeline that reduced motion holds: the moment the first scene lands.
 *
 * the capstone persona and journey use dc names, diana and bruce, in place of the research personas.
 * ovara shows only figures from the published analysis: 20.5 providers per 100k in arkansas against 30.06 for the
 * u.s., 1,029 desert counties and 10.9m residents. kairo's noisy field values are illustrative ocr reads, as in figma.
 *
 * @typedef {{ node?: string, box: number[], style?: string, text?: string, src?: string,
 *   svg?: { w: number, h: number, body: string }, children?: MotionLayer[] }} MotionLayer
 * @typedef {{ figma: string, seconds: number, still: number, field: string[], layers: MotionLayer[] }} CoverMotion
 */

/** css for figma text: family, weight, size in px, letter spacing in px and colour. */
function type(family, weight, size, spacing, colour) {
  const families = {
    mono: "var(--mono)",
    serif: "var(--display); font-variation-settings: \"SOFT\" 0, \"WONK\" 1",
    inter: "\"Inter\", var(--ui)",
  };
  return `font-family: ${families[family]}; font-weight: ${weight}; font-size: {${size}}; letter-spacing: {${spacing}}; color: ${colour}`;
}

/** a text layer at figma's x and y. */
function text(node, x, y, value, style) {
  return { node, box: [x, y], text: value, style };
}

/** a filled rounded box. */
function fill(node, box, colour, radius = 0) {
  return { node, box, style: `background: ${colour}${radius ? `; border-radius: {${radius}}` : ""}` };
}

/** an inline svg path that figma draws by trimming its stroke; pathLength 1 lets the dash keyframes run 0 to 1. */
function trimmed(node, box, d, stroke, width) {
  const [, , w, h] = box;
  const body = `<path data-node="${node}" pathLength="1" d="${d}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" stroke="${stroke}" />`;
  return { box, svg: { w, h, body } };
}

/** a full cover scene frame: figma animates the frame itself, so it carries the camera for everything inside. */
function scene(node, children) {
  return { node, box: [0, 0, 454, 256], children };
}

const card = (colour, radius, shadow = "rgb(0 0 0 / 35%)") => `background: ${colour}; border-radius: {${radius}}; box-shadow: 0 {12} {15} ${shadow}`;
const dots = (node, opacity) => ({ node, box: [0, 0, 454, 256], src: "/images/exhibits/cover-dot-grid.svg", style: `opacity: ${opacity}` });
// the cursor svg overhangs its 11.6 by 18 frame by its 0.55 stroke on every side; the box is the svg's own.
const cursor = (node, x, y) => ({ node, box: [x - 0.55, y - 0.55, 12.7, 19.1], src: "/images/exhibits/cover-cursor.svg" });

// capstone (482:10252): a survey answer, the 17 of 24 tally, diana's persona card, then bruce's journey curve.
const ink = "#2a1f18";
const muted = "#8a7a6c";
const paper = "#f6efe6";
const answers = ["Instagram", "City newsletter", "City website", "None of these"];

/** one survey answer row: its highlight, its checkbox, its label; ids run row, box, label from 482:10766. */
function answer(label, index) {
  const top = 60 + index * 27;
  const id = (offset) => `482:${10766 + index * 3 + offset}`;
  return [
    { node: id(0), box: [12, top, 216, 23], style: "background: #c8643b; border-radius: {7}; opacity: 0" },
    { node: id(1), box: [22, top + 5.5, 12, 12], style: `border: {1.2} solid ${muted}; border-radius: {3.5}` },
  ].concat(index === 3 ? [
    fill("482:10777", [22, top + 5.5, 12, 12], "#c8643b", 3.5),
    trimmed("482:10778", [24.5 - 0.8, top + 9 - 0.8, 8.6, 6.6], "M0.8 3.4L3.2 5.8L7.8 0.800004", "white", 1.6),
    text("482:10779", 42, top + 5, label, type("inter", 400, 11, 0, ink)),
  ] : [text(id(2), 42, top + 5, label, type("inter", 400, 11, 0, ink))]);
}

/** the tally's 24 segments: the first 17 have a fill that pops in; ids step 14 a segment, then 482:11090 on. */
function segments() {
  return Array.from({ length: 24 }, (_, index) => {
    const x = 18 + index * 10.25;
    const base = fill(index < 17 ? `482:${10852 + index * 14}` : `482:${11090 + index - 17}`, [x, 96, 9, 18], "rgb(42 31 24 / 10%)", 2.5);
    return index < 17 ? [base, fill(`482:${10853 + index * 14}`, [x, 96, 9, 18], "#c8643b", 2.5)] : [base];
  }).flat();
}

/** a persona bar row: its label, track and the bar that grows across it. */
function personaRow(label, ids, top, colour) {
  return [
    text(ids[0], 18, top - 2, label, type("mono", 400, 7, 0.42, muted)),
    fill(ids[1], [70, top, 190, 5], "rgb(42 31 24 / 8%)", 2.5),
    fill(ids[2], [70, top, 0.01, 5], colour, 2.5),
  ];
}

const capstone = {
  figma: "482:10252",
  seconds: 13.6,
  still: 2.9,
  field: ["482:10254", "482:10255", "482:10256", "482:10257", "482:10258"],
  layers: [
    dots("482:10259", 0.06),
    scene("482:10762", [
      {
        node: "482:10763", box: [107, 40, 240, 176], style: card(paper, 14),
        children: [
          text("482:10764", 18, 16, "SURVEY · STUDENTS", type("mono", 400, 7.5, 0.6, muted)),
          text("482:10765", 18, 30, "Which city channels do you follow?", type("inter", 600, 12.5, 0, ink)),
          ...answers.flatMap(answer),
        ],
      },
      cursor("482:10780", 135, 192),
    ]),
    scene("482:10847", [
      {
        node: "482:10848", box: [87, 62, 280, 132], style: card(paper, 14),
        children: [
          text("482:10849", 18, 16, "STUDENTS SURVEYED", type("mono", 400, 7.5, 0.6, muted)),
          text("482:10850", 18, 26, "17", type("serif", 400, 44, 0, ink)),
          text("482:10851", 67, 52, "of 24 follow no city channel", type("inter", 400, 11.5, 0, muted)),
          ...segments(),
        ],
      },
    ]),
    scene("482:11136", [
      {
        node: "482:11137", box: [87, 60, 280, 136], style: card(paper, 14),
        children: [
          text("482:11138", 70, 16, "Diana", type("serif", 400, 22, 0, ink)),
          text("482:11139", 70, 46, "STUDENT · NO CITY CHANNEL", type("mono", 400, 7, 0.42, muted)),
          ...personaRow("GOALS", ["482:11140", "482:11141", "482:11142"], 82, "#e2a84b"),
          ...personaRow("PAINS", ["482:11143", "482:11144", "482:11145"], 100, "#b4566a"),
          ...personaRow("HABITS", ["482:11146", "482:11147", "482:11148"], 118, "#6e9478"),
          // the mask hides the name and steps right, a letter at a time, so diana types in.
          fill("482:11220", [69, 14, 65, 31], paper),
        ],
      },
      {
        node: "482:11149", box: [189, 90, 76, 76], style: "background: #c8643b; border-radius: {22}",
        children: [text("482:11150", 22.5, 13.5, "D", type("serif", 400, 40, 0, "#fff"))],
      },
    ]),
    scene("482:11281", [
      {
        node: "482:11282", box: [57, 48, 340, 160], style: card(paper, 14),
        children: [
          text("482:11283", 18, 16, "JOURNEY · BRUCE", type("mono", 400, 7.5, 0.6, muted)),
          text("482:11284", 251, 16, "3 JOURNEY MAPS", type("mono", 400, 7.5, 0.6, muted)),
          fill("482:11285", [24, 96, 292, 1], "rgb(42 31 24 / 10%)"),
          trimmed("482:11286", [30 - 1.1, 52 - 1.1, 282.2, 68.2], "M1.1 19.1C36.1 19.1 41.1 45.1 71.1 45.1C101.1 45.1 111.1 67.1 141.1 67.1C176.1 67.1 181.1 29.1 211.1 29.1C241.1 29.1 251.1 1.1 281.1 1.1", "#E2A84B", 2.2),
          { node: "482:11287", box: [165.5, 113.5, 9, 9], src: "/images/work/capstone/cover-low-ring.svg" },
          ...[["482:11288", 25.5, 65.5], ["482:11297", 95.5, 91.5], ["482:11306", 165.5, 113.5], ["482:11315", 235.5, 75.5], ["482:11324", 305.5, 47.5]].map(([node, x, y]) => ({
            node, box: [x, y, 9, 9], src: `/images/work/capstone/${node === "482:11306" ? "cover-stage-low" : "cover-stage"}.svg`,
          })),
          text("482:11333", 150, 128, "LOW POINT", type("mono", 400, 6.5, 0.52, "#b4566a")),
        ],
      },
    ]),
  ],
};

// ovara (484:10700): arkansas typed into search, the county map colouring in, the state card, then the desert count.
const iris = "#6b5bd6";
const tileColours = { P: iris, G: "#7fae8e", Y: "#e8b04b", R: "#e0745a" };
// the 7 by 16 county tiles by tier, row by row (484:11212 to 484:11434): P well served, G adequate, Y thin, R desert.
export const ovaraTiles = [
  "PYGPRGPRYGPYGPRG",
  "GPRYGRYGPPGPRYGR",
  "YGGRYPPRGPYGGRYP",
  "RRGGRGGRRGRRGGRG",
  "PGRGPYRGPYPGRGPY",
  "GPRYGPYGPRGPRYGP",
  "RYGPPGPRYGRYGPPG",
];
const violet = "#7c7391";
const night = "#1f1830";
const lilac = "#f6f3fa";

/** every tile's grey base and its tier fill, which pops in; ids run base, fill from 484:11211. */
function tiles() {
  return ovaraTiles.flatMap((row, r) => [...row].flatMap((tier, c) => {
    const k = r * 16 + c;
    const box = [28 + c * 14, 78 + r * 14, 11, 11];
    return [fill(`484:${11211 + k * 2}`, box, "rgb(255 255 255 / 8%)", 2.5), fill(`484:${11212 + k * 2}`, box, tileColours[tier], 2.5)];
  }));
}

const legend = [["Well served", iris], ["Adequate", "#7fae8e"], ["Thin", "#e8b04b"], ["Desert", "#e0745a"]].flatMap(([label, colour], index) => [
  fill(`484:${11435 + index * 2}`, [28 + index * 58, 190, 7, 7], colour, 1.5),
  text(`484:${11436 + index * 2}`, 39 + index * 58, 188, label, type("inter", 400, 8, 0, "rgb(255 255 255 / 75%)")),
]);

const ovara = {
  figma: "484:10700",
  seconds: 13.6,
  still: 3.4,
  field: ["484:10702", "484:10703", "484:10704", "484:10705", "484:10706"],
  layers: [
    dots("484:10707", 0.08),
    scene("484:11210", [
      ...tiles(),
      ...legend,
      {
        node: "484:11443", box: [272, 70, 160, 132], style: card(lilac, 12),
        children: [
          text("484:11444", 14, 14, "ARKANSAS", type("mono", 400, 7, 0.56, violet)),
          text("484:11445", 14, 24, "20.5", type("serif", 400, 34, 0, "#e0745a")),
          text("484:11446", 14, 68, "providers per 100k", type("inter", 400, 9, 0, violet)),
          fill("484:11447", [14, 96, 132, 6], "rgb(31 24 48 / 10%)", 3),
          fill("484:11448", [14, 96, 0.01, 6], "#e0745a", 3),
          fill("484:11449", [14, 92, 2, 14], night, 1),
          text("484:11450", 93, 110, "U.S. 30.06", type("mono", 400, 6.5, 0.26, night)),
        ],
      },
      text("484:11451", 262, 80, "1,029", type("serif", 400, 48, 0, "#fff")),
      text("484:11452", 264, 140, "counties with zero providers", type("inter", 400, 11, 0, "rgb(255 255 255 / 85%)")),
      text("484:11453", 264, 160, "10.9M RESIDENTS", type("mono", 400, 8, 0.64, "#e0745a")),
      {
        node: "484:11454", box: [77, 108, 300, 40], style: card(lilac, 20, "rgb(0 0 0 / 30%)"),
        children: [
          { node: "484:11455", box: [18, 16, 8, 8], src: "/images/work/ovara/cover-search-pin.svg" },
          text("484:11456", 36, 11, "Search a county or state", type("inter", 400, 13, 0, violet)),
          text("484:11457", 36, 11, "Arkansas", type("inter", 500, 13, 0, night)),
          { node: "484:11458", box: [266, 6, 28, 28], src: "/images/work/ovara/cover-search-button.svg" },
          { node: "484:11460", box: [266, 6, 28, 28], src: "/images/work/ovara/cover-search-ring.svg" },
          // the mask hides arkansas and steps right with the caret, so the word types in.
          fill("484:11461", [35, 9, 62, 20], lilac),
          fill("484:11486", [36, 12, 1.5, 16], iris),
        ],
      },
    ]),
  ],
};

// kairo (485:11148): a scanned triage form, the extract click, noisy values resolving, then 55 of 56.
const navy = "#0e1a33";
const slate = "#6b7896";
const red = "#e05a5a";
const teal = "#22a699";

/** a triage form field: its label, its box, the noisy scan and the highlight the read draws (ids from 485:11662). */
function formField(index, value) {
  const top = 44 + index * 25;
  const id = (offset) => `485:${11662 + index * 4 + offset}`;
  return [
    fill(id(0), [12, top, 40, 3], "rgb(14 26 51 / 35%)", 1),
    { node: id(1), box: [12, top + 6, 126, 13], style: "border: {0.8} solid rgb(14 26 51 / 25%); border-radius: {2}" },
    text(id(2), 16, top + 8, value, type("mono", 400, 8, 0, "rgb(14 26 51 / 80%)")),
    { node: id(3), box: [9, top + 3, 132, 19], style: "background: rgb(61 123 255 / 8%); border: {1.2} solid #3d7bff; border-radius: {3}" },
  ];
}

/** an empty triage form field, never read. */
function blankField(ids, top) {
  return [fill(ids[0], [12, top, 40, 3], "rgb(14 26 51 / 35%)", 1), { node: ids[1], box: [12, top + 6, 126, 13], style: "border: {0.8} solid rgb(14 26 51 / 25%); border-radius: {2}" }];
}

/** a small rounded chip with its mono label. */
function chip(node, labelNode, box, colour, tint, label) {
  return { node, box, style: `background: ${tint}; border-radius: {7}`, children: [text(labelNode, 6, 3, label, type("mono", 400, 6, 0, colour))] };
}

/** an extracted field: its label, the noisy read and its underline, the clean value, and the rx and llm chips. */
function extracted(label, noisy, clean, underline, top, ids) {
  return [
    text(ids[0], 14, top, label, type("mono", 400, 6.5, 0.39, slate)),
    text(ids[1], 14, top + 10, noisy, type("mono", 400, 12, 0, navy)),
    fill(ids[2], [14, top + 27, underline, 1.2], red),
    text(ids[3], 14, top + 10, clean, type("mono", 400, 12, 0, navy)),
    chip(ids[5], ids[4], [141, top + 9, 27, 14], red, "rgb(224 90 90 / 16%)", "RX ×"),
    chip(ids[7], ids[6], [172, top + 9, 30, 14], teal, "rgb(34 166 153 / 16%)", "LLM ✓"),
    fill(ids[8], [14, top + 33, 188, 1], "rgb(14 26 51 / 6%)"),
  ];
}

const ids = (from) => Array.from({ length: 9 }, (_, index) => `485:${from + index}`);

const kairo = {
  figma: "485:11148",
  seconds: 13.2,
  still: 4,
  field: ["485:11150", "485:11151", "485:11152", "485:11153", "485:11154"],
  layers: [
    dots("485:11155", 0.07),
    scene("485:11658", [
      {
        node: "485:11659", box: [36, 30, 150, 196], style: "background: #ece8df; border-radius: {6}; overflow: hidden; box-shadow: 0 {12} {30} rgb(0 0 0 / 35%)",
        children: [
          fill("485:11660", [12, 12, 126, 6], "rgb(14 26 51 / 75%)", 2),
          text("485:11661", 12, 24, "PEDIATRIC TRIAGE", type("mono", 400, 6.5, 0.39, navy)),
          ...formField(0, "Z0/O3/2O2Z"),
          ...formField(1, "3B.6 *C"),
          ...formField(2, "l2.4 kq"),
          ...blankField(["485:11674", "485:11675"], 119),
          ...blankField(["485:11676", "485:11677"], 144),
          ...blankField(["485:11678", "485:11679"], 169),
          fill("485:11680", [0, -10, 150, 22], "rgb(61 123 255 / 16%)"),
          fill("485:11681", [0, 0, 150, 2.5], "rgb(61 123 255 / 95%)"),
        ],
      },
      {
        node: "485:11682", box: [206, 30, 216, 196], style: card("#f3f5fa", 12),
        children: [
          text("485:11683", 14, 14, "Extract fields", type("inter", 600, 11, 0, navy)),
          chip("485:11685", "485:11684", [143, 13, 59, 14], "#7a5cff", "rgb(122 92 255 / 16%)", "ZERO-SHOT LLM"),
          ...extracted("DOB", "Z0/O3/2O2Z", "20/03/2022", 72, 40, ids(11686)),
          ...extracted("TEMP", "3B.6 *C", "38.6 °C", 51, 78, ids(11695)),
          ...extracted("WEIGHT", "l2.4 kq", "12.4 kg", 51, 116, ids(11704)),
          {
            node: "485:11713", box: [14, 158, 188, 26], style: "background: #3d7bff; border-radius: {8}",
            children: [text("485:11714", 76.5, 7, "Extract", type("inter", 600, 10, 0, "#fff"))],
          },
          { node: "485:11715", box: [14, 158, 188, 26], style: "border: {1.5} solid #3d7bff; border-radius: {8}" },
        ],
      },
      cursor("485:11716", 314, 201),
      {
        node: "485:11717", box: [97, 50, 260, 156], style: card("#f3f5fa", 14),
        children: [
          text("485:11718", 16, 14, "HEAVY NOISE · DISAGREEMENTS", type("mono", 400, 7, 0.42, slate)),
          text("485:11719", 16, 26, "55 of 56", type("serif", 400, 36, 0, navy)),
          text("485:11720", 16, 72, "won by the zero-shot model", type("inter", 400, 10, 0, slate)),
          text("485:11721", 16, 100, "LLM", type("mono", 400, 7, 0.42, navy)),
          fill("485:11722", [60, 101, 184, 7], "rgb(14 26 51 / 8%)", 3.5),
          fill("485:11723", [60, 101, 0.01, 7], teal, 3.5),
          text("485:11724", 16, 120, "REGEX", type("mono", 400, 7, 0.42, navy)),
          fill("485:11725", [60, 121, 184, 7], "rgb(14 26 51 / 8%)", 3.5),
          fill("485:11726", [60, 121, 0.01, 7], red, 3.5),
        ],
      },
    ]),
  ],
};

/** @type {Record<string, CoverMotion>} */
export const coverMotion = {
  "college-park-capstone": capstone,
  ovara,
  "kairo-health": kairo,
};
