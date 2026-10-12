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
  // the one cursor: none sits on a data-cursor target while the note is on, for fine hovering pointers outside
  // forced colours (figma 161:1721); nothing else in the stylesheet hides the native cursor.
  assert.equal(globalCss.match(/cursor:\s*none/g).length, 1);
  assert.match(globalCss, /@media \(hover: hover\) and \(pointer: fine\) and \(not \(forced-colors: active\)\) \{\s*html\.is-pointing \[data-cursor\], html\.is-pointing \[data-cursor\] \* \{ cursor: none; \}\s*\}/);
  // and the same holds for the built stylesheets, component styles included.
  const assetDir = join(projectRoot, "dist", "_astro");
  const builtCss = readdirSync(assetDir).filter((name) => name.endsWith(".css")).map((name) => readFileSync(join(assetDir, name), "utf8")).join("\n");
  assert.equal(builtCss.match(/cursor:\s*none/g).length, 1);
  assert.match(builtCss, /@media ?\(hover: ?hover\) ?and ?\(pointer: ?fine\) ?and ?\(not ?\(forced-colors: ?active\)\) ?\{html\.is-pointing \[data-cursor\], ?html\.is-pointing \[data-cursor\] \* ?\{cursor: ?none\} ?\}/);
  // the pin and loop toggle set cursor: pointer at two classes' worth, so the rule needs the html type to win the tie.
  assert.match(builtCss, /\.pin\[data-astro-cid-\w+\]\{[^}]*cursor:pointer/);
  assert.match(builtCss, /\.loop-toggle\[data-astro-cid-\w+\]\{[^}]*cursor:pointer/);
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
    // the note is a single aria-hidden element, and the old cursor-dot class is gone.
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
  // under forced colours the native pointer is the only one: the script exits and the note is hidden.
  assert.match(script, /if \(window\.matchMedia\("\(forced-colors: active\)"\)\.matches\) return;/);
  assert.match(globalCss, /@media \(forced-colors: active\) \{\s*\.pointer-note \{ display: none; \}/);
  // the arrow hides only while the note is on: is-pointing is toggled beside is-on, and removed first on the way out.
  assert.match(script, /note!\.classList\.add\("is-on"\);\s*root\.classList\.add\("is-pointing"\);/);
  assert.match(script, /root\.classList\.remove\("is-pointing"\);\s*note!\.classList\.remove\("is-on"\);/);
  assert.equal(script.match(/is-pointing/g).length, 2);
  // the dot is the pointer: 10px with a canvas ring, centred on the tip by css, placed once a frame with no easing,
  // no 12px and 16px offsets and no up flip.
  assert.match(globalCss, /\.pointer-note-dot \{[^}]*width: 10px; height: 10px;[^}]*box-shadow: 0 0 0 2px var\(--canvas\);/);
  assert.match(globalCss, /\.pointer-note \{[^}]*transform: translate\(-5px, -50%\);/);
  assert.match(globalCss, /\.pointer-note\.is-left \{ flex-direction: row-reverse; transform: translate\(calc\(5px - 100%\), -50%\); \}/);
  assert.match(script, /innerWidth - x < 160/);
  assert.doesNotMatch(script, /0\.22|innerHeight|offsetWidth|offsetHeight|x [+-] 12|y [+-] 16/);
  assert.match(script, /if \(target && !frame\) frame = requestAnimationFrame\(place\);/);
  // the dot never appears at a stale spot: on entry the note is placed before it shows.
  assert.match(script, /place\(\);\s*note!\.classList\.add\("is-on"\);/);
  // the note also leaves on blur and when the tab hides, so the arrow is back when the visitor returns.
  assert.match(script, /addEventListener\("blur", hide\)/);
  assert.match(script, /"visibilitychange", \(\) => \{ if \(document\.hidden\) hide\(\); \}/);
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

