/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef2f8',
          100: '#d6e0ee',
          200: '#adc1dd',
          300: '#84a2cc',
          400: '#5b83bb',
          500: '#3c649f',
          600: '#2a4d7f',
          700: '#1F3864',
          800: '#182b4d',
          900: '#111e36',
          950: '#0a1220',
        },
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2f6fed',
          600: '#1d54c9',
          700: '#1941a0',
          800: '#173679',
          900: '#152f5f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
