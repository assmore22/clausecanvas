import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F3F0E8",
        document: "#FFFDF7",
        ink: "#1E1B16",
        muted: "#756F64",
        primary: "#7C2D12",
        accent: "#0F766E",
        warning: "#B7791F",
        danger: "#B91C1C",
        line: "#D7CCBA",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["Georgia", "Cambria", "Times New Roman", "ui-serif", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      borderRadius: { DEFAULT: "5px", md: "5px", lg: "6px" },
      boxShadow: {
        doc: "0 1px 2px rgba(30,27,22,0.05), 0 1px 3px rgba(30,27,22,0.07)",
        pop: "0 18px 44px -16px rgba(30,27,22,0.32)",
      },
      keyframes: {
        fadeUp: { from: { opacity: "0", transform: "translateY(5px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        redact: { "0%,100%": { opacity: "0.5" }, "50%": { opacity: "0.85" } },
        slideIn: { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
      },
      animation: { fadeUp: "fadeUp 0.25s ease-out", redact: "redact 1.5s ease-in-out infinite" },
    },
  },
  plugins: [],
};
export default config;
