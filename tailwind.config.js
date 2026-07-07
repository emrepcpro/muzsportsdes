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
          DEFAULT: '#ef4444', // red-500 (MuzSports red)
          hover: '#f87171', // red-400
          dark: '#dc2626', // red-600
        },
        accent: {
          DEFAULT: '#ff6b6b', // bright red
          light: '#ffa8a8', // lighter red
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
