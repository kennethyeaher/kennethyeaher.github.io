/**
 * Initialize the mobile navigation, reveal motion, and optional custom cursor.
 */
function initializeSite(): void {
  const toggle = document.querySelector<HTMLButtonElement>("[data-nav-toggle]");
  const links = document.querySelector<HTMLElement>("[data-nav-links]");
  const menuLabel = document.querySelector<HTMLElement>("[data-menu-label]");

  /** Keep the mobile menu's visual and accessibility state in sync. */
  function setMenuOpen(open: boolean): void {
    if (!toggle || !links || !menuLabel) return;
    toggle.setAttribute("aria-expanded", String(open));
    links.classList.toggle("is-open", open);
    menuLabel.textContent = open ? "Close" : "Menu";
  }

  toggle?.addEventListener("click", () => {
    setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  links?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const chapterSelect = document.querySelector<HTMLSelectElement>("[data-chapter-select]");
  const caseSections = document.querySelectorAll<HTMLElement>("[data-case-section]");
  const sectionLinks = document.querySelectorAll<HTMLAnchorElement>("[data-section-link]");

  /** Announce the visible case-study chapter in both navigation variants. */
  function setActiveChapter(sectionId: string): void {
    sectionLinks.forEach((link) => {
      if (link.dataset.sectionLink === sectionId) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    if (chapterSelect) chapterSelect.value = sectionId;
  }

  chapterSelect?.addEventListener("change", () => {
    const target = document.getElementById(chapterSelect.value);
    target?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });

  if (caseSections.length > 0 && "IntersectionObserver" in window) {
    const chapterObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry?.target instanceof HTMLElement) {
          setActiveChapter(visibleEntry.target.id);
        }
      },
      { rootMargin: "-18% 0px -68%", threshold: 0 },
    );
    caseSections.forEach((section) => chapterObserver.observe(section));
  }

  const revealItems = document.querySelectorAll<HTMLElement>("[data-reveal]");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px" },
    );
    revealItems.forEach((item) => observer.observe(item));
  }

  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const cursor = document.querySelector<HTMLElement>(".cursor-dot");
  const cursorText = cursor?.querySelector<HTMLElement>("[data-cursor-text]");

  if (!cursor || !finePointer || reduceMotion) return;

  document.body.classList.add("cursor-enabled");
  window.addEventListener("pointermove", (event) => {
    cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    cursor.classList.add("is-visible");
  });
  window.addEventListener("pointerleave", () => {
    cursor.classList.remove("is-visible", "is-interactive", "is-labeled");
    if (cursorText) cursorText.textContent = "";
  });

  document.querySelectorAll<HTMLElement>("a, button, select").forEach((interactive) => {
    interactive.addEventListener("pointerenter", () => {
      const label = interactive.dataset.cursorLabel;
      if (label && cursorText) {
        cursorText.textContent = label;
        cursor.classList.remove("is-interactive");
        cursor.classList.add("is-labeled");
        return;
      }
      cursor.classList.add("is-interactive");
    });
    interactive.addEventListener("pointerleave", () => {
      cursor.classList.remove("is-interactive", "is-labeled");
      if (cursorText) cursorText.textContent = "";
    });
  });
}

initializeSite();
