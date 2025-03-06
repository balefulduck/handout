/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        encode: ['Encode Sans', 'sans-serif'],
        aptos: ['Aptos', 'sans-serif'],
      },
      colors: {
        'custom-orange': '#f18700',
        'icon-purple': '#8d1563',
        'icon-lime': '#beca18',
        'icon-olive': '#8b9d4b',
      },
    },
  },
  plugins: [],
}
