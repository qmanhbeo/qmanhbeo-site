import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
    "./app/**/paths-untold/**/*.{js,jsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        garamond: ["var(--font-eb-garamond)", "serif"],
        cinzel: ["var(--font-cinzel)", "serif"],
        uncial: ['"Uncial Antiqua"', 'cursive'],
        medieval: ['"MedievalSharp"', 'cursive'],
        macondo: ['"Macondo"', 'cursive'],
        imfell: ['"IM Fell English SC"', 'serif'],
        berkshire: ['"Berkshire Swash"', 'cursive'],
        pirata: ['"Pirata One"', 'cursive'],
        calligraffiti: ['Calligraffiti', 'cursive'],
        almendra: ['"Almendra SC"', 'serif'],
        crimson: ['"Crimson Text"', 'serif'],
        cardo: ['Cardo', 'serif'],
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
        // Custom medieval colors
        wood: {
          50: "#FAF7F0",
          100: "#F5E6D3",
          200: "#E6D7C3",
          300: "#D4C4A8",
          400: "#C2B092",
          500: "#A0522D",
          600: "#8B4513",
          700: "#654321",
          800: "#4A2C17",
          900: "#2F1B0C",
        },
        ember: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "blur-in": {
          "0%": { opacity: "0.4", filter: "blur(8px)" },
          "100%": { opacity: "1", filter: "blur(0px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        "sparkle-check": {
          "0%": { opacity: "0", transform: "translate(-50%, -50%) scale(0)" },
          "50%": { opacity: "1", transform: "translate(-50%, -50%) scale(1.2)" },
          "100%": { opacity: "0", transform: "translate(-50%, -50%) scale(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        "blur-out": {
          "0%": { opacity: "1", filter: "blur(0px)" },
          "100%": { opacity: "0", filter: "blur(8px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out forwards",
        "slide-in-right": "slide-in-right 0.3s ease-out forwards",
        "fade-in": "fade-in 0.25s ease-out forwards",
        "fade-in-slow": "fade-in 1.5s ease-out forwards",
        "fade-out": "fade-out 0.22s ease-in forwards",
        "blur-in": "blur-in 0.6s ease-out forwards",
        "blur-out": "blur-out 0.22s ease-in forwards",
        shimmer: "shimmer 2s linear infinite",
        "pulse-slow": "pulse-slow 2s ease-in-out infinite",
        "sparkle-check": "sparkle-check 0.6s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config

export default config
