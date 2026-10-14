// the state behind the primary assessment specimen (figma 363:518): five letters in clinical order, the findings a
// nurse taps under each, a note that writes itself from them, and the triage level the nurse sets. breathing's
// findings are the mock's; the other letters' come from Frontground's own New Exam screens (figma 5Yl8NmDe5vohtqxAs4zHou,
// "10 · New Exam — page 1" and "11 · New Exam — page 2"). Clear comes first under every letter and stands alone.

export const letters = [
  { key: "A", name: "Airway", findings: ["Clear", "Needs suctioning", "Needs positioning", "Guedel airway"] },
  { key: "B", name: "Breathing", findings: ["Clear", "Wheeze", "Crackles", "Stridor", "Rate over 30", "Accessory muscles", "SpO₂ under 92%", "Unable to speak"] },
  { key: "C", name: "Circulation", findings: ["Clear", "Weak pulse", "Fast pulse", "Slow pulse", "Cool extremities", "Pale", "Cyanotic"] },
  { key: "D", name: "Disability", findings: ["Clear", "Responds to voice", "Responds to pain", "Unresponsive", "Pupils unequal", "Convulsions"] },
  { key: "E", name: "Exposure", findings: ["Clear", "Rash", "Cracked skin", "Dry skin", "In pain"] },
];

/** Red, Yellow and Green, each a word and a shape as well as a colour. */
export const triageLevels = [
  { key: "red", label: "Red", shape: "square" },
  { key: "yellow", label: "Yellow", shape: "rounded" },
  { key: "green", label: "Green", shape: "circle" },
];

/** the mock's state: airway clear, breathing current with two findings, yellow set. */
export function createExam() {
  return { current: 1, selected: [["Clear"], ["Wheeze", "Rate over 30"], [], [], []], notes: [null, null, null, null, null], triage: "yellow", complete: false };
}

const replaceAt = (list, index, value) => list.map((item, at) => (at === index ? value : item));

/** tap a finding under the current letter. Clear replaces every other finding, and any finding replaces Clear. */
export function toggleFinding(state, label) {
  const { findings } = letters[state.current];
  const now = state.selected[state.current];
  let next;
  if (now.includes(label)) next = now.filter((item) => item !== label);
  else if (label === "Clear") next = ["Clear"];
  else next = [...now.filter((item) => item !== "Clear"), label];
  next.sort((a, b) => findings.indexOf(a) - findings.indexOf(b));
  return { ...state, selected: replaceAt(state.selected, state.current, next) };
}

/** a finding as it reads inside a sentence: lower case unless the name has a capital of its own, like SpO₂. */
const inSentence = (label) => (/[A-Z]/.test(label.slice(1)) ? label : label[0].toLowerCase() + label.slice(1));

/** the selected findings as one line, "Wheeze, rate over 30", or null with none. */
export function summaryFor(state, index) {
  const chosen = state.selected[index];
  if (chosen.length === 0) return null;
  return [chosen[0], ...chosen.slice(1).map(inSentence)].join(", ");
}

/** the note under a letter: the nurse's own words once edited, otherwise the summary as a sentence. */
export function noteFor(state, index) {
  if (state.notes[index] !== null) return state.notes[index];
  const summary = summaryFor(state, index);
  return summary ? `${summary}.` : "";
}

/** the nurse edits the current letter's note; from then on the chips leave it alone. */
export function setNote(state, text) {
  return { ...state, notes: replaceAt(state.notes, state.current, text) };
}

/** what a step says under its name: Clear, a count of findings, or nothing yet. */
export function stepDetail(state, index) {
  const chosen = state.selected[index];
  if (chosen.length === 0) return "";
  if (chosen.length === 1 && chosen[0] === "Clear") return "Clear";
  return chosen.length === 1 ? "1 finding" : `${chosen.length} findings`;
}

/** done once a letter has findings and is not the one being assessed; every letter with findings once complete. */
export function stepStatus(state, index) {
  if (index === state.current && !state.complete) return "current";
  return state.selected[index].length > 0 ? "done" : index === state.current ? "current" : "todo";
}

export function stepTo(state, index) {
  return { ...state, current: Math.min(letters.length - 1, Math.max(0, index)), complete: false };
}

/** Back and Next. Next on the last letter completes the exam; Back from there reopens it. */
export function step(state, by) {
  if (by > 0 && state.current === letters.length - 1) return { ...state, complete: true };
  if (by < 0 && state.complete) return { ...state, complete: false };
  return stepTo(state, state.current + by);
}

export function nextLabel(state) {
  return state.current === letters.length - 1 ? "Done" : `Next: ${letters[state.current + 1].name}`;
}

export function setTriage(state, level) {
  return { ...state, triage: level };
}

/** the specimen's own keys. arrows step and 1 2 3 set triage; Space and Enter are left to the focused button, and
    nothing is taken while the nurse types in the note or holds a modifier for a shortcut. */
export function keyAction({ key, typing = false, metaKey = false, ctrlKey = false, altKey = false }) {
  if (typing || metaKey || ctrlKey || altKey) return null;
  if (key === "ArrowLeft") return { type: "step", by: -1 };
  if (key === "ArrowRight") return { type: "step", by: 1 };
  const level = { 1: "red", 2: "yellow", 3: "green" }[key];
  return level ? { type: "triage", level } : null;
}
