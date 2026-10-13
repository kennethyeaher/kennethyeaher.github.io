/**
 * the dot cursor. on fine hovering mouse pointers the native cursor hides on every page and one aria-hidden dot is the
 * pointer, centred on the tip and moved there once a frame with no easing. over anything interactive it grows into
 * the theme cord's knob; an About photo also shows its alt text in a chip beside the ring (note 267:1842). touch, pen,
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

  /** write the tip and the target's state; css centres the mark on it. the chip flips left near the right edge. */
  function place(): void {
    frame = 0;
    const target = over?.closest<HTMLElement>("a, button, summary, label[for], [data-cursor]");
    const alt = target?.dataset.cursor === "photo" ? target.querySelector("img")?.alt ?? "" : "";
    if (alt !== chip!.textContent) chip!.textContent = alt;
    dot!.classList.toggle("is-ring", !!target);
    dot!.classList.toggle("is-photo", !!alt);
    dot!.classList.toggle("is-left", innerWidth - x < 200);
    dot!.style.translate = `${x}px ${y}px`;
  }

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
