/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0B1220",
          900: "#0F1729",
          800: "#161F38",
          700: "#1F2A47",
          600: "#2A3657",
        },
        gold: {
          400: "#F2B84B",
          500: "#E5A430",
        },
        teal: {
          400: "#3ED6B5",
          500: "#22B896",
        },
        mist: {
          100: "#EDEFF7",
          300: "#B7BEDA",
          500: "#8A93AC",
        },
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};
