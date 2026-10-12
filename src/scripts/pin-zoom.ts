/**
 * zoom on the active pin, figma 168:1745: a click, tap, enter or space on a badge of a data-pin-zoom stage, or a click
 * on its note card, zooms the stage's layer to that annotation at 1.5x to 4x, with a bar carrying "NN · title" and ‹ › ✕.
 * escape, ✕, a click outside or leaving the viewport zoom out; focus returns to the opener. never on hover.
 */
interface Entry { target: HTMLElement; trigger: HTMLElement; note: HTMLElement | null; text: string }
interface Stage { stage: HTMLElement; layer: HTMLElement; entries: Entry[] }

/** the view (scale s, stage pixel x y at its top left) for an outline, or null under 1.5x: the outline plus 24px (16px
 * under 500 wide) plus 48 on-screen px for the bar, at the stage's ratio, centred, inside the stage; cap is the phone cap. */
export function frame(stage: { w: number; h: number }, box: { x: number; y: number; w: number; h: number }, cap = Infinity) {
  const pad = stage.w < 500 ? 16 : 24;
  const s = Math.min(stage.w / (box.w + 2 * pad), (stage.h - 48) / (box.h + 2 * pad), 4, cap);
  if (s < 1.5) return null;
  const w = stage.w / s;
  const h = stage.h / s;
  const clamp = (v: number, max: number) => Math.min(Math.max(v, 0), max);
  return { s, x: clamp(box.x + box.w / 2 - w / 2, stage.w - w), y: clamp(box.y + box.h / 2 + 24 / s - h / 2, stage.h - h) };
}

