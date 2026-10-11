/**
 * annotated cursor per figma 161:1721. over the four data-cursor targets (project cards, loop pills, pins and the
 * pull cord) the native arrow hides and one aria-hidden note is the pointer: a 10px annotate dot centred on the tip,
 * a 14px leader and a chip saying what a click does, moved to the tip once a frame with no easing. everywhere else,
 * a target with an empty label included, the native pointer stays. fine hovering mouse pointers only, never keyboard
 * focus, never under forced colours.
 */
export function initializePointerNote(): void {
  const note = document.querySelector<HTMLElement>("[data-pointer-note]");
  const chip = note?.querySelector<HTMLElement>(".pointer-note-chip");
  if (!note || !chip || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (window.matchMedia("(forced-colors: active)").matches) return;
  const root = document.documentElement;
  const dark = window.matchMedia("(prefers-color-scheme: dark)");
  let target: HTMLElement | null = null;
  let x = 0;
  let y = 0;
  let frame = 0;

  /** The chip repeats what the target already says: its link action, loop state, pin note or theme action. */
  function label(element: HTMLElement): string {
    const kind = element.dataset.cursor;
    if (kind === "card") return "View case study";
    if (kind === "cord") return root.dataset.theme === "dark" || (!root.dataset.theme && dark.matches) ? "Pull for light" : "Pull for dark";
    if (kind === "loop") {
      const toggle = element.querySelector<HTMLElement>("[data-loop-toggle]");
      return toggle && !toggle.hidden ? `${toggle.querySelector("[data-loop-action]")?.textContent} loop` : "";
    }
    const number = [...element.childNodes].filter((node) => !(node instanceof Element && node.classList.contains("sr-only"))).map((node) => node.textContent).join("").trim();
    const title = document.getElementById(element.getAttribute("aria-describedby") ?? "")?.querySelector(".note-title")?.textContent;
    return title ? `${number} · ${title}` : "";
  }

  /** put the dot's centre on the stored point; css offsets the note so the tip is the dot. flipped left near the right edge. */
  function place(): void {
    frame = 0;
    note!.classList.toggle("is-left", innerWidth - x < 160);
    note!.style.translate = `${x}px ${y}px`;
  }

  /** the arrow comes back first, then the note fades. */
  function hide(): void {
    target = null;
    root.classList.remove("is-pointing");
    note!.classList.remove("is-on");
    cancelAnimationFrame(frame);
    frame = 0;
  }

  /** show the note for a target, or refresh its label in place when the target's state changes. */
  function show(element: HTMLElement): void {
    const text = label(element);
    if (!text) return hide();
    chip!.textContent = text;
    if (!note!.classList.contains("is-on")) {
      // placed before it shows, so the dot never appears at a stale spot.
      cancelAnimationFrame(frame);
      place();
      note!.classList.add("is-on");
      root.classList.add("is-pointing");
    }
    target = element;
  }

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return hide();
    x = event.clientX;
    y = event.clientY;
    const over = event.target instanceof Element ? event.target : null;
    const element = over?.closest<HTMLElement>("[data-cursor]");
    const selecting = !(getSelection()?.isCollapsed ?? true);
    if (!element || selecting || over?.closest("input, select, textarea, [contenteditable]")) return hide();
    show(element);
    // one write per frame, however many moves arrive.
    if (target && !frame) frame = requestAnimationFrame(place);
  }, { passive: true });
  // scrolling moves targets under a still pointer, the walkthrough's pinned phone among them; the next move decides.
  addEventListener("scroll", hide, { passive: true });
  addEventListener("blur", hide);
  document.addEventListener("visibilitychange", () => { if (document.hidden) hide(); });
  document.documentElement.addEventListener("pointerleave", hide);
  // the loop and cord labels follow playback and the theme while the pointer rests on them.
  const refresh = () => { if (target) show(target); };
  document.addEventListener("play", refresh, true);
  document.addEventListener("pause", refresh, true);
  new MutationObserver(refresh).observe(root, { attributeFilter: ["data-theme"] });
}
