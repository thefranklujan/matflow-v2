/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#0fe69b",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#0fe69b",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        surface: {
          DEFAULT: "#0a0a0a",
          50: "#fafafa",
          100: "#171717",
          200: "#1c1c1c",
          300: "#262626",
          400: "#404040",
          500: "#525252",
          600: "#737373",
          700: "#a3a3a3",
          800: "#d4d4d4",
          900: "#fafafa",
        },
      },
      fontFamily: {
        sans: ["Inter"],
      },
    },
  },
  plugins: [],
};
