// the state behind the TerpCare mood specimen (figma 367:521): five levels, each a word, a bar count and its own
// colour; the tags for what is affecting it; and the week strip, where choosing a level saves it into the selected
// day and a missed day stays blank. the mock's week runs Monday October 12 to Sunday October 18, Tuesday open.

export const levels = [
  { key: "great", label: "Great", bars: 5 },
  { key: "good", label: "Good", bars: 4 },
  { key: "okay", label: "Okay", bars: 3 },
  { key: "low", label: "Low", bars: 2 },
  { key: "struggling", label: "Struggling", bars: 1 },
];

export const tags = ["Sleep", "Classes", "Friends", "Health"];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const FIRST_DATE = 12;

export function createMood() {
  return {
    day: 1,
    week: ["good", "okay", "low", "okay", "great", null, "good"],
    tags: [[], ["Sleep", "Classes"], [], [], [], [], []],
  };
}

export const dayName = (index) => days[index];
export const dayInitial = (index) => days[index][0];
export const dateLabel = (index) => `${days[index]}, October ${FIRST_DATE + index}`;
export const levelOf = (key) => levels.find((level) => level.key === key) ?? null;
export const levelFor = (state) => levelOf(state.week[state.day]);

/** a day's name in the strip: the day and its level, or that nothing was saved. */
export function dayLabel(state, index) {
  const level = levelOf(state.week[index]);
  return `${days[index]}, ${level ? level.label : "nothing saved"}`;
}

const replaceAt = (list, index, value) => list.map((item, at) => (at === index ? value : item));

/** choosing a level is the save: it drops into the selected day. */
export const chooseLevel = (state, key) => ({ ...state, week: replaceAt(state.week, state.day, key) });

export const chooseDay = (state, index) => ({ ...state, day: index });

export function toggleTag(state, tag) {
  const now = state.tags[state.day];
  const next = now.includes(tag) ? now.filter((item) => item !== tag) : [...now, tag].sort((a, b) => tags.indexOf(a) - tags.indexOf(b));
  return { ...state, tags: replaceAt(state.tags, state.day, next) };
}
