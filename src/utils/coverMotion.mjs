// turns a motion layer (src/data/coverMotion.mjs, src/data/loopMotion.mjs) into its inline style. every figma px
// becomes a share of its frame's width (cqi): the 454px cover, or a loop's own frame, so the layers scale with the
// card. the timelines live in src/styles/cover-motion/<slug>.css.

/** a figma px length as a share of the frame, 454px (a home cover) unless given. */
export function cq(px, frame = 454) {
  return `${Number(((px * 100) / frame).toFixed(3))}cqi`;
}

/** replace each {n} figma px token in a css string with its cqi length. */
function scale(css, frame) {
  return css.replace(/\{(-?[\d.]+)\}/g, (_, px) => cq(Number(px), frame));
}

/** the inline style of a layer: its place and size from figma's box, then its own css. */
export function layerStyle(layer, frame = 454) {
  const [x, y, w, h] = layer.box;
  const parts = [`left: ${cq(x, frame)}`, `top: ${cq(y, frame)}`];
  if (w !== undefined) parts.push(`width: ${cq(w, frame)}`);
  if (h !== undefined) parts.push(`height: ${cq(h, frame)}`);
  if (layer.style) parts.push(scale(layer.style, frame));
  return parts.join("; ");
}
