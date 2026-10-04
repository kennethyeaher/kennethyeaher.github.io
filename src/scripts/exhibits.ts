/** Keep the theme control synchronized with the saved or system preference. */
export function initializeTheme(): void {
  const button = document.querySelector<HTMLButtonElement>("[data-theme-toggle]");
  if (!button) return;
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  /** Resolve an explicit preference before consulting the operating system. */
  function isDark(): boolean {
    return document.documentElement.dataset.theme === "dark" ||
      (!document.documentElement.dataset.theme && systemTheme.matches);
  }
  /** Update the action label, pressed state, and browser chrome color. */
  function updateControl(): void {
    if (!button) return;
    const dark = isDark();
    button.setAttribute("aria-pressed", String(dark));
    button.setAttribute("aria-label", dark ? "Use light theme" : "Use dark theme");
    const label = button.querySelector("[data-theme-label]");
    if (label) label.textContent = dark ? "Light" : "Dark";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#111923" : "#f8fafb");
  }
  button.hidden = false;
  updateControl();
  button.addEventListener("click", () => {
    const theme = isDark() ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("portfolio-theme", theme); } catch {}
    updateControl();
  });
  systemTheme.addEventListener("change", updateControl);
}

/** Lazily play cover motion on card interaction or an explicit hero control. */
export function initializeCoverMotion(): void {
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll<HTMLVideoElement>("[data-cover-video]").forEach((video) => {
    const card = video.closest<HTMLAnchorElement>(".project-card");
    const button = video.closest(".case-hero")?.querySelector<HTMLButtonElement>("[data-cover-toggle]");
    let requested = false;
    let visible = true;
    let playbackVersion = 0;
    /** Reflect actual playback rather than optimistic play requests. */
    function updateButton(): void {
      if (!button) return;
      button.textContent = video.paused ? "Play cover motion" : "Pause cover motion";
      button.setAttribute("aria-pressed", String(!video.paused));
    }
    /** Pause immediately when motion, visibility, or interaction state changes. */
    function synchronizePlayback(): void {
      const version = ++playbackVersion;
      if (!requested || !visible || document.hidden || motionPreference.matches) {
        video.pause();
        updateButton();
        return;
      }
      const source = video.querySelector<HTMLSourceElement>("source[data-src]");
      if (source && !source.hasAttribute("src")) {
        source.src = source.dataset.src ?? "";
        video.load();
      }
      video.play().then(() => {
        if (version !== playbackVersion || !requested || !visible || document.hidden || motionPreference.matches) video.pause();
        updateButton();
      }).catch(updateButton);
    }
    /** Derive whether pointer or keyboard interaction still requests playback. */
    function updateCardRequest(): void {
      requested = Boolean(card?.matches(":hover") && window.matchMedia("(pointer: fine)").matches) || Boolean(card?.matches(":focus-within"));
      synchronizePlayback();
    }
    card?.addEventListener("pointerenter", updateCardRequest);
    card?.addEventListener("pointerleave", updateCardRequest);
    card?.addEventListener("focusin", updateCardRequest);
    card?.addEventListener("focusout", () => queueMicrotask(updateCardRequest));
    if (button) {
      button.hidden = motionPreference.matches;
      button.addEventListener("click", () => { requested = !requested; synchronizePlayback(); });
    }
    video.addEventListener("play", updateButton);
    video.addEventListener("pause", updateButton);
    document.addEventListener("visibilitychange", synchronizePlayback);
    motionPreference.addEventListener("change", () => {
      if (button) button.hidden = motionPreference.matches;
      requested = false;
      synchronizePlayback();
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        synchronizePlayback();
      }).observe(video);
    }
  });
}

/** Apply restrained cover tilt for fine pointers, retaining the normal cursor. */
export function initializeCoverDepth(): void {
  const pointer = window.matchMedia("(pointer: fine)");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll<HTMLElement>("[data-tilt-card]").forEach((card) => {
    /** Clear all pointer offsets when the card no longer has an active pointer. */
    function reset(): void {
      for (const name of ["--tilt-x", "--tilt-y", "--shine-x", "--shine-y"]) card.style.removeProperty(name);
    }
    card.addEventListener("pointermove", (event) => {
      if (!pointer.matches || motion.matches) return;
      const rect = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      card.style.setProperty("--tilt-x", `${(0.5 - y) * 3}deg`);
      card.style.setProperty("--tilt-y", `${(x - 0.5) * 3}deg`);
      card.style.setProperty("--shine-x", `${x * 100}%`);
      card.style.setProperty("--shine-y", `${y * 100}%`);
    });
    card.addEventListener("pointerleave", reset);
    motion.addEventListener("change", reset);
    pointer.addEventListener("change", reset);
  });
}

