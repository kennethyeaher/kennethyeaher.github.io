import test from "node:test";
import assert from "node:assert/strict";

// the state behind the five live specimens from figma 363:517 ("Additions / Specimens v2"). each specimen's script
// is a thin layer over one of these modules, so its states and keys are tested here without a browser.
import * as exam from "../src/components/exhibits/specimens/frontground-exam.mjs";
import * as vision from "../src/components/exhibits/specimens/colour-vision.mjs";
import * as mood from "../src/components/exhibits/specimens/terpcare-mood.mjs";
import * as book from "../src/components/exhibits/specimens/terpcarehub-book.mjs";
import * as rsvp from "../src/components/exhibits/specimens/sohive-rsvp.mjs";

test("the primary assessment starts in the mock's state: on breathing, two findings, airway clear, yellow set", () => {
  const state = exam.createExam();
  assert.deepEqual(exam.letters.map((letter) => [letter.key, letter.name]), [["A", "Airway"], ["B", "Breathing"], ["C", "Circulation"], ["D", "Disability"], ["E", "Exposure"]]);
  assert.deepEqual(exam.letters[1].findings, ["Clear", "Wheeze", "Crackles", "Stridor", "Rate over 30", "Accessory muscles", "SpO₂ under 92%", "Unable to speak"]);
  // every letter offers Clear first, then the findings from the original New Exam screens.
  for (const letter of exam.letters) assert.equal(letter.findings[0], "Clear", letter.name);
  assert.equal(state.current, 1);
  assert.deepEqual(state.selected, [["Clear"], ["Wheeze", "Rate over 30"], [], [], []]);
  assert.equal(state.triage, "yellow");
  assert.equal(exam.noteFor(state, 1), "Wheeze, rate over 30.");
  assert.equal(exam.summaryFor(state, 0), "Clear");
  assert.equal(exam.summaryFor(state, 1), "Wheeze, rate over 30");
  assert.equal(exam.summaryFor(state, 2), null);
  assert.deepEqual(exam.letters.map((_, index) => exam.stepStatus(state, index)), ["done", "current", "todo", "todo", "todo"]);
  assert.deepEqual(exam.letters.map((_, index) => exam.stepDetail(state, index)), ["Clear", "2 findings", "", "", ""]);
  assert.equal(exam.nextLabel(state), "Next: Circulation");
});

test("findings toggle, Clear stands alone, and the note composes from what is selected", () => {
  let state = exam.createExam();
  state = exam.toggleFinding(state, "Crackles");
  assert.deepEqual(state.selected[1], ["Wheeze", "Crackles", "Rate over 30"], "kept in the order the chips show");
  assert.equal(exam.noteFor(state, 1), "Wheeze, crackles, rate over 30.");
  assert.equal(exam.stepDetail(state, 1), "3 findings");
  state = exam.toggleFinding(state, "Wheeze");
  state = exam.toggleFinding(state, "Rate over 30");
  assert.equal(exam.stepDetail(state, 1), "1 finding");
  // a name with a capital inside keeps its case in the note.
  state = exam.toggleFinding(state, "SpO₂ under 92%");
  assert.equal(exam.noteFor(state, 1), "Crackles, SpO₂ under 92%.");
  // Clear replaces every finding, and any finding replaces Clear.
  state = exam.toggleFinding(state, "Clear");
  assert.deepEqual(state.selected[1], ["Clear"]);
  assert.equal(exam.stepDetail(state, 1), "Clear");
  state = exam.toggleFinding(state, "Stridor");
  assert.deepEqual(state.selected[1], ["Stridor"]);
  state = exam.toggleFinding(state, "Stridor");
  assert.deepEqual(state.selected[1], []);
  assert.equal(exam.noteFor(state, 1), "");
  assert.equal(exam.stepDetail(state, 1), "");
});

