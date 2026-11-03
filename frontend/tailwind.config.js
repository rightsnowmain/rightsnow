/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
          burgundy: '#881337',
          gold: '#b45309',
        },
      },
      fontFamily: {
        serif: ['Merriweather', 'Noto Serif Sinhala', 'Georgia', 'serif'],
        sans: ['Inter', 'Noto Sans Sinhala', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
