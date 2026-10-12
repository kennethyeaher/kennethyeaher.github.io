import test from "node:test";
import assert from "node:assert/strict";

// node 22 strips the types, so the framing function is tested as the browser runs it.
import { frame } from "../src/scripts/pin-zoom.ts";

const wide = { w: 1116, h: 640 };
const phone = { w: 350, h: 200 };
const near = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 0.01, `${message}: ${actual} vs ${expected}`);

test("the region pads the outline by 24px, or 16px on a stage under 500 wide, before the width sets the scale", () => {
  // width bound: 1116 / (300 + 48) = 3.207; the height bound (640 - 48) / (50 + 48) is larger.
  near(frame(wide, { x: 400, y: 300, w: 300, h: 50 }).s, 1116 / 348, "wide stage scale");
  // 350 / (100 + 32) = 2.65 on a phone stage.
  near(frame(phone, { x: 120, y: 90, w: 100, h: 20 }).s, 350 / 132, "phone stage scale");
});

test("48 on-screen pixels of bar room come off the height before a tall outline sets the scale", () => {
  const box = { x: 500, y: 100, w: 100, h: 300 };
  const view = frame(wide, box);
  near(view.s, 592 / 348, "height bound (640 - 48) / (300 + 48)");
  // on screen, the outline's bottom edge sits at least pad * scale + 48 above the view's bottom.
  const gap = (view.y + wide.h / view.s - (box.y + box.h)) * view.s;
  assert.ok(gap >= 24 * view.s + 48 - 0.01, `gap under the outline ${gap}`);
});

test("the view keeps the stage's aspect ratio and is centred on the outline plus its bar room", () => {
  const box = { x: 400, y: 200, w: 100, h: 50 };
  const view = frame(wide, box);
  assert.equal(view.s, 4);
  near((wide.w / view.s) / (wide.h / view.s), wide.w / wide.h, "aspect");
  near(view.x + wide.w / view.s / 2, box.x + box.w / 2, "centred horizontally");
  near(view.y + wide.h / view.s / 2, box.y + box.h / 2 + 24 / view.s, "centred on the outline plus half of 48 / s");
});

test("the view never leaves the stage, except past the foot by the bar room an outline there needs", () => {
  const corner = frame(wide, { x: 0, y: 0, w: 100, h: 50 });
  assert.deepEqual([corner.x, corner.y], [0, 0]);
  // an outline 60 above the foot: the view stops at the stage's edges.
  const low = frame(wide, { x: 1016, y: 530, w: 100, h: 50 });
  near(low.x, wide.w - wide.w / low.s, "right edge");
  near(low.y, wide.h - wide.h / low.s, "bottom edge");
  // an outline on the foot: the view's bottom sits pad + 48 / s under it, past the stage, so the bar never covers it.
  const foot = frame(wide, { x: 1016, y: 590, w: 100, h: 50 });
  near(foot.y + wide.h / foot.s, 640 + 24 + 48 / foot.s, "bottom past the foot by the bar room");
  assert.ok(foot.y > wide.h - wide.h / foot.s, "the view overshoots the foot");
});

test("the scale is clamped to 1.5 to 4, lowered by a phone screen's cap, and under 1.5 there is no zoom", () => {
  assert.equal(frame(wide, { x: 100, y: 100, w: 50, h: 50 }).s, 4);
  assert.equal(frame(wide, { x: 100, y: 100, w: 800, h: 50 }), null);
  // raw 1.4999 stays null, raw 1.5 zooms.
  assert.equal(frame({ w: 600, h: 4000 }, { x: 0, y: 0, w: 352.1, h: 10 }), null);
  near(frame({ w: 600, h: 4000 }, { x: 0, y: 0, w: 352, h: 10 }).s, 1.5, "1.5 exactly");
  near(frame(wide, { x: 100, y: 100, w: 50, h: 50 }, 2.91).s, 2.91, "phone cap");
  assert.equal(frame(wide, { x: 100, y: 100, w: 50, h: 50 }, 1.2), null);
});

test("a two-line bar's measured room keeps the outline clear of it, inside the stage and past the foot", () => {
  // one line: 36 tall + 8 inset + 4 gap = 48, the default; two lines: 50 + 12 = 62.
  const room = 62;
  assert.deepEqual(frame(wide, { x: 500, y: 100, w: 100, h: 300 }, Infinity, 48), frame(wide, { x: 500, y: 100, w: 100, h: 300 }));
  const box = { x: 500, y: 100, w: 100, h: 300 };
  const view = frame(wide, box, Infinity, room);
  near(view.s, (640 - room) / 348, "height bound (640 - 62) / (300 + 48)");
  const gap = (view.y + wide.h / view.s - (box.y + box.h)) * view.s;
  assert.ok(gap >= 24 * view.s + room - 0.01, `gap under the outline ${gap}`);
  // on the foot, the view's bottom sits pad + room / s under the outline, past the stage.
  const footBox = { x: 1016, y: 590, w: 100, h: 50 };
  const foot = frame(wide, footBox, Infinity, room);
  near(foot.y + wide.h / foot.s, 640 + 24 + room / foot.s, "bottom past the foot by the two-line room");
  assert.ok((foot.y + wide.h / foot.s - (footBox.y + footBox.h)) * foot.s >= room, "the bar's top stays under the outline");
  // a phone stage: the two-line room lowers the scale against the one-line one.
  assert.ok(frame(phone, { x: 120, y: 60, w: 40, h: 60 }, Infinity, room).s < frame(phone, { x: 120, y: 60, w: 40, h: 60 }).s);
});

test("a tall narrow target is framed by its height, centred on it, inside the stage (Frontground 04, figma 197:1727)", () => {
  // the triage column, zoomAt { x: 54.84, y: 48.75, w: 3.94, h: 29.06 } on the 1116 by 640 stage: 44 by 186.
  const box = { x: 0.5484 * 1116, y: 0.4875 * 640, w: 0.0394 * 1116, h: 0.2906 * 640 };
  const view = frame(wide, box);
  // the width alone would allow 1116 / (44 + 48) = 12.7, so the height sets it: (640 - 48) / (186 + 48) = 2.53.
  near(view.s, 592 / (box.h + 48), "height bound");
  assert.ok(view.s < 4 && view.s < 1116 / (box.w + 48), "under the 4x clamp and the width bound");
  near(view.x + wide.w / view.s / 2, box.x + box.w / 2, "centred on the column");
  assert.ok(view.y >= 0 && view.y + wide.h / view.s <= wide.h + 0.01, "inside the stage");
  assert.ok(view.y + wide.h / view.s - (box.y + box.h) >= 24 + 48 / view.s - 0.01, "the bar room stays under the column");
});
