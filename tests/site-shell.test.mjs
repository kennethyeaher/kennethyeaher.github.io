import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import test, { before } from "node:test";
import assert from "node:assert/strict";

const projectRoot = new URL("..", import.meta.url).pathname;
const globalCss = readFileSync(join(projectRoot, "src", "styles", "global.css"), "utf8");

before(() => {
  execFileSync("npm", ["run", "build"], {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: "pipe",
  });
});

test("the rendered shell exposes only Work, About, and Resume navigation", () => {
  const html = readFileSync(join(projectRoot, "dist", "index.html"), "utf8");

  assert.match(html, />\s*Work\s*</);
  assert.match(html, /href="\/about"[^>]*>\s*About\s*</);
  assert.match(html, /href="\/resume\/kyresume\.pdf"[^>]*>\s*Resume\s*</);
  assert.doesNotMatch(html, />\s*Education\s*</);
  assert.doesNotMatch(html, />\s*Contact\s*</);
});

test("the rendered shell provides theme choice and keeps accessible fallbacks", () => {
  const html = readFileSync(join(projectRoot, "dist", "index.html"), "utf8");

  assert.match(html, /class="skip-link"/);
  assert.doesNotMatch(html, /cursor-dot/);
  // the one cursor: none covers the page while the dot is on, for fine hovering pointers outside forced colours;
  // nothing else in the stylesheet hides the native cursor.
  assert.equal(globalCss.match(/cursor:\s*none/g).length, 1);
  assert.match(globalCss, /@media \(hover: hover\) and \(pointer: fine\) and \(not \(forced-colors: active\)\) \{\s*html\.is-pointing, html\.is-pointing \* \{ cursor: none !important; \}\s*html\.is-pointing :is\(input, select, textarea, \[contenteditable\], \[contenteditable\] \*\) \{ cursor: auto !important; \}\s*\}/);
  // and the same holds for the built stylesheets, component styles included.
  const assetDir = join(projectRoot, "dist", "_astro");
  const builtCss = readdirSync(assetDir).filter((name) => name.endsWith(".css")).map((name) => readFileSync(join(assetDir, name), "utf8")).join("\n");
  assert.equal(builtCss.match(/cursor:\s*none/g).length, 1);
  assert.match(builtCss, /@media ?\(hover: ?hover\) ?and ?\(pointer: ?fine\) ?and ?\(not ?\(forced-colors: ?active\)\) ?\{html\.is-pointing, ?html\.is-pointing \* ?\{cursor: ?none ?!important\} ?html\.is-pointing :is\(input, ?select, ?textarea, ?\[contenteditable\], ?\[contenteditable\] \*\) ?\{cursor: ?auto ?!important\} ?\}/);
  // the pin and loop toggle set cursor: pointer at two classes' worth, which outranks html.is-pointing *, so the rule is !important.
  assert.match(builtCss, /\.pin\[data-astro-cid-\w+\]\{[^}]*cursor:pointer/);
  assert.match(builtCss, /\.loop-toggle\[data-astro-cid-\w+\]\{[^}]*cursor:pointer/);
  // v3 has no menu button; the links are always on screen.
  assert.doesNotMatch(html, /data-nav-toggle|menu-toggle/);
  assert.match(html, /data-theme-toggle/);
  assert.match(html, /aria-label="Dark theme"/);
  assert.match(globalCss, /prefers-color-scheme: dark/);
  assert.match(globalCss, /:root\[data-theme="dark"\]/);
  assert.match(html, /portfolio-theme/);
  assert.match(globalCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(globalCss, /@media \(pointer: fine\) and \(prefers-reduced-motion: no-preference\)/);
});

test("the theme switch is the pull cord: a real button that hangs out of flow and springs back", () => {
  const html = readFileSync(join(projectRoot, "dist", "index.html"), "utf8");
  const cord = html.match(/<button class="theme-cord"[^>]*>/)?.[0];
  assert.ok(cord, "the pull cord renders in the header");
  assert.match(cord, /type="button"/);
  assert.match(cord, /data-theme-toggle/);
  assert.match(cord, /aria-pressed="false"/);
  // a fixed name; aria-pressed carries the state, and the script never rewrites the label.
  assert.match(cord, /aria-label="Dark theme"/);
  assert.doesNotMatch(readFileSync(join(projectRoot, "src", "scripts", "exhibits.ts"), "utf8"), /setAttribute\("aria-label", dark/);
  // shown by css from the first paint, never revealed by script, so it cannot shift the header.
  assert.doesNotMatch(cord, /\shidden/);
  // v3 hangs it from the top edge (figma 176:1721), not under a header rule.
  assert.match(globalCss, /\.theme-cord \{ position: absolute; top: 0;/);
  assert.match(globalCss, /html:not\(\.nav-ready\) \.theme-cord \{ display: none; \}/);
  // rests at 44px, pulls 28px further to 72px, and springs back on stiffness 300, damping 18.
  assert.match(globalCss, /\.theme-cord-line \{[^}]*height: 44px;/);
  assert.match(globalCss, /scale 614ms var\(--cord-spring\)/);
  assert.match(globalCss, /--cord-spring: linear\(0, /);
  assert.match(globalCss, /:root\.theme-fading[^{]*\{ transition: color 250ms/);
  const reduced = globalCss.match(/@media \(prefers-reduced-motion: reduce\) \{\s*\.theme-cord-line, \.theme-cord-knob \{ transition: none; \}/);
  assert.ok(reduced, "no swing under reduced motion");
});

test("the dot cursor is one aria-hidden dot on every page, the pointer for fine hovering mice only", () => {
  const pagesBuilt = ["index.html", "about/index.html", ...["terpcarehub", "ovara", "kairo-health", "usm-venture-benchmark", "college-park-capstone", "frontground", "terpcare", "sohive"].map((slug) => `work/${slug}/index.html`)];
  const kinds = new Set();
  const labelled = new Set();
  for (const file of pagesBuilt) {
    const html = readFileSync(join(projectRoot, "dist", file), "utf8");
    // the dot is a single aria-hidden element; the annotated note, its leader and the old cursor-dot class are gone.
    assert.doesNotMatch(html, /cursor-dot|pointer-note/);
    const dots = [...html.matchAll(/<div class="pointer-dot" data-pointer-dot aria-hidden="true"><span class="pointer-dot-mark"><\/span><span class="pointer-dot-chip"><\/span><\/div>/g)];
    assert.equal(dots.length, 1, `${file} has one dot`);
    for (const [tag] of html.matchAll(/<[a-z]+\b[^>]*\bdata-cursor="[^"]*"[^>]*>/g)) {
      const kind = tag.match(/data-cursor="([^"]*)"/)[1];
      kinds.add(kind);
      // the data-cursor attributes still mark the targets, each on its own kind of element.
      if (kind === "card") assert.match(tag, /^<a class="project-card"/, file);
      else if (kind === "cord") assert.match(tag, /^<button class="theme-cord"/, file);
      else if (kind === "loop") assert.match(tag, /^<span class="media-tag has-control"/, file);
      else if (kind === "photo") assert.match(tag, /^<figure class="chapter-photo[^"]*" data-cursor="photo" tabindex="0"/, file);
      else if (kind === "pin") assert.match(tag, /^<(button type="button" class="pin"|a class="annotation-badge")/, file);
      else assert.fail(`${file} carries an unknown data-cursor "${kind}"`);
      // a chip label ships only on cards and photos; the cord's comes from script, the pins, loops and links have none.
      if (/\sdata-cursor-label="/.test(tag)) labelled.add(kind);
    }
    assert.equal((html.match(/data-cursor-label="/g) ?? []).length, [...html.matchAll(/<(?:a class="project-card"|figure class="chapter-photo)[^>]*\sdata-cursor-label="/g)].length, `${file} labels only cards and photos`);
  }
  assert.deepEqual([...kinds].sort(), ["card", "cord", "loop", "photo", "pin"]);
  assert.deepEqual([...labelled].sort(), ["card", "photo"]);

  // every card's chip is "View " plus the project name exactly as its caption shows it.
  const home = readFileSync(join(projectRoot, "dist", "index.html"), "utf8");
  const cards = [...home.matchAll(/<a class="project-card"[^>]*\sdata-cursor-label="([^"]*)"[^>]*>[\s\S]*?<h3[^>]*>([^<]*)<\/h3>/g)];
  assert.equal(cards.length, (home.match(/<a class="project-card"/g) ?? []).length, "every card carries a label");
  assert.ok(cards.length >= 8);
  for (const [, label, name] of cards) assert.equal(label, `View ${name}`);
  assert.ok(cards.some(([, label]) => label === "View Information Science Capstone"));

  assert.ok(!existsSync(join(projectRoot, "src", "scripts", "pointer-note.ts")), "the note script is renamed");
  const script = readFileSync(join(projectRoot, "src", "scripts", "pointer-dot.ts"), "utf8");
  // fine hovering pointers only: the script exits first, css hides the dot elsewhere, and the native cursor hides only
  // inside the fine-hover, no-forced-colours query and only while the script has the dot on.
  assert.match(script, /if \(!dot \|\| !chip \|\| !window\.matchMedia\("\(hover: hover\) and \(pointer: fine\)"\)\.matches\) return;/);
  assert.match(globalCss, /@media not \(\(hover: hover\) and \(pointer: fine\)\) \{\s*\.pointer-dot \{ display: none; \}/);
  assert.match(globalCss, /@media \(hover: hover\) and \(pointer: fine\) and \(not \(forced-colors: active\)\) \{\s*html\.is-pointing, html\.is-pointing \* \{ cursor: none !important; \}\s*html\.is-pointing :is\(input, select, textarea, \[contenteditable\], \[contenteditable\] \*\) \{ cursor: auto !important; \}/);
  assert.equal(globalCss.match(/cursor: none/g).length, 1, "the native cursor hides in one place");
  // under forced colours the native pointer is the only one.
  assert.match(script, /if \(window\.matchMedia\("\(forced-colors: active\)"\)\.matches\) return;/);
  assert.match(globalCss, /@media \(forced-colors: active\) \{\s*\.pointer-dot \{ display: none; \}/);
  // the arrow hides only while the dot is on, and comes back first on the way out.
  assert.match(script, /dot!?\.classList\.add\("is-on"\);\s*root\.classList\.add\("is-pointing"\);/);
  assert.match(script, /root\.classList\.remove\("is-pointing"\);\s*dot!\.classList\.remove\("is-on", "is-down"\);/);
  // the dot hides for touch and pen, over fields, on blur, on a hidden tab and when the pointer leaves the window.
  assert.match(script, /event\.pointerType !== "mouse"\) return hide\(\);/);
  assert.match(script, /closest\("input, select, textarea, \[contenteditable\]"\)/);
  assert.match(script, /addEventListener\("blur", hide\)/);
  assert.match(script, /"visibilitychange", \(\) => \{ if \(document\.hidden\) hide\(\); \}/);
  assert.match(script, /root\.addEventListener\("pointerleave", hide\)/);
  // the ring marks anything interactive; placed once a frame with no easing.
  assert.match(script, /"a, button, summary, label\[for\], \[data-cursor\]"/);
  assert.match(script, /if \(!frame\) frame = requestAnimationFrame\(place\);/);
  assert.match(script, /dot!\.style\.translate = `\$\{x\}px \$\{y\}px`;/);
  assert.doesNotMatch(script, /0\.22|lerp|focusin|"focus"/);
  // the chip is a target's data-cursor-label, else an About photo's alt text: no loop or pin labels.
  assert.match(script, /\.dataset\.cursorLabel \?\? \(target\?\.dataset\.cursor === "photo" \? [^;]*querySelector\("img"\)\?\.alt/);
  assert.doesNotMatch(script, /View case study|note-title| loop`/);
  // the cord's label is set from script and follows the theme, explicit or system, while the pointer rests or drags.
  assert.match(script, /root\.dataset\.theme === "dark" \|\| \(!root\.dataset\.theme && dark\.matches\) \? "Pull for light" : "Pull for dark"/);
  assert.match(script, /cord\.dataset\.cursorLabel = /);
  assert.match(script, /new MutationObserver\(labelCord\)\.observe\(root, \{ attributeFilter: \["data-theme"\] \}\)/);
  assert.match(script, /dark\.addEventListener\("change", labelCord\)/);
  // the chip flips left when its real width would come within the 16px gutter of the window's right edge, not at a
  // fixed distance.
  assert.match(script, /x \+ 12 \+ chip!\.offsetWidth \+ 16 > innerWidth/);
  assert.doesNotMatch(script, /< 200|x \+ 15/);
  assert.match(globalCss, /\.pointer-dot-chip \{[^}]*display: none;/);
  assert.match(globalCss, /\.pointer-dot\.is-chip \.pointer-dot-chip \{ display: block; \}/);
  // the chip sits 8px clear of the 8px shrunk dot's edge, on either side.
  assert.match(globalCss, /\.pointer-dot-chip \{ position: absolute; top: 0; left: 12px;/);
  assert.match(globalCss, /\.pointer-dot\.is-left \.pointer-dot-chip \{ right: 12px; left: auto; \}/);
  // rest: a 14px solid --cord-ring dot centred on the tip, the knob's size. over a target it shrinks to an 8px solid
  // --color-mark dot over 120ms --ease-out and grows back the same way; 0.85 while the button is down. no ring.
  assert.match(globalCss, /\.pointer-dot \{ position: fixed; z-index: 100; top: 0; left: 0; pointer-events: none;[^}]*\}/);
  assert.match(globalCss, /\.pointer-dot-mark \{[^}]*width: 14px; height: 14px; border-radius: 50%; background: var\(--cord-ring\); translate: -50% -50%; box-shadow: 0 1px 4px rgb\(0 0 0 \/ 25%\);[^}]*transition: width 120ms var\(--ease-out\), height 120ms var\(--ease-out\), background-color 120ms var\(--ease-out\), scale 120ms var\(--ease-out\);/);
  assert.match(globalCss, /\.pointer-dot\.is-target \.pointer-dot-mark \{ width: 8px; height: 8px; background: var\(--color-mark\); \}/);
  assert.doesNotMatch(globalCss, /is-ring|border-width: 1\.5px; background: var\(--cord-pull\)/);
  assert.match(script, /dot!\.classList\.toggle\("is-target", !!target\);/);
  assert.match(globalCss, /\.pointer-dot\.is-down \.pointer-dot-mark \{ scale: 0\.85; \}/);
  assert.match(globalCss, /\.theme-cord-knob \{[^}]*box-sizing: border-box; width: 14px; height: 14px; border: 1\.5px solid var\(--cord-ring\);[^}]*background: var\(--cord-pull\);/);
  // text caret: over actual glyphs outside a target or field the mark is a 2 by 20px, 1px-radius --cord-ring bar on
  // the tip, with no transition. glyphs come from caretPositionFromPoint, else Safari's caretRangeFromPoint, and count
  // only when the caret's text node has non-whitespace text and one of its client rects holds the point. checked in
  // the once-a-frame place().
  assert.match(globalCss, /\.pointer-dot\.is-text \.pointer-dot-mark \{ width: 2px; height: 20px; border-radius: 1px; background: var\(--cord-ring\); transition: none; \}/);
  assert.match(script, /document\.caretPositionFromPoint/);
  assert.match(script, /document\.caretRangeFromPoint/);
  assert.match(script, /\.data\.trim\(\)/);
  assert.match(script, /getClientRects\(\)/);
  assert.match(script, /x >= r\.left && x <= r\.right && y >= r\.top && y <= r\.bottom/);
  assert.match(script, /function place\(\): void \{[\s\S]*?dot!\.classList\.toggle\("is-text", !target && onGlyph\(\)\);[\s\S]*?\n  \}/);
  // the dot never takes the pointer, so text selection still works under it.
  assert.doesNotMatch(globalCss, /user-select: none/);
  // reduced motion: the dot still follows, the size changes are instant.
  assert.match(globalCss, /@media \(prefers-reduced-motion: reduce\) \{\s*\.pointer-dot, \.pointer-dot \* \{ transition: none !important; \}/);
  assert.ok(gzipSync(script).length < 3072, "the cursor script stays under 3 KB gzipped, even unminified");
});

test("the interaction system uses blue rather than the previous orange accent", () => {
  assert.doesNotMatch(globalCss, /#c95a30/i);
  assert.doesNotMatch(globalCss, /#f2ded5/i);
  assert.match(globalCss, /--accent:\s*#(?:1f4f7a|174f7a|194f78|1e4d73)/i);
});

test("reveal targets stay visible until the fallback observer opts in", () => {
  assert.match(globalCss, /\.reveal-ready \[data-reveal\] \{/);
  assert.match(globalCss, /\.reveal-ready \.section-rule\[data-reveal\] \{/);
  assert.doesNotMatch(globalCss, /^\.section-rule\[data-reveal\] \{/m);
});

test("the home cover gradient registers its animated properties", () => {
  for (const name of ["--drift-a", "--drift-b", "--cover-energy"]) {
    assert.match(globalCss, new RegExp(`@property ${name} \\{`));
  }
  assert.match(globalCss, /@supports \(background: linear-gradient\(in oklab/);
});

test("the site chrome marks the current place in blue, the annotations stay orange", () => {
  // --color-mark: #236da9 in light (5.2:1 on --canvas), the dark --accent #8abde7 in both dark blocks (8.9:1).
  assert.equal((globalCss.match(/--color-mark:/g) ?? []).length, 3);
  assert.match(globalCss, /--color-mark: #236da9;/);
  assert.equal((globalCss.match(/--color-mark: #8abde7;/g) ?? []).length, 2);
  // its three uses: the current rail item (home, About and the case study chapter rail), ABOUT ME and the current
  // chapter counter.
  const aboutPage = readFileSync(join(projectRoot, "src", "pages", "about.astro"), "utf8");
  const chapters = readFileSync(join(projectRoot, "src", "components", "AboutChapters.astro"), "utf8");
  assert.match(globalCss, /\.rail-link\[aria-current\] \{\n  color: var\(--color-mark\);\n\}/);
  assert.match(aboutPage, /\.about-eyebrow \{[^}]*color: var\(--color-mark\);/);
  assert.match(chapters, /\.about-chapter\[data-current\] \.chapter-counter \{\s*color: var\(--color-mark\);/);
  assert.doesNotMatch(aboutPage + chapters, /--color-annotate/);
});

test("one annotation colour is defined for light and both dark theme paths", () => {
  assert.equal((globalCss.match(/--color-annotate:/g) ?? []).length, 3);
  assert.equal((globalCss.match(/--on-annotate:/g) ?? []).length, 3);
});

test("annotation motion follows the exhibit note and stays off under reduced motion", () => {
  const block = globalCss.slice(globalCss.indexOf("/* exhibit annotations"));
  assert.match(block, /^\/\* exhibit annotations[\s\S]*?@media \(prefers-reduced-motion: no-preference\) \{\n  @supports \(\(animation-timeline: view\(\)\) and \(animation-range: entry\)\)/);
  assert.match(block, /transition: scale 400ms/);
  assert.match(block, /var\(--order, 0\) \* 120ms/);
  assert.match(block, /translate: 0 6px/);
  assert.doesNotMatch(block.replace(/\/\*[\s\S]*?\*\//g, ""), /infinite|alternate|pulse/);
});

test("the v3 header is the name or a breadcrumb with no bar, rule or menu (figma 176:1721, 177:1801)", () => {
  const home = readFileSync(join(projectRoot, "dist", "index.html"), "utf8");
  const header = (html) => html.slice(html.indexOf('<header class="site-header">'), html.indexOf("</header>"));
  assert.match(header(home), /^<header class="site-header">\s*<a class="brand-name" href="\/">Kenneth Yeaher<\/a>/);
  assert.doesNotMatch(header(home), /class="breadcrumb"/);
  for (const slug of ["kairo-health", "ovara"]) {
    const html = readFileSync(join(projectRoot, "dist", "work", slug, "index.html"), "utf8");
    const title = html.match(/<h1 id="case-title"[^>]*>([^<]+)<\/h1>/)[1];
    // back to work, a decorative slash in a lighter tone, then the title in ink, marked as the current page.
    assert.match(header(html), new RegExp(`^<header class="site-header">\\s*<nav class="breadcrumb" aria-label="Breadcrumb">\\s*<a href="/"><span aria-hidden="true">←</span>Work</a>\\s*<span class="breadcrumb-slash" aria-hidden="true">/</span>\\s*<span class="breadcrumb-current" aria-current="page">${title}</span>\\s*</nav>`));
    assert.doesNotMatch(header(html), /class="brand-name"/);
  }
  for (const html of [home]) assert.doesNotMatch(html, /data-nav-toggle|data-menu-label|brand-role|brand-lockup/);
  // no bar: no border, no background on the header.
  const rule = globalCss.match(/\n\.site-header \{([^}]*)\}/)[1];
  assert.doesNotMatch(rule, /border|background/);
  assert.match(globalCss, /\.brand-name,\n\.breadcrumb,\n\.rail \{\n  font: 15px \/ 20px var\(--ui-sans\);/);
  assert.match(globalCss, /--ui-sans: "Geist", var\(--ui\);/);
  assert.match(globalCss, /\.brand-name,\n\.breadcrumb a \{\n  color: var\(--muted\);/);
  assert.match(globalCss, /\.breadcrumb-slash \{\n  color: color-mix\(in srgb, var\(--muted\) 50%, var\(--canvas\)\);/);
  assert.match(globalCss, /\.breadcrumb-current \{\n[^}]*color: var\(--ink\);/);
  // the menu script is gone; the head still adds nav-ready so the cord shows from the first paint.
  const site = readFileSync(join(projectRoot, "src", "scripts", "site.ts"), "utf8");
  assert.doesNotMatch(site, /setMenuOpen|data-nav-toggle|inert/);
  assert.match(home.slice(0, home.indexOf("<body")), /document\.documentElement\.classList\.add\("nav-ready"\)/);
  assert.doesNotMatch(globalCss, /menu-toggle|primary-links|is-open/);
});

test("the primary rail is fixed at the left edge, squares the current page and turns into a row at 980 (figma 176:1721, 177:1723)", () => {
  const rail = (html) => html.slice(html.indexOf('aria-label="Primary navigation"'), html.indexOf("</nav>", html.indexOf('aria-label="Primary navigation"')));
  const current = (html) => [...rail(html).matchAll(/<a [^>]*aria-current="page"[^>]*>\s*([^<]+?)\s*</g)].map(([, label]) => label);
  const labels = (html) => [...rail(html).matchAll(/<a [^>]*class="rail-link"[^>]*>\s*([^<]+?)\s*</g)].map(([, label]) => label);
  const pages = { "index.html": "Work", "about/index.html": "About", "work/ovara/index.html": "Work" };
  for (const [file, active] of Object.entries(pages)) {
    const html = readFileSync(join(projectRoot, "dist", file), "utf8");
    // plain links in a list, so the rail works with scripts off; resume still opens the pdf.
    assert.match(html, /<nav class="site-nav( is-case)?" aria-label="Primary navigation">\s*<ul class="rail">/, file);
    assert.deepEqual(labels(html), ["Work", "About", "Resume"], file);
    assert.deepEqual(current(html), [active], file);
    assert.match(rail(html), /<a href="\/resume\/kyresume\.pdf" class="rail-link" target="_blank" rel="noreferrer">/, file);
  }
  // case studies hand the desktop spot to the chapter rail, and keep the row on phones.
  assert.match(readFileSync(join(projectRoot, "dist", "work", "ovara", "index.html"), "utf8"), /<nav class="site-nav is-case"/);
  assert.match(readFileSync(join(projectRoot, "dist", "index.html"), "utf8"), /<main id="main-content" class="beside-rail">/);

  assert.match(globalCss, /\.site-nav \{\n  position: fixed;\n  top: 200px;\n  left: calc\(var\(--page-gutter\) - 10px\);\n\}/);
  assert.match(globalCss, /\.rail \{\n[^}]*flex-direction: column;\n  gap: 14px;/);
  assert.match(globalCss, /\.rail-link \{\n[^}]*gap: 6px;\n  color: var\(--muted\);/);
  assert.match(globalCss, /\.rail-link::before \{\n[^}]*width: 4px;\n  height: 4px;/);
  assert.match(globalCss, /\.rail-link\[aria-current\] \{\n  color: var\(--color-mark\);\n\}/);
  assert.match(globalCss, /\.rail-link\[aria-current\]::before \{\n  background: currentColor;\n\}/);
  assert.match(globalCss, /\.site-nav\.is-case \{\n  display: none;\n\}/);
  // dims by colour, never opacity.
  for (const [, body] of globalCss.matchAll(/\.(?:rail|rail-link|site-nav)[^{]*\{([^}]*)\}/g)) assert.doesNotMatch(body, /opacity/);
  // at 980, where the chapter rail hides, the rail is a row under the name, case studies included.
  const narrow = globalCss.slice(globalCss.indexOf("@media (max-width: 980px) {\n  .site-header {"));
  assert.match(narrow, /\.site-nav,\n  \.site-nav\.is-case \{\n    position: static;\n    display: block;/);
  assert.match(narrow, /\.rail \{\n    flex-direction: row;/);
  assert.match(narrow, /main\.beside-rail \{\n    padding-left: 0;/);
  // the header takes the home content's 20px margin from 980 down, so the name lines up with the thesis.
  assert.match(narrow, /^@media \(max-width: 980px\) \{\n  \.site-header \{\n    --page-gutter: 20px;/);
});

test("the phone header is 56px with the name 24px down, and reading progress rests right under it", () => {
  const phone = globalCss.slice(globalCss.indexOf("@media (max-width: 860px) {\n  /* home v3 mobile"));
  assert.match(phone, /--header-height: 56px;/);
  assert.match(phone, /\.site-header \{\n    padding-top: 24px;/);
  // sticky at the top of the viewport with no offset: the header is not sticky, so the bar rests under it and
  // takes the top once the header scrolls away, whatever the header's height.
  assert.match(globalCss, /\.reading-progress \{ position: sticky; z-index: 40; top: 0;/);
});

test("fonts are self-hosted with their licences, preloaded where they paint first, and keep their fallbacks", () => {
  const html = readFileSync(join(projectRoot, "dist", "index.html"), "utf8");
  const built = readFileSync(join(projectRoot, "dist", html.match(/href="\/(_astro\/[^"]+\.css)"/)[1]), "utf8");
  for (const source of [globalCss, built, html]) assert.doesNotMatch(source, /fonts\.(googleapis|gstatic)\.com|@import\s+url/);

  const faces = [...globalCss.matchAll(/@font-face \{([^}]*)\}/g)].map(([, body]) => body).filter((body) => /src: url\(/.test(body));
  for (const family of ["Fraunces", "JetBrains Mono", "Newsreader"]) {
    const own = faces.filter((body) => body.includes(`font-family: "${family}"`));
    assert.equal(own.length, 2, `${family} ships latin and latin-ext`);
    for (const body of own) {
      assert.match(body, /font-weight: 400 500;/);
      assert.match(body, /font-display: swap;/);
      assert.match(body, /unicode-range: /);
      const file = join(projectRoot, "public", body.match(/url\("\/([^"]+)"\)/)[1]);
      assert.ok(statSync(file).size > 0, `${file} is missing`);
      assert.match(readFileSync(join(file, "..", "OFL.txt"), "utf8"), /SIL Open Font License, Version 1\.1/);
    }
  }

  // geist sets the v3 shell: one static regular file, under its own licence.
  const geist = faces.filter((body) => body.includes('font-family: "Geist"'));
  assert.equal(geist.length, 1);
  assert.match(geist[0], /font-weight: 400;/);
  assert.match(geist[0], /font-display: swap;/);
  assert.match(geist[0], /url\("\/fonts\/geist\/geist-regular\.woff2"\)/);
  assert.ok(statSync(join(projectRoot, "public", "fonts", "geist", "geist-regular.woff2")).size > 0);
  assert.match(readFileSync(join(projectRoot, "public", "fonts", "geist", "OFL.txt"), "utf8"), /SIL Open Font License, Version 1\.1/);

  const preloads = [...html.matchAll(/<link rel="preload" href="([^"]+)" as="font" type="font\/woff2" crossorigin>/g)].map(([, href]) => href);
  assert.deepEqual(preloads, ["/fonts/fraunces/fraunces-latin.woff2", "/fonts/geist/geist-regular.woff2"]);
  for (const href of preloads) assert.ok(existsSync(join(projectRoot, "public", href)));
  // the metric matched fallbacks stay in every serif stack.
  assert.match(globalCss, /--display: "Fraunces", "Fraunces Fallback Iowan", "Fraunces Fallback Georgia"/);
  assert.match(globalCss, /--body: "Newsreader", "Newsreader Fallback Iowan", "Newsreader Fallback Georgia"/);
});

test("scroll-driven animations keep animation-timeline as its own declaration in the built css", () => {
  // the animation shorthand cannot set animation-timeline, so a minifier that folds it in makes chromium drop the
  // whole declaration: the edge fade, reading progress bar and scroll reveals then never run.
  const html = readFileSync(join(projectRoot, "dist", "index.html"), "utf8");
  const built = readFileSync(join(projectRoot, "dist", html.match(/href="\/(_astro\/[^"]+\.css)"/)[1]), "utf8");
  const rules = {
    "edge fade": /\.edge-fade::?after\{([^}]*animation[^}]*)\}/,
    "reading progress": /\.reading-progress span\{([^}]*animation[^}]*)\}/,
    "scroll reveal": /\[data-reveal\]:not\(\.section-rule\)\{([^}]*animation[^}]*)\}/,
  };
  for (const [name, rule] of Object.entries(rules)) {
    const body = built.match(rule)?.[1];
    assert.ok(body, `the ${name} rule with an animation is in the built global sheet`);
    assert.match(body, /(^|;)animation-timeline:/, `the ${name} rule keeps animation-timeline as its own declaration`);
  }
  for (const [, value] of built.matchAll(/(?:^|[;{])animation:([^;}]*)/g)) {
    assert.doesNotMatch(value, /scroll\(|view\(|--edge/, `animation shorthand carries a timeline: ${value}`);
  }
});

test("the home h1 keeps its own fallbacks, one pair per optical size, so its lines hold when fraunces swaps in", () => {
  const home = readFileSync(join(projectRoot, "src", "pages", "index.astro"), "utf8");
  for (const size of ["Small", "Wide"]) {
    for (const local of ["Iowan", "Georgia"]) {
      const family = `Fraunces Home ${size} Fallback ${local}`;
      const face = globalCss.match(new RegExp(`@font-face \\{\\s*font-family: "${family}";([^}]*)\\}`));
      assert.ok(face, `${family} is declared`);
      for (const descriptor of ["size-adjust", "ascent-override", "descent-override", "line-gap-override"]) assert.match(face[1], new RegExp(`${descriptor}: [\\d.]+%;`));
    }
    assert.match(home, new RegExp(`font-family: "Fraunces", "Fraunces Home ${size} Fallback Iowan", "Fraunces Home ${size} Fallback Georgia", var\\(--display\\);`));
  }
  // chrome only matches local() by full or postscript name, and iowan's family name matches neither.
  assert.match(globalCss, /local\("Iowan Old Style Roman"\), local\("IowanOldStyle-Roman"\)/);
  assert.doesNotMatch(globalCss, /local\("Iowan Old Style"\)/);
});

test("the footer carries the credit, then LinkedIn, GitHub and Email, and Email opens a message to kyeaher@umd.edu", () => {
  for (const page of ["index.html", "about/index.html", "work/terpcarehub/index.html"]) {
    const html = readFileSync(join(projectRoot, "dist", page), "utf8");
    const footer = html.slice(html.indexOf('<footer class="site-footer"'), html.indexOf("</footer>"));
    // v3 (figma 176:1721): the credit as plain text first, and no avatar.
    assert.match(footer, /<div class="footer-inner">\s*<p class="footer-credit">Designed \+ developed by Ken<\/p>\s*<nav class="footer-links"/, page);
    assert.doesNotMatch(footer, /<img/, page);
    const links = [...footer.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(([, href, label]) => [label, href]);
    assert.deepEqual(links.map(([label]) => label), ["LinkedIn", "GitHub", "Email"], page);
    assert.equal(links[2][1], "mailto:kyeaher@umd.edu");
  }
  assert.ok(!existsSync(join(projectRoot, "public", "images", "kenneth-avatar.webp")), "the avatar is gone");
  // no rule; geist 15 in --muted with the links 40px apart, and on phones a column, left aligned, links 24px apart.
  assert.doesNotMatch(globalCss.match(/\n\.site-footer \{([^}]*)\}/)[1], /border/);
  assert.match(globalCss, /\.footer-inner \{\n[^}]*justify-content: space-between;\n  gap: 12px 40px;\n  color: var\(--muted\);\n  font: 15px \/ 20px var\(--ui-sans\);/);
  assert.match(globalCss, /\.footer-links \{\n  display: flex;\n  gap: 40px;\n\}/);
  const phone = globalCss.slice(globalCss.indexOf("@media (max-width: 620px) {\n  /* the 375 frames"));
  assert.match(phone, /\.footer-inner \{\n    align-items: flex-start;\n    flex-direction: column;\n  \}\n\n  \.footer-links \{\n    gap: 24px;\n  \}/);
});

test("the pin zoom keeps its budget, its reduced-motion rule, its notes active state and the chip off a zoomed stage", () => {
  const script = readFileSync(join(projectRoot, "src", "scripts", "pin-zoom.ts"), "utf8");
  // the budget is measured on the build: the site bundle holds the zoom module as one block, from frame(), the only
  // function with the defaults (cap = Infinity, room = 48), to the end of initializePinZoom, before the next function.
  const bundleDir = join(projectRoot, "dist", "_astro");
  const bundle = readdirSync(bundleDir).filter((name) => name.endsWith(".js")).map((name) => readFileSync(join(bundleDir, name), "utf8")).find((source) => source.includes("[data-pin-zoom]"));
  assert.ok(bundle, "a built script carries the zoom module");
  const start = bundle.search(/function [\w$]+\([\w$]+,[\w$]+,[\w$]+=1\/0,[\w$]+=48\)\{/);
  const end = bundle.indexOf("}function ", bundle.indexOf("[data-pin-zoom]:not([data-pin-zoom-phone])", start)) + 1;
  assert.ok(start >= 0 && end > start, "the zoom module is found in the bundle");
  const zoomBuilt = bundle.slice(start, end);
  // the block is the zoom module and nothing else: it ends on the outside-click exit and holds no other module's hooks.
  assert.match(zoomBuilt, /document\.addEventListener\(`click`,[^}]*contains\([^)]*\)[^}]*\}\)\}$/);
  assert.doesNotMatch(zoomBuilt, /data-pointer-dot|data-nav-toggle|data-walk-step/);
  assert.ok(gzipSync(zoomBuilt).length < 3072, `the zoom script stays under 3 KB minified and gzipped (${gzipSync(zoomBuilt).length})`);
  // the framing rule in one exported function: 24 or 16 of padding, the bar's measured room (48 for one line), 1.5 to 4, centred, inside the stage.
  assert.match(script, /export function frame\(/);
  assert.match(script, /const pad = stage\.w < 500 \? 16 : 24;/);
  assert.match(script, /cap = Infinity, room = 48\)/);
  assert.match(script, /Math\.min\(stage\.w \/ \(box\.w \+ 2 \* pad\), \(stage\.h - room\) \/ \(box\.h \+ 2 \* pad\), 4, cap\)/);
  assert.match(script, /rect\(entry\.target\), cap, bar\.offsetHeight \+ 12\)/);
  assert.match(script, /if \(s < 1\.5\) return null;/);
  // the layer carries one translate and scale, identity at rest; 360 in and between notes, 240 out, from the script.
  assert.match(globalCss, /\.stage-zoom \{ position: relative; height: 100%; translate: 0px 0px; scale: 1; transform-origin: 0 0; transition: translate var\(--zoom-ms, 0ms\) var\(--ease-out\), scale var\(--zoom-ms, 0ms\) var\(--ease-out\); \}/);
  assert.match(script, /move\(st, s, x, y, 360\)/);
  assert.match(script, /move\(st, 1, 0, 0, 240\)/);
  // reduced motion: no scale animation, a 120ms view transition crossfade instead.
  assert.match(globalCss, /@media \(prefers-reduced-motion: reduce\) \{\n  \.stage-zoom, \.is-zoomed :is\(\.annotation-focus, \.leader-target\)\.is-zoom-active \{ transition: none; \}\n(?:  \/\*[^*]*\*\/\n)?  \.annotation-focus, \.annotation-badge, \.annotation-leader, \.leader-label \{ transition: none !important; \}\n  ::view-transition-group\(root\) \{ animation-duration: 120ms; \}\n\}/);
  assert.match(script, /reduce && document\.startViewTransition \? document\.startViewTransition\(swap\) : swap\(\)/);
  const assetDir = join(projectRoot, "dist", "_astro");
  const builtCss = readdirSync(assetDir).filter((name) => name.endsWith(".css")).map((name) => readFileSync(join(assetDir, name), "utf8")).join("\n");
  assert.match(builtCss, /prefers-reduced-motion: ?reduce\) ?\{\.stage-zoom,\.is-zoomed :is\(\.annotation-focus, ?\.leader-target\)\.is-zoom-active\{transition: ?none\}\.annotation-focus,\.annotation-badge,\.annotation-leader,\.leader-label\{transition: ?none ?!important\}::view-transition-group\(root\)\{animation-duration: ?\.12s\}\}/);
  // while zoomed every badge and every leader, line and label hides, and the active outline, a focus box's or a
  // leader's target region (figma 197:1727), is held at 1.5px and a 10px radius on screen.
  assert.match(globalCss, /\.is-zoomed \.annotation-badge, \.is-zoomed \.annotation-focus:not\(\.is-zoom-active\), \.is-zoomed \.annotation-leader \{ visibility: hidden; \}/);
  assert.match(globalCss, /\.is-zoomed :is\(\.annotation-focus, \.leader-target\)\.is-zoom-active \{ border-width: 0; border-radius: calc\(10px/);
  // a leader zooms from its label, framing its target region, and only when it has one; the label keeps its text at
  // the start once it is a button, which would otherwise centre it.
  assert.match(script, /const target = leader \? el\.nextElementSibling as HTMLElement \| null : el;\n\s*if \(!target\?\.matches\("\.annotation-focus, \.leader-target"\)\) continue;/);
  assert.match(script, /el\.querySelector<HTMLElement>\(leader \? "\.leader-label" : "\.annotation-badge"\)/);
  const leaderSource = readFileSync(join(projectRoot, "src", "components", "exhibits", "AnnotationLeader.astro"), "utf8");
  assert.match(leaderSource, /\.leader-label \{[^}]*text-align: start; \}/);
  assert.match(leaderSource, /\.leader-target \{ position: absolute; z-index: 3; border-radius: 10px; pointer-events: none; \}/);
  assert.match(globalCss, /box-shadow: inset 0 0 0 calc\(1\.5px \/ var\(--zoom-scale, 1\)\) var\(--color-annotate\)/);
  assert.match(globalCss, /border-radius: calc\(10px \/ var\(--zoom-scale, 1\)\)/);
  // the notes active state is the :target one, in the same rule.
  assert.match(readFileSync(join(projectRoot, "src", "components", "exhibits", "Notes.astro"), "utf8"), /\.exhibit-notes li:is\(:target, \[data-active\]\) \.note-title \{ text-decoration: underline;/);
  assert.match(builtCss, /li\[data-astro-cid-\w+\]:is\(:target,\[data-active\]\) \.note-title\[data-astro-cid-\w+\]\{text-decoration:underline;text-decoration-color:var\(--color-annotate\);text-underline-offset:3px\}/);
  // the bar: an --ink-strong pill 8px in, mono 11 on --canvas, 44px hit areas, the ends disabled by colour.
  assert.match(globalCss, /\.zoom-bar \{ position: absolute; z-index: 5; bottom: 8px; left: 8px; display: flex; align-items: flex-end;[^}]*background: var\(--ink-strong\); color: var\(--canvas\); \}/);
  // a long title wraps to two lines, the bar growing upward with the controls on its last line.
  assert.match(globalCss, /\.zoom-title \{ display: -webkit-box; overflow: hidden; margin-block: 7px; font: 500 11px \/ 14px var\(--mono\); -webkit-box-orient: vertical; -webkit-line-clamp: 2; line-clamp: 2; \}/);
  assert.match(globalCss, /\.zoom-bar button::before \{ position: absolute; inset: -8px -6px; content: ""; \}/);
  assert.match(globalCss, /\.zoom-bar button\[aria-disabled="true"\] \{ color: var\(--muted\); cursor: default; \}/);
  // the dot cursor's chip is only an About photo's alt text, so a zoomed stage never shows one; the zoom never follows
  // hover or scroll.
  assert.match(readFileSync(join(projectRoot, "src", "scripts", "pointer-dot.ts"), "utf8"), /dataset\.cursor === "photo" \?/);
  assert.doesNotMatch(script, /mouseover|mouseenter|pointerover|"scroll"|overflow/);
  // exits and focus: escape, close, a click outside, the stage leaving the viewport; focus back to the opener without scrolling.
  assert.match(script, /event\.key === "Escape"\) exit\(true\)/);
  assert.match(script, /new IntersectionObserver\(\(\[e\]\) => \{ if \(!e\.isIntersecting\) exit\(\); \}\)/);
  assert.match(script, /opener\.focus\(\{ preventScroll: true \}\)/);
  assert.match(script, /document\.querySelectorAll<HTMLElement>\(matchMedia\("\(min-width: 761px\)"\)\.matches \? "\[data-pin-zoom\]:not\(\[data-pin-zoom-phone\]\)" : "\[data-pin-zoom\]"\)/);
});