export function initializePinZoom() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let active: { st: Stage; entry: Entry; opener: HTMLElement; sizes: Map<Element, string>; bar: HTMLElement; stop: () => void } | null = null;

  /** wire a stage's annotations, in number order; span badges and leader labels become real buttons */
  function build(stage: HTMLElement) {
    const st: Stage = { stage, layer: stage.querySelector<HTMLElement>("[data-zoom-layer]")!, entries: [] };
    for (const el of stage.querySelectorAll<HTMLElement>("[data-annotation]")) {
      const focus = el.classList.contains("annotation-focus");
      let trigger = el.querySelector<HTMLElement>(focus ? ".annotation-badge" : ".leader-label")!;
      const { annotation: num = "", zoomTitle: title } = el.dataset;
      const text = title ? `${num} · ${title}` : num;
      if (trigger.tagName === "SPAN") {
        trigger.outerHTML = trigger.outerHTML.replace("<span", '<button type="button"').replace(/<\/span>$/, "</button>").replace(' aria-hidden="true"', "");
        trigger = el.querySelector<HTMLElement>("button")!;
        trigger.setAttribute("aria-label", `Annotation ${text}`);
      }
      const note = document.getElementById(trigger.getAttribute("href")?.slice(1) ?? "");
      const entry: Entry = { target: focus ? el : el.querySelector<HTMLElement>(".leader-anchor")!, trigger, note, text };
      st.entries.push(entry);
      const go = (event: Event) => { event.preventDefault(); event.stopPropagation(); open(st, entry, trigger); };
      trigger.addEventListener("click", go);
      trigger.addEventListener("keydown", (event) => { if (event.key === " ") go(event); });
      note?.addEventListener("click", go);
    }
  }

  /** mark the active note card and outline, or clear them */
  function mark(st: Stage, entry: Entry | null) {
    for (const e of st.entries) {
      e.note?.toggleAttribute("data-active", e === entry);
      e.target.classList.toggle("is-zoom-active", e === entry);
    }
  }

  /** move the layer over ms; under reduced motion the views crossfade through a 120ms view transition instead */
  function move(st: Stage, s: number, x: number, y: number, ms: number) {
    const swap = () => { st.layer.style.cssText = `--zoom-scale: ${s}; --zoom-ms: ${ms}ms; translate: ${-x * s}px ${-y * s}px; scale: ${s}`; };
    reduce && document.startViewTransition ? document.startViewTransition(swap) : swap();
  }

  /** zoom a stage to one annotation, from rest or from the current view */
  function open(st: Stage, entry: Entry, opener: HTMLElement) {
    if (active && active.st !== st) exit();
    const sr = st.stage.getBoundingClientRect();
    const lr = st.layer.getBoundingClientRect();
    const k = lr.width / sr.width;
    const rect = (el: Element) => { const r = el.getBoundingClientRect(); return { x: (r.left - lr.left) / k, y: (r.top - lr.top) / k, w: r.width / k, h: r.height / k }; };
    const cap = Math.min(...[...st.stage.querySelectorAll<HTMLImageElement>(".frame-iphone img")].map((img) => +img.getAttribute("width")! / rect(img).w));
    const view = frame({ w: sr.width, h: sr.height }, rect(entry.target), cap);
    if (!view && !active) return mark(st, entry);
    const { s, x, y } = view ?? { s: 1, x: 0, y: 0 };
    if (!active) {
      const bar = document.querySelector<HTMLTemplateElement>("[data-zoom-bar]")!.content.firstElementChild!.cloneNode(true) as HTMLElement;
      const [prev, next, close] = bar.querySelectorAll("button");
      prev.addEventListener("click", () => step(-1));
      next.addEventListener("click", () => step(1));
      close.addEventListener("click", () => exit(true));
      st.stage.append(bar);
      st.stage.classList.add("is-zoomed");
      // exits: the stage leaving the viewport, or the opener's screen going aria-hidden (the walkthrough moving on)
      const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) exit(); });
      io.observe(st.stage);
      const mo = new MutationObserver(() => { if (opener.closest("[aria-hidden='true']")) exit(); });
      mo.observe(st.stage, { subtree: true, attributeFilter: ["aria-hidden"] });
      active = { st, entry, opener, sizes: new Map(), bar, stop: () => { io.disconnect(); mo.disconnect(); } };
      if (document.activeElement === opener) close.focus();
    }
    active.entry = entry;
    mark(st, entry);
    move(st, s, x, y, 360);
    const index = st.entries.indexOf(entry);
    const [title, prev, next] = active.bar.querySelectorAll<HTMLElement>("span, button");
    title.textContent = entry.text;
    prev.setAttribute("aria-disabled", String(!index));
    next.setAttribute("aria-disabled", String(index === st.entries.length - 1));
    for (const img of st.stage.querySelectorAll("img")) {
      const r = rect(img);
      if (r.x > x + sr.width / s || r.x + r.w < x || r.y > y + sr.height / s || r.y + r.h < y) continue;
      const source = img.closest("picture")?.querySelector("source[sizes]") ?? img;
      if (!active.sizes.has(source)) active.sizes.set(source, source.getAttribute("sizes") ?? "");
      source.setAttribute("sizes", `${Math.round(r.w * s)}px`);
    }
  }

  /** the previous or next annotation, one move away. */
  function step(by: number) {
    const entry = active?.st.entries[active.st.entries.indexOf(active.entry) + by];
    if (entry) open(active!.st, entry, active!.opener);
  }

  /** zoom back out, restore sizes, drop the bar; focus returns to the opener once the badges are back */
  function exit(back = false) {
    if (!active) return;
    const { st, opener, sizes, bar, stop } = active;
    const had = document.activeElement;
    active = null;
    stop();
    mark(st, null);
    move(st, 1, 0, 0, 240);
    for (const [el, value] of sizes) el.setAttribute("sizes", value);
    bar.remove();
    setTimeout(() => {
      if (active?.st !== st) st.stage.classList.remove("is-zoomed");
      if (!active && (back || had === document.body || bar.contains(had))) opener.focus({ preventScroll: true });
    }, reduce ? 0 : 240);
  }

  // a phones-only stage (the alert badges) is left alone from 761px, where stages stop stacking, decided at load.
  document.querySelectorAll<HTMLElement>(matchMedia("(min-width: 761px)").matches ? "[data-pin-zoom]:not([data-pin-zoom-phone])" : "[data-pin-zoom]").forEach(build);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") exit(true); });
  document.addEventListener("click", (event) => { if (active && !active.st.stage.contains(event.target as Node)) exit(); });
}
