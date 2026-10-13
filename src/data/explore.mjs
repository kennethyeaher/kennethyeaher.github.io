// the explore grid (figma 299:1842): school and personal work as square tiles, after yeezy.com's male / female grid.
// placeholders for now; real items swap a gradient visual for { src, alt } and set their own info line.

/** dark, mid and light stops, drawn left to right at 0, 55% and 100% like the home covers. */
export const explorePalettes = [
  ["#101826", "#2c5a7a", "#9cc3d8"],
  ["#141823", "#5a2a4e", "#c99ab8"],
  ["#0e1a1c", "#1f5e5a", "#9fd0c0"],
  ["#17141f", "#3e3a7a", "#a9a6e0"],
  ["#1a1612", "#7a4a22", "#e0b07a"],
  ["#0f1a14", "#3d6a2e", "#c4d68a"],
  ["#1a1420", "#8a3a5a", "#f0a0a8"],
  ["#121822", "#4a5a6e", "#c8d2dc"],
  ["#1c1410", "#9a3a1e", "#f2a65a"],
  ["#0e1626", "#25507e", "#e8c27a"],
  ["#141a1e", "#2e6e7a", "#e6d6a8"],
  ["#18121e", "#5e3a8a", "#e0b8d8"],
];

export const exploreCategories = [
  { id: "school", label: "School" },
  { id: "personal", label: "Personal" },
];

/** three gradient visuals from palette `start` and the two after it, wrapping round the twelve. */
const placeholderVisuals = (start) => [0, 1, 2].map((k) => ({ gradient: explorePalettes[(start + k) % explorePalettes.length] }));

/** a placeholder item; `start` is its first palette. */
const placeholder = (category, number, code, start) => ({
  id: `${category}-${String(number).padStart(2, "0")}`,
  code,
  category,
  visuals: placeholderVisuals(start),
});

/**
 * @typedef {{ gradient: string[] } | { src: string, alt: string }} ExploreVisual
 * @typedef {{ id: string, code: string, category: "school" | "personal", visuals: ExploreVisual[], info?: string }} ExploreEntry
 */

/** @type {ExploreEntry[]} school takes the palettes in order, personal starts at the sixth. */
const entries = [
  ...Array.from({ length: 12 }, (_, i) => placeholder("school", i + 1, "XX-26", i)),
  ...Array.from({ length: 8 }, (_, i) => placeholder("personal", i + 1, "XX-25", 5 + i)),
];

/** every item, with the info line defaulting to "Coming soon". */
export const exploreItems = entries.map((item) => ({ ...item, info: item.info ?? "Coming soon" }));

/** the css background for a gradient visual. */
export function visualBackground(visual) {
  const [dark, mid, light] = visual.gradient;
  return `linear-gradient(90deg, ${dark} 0%, ${mid} 55%, ${light} 100%)`;
}
