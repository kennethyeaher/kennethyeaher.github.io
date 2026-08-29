/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Navy led palette with gold as the mono label accent.
        // Cool grays for structure, navy as the primary accent,
        // gold reserved for mono labels and chips.
        ink:    { DEFAULT: "#181a1e", soft: "#3a3f47", muted: "#5a5e66" },
        paper:  { DEFAULT: "#f4f4f1", card: "#fcfcfa", line: "#e2e2da" },
        accent: { DEFAULT: "#20364e", soft: "#3a5d83" },
        gold:   { DEFAULT: "#8a6e2c", soft: "#c7a24e" },
        night:  { DEFAULT: "#0e1218", card: "#191f29", line: "#2a323d" },
      },
      fontFamily: {
        // editorial pairing with personality, not Inter or Roboto.
        display: ['"Fraunces"', "Georgia", "serif"],
        body: ['"Newsreader"', "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      maxWidth: { prose: "68ch" },
    },
  },
  plugins: [],
};
