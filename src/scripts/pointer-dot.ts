/**
 * the dot cursor. on fine hovering mouse pointers the native cursor hides on every page and one aria-hidden dot is the
 * pointer, centred on the tip and moved there once a frame with no easing. at rest it is a 14px solid dot, and over
 * anything interactive it opens into a ring of the same size. a target's data-cursor-label shows in a chip beside the ring (the cards' "View <name>", the cord's pull
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

  /** write the tip and the target's state; css centres the mark on it. the chip flips left when, at its real width,
   * it would come within a 16px gutter of the right edge. */
  function place(): void {
    frame = 0;
    const target = over?.closest<HTMLElement>("a, button, summary, label[for], [data-cursor]");
    const label = target?.dataset.cursorLabel ?? (target?.dataset.cursor === "photo" ? target.querySelector("img")?.alt ?? "" : "");
    if (label !== chip!.textContent) chip!.textContent = label;
    dot!.classList.toggle("is-ring", !!target);
    dot!.classList.toggle("is-chip", !!label);
    dot!.classList.toggle("is-left", !!label && x + 15 + chip!.offsetWidth + 16 > innerWidth);
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
  // scrolling moves targets under a still pointer, so the ring is rechecked at the same spot.
  addEventListener("scroll", () => {
    if (!dot.classList.contains("is-on") || frame) return;
    frame = requestAnimationFrame(() => { over = document.elementFromPoint(x, y); place(); });
  }, { passive: true });
  addEventListener("blur", hide);
  document.addEventListener("visibilitychange", () => { if (document.hidden) hide(); });
  root.addEventListener("pointerleave", hide);
}