test("an edited note keeps the nurse's words until the chips are tapped again for another letter", () => {
  let state = exam.setNote(exam.createExam(), "Wheeze both sides, rate 34.");
  state = exam.toggleFinding(state, "Stridor");
  assert.equal(exam.noteFor(state, 1), "Wheeze both sides, rate 34.");
  // the summary and step count still follow the chips.
  assert.equal(exam.summaryFor(state, 1), "Wheeze, stridor, rate over 30");
  // other letters still write themselves.
  state = exam.toggleFinding(exam.stepTo(state, 2), "Pale");
  assert.equal(exam.noteFor(state, 2), "Pale.");
});

test("stepping moves through the five letters, done marks a letter with findings, and E ends on Done", () => {
  let state = exam.stepTo(exam.createExam(), 0);
  assert.deepEqual(exam.letters.map((_, index) => exam.stepStatus(state, index)), ["current", "done", "todo", "todo", "todo"]);
  state = exam.step(state, -1);
  assert.equal(state.current, 0, "no step before airway");
  state = exam.step(exam.step(exam.step(exam.step(state, 1), 1), 1), 1);
  assert.equal(state.current, 4);
  assert.equal(exam.nextLabel(state), "Done");
  state = exam.step(state, 1);
  assert.equal(state.current, 4, "no step after exposure");
  assert.equal(state.complete, true, "Next on E completes the exam");
  assert.equal(exam.step(state, -1).complete, false);
});

test("triage is the nurse's to set: 1 2 3 or a tap, never changed by findings", () => {
  let state = exam.setTriage(exam.createExam(), "red");
  assert.equal(state.triage, "red");
  state = exam.toggleFinding(state, "Unable to speak");
  assert.equal(state.triage, "red");
  assert.deepEqual(exam.triageLevels.map((level) => [level.key, level.label, level.shape]), [["red", "Red", "square"], ["yellow", "Yellow", "rounded"], ["green", "Green", "circle"]]);
});

test("the specimen's keys: arrows step, 1 2 3 set triage, Space is left to the focused button, typing is left alone", () => {
  assert.deepEqual(exam.keyAction({ key: "ArrowLeft" }), { type: "step", by: -1 });
  assert.deepEqual(exam.keyAction({ key: "ArrowRight" }), { type: "step", by: 1 });
  assert.deepEqual(exam.keyAction({ key: "1" }), { type: "triage", level: "red" });
  assert.deepEqual(exam.keyAction({ key: "2" }), { type: "triage", level: "yellow" });
  assert.deepEqual(exam.keyAction({ key: "3" }), { type: "triage", level: "green" });
  // Space and Enter already press a native button.
  assert.equal(exam.keyAction({ key: " " }), null);
  assert.equal(exam.keyAction({ key: "Enter" }), null);
  // nothing is taken from the note field or from a shortcut.
  assert.equal(exam.keyAction({ key: "ArrowLeft", typing: true }), null);
  assert.equal(exam.keyAction({ key: "2", typing: true }), null);
  assert.equal(exam.keyAction({ key: "ArrowRight", metaKey: true }), null);
  assert.equal(exam.keyAction({ key: "1", ctrlKey: true }), null);
  assert.equal(exam.keyAction({ key: "ArrowRight", altKey: true }), null);
});

