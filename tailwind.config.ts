import type { Config } from "tailwindcss";

function withOpacity(variableName: string, fallbackRgb: string) {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}-rgb, ${fallbackRgb}), ${opacityValue})`;
    }
    return `var(${variableName}, rgb(${fallbackRgb}))`;
  };
}

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "901px",
      xl: "1241px",
      // The primary navigation can fit comfortably below the site's wider
      // content breakpoint. Keep this breakpoint scoped to the header and
      // mega menu so other wide layouts retain their existing behavior.
      nav: "1181px",
      wide: "1321px",
      "2xl": "1441px",
    },
    extend: {
      colors: {
        "brand-cyan": "#14dcff",
        "brand-sky": withOpacity("--color-accent", "0, 140, 255"),
        "brand-blue": withOpacity("--color-brand-blue", "0, 85, 255"),
        "brand-deep": "#0039b8",
        "brand-ink": withOpacity("--color-ink", "7, 20, 46"),
        "brand-ice": "#e9fbff",
        "brand-cloud": "#eaf3ff",
        "brand-line": "#d3e2f0",
        "brand-wash": "#f4f9fd",
        page: withOpacity("--color-page", "238, 236, 231"),
        paper: "#ffffff",
        cream: "#f9fbfe",
        accent: withOpacity("--color-accent", "0, 140, 255"),
        ink: withOpacity("--color-ink", "7, 20, 46"),
        navy: "#071b3d",
        muted: "#53657b",
        "soft-muted": "#9aa9ba",
        pink: withOpacity("--color-brand-blue", "0, 85, 255"),
        border: "#dce7f1",
        warm: "#d7e3ee",
        soft: "#edf5ff",
      },
      fontFamily: {
        sans: [
          "Inter",
          "SF Pro Display",
          "SF Pro Text",
          "Helvetica Neue",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        body: [
          "Inter",
          "SF Pro Text",
          "Helvetica Neue",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        brand: [
          "Inter",
          "SF Pro Display",
          "Helvetica Neue",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      fontSize: {
        hero: [
          "80px",
          { fontWeight: "750", letterSpacing: "-0.055em", lineHeight: "0.98" },
        ],
        "hero-tablet": [
          "64px",
          { fontWeight: "750", letterSpacing: "-0.05em", lineHeight: "0.98" },
        ],
        "hero-mobile": [
          "45px",
          { fontWeight: "750", letterSpacing: "-0.05em", lineHeight: "0.98" },
        ],
        display: [
          "76px",
          { fontWeight: "750", letterSpacing: "-0.055em", lineHeight: "0.98" },
        ],
        "display-mobile": [
          "54px",
          { fontWeight: "750", letterSpacing: "-0.05em", lineHeight: "0.98" },
        ],
        "page-title": [
          "56px",
          { fontWeight: "750", letterSpacing: "-0.045em", lineHeight: "1" },
        ],
        "page-title-mobile": [
          "40px",
          { fontWeight: "750", letterSpacing: "-0.04em", lineHeight: "1.02" },
        ],
        "section-title": [
          "34px",
          { fontWeight: "700", letterSpacing: "-0.035em", lineHeight: "1.08" },
        ],
        "section-title-mobile": [
          "29px",
          { fontWeight: "700", letterSpacing: "-0.03em", lineHeight: "1.1" },
        ],
        heading: [
          "33px",
          { fontWeight: "700", letterSpacing: "-0.035em", lineHeight: "1.08" },
        ],
        "heading-mobile": [
          "28px",
          { fontWeight: "700", letterSpacing: "-0.03em", lineHeight: "1.1" },
        ],
        subheading: [
          "23px",
          { fontWeight: "650", letterSpacing: "-0.025em", lineHeight: "1.2" },
        ],
        "subheading-mobile": [
          "20px",
          { fontWeight: "650", letterSpacing: "-0.02em", lineHeight: "1.25" },
        ],
        "body-lg": [
          "19px",
          { fontWeight: "400", letterSpacing: "-0.012em", lineHeight: "1.55" },
        ],
        body: [
          "17px",
          { fontWeight: "400", letterSpacing: "-0.008em", lineHeight: "1.55" },
        ],
        "body-sm": [
          "15px",
          { fontWeight: "400", letterSpacing: "-0.004em", lineHeight: "1.5" },
        ],
        "body-xs": [
          "14px",
          { fontWeight: "400", letterSpacing: "0", lineHeight: "1.45" },
        ],
        label: [
          "12px",
          { fontWeight: "700", letterSpacing: "0.12em", lineHeight: "1.3" },
        ],
        overline: [
          "11px",
          { fontWeight: "750", letterSpacing: "0.14em", lineHeight: "1.35" },
        ],
        micro: [
          "12px",
          { fontWeight: "500", letterSpacing: "0.01em", lineHeight: "1.4" },
        ],
        meta: [
          "12px",
          { fontWeight: "600", letterSpacing: "0.04em", lineHeight: "1.45" },
        ],
        kicker: [
          "15px",
          { fontWeight: "750", letterSpacing: "0.01em", lineHeight: "1.25" },
        ],
        button: [
          "13px",
          { fontWeight: "650", letterSpacing: "0.01em", lineHeight: "1.35" },
        ],
        "nav-compact": [
          "11px",
          { fontWeight: "540", letterSpacing: "0.005em", lineHeight: "1.35" },
        ],
        "nav-medium": [
          "12px",
          { fontWeight: "540", letterSpacing: "0.005em", lineHeight: "1.35" },
        ],
        nav: [
          "13px",
          { fontWeight: "540", letterSpacing: "0.005em", lineHeight: "1.35" },
        ],
        "mobile-nav": [
          "17px",
          { fontWeight: "650", letterSpacing: "-0.01em", lineHeight: "1.4" },
        ],
        logo: [
          "19px",
          { fontWeight: "750", letterSpacing: "0.02em", lineHeight: "1.2" },
        ],
        footer: [
          "13px",
          { fontWeight: "540", letterSpacing: "0", lineHeight: "1.4" },
        ],
        "icon-sm": ["18px", { lineHeight: "1" }],
        icon: ["22px", { lineHeight: "1" }],
        "icon-lg": ["24px", { lineHeight: "1" }],
        "icon-action": ["15px", { lineHeight: "1" }],
        "card-title": [
          "18px",
          { fontWeight: "700", letterSpacing: "-0.02em", lineHeight: "1.2" },
        ],
        "card-copy": [
          "14px",
          { fontWeight: "400", letterSpacing: "-0.004em", lineHeight: "1.45" },
        ],
      },
      fontWeight: {
        normal: "400",
        medium: "540",
        semibold: "650",
        bold: "750",
        book: "450",
        text: "540",
        strong: "650",
        display: "750",
      },
      letterSpacing: {
        display: "-0.055em",
        headline: "-0.035em",
        copy: "-0.008em",
        eyebrow: "0.12em",
        meta: "0.04em",
      },
      spacing: {
        "page-gutter": "14px",
        "page-gutter-lg": "42px",
        "page-gutter-xl": "72px",
        "section-gutter-lg": "56px",
        "section-gutter-xl": "72px",
        "page-y": "28px",
        "page-y-lg": "28px",
        "page-bottom": "16px",
        "page-bottom-lg": "32px",
        "content-top": "104px",
        "content-top-lg": "112px",
        "hero-rule-top": "98px",
        "hero-rule-top-lg": "112px",
        "hero-content-top": "142px",
        "hero-content-top-sm": "132px",
        "hero-content-top-lg": "168px",
        "hero-content-top-separated": "76px",
        "hero-content-top-separated-sm": "52px",
        "hero-content-top-separated-lg": "84px",
        "hero-home": "720px",
        "hero-title-gap": "14px",
        "hero-action-gap": "23px",
        "hero-action-gap-lg": "27px",
        "hero-lower-gap": "16px",
        "hero-lower-bottom-sm": "28px",
        "hero-top-space": "40px",
        "hero-top-space-lg": "40px",
        "hero-to-clients": "28px",
        "clients-to-metrics": "16px",
        "clients-to-metrics-lg": "16px",
        "section-y": "28px",
        "section-y-lg": "38px",
        "section-y-xl": "42px",
        "section-gap": "20px",
        "section-gap-lg": "32px",
        "section-gap-xl": "58px",
        "reels-y": "22px",
        "reels-bottom": "18px",
        "cluster-xs": "6px",
        "cluster-sm": "8px",
        cluster: "12px",
        "cluster-lg": "20px",
        "cluster-xl": "24px",
        "card-pad": "24px",
        "card-pad-sm": "16px",
        "card-gap": "16px",
        "nav-top": "16px",
        "nav-top-mobile": "14px",
        nav: "14px",
        control: "42px",
        "control-sm": "36px",
        "button-lg": "52px",
        "nav-shell": "72px",
        "nav-mobile-shell": "64px",
        "nav-row": "54px",
        "drawer-pad": "18px",
        "mobile-gutter": "14px",
      },
      borderRadius: {
        panel: "28px",
        "panel-mobile": "20px",
        card: "22px",
        nav: "24px",
        drawer: "22px",
        control: "12px",
        pill: "9999px",
      },
      boxShadow: {
        nav: "0 12px 28px rgba(7, 27, 61, 0.055)",
        button: "0 8px 18px rgba(0, 85, 255, 0.14)",
        "button-dark": "0 8px 18px rgba(7, 20, 46, 0.18)",
        drawer: "0 20px 60px rgba(7, 27, 61, 0.2)",
        play: "0 8px 22px rgba(7, 20, 46, 0.14)",
      },
      keyframes: {
        "client-marquee": {
          from: { transform: "translate3d(0, 0, 0)" },
          to: { transform: "translate3d(-33.333333%, 0, 0)" },
        },
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
        "hero-sheen": {
          "0%, 72%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        "client-marquee": "client-marquee 24s linear infinite",
        "hero-float": "hero-float 9s ease-in-out infinite",
        "hero-float-reverse": "hero-float 11s ease-in-out -3s infinite reverse",
        "hero-float-slow": "hero-float 12s ease-in-out -6s infinite",
        "card-in": "card-in 360ms ease both",
        "menu-in": "menu-in 220ms ease both",
        "menu-panel-in": "menu-panel-in 220ms ease both",
        "hero-sheen": "hero-sheen 7.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
