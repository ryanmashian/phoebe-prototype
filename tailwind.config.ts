import type { Config } from "tailwindcss";

const rgbVar = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: rgbVar("--paper"),
        "paper-deep": rgbVar("--paper-deep"),
        card: rgbVar("--card"),
        ink: rgbVar("--ink"),
        "ink-muted": rgbVar("--ink-muted"),
        "ink-faint": rgbVar("--ink-faint"),
        line: rgbVar("--line"),
        "line-strong": rgbVar("--line-strong"),
        accent: rgbVar("--accent"),
        "accent-soft": rgbVar("--accent-soft"),
        "accent-fg": rgbVar("--accent-fg"),
        ok: rgbVar("--ok"),
        warn: rgbVar("--warn"),
        danger: rgbVar("--danger"),
        "risk-low-bg": rgbVar("--risk-low-bg"),
        "risk-low-fg": rgbVar("--risk-low-fg"),
        "risk-med-bg": rgbVar("--risk-med-bg"),
        "risk-med-fg": rgbVar("--risk-med-fg"),
        "risk-high-bg": rgbVar("--risk-high-bg"),
        "risk-high-fg": rgbVar("--risk-high-fg"),
        "risk-crit-bg": rgbVar("--risk-crit-bg"),
        "risk-crit-fg": rgbVar("--risk-crit-fg"),
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "10px",
        xl: "14px",
      },
      boxShadow: {
        card: "0 1px 0 0 rgb(0 0 0 / 0.02), 0 1px 2px 0 rgb(20 14 0 / 0.04)",
        pop: "0 12px 24px -12px rgb(20 14 0 / 0.18), 0 2px 4px 0 rgb(20 14 0 / 0.06)",
      },
      letterSpacing: {
        tightish: "-0.012em",
      },
    },
  },
  plugins: [],
};

export default config;
