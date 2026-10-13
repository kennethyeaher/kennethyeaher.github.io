/**
 * About photo chapters, per figma note 267:1842. chapter 01 ships unlocked; the rest lock once this runs and unlock,
 * once each, when their top crosses 75% of the viewport. the chapter in view keeps the accent counter. css does the
 * motion; this only sets data attributes. under reduced motion, or without an observer, nothing locks.
 */
export function initializeAboutChapters(): void {
  const chapters = [...document.querySelectorAll<HTMLElement>("[data-chapter]")];
  if (chapters.length === 0) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    chapters.forEach((chapter) => chapter.setAttribute("data-unlocked", ""));
    return;
  }

  /** move the accent counter to one chapter. */
  function setCurrent(current: Element): void {
    chapters.forEach((chapter) => chapter.toggleAttribute("data-current", chapter === current));
  }

  const unlock = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // a chapter already scrolled past, after a reload part way down, opens too.
        if (!entry.isIntersecting && entry.boundingClientRect.top > 0) return;
        entry.target.setAttribute("data-unlocked", "");
        if (entry.isIntersecting) setCurrent(entry.target);
        unlock.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -25% 0px", threshold: 0 },
  );

  // the chapter crossing the middle band is the one in view, scrolling either way.
  const inView = new IntersectionObserver(
    (entries) => {
      const visible = entries.find((entry) => entry.isIntersecting);
      if (visible) setCurrent(visible.target);
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
  );

  document.documentElement.classList.add("chapters-ready");
  chapters.forEach((chapter) => {
    if (!chapter.hasAttribute("data-unlocked")) unlock.observe(chapter);
    inView.observe(chapter);
  });
}