test("Machado 2009 at full severity in linear sRGB reproduces the mock's deutan swatches", () => {
  assert.deepEqual(vision.modes.map((mode) => [mode.key, mode.label]), [["typical", "Typical"], ["protan", "Protan"], ["deutan", "Deutan"], ["tritan", "Tritan"], ["greyscale", "Greyscale"]]);
  assert.equal(vision.simulate("#de5b5b", "deutan"), "#9c9058");
  assert.equal(vision.simulate("#0c8b44", "deutan"), "#7e7549");
  assert.equal(vision.simulate("#f7fd3b", "deutan"), "#fff64d");
  assert.equal(vision.simulate("#de5b5b", "protan"), "#7c755a");
  assert.equal(vision.simulate("#0c8b44", "tritan"), "#00897a");
  for (const colour of ["#de5b5b", "#0c8b44", "#003f5d", "#ffffff"]) assert.equal(vision.simulate(colour, "typical"), colour);
  const grey = vision.simulate("#de5b5b", "greyscale");
  assert.equal(grey.slice(1, 3), grey.slice(3, 5));
  assert.equal(grey.slice(3, 5), grey.slice(5, 7));
  // white stays white under every matrix, so the chip's paper does not move.
  for (const mode of vision.modes) assert.equal(vision.simulate("#ffffff", mode.key), "#ffffff", mode.key);
  // the published rows for deutan, and the svg filter carries the same nine numbers.
  assert.deepEqual(vision.matrices.deutan, [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881]);
  assert.equal(vision.filterValues("deutan"), "0.367322 0.860646 -0.227968 0 0 0.280085 0.672501 0.047413 0 0 -0.01182 0.04294 0.968881 0 0 0 0 0 1 0");
});

test("washout lifts the black level, and chip contrast is measured from the simulated colours", () => {
  assert.equal(vision.washout("#003f5d", 0), "#003f5d");
  assert.equal(vision.washout("#ffffff", 0.8), "#ffffff");
  assert.equal(vision.washout("#000000", 0.4), "#333333");
  assert.ok(Math.abs(vision.contrast("#000000", "#ffffff") - 21) < 1e-9);
  const typical = vision.chipContrast("typical", 0);
  assert.ok(typical > 11 && typical < 12, `navy on white is ${typical}`);
  assert.ok(vision.chipContrast("deutan", 0.4) >= 4.5);
  assert.ok(vision.chipContrast("deutan", 0.8) < 4.5);
  assert.equal(vision.formatRatio(11.37), "11.4:1");
});

test("what still separates the levels: hue fails where red and green meet, shape and word always hold", () => {
  const deutan = vision.verdict("deutan", 0.4);
  assert.deepEqual(deutan.map((row) => [row.key, row.pass]), [["hue", false], ["shape", true], ["word", true], ["contrast", true]]);
  assert.equal(deutan[0].body, "Red and green read as the same olive");
  assert.equal(deutan[1].body, "Square, rounded, circle");
  assert.equal(deutan[2].body, "Red, Yellow, Green on every chip");
  // the contrast row keeps the mock's words and carries the measured ratio beside its title.
  assert.equal(deutan[3].body, "Chip text against white, measured live");
  assert.equal(deutan[3].value, vision.formatRatio(vision.chipContrast("deutan", 0.4)));
  assert.deepEqual(deutan.slice(0, 3).map((row) => row.value), [null, null, null]);
  assert.equal(vision.verdict("protan", 0)[0].pass, false);
  assert.equal(vision.verdict("greyscale", 0)[0].pass, false);
  assert.equal(vision.verdict("greyscale", 0)[0].body, "Only lightness is left");
  assert.equal(vision.verdict("typical", 0)[0].pass, true);
  assert.equal(vision.verdict("tritan", 0)[0].pass, true);
  assert.equal(vision.verdict("deutan", 0.8)[3].pass, false);
  assert.equal(vision.describe("deutan"), "Deuteranopia · red and green fall together");
  for (const mode of vision.modes) assert.ok(vision.describe(mode.key).length > 0, mode.key);
});

test("the mood check in has five levels, each a word, a bar count and its own colour, with today in the week", () => {
  assert.deepEqual(mood.levels.map((level) => [level.key, level.label, level.bars]), [["great", "Great", 5], ["good", "Good", 4], ["okay", "Okay", 3], ["low", "Low", 2], ["struggling", "Struggling", 1]]);
  const state = mood.createMood();
  assert.equal(state.day, 1);
  assert.equal(mood.dateLabel(state.day), "Tuesday, October 13");
  assert.deepEqual(state.week, ["good", "okay", "low", "okay", "great", null, "good"]);
  assert.deepEqual(state.tags[1], ["Sleep", "Classes"]);
  assert.deepEqual(mood.tags, ["Sleep", "Classes", "Friends", "Health"]);
  assert.equal(mood.dayName(5), "Saturday");
  assert.equal(mood.dayLabel(state, 5), "Saturday, nothing saved");
  assert.equal(mood.dayLabel(state, 1), "Tuesday, Okay");
});

