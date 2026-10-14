import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test, { before } from "node:test";
import assert from "node:assert/strict";

import { projects } from "../src/data/portfolio.mjs";

// the live specimens from figma 363:517 ("Additions / Specimens v2", page redesign 2): one per chapter, plus
// frontground's "Seen by every eye" after its primary assessment. each sits full width: its head, a 1116 wide stage
// and three notes under it. the states and keys behind them are in tests/specimen-logic.test.mjs.
const projectRoot = new URL("..", import.meta.url).pathname;
const specimenDir = join(projectRoot, "src", "components", "exhibits", "specimens");
const specimens = [
  {
    slug: "terpcare", chapter: "mood-check-in", kind: "terpcare-mood", component: "SpecimenTerpcareMood", figma: "367:521",
    eyebrow: "SPECIMEN · TERPCARE", heading: "Five levels, in light or dark", tag: "LIVE · TAP A LEVEL, TAP A DAY", fonts: ["inter"],
    notes: [
      ["Five words, five bar heights", "Great to Struggling, each with its own colour and bar count, so meaning never rests on colour alone."],
      ["The week fills in, no streaks", "Saving drops today into the week strip. Missed days stay blank and nothing counts a chain."],
      ["One set of tokens", "Light and dark resolve from the same variables. A 400ms spring, instant under reduced motion."],
    ],
  },
  {
    slug: "terpcarehub", chapter: "booking", kind: "terpcarehub-book", component: "SpecimenTerpcarehubBook", figma: "368:523",
    eyebrow: "SPECIMEN · TERPCAREHUB", heading: "Book in two taps, undo in one", tag: "LIVE · TAP TO BOOK", fonts: ["figtree"],
    notes: [
      ["The card opens in place", "Book reveals the next three times under the facts. Nothing navigates away from the decision."],
      ["The button keeps the time", "Booked shows when, so there is nothing to reopen. The check draws in 300ms after it lands."],
      ["Undo, then it lands", "A toast offers Undo for five seconds. After that the booking drops into Your bookings."],
    ],
  },
  {
    slug: "sohive", chapter: "rsvp-outcomes", kind: "sohive-rsvp", component: "SpecimenSohiveRsvp", figma: "369:633",
    eyebrow: "SPECIMEN · SOHIVE", heading: "Going, with the room counting", tag: "LIVE · TAP TO RSVP", fonts: ["inter"],
    notes: [
      ["The room counts with you", "The going count rolls up by one and the capacity bar fills, so the tap has a visible effect beyond the button."],
      ["A ticket, not just a toast", "Going flips a ticket into place with a code for the door. Undo lives in the toast for five seconds."],
      ["Motion", "A gentle spring, about 400ms, and an odometer roll on the count. Under reduced motion both change at once."],
    ],
  },
  {
    slug: "frontground", chapter: "triage", kind: "frontground-findings", component: "SpecimenFrontgroundFindings", figma: "363:518",
    eyebrow: "SPECIMEN · FRONTGROUND", heading: "Primary assessment, letter by letter", tag: "LIVE · TAP OR USE THE KEYBOARD", fonts: ["figtree"],
    notes: [
      ["Five letters, one rail", "Airway to exposure in clinical order. Done steps carry a check, the current one is lifted, and each shows its count."],
      ["The note writes itself", "Selected findings compose the note line as they are tapped, so nothing is typed twice at the bedside."],
      ["Triage stays human", "The nurse sets Red, Yellow or Green by shape and word. The form never decides it. 150ms fades, no spring."],
    ],
  },
  {
    slug: "frontground", chapter: "triage", kind: "frontground-greyscale", component: "SpecimenFrontgroundGreyscale", figma: "365:519",
    eyebrow: "SPECIMEN · FRONTGROUND", heading: "Seen by every eye", tag: "LIVE · PICK A WAY OF SEEING", fonts: ["figtree"],
    notes: [
      ["Five ways of seeing", "Typical, protan, deutan, tritan and greyscale, simulated on the real queue with published colour matrices."],
      ["Colour fails, meaning holds", "Under deutan, red and green fall to the same olive. Shape and word still separate every row."],
      ["Cheap screens too", "A washout slider flattens contrast like the low cost monitors these clinics run. The chips still read."],
    ],
  },
];
const byKind = Object.fromEntries(specimens.map((spec) => [spec.kind, spec]));
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
function specimenHtml(kind) {
  const spec = byKind[kind];
  const chapter = chapterHtml(spec.slug, spec.chapter);
  const start = chapter.indexOf(`data-specimen="${spec.kind}"`);
  assert.ok(start >= 0, `${spec.slug} ${spec.chapter} has no ${spec.kind} specimen`);
  const open = chapter.lastIndexOf("<figure", start);
  return chapter.slice(open, chapter.indexOf("</figure>", start) + "</figure>".length);
}

