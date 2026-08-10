/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Se enlazan a las variables CSS (tokens.css) para soportar claro/oscuro.
        bg: "rgb(var(--bg) / <alpha-value>)",
        bg2: "rgb(var(--bg2) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        card2: "rgb(var(--card2) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        ink2: "rgb(var(--ink2) / <alpha-value>)",
        ink3: "rgb(var(--ink3) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        amber: "rgb(var(--amber) / <alpha-value>)",
        danger: "rgb(var(--danger) / <alpha-value>)",
        blue: "rgb(var(--blue) / <alpha-value>)",
        violet: "rgb(var(--violet) / <alpha-value>)",
      },
      borderRadius: {
        ios: "22px",
        ioslg: "28px",
      },
      fontFamily: {
        sys: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Segoe UI",
          "Roboto",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px rgb(0 0 0 / 0.06), 0 8px 24px rgb(0 0 0 / 0.04)",
        sheet: "0 -8px 40px rgb(0 0 0 / 0.20)",
      },
    },
  },
  plugins: [],
};
