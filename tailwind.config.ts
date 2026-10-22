import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#705994", // Studio Violet from Ruang Edit
          hover: "#5C467C",
          light: "#F3EFFB",
          dark: "#4B3766",
        },
        accent: {
          DEFAULT: "#F79E38", // Honey Amber from Ruang Edit
          hover: "#E48B24",
          light: "#FEF6ED",
          dark: "#C67215",
        },
        studio: {
          violet: "#705994",
          amber: "#F79E38",
          coral: "#FF5C7E",
          cyan: "#38C9BA",
          lavender: "#9E8EB9",
          charcoal: "#221C2B",
          cream: "#FAF8F5",
        },
        secondary: "var(--foreground)",
        background: "var(--background)",
        surface: "var(--surface)",
        muted: "var(--muted)",
        border: "var(--border)",
      },
      borderRadius: {
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
};
export default config;