test("the footer carries LinkedIn, GitHub and Email, and Email opens a message to kyeaher@umd.edu", () => {
  for (const page of ["index.html", "about/index.html", "work/terpcarehub/index.html"]) {
    const html = readFileSync(join(projectRoot, "dist", page), "utf8");
    const footer = html.slice(html.indexOf('<footer class="site-footer"'), html.indexOf("</footer>"));
    const links = [...footer.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(([, href, label]) => [label, href]);
    assert.deepEqual(links.map(([label]) => label), ["LinkedIn", "GitHub", "Email"], page);
    assert.equal(links[2][1], "mailto:kyeaher@umd.edu");
  }
});

test("the pin zoom keeps its budget, its reduced-motion rule, its notes active state and the chip off a zoomed stage", () => {
  const script = readFileSync(join(projectRoot, "src", "scripts", "pin-zoom.ts"), "utf8");
  assert.ok(gzipSync(script).length < 3072, `the zoom script stays under 3 KB gzipped, even unminified (${gzipSync(script).length})`);
  // the framing rule in one exported function: 24 or 16 of padding, the bar's measured room (48 for one line), 1.5 to 4, centred, inside the stage.
  assert.match(script, /export function frame\(/);
  assert.match(script, /const pad = stage\.w < 500 \? 16 : 24;/);
  assert.match(script, /cap = Infinity, room = 48\)/);
  assert.match(script, /Math\.min\(stage\.w \/ \(box\.w \+ 2 \* pad\), \(stage\.h - room\) \/ \(box\.h \+ 2 \* pad\), 4, cap\)/);
  assert.match(script, /rect\(entry\.target\), cap, bar\.offsetHeight \+ 12\)/);
  assert.match(script, /if \(s < 1\.5\) return null;/);
  // the layer carries one translate and scale, identity at rest; 360 in and between notes, 240 out, from the script.
  assert.match(globalCss, /\.stage-zoom \{ position: relative; height: 100%; translate: 0px 0px; scale: 1; transform-origin: 0 0; transition: translate var\(--zoom-ms, 0ms\) var\(--ease-out\), scale var\(--zoom-ms, 0ms\) var\(--ease-out\); \}/);
  // a leader label keeps its text at the start once it is a button, which would otherwise centre it.
  assert.match(readFileSync(join(projectRoot, "src", "components", "exhibits", "AnnotationLeader.astro"), "utf8"), /\.leader-label \{[^}]*text-align: start; \}/);
  assert.match(script, /move\(st, s, x, y, 360\)/);
  assert.match(script, /move\(st, 1, 0, 0, 240\)/);
  // reduced motion: no scale animation, a 120ms view transition crossfade instead.
  assert.match(globalCss, /@media \(prefers-reduced-motion: reduce\) \{\n  \.stage-zoom, \.is-zoomed \.annotation-focus\.is-zoom-active, \.is-zoomed \.leader-anchor\.is-zoom-active \{ transition: none; \}\n(?:  \/\*[^*]*\*\/\n)?  \.annotation-focus, \.annotation-badge, \.annotation-leader, \.leader-label \{ transition: none !important; \}\n  ::view-transition-group\(root\) \{ animation-duration: 120ms; \}\n\}/);
  assert.match(script, /reduce && document\.startViewTransition \? document\.startViewTransition\(swap\) : swap\(\)/);
  const assetDir = join(projectRoot, "dist", "_astro");
  const builtCss = readdirSync(assetDir).filter((name) => name.endsWith(".css")).map((name) => readFileSync(join(assetDir, name), "utf8")).join("\n");
  assert.match(builtCss, /prefers-reduced-motion: ?reduce\) ?\{\.stage-zoom,\.is-zoomed \.annotation-focus\.is-zoom-active,\.is-zoomed \.leader-anchor\.is-zoom-active\{transition: ?none\}\.annotation-focus,\.annotation-badge,\.annotation-leader,\.leader-label\{transition: ?none ?!important\}::view-transition-group\(root\)\{animation-duration: ?\.12s\}\}/);
  // while zoomed every badge hides and the active outline is held at 1.5px and a 10px radius on screen.
  assert.match(globalCss, /\.is-zoomed \.annotation-badge, \.is-zoomed \.annotation-focus:not\(\.is-zoom-active\), \.is-zoomed \.annotation-leader:not\(:has\(\.is-zoom-active\)\),\n\.is-zoomed \.annotation-leader:has\(\.is-zoom-active\) :is\(\.leader-line, \.leader-label\) \{ visibility: hidden; \}/);
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
  // the annotated cursor's chip stays off over a zoomed stage; the zoom never follows hover or scroll.
  assert.match(readFileSync(join(projectRoot, "src", "scripts", "pointer-note.ts"), "utf8"), /\.is-zoomed"\)\) return hide\(\);/);
  assert.doesNotMatch(script, /mouseover|mouseenter|pointerover|"scroll"|overflow/);
  // exits and focus: escape, close, a click outside, the stage leaving the viewport; focus back to the opener without scrolling.
  assert.match(script, /event\.key === "Escape"\) exit\(true\)/);
  assert.match(script, /new IntersectionObserver\(\(\[e\]\) => \{ if \(!e\.isIntersecting\) exit\(\); \}\)/);
  assert.match(script, /opener\.focus\(\{ preventScroll: true \}\)/);
  assert.match(script, /document\.querySelectorAll<HTMLElement>\(matchMedia\("\(min-width: 761px\)"\)\.matches \? "\[data-pin-zoom\]:not\(\[data-pin-zoom-phone\]\)" : "\[data-pin-zoom\]"\)/);
});
