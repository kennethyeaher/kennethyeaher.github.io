// oklch helpers for build time colour work: the reading progress fill lifts each case study accent until it
// clears 3:1 on the dark track. conversions follow björn ottosson's oklab reference.

/** @param {number} v */
const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
/** @param {number} v */
const toGamma = (v) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

/** #rrggbb to srgb channels from 0 to 1. @param {string} hex @returns {number[]} */
function hexToRgb(hex) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

/** srgb channels to #rrggbb, clamped. @param {number[]} rgb */
function rgbToHex(rgb) {
  return `#${rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("")}`;
}

/** #rrggbb to [lightness, chroma, hue in radians]. @param {string} hex @returns {number[]} */
export function hexToOklch(hex) {
  const [r, g, b] = hexToRgb(hex).map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, Math.hypot(a, bb), Math.atan2(bb, a)];
}

/** [lightness, chroma, hue in radians] to srgb channels, unclamped so the caller can test the gamut. @param {number[]} lch */
function oklchToRgb([lightness, chroma, hue]) {
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(toGamma);
}

/** @param {number[]} rgb */
const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);

/** wcag contrast ratio between two #rrggbb colours. @param {string} a @param {string} b */
export function contrast(a, b) {
  /** @param {string} hex */
  const luminance = (hex) => {
    const [r, g, bl] = hexToRgb(hex).map(toLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

/**
 * raise a colour's oklch lightness, keeping hue and chroma, until it reaches the target contrast on a background.
 * where the lifted colour leaves srgb, chroma drops only as far as the gamut needs.
 * @param {string} hex @param {string} background @param {number} [target]
 */
export function liftToContrast(hex, background, target = 3) {
  const [start, chroma, hue] = hexToOklch(hex);
  for (let lightness = start; lightness <= 1; lightness += 0.002) {
    let fit = chroma;
    if (!inGamut(oklchToRgb([lightness, fit, hue]))) {
      let low = 0;
      let high = chroma;
      for (let i = 0; i < 30; i++) {
        const mid = (low + high) / 2;
        if (inGamut(oklchToRgb([lightness, mid, hue]))) low = mid;
        else high = mid;
      }
      fit = low;
    }
    const lifted = rgbToHex(oklchToRgb([lightness, fit, hue]));
    if (contrast(lifted, background) >= target) return lifted;
  }
  return "#ffffff";
}
