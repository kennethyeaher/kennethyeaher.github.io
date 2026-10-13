/**
 * explore (figma 299:1842). the grid: the School / Personal toggle keeps its choice in ?view= with replaceState, so
 * back and refresh return to it, and the size button swaps 4 per row for 2 (2 for 1 on phones), morphing the tiles in a
 * view transition unless motion is reduced. an item page: the arrows, the left and right arrow keys and a touch swipe
 * step through its visuals and wrap around, and a polite live region says where it is.
 */
function initializeExploreGrid(): void {
  const root = document.querySelector<HTMLElement>("[data-explore]");
  const sizeButton = root?.querySelector<HTMLButtonElement>("[data-size-button]");
  if (!root || !sizeButton) return;
  const viewButtons = root.querySelectorAll<HTMLButtonElement>("[data-view-button]");
  const phone = window.matchMedia("(max-width: 760px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /** show one category, press its button and write it to the url, school being the default and left out. */
  function setView(view: string): void {
    root!.dataset.view = view;
    viewButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.viewButton === view)));
    const url = new URL(location.href);
    if (view === "personal") url.searchParams.set("view", view);
    else url.searchParams.delete("view");
    history.replaceState(history.state, "", url);
  }

  /** the label says what a press will do, which depends on the current size and the screen. */
  function labelSize(): void {
    const few = root!.dataset.size === "few";
    const label = phone.matches ? (few ? "Show 2 per row" : "Show 1 per row") : few ? "Show 4 per row" : "Show 2 per row";
    sizeButton!.setAttribute("aria-label", label);
  }

  function toggleSize(): void {
    root!.dataset.size = root!.dataset.size === "few" ? "many" : "few";
    labelSize();
  }

  viewButtons.forEach((button) => button.addEventListener("click", () => setView(button.dataset.viewButton ?? "school")));

  sizeButton.addEventListener("click", () => {
    if (reduceMotion.matches || !document.startViewTransition) return toggleSize();
    // names go on the shown tiles for this one transition only.
    const tiles = [...root.querySelectorAll<HTMLElement>(`[data-category="${root.dataset.view}"] .explore-tile`)];
    tiles.forEach((tile, index) => (tile.style.viewTransitionName = `explore-tile-${index + 1}`));
    const transition = document.startViewTransition(toggleSize);
    // finished rejects when the transition is skipped; the names are cleared either way.
    transition.finished.finally(() => tiles.forEach((tile) => (tile.style.viewTransitionName = ""))).catch(() => {});
  });

  labelSize();
  phone.addEventListener("change", labelSize);
}

function initializeExploreItem(): void {
  const viewer = document.querySelector<HTMLElement>("[data-viewer]");
  const stage = viewer?.querySelector<HTMLElement>("[data-stage]");
  if (!viewer || !stage) return;
  const slides = [...viewer.querySelectorAll<HTMLElement>("[data-slide]")];
  const dots = [...viewer.querySelectorAll<HTMLElement>("[data-dot]")];
  const status = viewer.querySelector<HTMLElement>("[data-viewer-status]");
  const count = slides.length;
  if (count < 2) return;
  let current = 0;

  /** show the visual at `index`, wrapping both ways, and announce it. */
  function show(index: number): void {
    current = ((index % count) + count) % count;
    slides.forEach((slide, i) => slide.classList.toggle("is-current", i === current));
    dots.forEach((dot, i) => dot.classList.toggle("is-current", i === current));
    if (status) status.textContent = `Visual ${current + 1} of ${count}`;
  }

  viewer.querySelectorAll<HTMLButtonElement>("[data-step]").forEach((button) => {
    button.addEventListener("click", () => show(current + Number(button.dataset.step)));
  });

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.target instanceof Element && event.target.closest("input, select, textarea, [contenteditable]")) return;
    if (event.key === "ArrowLeft") show(current - 1);
    else if (event.key === "ArrowRight") show(current + 1);
    else return;
    event.preventDefault();
  });

  // a mostly sideways touch drag of 40px or more steps; css leaves vertical panning to the page.
  let start: { x: number; y: number } | null = null;
  stage.addEventListener("pointerdown", (event) => {
    start = event.pointerType === "touch" ? { x: event.clientX, y: event.clientY } : null;
  });
  stage.addEventListener("pointerup", (event) => {
    if (!start || event.pointerType !== "touch") return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener("pointercancel", () => (start = null));
}

initializeExploreGrid();
initializeExploreItem();
