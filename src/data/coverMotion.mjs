/**
 * home motion covers, built from figma's motion cover timelines: capstone v4 (482:10252), ovara v5 (549:11632) and
 * kairo v4 (485:11148). each cover loops one timeline. this file holds the layers in figma's nesting; the keyframes come from
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
 * ovara shows only figures from the published analysis and the iris atlas dashboard: cass county, missouri (fips 29037)
 * at 0.92 providers per 100k with 108,205 residents, livingston parish at 1.39, 1,029 desert counties and 10.9m residents. kairo's noisy field values are illustrative ocr reads, as in figma.
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

// ovara (549:11632): the iris atlas map card fills in tier by tier, cass county is typed into search and ringed on the
// map, its county card saves it, livingston parish joins it in the comparison, then the desert count.
const plum = "#2f1a3e";
const dusk = "#645b6f";
const cream = "#f7f4ee";
const iris = "#6846aa";
const coral = "#c45b32";
const rule = "#dcd5e2";
const tierColours = { W: "#dbceee", A: "#b59dd6", U: "#8a6cbd", C: "#6041a0", D: coral };
// the 7 by 16 county tiles by tier, row by row, from each tile's layer name (Tile r-c X): W well served, A adequate,
// U underserved, C critical, D access desert.
export const ovaraTiles = [
  "WWWWDADDDAWDWWAU",
  "WWWDUDDAUDWWUUWW",
  "CAWUDADWDCDWWDDA",
  "DCAWCWDDUDWDDAAW",
  "UWDDADDAWWDWWAWW",
  "WWWUUDWDDDDACUAW",
  "WWDADWADDADADAAW",
];
// figma numbers the tiles unevenly, so each tile's base and fill ids are listed in reading order (550:12094 on).
const tileIds = `12094 12095 12104 12105 12114 12115 12124 12125 12134 12135 12145 12146 12155 12156 12166 12167
12177 12178 12188 12189 12198 12199 12208 12209 12219 12220 12229 12230 12239 12240 12249 12250
12259 12260 12269 12270 12279 12280 12289 12290 12300 12301 12310 12311 12321 12322 12332 12333
12342 12343 12352 12353 12363 12364 12373 12374 12383 12384 12393 12394 12403 12404 12413 12414
12423 12424 12433 12434 12443 12444 12453 12454 12463 12464 12474 12475 12484 12485 12495 12496
12505 12506 12516 12517 12526 12527 12537 12538 12547 12548 12557 12558 12568 12569 12579 12580
12589 12590 12600 12601 12610 12611 12620 12621 12630 12631 12640 12641 12650 12651 12661 12662
12672 12673 12682 12683 12693 12694 12703 12704 12714 12715 12725 12726 12735 12736 12745 12746
12755 12756 12765 12766 12775 12776 12786 12787 12797 12798 12807 12808 12818 12819 12829 12830
12839 12840 12849 12850 12859 12860 12870 12871 12880 12881 12890 12891 12900 12901 12910 12911
12920 12921 12930 12931 12940 12941 12950 12951 12960 12961 12970 12971 12981 12982 12991 12992
13002 13003 13013 13014 13024 13025 13035 13036 13045 13046 13055 13056 13065 13066 13075 13076
13085 13086 13095 13096 13105 13106 13116 13117 13126 13127 13137 13138 13147 13148 13157 13158
13168 13169 13179 13180 13189 13190 13200 13201 13210 13211 13221 13222 13231 13232 13241 13242`.split(/\s+/).map((id) => `550:${id}`);

/** every tile's pale base and its tier fill, which pops in over it. */
function tiles() {
  return ovaraTiles.flatMap((row, r) => [...row].flatMap((tier, c) => {
    const k = r * 16 + c;
    const box = [c * 14, r * 14, 11, 11];
    return [fill(tileIds[k * 2], box, "#e7e1ec", 2.5), fill(tileIds[k * 2 + 1], box, tierColours[tier], 2.5)];
  }));
}

/** a county ring on the map: figma strokes the ellipse inside its box. */
const ring = (node, x, y) => ({ node, box: [x, y, 19, 19], style: `border: {1.6} solid ${plum}; border-radius: 50%` });
const legend = [["D", "0"], ["C", ">0–5"], ["U", ">5–10"], ["A", ">10–20"], ["W", ">20"]].flatMap(([tier, label], index) => [
  fill(undefined, [14 + index * 46, 167, 7, 7], tierColours[tier], 1.5),
  text(undefined, 25 + index * 46, 165.5, label, type("inter", 400, 7, 0, plum)),
]);
const panel = (colour, radius) => `background: ${colour}; border-radius: {${radius}}; overflow: hidden; box-shadow: 0 {10} {24} rgb(47 26 62 / 32%)`;
const countyRow = (node, name, place, rate, rateX, top) => ({
  node, box: [0, top, 142, 34],
  children: [
    text(undefined, 12, 0, name, type("serif", 400, 10.5, 0, plum)),
    text(undefined, 12, 17, place, type("inter", 400, 6.5, 0, dusk)),
    text(undefined, rateX, 1, rate, type("inter", 600, 13, 0, plum)),
  ],
});

