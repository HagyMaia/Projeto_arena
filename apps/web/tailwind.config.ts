import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        coral: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#ff7043",
          600: "#f4511e",
          700: "#ea580c",
          800: "#c2410c",
          900: "#7c2d12",
        },
        navy: {
          950: "#060a12",
          900: "#0B1220",
          850: "#0F172A",
          800: "#122238",
          700: "#1E293B",
        },
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
      },
      backgroundImage: {
        "gradient-sports": "linear-gradient(to right, #10b981, #14b8a6, #ff7043)",
        "gradient-sports-light": "linear-gradient(to right, #059669, #0d9488, #f4511e)",
        "gradient-coral": "linear-gradient(to right, #ff7043, #f97316)",
        "gradient-coral-hover": "linear-gradient(to right, #f4511e, #ea580c)",
        "gradient-emerald": "linear-gradient(to right, #059669, #10b981)",
      },
    },
  },
  plugins: [],
} satisfies Config;
