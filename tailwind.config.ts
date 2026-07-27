import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#eef6ff",
          100: "#d9ebff",
          200: "#bbdaff",
          300: "#8cc2ff",
          400: "#569fff",
          500: "#2f7ef5",
          600: "#1a5fe8",
          700: "#1549d0",
          800: "#173da9",
          900: "#183685",
        },
        surface: {
          0: "#f8f9fc",
          1: "#ffffff",
          2: "#f1f4f9",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
