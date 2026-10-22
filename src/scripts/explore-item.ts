/**
 * an explore item page, v5 (figma 638:17643, 639:17658). the screen arrows, the dots, the left and right arrow keys
 * and a sideways touch swipe step through the three screens and wrap around. a macbook item shows the current screen
 * in its lid; an iphones item brings the current screen's phone to the front (a press on a side phone does too) and
 * moves the others to the sides. a polite live region says where it is. the scroll lift is css only, and reduced
 * motion is handled there too: the swaps lose their easing and the page opens in the lifted layout.
 */
function initializeExploreItem(): void {
  const viewer = document.querySelector<HTMLElement>("[data-item-viewer]");
  const stage = viewer?.querySelector<HTMLElement>("[data-item-stage]");
  if (!viewer || !stage) return;
  const screens = [...viewer.querySelectorAll<HTMLElement>("[data-screen]")];
  const phones = [...viewer.querySelectorAll<HTMLElement>("[data-phone]")];
  const slides = screens.length ? screens : phones;
  const dots = [...viewer.querySelectorAll<HTMLButtonElement>("[data-dot]")];
  const status = viewer.querySelector<HTMLElement>("[data-item-status]");
  const count = slides.length;
  if (count < 2) return;
  let current = Number(viewer.dataset.start) || 0;

  /** show the screen at `index`, wrapping both ways, and announce it. */
  function show(index: number): void {
    current = ((index % count) + count) % count;
    screens.forEach((screen, i) => screen.classList.toggle("is-current", i === current));
    // the phone after the current one goes right, the one before it left.
    phones.forEach((phone, i) => (phone.dataset.pos = ["front", "right", "left"][(i - current + count) % count]));
    dots.forEach((dot, i) => dot.setAttribute("aria-pressed", String(i === current)));
    const alt = slides[current].querySelector("img")?.alt;
    if (status) status.textContent = `Screen ${current + 1} of ${count}${alt ? `, ${alt}` : ""}`;
  }

  viewer.querySelectorAll<HTMLButtonElement>("[data-step]").forEach((button) => {
    button.addEventListener("click", () => show(current + Number(button.dataset.step)));
  });
  dots.forEach((dot, i) => dot.addEventListener("click", () => show(i)));
  phones.forEach((phone, i) => phone.addEventListener("click", () => phone.dataset.pos !== "front" && show(i)));

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

initializeExploreItem();
