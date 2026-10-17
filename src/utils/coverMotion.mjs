// turns a motion cover layer from src/data/coverMotion.mjs into its inline style. every figma px becomes a share of the
// 454px cover (cqi), so the cover scales with its card. the timeline lives in src/styles/cover-motion/<slug>.css.

/** a figma px length as a share of the 454px cover. */
export function cq(px) {
  return `${Number((px / 4.54).toFixed(3))}cqi`;
}

/** replace each {n} figma px token in a css string with its cqi length. */
function scale(css) {
  return css.replace(/\{(-?[\d.]+)\}/g, (_, px) => cq(Number(px)));
}

/** the inline style of a layer: its place and size from figma's box, then its own css. */
export function layerStyle(layer) {
  const [x, y, w, h] = layer.box;
  const parts = [`left: ${cq(x)}`, `top: ${cq(y)}`];
  if (w !== undefined) parts.push(`width: ${cq(w)}`);
  if (h !== undefined) parts.push(`height: ${cq(h)}`);
  if (layer.style) parts.push(scale(layer.style));
  return parts.join("; ");
}
