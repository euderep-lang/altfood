import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  /** Hero: classes aplicadas com `&&` — garantir que o CSS das animações existe em produção */
  safelist: [
    "animate-hero-mesh-a",
    "animate-hero-mesh-b",
    "animate-hero-mesh-c",
    "animate-hero-mesh-d",
    "animate-hero-grid-pan",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Raleway"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Raleway"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        logo: ['"Raleway"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Redesign: tudo em Raleway (alinhado ao resto do produto)
        'altfood-display': ['"Raleway"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'altfood-body':    ['"Raleway"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'altfood-head':    ['"Raleway"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'altfood-label':   ['"Raleway"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        info: "hsl(var(--info))",
        // Altfood redesign brand tokens
        altfood: {
          forest:   '#1a3c2e',
          lime:     '#c8f044',
          offwhite: '#f5f0e8',
          dark:     '#111a14',
          muted:    '#6b7c6e',
          surface:  '#ffffff',
          border:   '#e2ddd4',
          'on-dark': '#b0c4b8',
          'muted-dark': '#6b9080',
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        xl: "0.75rem",
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-slow": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        /** Hero landing — malha fluida tipo Dieta.ai (só transform / GPU) */
        "hero-mesh-a": {
          "0%, 100%": { transform: "translate(-10%, -12%) scale(1) rotate(0deg)" },
          "33%": { transform: "translate(18%, 10%) scale(1.12) rotate(8deg)" },
          "66%": { transform: "translate(6%, -18%) scale(0.94) rotate(-6deg)" },
        },
        "hero-mesh-b": {
          "0%, 100%": { transform: "translate(12%, 10%) scale(1.05) rotate(0deg)" },
          "50%": { transform: "translate(-20%, -12%) scale(1.14) rotate(-10deg)" },
        },
        "hero-mesh-c": {
          "0%, 100%": { transform: "translate(-6%, 22%) scale(1) rotate(0deg)" },
          "50%": { transform: "translate(14%, -14%) scale(1.2) rotate(7deg)" },
        },
        "hero-mesh-d": {
          "0%, 100%": { transform: "translate(0%, 0%) scale(1) rotate(0deg)" },
          "50%": { transform: "translate(-16%, 16%) scale(1.12) rotate(5deg)" },
        },
        "hero-grid-pan": {
          "0%": { backgroundPosition: "0px 0px" },
          "100%": { backgroundPosition: "48px 48px" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-slow": "fade-in-slow 0.7s ease-out",
        "scale-in": "scale-in 0.4s ease-out",
        float: "float 4s ease-in-out infinite",
        "hero-mesh-a": "hero-mesh-a 22s ease-in-out infinite",
        "hero-mesh-b": "hero-mesh-b 28s ease-in-out infinite",
        "hero-mesh-c": "hero-mesh-c 32s ease-in-out infinite",
        "hero-mesh-d": "hero-mesh-d 26s ease-in-out infinite",
        "hero-grid-pan": "hero-grid-pan 18s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
