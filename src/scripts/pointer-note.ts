/**
 * Annotated cursor per figma 129:1693. The native pointer stays; over the four data-cursor targets (project cards,
 * loop pills, pins and the pull cord) one aria-hidden note trails it: an annotate dot, a 14px leader and a chip
 * saying what a click does. Fine hovering pointers only, never keyboard focus.
 */
export function initializePointerNote(): void {
  const note = document.querySelector<HTMLElement>("[data-pointer-note]");
  const chip = note?.querySelector<HTMLElement>(".pointer-note-chip");
  if (!note || !chip || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  const root = document.documentElement;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const dark = window.matchMedia("(prefers-color-scheme: dark)");
  let target: HTMLElement | null = null;
  let x = 0;
  let y = 0;
  let at = [0, 0];
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

  /** Place the note 12px right and 16px under the tip, flipped left or up within 160px of an edge. */
  function goal(): number[] {
    const left = innerWidth - x < 160;
    const up = innerHeight - y < 160;
    note!.classList.toggle("is-left", left);
    return [left ? x - 12 - note!.offsetWidth : x + 12, up ? y - 16 - note!.offsetHeight : y + 16];
  }

  /** Ease toward the goal by 0.22 a frame, only while the note shows; reduced motion snaps. */
  function follow(): void {
    const [gx, gy] = goal();
    const ease = motion.matches ? 1 : 0.22;
    at = [at[0] + (gx - at[0]) * ease, at[1] + (gy - at[1]) * ease];
    note!.style.translate = `${at[0]}px ${at[1]}px`;
    frame = Math.abs(gx - at[0]) + Math.abs(gy - at[1]) > 0.5 ? requestAnimationFrame(follow) : 0;
  }

  function hide(): void {
    target = null;
    note!.classList.remove("is-on");
    cancelAnimationFrame(frame);
    frame = 0;
  }

  /** Show the note for a target, or refresh its label in place when the target's state changes. */
  function show(element: HTMLElement): void {
    const text = label(element);
    if (!text) return hide();
    chip!.textContent = text;
    if (target !== element && !note!.classList.contains("is-on")) {
      at = goal();
      note!.style.translate = `${at[0]}px ${at[1]}px`;
      note!.classList.add("is-on");
    }
    target = element;
    if (!frame) frame = requestAnimationFrame(follow);
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
  }, { passive: true });
  // scrolling moves targets under a still pointer, the walkthrough's pinned phone among them; the next move decides.
  addEventListener("scroll", hide, { passive: true });
  document.documentElement.addEventListener("pointerleave", hide);
  // the loop and cord labels follow playback and the theme while the pointer rests on them.
  const refresh = () => { if (target) show(target); };
  document.addEventListener("play", refresh, true);
  document.addEventListener("pause", refresh, true);
  new MutationObserver(refresh).observe(root, { attributeFilter: ["data-theme"] });
}
