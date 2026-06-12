/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf8f6',
          100: '#fde8d8',
          200: '#fcd9bd',
          400: '#f97316',
          500: '#ea580c',
          600: '#c2410c',
          700: '#9a3412',
          900: '#431407',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