test("choosing a level saves it into the selected day, and tapping a day brings its check in back", () => {
  let state = mood.chooseLevel(mood.createMood(), "struggling");
  assert.equal(state.week[1], "struggling");
  state = mood.chooseDay(state, 5);
  assert.equal(mood.levelFor(state), null, "a missed day stays blank");
  assert.equal(mood.dateLabel(state.day), "Saturday, October 17");
  state = mood.chooseLevel(state, "low");
  assert.deepEqual(state.week, ["good", "struggling", "low", "okay", "great", "low", "good"]);
  state = mood.toggleTag(state, "Health");
  assert.deepEqual(state.tags[5], ["Health"]);
  assert.deepEqual(mood.chooseDay(state, 1).tags[1], ["Sleep", "Classes"]);
  state = mood.toggleTag(mood.chooseDay(state, 1), "Sleep");
  assert.deepEqual(state.tags[1], ["Classes"]);
});

test("booking opens in place, confirms a chosen time, offers Undo for five seconds, then lands in Your bookings", () => {
  assert.equal(book.TOAST_MS, 5000);
  assert.deepEqual(book.slots, ["2:40 PM", "3:20 PM", "4:00 PM"]);
  let state = book.createBooking();
  assert.deepEqual(state, { phase: "idle", time: "2:40 PM" });
  state = book.open(state);
  assert.equal(state.phase, "picking");
  assert.equal(book.confirmLabel(state), "Confirm 2:40 PM");
  state = book.pick(state, "3:20 PM");
  assert.equal(book.confirmLabel(state), "Confirm 3:20 PM");
  state = book.confirm(state);
  assert.deepEqual(state, { phase: "booked", time: "3:20 PM" });
  assert.equal(book.bookedLabel(state), "Booked · Today, 3:20 PM");
  assert.deepEqual(book.undo(state), { phase: "idle", time: "2:40 PM" });
  state = book.expire(state);
  assert.equal(state.phase, "landed");
  // once it has landed the toast is gone, so Undo does nothing.
  assert.equal(book.undo(state).phase, "landed");
  // picking a time only works with the card open.
  assert.equal(book.pick(book.createBooking(), "4:00 PM").time, "2:40 PM");
});

test("an RSVP counts the room, fills the bar, issues a ticket and can be undone for five seconds", () => {
  assert.equal(rsvp.CAPACITY, 300);
  assert.equal(rsvp.TOAST_MS, 5000);
  let state = rsvp.createRsvp();
  assert.deepEqual(state, { going: false, count: 241, toast: null });
  assert.equal(rsvp.spotsLeft(state), 59);
  assert.equal(rsvp.fillPercent(state), 80.33);
  assert.deepEqual(rsvp.digits(state.count), [2, 4, 1]);
  state = rsvp.tap(state);
  assert.deepEqual(state, { going: true, count: 242, toast: "You're going. 242 people now." });
  assert.equal(rsvp.spotsLeft(state), 58);
  state = rsvp.expire(state);
  assert.equal(state.toast, null);
  // leaving says so, and its Undo puts you back.
  state = rsvp.tap(state);
  assert.deepEqual(state, { going: false, count: 241, toast: "You're no longer going." });
  state = rsvp.undo(state);
  assert.deepEqual(state, { going: true, count: 242, toast: null });
  assert.deepEqual(rsvp.undo(rsvp.tap(rsvp.createRsvp())), { going: false, count: 241, toast: null });
});
