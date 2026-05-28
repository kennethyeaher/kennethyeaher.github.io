import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// Deploy config for GitHub Pages.
// Free URL  https://kennethyeaher.github.io       
// Project repo https://kennethyeaher.github.io/REPO 
// Custom domain(future) kennethyeaher.com                              
export default defineConfig({
  site: "https://kennethyeaher.github.io",
  // base: "/portfolio",
  output: "static",
  integrations: [tailwind()],
});