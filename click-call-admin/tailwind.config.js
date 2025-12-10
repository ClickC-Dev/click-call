/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          500: '#16a34a'
        }
      }
    }
  },
  darkMode: 'class',
  plugins: []
}

