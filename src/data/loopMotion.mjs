/**
 * exhibit loops drawn as html over still screens instead of recorded as video. elms's send path (figma 504:11596,
 * "ELMS loop / Send path", 960 by 540, 16.4s) is the only one: the camera ("World (camera)") moves over four hi-fi
 * screens that crossfade, and the overlays that act on them are real elements. the layer format is the home covers'
 * (src/data/coverMotion.mjs): figma's box in px relative to the parent layer, css whose {n} tokens are figma px, and
 * the figma node id the keyframes target. scripts/build-cover-motion.mjs writes the keyframes from figma's
 * get_motion_context export (scripts/cover-motion/elms-send-path.motion.json) into src/styles/cover-motion/<slug>.css,
 * which only the elms page links.
 *
 * the four screens are the dc repaints of figma's own fills, at their 2880 by 2152 size so the overlays land on them:
 * state 1 is the course menu (core-2), 2 no recipient yet (core-3), 3 ready to send (core-1), 4 the sent thread
 * (path-loop); .private/elms-originals keeps the figma fills. still is the second that reduced motion, a paused loop
 * and a page without scripts hold: the first frame with the camera faded in, on the course menu.
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

/** a hi-fi screen filling the camera's world, rounded as the world is. */
const screen = (node, name) => ({ node, box: [0, 0, 960, 717.33], src: `/images/work/elms-redesign/elms-send-path-${name}.webp`, style: "border-radius: {10}" });

const ink = "#2d3b45";
const grey = "#6b7780";
const red = "#8c1a11";
// figma places a frame's children from its outer edge, under its inside stroke, so the menu's and the chip's 1px
// strokes are inset shadows: a css border would push their children 1px in.
const hairline = "inset 0 0 0 {1} #c7cdd1";

/** one recipient row in the menu: its group label, avatar, initials, name and role line (figma 504:11617 on). */
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

/** @type {Record<string, LoopMotion>} */
export const loopMotion = {
  "elms-send-path": {
    figma: "504:11596",
    seconds: 16.4,
    still: 0.45,
    width: 960,
    height: 540,
    base: "#efedea",
    layers: [
      { node: "504:11597", box: [0, -88.67, 960, 717.33], style: "border-radius: {10}; filter: drop-shadow(0 {18} {24} rgb(0 0 0 / 18%))", children: [
        { box: [0, 0, 960, 717.33], src: "/images/work/elms-redesign/elms-send-path-1-course.webp", style: "border-radius: {10}" },
        screen("504:11599", "2-no-recipient"),
        screen("504:11600", "3-ready"),
        screen("504:11601", "4-sent"),
        // choose a course: the hover band on the current term's first course, its check, then the green ring on Course.
        { node: "504:11602", box: [303, 216, 530, 33], style: "background: rgb(140 26 17 / 6%)" },
        { node: "504:11603", box: [303, 216, 2.5, 33], style: `background: ${red}` },
        trimmed("504:11604", [811.2, 224.2, 9.1, 7.3], "M0.800001 3.80001L3.4 6.50001L8.3 0.800014", red, 1.6),
        { node: "504:11605", box: [301, 165, 534, 27], style: "border: {1.6} solid #3e9a64; border-radius: {4}" },
        // the send bar's status line, swept twice: when the course lands and again before Send.
        { box: [301, 648, 534, 48], style: "overflow: hidden; border-radius: {8}", children: [
          { node: "504:11607", box: [0, 0, 140, 48], style: "background: rgb(255 255 255 / 65%); opacity: 0.45" },
        ] },
        // choose the ta: To takes focus, "Bar" is typed, and the menu's three role groups close down to the match.
        { node: "504:11608", box: [297, 222.5, 542, 35], style: "border: {3} solid rgb(45 111 184 / 25%); border-radius: {7}" },
        { node: "504:11609", box: [301, 226.5, 534, 27], style: "border: {1.8} solid #2d6fb8; border-radius: {4}" },
        { node: "504:11610", box: [304, 229.5, 240, 21], style: "background: #fff" },
        text("504:11611", 310, 234.5, "Bar", lato(400, 9.5, ink)),
        { node: "504:11612", box: [309, 232, 18, 15], style: "background: #fff" },
        { node: "504:11613", box: [310, 233.5, 1, 12], style: `background: ${ink}` },
        { node: "504:11614", box: [302, 257, 533, 140], style: `overflow: hidden; border-radius: {4}; background: #fff; box-shadow: ${hairline}, 0 {6} {16} rgb(0 0 0 / 12%)`, children: [
          { node: "504:11615", box: [-1, 17, 533, 30], style: "background: rgb(140 26 17 / 6%)" },
          { node: "504:11616", box: [-1, 17, 2.5, 30], style: `background: ${red}` },
          ...recipient(8, "TEACHING ASSISTANTS", "BA", 14.5, "#8c1a11", "Barry Allen · TA", "INST711 · Teaching assistant", ["504:11617", "504:11618", "504:11619", "504:11620", "504:11621"]),
          ...recipient(54, "INSTRUCTORS", "DP", 14.5, "#2d6fb8", "Dr. Prince · Professor", "INST711 · Instructor", ["504:11622", "504:11623", "504:11624", "504:11625", "504:11626"]),
          ...recipient(100, "CLASSMATES", "KD", 14, "#3e9a64", "Kara Danvers · Classmate", "INST711 · Student", ["504:11627", "504:11628", "504:11629", "504:11630", "504:11631"]),
        ] },
        { node: "504:11632", box: [302, 289, 100, 20], style: `border-radius: {10}; background: #eef0f2; box-shadow: ${hairline}`, children: [
          text(undefined, 19, 4.5, "Barry Allen · TA  ×", lato(700, 7.5, ink)),
        ] },
        // send: the hint pulses by the message, Send presses, and the paper plane flies off.
        { node: "504:11634", box: [314, 511, 12, 12], style: "border: {1.2} solid #2d6fb8; border-radius: 50%" },
        { node: "504:11635", box: [715, 659, 109, 26], style: "background: #000; border-radius: {4}" },
        { node: "504:11636", box: [723.6, 664.6, 14.8, 14.8], src: "/images/exhibits/elms-loop-paper-plane.svg" },
        // sent: the banner's icon is covered and redrawn, ring then check, and the banner is swept.
        { node: "504:11637", box: [311, 534, 17, 17], style: "border-radius: 50%; background: #e9f5ec" },
        trimmed("504:11638", [313.25, 536.25, 12.5, 12.5], "M6.25 0A6.25 6.25 0 1 1 6.25 12.5A6.25 6.25 0 1 1 6.25 0", "#3e9a64", 1.3, "butt"),
        trimmed("504:11639", [315.9, 539.1, 7.2, 5.8], "M0.7 3.00002L2.8 5.10002L6.5 0.700016", "#3e9a64", 1.4),
        { box: [301, 526, 534, 43], style: "overflow: hidden; border-radius: {6}", children: [
          { node: "504:11641", box: [0, 0, 140, 43], style: "background: rgb(255 255 255 / 60%); opacity: 0.5" },
        ] },
        // the pointer and its click ripple, moved by translate from the world's top left corner.
        { node: "504:11642", box: [0, 0, 14, 14], style: `border: {1.2} solid ${red}; border-radius: 50%` },
        { node: "504:11643", box: [-0.55, -0.55, 12.7, 19.1], src: "/images/exhibits/cover-cursor.svg" },
      ] },
    ],
  },
};
