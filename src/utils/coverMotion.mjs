// turns a motion cover from src/data/coverMotion.mjs into markup styles and keyframes. every figma px becomes a share of
// the 454px cover (cqi), so the cover scales with its card. step 1 is the inline style of each layer; the keyframes,
// which only ship under prefers-reduced-motion: no-preference, move the layers through steps 2 to 4 and back.
import { motionTimeline } from "../data/coverMotion.mjs";

/** a figma px length as a share of the 454px cover. */
export function cq(px) {
  return `${Number((px / 4.54).toFixed(3))}cqi`;
}

/** replace each {n} figma px token in a css string with its cqi length. */
function scale(css) {
  return css.replace(/\{(-?[\d.]+)\}/g, (_, px) => cq(Number(px)));
}

/** a layer's state in each of the four steps: its box, then each step's overrides; one state when it never moves. */
export function layerStates(layer) {
  const [x, y, w, h] = layer.box;
  const base = { x, y, w, h, r: 0, o: 1 };
  return (layer.steps ?? [{}]).map((step) => ({ ...base, ...step }));
}

/** the inline style of a layer in step 1: its place and size, its turn, opacity and fill, then its own css. */
export function layerStyle(layer) {
  const [state] = layerStates(layer);
  const parts = [`left: ${cq(state.x)}`, `top: ${cq(state.y)}`];
  if (state.w !== undefined) parts.push(`width: ${cq(state.w)}`);
  if (state.h !== undefined) parts.push(`height: ${cq(state.h)}`);
  if (state.r) parts.push(`rotate: ${state.r}deg`);
  if (state.o !== 1) parts.push(`opacity: ${state.o}`);
  if (state.bg) parts.push(`background-color: ${state.bg}`);
  if (layer.style) parts.push(scale(layer.style));
  return parts.join("; ");
}

/** the declarations of one step: only the properties that change across the steps, relative to step 1 for position. */
function stepDeclarations(states, index) {
  const [first] = states;
  const state = states[index];
  const changes = (key) => states.some((other) => other[key] !== first[key]);
  const parts = [];
  if (changes("x") || changes("y")) parts.push(`translate: ${cq(state.x - first.x)} ${cq(state.y - first.y)}`);
  if (changes("r")) parts.push(`rotate: ${state.r}deg`);
  if (changes("o")) parts.push(`opacity: ${state.o}`);
  if (changes("w")) parts.push(`width: ${cq(state.w)}`);
  if (changes("h")) parts.push(`height: ${cq(state.h)}`);
  if (changes("bg")) parts.push(`background-color: ${state.bg}`);
  return parts.join("; ");
}

/** a keyframes body for four states on a cover's timeline: each step holds, the last eases back to step 1 at 100%. */
function keyframesBody(stops, declare) {
  return stops.map(([start, end], index) => `${index === 0 ? `${start}%, ${end}%, 100%` : `${start}%, ${end}%`} { ${declare(index)}; }`).join(" ");
}

/** every layer of a cover in document order, children included. */
function flatten(layers) {
  return layers.flatMap((layer) => [layer, ...flatten(layer.children ?? [])]);
}

/**
 * the class each moving layer animates under, and the cover's keyframes css. layers that move alike (the ovara
 * tiles of one tier) share one class and one keyframes, so the css stays small.
 */
export function coverMotionCss(slug, motion) {
  const { duration, stops } = motionTimeline(motion);
  const classes = new Map();
  const bodies = new Map();
  const rules = [];
  for (const layer of flatten(motion.layers)) {
    if (!layer.steps) continue;
    if (layer.steps.length !== stops.length) throw new Error(`${slug} ${layer.id} needs one state per step`);
    const states = layerStates(layer);
    const body = keyframesBody(stops, (index) => stepDeclarations(states, index));
    const name = bodies.get(body) ?? `cm-${slug}-${layer.id}`;
    if (!bodies.has(body)) {
      if ([...bodies.values()].includes(name)) throw new Error(`${slug} has two moving layers named ${layer.id}`);
      bodies.set(body, name);
      rules.push(`@keyframes ${name} { ${body} }`, `.${name} { animation-name: ${name}; animation-duration: ${duration}s; }`);
    }
    classes.set(layer, name);
  }
  // the field's ellipses follow the steps too, by transform, on top of their slow drift (ProjectCover.astro).
  motion.field[0].forEach(([x0, y0], index) => {
    const name = `cm-${slug}-field-${index + 1}`;
    const body = keyframesBody(stops, (step) => {
      const [x, y] = motion.field[step][index];
      return `transform: translate(${cq(x - x0)}, ${cq(y - y0)})`;
    });
    rules.push(`@keyframes ${name} { ${body} }`);
    rules.push(`.project-cover[data-motion="${slug}"] .cover-field:nth-child(${index + 1}) { animation-name: cover-field-drift, ${name}; animation-duration: var(--drift-s), ${duration}s; animation-direction: alternate, normal; }`);
  });
  return { classes, css: `@media (prefers-reduced-motion: no-preference) { ${rules.join(" ")} }` };
}
