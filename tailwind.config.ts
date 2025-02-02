import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgba(255, 255, 255, 1)", 
        foreground: "var(--foreground)",
        customDark: "#211516",
        customBlue: "#1E8787",
        customLight: "rgb(250, 250, 250)", 
        customColor: "#0c1f33",
        customTextCoor: "#333"
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
