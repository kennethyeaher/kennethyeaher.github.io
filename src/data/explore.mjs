// the explore reel and item pages (figma u0NLnpVNMZCh46ZF2372FG, page 23:2): personal and school work, newest first.
// copy comes verbatim from .private/explore-v5/explore-v5.json; only the alts are written here.

/**
 * @typedef {{ src: string, alt: string }} ExploreImage
 * @typedef {{ title: string, body: string }} ExploreStep
 * @typedef {{ label: string, url: string }} ExploreLink
 * @typedef {{ video: string, poster: string, duration: number }} ExploreCover
 * @typedef {{ file: string, rest: string, scrolled: string, cover: string }} ExploreFigma
 * @typedef {{
 *   id: string, code: string, title: string, category: "personal" | "school", meta: string, tags: string, line: string,
 *   about: string, steps: ExploreStep[], device: "macbook" | "iphones", screens: ExploreImage[], thumbs: ExploreImage[],
 *   links: ExploreLink[], cover: ExploreCover, figma: ExploreFigma,
 * }} ExploreItem
 */

/** the reel filter: all, then the two categories. */
export const exploreCategories = [
  { id: "all", label: "ALL" },
  { id: "personal", label: "PERSONAL" },
  { id: "school", label: "SCHOOL" },
];

