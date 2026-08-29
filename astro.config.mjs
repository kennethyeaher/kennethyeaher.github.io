import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: "https://kennethyeaher.github.io",
  output: "static",
  integrations: [tailwind()],
});
