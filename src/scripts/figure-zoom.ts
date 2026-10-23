/**
 * zoom on a plain wide figure (capstone 692:153). a board of sticky notes has no annotation for the pin zoom
 * (pin-zoom.ts) to frame, so its button, or a click on the image, opens the whole board at its zoom width inside the
 * figure's own box, which then scrolls to pan: touch, trackpad, arrow keys once focused, or a mouse drag. zoomed, the
 * picture's webp source points at the zoom copy the figure names; esc or the button zooms back out.
 */
export function initializeFigureZoom() {
  for (const figure of document.querySelectorAll<HTMLElement>("[data-figure-zoom]")) {
    const pan = figure.querySelector<HTMLElement>(".figure-pan")!;
    const img = pan.querySelector("img")!;
    const source = pan.querySelector("source")!;
    const rest = { srcset: source.srcset, sizes: source.sizes };
    const button = figure.querySelector<HTMLButtonElement>(".figure-zoom")!;
    let drag: { x: number; y: number } | null = null;

    /** zoom in with the point (shares of the image) staying where it was in the box, or back out */
    const set = (on: boolean, at = { x: 0.5, y: 0.5 }) => {
      figure.classList.toggle("is-zoomed", on);
      button.textContent = on ? "Zoom out" : "Zoom in";
      source.srcset = on ? figure.dataset.figureZoom! : rest.srcset;
      source.sizes = on ? "" : rest.sizes;
      if (on) {
        pan.tabIndex = 0;
        pan.scrollTo(at.x * (pan.scrollWidth - pan.clientWidth), at.y * (pan.scrollHeight - pan.clientHeight));
        pan.focus({ preventScroll: true });
      } else {
        pan.removeAttribute("tabindex");
        pan.scrollTo(0, 0);
      }
    };

    button.hidden = false;
    button.addEventListener("click", () => set(!figure.classList.contains("is-zoomed")));
    img.addEventListener("click", (event) => {
      if (figure.classList.contains("is-zoomed")) return;
      const r = img.getBoundingClientRect();
      set(true, { x: (event.clientX - r.left) / r.width, y: (event.clientY - r.top) / r.height });
    });
    figure.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && figure.classList.contains("is-zoomed")) set(false), button.focus();
    });
    // a mouse drags the board; touch and trackpads scroll it natively.
    pan.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse" || !figure.classList.contains("is-zoomed")) return;
      event.preventDefault();
      drag = { x: event.clientX, y: event.clientY };
      pan.setPointerCapture(event.pointerId);
      figure.classList.add("is-dragging");
    });
    pan.addEventListener("pointermove", (event) => {
      if (!drag) return;
      pan.scrollBy(drag.x - event.clientX, drag.y - event.clientY);
      drag = { x: event.clientX, y: event.clientY };
    });
    pan.addEventListener("pointerup", () => { drag = null; figure.classList.remove("is-dragging"); });
  }
}
