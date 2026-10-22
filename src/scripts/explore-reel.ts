/**
 * explore reel (figma 630:20084). the filter: ALL / PERSONAL / SCHOOL hides the rows of the other category, keeps the
 * shown rows taking turns (cover first, then text first) and writes its choice to ?filter= with replaceState, all being
 * the default and left out. the covers: each video plays only while it is on screen and pauses off screen or when its
 * row is filtered out; under prefers-reduced-motion none plays and each shows its poster.
 */
function initializeReel(): void {
  const root = document.querySelector<HTMLElement>("[data-reel]");
  if (!root) return;
  const buttons = root.querySelectorAll<HTMLButtonElement>("[data-filter-button]");
  const rows = [...root.querySelectorAll<HTMLElement>("[data-reel-row]")];
  const videos = [...root.querySelectorAll<HTMLVideoElement>("[data-reel-video]")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onScreen = new Set<HTMLVideoElement>();

  function play(video: HTMLVideoElement): void {
    if (!video.paused) return;
    // play() rejects when the browser blocks it or a pause interrupts the load; the poster stays either way.
    video.play()?.catch(() => {});
  }

  /** play the covers that are on screen in a shown row, pause the rest; under reduced motion only posters. */
  function syncVideos(): void {
    videos.forEach((video) => {
      const shown = !video.closest<HTMLElement>("[data-reel-row]")?.hidden;
      if (!reduceMotion.matches && shown && onScreen.has(video)) play(video);
      else if (!video.paused) video.pause();
    });
  }

  /** back to the poster: a paused video holds its last frame, and load() resets it with preload none. */
  function showPosters(): void {
    videos.forEach((video) => {
      if (video.currentTime > 0 || !video.paused) {
        video.pause();
        video.load();
      }
    });
  }

  function setFilter(filter: string): void {
    root!.dataset.filter = filter;
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filterButton === filter)));
    let shown = 0;
    rows.forEach((row) => {
      row.hidden = filter !== "all" && row.dataset.category !== filter;
      if (!row.hidden) row.dataset.side = shown++ % 2 === 0 ? "start" : "swap";
    });
    const url = new URL(location.href);
    if (filter === "all") url.searchParams.delete("filter");
    else url.searchParams.set("filter", filter);
    history.replaceState(history.state, "", url);
    syncVideos();
  }

  buttons.forEach((button) => button.addEventListener("click", () => setFilter(button.dataset.filterButton ?? "all")));

  // a cover counts as on screen from the first pixel in view; a filtered out row never intersects.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target as HTMLVideoElement;
      if (entry.isIntersecting) onScreen.add(video);
      else onScreen.delete(video);
    });
    syncVideos();
  });
  videos.forEach((video) => observer.observe(video));

  reduceMotion.addEventListener("change", () => {
    if (reduceMotion.matches) showPosters();
    syncVideos();
  });
}

initializeReel();
