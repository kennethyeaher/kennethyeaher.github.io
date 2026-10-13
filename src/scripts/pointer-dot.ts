/**
 * the dot cursor. on fine hovering mouse pointers the native cursor hides on every page and one aria-hidden dot is the
 * pointer, centred on the tip and moved there once a frame with no easing. at rest it is a 14px solid dot, over
 * anything interactive it shrinks to an 8px blue dot, and over text glyphs outside a target it is a caret. a target's
 * data-cursor-label shows in a chip beside the dot (the cards' "View <name>", the cord's pull
 * set here from the theme), and an unlabelled About photo shows its alt text (note 267:1842). touch, pen,
 * forced colours, fields, a blurred window, a hidden tab and a pointer outside the window all get the native cursor
 * back. never keyboard focus.
 */
export function initializePointerDot(): void {
  const dot = document.querySelector<HTMLElement>("[data-pointer-dot]");
  const chip = dot?.querySelector<HTMLElement>(".pointer-dot-chip");
  if (!dot || !chip || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(forced-colors: active)").matches) return;
  const root = document.documentElement;
  let over: Element | null = null;
  let x = 0;
  let y = 0;
  let frame = 0;
  const cord = document.querySelector<HTMLElement>('[data-cursor="cord"]');
  const dark = window.matchMedia("(prefers-color-scheme: dark)");

  /** whether the tip is on actual glyphs: the caret's text node has non-whitespace text and one of its line boxes
   * holds the point, so the empty space beside a paragraph stays the dot. caretRangeFromPoint is Safari's. */
  function onGlyph(): boolean {
    const node = document.caretPositionFromPoint?.(x, y)?.offsetNode ?? document.caretRangeFromPoint?.(x, y)?.startContainer;
    if (!(node instanceof Text) || !node.data.trim()) return false;
    const range = document.createRange();
    range.selectNodeContents(node);
    return [...range.getClientRects()].some((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
  }

  /** write the tip and the target's state; css centres the mark on it. the chip flips left when, at its real width,
   * it would come within a 16px gutter of the right edge. */
  function place(): void {
    frame = 0;
    const target = over?.closest<HTMLElement>("a, button, summary, label[for], [data-cursor]");
    const label = target?.dataset.cursorLabel ?? (target?.dataset.cursor === "photo" ? target.querySelector("img")?.alt ?? "" : "");
    if (label !== chip!.textContent) chip!.textContent = label;
    dot!.classList.toggle("is-target", !!target);
    dot!.classList.toggle("is-text", !target && onGlyph());
    dot!.classList.toggle("is-chip", !!label);
    dot!.classList.toggle("is-left", !!label && x + 12 + chip!.offsetWidth + 16 > innerWidth);
    dot!.style.translate = `${x}px ${y}px`;
  }

  /** the cord says which way it pulls, an explicit theme first, then the system's; a resting or dragging dot updates
   * in place. */
  function labelCord(): void {
    if (!cord) return;
    cord.dataset.cursorLabel = root.dataset.theme === "dark" || (!root.dataset.theme && dark.matches) ? "Pull for light" : "Pull for dark";
    if (dot!.classList.contains("is-on")) place();
  }
  labelCord();
  new MutationObserver(labelCord).observe(root, { attributeFilter: ["data-theme"] });
  dark.addEventListener("change", labelCord);

  /** the arrow comes back first, then the dot goes. */
  function hide(): void {
    root.classList.remove("is-pointing");
    dot!.classList.remove("is-on", "is-down");
    cancelAnimationFrame(frame);
    frame = 0;
  }

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return hide();
    x = event.clientX;
    y = event.clientY;
    over = event.target instanceof Element ? event.target : null;
    // fields keep their own cursor.
    if (over?.closest("input, select, textarea, [contenteditable]")) return hide();
    if (!dot.classList.contains("is-on")) {
      // placed before it shows, so the dot never appears at a stale spot or size.
      cancelAnimationFrame(frame);
      place();
      dot.classList.add("is-on");
      root.classList.add("is-pointing");
    }
    // one write per frame, however many moves arrive.
    if (!frame) frame = requestAnimationFrame(place);
  }, { passive: true });
  document.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse") return hide();
    dot.classList.add("is-down");
  }, { passive: true });
  addEventListener("pointerup", () => dot.classList.remove("is-down"), { passive: true });
  // scrolling moves targets and text under a still pointer, so the mark is rechecked at the same spot.
  addEventListener("scroll", () => {
    if (!dot.classList.contains("is-on") || frame) return;
    frame = requestAnimationFrame(() => { over = document.elementFromPoint(x, y); place(); });
  }, { passive: true });
  addEventListener("blur", hide);
  document.addEventListener("visibilitychange", () => { if (document.hidden) hide(); });
  root.addEventListener("pointerleave", hide);

  /** the dot crosses pages: as this page goes, where the dot is, or that it is off, is saved for the next one's head
   * script, which puts it back before the first paint. */
  function save(): void {
    try {
      if (root.classList.contains("is-pointing")) sessionStorage.setItem("portfolio-pointer", JSON.stringify({ x, y, t: Date.now() }));
      else sessionStorage.removeItem("portfolio-pointer");
    } catch {}
  }
  addEventListener("pageswap", save);
  addEventListener("pagehide", save);
  // the head script restored it: pick up its spot and work out the target and chip there, then own the translate.
  if (root.classList.contains("is-pointing")) {
    x = parseFloat(root.style.getPropertyValue("--pointer-x")) || 0;
    y = parseFloat(root.style.getPropertyValue("--pointer-y")) || 0;
    root.style.removeProperty("--pointer-x");
    root.style.removeProperty("--pointer-y");
    over = document.elementFromPoint(x, y);
    if (over?.closest("input, select, textarea, [contenteditable]")) hide();
    else {
      place();
      dot.classList.add("is-on");
    }
  }
}
