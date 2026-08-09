import type { Config } from "tailwindcss";

/**
 * Cosmic AI Command Center — Design System (lihat docs/blueprint, BAGIAN 5)
 * 80% dark space · 15% purple/blue · 5% neon accents
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: "#03030A",
          base: "#070B18",
          elevated: "#0F1424",
        },
        primary: {
          DEFAULT: "#7C3AED",
          hover: "#8B5CF6",
          active: "#6D28D9",
        },
        secondary: {
          DEFAULT: "#2563EB",
          hover: "#3B82F6",
        },
        accent: {
          DEFAULT: "#22D3EE",
        },
        highlight: "#A78BFA",
        text: {
          primary: "#F8FAFC",
          secondary: "#CBD5E1",
          muted: "#94A3B8",
          disabled: "#475569",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
        bullish: "#22C55E",
        bearish: "#EF4444",
        neutral: "#94A3B8",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-space-grotesk)", "Space Grotesk", "Inter", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        "glow-purple": "0 0 20px rgba(124, 58, 237, 0.5)",
        "glow-blue": "0 0 20px rgba(37, 99, 235, 0.5)",
        "glow-cyan": "0 0 20px rgba(34, 211, 238, 0.5)",
        "glow-lg": "0 0 40px rgba(124, 58, 237, 0.6)",
      },
      backgroundImage: {
        "cosmic-radial":
          "radial-gradient(ellipse at top, rgba(124,58,237,0.15), transparent 60%), radial-gradient(ellipse at bottom right, rgba(37,99,235,0.12), transparent 60%)",
      },
    },
  },
  plugins: [],
};

export default config;
