import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://kennethyeaher.github.io",
  output: "static",
  // astro 7 defaults to 'jsx', which can drop the spaces between inline elements. true is the astro 5 behaviour
  // every page was checked against.
  compressHTML: true,
  vite: {
    build: {
      // vite 8 minifies css with lightningcss, and lightningcss 1.33.0 folds animation-timeline into the animation
      // shorthand, which cannot carry it, so chromium drops the edge fade, reading progress bar and scroll reveals.
      // esbuild, the minifier astro 5 used, keeps the longhand. tests/site-shell.test.mjs guards it.
      cssMinify: "esbuild",
    },
  },
});
