import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        foreground: "#F4F4F5",
        card: {
          DEFAULT: "#121215",
          foreground: "#F4F4F5",
          subtle: "#18181C",
          border: "rgba(255, 255, 255, 0.08)",
        },
        brand: {
          emerald: "#10B981",
          amber: "#F59E0B",
          crimson: "#EF4444",
          violet: "#8B5CF6",
          cyan: "#06B6D4",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "fade-in": "fadeIn 0.3s ease-out forwards",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 10px rgba(16, 185, 129, 0.2)" },
          "100%": { boxShadow: "0 0 25px rgba(16, 185, 129, 0.6)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

