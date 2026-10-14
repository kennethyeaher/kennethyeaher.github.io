import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test, { before } from "node:test";
import assert from "node:assert/strict";

import { projects } from "../src/data/portfolio.mjs";

// the live specimens from figma 312:417 ("Additions / Specimens (proposal)", page redesign 2): one per chapter, plus
// frontground's greyscale toggle after its findings specimen.
const projectRoot = new URL("..", import.meta.url).pathname;
const specimenDir = join(projectRoot, "src", "components", "exhibits", "specimens");
const specimens = [
  {
    slug: "terpcare", chapter: "mood-check-in", kind: "terpcare-mood", component: "SpecimenTerpcareMood",
    eyebrow: "SPECIMEN · TERPCARE", heading: "Check in, in light or dark", tag: "LIVE · TAP TO TRY", fonts: ["inter"],
    notes: [
      ["Tap a level", "Five levels, one tap. The selected card fills with its own colour."],
      ["Light and dark", "The same tokens resolve both themes. The switch flips the specimen."],
      ["Motion", "A gentle spring, about 400ms. Under reduced motion it changes at once."],
    ],
  },
  {
    slug: "terpcarehub", chapter: "booking", kind: "terpcarehub-book", component: "SpecimenTerpcarehubBook",
    eyebrow: "SPECIMEN · TERPCAREHUB", heading: "Book from the card", tag: "LIVE · TAP TO TRY", fonts: ["figtree"],
    notes: [
      ["Book", "One tap books the next open time, straight from the card."],
      ["Booked", "The button keeps the time, so there is nothing to reopen."],
      ["Undo", "Tap again to undo. The check draws in 300ms after it lands."],
    ],
  },
  {
    slug: "sohive", chapter: "rsvp-outcomes", kind: "sohive-rsvp", component: "SpecimenSohiveRsvp",
    eyebrow: "SPECIMEN · SOHIVE", heading: "Tap to RSVP", tag: "LIVE · TAP TO TRY", fonts: ["inter"],
    notes: [
      ["Going", "The card turns to Going in place. Nothing opens."],
      ["Undo", "Tap again and a toast offers Undo, in the toast's own words."],
      ["Motion", "A gentle spring, about 400ms. Under reduced motion it changes at once."],
    ],
  },
  {
    slug: "frontground", chapter: "triage", kind: "frontground-findings", component: "SpecimenFrontgroundFindings",
    eyebrow: "SPECIMEN · FRONTGROUND", heading: "Select findings by tap", tag: "LIVE · CLICK TO SELECT", fonts: ["figtree"],
    notes: [
      ["ABCDE", "Airway, breathing, circulation, disability, exposure, in the order a nurse assesses."],
      ["Timing", "150ms, no spring. Nothing moves where a value is being read."],
      ["Keyboard", "Tab between findings, Space to select."],
    ],
  },
  {
    slug: "frontground", chapter: "triage", kind: "frontground-greyscale", component: "SpecimenFrontgroundGreyscale",
    eyebrow: "TRIAGE · FRONTGROUND", heading: "Still readable without colour", tag: null, fonts: [],
    notes: [
      ["Red · square", "Seen immediately."],
      ["Yellow · rounded", "Seen soon."],
      ["Green · circle", "Can wait."],
    ],
  },
];
const fontFiles = { inter: "/fonts/inter/inter-latin.woff2", figtree: "/fonts/figtree/figtree-latin.woff2" };
const pages = new Map();

before(() => {
  execFileSync("npm", ["run", "build"], { cwd: projectRoot, encoding: "utf8", stdio: "pipe" });
  for (const project of projects) pages.set(project.slug, readFileSync(join(projectRoot, "dist", "work", project.slug, "index.html"), "utf8"));
});

/** the html of one chapter section, from its opening tag to the next chapter's. */
function chapterHtml(slug, id) {
  const html = pages.get(slug);
  const start = html.indexOf(`<section id="${id}"`);
  assert.ok(start >= 0, `${slug} has no ${id} chapter`);
  const next = html.indexOf("data-case-section", html.indexOf(">", start));
  return html.slice(start, next < 0 ? undefined : next);
}

/** the html of one specimen, from its figure to the figure's close. */
function specimenHtml(spec) {
  const chapter = chapterHtml(spec.slug, spec.chapter);
  const start = chapter.indexOf(`data-specimen="${spec.kind}"`);
  assert.ok(start >= 0, `${spec.slug} ${spec.chapter} has no ${spec.kind} specimen`);
  const open = chapter.lastIndexOf("<figure", start);
  return chapter.slice(open, chapter.indexOf("</figure>", start) + "</figure>".length);
}

