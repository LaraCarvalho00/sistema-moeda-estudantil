/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Cores oficiais inspiradas no Nubank
        'nu-purple': '#820AD1',
        'nu-purple-dark': '#6D08B1',
        'nu-gray-100': '#F5F5F5',
        'nu-gray-200': '#EBEBEB',
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};