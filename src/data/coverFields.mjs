/**
 * home card colour fields, read from each card's colour field frame in figma (home 428:2664, work grid 428:2684).
 * a field is the cover frame's dark fill under blurred ellipses. x, y and r are an ellipse's centre and radius on the
 * 454 by 256 cover; colour and alpha are its fill and fill opacity; blur is figma's layer blur radius, which the svg
 * export writes as a gaussian stdDeviation of half that. the capstone, ovara and kairo fields sit inside their motion
 * cover instances.
 *
 * @typedef {{ x: number, y: number, r: number, colour: string, alpha: number }} FieldEllipse
 * @typedef {{ figma: string, base: string, blur: number, ellipses: FieldEllipse[] }} CoverField
 */

/** @type {Record<string, CoverField>} */
export const coverFields = {
  "elms-redesign": {
    figma: "451:8401",
    base: "#120b0c",
    blur: 72,
    ellipses: [
      { x: 70, y: 50, r: 140, colour: "#8c1a11", alpha: 0.95 },
      { x: 390, y: 70, r: 130, colour: "#e21833", alpha: 0.8 },
      { x: 410, y: 250, r: 110, colour: "#ffd200", alpha: 0.55 },
      { x: 90, y: 250, r: 130, colour: "#5a0e14", alpha: 0.9 },
      { x: 230, y: 150, r: 90, colour: "#c8102e", alpha: 0.5 },
    ],
  },
  "college-park-capstone": {
    figma: "I454:3047;454:451",
    base: "#15110d",
    blur: 72,
    ellipses: [
      { x: 60, y: 50, r: 140, colour: "#c8643b", alpha: 0.7 },
      { x: 109, y: 251, r: 135, colour: "#3a2418", alpha: 0.95 },
      { x: 425, y: 265, r: 115, colour: "#e2a84b", alpha: 0.45 },
      { x: 390, y: 48, r: 120, colour: "#b4566a", alpha: 0.5 },
      { x: 235, y: 145, r: 85, colour: "#6e9478", alpha: 0.3 },
    ],
  },
  terpcarehub: {
    figma: "451:8407",
    base: "#140c10",
    blur: 72,
    ellipses: [
      { x: 65, y: 55, r: 135, colour: "#b3122e", alpha: 0.9 },
      { x: 410, y: 230, r: 120, colour: "#e8a317", alpha: 0.8 },
      { x: 370, y: 40, r: 120, colour: "#6a1b3a", alpha: 0.85 },
      { x: 85, y: 255, r: 115, colour: "#d9532b", alpha: 0.7 },
      { x: 230, y: 260, r: 80, colour: "#f2c14e", alpha: 0.45 },
    ],
  },
  frontground: {
    figma: "451:8413",
    base: "#071311",
    blur: 72,
    ellipses: [
      { x: 70, y: 60, r: 140, colour: "#0f6b4f", alpha: 0.95 },
      { x: 405, y: 55, r: 125, colour: "#1e8c7a", alpha: 0.8 },
      { x: 380, y: 250, r: 120, colour: "#2d4f7c", alpha: 0.8 },
      { x: 90, y: 260, r: 130, colour: "#0b3b2e", alpha: 0.9 },
      { x: 225, y: 145, r: 85, colour: "#6fae9b", alpha: 0.4 },
    ],
  },
  sohive: {
    figma: "445:7303",
    base: "#0f1014",
    blur: 70,
    ellipses: [
      { x: 70, y: 50, r: 130, colour: "#d23a2e", alpha: 0.9 },
      { x: 80, y: 240, r: 120, colour: "#1e9e4a", alpha: 0.85 },
      { x: 380, y: 60, r: 130, colour: "#2f5be0", alpha: 0.9 },
      { x: 405, y: 245, r: 115, colour: "#e8862a", alpha: 0.85 },
      { x: 250, y: 140, r: 100, colour: "#7b3fd1", alpha: 0.6 },
      { x: 200, y: 250, r: 80, colour: "#e0b23a", alpha: 0.5 },
    ],
  },
  terpcare: {
    figma: "451:8419",
    base: "#150a0b",
    blur: 72,
    ellipses: [
      { x: 75, y: 45, r: 135, colour: "#c8102e", alpha: 0.9 },
      { x: 415, y: 225, r: 125, colour: "#f2a33a", alpha: 0.8 },
      { x: 370, y: 30, r: 120, colour: "#7a1f2b", alpha: 0.85 },
      { x: 75, y: 245, r: 115, colour: "#e46a3b", alpha: 0.7 },
      { x: 235, y: 245, r: 75, colour: "#ffd27a", alpha: 0.45 },
    ],
  },
  ovara: {
    figma: "I447:11135;452:5410",
    base: "#1a1326",
    blur: 72,
    ellipses: [
      { x: 70, y: 50, r: 140, colour: "#6846aa", alpha: 0.75 },
      { x: 434, y: 226, r: 120, colour: "#c45b32", alpha: 0.6 },
      { x: 90, y: 280, r: 130, colour: "#2f1a3e", alpha: 0.85 },
      { x: 380, y: 28, r: 100, colour: "#b59dd6", alpha: 0.4 },
      { x: 225, y: 255, r: 85, colour: "#4a3698", alpha: 0.3 },
    ],
  },
  "kairo-health": {
    figma: "I447:11757;452:5434",
    base: "#081127",
    blur: 72,
    ellipses: [
      { x: 65, y: 55, r: 145, colour: "#2f6bff", alpha: 0.7 },
      { x: 119, y: 251, r: 135, colour: "#12306b", alpha: 0.9 },
      { x: 425, y: 255, r: 115, colour: "#2bb3c0", alpha: 0.45 },
      { x: 380, y: 48, r: 120, colour: "#6a4cff", alpha: 0.5 },
      { x: 230, y: 140, r: 80, colour: "#4c8dff", alpha: 0.3 },
    ],
  },
};
