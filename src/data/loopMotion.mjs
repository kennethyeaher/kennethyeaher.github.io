/**
 * exhibit loops drawn as html over still screens instead of recorded as video, both elms loop cards (960 by 540
 * each): course first (figma 530:11608, 11.6s) and undo (531:11608, 10.6s). in each
 * the camera ("World (camera)") moves over hi-fi screens that crossfade, and the overlays that act on them are real
 * elements. the layer format is the home covers'
 * (src/data/coverMotion.mjs): figma's box in px relative to the parent layer, css whose {n} tokens are figma px, and
 * the figma node id the keyframes target. scripts/build-cover-motion.mjs writes the keyframes from figma's
 * get_motion_context export (scripts/cover-motion/<name>.motion.json) into src/styles/cover-motion/<slug>.css, which
 * only the elms page links.
 *
 * the screens are the dc repaints of figma's own fills, at their 2880 by 2152 size so the overlays land on them: the
 * course menu (core-2), no recipient yet (core-3) and ready to send (core-1), shared by both loops;
 * .private/elms-originals keeps the figma fills. still is the second that reduced motion, a paused loop and a page
 * without scripts hold: the first frame with the camera faded in (0.45s in both).
 *
 * @typedef {import("./coverMotion.mjs").MotionLayer} MotionLayer
 * @typedef {{ figma: string, seconds: number, still: number, width: number, height: number, base: string, layers: MotionLayer[] }} LoopMotion
 */

/** css for figma's lato text: weight, size in px, colour, and letter spacing in px. */
function lato(weight, size, colour, spacing = 0) {
  return `font-family: "Lato", var(--ui-sans); font-weight: ${weight}; font-size: {${size}}; color: ${colour}${spacing ? `; letter-spacing: {${spacing}}` : ""}`;
}

/** a text layer at figma's x and y. */
function text(node, x, y, value, style) {
  return { node, box: [x, y], text: value, style };
}

/** an inline svg path that figma draws by trimming its stroke; pathLength 1 lets the dash keyframes run 0 to 1. box is
    the svg's own, which overhangs the vector's frame by half its stroke. */
function trimmed(node, box, d, stroke, width, cap = "round") {
  const [, , w, h] = box;
  const body = `<path data-node="${node}" pathLength="1" d="${d}" stroke-width="${width}" stroke-linecap="${cap}" stroke-linejoin="round" stroke="${stroke}" />`;
  return { box, svg: { w, h, body } };
}

/** a hi-fi screen filling the camera's world, rounded as the world is; the bottom one has no node, as it never moves. */
const screen = (node, name) => ({ node, box: [0, 0, 960, 717.33], src: `/images/work/elms-redesign/elms-send-path-${name}.webp`, style: "border-radius: {10}" });

/** the camera: the 960 by 717.33 world of screens and overlays, 88.67 above the frame, moved and scaled by its node. */
const camera = (node, children) => ({ node, box: [0, -88.67, 960, 717.33], style: "border-radius: {10}; filter: drop-shadow(0 {18} {24} rgb(0 0 0 / 18%))", children });

const ink = "#2d3b45";
const grey = "#6b7780";
const red = "#8c1a11";
// figma places a frame's children from its outer edge, under its inside stroke, so the menu's and the chip's 1px
// strokes are inset shadows: a css border would push their children 1px in.
const hairline = "inset 0 0 0 {1} #c7cdd1";

/** one recipient row in the menu: its group label, avatar, initials, name and role line (figma 530:11623 on). */
function recipient(top, group, initials, initialsX, colour, name, role, ids) {
  const [label, avatar, letters, title, detail] = ids;
  return [
    text(label, 11, top, group, `${lato(700, 6.5, grey, 0.39)}`),
    { node: avatar, box: [11, top + 13, 16, 16], style: `border-radius: 50%; background: ${colour}` },
    text(letters, initialsX, top + 17, initials, lato(700, 6.5, "#fff")),
    text(title, 35, top + 13, name, lato(700, 9, ink)),
    text(detail, 35, top + 25, role, lato(400, 7.5, grey)),
  ];
}

/** a recipient chip in To ("Barry Allen · TA  ×", figma 530:11640 and its copies). */
const chip = (node) => ({ node, box: [302, 289, 100, 20], style: `border-radius: {10}; background: #eef0f2; box-shadow: ${hairline}`, children: [
  text(undefined, 19, 4.5, "Barry Allen · TA  ×", lato(700, 7.5, ink)),
] });

/** the pointer and its click ripple, moved by translate from the world's top left corner. */
const pointer = (ripple, cursor) => [
  { node: ripple, box: [0, 0, 14, 14], style: `border: {1.2} solid ${red}; border-radius: 50%` },
  { node: cursor, box: [-0.55, -0.55, 12.7, 19.1], src: "/images/exhibits/cover-cursor.svg" },
];

/** the To field taking focus: the blue ring, and on course first the soft glow around it. */
const toGlow = (node) => ({ node, box: [297, 222.5, 542, 35], style: "border: {3} solid rgb(45 111 184 / 25%); border-radius: {7}" });
const toRing = (node) => ({ node, box: [301, 226.5, 534, 27], style: "border: {1.8} solid #2d6fb8; border-radius: {4}" });

