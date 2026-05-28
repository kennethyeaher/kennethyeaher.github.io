// Reveal on scroll. Watches every element with the reveal class and adds
// is visible the first time it enters the viewport. Staggered delays are
// handled with inline transition delay set by the markup.
//
// This is the lightweight alternative to a motion library. It ships a few
// lines of JavaScript instead of a full animation package.
//
// Resilience matters here. Content must never be stuck hidden if the observer
// is slow or JavaScript is blocked, so there are two safety nets. Items already
// on screen at load are revealed immediately, and a short timer reveals any
// stragglers as a final fallback.

/** Reveal a single element by adding the is visible class. */
function show(element: Element): void {
  element.classList.add("is-visible");
}

/** Start observing all reveal elements and unhide them as they scroll in. */
function setupScrollReveal(): void {
  const items = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

  // If the browser has no observer support, just show everything now.
  if (!("IntersectionObserver" in window)) {
    items.forEach(show);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    // A small negative bottom margin reveals items just before they fully enter.
    { rootMargin: "0px 0px -10% 0px" }
  );

  items.forEach((item) => observer.observe(item));

  // Final safety net. After a short delay, reveal anything still hidden so
  // content is never stranded off screen on tall pages or slow loads.
  window.setTimeout(() => {
    items.forEach((item) => {
      if (!item.classList.contains("is-visible")) show(item);
    });
  }, 1200);
}

setupScrollReveal();