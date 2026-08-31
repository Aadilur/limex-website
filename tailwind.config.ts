import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "901px",
      xl: "1241px",
      wide: "1321px",
      "2xl": "1441px",
    },
    extend: {
      colors: {
        page: "#eeece7",
        paper: "#fcfbf9",
        cream: "#fbfaf6",
        ink: "#121421",
        navy: "#141a2e",
        muted: "#595e6b",
        "soft-muted": "#adb2c4",
        pink: "#f54763",
        border: "#e0dee3",
        warm: "#e5dfd5",
        soft: "#f5f2f7",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "sans-serif"],
      },
      fontSize: {
        display: ["clamp(54px, 6.1vw, 88px)", { fontWeight: "700", letterSpacing: "-5px", lineHeight: "0.99" }],
        heading: ["clamp(28px, 2.25vw, 33px)", { fontWeight: "680", letterSpacing: "-0.8px", lineHeight: "1.1" }],
        body: ["16px", { fontWeight: "400", letterSpacing: "-0.12px", lineHeight: "23px" }],
        label: ["11px", { fontWeight: "700", letterSpacing: "1.25px", lineHeight: "14px" }],
        meta: ["11px", { fontWeight: "600", letterSpacing: "0.12px", lineHeight: "16px" }],
        kicker: ["14px", { fontWeight: "800", letterSpacing: "0.12px", lineHeight: "17px" }],
        "card-title": ["17px", { fontWeight: "700", letterSpacing: "-0.25px", lineHeight: "20px" }],
        "card-copy": ["12.5px", { fontWeight: "400", lineHeight: "17px" }],
      },
      boxShadow: {
        nav: "0 12px 28px rgba(20, 26, 46, 0.055)",
        button: "0 8px 18px rgba(20, 26, 46, 0.12)",
        "button-dark": "0 8px 18px rgba(20, 19, 28, 0.18)",
        drawer: "0 20px 60px rgba(20, 26, 46, 0.2)",
        play: "0 8px 22px rgba(18, 20, 33, 0.14)",
      },
      keyframes: {
        "hero-float": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(4px, -8px, 0) scale(1.02)" },
        },
        "card-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "menu-in": {
          from: { opacity: "0", transform: "translateX(14px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "menu-panel-in": {
          from: { opacity: "0", transform: "translate(-50%, -8px)" },
          to: { opacity: "1", transform: "translate(-50%, 0)" },
        },
      },
      animation: {
        "hero-float": "hero-float 9s ease-in-out infinite",
        "hero-float-reverse": "hero-float 11s ease-in-out -3s infinite reverse",
        "hero-float-slow": "hero-float 12s ease-in-out -6s infinite",
        "card-in": "card-in 360ms ease both",
        "menu-in": "menu-in 220ms ease both",
        "menu-panel-in": "menu-panel-in 220ms ease both",
      },
    },
  },
  plugins: [],
};

export default config;