/** @type {ExploreItem[]} macbook items step through their three screens; iphones items show screens 1 to 3 left to right. personal items have no links. */
export const exploreItems = [
  {
    id: "pf",
    code: "PF-26",
    title: "This portfolio",
    category: "personal",
    meta: "Personal / Astro and Figma / 2026",
    tags: "Personal · Astro · Figma",
    line: "My portfolio, built in Astro from Figma designs, with its covers and exhibits rebuilt in code.",
    about: "I rebuilt this site around my case studies. Each one is designed in Figma first, then built in Astro, with the covers and exhibits translated from Figma's own motion data and a test suite guarding every deploy.",
    steps: [
      { title: "The home grid", body: "Eight case studies with animated covers, designed in Figma first and rebuilt in code." },
      { title: "The case studies", body: "One exhibit system across the case studies: device stages, scroll walkthroughs and clickable specimens." },
      { title: "The About page", body: "Photo chapters that unlock as you scroll, beside a short experience list." },
    ],
    device: "macbook",
    screens: [
      { src: "/images/explore/pf/pf-1.png", alt: "This portfolio home grid" },
      { src: "/images/explore/pf/pf-2.png", alt: "A case study page on this portfolio" },
      { src: "/images/explore/pf/pf-3.png", alt: "This portfolio About page" },
    ],
    thumbs: [
      { src: "/images/explore/pf/pf-1.png", alt: "This portfolio home grid" },
      { src: "/images/explore/pf/pf-2.png", alt: "A case study page on this portfolio" },
      { src: "/images/explore/pf/pf-3.png", alt: "This portfolio About page" },
    ],
    links: [],
    cover: { video: "/images/explore/pf/pf-cover.mp4", poster: "/images/explore/pf/pf-poster.jpg", duration: 16 },
    figma: { file: "u0NLnpVNMZCh46ZF2372FG", rest: "638:17643", scrolled: "638:17682", cover: "670:17674" },
  },
  {
    id: "ol",
    code: "OL-26",
    title: "Ollo",
    category: "personal",
    meta: "Personal / macOS media app / 2026",
    tags: "Personal · SwiftUI · macOS",
    line: "A Mac app for watching and organizing the media on my SSD without touching the originals.",
    about: "Ollo is my personal Mac app for the movies, videos and photos on my external SSD. It keeps its own catalog, opens files read-only, and never changes the originals.",
    steps: [
      { title: "Home", body: "Continue watching comes first. Ollo keeps its own catalog and never moves or changes the originals." },
      { title: "The player", body: "A full-window player for MP4 files, with keyboard hints in one corner and nothing else on the frame." },
      { title: "Collections", body: "Pick several films, add them to a collection, and take it back with one Undo." },
    ],
    device: "macbook",
    screens: [
      { src: "/images/explore/ol/ol-1.png", alt: "Ollo home screen" },
      { src: "/images/explore/ol/ol-2.png", alt: "Ollo player" },
      { src: "/images/explore/ol/ol-3.png", alt: "Ollo collections" },
    ],
    thumbs: [
      { src: "/images/explore/ol/ol-1.png", alt: "Ollo home screen" },
      { src: "/images/explore/ol/ol-2.png", alt: "Ollo player" },
      { src: "/images/explore/ol/ol-3.png", alt: "Ollo collections" },
    ],
    links: [],
    cover: { video: "/images/explore/ol/ol-cover.mp4", poster: "/images/explore/ol/ol-poster.jpg", duration: 16 },
    figma: { file: "u0NLnpVNMZCh46ZF2372FG", rest: "638:17742", scrolled: "638:17781", cover: "675:17674" },
  },
  {
    id: "sr",
    code: "SR-26",
    title: "Siro",
    category: "personal",
    meta: "Personal / Safari extension and Mac app / 2026",
    tags: "Personal · Safari extension · macOS",
    line: "A Safari extension and Mac app that saves media to my own folders and explains every failure.",
    about: "Siro saves media from Safari into my own folders. The extension says what a page can really save and in what format, and the Mac app verifies every file before moving it into place.",
    steps: [
      { title: "Save from Safari", body: "The popup shows what the page can really save, then quality, tag and Save, all from the keyboard." },
      { title: "The library", body: "Every save in one place, searchable by title, source or original link." },
      { title: "The queue", body: "One download at a time. When one fails, it says why and what to do next." },
    ],
    device: "macbook",
    screens: [
      { src: "/images/explore/sr/sr-1.png", alt: "Siro save popup in Safari" },
      { src: "/images/explore/sr/sr-2.png", alt: "Siro library" },
      { src: "/images/explore/sr/sr-3.png", alt: "Siro download queue" },
    ],
    thumbs: [
      { src: "/images/explore/sr/sr-1.png", alt: "Siro save popup in Safari" },
      { src: "/images/explore/sr/sr-2.png", alt: "Siro library" },
      { src: "/images/explore/sr/sr-3.png", alt: "Siro download queue" },
    ],
    links: [],
    cover: { video: "/images/explore/sr/sr-cover.mp4", poster: "/images/explore/sr/sr-poster.jpg", duration: 12 },
    figma: { file: "u0NLnpVNMZCh46ZF2372FG", rest: "638:17841", scrolled: "638:17880", cover: "651:17674" },
  },
  {
    id: "ng",
    code: "NG-26",
    title: "nageo",
    category: "personal",
    meta: "Personal / macOS terminal / 2026",
    tags: "Personal · Swift · macOS",
    line: "A native terminal that keeps my shell in the center and puts Git and coding agents beside it.",
    about: "nageo is a native terminal for developers. It runs my real zsh and builds around it: clean copy, a Git inspector, and Claude Code and Codex sessions side by side. Five of seven milestones are done.",
    steps: [
      { title: "Clean copy", body: "Each command is a block, so you can copy only its error lines. Git sits beside it and never commits on its own." },
      { title: "Agent sessions", body: "The next milestone: a session panel that reads usage, context and tasks from Claude Code's own hooks." },
      { title: "Parallel agents", body: "Two agents on separate worktrees, compared side by side before anything merges." },
    ],
    device: "macbook",
    screens: [
      { src: "/images/explore/ng/ng-1.png", alt: "nageo clean copy beside the Git inspector" },
      { src: "/images/explore/ng/ng-2.png", alt: "nageo agent session panel" },
      { src: "/images/explore/ng/ng-3.png", alt: "nageo parallel agents side by side" },
    ],
    thumbs: [
      { src: "/images/explore/ng/ng-1.png", alt: "nageo clean copy beside the Git inspector" },
      { src: "/images/explore/ng/ng-2.png", alt: "nageo agent session panel" },
      { src: "/images/explore/ng/ng-3.png", alt: "nageo parallel agents side by side" },
    ],
    links: [],
    cover: { video: "/images/explore/ng/ng-cover.mp4", poster: "/images/explore/ng/ng-poster.jpg", duration: 12 },
    figma: { file: "u0NLnpVNMZCh46ZF2372FG", rest: "638:17940", scrolled: "638:17979", cover: "652:17674" },
  },
  {
    id: "cm",
    code: "CM-26",
    title: "Campus map and threads",
    category: "school",
    meta: "School / INST631 / 2026 / UX research",
    tags: "School · INST631 · UX research · Group",
    line: "A group sketch of a campus app: the map by date, interest threads and events.",
    about: "An INST631 group project. I was on the UX research team. We sketched a campus app that puts parking, buildings and events on one map, with interest threads for each student.",
    steps: [
      { title: "The whiteboard", body: "On the UX research team, we mapped what students hunt for on campus: parking, buildings and events, by day." },
      { title: "Paper screens", body: "Sketches for the map, a filter sheet, event cards and a short onboarding." },
      { title: "Mid-fi prototype", body: "In Figma: onboarding that picks your threads, a feed of events and discussions, and the map by date." },
    ],
    device: "iphones",
    screens: [
      { src: "/images/explore/cm/cm-onb.png", alt: "Campus app onboarding screen" },
      { src: "/images/explore/cm/cm-feed.png", alt: "Campus app feed of events and discussions" },
      { src: "/images/explore/cm/cm-map.png", alt: "Campus app map by date" },
    ],
    thumbs: [
      { src: "/images/explore/cm/cm-whiteboard.jpg", alt: "UX research whiteboard for the campus app" },
      { src: "/images/explore/cm/cm-paper.jpg", alt: "Paper screen sketches for the campus app" },
      { src: "/images/explore/cm/cm-feed.png", alt: "Campus app feed of events and discussions" },
    ],
    links: [
      { label: "Figma prototype", url: "https://www.figma.com/proto/mi3gsGsvT80p77wocAlF7g/L5?node-id=3-2&p=f&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=3%3A2" },
    ],
    cover: { video: "/images/explore/cm/cm-cover.mp4", poster: "/images/explore/cm/cm-poster.jpg", duration: 12 },
    figma: { file: "u0NLnpVNMZCh46ZF2372FG", rest: "639:17658", scrolled: "639:17709", cover: "653:17674" },
  },
  {
    id: "ll",
    code: "LL-26",
    title: "Restaurant library lab",
    category: "school",
    meta: "School / INST630 / 2026",
    tags: "School · INST630 · JavaScript",
    line: "One set of filters drives a chart, a map and cards, with a shortlist that survives them.",
    about: "Homework 7 for INST630. Eight sample restaurants, three libraries and one shared set of filters, with a text fallback for each library if it fails to load.",
    steps: [
      { title: "One set of filters", body: "Search and filters define one matching set. A shortlist keeps up to three picks as results change." },
      { title: "The chart", body: "Chart.js draws ratings from the same set, with exact values in a table underneath." },
      { title: "The map", body: "Leaflet adds illustrative markers. If a library fails, a text list still carries every restaurant." },
    ],
    device: "macbook",
    screens: [
      { src: "/images/explore/ll/ll-1.png", alt: "Restaurant library lab filters and shortlist" },
      { src: "/images/explore/ll/ll-2.png", alt: "Restaurant library lab ratings chart" },
      { src: "/images/explore/ll/ll-3.png", alt: "Restaurant library lab map" },
    ],
    thumbs: [
      { src: "/images/explore/ll/ll-1.png", alt: "Restaurant library lab filters and shortlist" },
      { src: "/images/explore/ll/ll-2.png", alt: "Restaurant library lab ratings chart" },
      { src: "/images/explore/ll/ll-3.png", alt: "Restaurant library lab map" },
    ],
    links: [
      { label: "Live demo", url: "https://kennethyeaher.github.io/externalLibraries/tutorial_7_external/" },
      { label: "GitHub", url: "https://github.com/kennethyeaher/externalLibraries" },
    ],
    cover: { video: "/images/explore/ll/ll-cover.mp4", poster: "/images/explore/ll/ll-poster.jpg", duration: 12 },
    figma: { file: "u0NLnpVNMZCh46ZF2372FG", rest: "639:17781", scrolled: "639:17820", cover: "656:17674" },
  },
  {
    id: "rs",
    code: "RS-26",
    title: "RSVP",
    category: "school",
    meta: "School / INST630 / 2026",
    tags: "School · INST630 · JavaScript",
    line: "A small form with real recovery: guests on demand, clear errors and one Undo.",
    about: "Homework 4 for INST630. A practice invitation that treats mistakes and interruptions as part of the design. Nothing is sent to an organizer.",
    steps: [
      { title: "Going", body: "Choosing Going reveals the guest field, and the summary fills in as you type." },
      { title: "A mistake", body: "An invalid guest count says which range is allowed, right under the field." },
      { title: "Reset and Undo", body: "Reset clears the response and offers one Undo until the next edit." },
    ],
    device: "macbook",
    screens: [
      { src: "/images/explore/rs/rs-1.png", alt: "RSVP form with Going chosen" },
      { src: "/images/explore/rs/rs-2.png", alt: "RSVP form with an invalid guest count" },
      { src: "/images/explore/rs/rs-3.png", alt: "RSVP form after Reset, offering Undo" },
    ],
    thumbs: [
      { src: "/images/explore/rs/rs-1.png", alt: "RSVP form with Going chosen" },
      { src: "/images/explore/rs/rs-2.png", alt: "RSVP form with an invalid guest count" },
      { src: "/images/explore/rs/rs-3.png", alt: "RSVP form after Reset, offering Undo" },
    ],
    links: [
      { label: "Live demo", url: "https://kennethyeaher.github.io/addingJava/tutorial_4_files/" },
      { label: "GitHub", url: "https://github.com/kennethyeaher/addingJava" },
    ],
    cover: { video: "/images/explore/rs/rs-cover.mp4", poster: "/images/explore/rs/rs-poster.jpg", duration: 12 },
    figma: { file: "u0NLnpVNMZCh46ZF2372FG", rest: "639:17880", scrolled: "639:17919", cover: "657:17674" },
  },
  {
    id: "rc",
    code: "RC-26",
    title: "Recipe redesign",
    category: "school",
    meta: "School / INST630 / 2026",
    tags: "School · INST630 · HTML and CSS",
    line: "A loud recipe card turned into a calm page you can cook from on a phone.",
    about: "Homework 3 for INST630. The supplied recipe card was loud and hard to follow, so I rebuilt it around the order you actually cook in.",
    steps: [
      { title: "Plan", body: "Title, timing and yield first, so you can decide to bake before reading a step." },
      { title: "Gather", body: "Native checkboxes cross off ingredients as you go, with no script needed." },
      { title: "Cook", body: "Numbered steps, with the times and temperatures that matter in bold." },
    ],
    device: "iphones",
    screens: [
      { src: "/images/explore/rc/rc-1.png", alt: "Recipe redesign plan section" },
      { src: "/images/explore/rc/rc-2.png", alt: "Recipe redesign ingredient checklist" },
      { src: "/images/explore/rc/rc-3.png", alt: "Recipe redesign numbered steps" },
    ],
    thumbs: [
      { src: "/images/explore/rc/rc-1.png", alt: "Recipe redesign plan section" },
      { src: "/images/explore/rc/rc-2.png", alt: "Recipe redesign ingredient checklist" },
      { src: "/images/explore/rc/rc-3.png", alt: "Recipe redesign numbered steps" },
    ],
    links: [
      { label: "Live demo", url: "https://kennethyeaher.github.io/uglyPageCute/" },
      { label: "GitHub", url: "https://github.com/kennethyeaher/uglyPageCute" },
    ],
    cover: { video: "/images/explore/rc/rc-cover.mp4", poster: "/images/explore/rc/rc-poster.jpg", duration: 12 },
    figma: { file: "u0NLnpVNMZCh46ZF2372FG", rest: "639:17979", scrolled: "639:18030", cover: "658:17674" },
  },
];
