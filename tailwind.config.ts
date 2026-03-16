import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fantasy: {
          night: "#0f0620",
          void: "#1a1030",
          iris: "#6d4ccf",
          plum: "#a45dd6",
          gold: "#d6b25e",
          rose: "#f4c8ff",
          mist: "#efe6ff",
        },
        admin: {
          ink: "#1e2433",
          slate: "#4f5d75",
          sand: "#f7f2e8",
          brass: "#b38f4e",
          cloud: "#f4f6fa",
        },
      },
      boxShadow: {
        aurora: "0 24px 60px rgba(18, 6, 44, 0.45)",
        panel: "0 18px 40px rgba(16, 24, 40, 0.12)",
      },
      backgroundImage: {
        "starlit-veil":
          "radial-gradient(circle at top, rgba(164, 93, 214, 0.22), transparent 32%), radial-gradient(circle at 20% 20%, rgba(214, 178, 94, 0.18), transparent 22%), linear-gradient(180deg, #160b2d 0%, #0d071c 45%, #05030f 100%)",
      },
      keyframes: {
        shimmer: {
          "0%": { opacity: "0.35", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 0.7s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
