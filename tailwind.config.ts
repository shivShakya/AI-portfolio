import type { Config } from "tailwindcss";

// Every colour reads a CSS variable defined in globals.css, so the whole app
// switches between light and dark by toggling the "dark" class on <html>.
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;
const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const scale = (prefix: string) =>
  Object.fromEntries(steps.map((n) => [n, v(`${prefix}-${n}`)]));

const neutral = scale("n");
const teal = scale("t");

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        white: v("white"),
        black: v("black"),
        gray: neutral,
        slate: neutral,
        stone: neutral,
        zinc: neutral,
        neutral: neutral,
        blue: teal,
        indigo: teal,
        cyan: teal,
        teal: teal,
        midnight: v("midnight"),
        surface: v("surface"),
        ink: v("ink"),
        muted: v("muted"),
        accent: v("accent"),
        background: v("midnight"),
        foreground: v("ink"),
        customDark: v("ink"),
        customBlue: v("accent"),
        customLight: v("accent"),
        customColor: v("frame"),
        customTextCoor: v("muted"),
      },      
      boxShadow: {
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)", 
      },
      backdropBlur: {
        glass: "3.5px", 
      },
      borderRadius: {
        lg: "10px", 
      },
      borderWidth: {
        glass: "1px", 
      },
      borderColor: {
        glass: "rgba(255, 255, 255, 0.18)", 
      },
    },
  },
  plugins: [],
} satisfies Config;
