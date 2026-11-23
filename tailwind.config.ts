import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/three/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        serif: [
          "Baskerville",
          "Playfair Display",
          "Didot",
          "Bodoni MT",
          "Cinzel",
          "Georgia",
          "serif",
        ],
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "Inter",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "SF Mono",
          "JetBrains Mono",
          "Menlo",
          "Monaco",
          "Courier New",
          "monospace",
        ],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Premium editorial neutral palette
        atelier: {
          50: "#FCFBF9",
          100: "#FAF8F5",
          200: "#F2EFEB",
          300: "#E8E3DA",
          400: "#D6CEBF",
          500: "#C8B89E",
          600: "#9E8F79",
          700: "#6E6354",
          800: "#443D34",
          900: "#24201B",
          950: "#14120F",
        },
        charcoal: {
          50: "#2C2A27",
          100: "#24221F",
          200: "#1F1E1B",
          300: "#1A1918",
          DEFAULT: "#171615",
          900: "#100F0E",
        },
        beige: {
          50: "#F9F7F3",
          100: "#F3EFEB",
          200: "#E9E2D8",
          300: "#DDD3C3",
          400: "#C8B89E",
          500: "#B8A589",
          600: "#988569",
        },
      },
      borderRadius: {
        xl: "var(--radius)",
        lg: "calc(var(--radius) - 2px)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 6px)",
      },
      letterSpacing: {
        luxury: "0.2em",
        editorial: "0.08em",
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)",
        card: "0 2px 8px -2px rgba(28, 25, 23, 0.05), 0 1px 3px 0 rgba(28, 25, 23, 0.03)",
        elevated: "0 10px 30px -10px rgba(28, 25, 23, 0.08), 0 4px 6px -2px rgba(28, 25, 23, 0.02)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
