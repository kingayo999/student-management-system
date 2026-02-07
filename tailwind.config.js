/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981', // Bellstech Green (Emerald)
          600: '#065f46', // Primary Bellstech Green
          700: '#064e3b',
          800: '#064033',
          900: '#022c22',
        },
        accent: {
          400: '#fbbf24',
          500: '#f59e0b', // Bellstech Gold
          600: '#d97706',
        },
        secondary: {
          500: '#0693E3', // Bellstech Blue
          600: '#027bbd',
        }
      }
    },
  },
  plugins: [],
}
