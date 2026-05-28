/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // "Quite clear" palette, green led with maroon held in reserve.
        // Cool grays for structure, deep green as the single accent.
        ink: { DEFAULT: "#1a1a1a", soft: "#3a3a3a", muted: "#6b6b6b" },
        paper: { DEFAULT: "#f2f2f2", card: "#fafafa", line: "#dcdcdc" },
        accent: { DEFAULT: "#174d38", soft: "#2a7d5a", warm: "#4d1717" },
        night: { DEFAULT: "#0f1411", card: "#18201b", line: "#2a332d" },
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
