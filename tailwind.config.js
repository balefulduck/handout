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
        dosis: ['Dosis', 'sans-serif'],
      },
      colors: {
        // New color system
        'yellow-green': '#ADBC10',
        'olive-green': '#6F8328',
        'turquoise': '#00ACB9',
        'orange': '#F08600',
        'purple': '#941E71',
        'medium-blue': '#0086CB',
        'cool-gray': '#003F51',
        
        // Legacy color naming for backward compatibility
        'custom-orange': '#F08600', // Updated to new orange
        'icon-purple': '#941E71',  // Updated to new purple
        'icon-lime': '#ADBC10',    // Updated to new yellow-green
        'icon-olive': '#6F8328',   // Updated to new olive-green
      },
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateX(-50%) translateY(5px)' },
          '100%': { opacity: 1, transform: 'translateX(-50%) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
