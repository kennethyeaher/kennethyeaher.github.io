// the maths behind "Seen by every eye" (figma 365:519). each way of seeing is a 3 by 3 matrix applied to linear sRGB:
// protan, deutan and tritan are Machado, Oliveira and Fernandes 2009 at full severity, greyscale is the Rec. 709
// luminance row three times. the page draws the same matrix as an svg feColorMatrix in linearRGB, so what shows on
// the queue and what is measured here are one calculation. a washout lifts the black level like a cheap monitor.

export const matrices = {
  typical: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  protan: [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998],
  deutan: [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881],
  tritan: [1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039],
  greyscale: [0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722, 0.2126, 0.7152, 0.0722],
};

export const modes = [
  { key: "typical", label: "Typical", tag: "TYPICAL", caption: "Typical colour vision · every cue intact" },
  { key: "protan", label: "Protan", tag: "PROTAN", caption: "Protanopia · red darkens and falls in with green" },
  { key: "deutan", label: "Deutan", tag: "DEUTAN", caption: "Deuteranopia · red and green fall together" },
  { key: "tritan", label: "Tritan", tag: "TRITAN", caption: "Tritanopia · yellow pales, red and green hold" },
  { key: "greyscale", label: "Greyscale", tag: "GREYSCALE", caption: "Greyscale · no hue at all, only lightness" },
];

/** the queue's triage swatches and the chip text, as the prototype draws them. */
export const swatches = { red: "#de5b5b", yellow: "#f7fd3b", green: "#0c8b44" };
export const chipText = "#003f5d";

const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const clamp = (c) => Math.min(1, Math.max(0, c));
const channels = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255);
const toHex = (rgb) => `#${rgb.map((c) => Math.round(clamp(c) * 255).toString(16).padStart(2, "0")).join("")}`;

/** a colour as one way of seeing would see it. */
export function simulate(hex, mode) {
  const m = matrices[mode];
  const [r, g, b] = channels(hex).map(toLinear);
  return toHex([0, 1, 2].map((row) => toGamma(clamp(m[row * 3] * r + m[row * 3 + 1] * g + m[row * 3 + 2] * b))));
}

/** a washed out screen: black lifts to half the amount, white stays white, in the screen's own (gamma) values. */
export function washout(hex, amount) {
  const lift = amount / 2;
  return toHex(channels(hex).map((c) => c + (1 - c) * lift));
}

/** the feComponentTransfer slope and intercept for the same washout. */
export const washoutTransfer = (amount) => ({ slope: 1 - amount / 2, intercept: amount / 2 });

/** the 4 by 5 feColorMatrix values for a way of seeing. */
export function filterValues(mode) {
  const m = matrices[mode];
  return [...m.slice(0, 3), 0, 0, ...m.slice(3, 6), 0, 0, ...m.slice(6, 9), 0, 0, 0, 0, 0, 1, 0].join(" ");
}

const luminance = (hex) => {
  const [r, g, b] = channels(hex).map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** the wcag contrast ratio between two colours. */
export function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** the chip's navy word against its white paper, as seen and as washed out. */
export function chipContrast(mode, amount) {
  return contrast(washout(simulate(chipText, mode), amount), washout(simulate("#ffffff", mode), amount));
}

export const formatRatio = (ratio) => `${ratio.toFixed(1)}:1`;

/** a colour's a* and b* in CIELAB (D65), its hue and colourfulness without its lightness. */
function chroma(hex) {
  const [r, g, b] = channels(hex).map(toLinear);
  const xyz = [
    (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047,
    0.2126 * r + 0.7152 * g + 0.0722 * b,
    (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883,
  ].map((t) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116));
  return [500 * (xyz[0] - xyz[1]), 200 * (xyz[1] - xyz[2])];
}

/** how far apart the three levels sit in hue alone: the smallest a*b* distance between any two of them. */
export function hueSeparation(mode) {
  const seen = Object.values(swatches).map((hex) => chroma(simulate(hex, mode)));
  let least = Infinity;
  for (let i = 0; i < seen.length; i += 1) {
    for (let j = i + 1; j < seen.length; j += 1) least = Math.min(least, Math.hypot(seen[i][0] - seen[j][0], seen[i][1] - seen[j][1]));
  }
  return least;
}

/** under this many a*b* units two levels read as one hue. */
const HUE_FLOOR = 25;

/** what still separates the three levels, for the panel. shape and word are drawn, so they hold under every eye. */
export function verdict(mode, amount) {
  const hue = hueSeparation(mode) >= HUE_FLOOR;
  const ratio = chipContrast(mode, amount);
  return [
    { key: "hue", title: "Hue", pass: hue, value: null, body: hue ? "Red, yellow and green still differ" : mode === "greyscale" ? "Only lightness is left" : "Red and green read as the same olive" },
    { key: "shape", title: "Shape", pass: true, value: null, body: "Square, rounded, circle" },
    { key: "word", title: "Word", pass: true, value: null, body: "Red, Yellow, Green on every chip" },
    { key: "contrast", title: "Contrast", pass: ratio >= 4.5, value: formatRatio(ratio), body: "Chip text against white, measured live" },
  ];
}

export const describe = (mode) => modes.find((entry) => entry.key === mode).caption;
