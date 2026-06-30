import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  safelist: [
    "bg-ink",
    "bg-marine",
    "bg-mint",
    "bg-paper",
    "bg-saffron",
    "bg-slatepanel",
    "bg-white",
    "bg-white/95",
    "bg-marine/10",
    "bg-mint/10",
    "bg-saffron/10",
    "bg-rosewood/10",
    "bg-slatepanel/60",
    "border-marine",
    "border-marine/20",
    "border-marine/30",
    "border-mint/30",
    "border-saffron/30",
    "border-rosewood/20",
    "border-rosewood/25",
    "text-ink",
    "text-marine",
    "text-rosewood",
    "text-amber-700",
    "text-amber-800",
    "shadow-soft",
    "shadow-lift",
    "hover:shadow-lift",
    "lg:grid-cols-[1.1fr_0.9fr]",
    "lg:grid-cols-[1fr_160px]",
    "xl:grid-cols-[0.9fr_1.1fr]",
    "xl:grid-cols-[1.2fr_0.8fr]",
    "xl:grid-cols-[1fr_0.8fr]"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "\"Segoe UI\"",
          "sans-serif"
        ]
      },
      colors: {
        ink: "#15242c",
        paper: "#f6f8f7",
        marine: "#0f5f68",
        mint: "#62bda8",
        saffron: "#d99a34",
        rosewood: "#a8565d",
        slatepanel: "#eef3f2"
      },
      boxShadow: {
        soft: "0 14px 38px rgba(21, 36, 44, 0.08)",
        lift: "0 18px 50px rgba(21, 36, 44, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