/** "Bar" typed into To: a white cover over the field's placeholder, the text, and the mask that steps off it. */
const typed = ([cover, letters, mask]) => [
  { node: cover, box: [304, 229.5, 240, 21], style: "background: #fff" },
  text(letters, 310, 234.5, "Bar", lato(400, 9.5, ink)),
  { node: mask, box: [309, 232, 18, 15], style: "background: #fff" },
];

/** the recipient menu under To, its row hover and accent, and the rows it lists. */
const menu = (node, height, hover, rows) => ({ node, box: [302, 257, 533, height], style: `overflow: hidden; border-radius: {4}; background: #fff; box-shadow: ${hairline}, 0 {6} {16} rgb(0 0 0 / 12%)`, children: [
  { node: hover[0], box: [-1, 17, 533, 30], style: "background: rgb(140 26 17 / 6%)" },
  { node: hover[1], box: [-1, 17, 2.5, 30], style: `background: ${red}` },
  ...rows,
] });

/** @type {Record<string, LoopMotion>} */
export const loopMotion = {
  "elms-course-first": {
    figma: "530:11608",
    seconds: 11.6,
    still: 0.45,
    width: 960,
    height: 540,
    base: "#efedea",
    layers: [
      camera("530:11609", [
        screen(undefined, "1-course"),
        screen("530:11611", "2-no-recipient"),
        screen("530:11612", "3-ready"),
        // choose a course: Course pulses, the hover settles on the current term's first course and checks it, and the
        // green ring confirms the field.
        { node: "530:11613", box: [301, 165, 534, 27], style: "border: {2} solid #2d6fb8; border-radius: {4}" },
        { node: "530:11614", box: [303, 216, 530, 33], style: "background: rgb(140 26 17 / 6%)" },
        { node: "530:11615", box: [303, 216, 2.5, 33], style: `background: ${red}` },
        trimmed("530:11616", [811.2, 224.2, 9.1, 7.3], "M0.800001 3.80001L3.4 6.50001L8.3 0.800014", red, 1.6),
        { node: "530:11617", box: [301, 165, 534, 27], style: "border: {1.6} solid #3e9a64; border-radius: {4}" },
        // then the right people: To takes focus, the three role groups open, Barry is tagged as an existing chat, and
        // the hover walks the rows before Barry is picked.
        toGlow("530:11618"),
        toRing("530:11619"),
        menu("530:11620", 140, ["530:11621", "530:11622"], [
          ...recipient(8, "TEACHING ASSISTANTS", "BA", 14.5, "#8c1a11", "Barry Allen · TA", "INST711 · Teaching assistant", ["530:11623", "530:11624", "530:11625", "530:11626", "530:11627"]),
          ...recipient(54, "INSTRUCTORS", "DP", 14.5, "#2d6fb8", "Dr. Prince · Professor", "INST711 · Instructor", ["530:11628", "530:11629", "530:11630", "530:11631", "530:11632"]),
          ...recipient(100, "CLASSMATES", "KD", 14, "#3e9a64", "Kara Danvers · Classmate", "INST711 · Student", ["530:11633", "530:11634", "530:11635", "530:11636", "530:11637"]),
          { node: "530:11638", box: [105, 19, 51, 15], style: "border-radius: {7.5}; background: rgb(45 111 184 / 12%)", children: [
            text(undefined, 7, 3.5, "Existing chat", lato(700, 6.5, "#2d6fb8")),
          ] },
        ]),
        chip("530:11640"),
        // ready: the hint by the message pulses twice.
        { node: "530:11642", box: [314, 511, 12, 12], style: "border: {1.2} solid #2d6fb8; border-radius: 50%" },
        ...pointer("530:11643", "530:11644"),
      ]),
    ],
  },
  "elms-undo": {
    figma: "531:11608",
    seconds: 10.6,
    still: 0.45,
    width: 960,
    height: 540,
    base: "#efedea",
    layers: [
      camera("531:11609", [
        screen(undefined, "3-ready"),
        screen("531:11611", "2-no-recipient"),
        screen("531:11612", "3-ready"),
        // remove: the hover lands on the chip's ×, the chip lifts away, and the message it kept glows.
        { node: "531:11613", box: [386, 292, 13, 13], style: "border-radius: 50%; background: rgb(140 26 17 / 14%)" },
        chip("531:11614"),
        { node: "531:11616", box: [297, 303, 542, 87], style: "border: {3} solid rgb(45 111 184 / 30%); border-radius: {7}" },
        // the send bar's status line, swept when Send turns off and again when it comes back.
        { box: [301, 648, 534, 48], style: "overflow: hidden; border-radius: {8}", children: [
          { node: "531:11618", box: [0, 0, 140, 48], style: "background: rgb(255 255 255 / 45%)" },
        ] },
        // put back: To takes focus, "Bar" is typed, the one matching row opens, and the chip returns.
        toRing("531:11619"),
        ...typed(["531:11620", "531:11621", "531:11622"]),
        menu("531:11623", 52, [undefined, undefined], [
          ...recipient(8, "TEACHING ASSISTANTS", "BA", 14.5, "#8c1a11", "Barry Allen · TA", "INST711 · Teaching assistant", []),
        ]),
        chip("531:11631"),
        ...pointer("531:11633", "531:11634"),
      ]),
    ],
  },
};
