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
          DEFAULT: '#84cc16', // lime-500
          hover: '#a3e635', // lime-400
          dark: '#65a30d', // lime-600
        },
        background: {
          DEFAULT: '#0a0a0a',
          card: '#161616',
          highlight: '#1a1a1a',
          inner: '#0d0d0d',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