/** the html of the first element carrying an attribute, up to its own close, for a tag that does not nest itself. */
function elementWith(html, attribute) {
  const at = html.indexOf(attribute);
  assert.ok(at >= 0, `no element with ${attribute}`);
  const open = html.lastIndexOf("<", at);
  const tag = html.slice(open + 1).match(/^[a-z0-9]+/)[0];
  return html.slice(open, html.indexOf(`</${tag}>`, at) + tag.length + 3);
}

/** every button tag in some html, with its text content (tags stripped, aria-hidden parts dropped). */
function buttons(html) {
  return [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(([, attrs, inner]) => ({
    attrs,
    text: visibleText(inner),
    name: attrs.match(/\baria-label="([^"]+)"/)?.[1] ?? spokenText(inner),
  }));
}

const decode = (html) => html.replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
/** the text of some html with its markup stripped, as it shows. */
const visibleText = (html) => decode(html.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
/** the text a screen reader gets: aria-hidden spans dropped. */
const spokenText = (html) => visibleText(html.replace(/<(span|svg)\b[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/\1>/g, ""));
/** the opening tag of the first element carrying an attribute. */
const tagWith = (html, attribute) => {
  const at = html.search(new RegExp(`\\s${attribute}[\\s=>]`));
  assert.ok(at >= 0, `no element with ${attribute}`);
  return html.slice(html.lastIndexOf("<", at), html.indexOf(">", at) + 1);
};
const isHidden = (tag) => /\shidden[\s>]/.test(tag);
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? null;

test("each chapter renders its v2 specimen after its own exhibit, with the mock's head, tag and notes", () => {
  for (const spec of specimens) {
    const project = projects.find((entry) => entry.slug === spec.slug);
    const exhibit = project.exhibits.find((entry) => entry.id === spec.chapter);
    const data = exhibit.specimens.find((entry) => entry.kind === spec.kind);
    assert.ok(data, `${spec.kind} is in the ${spec.chapter} data`);
    assert.equal(data.figma, spec.figma, spec.kind);

    const html = specimenHtml(spec.kind);
    const id = html.match(/<figure[^>]*\bid="([^"]+)"/)[1];
    assert.match(html, new RegExp(`<figure[^>]*aria-labelledby="${id}-heading"`));
    assert.match(html, new RegExp(`<h3 id="${id}-heading"[^>]*>${spec.heading}</h3>`));
    assert.match(html, new RegExp(`class="section-eyebrow"[^>]*>${spec.eyebrow}<`));
    assert.match(html, new RegExp(`class="specimen-tag"[^>]*>${spec.tag}<`), spec.kind);

    const notes = [...html.matchAll(/<span class="note-title"[^>]*>([^<]+)<\/span>\s*<p class="note-body"[^>]*>([^<]+)<\/p>/g)].map(([, title, body]) => [title, decode(body)]);
    assert.deepEqual(notes, spec.notes, spec.kind);
  }
  const triage = chapterHtml("frontground", "triage");
  assert.ok(triage.indexOf('data-specimen="frontground-findings"') < triage.indexOf('data-specimen="frontground-greyscale"'));
  const total = [...pages.values()].reduce((sum, html) => sum + (html.match(/<figure[^>]*\bdata-specimen="/g) ?? []).length, 0);
  assert.equal(total, specimens.length);
});

test("every specimen control is a real control with an accessible name that includes its visible words", () => {
  for (const spec of specimens) {
    const html = specimenHtml(spec.kind);
    const all = buttons(html);
    assert.ok(all.length > 0, spec.kind);
    for (const button of all) {
      assert.match(button.attrs, /\btype="button"/, `${spec.kind}: ${button.text}`);
      assert.ok(button.name, `${spec.kind}: a button has no name`);
      // a visible word is part of the name (wcag 2.5.3).
      const visible = button.text.replace(/[✓→↻]/g, "").trim().toLowerCase();
      if (visible) assert.ok(button.name.toLowerCase().includes(visible.split(" ")[0]), `${spec.kind}: "${button.name}" leaves out "${button.text}"`);
    }
    // nothing interactive hides behind a div or span.
    assert.doesNotMatch(html, /<(div|span|li)[^>]*\b(role="button"|onclick|tabindex="0")/, spec.kind);
    // every radio sits in a named radiogroup with exactly one checked, and that one is its only tab stop.
    for (const [group] of html.matchAll(/<(?:div|ol|ul)[^>]*role="radiogroup"[^>]*>/g)) {
      assert.ok(attr(group, "aria-label") || attr(group, "aria-labelledby"), `${spec.kind}: an unnamed radiogroup`);
    }
  }
});

/** the radios in the radiogroup a label names: [name, checked, tabindex]. */
function radios(html, label) {
  const at = html.search(new RegExp(`role="radiogroup"[^>]*aria-label="${label}"|aria-label="${label}"[^>]*role="radiogroup"`));
  assert.ok(at >= 0, `no radiogroup "${label}"`);
  const open = html.lastIndexOf("<", at);
  const tag = html.slice(open + 1).match(/^[a-z]+/)[0];
  const group = html.slice(open, html.indexOf(`</${tag}>`, at));
  return buttons(group).filter((button) => /role="radio"/.test(button.attrs)).map((button) => [button.name, attr(button.attrs, "aria-checked"), attr(button.attrs, "tabindex")]);
}

test("the primary assessment starts on breathing with the mock's findings, note, summary and triage", () => {
  const html = specimenHtml("frontground-findings");
  assert.match(visibleText(html), /New exam · Primary assessment/);
  assert.match(visibleText(html), /Selina Kyle · 01254 · arrived 10:30 AM/);
  assert.match(visibleText(html), /Saved on this device/);
  // the stepper is an ordered list of five buttons, breathing current.
  const steps = elementWith(html, 'aria-label="Assessment steps"');
  assert.match(steps, /^<ol/);
  const stepButtons = buttons(steps);
  assert.deepEqual(stepButtons.map((button) => button.name), ["Airway, Clear", "Breathing, 2 findings", "Circulation", "Disability", "Exposure"]);
  assert.deepEqual(stepButtons.map((button) => attr(button.attrs, "aria-current")), [null, "step", null, null, null]);
  // the findings are toggles in a group named for the letter.
  const findings = elementWith(html, 'aria-label="Breathing findings"');
  assert.deepEqual(buttons(findings).map((button) => [button.name, attr(button.attrs, "aria-pressed")]),
    [["Clear", "false"], ["Wheeze", "true"], ["Crackles", "false"], ["Stridor", "false"], ["Rate over 30", "true"], ["Accessory muscles", "false"], ["SpO₂ under 92%", "false"], ["Unable to speak", "false"]]);
  assert.match(html, /B · BREATHING/);
  assert.match(html, /Tap each finding that applies/);
  // the note is a labelled text field holding the composed line, with its hint as its description.
  const field = html.match(/<textarea\b[^>]*>([^<]*)<\/textarea>/);
  assert.ok(field, "the note is a textarea");
  assert.equal(field[1], "Wheeze, rate over 30.");
  const fieldId = attr(field[0], "id");
  assert.match(html, new RegExp(`<label[^>]*for="${fieldId}"[^>]*>[\\s\\S]*?NOTE · WRITES ITSELF`));
  assert.match(html, new RegExp(`id="${attr(field[0], "aria-describedby")}"[^>]*>Composed from the chips\\. Edit freely\\.<`));
  assert.deepEqual(buttons(html).filter((button) => /data-exam-(back|next)/.test(button.attrs)).map((button) => button.name), ["Back", "Next: Circulation"]);
  // the summary reads every letter, with nothing yet as a dash that is not read as a dash.
  const summary = elementWith(html, 'aria-label="Summary"');
  assert.equal(visibleText(summary.replace(/<span class="visually-hidden"[^>]*>[^<]*<\/span>/g, "")), "A Clear B Wheeze, rate over 30 C — D — E —");
  assert.equal(spokenText(summary), "A Clear B Wheeze, rate over 30 C Nothing yet D Nothing yet E Nothing yet");
  // triage is the nurse's: three radios, yellow set, each a shape and a word.
  assert.deepEqual(radios(html, "Triage, set by the nurse"), [["Red", "false", "-1"], ["Yellow", "true", "0"], ["Green", "false", "-1"]]);
  assert.match(html, /TRIAGE · SET BY THE NURSE/);
  assert.match(html, /Shape and word, so it survives colour blindness and cheap monitors\./);
  for (const shape of ["square", "rounded", "circle"]) assert.match(html, new RegExp(`class="triage-shape is-${shape}"[^>]*aria-hidden="true"`));
  // the keys are spelled out on the stage.
  assert.match(html, /<kbd[^>]*>← →<\/kbd>\s*step/);
  assert.match(html, /<kbd[^>]*>Space<\/kbd>\s*select/);
  assert.match(html, /<kbd[^>]*>1 2 3<\/kbd>\s*triage/);
  // a polite status says where the keys have moved.
  assert.match(html, /<p class="visually-hidden" role="status"[^>]*data-exam-status/);
});

test("seen by every eye shows the queue as a deutan sees it, with the panel, washout and a live filter", () => {
  const html = specimenHtml("frontground-greyscale");
  assert.deepEqual(radios(html, "Way of seeing"), [["Typical", "false", "-1"], ["Protan", "false", "-1"], ["Deutan", "true", "0"], ["Tritan", "false", "-1"], ["Greyscale", "false", "-1"]]);
  assert.match(html, /<p class="vision-caption" aria-live="polite"[^>]*>Deuteranopia · red and green fall together<\/p>/);
  // the queue is a real table, filtered through the svg matrix for the chosen eye.
  const table = elementWith(html, "<table");
  assert.match(html, /Patient queue/);
  assert.match(html, /AS SEEN · DEUTAN/);
  assert.deepEqual([...table.matchAll(/<th\b[^>]*>([^<]+)<\/th>/g)].map(([, text]) => text), ["Patient ID", "Name", "Arrived", "Triage"]);
  const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].slice(1).map(([, row]) => visibleText(row));
  assert.deepEqual(rows, ["01202 Oliver Queen 09:33 AM Red", "01345 John Stewart 09:50 AM Yellow", "01254 Selina Kyle 10:30 AM Green", "01260 Hal Jordan 10:11 AM Green", "01258 Dinah Lance 10:10 AM Red"]);
  const filter = html.match(/<filter id="([^"]+)"[^>]*color-interpolation-filters="linearRGB"[^>]*>([\s\S]*?)<\/filter>/);
  assert.ok(filter, "a linear sRGB filter");
  assert.match(filter[2], /<feColorMatrix type="matrix" values="0\.367322 0\.860646 -0\.227968 0 0 0\.280085 0\.672501 0\.047413 0 0 -0\.01182 0\.04294 0\.968881 0 0 0 0 0 1 0"/);
  assert.match(filter[2], /<feComponentTransfer color-interpolation-filters="sRGB"/);
  assert.match(html, new RegExp(`class="vision-queue"[^>]*style="filter: url\\(#${filter[1]}\\)"`));
  // what still separates them: hue fails under deutan, shape, word and contrast hold.
  const panel = elementWith(html, 'aria-label="What still separates them"');
  assert.deepEqual([...panel.matchAll(/<li\b[^>]*data-verdict="(\w+)"[^>]*data-pass="(\w+)"/g)].map(([, key, pass]) => [key, pass]), [["hue", "false"], ["shape", "true"], ["word", "true"], ["contrast", "true"]]);
  assert.match(visibleText(panel), /Hue Red and green read as the same olive/);
  assert.match(visibleText(panel), /Contrast \d+\.\d:1 Chip text against white, measured live/);
  for (const word of ["Fails", "Holds"]) assert.match(panel, new RegExp(`role="img" aria-label="${word}"`));
  // the washout is a native range, labelled, at the mock's 40%.
  const range = html.match(/<input\b[^>]*type="range"[^>]*>/)[0];
  assert.equal(attr(range, "value"), "40");
  assert.equal(attr(range, "aria-valuetext"), "40%");
  assert.match(html, new RegExp(`<label[^>]*for="${attr(range, "id")}"[^>]*>CHEAP MONITOR WASHOUT</label>`));
  // the chips say their level in a word with a shape beside it.
  for (const shape of ["square", "rounded", "circle"]) assert.match(table, new RegExp(`class="triage-shape is-${shape}"[^>]*aria-hidden="true"`));
});

test("the mood specimen shows both themes, one live, five levels, the tags and the week", () => {
  const html = specimenHtml("terpcare-mood");
  assert.deepEqual(buttons(elementWith(html, 'aria-label="Specimen theme"')).map((button) => [button.text, attr(button.attrs, "aria-pressed")]), [["Light", "true"], ["Dark", "false"]]);
  const light = html.slice(html.indexOf('data-mood-half="light"'), html.indexOf('data-mood-half="dark"'));
  const dark = html.slice(html.indexOf('data-mood-half="dark"'));
  // the light half is the live one; the dark half mirrors it, hidden from screen readers and out of the tab order.
  assert.doesNotMatch(light.slice(0, light.indexOf(">")), /aria-hidden/);
  assert.match(html, /data-mood-half="dark"[^>]*aria-hidden="true"/);
  for (const button of buttons(dark)) assert.equal(attr(button.attrs, "tabindex"), "-1", button.name);
  assert.deepEqual(radios(light, "Mood"), [["Great", "false", "-1"], ["Good", "false", "-1"], ["Okay", "true", "0"], ["Low", "false", "-1"], ["Struggling", "false", "-1"]]);
  assert.match(visibleText(light), /How are you today\? Tuesday, October 13/);
  assert.match(visibleText(light), /What is affecting it\?/);
  assert.deepEqual(buttons(elementWith(light, 'aria-label="What is affecting it"')).map((button) => [button.name, attr(button.attrs, "aria-pressed")]), [["Sleep", "true"], ["Classes", "true"], ["Friends", "false"], ["Health", "false"]]);
  assert.deepEqual(radios(light, "This week"), [["Monday, Good", "false", "-1"], ["Tuesday, Okay", "true", "0"], ["Wednesday, Low", "false", "-1"], ["Thursday, Okay", "false", "-1"], ["Friday, Great", "false", "-1"], ["Saturday, nothing saved", "false", "-1"], ["Sunday, Good", "false", "-1"]]);
  assert.match(light, /THIS WEEK · NO STREAKS/);
  // each level's bars are drawn, its count of five lit, and hidden from screen readers.
  assert.equal((light.match(/class="mood-bar is-on"/g) ?? []).length, 5 + 4 + 3 + 2 + 1 + 4 + 3 + 2 + 3 + 5 + 4);
  // the tokens: the brief's light pairs and dark bars, the dark fills from the TerpCare foundations variables.
  const css = styleOf(readFileSync(join(specimenDir, "SpecimenTerpcareMood.astro"), "utf8"));
  const [lightTokens, darkTokens] = css.split('[data-mood-theme="dark"]');
  for (const [name, value] of [["2", "#8a5a00"], ["2-bg", "#fff0d6"], ["1", "#6b3fb8"], ["1-bg", "#efe7fb"], ["5", "#0b6e4f"], ["4", "#1a64a3"], ["3", "#5c5c66"]]) assert.match(lightTokens, new RegExp(`--mood-${name}: ${value};`), name);
  for (const [name, value] of [["2", "#e6aa46"], ["2-bg", "#3c2c0e"], ["1", "#b496f0"], ["1-bg", "#2c2042"], ["5", "#5ac896"], ["4", "#6eaaf0"], ["3", "#aaaab2"]]) assert.match(darkTokens, new RegExp(`--mood-${name}: ${value};`), name);
});

test("the booking card starts closed, with the picker, toast and bookings waiting", () => {
  const html = specimenHtml("terpcarehub-book");
  const book = buttons(html).find((button) => button.name === "Book appointment");
  assert.ok(book);
  assert.equal(attr(book.attrs, "aria-expanded"), "false");
  const picker = attr(book.attrs, "aria-controls");
  assert.ok(isHidden(html.match(new RegExp(`<[^>]*\\bid="${picker}"[^>]*>`))[0]));
  assert.deepEqual(radios(html, "Pick a time, today"), [["2:40 PM", "true", "0"], ["3:20 PM", "false", "-1"], ["4:00 PM", "false", "-1"]]);
  assert.ok(buttons(html).some((button) => button.name === "Confirm 2:40 PM"));
  assert.match(visibleText(html), /PICK A TIME · TODAY/);
  assert.match(visibleText(html), /Sign in only happens here, never to browse\./);
  assert.match(visibleText(html), /University Health Center Open now Primary care · On campus · 4 min walk/);
  assert.match(visibleText(html), /NEXT AVAILABLE Today, 2:40 PM PLAN Accepted COST \$0 copay/);
  // the toast is a status message with its Undo, hidden until a booking is confirmed.
  const toast = elementWith(html, 'data-book-toast');
  assert.match(toast, /role="status"/);
  assert.ok(isHidden(tagWith(html, "data-book-toast-body")));
  assert.match(visibleText(toast), /Booked at University Health Center Undo/);
  assert.ok(isHidden(tagWith(html, "data-book-bookings")));
  assert.match(visibleText(html), /YOUR BOOKINGS Today, 2:40 PM University Health Center · in person NEW/);
});

test("the rsvp card starts before the tap, with its odometer, capacity bar, ticket and toast waiting", () => {
  const html = specimenHtml("sohive-rsvp");
  const rsvp = buttons(html).find((button) => /data-rsvp-button/.test(button.attrs));
  assert.equal(rsvp.name, "Going? Tap to RSVP");
  assert.equal(attr(rsvp.attrs, "aria-pressed"), "false");
  // the count reads as a number; the rolling digits are hidden from screen readers.
  assert.match(html, /<span class="odometer" aria-hidden="true"/);
  assert.match(html, /<span class="visually-hidden" data-rsvp-count[^>]*>241 going<\/span>/);
  assert.match(visibleText(html), /59 spots left/);
  assert.match(html, /class="capacity-fill"[^>]*style="--fill: 80\.33%"/);
  assert.ok(isHidden(tagWith(html, "data-rsvp-ticket")));
  assert.match(visibleText(html), /YOUR TICKET ManU vs ManCity Show this at the door\./);
  assert.match(html, /<svg[^>]*role="img"[^>]*aria-label="Door code"/);
  const toast = elementWith(html, "data-rsvp-toast");
  assert.match(toast, /role="status"/);
  assert.ok(isHidden(tagWith(html, "data-rsvp-toast-body")));
  assert.ok(buttons(toast).some((button) => button.name === "Undo"));
});

test("specimen controls show a visible focus ring", () => {
  const shell = readFileSync(join(projectRoot, "src", "components", "exhibits", "ExhibitSpecimen.astro"), "utf8");
  assert.match(shell, /\.specimen :global\(:is\(button, input, textarea\):focus-visible\) \{ outline: 2px solid [^;]+; outline-offset: 2px; \}/);
  for (const spec of specimens) {
    assert.doesNotMatch(readFileSync(join(specimenDir, `${spec.component}.astro`), "utf8"), /outline: (none|0)/, spec.kind);
  }
});

/** the css of an astro component's style blocks. */
function styleOf(source) {
  return [...source.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(([, css]) => css).join("\n");
}

/** the css inside every block opened by one at-rule, such as "@media (max-width: 760px)", joined. */
function blocksOf(css, at) {
  const found = [];
  for (let start = css.indexOf(at); start >= 0; start = css.indexOf(at, start + 1)) {
    let depth = 0;
    let end = css.indexOf("{", start);
    const open = end;
    for (; end < css.length; end += 1) {
      if (css[end] === "{") depth += 1;
      if (css[end] === "}" && --depth === 0) break;
    }
    found.push(css.slice(open + 1, end));
  }
  return found.join("\n");
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
    // transitions and animations only exist when motion is welcome, so under reduce there are none to run.
    assert.doesNotMatch(outsideMotionBlocks(styleOf(source)), /\b(transition|animation)(-[a-z-]+)?\s*:/, file);
    // no script animates on its own; a timer is only ever the five second Undo window, which is not motion.
    const script = source.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? "";
    assert.doesNotMatch(script, /\.animate\(|requestAnimationFrame/, file);
    for (const [call] of script.matchAll(/setTimeout\([^;]*/g)) assert.match(call, /TOAST_MS|remaining/, `${file}: ${call}`);
  }
  const css = (component) => styleOf(readFileSync(join(specimenDir, `${component}.astro`), "utf8"));
  const globalCss = readFileSync(join(projectRoot, "src", "styles", "global.css"), "utf8");
  assert.match(globalCss.slice(globalCss.indexOf(":root {"), globalCss.indexOf("}", globalCss.indexOf(":root {"))), /--cord-spring: linear\(0, /);
  // the springs reuse the cord's curve at about 400ms; frontground is 150ms fades with no spring and nothing moving.
  for (const component of ["SpecimenTerpcareMood", "SpecimenTerpcarehubBook", "SpecimenSohiveRsvp"]) assert.match(css(component), /400ms var\(--cord-spring\)/, component);
  for (const component of ["SpecimenFrontgroundFindings", "SpecimenFrontgroundGreyscale"]) {
    const motion = blocksOf(css(component), "@media (prefers-reduced-motion: no-preference)");
    assert.match(motion, /150ms ease-out/, component);
    assert.doesNotMatch(css(component), /cord-spring|linear\(/, component);
    // only colour and opacity fade: no transform, translate, scale or size change.
    for (const [, list] of motion.matchAll(/transition:\s*([^;]+);/g)) {
      for (const part of list.split(",")) assert.match(part.trim(), /^(opacity|color|background-color|border-color|box-shadow|fill|stroke) 150ms ease-out$/, `${component}: ${part}`);
    }
    for (const [, name] of motion.matchAll(/@keyframes ([\w-]+)/g)) assert.doesNotMatch(blocksOf(motion, `@keyframes ${name}`), /transform|translate|scale|rotate/, name);
  }
  // the check draws in 300ms once the button has landed; the odometer rolls on the spring.
  assert.match(css("SpecimenTerpcarehubBook"), /stroke-dashoffset 300ms[^;]*400ms/);
  assert.match(blocksOf(css("SpecimenSohiveRsvp"), "@media (prefers-reduced-motion: no-preference)"), /\.odometer-strip \{[^}]*transition: translate 400ms var\(--cord-spring\)/);
});

test("the specimen fonts are self-hosted, latin only, and load only on the pages that use them", () => {
  const faces = { inter: { family: "Inter", weight: "400 700" }, figtree: { family: "Figtree", weight: "400 700" } };
  for (const [name, { family, weight }] of Object.entries(faces)) {
    const file = join(projectRoot, "public", fontFiles[name]);
    assert.ok(statSync(file).size > 0, file);
    assert.match(readFileSync(join(file, "..", "OFL.txt"), "utf8"), /SIL Open Font License, Version 1\.1/);
    const html = [...pages.values()].find((page) => page.includes(fontFiles[name]));
    const face = html.match(new RegExp(`@font-face\\s*\\{[^}]*font-family:\\s*"?${family}"?;[^}]*\\}`))[0];
    assert.match(face, new RegExp(`font-weight:\\s*${weight};`));
    assert.match(face, /font-display:\s*swap;/);
    assert.match(face, /unicode-range:\s*U\+0000-00FF/);
  }

  const wanted = new Map();
  for (const spec of specimens) wanted.set(spec.slug, new Set([...(wanted.get(spec.slug) ?? []), ...spec.fonts]));
  for (const [slug, html] of pages) {
    for (const [name, href] of Object.entries(fontFiles)) {
      const uses = wanted.get(slug)?.has(name) ?? false;
      assert.equal(html.includes(href), uses, `${slug} ${uses ? "misses" : "loads"} ${name}`);
    }
  }
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

/** the code of every script a page runs, inline or from its bundle, with the bundles they import. */
function scriptsOf(html) {
  const seen = new Set();
  const read = (src) => {
    if (seen.has(src)) return "";
    seen.add(src);
    const code = readFileSync(join(projectRoot, "dist", src), "utf8");
    return code + [...code.matchAll(/from\s*"\.\/([^"]+\.js)"/g)].map(([, file]) => read(join("_astro", file))).join("\n");
  };
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map(([, attrs, code]) => {
    const src = attrs.match(/\bsrc="\/([^"]+)"/)?.[1];
    return src ? read(src) : code;
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

test("specimens go full width: one stacked column per chapter, each stage the mock's 1116 wide ratio, notes in a row under it", () => {
  for (const [slug, chapter, kinds] of [["frontground", "triage", ["frontground-findings", "frontground-greyscale"]], ["terpcare", "mood-check-in", ["terpcare-mood"]],
    ["terpcarehub", "booking", ["terpcarehub-book"]], ["sohive", "rsvp-outcomes", ["sohive-rsvp"]]]) {
    const html = chapterHtml(slug, chapter);
    // one plain wrapper, no pair or feature layout.
    const wrappers = [...html.matchAll(/<div class="exhibit-specimens"/g)];
    assert.equal(wrappers.length, 1, `${slug} ${chapter}`);
    assert.doesNotMatch(html, /exhibit-specimens exhibit-layout/);
    const inside = html.slice(wrappers[0].index);
    assert.deepEqual([...inside.matchAll(/<figure[^>]*\bdata-specimen="([^"]+)"/g)].map((match) => match[1]), kinds);
  }

  const page = styleOf(readFileSync(join(projectRoot, "src", "components", "exhibits", "ExhibitCaseStudy.astro"), "utf8"));
  assert.match(page, /\.exhibit-specimens \{[^}]*display: grid;[^}]*gap: 96px;/);
  const shell = styleOf(readFileSync(join(projectRoot, "src", "components", "exhibits", "ExhibitSpecimen.astro"), "utf8"));
  // no half size machinery is left.
  assert.doesNotMatch(shell, /is-pair|is-feature|specimen-pair|--feature-columns/);
  // the stage is the mock's 1116 by 640 (the mood stage 680), 32 under the head, and the notes 32 under the stage in
  // the mock's 249 wide columns, filling from the left.
  assert.match(shell, /\.specimen-stage \{[^}]*aspect-ratio: var\(--specimen-ratio, 1116 \/ 640\);/);
  assert.match(shell, /\.specimen-stage \{[^}]*margin-top: 32px;/);
  assert.match(readFileSync(join(specimenDir, "SpecimenTerpcareMood.astro"), "utf8"), /ratio="1116 \/ 680"/);
  assert.match(shell, /\.specimen :global\(\.exhibit-notes\) \{[^}]*grid-template-columns: repeat\(auto-fill, minmax\(240px, 1fr\)\);[^}]*margin-top: 32px;/);
  // the controls and the tag sit 20px in.
  assert.match(shell, /\.specimen-controls \{[^}]*top: 20px; right: 20px;/);
  assert.match(shell, /\.specimen-tag \{[^}]*bottom: 20px;[^}]*left: 20px;/);
  // a specimen pixel: 1px on the full 1116 stage, shrinking with it (container units) to a floor, and the stage
  // reflows to a stacked phone layout below 760 wide.
  assert.match(shell, /--u: clamp\(0\.75px, 0\.0896cqw, 1px\)/);
  assert.match(shell, /container: specimen \/ inline-size;/);
  for (const spec of specimens) {
    const source = styleOf(readFileSync(join(specimenDir, `${spec.component}.astro`), "utf8"));
    assert.match(source, /var\(--u\)/, spec.kind);
    assert.match(source, /@container specimen \(max-width: 759px\)/, spec.kind);
  }
});
