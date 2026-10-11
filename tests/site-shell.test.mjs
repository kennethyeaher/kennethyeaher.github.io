import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
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
  assert.doesNotMatch(globalCss, /cursor:\s*none/);
  assert.match(html, /data-nav-toggle/);
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
  assert.match(globalCss, /\.theme-cord \{ position: absolute;/);
  assert.match(globalCss, /html:not\(\.nav-ready\) \.theme-cord \{ display: none; \}/);
  // rests at 44px, pulls 28px further to 72px, and springs back on stiffness 300, damping 18.
  assert.match(globalCss, /\.theme-cord-line \{[^}]*height: 44px;/);
  assert.match(globalCss, /scale 614ms var\(--cord-spring\)/);
  assert.match(globalCss, /--cord-spring: linear\(0, /);
  assert.match(globalCss, /:root\.theme-fading[^{]*\{ transition: color 250ms/);
  const reduced = globalCss.match(/@media \(prefers-reduced-motion: reduce\) \{\s*\.theme-cord-line, \.theme-cord-knob \{ transition: none; \}/);
  assert.ok(reduced, "no swing under reduced motion");
});

test("the annotated cursor is one aria-hidden note over exactly four target types, for fine hovering pointers only", () => {
  const pagesBuilt = ["index.html", "about/index.html", ...["terpcarehub", "ovara", "kairo-health", "usm-venture-benchmark", "college-park-capstone", "frontground", "terpcare", "sohive"].map((slug) => `work/${slug}/index.html`)];
  const kinds = new Set();
  for (const file of pagesBuilt) {
    const html = readFileSync(join(projectRoot, "dist", file), "utf8");
    // the native cursor stays, and the note is a single aria-hidden element.
    assert.doesNotMatch(html, /cursor-dot/);
    const notes = [...html.matchAll(/<div class="pointer-note" data-pointer-note aria-hidden="true">/g)];
    assert.equal(notes.length, 1, `${file} has one note`);
    for (const [tag] of html.matchAll(/<[a-z]+\b[^>]*\bdata-cursor="[^"]*"[^>]*>/g)) {
      const kind = tag.match(/data-cursor="([^"]*)"/)[1];
      kinds.add(kind);
      // each kind sits only on its own kind of target.
      if (kind === "card") assert.match(tag, /^<a class="project-card"/, file);
      else if (kind === "cord") assert.match(tag, /^<button class="theme-cord"/, file);
      else if (kind === "loop") assert.match(tag, /^<span class="media-tag has-control"/, file);
      else if (kind === "pin") {
        assert.match(tag, /^<(button type="button" class="pin"|a class="annotation-badge")/, file);
        // a pin's chip repeats its number and the title of the note it is described by, so that note must exist.
        const note = tag.match(/aria-describedby="([^"]+)"/)[1];
        assert.match(html, new RegExp(`id="${note}"[^>]*>[\\s\\S]*?class="note-title"`), `${file} ${note}`);
      } else assert.fail(`${file} carries an unknown data-cursor "${kind}"`);
    }
  }
  assert.deepEqual([...kinds].sort(), ["card", "cord", "loop", "pin"]);

  const script = readFileSync(join(projectRoot, "src", "scripts", "pointer-note.ts"), "utf8");
  // the script exits before doing anything on coarse or non hovering pointers, and css hides the note there too.
  assert.match(script, /if \(!note \|\| !chip \|\| !window\.matchMedia\("\(hover: hover\) and \(pointer: fine\)"\)\.matches\) return;/);
  assert.match(globalCss, /@media not \(\(hover: hover\) and \(pointer: fine\)\) \{\s*\.pointer-note \{ display: none; \}/);
  // labels: the card action from figma 129:1722, the loop's own action word, the pin's number and note title, and
  // the cord's theme action, which the user set apart from its "Dark theme" name.
  assert.match(script, /if \(kind === "card"\) return "View case study";/);
  assert.match(script, /\? "Pull for light" : "Pull for dark"/);
  assert.match(script, /`\$\{toggle\.querySelector\("\[data-loop-action\]"\)\?\.textContent\} loop`/);
  assert.match(script, /`\$\{number\} · \$\{title\}`/);
  // pointer events only: keyboard focus never shows it.
  assert.doesNotMatch(script, /focusin|"focus"/);
  assert.ok(gzipSync(script).length < 3072, "the cursor script stays under 3 KB gzipped, even unminified");
  assert.match(globalCss, /@media \(prefers-reduced-motion: reduce\) \{\s*\.pointer-note, \.pointer-note \* \{ transition: none !important; \}/);
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

test("the collapsed menu is the first paint when scripts run, so the nav never shifts the page", () => {
  const html = readFileSync(join(projectRoot, "dist", "work", "kairo-health", "index.html"), "utf8");
  const head = html.slice(0, html.indexOf("<body"));
  assert.match(head, /document\.documentElement\.classList\.add\("nav-ready"\)/);
  // without scripts the class never lands, and the link row fallback still applies.
  assert.match(globalCss, /html:not\(\.nav-ready\) \.primary-links/);
});

test("the open phone menu makes the page behind it inert and hands focus in and back out", () => {
  const site = readFileSync(join(projectRoot, "src", "scripts", "site.ts"), "utf8");
  assert.match(site, /const behind = \[document\.querySelector\("main"\), document\.querySelector\("\.site-footer"\)\];/);
  assert.match(site, /behind\.forEach\(\(element\) => element\?\.toggleAttribute\("inert", open\)\);/);
  assert.match(site, /if \(open\) links\.querySelector\("a"\)\?\.focus\(\);\s*else if \(returnFocus\) toggle\.focus\(\);/);
  assert.match(site, /event\.key === "Escape"[^\n]*setMenuOpen\(false, true\)/);
  // leaving the phone layout closes the menu, so nothing stays inert behind a menu that no longer shows.
  assert.match(site, /phoneMenu\.addEventListener\("change"/);
  // and the cord, which the open menu covers, leaves the tab order with it.
  assert.match(globalCss, /\.site-nav:has\(\.primary-links\.is-open\) \.theme-cord \{ visibility: hidden; \}/);
});

test("the phone header is 56px, per figma 32:363, and reading progress rests right under it", () => {
  const phone = globalCss.slice(globalCss.indexOf("@media (max-width: 860px) {\n  /* home v2 mobile"));
  assert.match(phone, /--header-height: 56px;/);
  assert.match(phone, /\.brand-role \{\s*display: none;/);
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

  const preloads = [...html.matchAll(/<link rel="preload" href="([^"]+)" as="font" type="font\/woff2" crossorigin>/g)].map(([, href]) => href);
  assert.deepEqual(preloads, ["/fonts/fraunces/fraunces-latin.woff2", "/fonts/jetbrains-mono/jetbrains-mono-latin.woff2"]);
  for (const href of preloads) assert.ok(existsSync(join(projectRoot, "public", href)));
  // the metric matched fallbacks stay in every serif stack.
  assert.match(globalCss, /--display: "Fraunces", "Fraunces Fallback Iowan", "Fraunces Fallback Georgia"/);
  assert.match(globalCss, /--body: "Newsreader", "Newsreader Fallback Iowan", "Newsreader Fallback Georgia"/);
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

test("the footer carries LinkedIn, GitHub and Email, and Email opens a message to kyeaher@umd.edu", () => {
  for (const page of ["index.html", "about/index.html", "work/terpcarehub/index.html"]) {
    const html = readFileSync(join(projectRoot, "dist", page), "utf8");
    const footer = html.slice(html.indexOf('<footer class="site-footer"'), html.indexOf("</footer>"));
    const links = [...footer.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(([, href, label]) => [label, href]);
    assert.deepEqual(links.map(([label]) => label), ["LinkedIn", "GitHub", "Email"], page);
    assert.equal(links[2][1], "mailto:kyeaher@umd.edu");
  }
});