/** Provide reading progress where a native scroll timeline is unavailable. */
export function initializeReadingProgress(): void {
  const progress = document.querySelector<HTMLElement>("[data-reading-progress]");
  if (!progress) return;
  let queued = false;
  /** Measure the scrollable document and update its progress without animation. */
  function update(): void {
    queued = false;
    if (!progress) return;
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
    progress.style.setProperty("--reading-progress", String(fraction));
  }
  /** Batch scroll and resize measurements into the next animation frame. */
  function schedule(): void {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  if ("ResizeObserver" in window) new ResizeObserver(schedule).observe(document.body);
  update();
}

/** Initialize keyboard comparisons and lazy, explicitly controlled exhibit video. */
export function initializeMediaControls(): void {
  document.querySelectorAll<HTMLElement>("[data-compare]").forEach((comparison) => {
    const input = comparison.querySelector<HTMLInputElement>('input[type="range"]');
    const before = comparison.querySelector<HTMLElement>("[data-compare-before]");
    if (!input || !before) return;
    /** Show the requested proportion while leaving both images available without scripts. */
    function update(): void {
      if (!input || !before) return;
      comparison.style.setProperty("--compare-position", `${input.value}%`);
      input.setAttribute("aria-valuetext", `${input.value} percent before`);
    }
    comparison.classList.add("comparison-ready");
    input.hidden = false;
    input.addEventListener("input", update);
    update();
  });
  document.querySelectorAll<HTMLVideoElement>("[data-exhibit-video]").forEach((video) => {
    video.controls = true;
    /** Stop an exhibit when it leaves the viewport or the visitor requests less motion. */
    function pause(): void { video.pause(); }
    if ("IntersectionObserver" in window) new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) pause();
    }).observe(video);
    document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });
    window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", pause);
  });
}

/** run each home cover gradient only while it is on screen, so off screen cards stop animating. */
export function initializeCoverGradients(): void {
  const gradients = document.querySelectorAll<HTMLElement>("[data-cover-gradient]");
  if (!gradients.length || !("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.target.classList.toggle("is-live", entry.isIntersecting);
  });
  gradients.forEach((gradient) => observer.observe(gradient));
}

/** play each exhibit loop only while it is in view; a visitor pause sticks, and reduced motion keeps the poster. */
export function initializeExhibitLoops(): void {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll<HTMLElement>("[data-exhibit-loop]").forEach((loop) => {
    const video = loop.querySelector("video");
    const button = loop.querySelector<HTMLButtonElement>("[data-loop-toggle]");
    if (!video || !button) return;
    let visible = false;
    let pausedByVisitor = false;
    /** keep the control label in step with playback; the label alone carries the state. */
    function updateButton(): void {
      if (!button || !video) return;
      button.hidden = motion.matches;
      // only the action changes; the loop's name after it keeps each control's accessible name distinct.
      const action = button.querySelector("[data-loop-action]");
      if (action) action.textContent = video.paused ? "Play" : "Pause";
    }
    /** start or stop playback from visibility, the visitor's choice, and the motion preference. */
    function synchronize(): void {
      if (!video) return;
      if (!visible || pausedByVisitor || motion.matches || document.hidden) {
        video.pause();
        updateButton();
        return;
      }
      const source = video.querySelector<HTMLSourceElement>("source[data-src]");
      if (source && !source.hasAttribute("src")) {
        source.src = source.dataset.src ?? "";
        video.load();
      }
      video.play().catch(() => undefined).finally(updateButton);
    }
    button.addEventListener("click", () => {
      pausedByVisitor = !video.paused;
      if (!pausedByVisitor) visible = true;
      synchronize();
    });
    video.addEventListener("play", updateButton);
    video.addEventListener("pause", updateButton);
    document.addEventListener("visibilitychange", synchronize);
    motion.addEventListener("change", synchronize);
    updateButton();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? false;
        synchronize();
      }, { threshold: 0.35 }).observe(loop);
    }
  });
}

/** reveal annotations with timed transitions where scroll driven animations are unavailable. */
export function initializeAnnotationFallback(): void {
  const scrollDriven = CSS.supports("animation-timeline: view()") && CSS.supports("animation-range: entry");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (scrollDriven || reduceMotion || !("IntersectionObserver" in window)) return;
  const stages = [...document.querySelectorAll<HTMLElement>(".exhibit-stage")].filter((stage) => stage.querySelector("[data-annotation]"));
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.35 });
  stages.forEach((stage) => {
    stage.classList.add("annotations-pending");
    observer.observe(stage);
  });
}

/** count each metric up once on first view; reduced motion and no script both keep the final value. */
export function initializeMetricCounters(): void {
  const counters = document.querySelectorAll<HTMLElement>("[data-count-to]");
  if (!counters.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
  /** render one frame of a counter in the final value's format, keeping any text after the number. */
  function render(counter: HTMLElement, value: number): void {
    const decimals = Number(counter.dataset.countDecimals ?? 0);
    const number = value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals, useGrouping: "countGrouped" in counter.dataset });
    counter.textContent = `${number}${counter.dataset.countRest ?? ""}`;
  }
  /** ease the count from zero to its target over about a second. */
  function run(counter: HTMLElement): void {
    const target = Number(counter.dataset.countTo);
    const start = performance.now();
    const duration = 900;
    /** advance the count on each animation frame until it lands. */
    function step(now: number): void {
      const progress = Math.min(1, (now - start) / duration);
      const scale = 10 ** Number(counter.dataset.countDecimals ?? 0);
      render(counter, Math.round(target * (1 - (1 - progress) ** 3) * scale) / scale);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      run(entry.target as HTMLElement);
    }
  }, { threshold: 0.6 });
  counters.forEach((counter) => {
    render(counter, 0);
    observer.observe(counter);
  });
}
