import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  // Agent colours are chosen at runtime from src/lib/agents.ts.
  safelist: [
    {
      pattern: /^(bg|text|border|fill|stroke)-(clinician|assistant|extractor|shadow|monitor|advocate|judge|safe|amber|red)(\/(5|10|15|20|30|40|60))?$/,
    },
  ],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--paper) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        // One colour per agent role, used everywhere that role appears.
        clinician: "rgb(var(--clinician) / <alpha-value>)",
        assistant: "rgb(var(--assistant) / <alpha-value>)",
        extractor: "rgb(var(--extractor) / <alpha-value>)",
        shadow: "rgb(var(--shadow) / <alpha-value>)",
        monitor: "rgb(var(--monitor) / <alpha-value>)",
        advocate: "rgb(var(--advocate) / <alpha-value>)",
        judge: "rgb(var(--judge) / <alpha-value>)",
        safe: "rgb(var(--safe) / <alpha-value>)",
        amber: "rgb(var(--amber) / <alpha-value>)",
        red: "rgb(var(--red) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: { prose: "68ch" },
    },
  },
  plugins: [],
};

export default config;
