import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          bg: "hsl(var(--destructive-bg))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
          bg: "hsl(var(--warning-bg))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        gioia: {
          forest: "#004539",
          cream: "#FFFDFA",
          brass: "#C9A86B",
          ink: "#0E1B17",
        },
        miami: {
          DEFAULT: "#E78F8E",
          deep: "#9C3F3D",
        },
        ftl: {
          DEFAULT: "#7BA890",
          deep: "#004539",
        },
        ds: {
          DEFAULT: "#D4A24A",
          deep: "#8B2A26",
        },
      },
      fontFamily: {
        display: ['var(--font-cormorant)', "Georgia", "serif"],
        sans: ['var(--font-inter)', "system-ui", "sans-serif"],
        mono: ['var(--font-jetbrains-mono)', "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-2xl": ["44px", { lineHeight: "52px", letterSpacing: "-0.02em" }],
        "display-xl": ["36px", { lineHeight: "44px", letterSpacing: "-0.02em" }],
        "display-lg": ["28px", { lineHeight: "36px", letterSpacing: "-0.01em" }],
        "display-md": ["24px", { lineHeight: "32px" }],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
