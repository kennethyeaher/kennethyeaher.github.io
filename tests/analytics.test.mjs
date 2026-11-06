import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test, { before } from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { analytics } from "../src/data/analytics.mjs";
import { exploreItems } from "../src/data/explore.mjs";
import { projects } from "../src/data/portfolio.mjs";

const projectRoot = new URL("..", import.meta.url).pathname;
const base = readFileSync(join(projectRoot, "src", "layouts", "Base.astro"), "utf8");

/** read one built page as text. */
const built = (...parts) => readFileSync(join(projectRoot, "dist", ...parts), "utf8");

/** run the built loader against a fake browser and report the tags it added and the clicks it sent. */
function runLoader({ hostname = analytics.productionHost, search = "", stored = null, storageThrows = false }) {
  const [, attrs, code] = built("index.html").match(/<script\b([^>]*data-ga4=[^>]*)>([\s\S]*?)<\/script>/);
  const dataset = {};
  for (const [, key, value] of attrs.matchAll(/data-(\w+)="([^"]*)"/g)) dataset[key] = value;
  const store = new Map(stored ? [["ky-notrack", stored]] : []);
  /** stand in for a storage call, throwing when the browser blocks storage. */
  const guarded = (call) => (...args) => {
    if (storageThrows) throw new Error("blocked");
    return call(...args);
  };
  const localStorage = { getItem: guarded((key) => store.get(key) ?? null), setItem: guarded((key, value) => store.set(key, value)), removeItem: guarded((key) => store.delete(key)) };
  const added = [];
  const listeners = [];
  const document = {
    currentScript: { dataset },
    createElement: () => ({}),
    head: { append: (script) => added.push(script.src) },
    addEventListener: (...args) => listeners.push(args[1]),
  };
  const window = {};
  vm.runInNewContext(code, { window, document, localStorage, location: { hostname, search }, URLSearchParams });
  return { added, listeners, store, window };
}

before(() => {
  execFileSync("npm", ["run", "build"], { cwd: projectRoot, encoding: "utf8", stdio: "pipe" });
});

test("the analytics ids and the production host exist", () => {
  assert.equal(analytics.ga4Id, "G-V128XJDFGH");
  assert.equal(analytics.clarityId, "z9818tph8y");
  assert.equal(analytics.productionHost, "kennethyeaher.github.io");
});

test("Base.astro carries one guarded loader", () => {
  assert.equal(base.match(/data-ga4=/g).length, 1);
  assert.match(base, /<script is:inline data-ga4=\{analytics\.ga4Id\}/);
  assert.match(base, /location\.hostname === host && !notrack/);
  assert.match(base, /try \{[\s\S]*localStorage[\s\S]*\} catch \{\}/);
  assert.match(base, /googletagmanager\.com\/gtag\/js/);
  assert.match(base, /clarity\.ms\/tag\//);
});

test("the tags load on the production host only", () => {
  const live = runLoader({});
  assert.deepEqual(live.added, [`https://www.googletagmanager.com/gtag/js?id=${analytics.ga4Id}`, `https://www.clarity.ms/tag/${analytics.clarityId}`]);
  assert.equal(runLoader({ hostname: "localhost" }).added.length, 0);
  assert.equal(runLoader({ hostname: "127.0.0.1" }).added.length, 0);
});

test("?notrack sets and clears the flag, on any host", () => {
  const off = runLoader({ search: "?notrack=1" });
  assert.equal(off.added.length, 0);
  assert.equal(off.store.get("ky-notrack"), "1");
  assert.equal(runLoader({ hostname: "localhost", search: "?notrack=1" }).store.get("ky-notrack"), "1");
  assert.equal(runLoader({ stored: "1" }).added.length, 0);
  const on = runLoader({ stored: "1", search: "?notrack=0" });
  assert.equal(on.added.length, 2);
  assert.equal(on.store.has("ky-notrack"), false);
});

test("blocked storage does not break the page and ?notrack=1 still holds", () => {
  assert.equal(runLoader({ storageThrows: true }).added.length, 2);
  assert.equal(runLoader({ storageThrows: true, search: "?notrack=1" }).added.length, 0);
});

test("one click listener sends a tagged click to both tools", () => {
  const { listeners, window } = runLoader({});
  assert.equal(listeners.length, 1);
  const element = { dataset: { track: "project_card", trackLabel: "ovara" } };
  listeners[0]({ target: { closest: () => element } });
  listeners[0]({ target: { closest: () => null } });
  const events = window.dataLayer.map((args) => [...args]).filter(([command]) => command === "event");
  assert.equal(events.length, 1);
  assert.deepEqual(events[0].slice(0, 2), ["event", "project_card"]);
  assert.equal(events[0][2].label, "ovara");
  assert.deepEqual([...window.clarity.q.at(-1)], ["event", "project_card"]);
});

test("the built pages carry data-track", () => {
  const home = built("index.html");
  for (const project of projects) {
    const card = home.match(new RegExp(`<a[^>]*class="project-card[^>]*href="/work/${project.slug}"[^>]*>`))?.[0];
    assert.ok(card, `the ${project.slug} card renders`);
    assert.match(card, /data-track="project_card"/);
    assert.match(card, new RegExp(`data-track-label="${project.slug}"`));
  }
  assert.match(home, /data-theme-toggle[^>]*data-track="theme_cord"/);
  assert.match(home, /<a href="mailto:[^>]*data-track="email"/);
  for (const label of ["work", "explore", "about", "resume"]) assert.match(home, new RegExp(`class="rail-link"[^>]*data-track="nav"[^>]*data-track-label="${label}"`));
  const reel = built("explore", "index.html");
  for (const item of exploreItems) assert.match(reel, new RegExp(`href="/explore/${item.id}"[^>]*data-track="explore_item"[^>]*data-track-label="${item.id}"`));
  assert.match(built("work", projects[0].slug, "index.html"), /class="next-link[^>]*data-track="next_project"/);
  assert.match(built("explore", exploreItems[0].id, "index.html"), /rel="next"[^>]*data-track="next_project"/);
});
