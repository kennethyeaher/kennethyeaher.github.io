/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // marm ink and paper base with a clinical teal accent.
        // deliberately not the default purple on white look.
        ink: { DEFAULT: "#15140f", soft: "#2c2820", muted: "#6b6457" },
        paper: { DEFAULT: "#f5f2eb", card: "#fbf9f4", line: "#e4ded1" },
        accent: { DEFAULT: "#0e7c7b", soft: "#14b8a6", warm: "#c2683a" },
        night: { DEFAULT: "#101009", card: "#1b1a13", line: "#2d291f" },
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