const ovara = {
  figma: "549:11632",
  seconds: 13.6,
  still: 5,
  field: ["549:11634", "549:11635", "549:11636", "549:11637", "549:11638"],
  layers: [
    dots("549:11639", 0.08),
    scene("550:12080", [
      {
        node: "550:12086", box: [22, 34, 252, 186], style: panel(cream, 14),
        children: [
          {
            box: [14, 50, 221, 95],
            children: [...tiles(), ring("550:13262", 122, 24), ring("550:13271", 164, 66)],
          },
          text(undefined, 14, 152, "Registered providers per 100,000 residents", type("inter", 400, 6.5, 0, dusk)),
          ...legend,
          {
            box: [14, 12, 224, 26], style: `background: #fff; border: {1} solid ${rule}; border-radius: {13}; overflow: hidden`,
            children: [
              fill(undefined, [12, 10, 6, 6], iris, 3),
              text("550:13282", 26, 7, "Search county or state", type("inter", 400, 9, 0, dusk)),
              // the home page sets inter in the system face, which runs cass county 1.6px past figma's 55; a hair of
              // tracking keeps the y inside the mask's last step.
              text("550:13283", 26, 7, "Cass County", type("inter", 500, 9, -0.2, plum)),
              // the mask hides cass county and steps right with the caret, so the name types in.
              fill("550:13295", [25.5, 5, 61, 16], "#fff"),
              fill("550:13296", [26, 7.5, 1.2, 11], iris),
            ],
          },
          { node: "550:13333", box: [12.5, 10.5, 227, 29], style: `border: {1.5} solid ${iris}; border-radius: {14.5}` },
        ],
      },
      {
        node: "550:13339", box: [290, 34, 142, 150], style: panel("#fff", 12),
        children: [
          text(undefined, 12, 12, "SELECTED COUNTY", type("mono", 400, 6, 0.48, dusk)),
          text(undefined, 12, 23, "Cass County", type("serif", 400, 17, 0, plum)),
          text(undefined, 12, 46, "Missouri · FIPS 29037", type("inter", 400, 7, 0, dusk)),
          fill(undefined, [12, 60, 118, 18], "#eee7fa", 4),
          text(undefined, 18, 64.5, "Critical · 0.92 providers / 100k", type("inter", 500, 6.8, 0, plum)),
          text(undefined, 12, 86, "Providers", type("inter", 400, 6.5, 0, dusk)),
          text(undefined, 12, 96, "1", type("inter", 600, 13, 0, plum)),
          text(undefined, 66, 86, "Residents", type("inter", 400, 6.5, 0, dusk)),
          text(undefined, 66, 96, "108,205", type("inter", 600, 13, 0, plum)),
          {
            node: "550:13349", box: [12, 120, 118, 20], style: `background: ${iris}; border-radius: {6}; overflow: hidden`,
            children: [text(undefined, 25, 5, "Add to comparison", type("inter", 500, 7.5, 0, "#fff"))],
          },
        ],
      },
      {
        node: "550:13369", box: [290, 42, 142, 134], style: panel("#fff", 12),
        children: [
          text(undefined, 12, 12, "COMPARE (2/2) · PER 100K", type("mono", 400, 6, 0.48, dusk)),
          countyRow("550:13371", "Cass County", "Missouri · Critical", "0.92", 101, 28),
          fill(undefined, [12, 64, 118, 1], rule),
          countyRow("550:13382", "Livingston Parish", "Louisiana · Critical", "1.39", 103, 72),
          fill(undefined, [12, 106, 118, 1], rule),
          text("550:13393", 12, 113, "Different rates. The same tier.", type("serif", 400, 8.5, 0, plum)),
        ],
      },
      {
        box: [290, 66, 150, 100],
        children: [
          text("550:13408", 0, 0, "1,029", type("serif", 400, 46, 0, "#fff")),
          text("550:13409", 2, 58, "counties with zero providers", type("inter", 400, 9.5, 0, "rgb(255 255 255 / 88%)")),
          text("550:13410", 2, 76, "10.9M RESIDENTS", type("mono", 400, 7.5, 0.6, "#e58a63")),
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

/** the llm chip: the site's jetbrains mono is cut to latin, so its ✓ would fall back to another, larger font. the check
    is jetbrains mono's own ✓ outline (uni2713) instead, at 6px in the glyph's cell after "LLM ": 0.6em wide, from the
    1.02em ascent to the 0.3em descent, so it sits at figma's size and baseline. */
function llmChip(node, labelNode, box, colour, tint) {
  const label = chip(node, labelNode, box, colour, tint, "LLM");
  const check = { box: [6 + 4 * 3.6, 3, 3.6, 7.92], svg: { w: 3.6, h: 7.92, body: `<path d="M0.222 4.152L0.6 3.756L1.464 4.608L2.97 2.388L3.384 2.676L1.518 5.43Z" fill="${colour}" />` } };
  return { ...label, children: [...label.children, check] };
}

/** an extracted field: its label, the noisy read and its underline, the clean value, and the rx and llm chips. */
function extracted(label, noisy, clean, underline, top, ids) {
  return [
    text(ids[0], 14, top, label, type("mono", 400, 6.5, 0.39, slate)),
    text(ids[1], 14, top + 10, noisy, type("mono", 400, 12, 0, navy)),
    fill(ids[2], [14, top + 27, underline, 1.2], red),
    text(ids[3], 14, top + 10, clean, type("mono", 400, 12, 0, navy)),
    chip(ids[5], ids[4], [141, top + 9, 27, 14], red, "rgb(224 90 90 / 16%)", "RX ×"),
    llmChip(ids[7], ids[6], [172, top + 9, 30, 14], teal, "rgb(34 166 153 / 16%)"),
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
