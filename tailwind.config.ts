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
        primary: "#FF5722",
        secondary: "var(--foreground)",
        background: "var(--background)",
        surface: "var(--surface)",
      },
      borderRadius: {
        '3xl': '1.5rem', // Bento-box very rounded style
      },
    },
  },
  plugins: [],
};
export default config;