/** every button tag in some html, with its text content (tags stripped). */
function buttons(html) {
  return [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(([, attrs, inner]) => ({
    attrs,
    text: inner.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim(),
    hidden: /\baria-hidden="true"/.test(inner),
  }));
}

/** the text of a tag with its markup stripped, for checking visible copy. */
const text = (html) => html.replace(/<[^>]+>/g, " ").replace(/&#39;|&#x27;/g, "'").replace(/\s+/g, " ").trim();

test("each chapter renders its specimen after its own exhibit, with the mock's head, tag and notes", () => {
  for (const spec of specimens) {
    const project = projects.find((entry) => entry.slug === spec.slug);
    const exhibit = project.exhibits.find((entry) => entry.id === spec.chapter);
    assert.ok(exhibit.specimens.some((entry) => entry.kind === spec.kind), `${spec.kind} is in the ${spec.chapter} data`);

    const html = specimenHtml(spec);
    // a heading one level under the chapter's h2, named by the figure.
    const id = html.match(/<figure[^>]*\bid="([^"]+)"/)[1];
    assert.match(html, new RegExp(`<figure[^>]*aria-labelledby="${id}-heading"`));
    assert.match(html, new RegExp(`<h3 id="${id}-heading"[^>]*>${spec.heading}</h3>`));
    assert.match(html, new RegExp(`class="section-eyebrow"[^>]*>${spec.eyebrow}<`));
    if (spec.tag) assert.match(html, new RegExp(`class="specimen-tag"[^>]*>${spec.tag}<`), spec.kind);
    else assert.doesNotMatch(html, /class="specimen-tag"/, spec.kind);

    const notes = [...html.matchAll(/<span class="note-title"[^>]*>([^<]+)<\/span>\s*<p class="note-body"[^>]*>([^<]+)<\/p>/g)].map(([, title, body]) => [title, body.replace(/&#39;/g, "'")]);
    assert.deepEqual(notes, spec.notes, spec.kind);
  }
  // the greyscale exhibit follows the findings specimen in the same chapter.
  const triage = chapterHtml("frontground", "triage");
  assert.ok(triage.indexOf('data-specimen="frontground-findings"') < triage.indexOf('data-specimen="frontground-greyscale"'));
  // no other chapter or page carries a specimen.
  const total = [...pages.values()].reduce((sum, html) => sum + (html.match(/<figure[^>]*\bdata-specimen="/g) ?? []).length, 0);
  assert.equal(total, specimens.length);
});

test("every specimen control is a real button with an accessible name and a pressed or checked state", () => {
  for (const spec of specimens) {
    const html = specimenHtml(spec);
    const all = buttons(html);
    assert.ok(all.length > 0, spec.kind);
    for (const button of all) {
      assert.match(button.attrs, /\btype="button"/, `${spec.kind}: ${button.text}`);
      const label = button.attrs.match(/\baria-label="([^"]+)"/)?.[1];
      assert.ok(label || button.text, `${spec.kind}: a button has no name`);
      // a visible word is part of the name (wcag 2.5.3).
      if (label && button.text) assert.ok(label.toLowerCase().includes(button.text.replace(/^↻\s*/, "").toLowerCase()), `${spec.kind}: "${label}" leaves out "${button.text}"`);
    }
    // nothing interactive hides behind a div or span.
    assert.doesNotMatch(html, /<(div|span)[^>]*\b(role="button"|onclick|tabindex="0")/, spec.kind);
  }

  const mood = specimenHtml(specimens[0]);
  const group = mood.match(/<div[^>]*role="radiogroup"[^>]*>/)[0];
  assert.match(group, /aria-label="Mood"/);
  const radios = buttons(mood).filter((button) => /role="radio"/.test(button.attrs));
  assert.deepEqual(radios.map((radio) => radio.text.replace(/ Selected$/, "")), ["Great", "Good", "Okay"]);
  // the mock's state: good is checked and is the group's one tab stop.
  assert.deepEqual(radios.map((radio) => radio.attrs.match(/aria-checked="(\w+)"/)[1]), ["false", "true", "false"]);
  assert.deepEqual(radios.map((radio) => radio.attrs.match(/tabindex="(-?\d)"/)[1]), ["-1", "0", "-1"]);
  const theme = buttons(mood).filter((button) => /aria-pressed/.test(button.attrs));
  assert.deepEqual(theme.map((button) => [button.text, button.attrs.match(/aria-pressed="(\w+)"/)[1]]), [["Light", "true"], ["Dark", "false"]]);
  assert.match(mood, /role="group" aria-label="Specimen theme"/);

  const book = buttons(specimenHtml(specimens[1]));
  assert.deepEqual(book.map((button) => [button.text, button.attrs.match(/aria-pressed="(\w+)"/)?.[1] ?? null]), [["↻ Replay", null], ["Book appointment", "false"]]);
  assert.match(book[0].attrs, /aria-label="Replay booking"/);

  const rsvp = specimenHtml(specimens[2]);
  const rsvpButtons = buttons(rsvp);
  assert.deepEqual(rsvpButtons.map((button) => [button.text, button.attrs.match(/aria-pressed="(\w+)"/)?.[1] ?? null]), [["Attending", "false"], ["Undo", null]]);
  // the toast is a status message, hidden until the second tap.
  assert.match(rsvp, /<div class="rsvp-toast"[^>]*role="status"[^>]*>/);
  assert.match(rsvp, /<div class="rsvp-toast-inner"[^>]*hidden[^>]*>/);
  assert.match(text(rsvp), /You're no longer going\./);

  const findings = specimenHtml(specimens[3]);
  assert.match(findings, /role="group" aria-label="Findings"/);
  assert.deepEqual(buttons(findings).map((button) => [button.text, button.attrs.match(/aria-pressed="(\w+)"/)[1]]),
    [["Airway", "true"], ["Breathing", "true"], ["Circulation", "false"], ["Disability", "false"], ["Exposure", "false"]]);

  const grey = specimenHtml(specimens[4]);
  assert.match(grey, /role="group" aria-label="Queue colour"/);
  assert.deepEqual(buttons(grey).map((button) => [button.text, button.attrs.match(/aria-pressed="(\w+)"/)[1]]), [["Colour", "true"], ["Greyscale", "false"]]);
});

test("specimen controls show a visible focus ring", () => {
  const shell = readFileSync(join(projectRoot, "src", "components", "exhibits", "ExhibitSpecimen.astro"), "utf8");
  assert.match(shell, /\.specimen :global\(button:focus-visible\) \{ outline: 2px solid [^;]+; outline-offset: 2px; \}/);
  for (const spec of specimens) {
    // no specimen turns the outline off.
    assert.doesNotMatch(readFileSync(join(specimenDir, `${spec.component}.astro`), "utf8"), /outline: (none|0)/, spec.kind);
  }
});

/** the css of an astro component's style blocks. */
function styleOf(source) {
  return [...source.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(([, css]) => css).join("\n");
}

/** css with every prefers-reduced-motion: no-preference block cut out. */
function outsideMotionBlocks(css) {
  let rest = css;
  for (;;) {
    const start = rest.indexOf("@media (prefers-reduced-motion: no-preference)");
    if (start < 0) return rest;
    let depth = 0;
    let end = rest.indexOf("{", start);
    for (; end < rest.length; end += 1) {
      if (rest[end] === "{") depth += 1;
      if (rest[end] === "}" && --depth === 0) break;
    }
    rest = rest.slice(0, start) + rest.slice(end + 1);
  }
}

test("reduced motion makes every specimen change instant", () => {
  const sources = [join(projectRoot, "src", "components", "exhibits", "ExhibitSpecimen.astro"), ...specimens.map((spec) => join(specimenDir, `${spec.component}.astro`))];
  for (const file of sources) {
    const source = readFileSync(file, "utf8");
    const css = styleOf(source);
    // transitions and animations only exist when motion is welcome, so under reduce there are none to run.
    assert.doesNotMatch(outsideMotionBlocks(css), /\b(transition|animation)(-[a-z-]+)?\s*:/, file);
    // a script that waits before a change skips the wait under reduced motion.
    const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";
    if (/setTimeout|\.animate\(/.test(script)) assert.match(script, /prefers-reduced-motion: reduce/, file);
  }
  const css = (component) => styleOf(readFileSync(join(specimenDir, `${component}.astro`), "utf8"));
  // the springs reuse the cord's linear() curve at about 400ms; frontground is 150ms ease out with no spring.
  const globalCss = readFileSync(join(projectRoot, "src", "styles", "global.css"), "utf8");
  assert.match(globalCss.slice(globalCss.indexOf(":root {"), globalCss.indexOf("}", globalCss.indexOf(":root {"))), /--cord-spring: linear\(0, /);
  for (const component of ["SpecimenTerpcareMood", "SpecimenTerpcarehubBook", "SpecimenSohiveRsvp"]) assert.match(css(component), /400ms var\(--cord-spring\)/, component);
  for (const component of ["SpecimenFrontgroundFindings", "SpecimenFrontgroundGreyscale"]) {
    assert.match(css(component), /150ms ease-out/, component);
    assert.doesNotMatch(css(component), /cord-spring|linear\(/, component);
  }
  // the check draws in 300ms once the button has landed.
  assert.match(css("SpecimenTerpcarehubBook"), /stroke-dashoffset 300ms[^;]*400ms/);
  assert.match(css("SpecimenFrontgroundGreyscale"), /filter: grayscale\(1\)/);
});

test("the specimen fonts are self-hosted, latin only, and load only on the pages that use them", () => {
  const faces = { inter: { family: "Inter", weight: "500 700" }, figtree: { family: "Figtree", weight: "400 700" } };
  for (const [name, { family, weight }] of Object.entries(faces)) {
    const file = join(projectRoot, "public", fontFiles[name]);
    assert.ok(statSync(file).size > 0, file);
    assert.match(readFileSync(join(file, "..", "OFL.txt"), "utf8"), /SIL Open Font License, Version 1\.1/);
    for (const html of [pages.get("terpcare"), pages.get("terpcarehub")]) {
      const face = html.match(new RegExp(`@font-face\\s*\\{[^}]*font-family:\\s*"?${family}"?;[^}]*\\}`))?.[0];
      if (!face) continue;
      assert.match(face, new RegExp(`font-weight:\\s*${weight};`));
      assert.match(face, /font-display:\s*swap;/);
      assert.match(face, /unicode-range:\s*U\+0000-00FF/);
    }
  }

  const wanted = new Map();
  for (const spec of specimens) wanted.set(spec.slug, new Set([...(wanted.get(spec.slug) ?? []), ...spec.fonts]));
  for (const [slug, html] of pages) {
    for (const [name, href] of Object.entries(fontFiles)) {
      const uses = wanted.get(slug)?.has(name) ?? false;
      assert.equal(html.includes(href), uses, `${slug} ${uses ? "misses" : "loads"} ${name}`);
    }
  }
  // the faces sit in the page head, never in a shared stylesheet, and no other route names them.
  const assets = join(projectRoot, "dist", "_astro");
  for (const name of readdirSync(assets).filter((file) => file.endsWith(".css") || file.endsWith(".js"))) {
    assert.doesNotMatch(readFileSync(join(assets, name), "utf8"), /fonts\/(inter|figtree)\//, name);
  }
  for (const page of ["index.html", "about/index.html", "explore/index.html"]) {
    assert.doesNotMatch(readFileSync(join(projectRoot, "dist", page), "utf8"), /fonts\/(inter|figtree)\//, page);
  }
  for (const slug of wanted.keys()) {
    const head = pages.get(slug).split("</head>")[0];
    for (const name of wanted.get(slug)) assert.ok(head.includes(fontFiles[name]), `${slug} declares ${name} in its head`);
  }
});

/** the code of every script a page runs, inline or from its bundle. */
function scriptsOf(html) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map(([, attrs, code]) => {
    const src = attrs.match(/\bsrc="\/([^"]+)"/)?.[1];
    return src ? readFileSync(join(projectRoot, "dist", src), "utf8") : code;
  }).join("\n");
}

test("each specimen script ships only on its own page", () => {
  for (const spec of specimens) {
    for (const [slug, html] of pages) {
      const has = scriptsOf(html).includes(`figure[data-specimen="${spec.kind}"]`);
      assert.equal(has, slug === spec.slug, `${spec.component} script on ${slug}`);
    }
  }
});

test("the greyscale exhibit shows the queue capture through the sized image pipeline", () => {
  const src = "/images/work/frontground/frontground-triage-queue.png";
  assert.ok(existsSync(join(projectRoot, "public", src)));
  const manifest = JSON.parse(readFileSync(join(projectRoot, "src", "data", "exhibit-sizes.json"), "utf8"));
  assert.deepEqual(manifest["frontground-triage-queue"], [320, 480, 960, 1440, 1920]);
  const html = specimenHtml(specimens[4]);
  const img = html.match(/<img\b[^>]*>/)[0];
  assert.match(img, new RegExp(`src="${src}"`));
  assert.match(img, /srcset="\/images\/exhibits\/sized\/frontground-triage-queue-320\.webp 320w,/);
  assert.match(img, /\bsizes="/);
  assert.match(img, /width="1920" height="1080"/);
  assert.match(img, /loading="lazy"/);
  assert.match(img, /alt="[^"]{40,}"/);
  // the toggle controls the image it greys.
  const imageId = html.match(/<div class="greyscale-shot"[^>]*id="([^"]+)"/)[1];
  for (const button of buttons(html)) assert.match(button.attrs, new RegExp(`aria-controls="${imageId}"`));
});
